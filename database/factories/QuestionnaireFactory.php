<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class QuestionnaireFactory extends Factory
{
    public function definition(): array
    {
        return [
            'clinica' => fake()->company(),
            'data_exame' => fake()->date(),
            'nome_completo' => fake()->name(),
            'data_nascimento' => fake()->date(),
            'sexo' => fake()->randomElement(['Masculino', 'Feminino']),
            'rg_ou_cpf' => fake()->numerify('###########'),
            'tipo_exame' => 'EEG',
        ];
    }
}
