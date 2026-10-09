<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Team;
use App\Services\UserModuleProvisioner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
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
    private function authorizeUserAccess(User $admin, User $target, ?array $teamIds): void
    {
        if ($teamIds === null) {
            return;
        }

        if (! $target->teams()->whereIn('teams.id', $teamIds)->exists()) {
            abort(403, 'Você não tem permissão para acessar este usuário.');
        }
    }

    /**
     * Un admin de equipo no puede administrar super-admins: podría quitarles
     * el panel o degradarlos. El super-admin es la única autoridad sobre sí.
     */
    private function authorizeNotSuperAdmin(User $admin, User $target): void
    {
        if ($admin->isSuperAdmin() || ! $target->isSuperAdmin()) {
            return;
        }

        abort(403, __('admin.cannot_manage_super_admin'));
    }

    /**
     * Solo el super-admin concede o revoca el rol de administrador. Si no,
     * cualquier admin de equipo podría auto-ascenderse (asignándose el rol a
     * sí mismo o a un cómplice) o degradar al admin que le responde.
     */
    private function authorizeAdminRoleChange(User $admin, ?User $target, ?array $newRoleIds): void
    {
        // Si el request ni siquiera trae el campo roles, no se está
        // concediendo ni revocando nada: no hay nada que autorizar aquí.
        if ($admin->isSuperAdmin() || $newRoleIds === null) {
            return;
        }

        $adminRoleId = Role::where('name', 'administrador')->value('id');

        if ($adminRoleId === null) {
            return;
        }

        $touchingAdminRole = in_array($adminRoleId, $newRoleIds, true)
            || ($target !== null && $target->roles->contains('id', $adminRoleId));

        if ($touchingAdminRole) {
            abort(403, __('admin.cannot_assign_admin_role'));
        }
    }

    /**
     * Si el usuario objetivo es hoy un administrador y este cambio le quita el
     * rol o lo saca de alguno de sus equipos, ese equipo no puede quedar sin
     * ningún administrador.
     */
    private function authorizeTeamsKeepAdministrator(User $admin, User $target, ?array $newRoleIds, ?array $newTeamIds): void
    {
        if ($admin->isSuperAdmin()) {
            return;
        }

        $adminRoleId = Role::where('name', 'administrador')->value('id');

        if ($adminRoleId === null || ! $target->roles->contains('id', $adminRoleId)) {
            return;
        }

        // El campo ausente significa "sin cambios" en esa dimensión, no "se
        // quita". Solo cuenta como remoción del rol si el request lo trae
        // explícitamente sin el id de administrador.
        $roleRemoved = $newRoleIds !== null && ! in_array($adminRoleId, $newRoleIds, true);

        // Si se quita el rol, pierde la gobernanza de TODOS sus equipos, sin
        // importar qué traiga el campo teams. Si el rol se mantiene, solo
        // importan los equipos de los que el campo teams lo saca explícitamente.
        $affectedTeamIds = $roleRemoved
            ? $target->teams->pluck('id')
            : ($newTeamIds !== null
                ? $target->teams->reject(fn ($team) => in_array($team->id, $newTeamIds, true))->pluck('id')
                : collect());

        foreach (Team::whereIn('id', $affectedTeamIds)->get() as $team) {
            $hasOtherAdministrator = $team->administrators()
                ->where('users.id', '!=', $target->id)
                ->exists();

            if (! $hasOtherAdministrator) {
                abort(403, __('admin.team_would_be_without_administrator'));
            }
        }
    }

    public function index(Request $request)
    {
        $admin = $request->user();
        $teamIds = $this->scopedTeamIds($admin);

        $users = User::with(['roles', 'teams'])
            ->when($teamIds !== null, function ($query) use ($teamIds) {
                $query->whereHas('teams', function ($q) use ($teamIds) {
                    $q->whereIn('teams.id', $teamIds);
                });
            })
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->role, function ($query, $role) {
                $query->whereHas('roles', function ($q) use ($role) {
                    $q->where('name', $role);
                });
            })
            ->when($request->team, function ($query, $team) use ($teamIds) {
                if ($teamIds === null || in_array((int) $team, $teamIds)) {
                    $query->whereHas('teams', function ($q) use ($team) {
                        $q->where('teams.id', $team);
                    });
                }
            })
            ->when($request->status !== null, function ($query) use ($request) {
                $query->where('is_active', $request->status);
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $roles = Role::all();
        $teams = $teamIds === null ? Team::all() : Team::whereIn('id', $teamIds)->get();

        return Inertia::render('Admin/Users/IndexWithFilters', [
            'users' => $users,
            'roles' => $roles,
            'teams' => $teams,
            'filters' => $request->only(['search', 'role', 'team', 'status'])
        ]);
    }

    public function create(Request $request)
    {
        $teamIds = $this->scopedTeamIds($request->user());
        $roles = Role::all();
        $teams = $teamIds === null ? Team::all() : Team::whereIn('id', $teamIds)->get();

        return Inertia::render('Admin/Users/Create', [
            'roles' => $roles,
            'teams' => $teams
        ]);
    }

    public function store(Request $request)
    {
        $teamIds = $this->scopedTeamIds($request->user());

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
            'teams' => 'array',
            'teams.*' => $teamIds === null ? 'exists:teams,id' : [Rule::in($teamIds)],
        ]);

        $this->authorizeAdminRoleChange($request->user(), null, $request->roles);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'address' => $request->address,
            'is_active' => $request->is_active ?? true,
        ]);

        if ($request->roles) {
            $user->syncRoles($request->roles);
        }

        if ($request->teams) {
            $user->teams()->sync($request->teams);
        }

        // El plan del equipo siembra los módulos con los que nace la persona.
        // Después de esto, lo que manda es su asignación individual.
        $this->provisionModulesFor($user);

        return redirect()->route('admin.users.index')
            ->with('success', __('admin.user_created_successfully'));
    }

    /**
     * Siembra los módulos del plan de cada equipo al que pertenece el usuario.
     * Solo crea lo que falta: nunca pisa una asignación previa.
     */
    private function provisionModulesFor(User $user): void
    {
        $provisioner = app(UserModuleProvisioner::class);

        $user->load('teams');

        foreach ($user->teams as $team) {
            $provisioner->provisionNewMember($user, $team);
        }
    }

    public function show(Request $request, User $user)
    {
        $admin = $request->user();
        $this->authorizeUserAccess($admin, $user, $this->scopedTeamIds($admin));

        $user->load(['roles', 'teams', 'createdQuestionnaires', 'editedQuestionnaires']);

        return Inertia::render('Admin/Users/Show', [
            'user' => $user
        ]);
    }

    public function edit(Request $request, User $user)
    {
        $admin = $request->user();
        $teamIds = $this->scopedTeamIds($admin);
        $this->authorizeUserAccess($admin, $user, $teamIds);

        $user->load(['roles', 'teams']);
        $roles = Role::all();
        $teams = $teamIds === null ? Team::all() : Team::whereIn('id', $teamIds)->get();

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'roles' => $roles,
            'teams' => $teams
        ]);
    }

    public function update(Request $request, User $user)
    {
        $admin = $request->user();
        $teamIds = $this->scopedTeamIds($admin);
        $this->authorizeUserAccess($admin, $user, $teamIds);
        $this->authorizeNotSuperAdmin($admin, $user);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
            'teams' => 'array',
            'teams.*' => $teamIds === null ? 'exists:teams,id' : [Rule::in($teamIds)],
        ]);

        $newRoleIds = $request->roles;
        $newTeamIds = $request->teams;

        $this->authorizeAdminRoleChange($admin, $user, $newRoleIds);
        $this->authorizeTeamsKeepAdministrator(
            $admin,
            $user,
            $request->has('roles') ? $newRoleIds : null,
            $request->has('teams') ? $newTeamIds : null
        );

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'is_active' => $request->is_active ?? true,
        ];

        if ($request->password) {
            $userData['password'] = Hash::make($request->password);
        }

        $user->update($userData);

        if ($request->has('roles')) {
            $user->syncRoles($request->roles);
        }

        if ($request->has('teams')) {
            $user->teams()->sync($request->teams);

            // Un usuario que acaba de entrar a un equipo nace con los módulos
            // del plan de ese equipo; los que ya tenía de antes no se tocan.
            $this->provisionModulesFor($user);
        }

        return redirect()->route('admin.users.index')
            ->with('success', __('admin.user_updated_successfully'));
    }

    public function destroy(Request $request, User $user)
    {
        $admin = $request->user();
        $this->authorizeUserAccess($admin, $user, $this->scopedTeamIds($admin));
        $this->authorizeNotSuperAdmin($admin, $user);

        // Prevenir eliminación del propio usuario administrador
        if ($user->id === auth()->id()) {
            return redirect()->route('admin.users.index')
                ->with('error', __('admin.cannot_delete_own_user'));
        }

        // Borrar al único administrador dejaría su equipo ingobernable.
        $this->authorizeTeamsKeepAdministrator($admin, $user, [], null);

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', __('admin.user_deleted_successfully'));
    }

    public function toggleStatus(Request $request, User $user)
    {
        $admin = $request->user();
        $this->authorizeUserAccess($admin, $user, $this->scopedTeamIds($admin));
        $this->authorizeNotSuperAdmin($admin, $user);

        // Prevenir desactivación del propio usuario administrador
        if ($user->id === auth()->id()) {
            return response()->json(['error' => __('admin.cannot_deactivate_own_user')], 422);
        }

        // Desactivar al único administrador dejaría su equipo sin nadie
        // operativo aunque conserve el rol.
        if ($user->is_active) {
            $this->authorizeTeamsKeepAdministrator($admin, $user, null, null);
        }

        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'success' => true,
            'message' => $user->is_active ? __('admin.user_activated') : __('admin.user_deactivated'),
            'is_active' => $user->is_active
        ]);
    }
}
