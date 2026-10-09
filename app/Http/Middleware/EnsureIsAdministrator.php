<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Reemplaza a `role:administrador` para el panel /admin: además del rol
 * Spatie, deja pasar a cualquier super-admin (columna users.is_super_admin),
 * que es una autoridad aparte y no depende de tener el rol asignado.
 * Ver User::isSuperAdmin().
 */
class EnsureIsAdministrator
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if (! $user->isSuperAdmin() && ! $user->hasRole('administrador')) {
            abort(403, 'Você não tem permissão para acessar esta seção.');
        }

        return $next($request);
    }
}
