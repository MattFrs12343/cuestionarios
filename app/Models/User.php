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
     *
     * Hay dos regímenes y son independientes:
     *
     * - administrador / técnico: no se les asigna módulo por módulo, ven todo
     *   lo que el plan de su equipo tenga habilitado (team_modules).
     * - laudador: lo que tenga asignado individualmente (user_modules) y
     *   nada más. Su decisión de módulo es la única que cuenta: el plan del
     *   equipo NO la veta, porque el plan solo siembra los valores iniciales
     *   de los usuarios nuevos (ver UserModuleProvisioner).
     *
     * Antes el acceso era la intersección de ambas capas, lo que hacía que
     * encender un módulo desde el panel no se notara si el plan del equipo no
     * lo tenía: la decisión del administrador quedaba anulada en silencio.
     */
    public function hasModuleAccess(string $moduleName, ?Team $team = null): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        if ($this->isAdmin()) {
            return $this->teamPlanGrants($moduleName, $team);
        }

        // Un técnico puede tener fila individual para este módulo: entonces
        // manda su fila. Sin fila, decide el plan de su equipo.
        if ($this->hasRole('tecnico')) {
            $row = $this->moduleRowFor($moduleName);

            if ($row !== null) {
                return (bool) $row->is_active;
            }

            return $this->teamPlanGrants($moduleName, $team);
        }

        // Laudador: solo su asignación individual, sin excepciones.
        return $this->activeModules()
            ->forModule($moduleName)
            ->exists();
    }

    /**
     * Fila de asignación individual para este módulo, exista o no (lo que
     * importa es si el administrador llegó a decidir sobre él).
     */
    private function moduleRowFor(string $moduleName): ?UserModule
    {
        return $this->userModules->firstWhere('module_name', $moduleName);
    }

    /**
     * ¿El plan del equipo habilita este módulo para esta persona?
     */
    private function teamPlanGrants(string $moduleName, ?Team $team): bool
    {
        $team ??= $this->teams->first();

        return $team !== null
            && $this->teams->contains('id', $team->id)
            && $team->hasModuleEnabled($moduleName);
    }

    /**
     * Módulos que el administrador tiene asignados a esta persona. Es la lista
     * autoritativa para un laudador, en el orden del catálogo (config) y sin
     * claves huérfanas que ya no correspondan a ningún cuestionario.
     */
    public function assignedModuleNames(): array
    {
        $catalog = array_keys(config('questionnaires.types'));

        $assigned = $this->activeModules()->pluck('module_name')->all();

        return array_values(array_intersect($catalog, $assigned));
    }

    /**
     * Obtener los nombres de los módulos a los que tiene acceso el usuario.
     * Ver hasModuleAccess() para la diferencia entre admin/técnico y laudador.
     */
    public function getAccessibleModules(?Team $team = null): array
    {
        if ($this->isSuperAdmin()) {
            return array_keys(config('questionnaires.types'));
        }

        if ($this->isAdmin()) {
            return $this->teamPlanModules($team);
        }

        $catalog = array_keys(config('questionnaires.types'));

        if ($this->hasRole('tecnico')) {
            $team ??= $this->teams->first();
            $inTeam = $team !== null && $this->teams->contains('id', $team->id);
            $plan = $inTeam ? $team->activeModuleNames() : [];

            $rows = $this->userModules
                ->keyBy('module_name');

            // Módulo por módulo: donde el administrador dejó una fila individual
            // manda esa fila; donde no la dejó, sigue mandando el plan del
            // equipo. Así el panel nunca muestra un interruptor que no haga nada.
            return collect($catalog)
                ->filter(function (string $moduleName) use ($rows, $plan) {
                    $row = $rows->get($moduleName);

                    if ($row !== null) {
                        return (bool) $row->is_active;
                    }

                    return in_array($moduleName, $plan, true);
                })
                ->values()
                ->all();
        }

        return $this->assignedModuleNames();
    }

    /**
     * Módulos que el plan del equipo de esta persona tiene habilitados.
     *
     * @return array<int, string>
     */
    private function teamPlanModules(?Team $team): array
    {
        $team ??= $this->teams->first();

        if (! $team || ! $this->teams->contains('id', $team->id)) {
            return [];
        }

        return collect($team->activeModuleNames())->values()->all();
    }

    /**
     * Verificar si el usuario puede ser asignado a módulos (LAUDADOR o TECNICO)
     */
    public function canBeAssignedModules(): bool
    {
        return $this->hasAnyRole(['laudador', 'tecnico']);
    }
}
