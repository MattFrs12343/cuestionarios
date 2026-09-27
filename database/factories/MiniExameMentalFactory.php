<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class MiniExameMentalFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome_completo' => fake()->name(),
            'rg_ou_cpf' => fake()->numerify('###########'),
            'data_nascimento' => fake()->date(),
            'sexo' => fake()->randomElement(['Masculino', 'Feminino']),
            'data_exame' => fake()->date(),
        ];
    }
}
