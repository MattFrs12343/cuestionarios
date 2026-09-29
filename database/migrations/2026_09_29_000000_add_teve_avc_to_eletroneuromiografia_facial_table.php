<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Preguntas "Já teve AVC? Quando?" para el equipo Azul.
     *
     * Mismo shape que potenciais.teve_avc / avc_quando para que el par sea
     * consistente en toda la app.
     */
    public function up(): void
    {
        Schema::table('eletroneuromiografia_facial', function (Blueprint $table) {
            $table->boolean('teve_avc')->nullable()->after('altura');
            $table->string('avc_quando')->nullable()->after('teve_avc');
        });
    }

    public function down(): void
    {
        Schema::table('eletroneuromiografia_facial', function (Blueprint $table) {
            $table->dropColumn(['teve_avc', 'avc_quando']);
        });
    }
};
