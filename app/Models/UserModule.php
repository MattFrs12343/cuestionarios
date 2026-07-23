<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserModule extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'module_name',
        'is_active',
        'assigned_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Constantes para los módulos disponibles
    public const MODULES = [
        'electroencefalograma' => 'Electroencefalograma',
        'electroneuromiografia' => 'Electroneuromiografía',
        'potencial' => 'Potencial Evocado',
        'eletroneuromiografia_facial' => 'Eletroneuromiografia Facial',
    ];

    /**
     * Relación con el usuario que tiene el módulo asignado
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación con el usuario administrador que asignó el módulo
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Scope para módulos activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para un módulo específico
     */
    public function scopeForModule($query, string $moduleName)
    {
        return $query->where('module_name', $moduleName);
    }

    /**
     * Obtener el nombre legible del módulo
     */
    public function getModuleDisplayNameAttribute(): string
    {
        return self::MODULES[$this->module_name] ?? $this->module_name;
    }
}
