<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wartenbergs', function (Blueprint $table) {
            $table->id();
            $table->string('nome_completo');
            $table->string('rg_ou_cpf');
            $table->date('data_nascimento');
            $table->string('sexo');
            $table->string('clinica')->nullable();
            $table->date('data_exame');
            $table->boolean('afastamento_involuntario');
            $table->json('afastamento_lados')->nullable();
            $table->boolean('dificuldade_manter');
            $table->json('manter_lados')->nullable();
            $table->boolean('dificuldade_aproximar');
            $table->string('aproximar_lado')->nullable();
            $table->boolean('fraqueza_assimetria');
            $table->json('fraqueza_lados')->nullable();
            $table->boolean('alteracao_sensibilidade');
            $table->json('sensibilidade_lados')->nullable();
            $table->unsignedSmallInteger('tempo_mantido_segundos')->nullable();
            $table->string('nome_avaliador')->nullable();
            $table->string('cid')->nullable();
            $table->text('comentario')->nullable();
            $table->longText('assinatura_paciente')->nullable();
            $table->string('pedido_medico')->nullable();
            $table->foreignId('team_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['team_id', 'data_exame']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wartenbergs');
    }
};
