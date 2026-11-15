<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class RaimisteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome_completo' => fake()->name(),
            'rg_ou_cpf' => fake()->numerify('###########'),
            'data_nascimento' => '1990-05-10',
            'sexo' => 'Feminino',
            'data_exame' => today()->toDateString(),
            'sustenta_posicao' => false,
            'pronacao_supinacao' => false,
            'pronacao_lados' => [],
            'tremor_oscilacao' => false,
            'tremor_lados' => [],
            'assimetria' => false,
            'assimetria_lado' => null,
            'desconforto' => false,
            'observacoes' => null,
            'tempo_direito_segundos' => null,
            'tempo_esquerdo_segundos' => null,
        ];
    }
}
