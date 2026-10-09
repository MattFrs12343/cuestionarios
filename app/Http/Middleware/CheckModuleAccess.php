<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckModuleAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $moduleName): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Verificar si el usuario tiene acceso al módulo en el equipo actual
        if (!$user->hasModuleAccess($moduleName, $request->attributes->get('currentTeam'))) {
            abort(403, "Você não tem acesso ao módulo de {$moduleName}. Contate um administrador para solicitar acesso.");
        }

        return $next($request);
    }
}
