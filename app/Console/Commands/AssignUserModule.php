<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\UserModule;
use Illuminate\Console\Command;

class AssignUserModule extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:assign-module 
                            {user : El ID o email del usuario}
                            {module : El nombre del módulo (electroencefalograma|electroneuromiografia)}
                            {--remove : Remover el módulo en lugar de asignarlo}
                            {--admin= : ID del administrador que realiza la asignación}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Asignar o remover módulos a usuarios';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userIdentifier = $this->argument('user');
        $moduleName = $this->argument('module');
        $remove = $this->option('remove');
        $adminId = $this->option('admin');

        // Validar módulo
        if (!array_key_exists($moduleName, UserModule::MODULES)) {
            $this->error("Módulo inválido. Módulos disponibles: " . implode(', ', array_keys(UserModule::MODULES)));
            return 1;
        }

        // Buscar usuario
        $user = is_numeric($userIdentifier) 
            ? User::find($userIdentifier)
            : User::where('email', $userIdentifier)->first();

        if (!$user) {
            $this->error("Usuario no encontrado: {$userIdentifier}");
            return 1;
        }

        // Verificar que el usuario puede ser asignado a módulos
        if (!$user->canBeAssignedModules()) {
            $this->error("El usuario {$user->name} no puede ser asignado a módulos. Debe tener rol LAUDADOR o TECNICO.");
            return 1;
        }

        // Buscar administrador
        $admin = null;
        if ($adminId) {
            $admin = User::find($adminId);
            if (!$admin || !$admin->isAdmin()) {
                $this->error("Administrador no encontrado o no válido: {$adminId}");
                return 1;
            }
        } else {
            $admin = User::whereHas('roles', function ($query) {
                $query->where('name', 'administrador');
            })->first();
            
            if (!$admin) {
                $this->error("No se encontró ningún administrador en el sistema.");
                return 1;
            }
        }

        if ($remove) {
            // Remover módulo
            $userModule = UserModule::where('user_id', $user->id)
                ->where('module_name', $moduleName)
                ->first();

            if (!$userModule) {
                $this->warn("El usuario {$user->name} no tiene asignado el módulo {$moduleName}.");
                return 0;
            }

            $userModule->update(['is_active' => false]);
            $this->info("Módulo {$moduleName} removido del usuario {$user->name}.");
        } else {
            // Asignar módulo
            $userModule = UserModule::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'module_name' => $moduleName,
                ],
                [
                    'is_active' => true,
                    'assigned_by' => $admin->id,
                ]
            );

            $action = $userModule->wasRecentlyCreated ? 'asignado' : 'reactivado';
            $this->info("Módulo {$moduleName} {$action} al usuario {$user->name}.");
        }

        return 0;
    }
}
