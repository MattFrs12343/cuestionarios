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
     *
     * En escrituras (POST, ej. store()) exige que un usuario con más de un
     * equipo haya confirmado explícitamente con cuál trabaja (TeamSelectionModal).
     * Sin esto, CurrentTeam cae en silencio al primer equipo de la relación
     * (orden no determinado) y un cuestionario podía quedar guardado en un
     * equipo distinto al que el usuario pensaba estar usando.
     */
    private function currentTeam(\Illuminate\Http\Request $request): \App\Models\Team
    {
        $team = $request->attributes->get('currentTeam');

        abort_if(! $team, 403, 'Você não tem nenhuma equipe atribuída. Contate um administrador.');

        if ($request->isMethod('post') && ! $this->bypassesTeamRestriction()) {
            $user = auth()->user();

            if ($user && $user->teams->count() > 1 && ! $request->session()->get('team_selection_confirmed', false)) {
                abort(409, 'Confirme com qual equipe você vai trabalhar antes de salvar um questionário.');
            }
        }

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
            abort(403, 'Você não tem permissão para acessar este questionário.');
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
