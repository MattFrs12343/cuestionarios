<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('potenciais', function (Blueprint $table) {
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

            // Potencial Evocado Auditivo
            $table->boolean('tem_zumbido_ouvido')->nullable();
            $table->boolean('passou_fonoaudiologo')->nullable();
            $table->string('fonoaudiologo_motivo')->nullable();
            $table->boolean('passou_otorrino')->nullable();
            $table->string('otorrino_motivo')->nullable();
            $table->boolean('passa_neurologista')->nullable();
            $table->string('neurologista_motivo')->nullable();
            $table->boolean('passa_neuropediatra')->nullable();
            $table->string('neuropediatra_motivo')->nullable();
            $table->boolean('passa_psiquiatra')->nullable();
            $table->string('psiquiatra_motivo')->nullable();
            $table->boolean('tem_retardo_mental')->nullable();
            $table->string('retardo_mental_grau')->nullable();
            $table->boolean('tem_paralisia_cerebral')->nullable();
            $table->boolean('sindrome_down')->nullable();
            $table->boolean('autismo')->nullable();
            $table->boolean('cefaleia_enxaqueca')->nullable();
            $table->boolean('crise_convulsiva')->nullable();
            $table->boolean('desmaios')->nullable();
            $table->boolean('dificuldade_fala')->nullable();
            $table->boolean('deficit_atencao')->nullable();
            $table->boolean('dificuldade_aprendizado')->nullable();
            $table->boolean('familiar_perda_auditiva')->nullable();
            $table->string('familiar_perda_auditiva_quem')->nullable();
            $table->boolean('teste_orelhinha_alterado')->nullable();
            $table->string('gestacao_meses')->nullable();
            $table->boolean('teve_perda_audicao')->nullable();
            $table->string('perda_audicao_ouvido')->nullable();
            $table->boolean('teve_infeccao_ouvido')->nullable();
            $table->boolean('teve_trauma_ouvido')->nullable();
            $table->boolean('tem_labirintite_tontura_auditivo')->nullable();
            $table->boolean('tem_hipertensao_auditivo')->nullable();
            $table->boolean('tem_diabetes_auditivo')->nullable();

            // Potencial Evocado Visual
            $table->boolean('teve_avc')->nullable();
            $table->string('avc_quando')->nullable();
            $table->boolean('dificuldade_olhar_fixo')->nullable();
            $table->boolean('tem_diplopia')->nullable();
            $table->boolean('passou_oftalmologista')->nullable();
            $table->string('oftalmologista_motivo')->nullable();
            $table->boolean('tem_patologia_olho')->nullable();
            $table->string('patologia_olho_detalhes')->nullable();
            $table->boolean('usa_oculos')->nullable();
            $table->string('grau_oculos')->nullable();
            $table->boolean('cefaleia_visual')->nullable();
            $table->boolean('tem_enxaqueca_visual')->nullable();
            $table->boolean('incomoda_claridade')->nullable();
            $table->boolean('ve_pontinhos_coloridos')->nullable();
            $table->boolean('tem_alucinacoes_visuais')->nullable();
            $table->boolean('tem_labirintite_tontura_visual')->nullable();
            $table->boolean('tem_hipertensao_visual')->nullable();
            $table->boolean('tem_diabetes_visual')->nullable();

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
        Schema::dropIfExists('potenciais');
    }
};
