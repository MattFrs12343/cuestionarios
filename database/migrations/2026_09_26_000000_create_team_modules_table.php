<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('module_name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['team_id', 'module_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_modules');
    }
};
