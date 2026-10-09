<?php

namespace App\Services;

use RuntimeException;

/**
 * Cuenta las secciones de un cuestionario leyendo su formulario JSX.
 *
 * Es la fuente de verdad que sostiene la regla comercial de los laudos:
 * 3-4 secciones → nivel C (Bs 250), 5-6 → B (Bs 350), 7+ → A (Bs 450).
 *
 * Reglas de conteo (verificadas contra los 12 cuestionarios actuales):
 *
 * 1. Si el archivo define `const SECTIONS = [...]` (el menú lateral de
 *    navegación), se cuentan sus entradas: ese array es exactamente lo que
 *    el usuario ve como "secciones".
 * 2. Si no, se cuentan los encabezados <h3> con clase text-gray-900 — que
 *    son los títulos de bloque reales del formulario. El título decorativo
 *    del encabezado ("Formulário de Registro") va con text-white y NO cuenta.
 */
class QuestionnaireSectionCounter
{
    /**
     * Ruta absoluta del JSX de un tipo, relativa a resources/js/Pages.
     */
    public function sourcePath(string $jsx): string
    {
        return resource_path('js/Pages/'.ltrim($jsx, '/'));
    }

    public function exists(string $jsx): bool
    {
        return is_file($this->sourcePath($jsx));
    }

    /**
     * Cantidad de secciones del formulario. Lanza RuntimeException si el
     * archivo no existe (el comando/test lo reportan como problema).
     */
    public function count(string $jsx): int
    {
        $path = $this->sourcePath($jsx);

        if (! is_file($path)) {
            throw new RuntimeException("No existe el archivo del cuestionario: {$jsx}");
        }

        $src = file_get_contents($path);

        if ($src === false) {
            throw new RuntimeException("No se pudo leer: {$jsx}");
        }

        if (preg_match('/const\s+SECTIONS\s*=\s*\[(?<body>.*?)\];/s', $src, $m)) {
            return (int) preg_match_all('/\{\s*id\s*:/', $m['body']);
        }

        return (int) preg_match_all('/<h3[^>]*text-gray-900/', $src);
    }

    /**
     * Nivel comercial de una cantidad de secciones (null si está fuera de
     * rango: la tabla de precios cubre desde 3 secciones).
     */
    public static function levelFor(int $sections): ?string
    {
        if ($sections < 3) {
            return null;
        }

        if ($sections <= 4) {
            return 'C';
        }

        if ($sections <= 6) {
            return 'B';
        }

        return 'A';
    }

    /**
     * Precio en Bs por laudo para una cantidad de secciones (null si fuera
     * de rango).
     */
    public static function priceFor(int $sections): ?int
    {
        return match (self::levelFor($sections)) {
            'C' => 250,
            'B' => 350,
            'A' => 450,
            default => null,
        };
    }
}
