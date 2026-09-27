<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class TeamSwitchController extends Controller
{
    /**
     * Cambia el "equipo actual" de la sesión (ver CurrentTeam middleware).
     * Disponible para cualquier usuario autenticado, no solo admins: es
     * navegación, no gestión de equipos.
     */
    public function __invoke(Request $request, Team $team): RedirectResponse
    {
        $user = $request->user();

        if (! $user->isSuperAdmin() && ! $user->teams->contains('id', $team->id)) {
            abort(403, 'No tienes permisos para cambiar a este equipo.');
        }

        $request->session()->put('current_team_id', $team->id);

        return back();
    }
}
