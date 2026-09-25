<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tdah_infantis', function (Blueprint $table) {
            $table->id();

            $table->string('clinica')->nullable();
            $table->date('data_exame');
            $table->string('nome_completo');
            $table->date('data_nascimento');
            $table->string('rg_ou_cpf')->nullable();
            $table->decimal('peso', 5, 2)->nullable();
            $table->decimal('altura', 5, 2)->nullable();
            $table->string('sexo');
            $table->string('solicitante')->nullable();

            // Parte I: 9 itens, escala 0-4 (Nunca..Muito Frequentemente)
            $table->json('parte_1_respostas')->nullable();
            $table->unsignedTinyInteger('parte_1_total')->nullable();

            // Parte II: 9 itens, escala 0-4
            $table->json('parte_2_respostas')->nullable();
            $table->unsignedTinyInteger('parte_2_total')->nullable();

            $table->string('cid')->nullable();
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
        Schema::dropIfExists('tdah_infantis');
    }
};
