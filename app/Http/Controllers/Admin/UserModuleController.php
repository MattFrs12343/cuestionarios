<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserModule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UserModuleController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'admin.access']);
    }

    /**
     * IDs de equipos a los que el admin puede ver/gestionar. Null = sin restricción (super-admin).
     */
    private function scopedTeamIds(User $admin): ?array
    {
        if ($admin->isSuperAdmin()) {
            return null;
        }

        return $admin->teams()->pluck('teams.id')->toArray();
    }

    /**
     * Aborta si el usuario objetivo no pertenece a ningún equipo del admin.
     */
    private function authorizeUserAccess(User $admin, User $target): void
    {
        $teamIds = $this->scopedTeamIds($admin);

        if ($teamIds !== null && ! $target->teams()->whereIn('teams.id', $teamIds)->exists()) {
            abort(403, 'Você não tem permissão para acessar este usuário.');
        }
    }

    /**
     * Catálogo completo de módulos (module_name => label) que se le puede
     * encender o apagar a este usuario.
     *
     * Antes devolvía solo los módulos que el plan (team_modules) de alguno de
     * sus equipos tuviera habilitados. Eso convertía al plan en un techo y
     * hacía la decisión del administrador ilusoria: encender un módulo que el
     * plan no tenía no se reflejaba en el usuario (y el plan sí lo ocultaba,
     * en silencio, porque la intersección de User::getAccessibleModules()
     * ganaba siempre). Ahora el plan es solo el valor inicial de los usuarios
     * nuevos (ver UserModuleProvisioner) y por usuario decide la asignación.
     */
    private function availableModulesFor(): array
    {
        return UserModule::labels();
    }

    /**
     * Módulos que el plan de alguno de los equipos del usuario tiene
     * habilitados. No restringen nada: solo se le pasan a la interfaz para que
     * pueda distinguir "viene del plan del equipo" de "decisión del
     * administrador", que es información, no un filtro.
     */
    private function planDefaultsFor(User $user): array
    {
        return $user->teams->flatMap(fn ($team) => $team->activeModuleNames())
            ->unique()
            ->values()
            ->all();
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = $request->get('search');
        $role = $request->get('role');
        $teamIds = $this->scopedTeamIds($request->user());

        $users = User::with(['roles', 'userModules'])
            ->whereHas('roles', function ($query) {
                $query->whereIn('name', ['laudador', 'tecnico']);
            })
            ->when($teamIds !== null, function ($query) use ($teamIds) {
                $query->whereHas('teams', function ($q) use ($teamIds) {
                    $q->whereIn('teams.id', $teamIds);
                });
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($role, function ($query, $role) {
                $query->whereHas('roles', function ($q) use ($role) {
                    $q->where('name', $role);
                });
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        // Lo que la persona ve de verdad ahora mismo, con el mismo cálculo que
        // aplica el acceso real (User::getAccessibleModules). Mostrar una cosa
        // y aplicar otra es lo que hacía que esta pantalla no cuadrase.
        $users->getCollection()->each(function (User $listed) {
            $listed->setAttribute('effective_modules', $listed->getAccessibleModules());
        });

        return Inertia::render('Admin/UserModules/Index', [
            'users' => $users,
            'modules' => UserModule::labels(),
            'filters' => [
                'search' => $search,
                'role' => $role,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, User $user): Response|RedirectResponse
    {
        $this->authorizeUserAccess($request->user(), $user);

        // Verificar que el usuario puede ser asignado a módulos
        if (!$user->canBeAssignedModules()) {
            $userRoles = $user->roles->pluck('name')->join(', ') ?: 'Sin roles';
            
            if ($user->isAdmin()) {
                return redirect()
                    ->route('admin.user-modules.index')
                    ->with('error', "Los administradores tienen acceso completo a todos los módulos automáticamente. No necesitan asignación específica. Usuario: {$user->name} (Roles: {$userRoles})");
            }
            
            return redirect()
                ->route('admin.user-modules.index')
                ->with('error', "El usuario '{$user->name}' no puede ser asignado a módulos. Solo usuarios con roles LAUDADOR o TECNICO pueden ser asignados. Roles actuales: {$userRoles}");
        }

        $user->load(['roles', 'userModules.assignedBy']);

        $assignedModules = $user->userModules->keyBy('module_name');

        // El interruptor tiene que abrirse en lo que la persona ve HOY. Para un
        // técnico, un módulo que solo viene del plan no tiene fila propia, así
        // que sin esto la pantalla lo mostraría apagado y "guardar" sin tocar
        // nada se lo quitaría de encima.
        $effective = $user->getAccessibleModules();

        return Inertia::render('Admin/UserModules/Edit', [
            'user' => $user,
            'modules' => $this->availableModulesFor(),
            'assignedModules' => $assignedModules,
            'planDefaults' => $this->planDefaultsFor($user),
            'effectiveModules' => $effective,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorizeUserAccess($request->user(), $user);

        // Verificar que el usuario puede ser asignado a módulos
        if (!$user->canBeAssignedModules()) {
            $userRoles = $user->roles->pluck('name')->join(', ') ?: 'Sin roles';
            
            if ($user->isAdmin()) {
                return redirect()
                    ->route('admin.user-modules.index')
                    ->with('error', "Los administradores tienen acceso completo a todos los módulos automáticamente. No necesitan asignación específica. Usuario: {$user->name} (Roles: {$userRoles})");
            }
            
            return redirect()
                ->route('admin.user-modules.index')
                ->with('error', "El usuario '{$user->name}' no puede ser asignado a módulos. Solo usuarios con roles LAUDADOR o TECNICO pueden ser asignados. Roles actuales: {$userRoles}");
        }

        $catalog = $this->availableModulesFor();

        $request->validate([
            'modules' => 'required|array',
            'modules.*' => 'boolean',
        ]);

        $requested = $request->input('modules', []);

        $activated = 0;
        $deactivated = 0;

        DB::transaction(function () use ($user, $catalog, $requested, $request, &$activated, &$deactivated) {
            $currentModules = $user->userModules()->get()->keyBy('module_name');

            // Se recorre el catálogo COMPLETO, no solo las claves enviadas: así
            // un módulo ausente en el payload queda explícitamente apagado y
            // nunca sobrevive por una omisión del formulario.
            foreach (array_keys($catalog) as $moduleName) {
                $shouldHaveAccess = (bool) ($requested[$moduleName] ?? false);
                $current = $currentModules->get($moduleName);
                $currentlyHasAccess = (bool) ($current?->is_active);

                if ($shouldHaveAccess === $currentlyHasAccess && $current !== null) {
                    continue;
                }

                UserModule::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'module_name' => $moduleName,
                    ],
                    [
                        'is_active' => $shouldHaveAccess,
                        'assigned_by' => $request->user()->id,
                    ]
                );

                $shouldHaveAccess ? $activated++ : $deactivated++;
            }
        });

        $summary = collect([
            $activated > 0 ? "{$activated} módulo(s) encendido(s)" : null,
            $deactivated > 0 ? "{$deactivated} módulo(s) apagado(s)" : null,
        ])->filter()->implode(', ');

        return redirect()
            ->route('admin.user-modules.index')
            ->with(
                'success',
                $summary !== ''
                    ? "Módulos actualizados para {$user->name}: {$summary}."
                    : "No hubo cambios en los módulos de {$user->name}."
            );
    }

    /**
     * Activar/desactivar un módulo específico vía AJAX
     */
    public function toggle(Request $request, User $user)
    {
        $this->authorizeUserAccess($request->user(), $user);

        if (!$user->canBeAssignedModules()) {
            $userRoles = $user->roles->pluck('name')->join(', ') ?: 'Sin roles';
            
            if ($user->isAdmin()) {
                return response()->json([
                    'error' => "Los administradores tienen acceso completo a todos los módulos automáticamente. Usuario: {$user->name} (Roles: {$userRoles})"
                ], 403);
            }
            
            return response()->json([
                'error' => "El usuario '{$user->name}' no puede ser asignado a módulos. Solo usuarios con roles LAUDADOR o TECNICO pueden ser asignados. Roles actuales: {$userRoles}"
            ], 403);
        }

        $request->validate([
            'module_name' => 'required|string|in:' . implode(',', array_keys($this->availableModulesFor())),
            'is_active' => 'required|boolean',
        ]);

        $moduleName = $request->get('module_name');
        $isActive = $request->get('is_active');

        $userModule = UserModule::updateOrCreate(
            [
                'user_id' => $user->id,
                'module_name' => $moduleName,
            ],
            [
                'is_active' => $isActive,
                'assigned_by' => $request->user()->id,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => $isActive 
                ? "Módulo {$userModule->module_display_name} activado para {$user->name}"
                : "Módulo {$userModule->module_display_name} desactivado para {$user->name}",
        ]);
    }
}
