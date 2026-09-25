<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('avaliacao_equilibrios', function (Blueprint $table) {
            $table->string('clinica')->nullable()->after('sexo');
        });

        Schema::table('rastreio_cognitivos', function (Blueprint $table) {
            $table->string('clinica')->nullable()->after('sexo');
        });
    }

    public function down(): void
    {
        Schema::table('avaliacao_equilibrios', function (Blueprint $table) {
            $table->dropColumn('clinica');
        });

        Schema::table('rastreio_cognitivos', function (Blueprint $table) {
            $table->dropColumn('clinica');
        });
    }
};
