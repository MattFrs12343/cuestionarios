<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mingazzinis', function (Blueprint $table) {
            $table->id();
            $table->string('nome_completo');
            $table->string('rg_ou_cpf');
            $table->date('data_nascimento');
            $table->string('sexo');
            $table->string('clinica')->nullable();
            $table->date('data_exame');
            $table->boolean('mmii_sustenta_posicao');
            $table->boolean('mmii_queda');
            $table->json('mmii_queda_lados')->nullable();
            $table->boolean('mmii_tremor');
            $table->json('mmii_tremor_lados')->nullable();
            $table->boolean('mmii_assimetria');
            $table->string('mmii_assimetria_lado')->nullable();
            $table->boolean('mmii_interrupcao');
            $table->json('mmii_interrupcao_lados')->nullable();
            $table->unsignedSmallInteger('mmii_tempo_direito_segundos')->nullable();
            $table->unsignedSmallInteger('mmii_tempo_esquerdo_segundos')->nullable();
            $table->json('mmii_alteracoes')->nullable();
            $table->boolean('mmss_sustenta_posicao');
            $table->boolean('mmss_queda_pronacao');
            $table->json('mmss_queda_lados')->nullable();
            $table->boolean('mmss_tremor');
            $table->json('mmss_tremor_lados')->nullable();
            $table->boolean('mmss_assimetria');
            $table->string('mmss_assimetria_lado')->nullable();
            $table->boolean('mmss_desconforto');
            $table->text('observacoes')->nullable();
            $table->unsignedSmallInteger('mmss_tempo_direito_segundos')->nullable();
            $table->unsignedSmallInteger('mmss_tempo_esquerdo_segundos')->nullable();
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
        Schema::dropIfExists('mingazzinis');
    }
};
