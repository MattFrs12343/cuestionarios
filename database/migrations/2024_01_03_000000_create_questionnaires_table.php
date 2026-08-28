<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questionnaires', function (Blueprint $table) {
            $table->id();
            $table->string('clinica')->nullable();
            $table->date('data_exame')->nullable();
            $table->string('nome_completo')->nullable();
            $table->date('data_nascimento')->nullable();
            $table->string('sexo')->nullable();
            $table->string('rg_ou_cpf')->nullable();

            $table->boolean('teve_covid')->nullable();
            $table->boolean('teve_desmaio')->nullable();
            $table->boolean('ja_teve_avc')->nullable();
            $table->text('quando_teve_avc')->nullable();
            $table->boolean('ja_teve_convulsao')->nullable();
            $table->text('quando_teve_convulsao')->nullable();
            $table->boolean('ja_bateu_cabeca')->nullable();
            $table->boolean('tem_dor_cabeca')->nullable();
            $table->boolean('tem_depressao')->nullable();
            $table->boolean('tem_ansiedade')->nullable();
            $table->boolean('tem_insonia')->nullable();
            $table->boolean('tem_esquecimento')->nullable();
            $table->boolean('tem_alzheimer')->nullable();
            $table->boolean('tem_parkinson')->nullable();
            $table->boolean('hipertensao')->nullable();
            $table->string('hipertensao_faz_uso')->nullable();
            $table->boolean('diabetes')->nullable();
            $table->string('diabetes_faz_uso')->nullable();
            $table->boolean('tem_dificuldade_aprendizado')->nullable();
            $table->boolean('hiperativo')->nullable();
            $table->boolean('agressivo')->nullable();
            $table->boolean('autismo')->nullable();
            $table->boolean('tem_dificuldade_dormir')->nullable();

            $table->string('nome_profissional_pedido')->nullable();
            $table->string('nome_tecnico_medico_exame')->nullable();
            $table->string('momento_exame')->nullable();
            $table->text('comentario')->nullable();
            $table->string('assinatura_paciente')->nullable();
            $table->string('pedido_medico')->nullable();
            $table->string('tipo_exame')->nullable();

            $table->foreignId('team_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questionnaires');
    }
};
