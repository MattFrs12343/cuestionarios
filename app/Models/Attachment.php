<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

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
     * URL pública lista para mostrar en el frontend.
     */
    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->path);
    }
}
