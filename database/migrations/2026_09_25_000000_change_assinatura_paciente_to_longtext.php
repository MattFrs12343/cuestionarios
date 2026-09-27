<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private array $tables = [
        'questionnaires',
        'electroneuromiografias',
        'potenciais',
    ];

    /**
     * Los CREATE TABLE originales ya declaran assinatura_paciente como
     * longText(); este ALTER crudo solo hace falta para bases MySQL que
     * migraron antes de ese fix. En cualquier otro motor (ej. SQLite en
     * tests) la columna ya nace correcta, así que no hay nada que alterar
     * y el ALTER MODIFY de MySQL rompería la migración.
     */
    public function up(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }

        foreach ($this->tables as $table) {
            DB::statement("ALTER TABLE `{$table}` MODIFY `assinatura_paciente` LONGTEXT NULL");
        }
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }

        foreach ($this->tables as $table) {
            DB::statement("ALTER TABLE `{$table}` MODIFY `assinatura_paciente` VARCHAR(255) NULL");
        }
    }
};
