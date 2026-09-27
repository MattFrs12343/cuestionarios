<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    protected static function booted(): void
    {
        static::created(function (Team $team) {
            $team->provisionDefaultModules();
        });
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    public function questionnaires(): HasMany
    {
        return $this->hasMany(Questionnaire::class);
    }

    public function modules(): HasMany
    {
        return $this->hasMany(TeamModule::class);
    }

    public function activeModuleNames(): array
    {
        return $this->modules()->active()->pluck('module_name')->all();
    }

    /**
     * Usuarios del equipo con el rol de administrador.
     */
    public function administrators()
    {
        return $this->users()->whereHas('roles', fn ($q) => $q->where('name', 'administrador'));
    }

    /**
     * Un equipo sin administradores es ingobernable: su único camino de vuelta
     * es el super-admin. Conviene poder comprobarlo antes de dejar que un
     * cambio de roles o de membresía lo deje así.
     */
    public function hasAdministrator(): bool
    {
        return $this->administrators()->exists();
    }

    public function hasModuleEnabled(string $moduleName): bool
    {
        return $this->modules()->active()->where('module_name', $moduleName)->exists();
    }

    /**
     * Habilita los módulos "core" para un equipo recién creado, para que no
     * quede sin ningún módulo disponible. Los no-core (antes "solo Rojo")
     * quedan deshabilitados por defecto: hay que activarlos a propósito.
     */
    public function provisionDefaultModules(): void
    {
        foreach (config('questionnaires.types') as $moduleName => $config) {
            TeamModule::firstOrCreate(
                ['team_id' => $this->id, 'module_name' => $moduleName],
                ['is_active' => $config['core']]
            );
        }
    }
}
