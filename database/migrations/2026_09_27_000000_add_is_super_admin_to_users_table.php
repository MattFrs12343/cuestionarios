<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_super_admin')->default(false)->after('is_active');
        });

        // El super-admin se identificaba por un email hardcodeado dentro de
        // User::isSuperAdmin(). Se congela ese valor en la columna para que
        // cambiar el email (o dejar de hardcodearlo) no le haga perder el
        // acceso global, y para que se puedan tener más de uno.
        DB::table('users')
            ->where('email', 'admin@cuestionarios.com')
            ->update(['is_super_admin' => true]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_super_admin');
        });
    }
};
