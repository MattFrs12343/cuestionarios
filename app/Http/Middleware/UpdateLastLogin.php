<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateLastLogin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            $user = auth()->user();
            
            // Solo actualizar si han pasado más de 5 minutos desde la última actualización
            if (!$user->last_login_at || $user->last_login_at->diffInMinutes(now()) > 5) {
                $user->updateLastLogin();
            }
        }

        return $next($request);
    }
}