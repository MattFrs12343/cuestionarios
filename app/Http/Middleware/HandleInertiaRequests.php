<?php

namespace App\Http\Middleware;

use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? $user->load(['teams', 'roles']) : null,
            ],
            'currentTeam' => $request->attributes->get('currentTeam'),
            'switchableTeams' => fn () => $user
                ? ($user->isSuperAdmin() ? Team::orderBy('name')->get() : $user->teams)
                : [],
            // Un usuario no-admin con más de un equipo debe elegir con cuál
            // trabajar antes de seguir navegando; se pregunta una sola vez por
            // sesión (se confirma en TeamSwitchController) para no interrumpir
            // en cada request.
            'needsTeamSelection' => $user
                && ! $user->isSuperAdmin()
                && $user->teams->count() > 1
                && ! $request->session()->get('team_selection_confirmed', false),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
