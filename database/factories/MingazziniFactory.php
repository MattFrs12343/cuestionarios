<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class MingazziniFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome_completo' => fake()->name(),
            'rg_ou_cpf' => fake()->numerify('###########'),
            'data_nascimento' => '1990-05-10',
            'sexo' => 'Feminino',
            'data_exame' => today()->toDateString(),
            'mmii_sustenta_posicao' => false,
            'mmii_queda' => false,
            'mmii_queda_lados' => [],
            'mmii_tremor' => false,
            'mmii_tremor_lados' => [],
            'mmii_assimetria' => false,
            'mmii_assimetria_lado' => null,
            'mmii_interrupcao' => false,
            'mmii_interrupcao_lados' => [],
            'mmii_tempo_direito_segundos' => null,
            'mmii_tempo_esquerdo_segundos' => null,
            'mmii_alteracoes' => [],
            'mmss_sustenta_posicao' => false,
            'mmss_queda_pronacao' => false,
            'mmss_queda_lados' => [],
            'mmss_tremor' => false,
            'mmss_tremor_lados' => [],
            'mmss_assimetria' => false,
            'mmss_assimetria_lado' => null,
            'mmss_desconforto' => false,
            'observacoes' => null,
            'mmss_tempo_direito_segundos' => null,
            'mmss_tempo_esquerdo_segundos' => null,
        ];
    }
}
