<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dinamometros', function (Blueprint $table) {
            $table->id();

            $table->string('clinica')->nullable();
            $table->date('data_exame');
            $table->string('nome_completo');
            $table->date('data_nascimento');
            $table->string('sexo');
            $table->decimal('peso', 5, 2)->nullable();
            $table->decimal('altura', 5, 2)->nullable();
            $table->string('dominancia')->nullable();
            $table->string('profissao')->nullable();
            $table->string('responsavel_menor')->nullable();
            $table->string('diagnostico_principal')->nullable();
            $table->text('indicacao_avaliacao')->nullable();

            // ['neurologico','ortopedico','geriatrico','pediatrico']
            $table->json('contextos_clinicos')->nullable();

            // Histórico clínico
            $table->text('doencas_cronicas')->nullable();
            $table->text('cirurgias_membro_superior')->nullable();
            $table->text('medicacoes_uso')->nullable();
            $table->boolean('fisioterapia_recente')->default(false);
            $table->boolean('lesao_previa_atual')->default(false);
            $table->string('lesao_previa_atual_qual')->nullable();
            $table->unsignedTinyInteger('dor_atual')->nullable();
            $table->boolean('dor_piora_com_forca')->default(false);
            $table->string('localizacao_dor')->nullable();

            // Seção Neurológico
            $table->string('neuro_lado_afetado')->nullable();
            $table->boolean('neuro_espasticidade')->default(false);
            $table->boolean('neuro_tremor')->default(false);
            $table->boolean('neuro_dominancia_igual_lado_afetado')->default(false);
            $table->boolean('neuro_melhor_efeito_medicacao')->default(false);

            // Seção Ortopédico
            $table->boolean('orto_fase_aguda_lesao')->default(false);
            $table->boolean('orto_dor_piora_forca')->default(false);
            $table->decimal('orto_quickdash_score', 5, 2)->nullable();
            $table->string('orto_fase_tratamento')->nullable();

            // Seção Geriátrico
            $table->boolean('geri_quedas_ultimo_ano')->default(false);
            $table->unsignedTinyInteger('geri_num_medicamentos_dia')->nullable();
            $table->unsignedTinyInteger('geri_fragilidade_fried')->nullable();
            $table->string('geri_classificacao_fragilidade')->nullable();
            $table->boolean('geri_comprometimento_cognitivo')->default(false);

            // Seção Pediátrico
            $table->boolean('pedi_dominancia_nao_definida')->default(false);
            $table->boolean('pedi_paralisia_cerebral_sindrome')->default(false);
            $table->boolean('pedi_segura_objetos_normalmente')->default(false);
            $table->boolean('pedi_coopera_teste')->default(false);
            $table->string('pedi_idade_cronologica_vs_desenvolvimento')->nullable();

            // Condições no dia do teste
            $table->boolean('dormiu_bem')->default(false);
            $table->boolean('esforco_fisico_24h')->default(false);
            $table->boolean('dor_desconforto_hoje')->default(false);
            $table->boolean('consentimento_tcle')->default(false);

            // Padronização e resultados
            $table->unsignedTinyInteger('tentativas')->nullable();
            $table->unsignedTinyInteger('intervalo_segundos')->nullable();
            $table->decimal('mao_dominante_t1', 5, 2)->nullable();
            $table->decimal('mao_dominante_t2', 5, 2)->nullable();
            $table->decimal('mao_dominante_t3', 5, 2)->nullable();
            $table->decimal('mao_dominante_media', 5, 2)->nullable();
            $table->decimal('mao_nao_dominante_t1', 5, 2)->nullable();
            $table->decimal('mao_nao_dominante_t2', 5, 2)->nullable();
            $table->decimal('mao_nao_dominante_t3', 5, 2)->nullable();
            $table->decimal('mao_nao_dominante_media', 5, 2)->nullable();

            // Interpretação e conduta
            $table->string('classificacao')->nullable();
            $table->decimal('assimetria_percentual', 5, 2)->nullable();
            $table->text('conclusao')->nullable();
            $table->text('conduta')->nullable();
            $table->string('nome_avaliador')->nullable();
            $table->string('crefito_crm')->nullable();

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
        Schema::dropIfExists('dinamometros');
    }
};
