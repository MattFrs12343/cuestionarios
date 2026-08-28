<?php

namespace App\Http\Controllers\Questionnaires;

use Illuminate\Http\Request;

/**
 * Lógica compartida para manejar los anexos (máx. 5 imágenes) de un cuestionario.
 */
trait HandlesAttachments
{
    /**
     * Máximo de anexos permitidos por cuestionario.
     */
    protected int $maxAttachments = 5;

    /**
     * Reglas de validación para los anexos entrantes.
     */
    protected function attachmentRules(): array
    {
        return [
            'anexos' => ['nullable', 'array', "max:{$this->maxAttachments}"],
            'anexos.*' => ['file', 'image', 'max:10240'], // 10 MB por imagen
        ];
    }

    /**
     * Guarda los anexos nuevos respetando el tope total de 5 por cuestionario.
     */
    protected function storeAttachments($model, Request $request): void
    {
        if (! $request->hasFile('anexos')) {
            return;
        }

        $remaining = $this->maxAttachments - $model->attachments()->count();

        if ($remaining <= 0) {
            return;
        }

        foreach (array_slice($request->file('anexos'), 0, $remaining) as $file) {
            $path = $file->store('anexos', 'public');
            $model->attachments()->create([
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
            ]);
        }
    }
}
