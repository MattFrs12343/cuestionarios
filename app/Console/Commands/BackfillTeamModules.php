<?php

namespace App\Console\Commands;

use App\Models\Team;
use App\Models\TeamModule;
use App\Models\User;
use App\Models\UserModule;
use Illuminate\Console\Command;
use RuntimeException;

/**
 * Fase 4 del hardening multi-tenant: crea las filas de team_modules para los
 * equipos existentes, replicando el comportamiento actual (hack "equipo Rojo")
 * antes de que User::hasModuleAccess() empiece a depender de esta tabla.
 *
 * - Todo equipo → los 7 módulos "core" activos (los que antes ya tenía
 *   cualquiera vía UserModule::MODULES).
 * - Equipos "Rojo" / "Equipe Principal" → además, los 4 módulos que antes
 *   eran User::RED_TEAM_ONLY_MODULES, activos.
 * - El resto de los equipos → esos 4 módulos quedan creados pero inactivos
 *   (el admin los puede habilitar a mano si corresponde).
 *
 * Antes, el acceso a los módulos "Rojo" era automático para CUALQUIER
 * integrante del equipo Rojo (sin asignación individual). Como el nuevo
 * modelo exige asignación por usuario (UserModule) salvo para admin/técnico,
 * este comando también otorga esa asignación a los laudadores que ya
 * pertenecen a un equipo Rojo, para no dejarlos sin acceso a algo que ya
 * tenían. Es idempotente: correrlo de nuevo no duplica ni pisa asignaciones.
 */
class BackfillTeamModules extends Command
{
    protected $signature = 'modules:backfill-teams';

    protected $description = 'Crea team_modules para los equipos existentes y preserva el acceso actual a los módulos "Rojo"';

    private const RED_TEAM_NAMES = ['Rojo', 'Equipe Principal'];

    public function handle(): int
    {
        $teamModulesCreated = 0;
        $userModulesGranted = 0;

        Team::with('users.roles')->chunk(50, function ($teams) use (&$teamModulesCreated, &$userModulesGranted) {
            foreach ($teams as $team) {
                $isRedTeam = in_array($team->name, self::RED_TEAM_NAMES, true);

                foreach (config('questionnaires.types') as $moduleName => $config) {
                    $isActive = $config['core'] || $isRedTeam;

                    $teamModule = TeamModule::firstOrCreate(
                        ['team_id' => $team->id, 'module_name' => $moduleName],
                        ['is_active' => $isActive]
                    );

                    if ($teamModule->wasRecentlyCreated) {
                        $teamModulesCreated++;
                    } elseif ($teamModule->is_active !== $isActive && $isActive) {
                        // Si ya existía inactivo pero el backfill dice que debería
                        // estar activo (ej. se corrió antes de que el equipo se
                        // renombrara a "Rojo"), lo activamos.
                        $teamModule->update(['is_active' => true]);
                    }
                }

                if ($isRedTeam) {
                    $userModulesGranted += $this->grantRedModulesToLaudadores($team);
                }
            }
        });

        $this->info("team_modules creados: {$teamModulesCreated}. Asignaciones individuales otorgadas a laudadores de equipos Rojo: {$userModulesGranted}.");

        return self::SUCCESS;
    }

    private function grantRedModulesToLaudadores(Team $team): int
    {
        $granted = 0;
        $redModules = collect(config('questionnaires.types'))->reject(fn ($c) => $c['core'])->keys();

        $laudadores = $team->users->filter(fn ($user) => $user->roles->contains('name', 'laudador'));

        if ($laudadores->isEmpty()) {
            return 0;
        }

        $assignerId = $this->assignerId($team);

        foreach ($laudadores as $laudador) {
            foreach ($redModules as $moduleName) {
                $userModule = UserModule::firstOrCreate(
                    ['user_id' => $laudador->id, 'module_name' => $moduleName],
                    ['is_active' => true, 'assigned_by' => $assignerId]
                );

                if ($userModule->wasRecentlyCreated || ! $userModule->is_active) {
                    $userModule->update(['is_active' => true, 'assigned_by' => $assignerId]);
                    $granted++;
                }
            }
        }

        return $granted;
    }

    /**
     * user_modules.assigned_by es NOT NULL en produccion (aunque la migracion lo
     * declara nullable), asi que el backfill tiene que registrar un actor real.
     * Se atribuye al administrador del equipo y, si no hubiera, al super-admin.
     */
    private function assignerId(Team $team): int
    {
        $adminId = $team->administrators()->first()?->id;

        if ($adminId) {
            return $adminId;
        }

        $superAdminId = User::query()->where('is_super_admin', true)->value('id');

        if ($superAdminId) {
            return $superAdminId;
        }

        throw new RuntimeException(
            "No se puede hacer el backfill del equipo [{$team->id} {$team->name}]: "
            .'no hay administrador ni super-admin para assigned_by.'
        );
    }
}
