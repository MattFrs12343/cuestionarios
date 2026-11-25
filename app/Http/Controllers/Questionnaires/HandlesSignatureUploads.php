<?php

namespace App\Http\Controllers\Questionnaires;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Convierte firmas/dibujos (SignaturePad) de texto base64 inline a archivos
 * reales en el disco 'private'. Enviar el PNG como base64 dentro del cuerpo
 * del POST es lo que hacía que ModSecurity bloqueara el guardado (406 "Not
 * Acceptable"): un string larguísimo sin espacios, con corridas largas de
 * caracteres repetidos (padding/base64 de zonas blancas del PNG), dispara las
 * reglas genéricas anti XSS/SQLi del WAF. Un archivo real no pasa por ese
 * escaneo de texto.
 *
 * No migra datos existentes: los registros viejos que todavía tengan el
 * base64 guardado en la columna siguen funcionando, se detectan por el
 * prefijo "data:" y se tratan como legado (ver deleteStoredSignature y
 * signatureUrl) en vez de como una ruta de disco.
 */
trait HandlesSignatureUploads
{
    /**
     * Reglas de validación para un conjunto de campos de firma/dibujo.
     */
    protected function signatureRules(array $fields): array
    {
        $rules = [];

        foreach ($fields as $field) {
            $rules[$field] = 'nullable|file|image|max:5120';
            $rules["{$field}_remove"] = 'nullable|boolean';
        }

        return $rules;
    }

    /**
     * Aplica los campos de firma/dibujo sobre $validated antes del create()/update().
     * $existing es null al crear (todavía no hay nada que borrar del disco).
     */
    protected function applySignatureFields($existing, Request $request, array $fields, array &$validated): void
    {
        foreach ($fields as $field) {
            if ($request->hasFile($field)) {
                if ($existing) {
                    $this->deleteStoredSignature($existing->{$field});
                }
                $validated[$field] = $request->file($field)->store('signatures', 'private');
            } elseif ($request->boolean("{$field}_remove")) {
                if ($existing) {
                    $this->deleteStoredSignature($existing->{$field});
                }
                $validated[$field] = null;
            } else {
                unset($validated[$field]);
            }

            unset($validated["{$field}_remove"]);
        }
    }

    /**
     * Borra del disco privado el archivo de una firma/dibujo, salvo que sea
     * un valor legado en base64 (no hay nada en disco que borrar).
     */
    protected function deleteStoredSignature(?string $value): void
    {
        if ($value && ! str_starts_with($value, 'data:')) {
            Storage::disk('private')->delete($value);
        }
    }

    /**
     * URL para mostrar una firma/dibujo guardado. Si es un valor legado en
     * base64 se devuelve tal cual (ya es un data: URI válido para <img src>);
     * si es una ruta de disco se devuelve la URL de signatures.show.
     */
    protected function signatureUrl($model, string $field, string $type): ?string
    {
        $value = $model->{$field};

        if (! $value) {
            return null;
        }

        if (str_starts_with($value, 'data:')) {
            return $value;
        }

        return route('signatures.show', ['type' => $type, 'id' => $model->id, 'field' => $field]);
    }
}
