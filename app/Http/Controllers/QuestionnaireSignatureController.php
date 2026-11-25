<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;

class QuestionnaireSignatureController extends Controller
{
    /**
     * Whitelist de columnas servibles: evita exponer cualquier atributo del
     * modelo a través del parámetro {field} de la ruta.
     */
    private const ALLOWED_FIELDS = [
        'assinatura_paciente',
        'desenho_copia',
        'desenho_visoespacial',
        'desenho_atencao',
        'desenho_evocacao_tardia',
        'desenho_orientacao',
    ];

    /**
     * Sirve el archivo de una firma/dibujo de forma autenticada (disco
     * privado). Reutiliza el mapa de tipos de AttachmentController. Los
     * valores legados en base64 no pasan por acá: se devuelven inline desde
     * HandlesSignatureUploads::signatureUrl().
     */
    public function show(string $type, int $id, string $field)
    {
        abort_unless(in_array($field, self::ALLOWED_FIELDS, true), 404);

        $types = AttachmentController::types();
        abort_unless(isset($types[$type]), 404);

        $model = $types[$type]::findOrFail($id);

        $value = $model->{$field};
        abort_unless($value, 404);
        abort_if(str_starts_with($value, 'data:'), 404);

        $user = auth()->user();

        if (! $user->isSuperAdmin() && ! $user->teams->contains('id', $model->team_id ?? null)) {
            abort(403, 'Você não tem permissão para acessar este arquivo.');
        }

        abort_unless(Storage::disk('private')->exists($value), 404);

        return Storage::disk('private')->response($value, null, [
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }
}
