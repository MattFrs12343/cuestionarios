<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private array $columns = [
        'mmii_sustenta_posicao',
        'mmii_queda',
        'mmii_tremor',
        'mmii_assimetria',
        'mmii_interrupcao',
        'mmss_sustenta_posicao',
        'mmss_queda_pronacao',
        'mmss_tremor',
        'mmss_assimetria',
        'mmss_desconforto',
    ];

    /**
     * O CREATE TABLE original já declara essas colunas como nullable; este
     * ALTER cru só é necessário para bancos MySQL que migraram antes desse
     * fix (o questionário passou a permitir avaliar só MMII ou só MMSS).
     * Em qualquer outro motor (ex. SQLite em testes) a coluna já nasce
     * correta, então não há nada a alterar.
     */
    public function up(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }

        foreach ($this->columns as $column) {
            DB::statement("ALTER TABLE `mingazzinis` MODIFY `{$column}` TINYINT(1) NULL");
        }
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }

        foreach ($this->columns as $column) {
            DB::statement("ALTER TABLE `mingazzinis` MODIFY `{$column}` TINYINT(1) NOT NULL");
        }
    }
};
