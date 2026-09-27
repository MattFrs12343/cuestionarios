<?php

namespace Database\Seeders;

use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Catálogo completo de permisos. Debe coincidir con los permisos que el
     * sistema realmente consulta (QuestionnairePolicy, AdminMiddleware) y con
     * lo que ya existe en producción: si falta alguno, el admin que lo pierda
     * deja de poder entrar /admin.
     */
    private function permissionCatalog(): array
    {
        return [
            'view users',
            'create users',
            'edit users',
            'delete users',
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',
            'view teams',
            'create teams',
            'edit teams',
            'delete teams',
            'view questionnaires',
            'create questionnaires',
            'edit questionnaires',
            'delete questionnaires',
            'access admin',
        ];
    }

    public function run(): void
    {
        $permissions = $this->permissionCatalog();

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $roles = [
            'administrador' => $permissions,
            'sistema' => $permissions,
            'laudador' => ['view questionnaires'],
            'tecnico' => [
                'view questionnaires',
                'create questionnaires',
                'edit questionnaires',
                'delete questionnaires',
            ],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);

            if (app()->environment('local')) {
                // Solo en local se busca el estado deseado exacto.
                $role->syncPermissions($rolePermissions);
            } else {
                // Fuera de local NUNCA se quitan permisos: en producción
                // desplegar un set distinto al vigente dejaría sin acceso a
                // /admin a los administradores reales. Solo se agregan los
                // que falten, de forma idempotente.
                foreach ($rolePermissions as $permission) {
                    $role->givePermissionTo($permission);
                }
            }
        }

        // Los datos de abajo son de demostración: usuarios de ejemplo con
        // password "password" y equipos ficticios. Correrlos en producción
        // crearía una cuenta administradora con contraseña conocida
        // (admin@cuestionarios.test) y un equipo fantasma, así que se
        // bloquean por completo fuera de local.
        if (! app()->environment('local')) {
            return;
        }

        $admin = User::firstOrCreate(
            ['email' => 'admin@cuestionarios.test'],
            [
                'name' => 'Administrador',
                'password' => bcrypt('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        if (! $admin->hasRole('administrador')) {
            $admin->assignRole('administrador');
        }

        $team = Team::firstOrCreate(['name' => 'Equipe Principal']);

        if (! $admin->teams->contains($team->id)) {
            $admin->teams()->attach($team->id);
        }

        // "Equipe Principal" es el equipo con el catálogo completo: además de
        // los módulos "core" (que ya vienen activos por defecto), habilita los
        // módulos opcionales que antes eran el hack RED_TEAM_ONLY_MODULES.
        foreach (config('questionnaires.types') as $moduleName => $moduleConfig) {
            if (! $moduleConfig['core']) {
                $team->modules()->updateOrCreate(
                    ['module_name' => $moduleName],
                    ['is_active' => true]
                );
            }
        }

        // Equipo Verde
        $verdeTeam = Team::firstOrCreate(['name' => 'Verde']);

        $verdeUsers = [
            // Malu lleva 'administrador' (y no 'sistema') porque las rutas de
            // /admin están protegidas por role:administrador: con cualquier
            // otro rol no puede entrar al panel, ni en local.
            ['name' => 'Malu', 'email' => 'malu@sistema.com', 'role' => 'administrador'],
            ['name' => 'Mauricio', 'email' => 'mauricio@tecnico.com', 'role' => 'tecnico'],
            ['name' => 'Agatha', 'email' => 'agatha@tecnico.com', 'role' => 'tecnico'],
            ['name' => 'Keila', 'email' => 'keila@laudador.com', 'role' => 'laudador'],
            ['name' => 'Pedro', 'email' => 'pedro@laudador.com', 'role' => 'laudador'],
            ['name' => 'Rafael', 'email' => 'rafael@laudador.com', 'role' => 'laudador'],
        ];

        foreach ($verdeUsers as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => bcrypt('password'),
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );

            if (! $user->hasRole($data['role'])) {
                $user->assignRole($data['role']);
            }

            if (! $user->teams->contains($verdeTeam->id)) {
                $user->teams()->attach($verdeTeam->id);
            }
        }
    }
}
