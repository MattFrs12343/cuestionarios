<?php

namespace App\Http\Controllers\Questionnaires;

use App\Models\User;
use Illuminate\Support\Facades\Gate;

trait RestrictsQuestionnaireByTeam
{
    /**
     * Permite a los administradores ignorar la restricción por equipo.
     */
    private function bypassesTeamRestriction(?User $user = null): bool
    {
        $user = $user ?? auth()->user();

        return $user && $user->isSuperAdmin();
    }

    /**
     * Equipo "actual" resuelto por el middleware CurrentTeam para esta sesión.
     * El team_id de los cuestionarios se fuerza a este valor en servidor: el
     * usuario ya no lo elige por formulario ni por query string.
     */
    private function currentTeam(\Illuminate\Http\Request $request): \App\Models\Team
    {
        $team = $request->attributes->get('currentTeam');

        abort_if(! $team, 403, 'No tienes ningún equipo asignado. Contactá a un administrador.');

        return $team;
    }

    /**
     * Verifica que el modelo pertenezca a un equipo del usuario.
     */
    private function authorizeTeamAccess($model): void
    {
        if ($this->bypassesTeamRestriction()) {
            return;
        }

        $user = auth()->user();

        if (! $user->teams->contains('id', $model->team_id)) {
            abort(403, 'No tienes permisos para acceder a este cuestionario.');
        }
    }

    /**
     * Filtros comunes de los 11 índices de cuestionarios: búsqueda de texto,
     * rango de fechas, clínica y ordenamiento con whitelist. Antes esto
     * estaba duplicado en cada controlador con inconsistencias (LOWER() en
     * unos, like plano en otros); ahora todos usan LOWER() para que buscar
     * "SILVA" o "silva" dé el mismo resultado en cualquier tipo.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string[]  $searchFields  columnas donde busca el texto libre ("search")
     * @param  string[]  $allowedSortFields  whitelist de columnas ordenables
     */
    private function applyIndexFilters($query, \Illuminate\Http\Request $request, array $searchFields, array $allowedSortFields, string $defaultSort = 'created_at'): void
    {
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search, $searchFields) {
                foreach ($searchFields as $field) {
                    $q->orWhereRaw("LOWER({$field}) LIKE LOWER(?)", ["%{$search}%"]);
                }
            });
        }

        if ($dateFrom = $request->get('date_from')) {
            $query->where('data_exame', '>=', $dateFrom);
        }

        if ($dateTo = $request->get('date_to')) {
            $query->where('data_exame', '<=', $dateTo);
        }

        if ($clinica = $request->get('clinica')) {
            $query->whereRaw('LOWER(clinica) LIKE LOWER(?)', ["%{$clinica}%"]);
        }

        $sortField = $request->get('sort', $defaultSort);
        if (! in_array($sortField, $allowedSortFields, true)) {
            $sortField = $defaultSort;
        }

        $sortDirection = $request->get('direction', 'desc');
        if (! in_array($sortDirection, ['asc', 'desc'], true)) {
            $sortDirection = 'desc';
        }

        $query->orderBy($sortField, $sortDirection);
    }
}
