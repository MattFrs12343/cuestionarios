<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('avaliacao_equilibrios', function (Blueprint $table) {
            $table->id();

            $table->string('nome_completo');
            $table->string('rg_ou_cpf');
            $table->date('data_nascimento');
            $table->string('sexo');
            $table->date('data_exame');

            // Timed Up and Go
            $table->decimal('tug_tempo_segundos', 6, 2)->nullable();

            // Escala de Equilíbrio de Berg (0-4 cada item)
            $table->unsignedTinyInteger('berg_sentado_para_pe')->nullable();
            $table->unsignedTinyInteger('berg_permanecer_pe_sem_apoio')->nullable();
            $table->unsignedTinyInteger('berg_sentado_sem_apoio')->nullable();
            $table->unsignedTinyInteger('berg_pe_para_sentado')->nullable();
            $table->unsignedTinyInteger('berg_transferencias')->nullable();
            $table->unsignedTinyInteger('berg_pe_olhos_fechados')->nullable();
            $table->unsignedTinyInteger('berg_pe_pes_juntos')->nullable();
            $table->unsignedTinyInteger('berg_alcance_anterior')->nullable();
            $table->unsignedTinyInteger('berg_pegar_objeto_chao')->nullable();
            $table->unsignedTinyInteger('berg_olhar_para_tras')->nullable();
            $table->unsignedTinyInteger('berg_girar_360')->nullable();
            $table->unsignedTinyInteger('berg_tocar_degrau')->nullable();
            $table->unsignedTinyInteger('berg_posicao_tandem')->nullable();
            $table->unsignedTinyInteger('berg_apoio_monopodal')->nullable();
            $table->unsignedTinyInteger('berg_total')->nullable();

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
        Schema::dropIfExists('avaliacao_equilibrios');
    }
};
