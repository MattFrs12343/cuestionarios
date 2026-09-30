<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const OLD_TABLE = 'eletroneuromiografia_facial';
    private const NEW_TABLE = 'electroneuromiografia_facial';
    private const OLD_MODULE = 'eletroneuromiografia_facial';
    private const NEW_MODULE = 'electroneuromiografia_facial';

    /**
     * "Eletro" -> "Electro" en el módulo de Electro neuromiografía Facial.
     *
     * El nombre sin la "c" era una inconsistencia: electroencefalograma y
     * electroneuromiografia ya usaban "electro" (y la tabla
     * "electroneuromiografias" también). Se alinean tabla y module_name.
     *
     * Se toca también user_modules y team_modules porque el module_name es la
     * clave que revisa el middleware module.access: sin esto el módulo
     * desaparecería de los 3 equipos y de los 9 usuarios que lo tenían.
     */
    public function up(): void
    {
        if (Schema::hasTable(self::OLD_TABLE) && ! Schema::hasTable(self::NEW_TABLE)) {
            Schema::rename(self::OLD_TABLE, self::NEW_TABLE);
        }

        foreach (['user_modules', 'team_modules'] as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            DB::table($table)
                ->where('module_name', self::OLD_MODULE)
                ->update(['module_name' => self::NEW_MODULE]);
        }
    }

    public function down(): void
    {
        foreach (['user_modules', 'team_modules'] as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            DB::table($table)
                ->where('module_name', self::NEW_MODULE)
                ->update(['module_name' => self::OLD_MODULE]);
        }

        if (Schema::hasTable(self::NEW_TABLE) && ! Schema::hasTable(self::OLD_TABLE)) {
            Schema::rename(self::NEW_TABLE, self::OLD_TABLE);
        }
    }
};
