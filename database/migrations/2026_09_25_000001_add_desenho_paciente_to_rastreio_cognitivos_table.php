<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $columns = [
        'desenho_visoespacial',
        'desenho_atencao',
        'desenho_evocacao_tardia',
        'desenho_orientacao',
    ];

    public function up(): void
    {
        Schema::table('rastreio_cognitivos', function (Blueprint $table) {
            foreach ($this->columns as $column) {
                $table->longText($column)->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('rastreio_cognitivos', function (Blueprint $table) {
            $table->dropColumn($this->columns);
        });
    }
};
