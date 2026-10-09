<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dinamometria_mmiis', function (Blueprint $table) {
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
            $table->text('indicacao_clinica')->nullable();

            // 2. Anamnese neurológica e musculoesquelética
            $table->boolean('fraqueza_muscular')->default(false);
            $table->string('fraqueza_lado')->nullable();
            $table->json('fraqueza_tipo')->nullable();
            $table->json('dificuldade_atividades')->nullable();
            $table->boolean('fadiga_muscular')->default(false);
            $table->boolean('dor_membros')->default(false);
            $table->string('dor_localizacao')->nullable();
            $table->unsignedTinyInteger('dor_eva')->nullable();
            $table->boolean('parestesias')->default(false);
            $table->string('parestesias_localizacao')->nullable();
            $table->boolean('dor_neuropatica')->default(false);
            $table->boolean('caimbras')->default(false);
            $table->boolean('tremores')->default(false);
            $table->boolean('rigidez_muscular')->default(false);
            $table->boolean('alteracao_equilibrio')->default(false);
            $table->boolean('quedas_6meses')->default(false);
            $table->unsignedSmallInteger('quedas_quantidade')->nullable();
            $table->string('dispositivo_auxiliar')->nullable();
            $table->string('dispositivo_auxiliar_outro')->nullable();

            // 3. Antecedentes clínicos
            $table->json('antecedentes_clinicos')->nullable();
            $table->string('antecedentes_outra')->nullable();

            // 4. Segurança para realização do teste
            $table->json('seguranca_teste')->nullable();
            $table->text('seguranca_observacoes')->nullable();

            // 5. Exame motor pré-dinamometria
            $table->string('tono_mid')->nullable();
            $table->string('tono_mie')->nullable();
            // [{ movimento, direito, esquerdo }]
            $table->json('forca_mrc')->nullable();

            // 6. Registro da dinamometria
            $table->string('posicao_protocolo')->nullable();
            $table->string('unidade')->nullable();
            $table->string('unidade_outra')->nullable();
            // [{ movimento, d1, d2, d3, d_melhor, d_media, e1, e2, e3, e_melhor, e_media, assimetria_pct, menor }]
            $table->json('dinamometria')->nullable();
            $table->string('valor_analise')->nullable();
            $table->string('valor_analise_outro')->nullable();
            $table->unsignedSmallInteger('tempo_sustentacao_segundos')->nullable();
            $table->decimal('assimetria_global_pct', 5, 2)->nullable();
            $table->json('intercorrencias_teste')->nullable();

            // 7. Impressão funcional
            $table->json('impressao_funcional')->nullable();
            $table->text('observacoes_correlacao')->nullable();
            $table->string('modelo_conclusao')->nullable();
            $table->decimal('maior_assimetria_pct', 5, 2)->nullable();
            $table->string('maior_assimetria_movimento')->nullable();
            $table->string('menor_forca_lado')->nullable();
            $table->json('comportamento_teste')->nullable();
            $table->text('conclusao_final')->nullable();
            $table->string('examinador')->nullable();
            $table->string('crm_registro')->nullable();

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
        Schema::dropIfExists('dinamometria_mmiis');
    }
};
