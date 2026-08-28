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
     * Regla de validación que restringe team_id a los equipos del usuario.
     */
    private function teamIdRule(?User $user = null): string
    {
        $user = $user ?? auth()->user();

        if ($this->bypassesTeamRestriction($user)) {
            return 'required|exists:teams,id';
        }

        $teamIds = $user->teams()->pluck('teams.id')->implode(',');

        return "required|in:{$teamIds}";
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
}
