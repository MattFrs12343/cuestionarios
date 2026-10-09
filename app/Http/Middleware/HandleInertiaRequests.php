<?php

namespace App\Http\Middleware;

use App\Models\Team;
use Closure;
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
     * share() corre en TODA request que pasa por esta clase, incluidos los
     * redirects intermedios (ej. /dashboard, que solo hace
     * redirect()->route('questionnaires.index') sin renderizar nada). Si
     * marcáramos "ya se mostró el aviso de equipo" directamente en share(),
     * ese redirect invisible consumía el flag antes de que el navegador
     * llegara a la página real — el toast quedaba siempre gastado y nunca
     * se veía. Por eso la confirmación se hace aquí, después de next(),
     * y solo si la respuesta final no es un redirect.
     */
    public function handle(Request $request, Closure $next)
    {
        $response = parent::handle($request, $next);

        if ($request->attributes->get('showTeamWelcomePending') && ! $response->isRedirect()) {
            $request->session()->put(
                'team_welcome_last_team_id',
                $request->attributes->get('currentTeam')?->id
            );
        }

        return $response;
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $currentTeam = $request->attributes->get('currentTeam');

        // Un usuario no-admin con más de un equipo debe elegir con cuál
        // trabajar antes de seguir navegando; se pregunta una sola vez por
        // sesión (se confirma en TeamSwitchController) para no interrumpir
        // en cada request.
        $needsTeamSelection = $user
            && ! $user->isSuperAdmin()
            && $user->teams->count() > 1
            && ! $request->session()->get('team_selection_confirmed', false);

        // Aviso breve ("estás trabajando en el equipo X") cada vez que el
        // equipo activo cambia (login, selección inicial o cambio manual).
        // Ayuda a los usuarios de varios equipos a notar de inmediato dónde
        // van a quedar guardados los cuestionarios que creen. No se muestra
        // mientras todavía falta confirmar la selección (needsTeamSelection).
        $showTeamWelcome = false;
        if ($user && $currentTeam && ! $needsTeamSelection) {
            if ($request->session()->get('team_welcome_last_team_id') !== $currentTeam->id) {
                $showTeamWelcome = true;
                $request->attributes->set('showTeamWelcomePending', true);
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? $user->load(['teams', 'roles']) : null,
            ],
            'currentTeam' => $currentTeam,
            // Lo que el usuario ve de verdad. Se comparte para que el layout no
            // pueda enlazar a un módulo que la persona no tiene: el menú móvil
            // tenía fijos dos enlaces que devolvían 403 al apagarles el módulo.
            'accessibleModules' => fn () => $user
                ? $user->getAccessibleModules($currentTeam)
                : [],
            'switchableTeams' => fn () => $user
                ? ($user->isSuperAdmin() ? Team::orderBy('name')->get() : $user->teams)
                : [],
            'needsTeamSelection' => $needsTeamSelection,
            'showTeamWelcome' => $showTeamWelcome,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
