<?php

namespace Tests\Unit;

use App\Models\Team;
use App\Support\QuestionnaireFields;
use Tests\TestCase;

/**
 * Visibilidad de campos por equipo (config/questionnaire_fields.php).
 *
 * Cubre el caso configurado hoy (equipo 5 = "Azul") de los dos cuestionarios
 * tocados, y el comportamiento por defecto para cualquier otro equipo.
 */
class QuestionnaireFieldsTest extends TestCase
{
    private const AZUL_ID = 5;
    private const OTRO_ID = 1;

    private const POTENCIAL = 'potencial';
    private const FACIAL = 'electroneuromiografia-facial';

    private function team(int $id): Team
    {
        $team = new Team;
        $team->id = $id;

        return $team;
    }

    private function azul(): Team
    {
        return $this->team(self::AZUL_ID);
    }

    private function otro(): Team
    {
        return $this->team(self::OTRO_ID);
    }

    public function test_azul_no_ve_peso_ni_altura_en_potencial(): void
    {
        $team = $this->azul();

        $this->assertFalse(QuestionnaireFields::sees($team, self::POTENCIAL, 'peso'));
        $this->assertFalse(QuestionnaireFields::sees($team, self::POTENCIAL, 'altura'));
    }

    public function test_azul_ve_hiperativo_en_potencial(): void
    {
        $this->assertTrue(QuestionnaireFields::sees($this->azul(), self::POTENCIAL, 'hiperativo'));
    }

    public function test_otros_equipos_ven_peso_altura_pero_no_hiperativo(): void
    {
        $team = $this->otro();

        $this->assertTrue(QuestionnaireFields::sees($team, self::POTENCIAL, 'peso'));
        $this->assertTrue(QuestionnaireFields::sees($team, self::POTENCIAL, 'altura'));
        $this->assertFalse(QuestionnaireFields::sees($team, self::POTENCIAL, 'hiperativo'));
    }

    public function test_avc_es_exclusivo_de_azul_en_facial(): void
    {
        $this->assertTrue(QuestionnaireFields::sees($this->azul(), self::FACIAL, 'teve_avc'));
        $this->assertTrue(QuestionnaireFields::sees($this->azul(), self::FACIAL, 'avc_quando'));

        $this->assertFalse(QuestionnaireFields::sees($this->otro(), self::FACIAL, 'teve_avc'));
        $this->assertFalse(QuestionnaireFields::sees($this->otro(), self::FACIAL, 'avc_quando'));
    }

    public function test_los_campos_de_azul_no_afectan_a_otros_cuestionarios(): void
    {
        // 'peso'/'altura' solo se ocultan en Potencial: en Facial deben verse
        // para todos, y lo mismo para cualquier otro tipo.
        $this->assertTrue(QuestionnaireFields::sees($this->azul(), self::FACIAL, 'peso'));
        $this->assertTrue(QuestionnaireFields::sees($this->azul(), 'electroencefalograma', 'peso'));
    }

    public function test_only_visible_descarta_lo_que_el_equipo_no_puede_ver(): void
    {
        $payload = [
            'nome' => 'Paciente Teste',
            'peso' => '80',
            'altura' => '1,75',
            'hiperativo' => true,
            'tem_enxaqueca' => true,
            'team_id' => 7,
            'created_by' => 9,
        ];

        $resultado = QuestionnaireFields::onlyVisible($this->azul(), self::POTENCIAL, $payload);

        $this->assertArrayNotHasKey('peso', $resultado);
        $this->assertArrayNotHasKey('altura', $resultado);

        // El exclusivo propio sí pasa, y los metadatos nunca se tocan.
        $this->assertTrue($resultado['hiperativo']);
        $this->assertTrue($resultado['tem_enxaqueca']);
        $this->assertSame('Paciente Teste', $resultado['nome']);
        $this->assertSame(7, $resultado['team_id']);
        $this->assertSame(9, $resultado['created_by']);
    }

    public function test_only_visible_descarta_el_exclusivo_de_otro_equipo(): void
    {
        $resultado = QuestionnaireFields::onlyVisible(
            $this->otro(),
            self::POTENCIAL,
            ['nome' => 'Paciente Teste', 'peso' => '80', 'hiperativo' => true]
        );

        $this->assertArrayNotHasKey('hiperativo', $resultado);
        $this->assertSame('80', $resultado['peso']);
    }

    public function test_only_visible_descarta_el_avc_para_otros_equipos(): void
    {
        $resultado = QuestionnaireFields::onlyVisible(
            $this->otro(),
            self::FACIAL,
            ['nome' => 'Paciente Teste', 'teve_avc' => true, 'avc_quando' => '2019']
        );

        $this->assertArrayNotHasKey('teve_avc', $resultado);
        $this->assertArrayNotHasKey('avc_quando', $resultado);
        $this->assertSame('Paciente Teste', $resultado['nome']);
    }

    public function test_sin_equipo_no_se_muestra_ningun_campo_exclusivo(): void
    {
        // Fail closed: sin equipo no se puede probar que el usuario sea el
        // destinatario de un campo exclusivo.
        $this->assertFalse(QuestionnaireFields::sees(null, self::POTENCIAL, 'hiperativo'));
        $this->assertFalse(QuestionnaireFields::sees(null, self::FACIAL, 'teve_avc'));
        $this->assertFalse(QuestionnaireFields::sees(null, self::FACIAL, 'avc_quando'));
    }

    public function test_equipo_sin_configuracion_ve_el_formulario_completo_pero_no_los_exclusivos_de_otros(): void
    {
        $equipoNuevo = $this->team(999);

        // Sin configuracion propia: ve el cuestionario por defecto...
        $this->assertTrue(QuestionnaireFields::sees($equipoNuevo, self::POTENCIAL, 'peso'));
        $this->assertTrue(QuestionnaireFields::sees($equipoNuevo, self::POTENCIAL, 'altura'));
        $this->assertTrue(QuestionnaireFields::sees($equipoNuevo, self::POTENCIAL, 'tem_enxaqueca'));

        // ...pero los agregados exclusivos de otro equipo siguen ocultos.
        $this->assertFalse(QuestionnaireFields::sees($equipoNuevo, self::POTENCIAL, 'hiperativo'));
        $this->assertFalse(QuestionnaireFields::sees($equipoNuevo, self::FACIAL, 'teve_avc'));
    }

    public function test_for_inertia_expone_la_lista_oculta(): void
    {
        $prop = QuestionnaireFields::forInertia($this->azul(), self::POTENCIAL);

        $this->assertArrayHasKey('hidden', $prop);
        $this->assertContains('peso', $prop['hidden']);
        $this->assertContains('altura', $prop['hidden']);
        $this->assertNotContains('hiperativo', $prop['hidden']);
    }

    public function test_la_lista_oculta_no_tiene_duplicados(): void
    {
        $prop = QuestionnaireFields::forInertia($this->azul(), self::POTENCIAL);

        $this->assertSame(
            array_values(array_unique($prop['hidden'])),
            $prop['hidden']
        );
    }
}
