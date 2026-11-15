<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('finger_tappings', function (Blueprint $table) {
            $table->id();
            $table->string('nome_completo');
            $table->string('rg_ou_cpf');
            $table->date('data_nascimento');
            $table->string('sexo');
            $table->string('clinica')->nullable();
            $table->date('data_exame');
            $table->boolean('movimentos_rapidos');
            $table->boolean('bradicinesia');
            $table->json('bradicinesia_lados')->nullable();
            $table->boolean('reducao_progressiva');
            $table->json('reducao_lados')->nullable();
            $table->boolean('irregularidade_ritmo');
            $table->json('irregularidade_lados')->nullable();
            $table->boolean('interrupcao');
            $table->json('interrupcao_lados')->nullable();
            $table->unsignedSmallInteger('tempo_direito_segundos')->nullable();
            $table->unsignedSmallInteger('tempo_esquerdo_segundos')->nullable();
            $table->json('alteracoes')->nullable();
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
        Schema::dropIfExists('finger_tappings');
    }
};
