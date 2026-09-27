<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mini_exames_mentais', function (Blueprint $table) {
            $table->id();

            $table->string('nome_completo');
            $table->string('rg_ou_cpf');
            $table->date('data_nascimento');
            $table->string('sexo');
            $table->string('clinica')->nullable();
            $table->date('data_exame');
            $table->string('escolaridade')->nullable();

            // Folha de pontuação (MEEM / MMSE - Folstein)
            $table->unsignedTinyInteger('pontuacao_orientacao_temporal')->nullable();
            $table->unsignedTinyInteger('pontuacao_orientacao_espacial')->nullable();
            $table->unsignedTinyInteger('pontuacao_registro')->nullable();
            $table->unsignedTinyInteger('pontuacao_atencao_calculo')->nullable();
            $table->unsignedTinyInteger('pontuacao_evocacao')->nullable();
            $table->unsignedTinyInteger('pontuacao_linguagem')->nullable();
            $table->unsignedTinyInteger('pontuacao_desenho')->nullable();
            $table->unsignedTinyInteger('pontuacao_total')->nullable();

            $table->longText('desenho_copia')->nullable();

            $table->string('nome_avaliador')->nullable();
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
        Schema::dropIfExists('mini_exames_mentais');
    }
};
