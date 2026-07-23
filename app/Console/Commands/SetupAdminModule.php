<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class SetupAdminModule extends Command
{
    protected $signature = 'admin:setup';
    protected $description = 'Setup the admin module with roles, permissions and default admin user';

    public function handle()
    {
        $this->info('🚀 Configurando módulo de administración...');
        
        // Publicar migraciones de Spatie Permission
        $this->info('📦 Publicando migraciones de Spatie Permission...');
        Artisan::call('vendor:publish', [
            '--provider' => 'Spatie\Permission\PermissionServiceProvider'
        ]);
        
        // Ejecutar migraciones
        $this->info('🗄️ Ejecutando migraciones...');
        Artisan::call('migrate');
        
        // Ejecutar seeders
        $this->info('🌱 Creando roles, permisos y usuario administrador...');
        Artisan::call('db:seed', ['--class' => 'RolePermissionSeeder']);
        
        // Limpiar cache
        $this->info('🧹 Limpiando cache...');
        Artisan::call('config:clear');
        Artisan::call('cache:clear');
        Artisan::call('route:clear');
        
        // Reset permission cache
        if (class_exists('\Spatie\Permission\PermissionRegistrar')) {
            Artisan::call('permission:cache-reset');
        }
        
        $this->newLine();
        $this->info('✅ ¡Configuración completada exitosamente!');
        $this->newLine();
        
        $this->line('👤 <fg=green>Usuario administrador creado:</fg=green>');
        $this->line('   📧 Email: <fg=yellow>admin@admin.com</fg=yellow>');
        $this->line('   🔑 Contraseña: <fg=yellow>password</fg=yellow>');
        $this->newLine();
        
        $this->line('🌐 <fg=green>Panel de administración disponible en:</fg=green>');
        $this->line('   🔗 URL: <fg=cyan>' . url('/admin') . '</fg=cyan>');
        $this->newLine();
        
        return 0;
    }
}