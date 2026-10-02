<?php

namespace App\Services;

use App\Models\Team;
use App\Models\User;
use App\Models\UserModule;

/**
 * Siembra los módulos de un usuario a partir del plan de su equipo.
 *
 * El plan (team_modules) dejó de ser un techo de acceso y pasó a ser el valor
 * inicial: cuando una persona entra a un equipo nace con los módulos que ese
 * equipo tiene contratados, y a partir de ahí lo que manda es su asignación
 * individual (user_modules), que el super-admin controla módulo por módulo.
 *
 * Son dos operaciones distintas y deliberadamente separadas:
 *
 * - provisionNewMember(): alta de un miembro. SOLO crea filas que faltan,
 *   nunca pisa una asignación existente. Si un administrador le apagó un
 *   módulo a alguien y esa persona entra después a otro equipo, ese módulo
 *   sigue apagado.
 * - applyPlanToCurrentMembers(): acción explícita del super-admin sobre el
 *   plan ("aplicar también a los usuarios actuales"). Ahí sí se reactivan las
 *   filas que estaban apagadas, porque la intención declarada es "que todo el
 *   mundo tenga esto". Módulos que el plan tiene apagados no se tocan: apagar
 *   un módulo del plan ya no le roba nada a nadie.
 */
class UserModuleProvisioner
{
    /**
     * Módulos del plan del equipo que siguen existiendo en el catálogo. Un
     * plan puede traer claves que ya no corresponden a ningún cuestionario
     * (tras un rename) y sembrarlas produciría filas muertas.
     *
     * @return array<int, string>
     */
    private function plannedModuleNames(Team $team, bool $onlyEnabled = true): array
    {
        $names = $onlyEnabled
            ? collect($team->activeModuleNames())
            : collect($team->modules()->pluck('module_name')->all());

        return $names->intersect(array_keys(config('questionnaires.types')))
            ->unique()
            ->values()
            ->all();
    }

    /**
     * Alta de un miembro: crea las filas que le faltan, no toca las demás.
     */
    public function provisionNewMember(User $user, Team $team, ?int $assignedBy = null): int
    {
        $planned = $this->plannedModuleNames($team);

        if ($planned === []) {
            return 0;
        }

        $existing = $user->userModules()
            ->whereIn('module_name', $planned)
            ->pluck('module_name')
            ->all();

        $missing = array_values(array_diff($planned, $existing));

        return $this->insertRows($user, $missing, $assignedBy);
    }

    /**
     * Reparación de datos: rellena los huecos de todos los miembros del equipo
     * sin tocar ninguna asignación existente.
     *
     * A diferencia de applyPlanToCurrentMembers() NO reactiva módulos apagados.
     * Esto es deliberado: un barrido de reparación no puede ser la razón por la
     * que un módulo que alguien apagó a propósito vuelva a encenderse en todo el
     * equipo. Solo crea las filas que no existían.
     *
     * @return array{users: int, modules: int}
     */
    public function seedMissingForMembers(Team $team, ?int $assignedBy = null): array
    {
        $planned = $this->plannedModuleNames($team);

        if ($planned === []) {
            return ['users' => 0, 'modules' => 0];
        }

        $usersTouched = 0;
        $modulesTouched = 0;

        $team->users()->chunk(100, function ($members) use ($planned, $assignedBy, &$usersTouched, &$modulesTouched) {
            foreach ($members as $member) {
                $existing = $member->userModules()
                    ->whereIn('module_name', $planned)
                    ->pluck('module_name')
                    ->all();

                $inserted = $this->insertRows($member, array_values(array_diff($planned, $existing)), $assignedBy);

                if ($inserted > 0) {
                    $usersTouched++;
                    $modulesTouched += $inserted;
                }
            }
        });

        return ['users' => $usersTouched, 'modules' => $modulesTouched];
    }

    /**
     * Acción explícita del super-admin sobre el plan: todos los miembros del
     * equipo quedan con los módulos habilitados del plan.
     *
     * @return array{users: int, modules: int}
     */
    public function applyPlanToCurrentMembers(Team $team, ?int $assignedBy = null): array
    {
        $planned = $this->plannedModuleNames($team);

        if ($planned === []) {
            return ['users' => 0, 'modules' => 0];
        }

        $usersTouched = 0;
        $modulesTouched = 0;

        $team->users()->chunk(100, function ($members) use ($planned, $assignedBy, &$usersTouched, &$modulesTouched) {
            foreach ($members as $member) {
                $existing = $member->userModules()
                    ->whereIn('module_name', $planned)
                    ->get()
                    ->keyBy('module_name');

                $missing = array_values(array_diff($planned, $existing->keys()->all()));
                $modulesTouched += $this->insertRows($member, $missing, $assignedBy);

                $inactive = $existing->filter(fn (UserModule $row) => ! $row->is_active)->keys()->all();

                if ($inactive !== []) {
                    UserModule::where('user_id', $member->id)
                        ->whereIn('module_name', $inactive)
                        ->update(['is_active' => true, 'assigned_by' => $assignedBy, 'updated_at' => now()]);

                    $modulesTouched += count($inactive);
                }

                if ($missing !== [] || $inactive !== []) {
                    $usersTouched++;
                }
            }
        });

        return ['users' => $usersTouched, 'modules' => $modulesTouched];
    }

    /**
     * @param  array<int, string>  $moduleNames
     */
    private function insertRows(User $user, array $moduleNames, ?int $assignedBy): int
    {
        if ($moduleNames === []) {
            return 0;
        }

        $now = now();

        UserModule::insert(
            array_map(fn ($name) => [
                'user_id' => $user->id,
                'module_name' => $name,
                'is_active' => true,
                'assigned_by' => $assignedBy,
                'created_at' => $now,
                'updated_at' => $now,
            ], $moduleNames)
        );

        return count($moduleNames);
    }
}