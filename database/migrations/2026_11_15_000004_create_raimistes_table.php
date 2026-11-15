<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('raimistes', function (Blueprint $table) {
            $table->id();
            $table->string('nome_completo');
            $table->string('rg_ou_cpf');
            $table->date('data_nascimento');
            $table->string('sexo');
            $table->string('clinica')->nullable();
            $table->date('data_exame');
            $table->boolean('sustenta_posicao');
            $table->boolean('pronacao_supinacao');
            $table->json('pronacao_lados')->nullable();
            $table->boolean('tremor_oscilacao');
            $table->json('tremor_lados')->nullable();
            $table->boolean('assimetria');
            $table->string('assimetria_lado')->nullable();
            $table->boolean('desconforto');
            $table->text('observacoes')->nullable();
            $table->unsignedSmallInteger('tempo_direito_segundos')->nullable();
            $table->unsignedSmallInteger('tempo_esquerdo_segundos')->nullable();
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
        Schema::dropIfExists('raimistes');
    }
};
