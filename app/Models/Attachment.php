<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Attachment extends Model
{
    protected $fillable = [
        'path',
        'original_name',
    ];

    protected $appends = [
        'url',
    ];

    /**
     * Modelo dueño del anexo (cualquiera de los cuestionarios).
     */
    public function attachable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * URL autenticada para mostrar en el frontend (el disco es privado; la
     * cookie de sesión viaja sola en el <img src>, no hace falta firmar la URL).
     */
    public function getUrlAttribute(): string
    {
        return route('attachments.show', $this);
    }
}
