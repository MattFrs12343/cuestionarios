<?php

namespace App\Http\Middleware;

use App\Models\Team;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resuelve el "equipo actual" de la sesión y lo deja en $request->attributes
 * para que los controladores y HandleInertiaRequests lo usen sin repetir la
 * lógica. No aborta si el usuario no tiene equipo: eso lo decide cada
 * controlador que realmente necesite uno (ver RestrictsQuestionnaireByTeam::currentTeam()),
 * para no bloquear páginas que no dependen de un equipo (perfil, logout, etc).
 */
class CurrentTeam
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! auth()->check()) {
            return $next($request);
        }

        $user = auth()->user();
        $teamId = $request->session()->get('current_team_id');
        $team = $teamId ? $this->resolveTeam($user, (int) $teamId) : null;

        if (! $team) {
            $team = $user->isSuperAdmin() ? Team::first() : $user->teams->first();

            if ($team) {
                $request->session()->put('current_team_id', $team->id);
            }
        }

        $request->attributes->set('currentTeam', $team);

        return $next($request);
    }

    private function resolveTeam(User $user, int $teamId): ?Team
    {
        if ($user->isSuperAdmin()) {
            return Team::find($teamId);
        }

        return $user->teams->firstWhere('id', $teamId);
    }
}
