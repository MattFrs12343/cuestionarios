<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PotencialFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome' => fake()->name(),
            'data_nascimento' => fake()->date(),
            'data_exame' => fake()->date(),
            'rg' => fake()->numerify('###########'),
            'sexo' => fake()->randomElement(['Masculino', 'Feminino']),
            'solicitante' => fake()->name(),
            'clinica' => fake()->company(),
        ];
    }
}
