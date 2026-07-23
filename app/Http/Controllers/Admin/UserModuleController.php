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
        $this->middleware('role:administrador');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = $request->get('search');
        $role = $request->get('role');

        $users = User::with(['roles', 'activeModules'])
            ->whereHas('roles', function ($query) {
                $query->whereIn('name', ['laudador', 'tecnico']);
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

        return Inertia::render('Admin/UserModules/Index', [
            'users' => $users,
            'modules' => UserModule::MODULES,
            'filters' => [
                'search' => $search,
                'role' => $role,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user): Response|RedirectResponse
    {
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

        return Inertia::render('Admin/UserModules/Edit', [
            'user' => $user,
            'modules' => UserModule::MODULES,
            'assignedModules' => $assignedModules,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
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

        $request->validate([
            'modules' => 'required|array',
            'modules.*' => 'boolean',
        ]);

        $modules = $request->get('modules', []);

        DB::transaction(function () use ($user, $modules, $request) {
            // Obtener módulos actuales del usuario
            $currentModules = $user->userModules->keyBy('module_name');

            foreach (UserModule::MODULES as $moduleName => $moduleDisplayName) {
                $shouldHaveAccess = isset($modules[$moduleName]) && $modules[$moduleName];
                $currentlyHasAccess = $currentModules->has($moduleName) && $currentModules[$moduleName]->is_active;

                if ($shouldHaveAccess && !$currentlyHasAccess) {
                    // Asignar o reactivar módulo
                    UserModule::updateOrCreate(
                        [
                            'user_id' => $user->id,
                            'module_name' => $moduleName,
                        ],
                        [
                            'is_active' => true,
                            'assigned_by' => $request->user()->id,
                        ]
                    );
                } elseif (!$shouldHaveAccess && $currentlyHasAccess) {
                    // Desactivar módulo
                    $currentModules[$moduleName]->update(['is_active' => false]);
                }
            }
        });

        return redirect()
            ->route('admin.user-modules.index')
            ->with('success', 'Módulos actualizados correctamente para ' . $user->name);
    }

    /**
     * Activar/desactivar un módulo específico vía AJAX
     */
    public function toggle(Request $request, User $user)
    {
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
            'module_name' => 'required|string|in:' . implode(',', array_keys(UserModule::MODULES)),
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
