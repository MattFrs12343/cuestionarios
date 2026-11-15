<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class FingerTappingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome_completo' => fake()->name(),
            'rg_ou_cpf' => fake()->numerify('###########'),
            'data_nascimento' => '1990-05-10',
            'sexo' => 'Feminino',
            'data_exame' => today()->toDateString(),
            'movimentos_rapidos' => false,
            'bradicinesia' => false,
            'bradicinesia_lados' => [],
            'reducao_progressiva' => false,
            'reducao_lados' => [],
            'irregularidade_ritmo' => false,
            'irregularidade_lados' => [],
            'interrupcao' => false,
            'interrupcao_lados' => [],
            'tempo_direito_segundos' => null,
            'tempo_esquerdo_segundos' => null,
            'alteracoes' => [],
        ];
    }
}
