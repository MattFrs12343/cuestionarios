<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class EpleyFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome_completo' => fake()->name(),
            'rg_ou_cpf' => fake()->numerify('###########'),
            'data_nascimento' => '1990-05-10',
            'sexo' => 'Feminino',
            'data_exame' => today()->toDateString(),
            'vertigem' => true,
            'vertigem_lados' => ['Direita'],
            'nistagmo' => true,
            'nistagmo_lados' => ['Direita'],
            'desconforto' => false,
            'mantem_posicao' => true,
            'tempo_mantido_segundos' => 45,
            'melhora_vertigem' => 'Melhora parcial',
        ];
    }
}
