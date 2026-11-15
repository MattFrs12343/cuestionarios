<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class WartenbergFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome_completo' => fake()->name(),
            'rg_ou_cpf' => fake()->numerify('###########'),
            'data_nascimento' => '1990-05-10',
            'sexo' => 'Feminino',
            'data_exame' => today()->toDateString(),
            'afastamento_involuntario' => false,
            'afastamento_lados' => [],
            'dificuldade_manter' => false,
            'manter_lados' => [],
            'dificuldade_aproximar' => false,
            'aproximar_lado' => null,
            'fraqueza_assimetria' => false,
            'fraqueza_lados' => [],
            'alteracao_sensibilidade' => false,
            'sensibilidade_lados' => [],
            'tempo_mantido_segundos' => null,
        ];
    }
}
