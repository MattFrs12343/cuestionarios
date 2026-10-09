<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Apartado de observaciones para el cuestionario de Electroneuromiografía
     * Facial.
     *
     * Es el único cuestionario que carecía de un campo libre para que el usuario
     * anote datos del paciente. Se usa el nombre "observacoes" para mantenerlo
     * consistente con Electroencefalograma y Potencial (sus cuestionarios
     * hermanos de neurofisiología).
     */
    public function up(): void
    {
        Schema::table('electroneuromiografia_facial', function (Blueprint $table) {
            $table->text('observacoes')->nullable()->after('medicamentos');
        });
    }

    public function down(): void
    {
        Schema::table('electroneuromiografia_facial', function (Blueprint $table) {
            $table->dropColumn('observacoes');
        });
    }
};
