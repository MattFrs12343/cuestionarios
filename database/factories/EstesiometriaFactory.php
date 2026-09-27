<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class EstesiometriaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'data_exame' => fake()->date(),
            'nome_completo' => fake()->name(),
            'data_nascimento' => fake()->date(),
            'sexo' => fake()->randomElement(['Masculino', 'Feminino']),
        ];
    }
}
