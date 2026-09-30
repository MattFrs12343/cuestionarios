<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',
        'is_active',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
            'is_active' => 'boolean',
            'is_super_admin' => 'boolean',
        ];
    }

    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class);
    }

    public function createdQuestionnaires(): HasMany
    {
        return $this->hasMany(Questionnaire::class, 'created_by');
    }

    public function editedQuestionnaires(): HasMany
    {
        return $this->hasMany(Questionnaire::class, 'updated_by');
    }

    /**
     * Check if user is administrator
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('administrador');
    }

    /**
     * El super-admin global ve y gestiona todo, sin restricción por equipo.
     *
     * La autoridad vive en la columna users.is_super_admin. El email de
     * bootstrap solo concede privilegios si la base NO tiene todavía ningún
     * super-admin (instalación inicial, o para no dejar el sistema sin
     * administrador si alguien queda sin ninguno): en cuanto existe uno
     * marcado, el email deja de importar.
     */
    public function isSuperAdmin(): bool
    {
        if ($this->is_super_admin) {
            return true;
        }

        if ($this->email !== config('app.super_admin_email')) {
            return false;
        }

        return ! static::query()->where('is_super_admin', true)->exists();
    }

    /**
     * Scope for active users
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Update last login timestamp
     */
    public function updateLastLogin()
    {
        $this->update(['last_login_at' => now()]);
    }

    /**
     * Relación con los módulos asignados al usuario
     */
    public function userModules(): HasMany
    {
        return $this->hasMany(UserModule::class);
    }

    /**
     * Relación con los módulos activos asignados al usuario
     */
    public function activeModules(): HasMany
    {
        return $this->hasMany(UserModule::class)->active();
    }

    /**
     * Verificar si el usuario tiene acceso a un módulo específico.
     * El módulo tiene que estar habilitado para el equipo ACTUAL del usuario
     * (team_modules, el "plan" del equipo) Y, si no es admin/técnico,
     * asignado individualmente vía UserModule.
     *
     * Se evalúa contra un único equipo (el actual, de la sesión) y no contra
     * la unión de todos los equipos del usuario: alguien en varios equipos
     * (ej. Rojo + Verde + Azul) solo debe ver lo que corresponde al equipo
     * con el que está trabajando en este momento, no todo combinado.
     */
    public function hasModuleAccess(string $moduleName, ?Team $team = null): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        $team ??= $this->teams->first();

        if (! $team || ! $this->teams->contains('id', $team->id) || ! $team->hasModuleEnabled($moduleName)) {
            return false;
        }

        if ($this->isAdmin() || $this->hasRole('tecnico')) {
            return true;
        }

        return $this->activeModules()
            ->forModule($moduleName)
            ->exists();
    }

    /**
     * Obtener los nombres de los módulos a los que tiene acceso el usuario
     * en el equipo dado (por defecto, el primero si no se especifica).
     * Ver hasModuleAccess() para el porqué de evaluar un solo equipo.
     */
    public function getAccessibleModules(?Team $team = null): array
    {
        if ($this->isSuperAdmin()) {
            return array_keys(config('questionnaires.types'));
        }

        $team ??= $this->teams->first();

        if (! $team || ! $this->teams->contains('id', $team->id)) {
            return [];
        }

        $teamModules = collect($team->activeModuleNames());

        if ($this->isAdmin() || $this->hasRole('tecnico')) {
            return $teamModules->values()->all();
        }

        $userModules = $this->activeModules()->pluck('module_name');

        return $teamModules->intersect($userModules)->values()->all();
    }

    /**
     * Verificar si el usuario puede ser asignado a módulos (LAUDADOR o TECNICO)
     */
    public function canBeAssignedModules(): bool
    {
        return $this->hasAnyRole(['laudador', 'tecnico']);
    }
}
