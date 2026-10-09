<?php

namespace Tests\Feature;

use App\Services\QuestionnaireSectionCounter;
use Tests\TestCase;

/**
 * Alerta de precios de los laudos (regla por cantidad de secciones).
 *
 * Esta es la alerta que corre antes de construir nuevos cuestionarios: si
 * alguien agrega un tipo a config/questionnaires.php sin clasificarlo, le
 * cambia el formulario sin actualizar las secciones, o declara un nivel/precio
 * que no sigue la regla comercial (3-4 → C Bs 250, 5-6 → B Bs 350, 7+ → A
 * Bs 450), este test falla y bloquea la corrida de phpunit.
 *
 * La misma lógica está disponible como alerta manual con
 * `php artisan laudos:clasificar`.
 */
class PricingClassificationTest extends TestCase
{
    private QuestionnaireSectionCounter $counter;

    protected function setUp(): void
    {
        parent::setUp();

        $this->counter = new QuestionnaireSectionCounter;
    }

    /**
     * @return array<string, array{0: string, 1: array<string, mixed>}>
     */
    private function types(): array
    {
        return config('questionnaires.types');
    }

    public function test_todos_los_cuestionarios_tienen_jsx_y_bloque_de_precio(): void
    {
        foreach ($this->types() as $key => $type) {
            $this->assertArrayHasKey('jsx', $type, "El tipo '{$key}' no define 'jsx' (ruta del formulario).");
            $this->assertArrayHasKey('precio', $type, "ALERTA: el tipo '{$key}' no tiene bloque 'precio'. Clasifícalo (secciones / nivel / Bs) antes de construir.");
            $this->assertArrayHasKey('secciones', $type['precio'], "El tipo '{$key}' no declara cuántas secciones tiene.");
            $this->assertArrayHasKey('nivel', $type['precio'], "El tipo '{$key}' no declara su nivel (A/B/C).");
            $this->assertArrayHasKey('bs', $type['precio'], "El tipo '{$key}' no declara su precio en Bs.");
        }
    }

    public function test_el_archivo_del_formulario_de_cada_cuestionario_existe(): void
    {
        foreach ($this->types() as $key => $type) {
            $this->assertTrue(
                $this->counter->exists($type['jsx']),
                "No existe el formulario {$type['jsx']} del tipo '{$key}'. Revisa la clave 'jsx' en config/questionnaires.php."
            );
        }
    }

    public function test_las_secciones_detectadas_en_el_codigo_coinciden_con_las_declaradas(): void
    {
        foreach ($this->types() as $key => $type) {
            $detectadas = $this->counter->count($type['jsx']);
            $declaradas = (int) $type['precio']['secciones'];

            $this->assertSame(
                $declaradas,
                $detectadas,
                "El cuestionario '{$key}' declara {$declaradas} secciones pero su formulario tiene {$detectadas}. "
                .'Si agregaste o quitaste una sección, actualiza el bloque "precio" en config/questionnaires.php '
                .'(y su nivel: 3-4 → C, 5-6 → B, 7+ → A).'
            );
        }
    }

    public function test_nivel_y_precio_respetan_la_regla_de_las_secciones(): void
    {
        foreach ($this->types() as $key => $type) {
            $secciones = (int) $type['precio']['secciones'];

            $nivelRegla = QuestionnaireSectionCounter::levelFor($secciones);
            $precioRegla = QuestionnaireSectionCounter::priceFor($secciones);

            $this->assertNotNull(
                $nivelRegla,
                "El cuestionario '{$key}' declara {$secciones} secciones: la tabla de precios cubre desde 3 (C: 3-4, B: 5-6, A: 7+)."
            );

            $this->assertSame(
                $nivelRegla,
                $type['precio']['nivel'],
                "El cuestionario '{$key}' tiene {$secciones} secciones: el nivel debería ser '{$nivelRegla}', no '{$type['precio']['nivel']}'."
            );

            $this->assertSame(
                $precioRegla,
                (int) $type['precio']['bs'],
                "El cuestionario '{$key}' tiene {$secciones} secciones: el precio debería ser Bs {$precioRegla}, no Bs {$type['precio']['bs']}."
            );
        }
    }

    public function test_regla_de_precios_en_los_limites(): void
    {
        // 3-4 secciones → nivel C, Bs 250
        $this->assertSame('C', QuestionnaireSectionCounter::levelFor(3));
        $this->assertSame('C', QuestionnaireSectionCounter::levelFor(4));
        $this->assertSame(250, QuestionnaireSectionCounter::priceFor(3));
        $this->assertSame(250, QuestionnaireSectionCounter::priceFor(4));

        // 5-6 secciones → nivel B, Bs 350
        $this->assertSame('B', QuestionnaireSectionCounter::levelFor(5));
        $this->assertSame('B', QuestionnaireSectionCounter::levelFor(6));
        $this->assertSame(350, QuestionnaireSectionCounter::priceFor(5));
        $this->assertSame(350, QuestionnaireSectionCounter::priceFor(6));

        // 7 o más → nivel A, Bs 450
        $this->assertSame('A', QuestionnaireSectionCounter::levelFor(7));
        $this->assertSame('A', QuestionnaireSectionCounter::levelFor(12));
        $this->assertSame(450, QuestionnaireSectionCounter::priceFor(7));
        $this->assertSame(450, QuestionnaireSectionCounter::priceFor(12));

        // Fuera de la tabla: sin nivel ni precio.
        $this->assertNull(QuestionnaireSectionCounter::levelFor(2));
        $this->assertNull(QuestionnaireSectionCounter::priceFor(1));
    }
}
