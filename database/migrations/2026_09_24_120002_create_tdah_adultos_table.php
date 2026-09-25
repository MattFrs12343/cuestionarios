<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tdah_adultos', function (Blueprint $table) {
            $table->id();

            $table->string('clinica')->nullable();
            $table->date('data_exame');
            $table->string('nome_completo');
            $table->date('data_nascimento');
            $table->string('rg')->nullable();
            $table->decimal('peso', 5, 2)->nullable();
            $table->decimal('altura', 5, 2)->nullable();
            $table->string('sexo');
            $table->string('solicitante')->nullable();

            // Parte A: 9 itens, escala 0-4 (Nunca..Muito Frequentemente)
            $table->json('parte_a_respostas')->nullable();
            $table->unsignedTinyInteger('parte_a_total')->nullable();

            // Parte B: 9 itens, escala 0-4
            $table->json('parte_b_respostas')->nullable();
            $table->unsignedTinyInteger('parte_b_total')->nullable();

            $table->string('cid')->nullable();
            $table->text('comentario')->nullable();
            $table->longText('assinatura_paciente')->nullable();
            $table->string('pedido_medico')->nullable();

            $table->foreignId('team_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tdah_adultos');
    }
};
