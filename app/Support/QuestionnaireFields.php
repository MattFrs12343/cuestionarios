<?php

namespace App\Support;

use App\Models\Team;

/**
 * Resuelve qué campos de un cuestionario puede ver un equipo, a partir de
 * config/questionnaire_fields.php.
 *
 * Es la única fuente de verdad: los controladores la usan para filtrar lo que se
 * guarda y para pasar el resultado a las vistas (Create/Edit/Show) y a la
 * exportación, así el mismo equipo ve exactamente los mismos campos en todos
 * lados.
 *
 * Ver config/questionnaire_fields.php para el formato y el porqué de usar ids.
 */
class QuestionnaireFields
{
    /**
     * Campos que el equipo no debe ver en ese cuestionario.
     *
     * @return array<int, string>
     */
    public static function hiddenFor(?Team $team, string $slug): array
    {
        if (! $team) {
            return [];
        }

        return static::overridesFor($team, 'hidden', $slug);
    }

    /**
     * Campos que solo ese equipo puede ver.
     *
     * @return array<int, string>
     */
    public static function exclusiveFor(?Team $team, string $slug): array
    {
        // Sin equipo no se puede afirmar que el usuario es el destinatario de un
        // campo exclusivo, así que no se le muestra nada exclusivo. Cerrar por
        // omisión: es preferible que falte un campo a que se filtren datos que
        // no le corresponden.
        if (! $team) {
            return [];
        }

        return static::overridesFor($team, 'exclusive', $slug);
    }

    /**
     * ¿Este equipo ve este campo en este cuestionario?
     */
    public static function sees(?Team $team, string $slug, string $field): bool
    {
        return ! in_array($field, static::invisibleTo($team, $slug), true);
    }

    /**
     * Deja en $data solo los campos que el equipo tiene permitidos.
     *
     * Se aplica sobre el payload ya validado, antes de guardar. Un campo
     * exclusivo de otro equipo, o uno oculto, llegan igual desde el formulario
     * (cualquiera puede manipular el DOM) y acá se descartan, para que no queden
     * datos guardados que la interfaz nunca muestra.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public static function onlyVisible(?Team $team, string $slug, array $data): array
    {
        foreach (array_keys($data) as $field) {
            if (! static::sees($team, $slug, (string) $field)) {
                unset($data[$field]);
            }
        }

        return $data;
    }

    /**
     * Campos que el equipo NO puede ver en ese cuestionario.
     *
     * Incluye los ocultos explícitamente para el equipo y los que son
     * exclusivos de otro equipo, así el frontend recibe una sola lista y no
     * tiene que saber por qué un campo está o no disponible.
     *
     * @return array<int, string>
     */
    public static function invisibleTo(?Team $team, string $slug): array
    {
        // Sin equipo no hay nada oculto "declarado" para ese equipo, pero sí
        // conviene arrastrar los exclusivos de TODOS los equipos: sin equipo no
        // se puede probar que el usuario sea el destinatario de un campo
        // exclusivo, así que ninguno se le muestra (fail closed, igual que
        // exclusiveFor()).
        $hidden = $team ? static::hiddenFor($team, $slug) : [];

        foreach (static::overrides() as $teamId => $settings) {
            if ($team && (int) $teamId === (int) $team->id) {
                continue;
            }

            $hidden = array_merge($hidden, $settings['exclusive'][$slug] ?? []);
        }

        return array_values(array_unique($hidden));
    }

    /**
     * Prop para Inertia: la lista de campos que las vistas no deben renderizar.
     *
     * @return array{hidden: array<int, string>}
     */
    public static function forInertia(?Team $team, string $slug): array
    {
        return [
            'hidden' => static::invisibleTo($team, $slug),
        ];
    }

    /**
     * @return array<int, string>
     */
    protected static function overridesFor(Team $team, string $type, string $slug): array
    {
        $configured = static::overrides()[$team->id][$type][$slug] ?? [];

        return array_values(array_unique($configured));
    }

    /**
     * @return array<int|string, array<string, array<string, array<int, string>>>>
     */
    protected static function overrides(): array
    {
        return config('questionnaire_fields.team_overrides', []);
    }
}
