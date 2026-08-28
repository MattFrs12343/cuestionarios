<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * Normaliza los booleanos enviados por FormData (multipart), donde todo llega
 * como string. Convierte "true"/"false" al booleano real para que la regla
 * de validación `boolean` de Laravel los acepte. Los valores "1"/"0" ya son
 * válidos y no se tocan.
 */
class BoolCoerce
{
    public static function apply(Request $request): void
    {
        $coerced = [];

        foreach ($request->all() as $key => $value) {
            if ($value === 'true') {
                $coerced[$key] = true;
            } elseif ($value === 'false') {
                $coerced[$key] = false;
            }
        }

        if ($coerced) {
            $request->merge($coerced);
        }
    }
}
