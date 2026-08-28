<?php

namespace App\Models\Concerns;

use App\Models\Attachment;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Storage;

/**
 * Da a un modelo la capacidad de tener anexos (imágenes) polimórficos.
 * Al eliminar el modelo, borra automáticamente sus anexos y archivos.
 */
trait HasAttachments
{
    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    protected static function bootHasAttachments(): void
    {
        static::deleting(function ($model) {
            foreach ($model->attachments as $attachment) {
                Storage::disk('public')->delete($attachment->path);
                $attachment->delete();
            }
        });
    }
}
