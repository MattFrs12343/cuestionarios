<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class BarreFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome_completo' => fake()->name(),
            'rg_ou_cpf' => fake()->numerify('###########'),
            'data_nascimento' => '1990-05-10',
            'sexo' => 'Feminino',
            'data_exame' => today()->toDateString(),
            'sustenta_60_segundos' => true,
            'queda_progressiva' => false,
            'queda_lados' => [],
            'tremor_oscilacao' => false,
            'tremor_lados' => [],
            'assimetria' => false,
            'interrupcao' => false,
            'interrupcao_lados' => [],
            'alteracoes' => ['sem_alteracoes'],
        ];
    }
}
