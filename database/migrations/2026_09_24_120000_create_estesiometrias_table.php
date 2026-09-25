<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estesiometrias', function (Blueprint $table) {
            $table->id();

            $table->string('clinica')->nullable();
            $table->date('data_exame');
            $table->string('nome_completo');
            $table->date('data_nascimento');
            $table->string('sexo');

            $table->string('nome_avaliador')->nullable();
            $table->string('crm_rg')->nullable();
            $table->string('diagnostico')->nullable();

            // Questionário pré-exame
            $table->boolean('dormencia_formigamento')->default(false);
            $table->boolean('dificuldade_sentir_objetos')->default(false);
            $table->boolean('feridas_sem_dor')->default(false);
            $table->boolean('diagnostico_diabetes_hanseniase')->default(false);
            $table->boolean('cirurgia_fratura_recente')->default(false);
            $table->boolean('medicamentos_sistema_nervoso')->default(false);

            // Avaliação por ponto: { ponto, sentiu, cor_direito, cor_esquerdo }
            $table->json('pontos_pes')->nullable();
            // Avaliação por ponto: { ponto, sentiu, cor_direita, cor_esquerda }
            $table->json('pontos_maos')->nullable();

            $table->decimal('pes_percent_acerto_d', 5, 2)->nullable();
            $table->decimal('pes_percent_acerto_e', 5, 2)->nullable();
            $table->string('pes_classificacao')->nullable();
            $table->decimal('maos_percent_acerto_d', 5, 2)->nullable();
            $table->decimal('maos_percent_acerto_e', 5, 2)->nullable();
            $table->string('maos_classificacao')->nullable();

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
        Schema::dropIfExists('estesiometrias');
    }
};
