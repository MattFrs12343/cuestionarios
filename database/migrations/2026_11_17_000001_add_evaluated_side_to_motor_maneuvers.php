<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('finger_tappings', function (Blueprint $table) {
            $table->string('mao_avaliada', 10)->nullable();
        });
        Schema::table('mingazzinis', function (Blueprint $table) {
            $table->string('mmii_membro_avaliado', 10)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('finger_tappings', fn (Blueprint $table) => $table->dropColumn('mao_avaliada'));
        Schema::table('mingazzinis', fn (Blueprint $table) => $table->dropColumn('mmii_membro_avaliado'));
    }
};
