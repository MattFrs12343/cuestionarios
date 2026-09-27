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
            abort(403, 'No tienes permisos para acceder a este pedido médico.');
        }

        abort_unless(Storage::disk('private')->exists($model->pedido_medico), 404);

        return Storage::disk('private')->response($model->pedido_medico);
    }
}
