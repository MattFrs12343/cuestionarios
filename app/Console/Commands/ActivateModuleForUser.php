<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\UserModule;
use Illuminate\Console\Command;

class ActivateModuleForUser extends Command
{
    protected $signature = 'module:activate {user_id} {module_name}';
    protected $description = 'Ativar um módulo para um usuário específico';

    public function handle()
    {
        $userId = $this->argument('user_id');
        $moduleName = $this->argument('module_name');

        $user = User::find($userId);
        if (!$user) {
            $this->error("Usuário com ID {$userId} não encontrado.");
            return 1;
        }

        $userModule = UserModule::where('user_id', $userId)
            ->where('module_name', $moduleName)
            ->first();

        if (!$userModule) {
            $this->error("Módulo {$moduleName} não encontrado para o usuário {$user->name}.");
            return 1;
        }

        $userModule->is_active = true;
        $userModule->save();

        $this->info("Módulo {$moduleName} ativado com sucesso para o usuário {$user->name}!");
        return 0;
    }
}
