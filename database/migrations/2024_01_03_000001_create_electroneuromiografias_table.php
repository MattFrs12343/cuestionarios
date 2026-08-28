<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('electroneuromiografias', function (Blueprint $table) {
            $table->id();

            $table->string('nome')->nullable();
            $table->date('data_nascimento')->nullable();
            $table->string('peso')->nullable();
            $table->string('altura')->nullable();
            $table->date('data_exame')->nullable();
            $table->string('rg')->nullable();
            $table->string('sexo')->nullable();
            $table->string('solicitante')->nullable();
            $table->string('clinica')->nullable();
            $table->json('tipos_exame')->nullable();

            $table->boolean('primeira_vez_exame')->nullable();
            $table->boolean('diabetico')->nullable();
            $table->boolean('diabetico_tratamento')->nullable();
            $table->boolean('tomando_medicamentos')->nullable();
            $table->text('medicamentos_detalhes')->nullable();
            $table->boolean('teve_covid')->nullable();
            $table->boolean('teve_avc')->nullable();
            $table->string('avc_tipo')->nullable();
            $table->string('avc_quando')->nullable();
            $table->boolean('dor_coluna')->nullable();
            $table->json('areas_coluna')->nullable();
            $table->boolean('trabalha')->nullable();
            $table->string('tipo_trabalho')->nullable();
            $table->boolean('teve_fraturas')->nullable();
            $table->string('fraturas_regiao')->nullable();
            $table->boolean('faz_quimioterapia')->nullable();
            $table->boolean('faz_radioterapia')->nullable();
            $table->boolean('faz_hemodialise')->nullable();
            $table->boolean('tem_marcapasso')->nullable();
            $table->boolean('processo_infeccioso')->nullable();
            $table->text('processo_infeccioso_detalhes')->nullable();
            $table->boolean('consome_alcool')->nullable();
            $table->string('alcool_frequencia')->nullable();
            $table->boolean('usa_drogas')->nullable();
            $table->string('drogas_quais')->nullable();

            // Membros Superiores
            $table->boolean('ms_dor_bracos')->nullable();
            $table->boolean('ms_dor_comeca_ombros')->nullable();
            $table->boolean('ms_dor_maos')->nullable();
            $table->string('ms_dor_mais_de')->nullable();
            $table->boolean('ms_formigamento_bracos')->nullable();
            $table->boolean('ms_formigamento_comeca_ombros')->nullable();
            $table->boolean('ms_formigamento_maos')->nullable();
            $table->boolean('ms_dormencia_bracos')->nullable();
            $table->boolean('ms_dormencia_comeca_ombros')->nullable();
            $table->boolean('ms_dormencia_maos')->nullable();
            $table->boolean('ms_tremores_bracos')->nullable();
            $table->boolean('ms_tremores_maos')->nullable();
            $table->boolean('ms_polegar_treme')->nullable();
            $table->boolean('ms_fraqueza_bracos')->nullable();
            $table->boolean('ms_fraqueza_maos')->nullable();
            $table->boolean('ms_fadiga_falar')->nullable();
            $table->boolean('ms_perda_peso')->nullable();
            $table->boolean('ms_queimacao')->nullable();
            $table->boolean('ms_caibra')->nullable();
            $table->string('ms_membro_mais_afetado')->nullable();

            // Membros Inferiores
            $table->boolean('mi_dor_pernas')->nullable();
            $table->boolean('mi_dor_comeca_bacia')->nullable();
            $table->boolean('mi_dor_ciatico')->nullable();
            $table->boolean('mi_dor_pes')->nullable();
            $table->boolean('mi_formigamento_pernas')->nullable();
            $table->boolean('mi_formigamento_comeca_bacia')->nullable();
            $table->boolean('mi_formigamento_pes')->nullable();
            $table->boolean('mi_dormencia_pernas')->nullable();
            $table->boolean('mi_dormencia_comeca_bacia')->nullable();
            $table->boolean('mi_dormencia_pes')->nullable();
            $table->boolean('mi_tremores_pernas')->nullable();
            $table->boolean('mi_tremores_pes')->nullable();
            $table->boolean('mi_fraqueza_pernas')->nullable();
            $table->boolean('mi_fraqueza_pes')->nullable();
            $table->boolean('mi_fraqueza_ascendente')->nullable();
            $table->boolean('mi_fadiga_falar')->nullable();
            $table->boolean('mi_perda_peso')->nullable();
            $table->boolean('mi_queimacao')->nullable();
            $table->boolean('mi_caibra')->nullable();
            $table->string('mi_membro_mais_afetado')->nullable();

            // Especialistas
            $table->boolean('consultou_reumatologista')->nullable();
            $table->string('reumatologista_motivo')->nullable();
            $table->boolean('consultou_neurologista')->nullable();
            $table->string('neurologista_motivo')->nullable();
            $table->boolean('consultou_neurocirurgiao')->nullable();
            $table->string('neurocirurgiao_motivo')->nullable();
            $table->boolean('consultou_dermatologista')->nullable();
            $table->string('dermatologista_motivo')->nullable();
            $table->boolean('consultou_geriatra')->nullable();
            $table->string('geriatra_motivo')->nullable();
            $table->boolean('consultou_ortopedista')->nullable();
            $table->string('ortopedista_motivo')->nullable();

            $table->text('observacoes')->nullable();
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
        Schema::dropIfExists('electroneuromiografias');
    }
};
