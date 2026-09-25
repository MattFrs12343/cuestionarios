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
     */
    public function isSuperAdmin(): bool
    {
        return $this->email === 'admin@cuestionarios.com';
    }

    /**
     * Módulos exclusivos del equipo "rojo" (= equipo "Equipe Principal" en el sistema).
     * No forman parte de UserModule::MODULES: el acceso depende únicamente de la
     * pertenencia al equipo, no de una asignación manual por usuario.
     */
    public const RED_TEAM_ONLY_MODULES = [
        'estesiometria' => 'Estesiometria',
        'tdah_infantil' => 'TDAH Infantil (SNAP-IV)',
        'tdah_adulto' => 'TDAH Adulto (ASRS-18)',
        'dinamometro' => 'Dinamômetro (Força de Preensão Manual)',
    ];

    /**
     * El equipo "rojo" del negocio se reconoce por los nombres "Rojo" o "Equipe Principal".
     */
    public function isInRedTeam(): bool
    {
        return $this->teams->contains(fn (Team $team) => in_array($team->name, ['Rojo', 'Equipe Principal']));
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
     * Verificar si el usuario tiene acceso a un módulo específico
     */
    public function hasModuleAccess(string $moduleName): bool
    {
        // Módulos exclusivos del equipo rojo: solo pertenecer al equipo da acceso,
        // sin excepción para administradores/técnicos ajenos al equipo.
        if (array_key_exists($moduleName, self::RED_TEAM_ONLY_MODULES)) {
            return $this->isInRedTeam();
        }

        // Los administradores y técnicos tienen acceso a todos los módulos
        if ($this->isAdmin() || $this->hasRole('tecnico')) {
            return true;
        }

        return $this->activeModules()
            ->forModule($moduleName)
            ->exists();
    }

    /**
     * Obtener los nombres de los módulos a los que tiene acceso el usuario
     */
    public function getAccessibleModules(): array
    {
        $modules = ($this->isAdmin() || $this->hasRole('tecnico'))
            ? array_keys(UserModule::MODULES)
            : $this->activeModules()->pluck('module_name')->toArray();

        if ($this->isInRedTeam()) {
            $modules = array_merge($modules, array_keys(self::RED_TEAM_ONLY_MODULES));
        }

        return $modules;
    }

    /**
     * Verificar si el usuario puede ser asignado a módulos (LAUDADOR o TECNICO)
     */
    public function canBeAssignedModules(): bool
    {
        return $this->hasAnyRole(['laudador', 'tecnico']);
    }
}
