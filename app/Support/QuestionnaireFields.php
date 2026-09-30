<?php

namespace App\Support;

use App\Models\Team;
use App\Models\User;

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
        return static::invisibleToTeams($team ? [$team->id] : [], $slug);
    }

    /**
     * Igual que invisibleTo(), pero resuelto sobre un conjunto de equipos.
     *
     * Hace falta en las pantallas donde todavia no hay un equipo concreto: en el
     * formulario de creacion el equipo se elige dentro del propio formulario, asi
     * que cuando se renderiza todavia no se sabe. Ahi se decide por pertenencia:
     * un campo exclusivo se muestra si el usuario pertenece a algun equipo que lo
     * tenga, y se oculta si solo pertenece a equipos ajenos. Si no se sabe de
     * que equipos se trata, no se muestra ningun exclusivo (fail closed).
     *
     * @param  array<int, int|string>|null  $teamIds
     * @return array<int, string>
     */
    public static function invisibleToTeams(?array $teamIds, string $slug): array
    {
        $mine = array_map('intval', $teamIds ?? []);

        $hidden = [];
        $allExclusive = [];
        $myExclusive = [];

        foreach (static::overrides() as $teamId => $settings) {
            $exclusive = $settings['exclusive'][$slug] ?? [];
            $allExclusive = array_merge($allExclusive, $exclusive);

            if (in_array((int) $teamId, $mine, true)) {
                $hidden = array_merge($hidden, $settings['hidden'][$slug] ?? []);
                $myExclusive = array_merge($myExclusive, $exclusive);
            }
        }

        // Los exclusivos de los equipos a los que el usuario NO pertenece quedan
        // ocultos. Sin ningun equipo esto deja todos los exclusivos fuera.
        $hidden = array_merge($hidden, array_diff($allExclusive, $myExclusive));

        return array_values(array_unique($hidden));
    }

    /**
     * Prop para Inertia en las pantallas sin equipo concreto.
     *
     * @return array{hidden: array<int, string>}
     */
    public static function forUser(?User $user, string $slug): array
    {
        $teamIds = $user ? $user->teams()->pluck('teams.id')->all() : [];

        return [
            'hidden' => static::invisibleToTeams($teamIds, $slug),
        ];
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
