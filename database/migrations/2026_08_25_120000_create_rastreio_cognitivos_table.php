<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rastreio_cognitivos', function (Blueprint $table) {
            $table->id();

            $table->string('nome_completo');
            $table->string('rg_ou_cpf');
            $table->date('data_nascimento');
            $table->string('sexo');
            $table->date('data_exame');

            // Folha de pontuação rápida (MoCA)
            $table->unsignedTinyInteger('pontuacao_visoespacial')->nullable();
            $table->unsignedTinyInteger('pontuacao_nomeacao')->nullable();
            $table->unsignedTinyInteger('pontuacao_atencao')->nullable();
            $table->unsignedTinyInteger('pontuacao_linguagem')->nullable();
            $table->unsignedTinyInteger('pontuacao_abstracao')->nullable();
            $table->unsignedTinyInteger('pontuacao_evocacao_tardia')->nullable();
            $table->unsignedTinyInteger('pontuacao_orientacao')->nullable();
            $table->boolean('ajuste_escolaridade')->default(false);
            $table->unsignedTinyInteger('pontuacao_total')->nullable();

            $table->string('nome_avaliador')->nullable();
            $table->string('cid')->nullable();
            $table->text('comentario')->nullable();

            $table->string('assinatura_paciente')->nullable();
            $table->string('pedido_medico')->nullable();

            $table->foreignId('team_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rastreio_cognitivos');
    }
};
