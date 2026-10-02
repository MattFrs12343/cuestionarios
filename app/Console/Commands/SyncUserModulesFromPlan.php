<?php

namespace App\Console\Commands;

use App\Models\Team;
use App\Models\TeamModule;
use App\Models\User;
use App\Services\UserModuleProvisioner;
use Illuminate\Console\Command;

/**
 * Reparación de datos del sistema de módulos.
 *
 * Dos cosas que pueden haber dejado la base inconsistente y que el panel no
 * puede arreglar solo (no hay forma de "encender" lo que no aparece):
 *
 * 1. Equipos sin filas en team_modules. La migración
 *    create_team_modules_table solo hace Schema::create, sin backfill, así que
 *    todo equipo creado antes de esa migración quedó vacío. Con el modelo
 *    anterior eso no se notaba mucho; hoy un equipo sin plan no puede sembrar
 *    nada, así que sus miembros nuevos nacerían sin cuestionarios.
 *
 * 2. Miembros del equipo sin user_modules, que quedaron viendo cero módulos.
 *
 * Es idempotente: correrlo de nuevo no duplica ni pisa asignaciones. Rellena
 * los huecos que describe (1) y (2) y NUNCA reactiva un user_modules que
 * estuviera apagado: una reparación de datos no puede deshacer por sorpresa las
 * decisiones individuales que el super-admin tomó desde el panel. Para eso, en la
 * pantalla del plan está el botón explícito "aplicar también a los usuarios
 * actuales".
 */
class SyncUserModulesFromPlan extends Command
{
    protected $signature = 'modules:sync-users
                            {--team= : Limitar a un equipo por nombre o id}
                            {--dry-run : Mostrar qué haría, sin escribir}';

    protected $description = 'Rellena team_modules de equipos antiguos y siembra los user_modules que falten según el plan de su equipo';

    public function handle(UserModuleProvisioner $provisioner): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $filter = $this->option('team');

        $teams = Team::query()
            ->when($filter, fn ($q) => $q->where(fn ($q2) => $q2->where('name', $filter)->orWhere('id', $filter)))
            ->orderBy('name')
            ->get();

        if ($teams->isEmpty()) {
            $this->warn("No se encontró ningún equipo".($filter ? " para '{$filter}'." : '.'));

            return self::SUCCESS;
        }

        $catalog = array_keys(config('questionnaires.types'));
        $plansCreated = 0;
        $membersSeeded = 0;

        foreach ($teams as $team) {
            $missingPlan = $this->missingPlanRows($team, $catalog);

            if ($missingPlan !== []) {
                $this->line("  <comment>{$team->name}</comment>: sin plan para ".implode(', ', $missingPlan));
                $plansCreated += count($missingPlan);

                if (! $dryRun) {
                    $team->provisionDefaultModules();
                }
            }

            $team->refresh();

            $seeded = $dryRun
                ? $this->countMissingUserModules($team, $catalog)
                : $provisioner->seedMissingForMembers($team, $this->assignerId());

            if ($seeded['users'] > 0 || $seeded['modules'] > 0) {
                $this->line("  <comment>{$team->name}</comment>: ".($dryRun ? 'faltarían' : 'sembrados')
                    ." {$seeded['modules']} módulo(s) en {$seeded['users']} persona(s)");
                $membersSeeded += $seeded['users'];
            }
        }

        $this->newLine();

        if ($dryRun) {
            $this->info("DRY RUN: se crearían {$plansCreated} fila(s) de team_modules y se sembrarían módulos en {$membersSeeded} persona(s).");
            $this->line('Vuelve a correr sin --dry-run para aplicarlo.');

            return self::SUCCESS;
        }

        $this->info("Listo. Filas de team_modules creadas: {$plansCreated}. Personas con módulos sembrados: {$membersSeeded}.");

        return self::SUCCESS;
    }

    /**
     * Claves del catálogo para las que el equipo no tiene fila en team_modules.
     *
     * @return array<int, string>
     */
    private function missingPlanRows(Team $team, array $catalog): array
    {
        $existing = $team->modules()->pluck('module_name')->all();

        return array_values(array_diff($catalog, $existing));
    }

    /**
     * Cuántos módulos del plan le faltarían a cada miembro (solo para el dry run).
     *
     * @return array{users: int, modules: int}
     */
    private function countMissingUserModules(Team $team, array $catalog): array
    {
        $planned = collect($team->activeModuleNames())->intersect($catalog)->values();

        if ($planned->isEmpty()) {
            return ['users' => 0, 'modules' => 0];
        }

        $users = 0;
        $modules = 0;

        foreach ($team->users()->get() as $member) {
            $missing = $planned->diff($member->userModules()->pluck('module_name'))->count();

            if ($missing > 0) {
                $users++;
                $modules += $missing;
            }
        }

        return ['users' => $users, 'modules' => $modules];
    }

    /**
     * user_modules.assigned_by es nullable (ver la migración que crea la
     * tabla), así que el barrido puede correr sin actor. Cuando sí lo hay se
     * atribuye al super-admin, que es quien puede haber ejecutado esto.
     */
    private function assignerId(): ?int
    {
        return User::query()->where('is_super_admin', true)->value('id');
    }
}