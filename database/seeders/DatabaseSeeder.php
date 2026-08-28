<?php

namespace Database\Seeders;

use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'view questionnaires',
            'create questionnaires',
            'edit questionnaires',
            'delete questionnaires',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $roles = [
            'administrador' => $permissions,
            'sistema' => $permissions,
            'laudador' => ['view questionnaires', 'create questionnaires', 'edit questionnaires'],
            'tecnico' => ['view questionnaires', 'create questionnaires'],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->syncPermissions($rolePermissions);
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

        // Equipo Verde
        $verdeTeam = Team::firstOrCreate(['name' => 'Verde']);

        $verdeUsers = [
            ['name' => 'Malu', 'email' => 'malu@sistema.com', 'role' => 'sistema'],
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
