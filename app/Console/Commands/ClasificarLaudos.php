<?php

namespace App\Console\Commands;

use App\Services\QuestionnaireSectionCounter;
use Illuminate\Console\Command;

/**
 * Alerta de precios: analiza cuántas secciones tiene cada cuestionario
 * ANTES de construir nuevos, y valida la clasificación comercial.
 *
 * Correrlo antes de cada entrega/despliegue (o con `php artisan test`, que
 * ejecuta la misma lógica y bloquea si hay problemas). Falla (exit 1) si:
 *
 * - un tipo de config/questionnaires.php no tiene el bloque "precio";
 * - el JSX del cuestionario no existe;
 * - las secciones detectadas en el código no coinciden con las declaradas;
 * - el nivel/precio no respetan la regla 3-4 → C/250, 5-6 → B/350, 7+ → A/450.
 *
 * Uso: php artisan laudos:clasificar
 */
class ClasificarLaudos extends Command
{
    protected $signature = 'laudos:clasificar';

    protected $description = 'Analiza las secciones de cada cuestionario y valida su clasificación de precios (3-4 → C Bs 250, 5-6 → B Bs 350, 7+ → A Bs 450)';

    public function handle(QuestionnaireSectionCounter $counter): int
    {
        $types = config('questionnaires.types');
        $rows = [];
        $problems = 0;

        foreach ($types as $key => $type) {
            $label = $type['label'] ?? $key;
            $precio = $type['precio'] ?? null;
            $jsx = $type['jsx'] ?? null;

            if ($jsx === null || $precio === null) {
                $problems++;
                $rows[] = [$label, '—', '—', '—', '—', 'FALTA CLASIFICAR'];

                continue;
            }

            if (! $counter->exists($jsx)) {
                $problems++;
                $rows[] = [$label, '—', $precio['secciones'] ?? '?', $precio['nivel'] ?? '?', 'Bs '.($precio['bs'] ?? '?'), 'SIN ARCHIVO'];

                continue;
            }

            $detected = $counter->count($jsx);
            $declared = (int) ($precio['secciones'] ?? -1);
            $nivel = (string) ($precio['nivel'] ?? '?');
            $bs = (int) ($precio['bs'] ?? -1);

            $ruleLevel = QuestionnaireSectionCounter::levelFor($detected);
            $rulePrice = QuestionnaireSectionCounter::priceFor($detected);

            $estado = 'OK';

            if ($detected < 3) {
                $estado = "FUERA DE RANGO ({$detected} secciones)";
            } elseif ($ruleLevel !== $nivel || $rulePrice !== $bs) {
                $estado = 'REGLA INCUMPLIDA (debería ser '.$ruleLevel.' / Bs '.($rulePrice ?? '?').')';
            } elseif ($detected !== $declared) {
                $estado = "DESCUADRE (el código tiene {$detected})";
            }

            if ($estado !== 'OK') {
                $problems++;
            }

            $rows[] = [$label, $detected, $declared, $nivel, "Bs {$bs}", $estado];
        }

        $this->table(['Cuestionario', 'Secciones (JSX)', 'Secciones (config)', 'Nivel', 'Precio', 'Estado'], $rows);

        $total = count($types);
        $this->newLine();

        if ($problems > 0) {
            $this->error("ALERTA: {$problems} de {$total} cuestionario(s) tienen problemas de clasificación de precios.");
            $this->line('Corrige config/questionnaires.php (bloque "jsx" y "precio") antes de construir o publicar.');

            return self::FAILURE;
        }

        $this->info("OK: los {$total} cuestionarios están clasificados y su precio coincide con la regla de secciones.");

        return self::SUCCESS;
    }
}
