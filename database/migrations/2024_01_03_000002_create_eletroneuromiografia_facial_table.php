<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eletroneuromiografia_facial', function (Blueprint $table) {
            $table->id();

            $table->string('nome')->nullable();
            $table->date('data_nascimento')->nullable();
            $table->string('idade')->nullable();
            $table->decimal('peso', 5, 2)->nullable();
            $table->decimal('altura', 5, 2)->nullable();
            $table->date('data_exame')->nullable();
            $table->string('rg')->nullable();
            $table->string('solicitante')->nullable();
            $table->string('clinica')->nullable();
            $table->string('sexo')->nullable();

            $table->boolean('tem_dor_testa')->nullable();
            $table->boolean('tem_dor_olhos')->nullable();
            $table->string('dor_olhos_lado')->nullable();
            $table->boolean('tem_dor_mandibula')->nullable();
            $table->boolean('tem_dor_dentes_agua_gelada')->nullable();
            $table->boolean('tem_espasmos_face')->nullable();
            $table->string('espasmos_face_parte')->nullable();
            $table->boolean('aplicou_botox')->nullable();
            $table->string('botox_parte_face')->nullable();
            $table->boolean('tem_implante_dentario')->nullable();
            $table->boolean('tem_dores_apos_implante')->nullable();
            $table->boolean('teve_paralisia_facial')->nullable();
            $table->string('paralisia_facial_vezes')->nullable();
            $table->boolean('tem_parte_face_paralisada')->nullable();
            $table->string('parte_face_paralisada_qual')->nullable();
            $table->boolean('tem_enxaqueca')->nullable();
            $table->boolean('consegue_sorrir_normalmente')->nullable();
            $table->boolean('pode_comer_normalmente')->nullable();
            $table->boolean('pode_assoviar')->nullable();
            $table->boolean('consegue_encher_bexiga')->nullable();
            $table->boolean('tem_infeccao_ouvido_repetidamente')->nullable();
            $table->boolean('diabetico')->nullable();
            $table->boolean('toma_medicamento')->nullable();
            $table->string('medicamentos')->nullable();

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
        Schema::dropIfExists('eletroneuromiografia_facial');
    }
};
