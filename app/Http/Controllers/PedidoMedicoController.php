<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;

class PedidoMedicoController extends Controller
{
    /**
     * Sirve el "pedido médico" adjunto a un cuestionario de forma autenticada.
     * Reutiliza el mapa de tipos de AttachmentController para no duplicarlo.
     */
    public function show(string $type, int $id)
    {
        $types = AttachmentController::types();
        abort_unless(isset($types[$type]), 404);

        $model = $types[$type]::findOrFail($id);

        abort_unless($model->pedido_medico, 404);

        $user = auth()->user();

        if (! $user->isSuperAdmin() && ! $user->teams->contains('id', $model->team_id ?? null)) {
            abort(403, 'Você não tem permissão para acessar este pedido médico.');
        }

        abort_unless(Storage::disk('private')->exists($model->pedido_medico), 404);

        // Caché en el navegador del propio usuario (nunca en proxies: 'private').
        // A diferencia de los anexos, esta URL es estable aunque reemplacen el
        // pedido médico (misma id de cuestionário), así que usamos una ventana
        // corta para acotar cuánto podría verse una copia vieja tras un cambio.
        return Storage::disk('private')->response($model->pedido_medico, null, [
            'Cache-Control' => 'private, max-age=3600', // 1 hora
        ]);
    }
}
