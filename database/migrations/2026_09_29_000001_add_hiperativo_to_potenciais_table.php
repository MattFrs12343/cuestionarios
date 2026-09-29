<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Pregunta HIPERATIVO? para el PEA, solo para el equipo Azul.
     *
     * Mismo shape que questionnaires.hiperativo para no inventar un tipo nuevo.
     */
    public function up(): void
    {
        Schema::table('potenciais', function (Blueprint $table) {
            $table->boolean('hiperativo')->nullable()->after('avc_quando');
        });
    }

    public function down(): void
    {
        Schema::table('potenciais', function (Blueprint $table) {
            $table->dropColumn('hiperativo');
        });
    }
};
