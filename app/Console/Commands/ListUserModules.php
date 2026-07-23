<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\UserModule;
use Illuminate\Console\Command;

class ListUserModules extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:list-modules 
                            {user? : El ID o email del usuario (opcional)}
                            {--all : Mostrar todos los usuarios con módulos}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Listar los módulos asignados a usuarios';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userIdentifier = $this->argument('user');
        $showAll = $this->option('all');

        if ($showAll) {
            $this->showAllUserModules();
        } elseif ($userIdentifier) {
            $this->showUserModules($userIdentifier);
        } else {
            $this->showModuleSummary();
        }

        return 0;
    }

    private function showUserModules($userIdentifier)
    {
        $user = is_numeric($userIdentifier) 
            ? User::find($userIdentifier)
            : User::where('email', $userIdentifier)->first();

        if (!$user) {
            $this->error("Usuario no encontrado: {$userIdentifier}");
            return;
        }

        $this->info("Módulos para: {$user->name} ({$user->email})");
        $this->info("Roles: " . $user->roles->pluck('name')->join(', '));
        $this->newLine();

        $modules = $user->userModules()->with('assignedBy')->get();

        if ($modules->isEmpty()) {
            $this->warn("Este usuario no tiene módulos asignados.");
            return;
        }

        $headers = ['Módulo', 'Estado', 'Asignado por', 'Fecha'];
        $rows = [];

        foreach ($modules as $module) {
            $rows[] = [
                UserModule::MODULES[$module->module_name],
                $module->is_active ? '✅ Activo' : '❌ Inactivo',
                $module->assignedBy->name ?? 'N/A',
                $module->created_at->format('d/m/Y H:i')
            ];
        }

        $this->table($headers, $rows);
    }

    private function showAllUserModules()
    {
        $users = User::whereHas('userModules')
            ->with(['userModules.assignedBy', 'roles'])
            ->get();

        if ($users->isEmpty()) {
            $this->warn("No hay usuarios con módulos asignados.");
            return;
        }

        $headers = ['Usuario', 'Email', 'Rol', 'Módulos Activos'];
        $rows = [];

        foreach ($users as $user) {
            $activeModules = $user->activeModules->map(function ($module) {
                return UserModule::MODULES[$module->module_name];
            })->join(', ');

            $rows[] = [
                $user->name,
                $user->email,
                $user->roles->pluck('name')->join(', '),
                $activeModules ?: 'Ninguno'
            ];
        }

        $this->table($headers, $rows);
    }

    private function showModuleSummary()
    {
        $this->info("Resumen de Módulos del Sistema");
        $this->newLine();

        foreach (UserModule::MODULES as $moduleName => $moduleDisplayName) {
            $activeCount = UserModule::where('module_name', $moduleName)
                ->where('is_active', true)
                ->count();
            
            $totalCount = UserModule::where('module_name', $moduleName)->count();

            $this->line("📋 {$moduleDisplayName}:");
            $this->line("   Usuarios activos: {$activeCount}");
            $this->line("   Total asignaciones: {$totalCount}");
            $this->newLine();
        }

        $totalUsers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['laudador', 'tecnico']);
        })->count();

        $usersWithModules = User::whereHas('activeModules')->count();

        $this->info("Estadísticas generales:");
        $this->line("👥 Total usuarios LAUDADOR/TECNICO: {$totalUsers}");
        $this->line("✅ Usuarios con módulos activos: {$usersWithModules}");
        $this->line("❌ Usuarios sin módulos: " . ($totalUsers - $usersWithModules));
    }
}
