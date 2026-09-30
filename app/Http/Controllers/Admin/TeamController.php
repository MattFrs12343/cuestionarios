<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\User;
use App\Models\UserModule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class TeamController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'admin.access']);
    }

    /**
     * Aborta si el equipo no está entre los del admin (los super-admin nunca son bloqueados).
     */
    private function authorizeTeamAccess(User $admin, Team $team): void
    {
        if ($admin->isSuperAdmin()) {
            return;
        }

        if (! $admin->teams->contains('id', $team->id)) {
            abort(403, 'No tienes permisos para acceder a este equipo.');
        }
    }

    public function index(Request $request)
    {
        $admin = $request->user();

        $query = Team::withCount('users');

        if (! $admin->isSuperAdmin()) {
            $query->whereIn('id', $admin->teams()->pluck('teams.id'));
        }

        $teams = $query->get();

        return Inertia::render('Admin/Teams/Index', [
            'teams' => $teams,
            'isSuperAdmin' => $admin->isSuperAdmin(),
        ]);
    }

    /**
     * Usuarios que un admin puede ver/asignar al construir un equipo.
     * Un admin de equipo NO puede ver usuarios de equipos ajenos (solo su propio
     * equipo y usuarios sin equipo); el super-admin ve a todos.
     */
    private function assignableUsersFor(User $admin)
    {
        if ($admin->isSuperAdmin()) {
            return User::active()->get();
        }

        $teamIds = $admin->teams()->pluck('teams.id');

        return User::active()
            ->where(function ($q) use ($teamIds) {
                $q->whereHas('teams', fn ($q2) => $q2->whereIn('teams.id', $teamIds))
                  ->orDoesntHave('teams');
            })
            ->get();
    }

    public function create(Request $request)
    {
        $admin = $request->user();

        return Inertia::render('Admin/Teams/Create', [
            'users' => $this->assignableUsersFor($admin),
            'roles' => $this->provisionableRoles(),
        ]);
    }

    /**
     * Roles con los que se puede armar un equipo. Se leen de la base (y no de
     * una lista fija en código) para que agregar un rol nuevo en el panel de
     * roles lo vuelva inmediatamente disponible al dar de alta un equipo.
     */
    private function provisionableRoles()
    {
        return Role::orderBy('name')->get(['id', 'name']);
    }

    public function store(Request $request)
    {
        abort_unless($request->user()->isSuperAdmin(), 403, 'Solo el super-admin puede crear equipos.');

        $request->validate([
            'name' => 'required|string|max:255|unique:teams',
            // Miembros nuevos creados en el mismo paso que el equipo.
            'members' => 'array',
            'members.*.name' => 'required|string|max:255',
            'members.*.email' => 'required|string|email|max:255|unique:users,email',
            'members.*.password' => 'required|string|min:8|confirmed',
            'members.*.role' => ['required', 'string', Rule::exists('roles', 'name')],
            // Usuarios ya existentes a los que se agrega al equipo.
            'users' => 'array',
            'users.*' => 'exists:users,id',
        ]);

        $existingIds = $request->input('users', []);
        $members = $request->input('members', []);

        // La regla unique mira la base, no el resto del payload: dos filas con
        // el mismo email pasarían la validación y la segunda insertaría
        // reventando la transacción con un 500. Se chequea explícitamente.
        $duplicatedEmails = collect($members)
            ->pluck('email')
            ->duplicates()
            ->values();

        if ($duplicatedEmails->isNotEmpty()) {
            return back()
                ->withInput()
                ->withErrors([
                    'members' => __('admin.team_duplicate_member_email', [
                        'emails' => $duplicatedEmails->implode(', '),
                    ]),
                ]);
        }

        $administratorCount = User::whereIn('id', $existingIds)
            ->whereHas('roles', fn ($q) => $q->where('name', 'administrador'))
            ->count()
            + collect($members)->where('role', 'administrador')->count();

        // Un equipo sin administrador queda ingobernable para todos menos el
        // super-admin. Se bloquea acá en vez de dejar el problema para después.
        if ($administratorCount === 0) {
            return back()
                ->withInput()
                ->withErrors(['members' => __('admin.team_needs_administrator')]);
        }

        DB::transaction(function () use ($request, $existingIds, $members) {
            $team = Team::create(['name' => $request->name]);

            if ($existingIds) {
                $team->users()->sync($existingIds);
            }

            foreach ($members as $data) {
                $user = User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => Hash::make($data['password']),
                    'is_active' => true,
                ]);

                $user->assignRole($data['role']);
                $user->teams()->attach($team->id);
            }
        });

        return redirect()->route('admin.teams.index')
            ->with('success', __('admin.team_created_successfully'));
    }

    public function show(Request $request, Team $team)
    {
        $this->authorizeTeamAccess($request->user(), $team);

        $team->load('users');

        return Inertia::render('Admin/Teams/Show', [
            'team' => $team
        ]);
    }

    public function edit(Request $request, Team $team)
    {
        $this->authorizeTeamAccess($request->user(), $team);

        $team->load('users');
        $users = $this->assignableUsersFor($request->user());
        $admin = $request->user();

        return Inertia::render('Admin/Teams/Edit', [
            'team' => $team,
            'users' => $users,
            'isSuperAdmin' => $admin->isSuperAdmin(),
            'moduleCatalog' => $admin->isSuperAdmin() ? UserModule::labels() : null,
            'teamModules' => $admin->isSuperAdmin() ? $team->modules()->pluck('is_active', 'module_name') : null,
        ]);
    }

    /**
     * Habilita/deshabilita módulos para un equipo (el "plan" comercial).
     * Solo el super-admin decide qué módulos tiene disponibles cada equipo.
     */
    public function updateModules(Request $request, Team $team)
    {
        abort_unless($request->user()->isSuperAdmin(), 403, 'Solo el super-admin puede gestionar los módulos de un equipo.');

        $validModules = array_keys(UserModule::labels());

        $request->validate([
            'modules' => 'required|array',
            'modules.*' => 'boolean',
        ]);

        foreach ($request->input('modules', []) as $moduleName => $isActive) {
            if (! in_array($moduleName, $validModules, true)) {
                continue;
            }

            $team->modules()->updateOrCreate(
                ['module_name' => $moduleName],
                ['is_active' => (bool) $isActive]
            );
        }

        return redirect()->route('admin.teams.edit', $team->id)
            ->with('success', 'Módulos del equipo actualizados correctamente.');
    }

    /**
     * Un admin de equipo no puede "adoptar" usuarios que viven en equipos
     * ajenos: como un usuario puede pertenecer a varios equipos, el sync de
     * este endpoint le robaría miembros a la competencia y los movería sin
     * que el otro equipo se entere. Solo se permiten usuarios que ya están en
     * alguno de los equipos del admin, o que todavía no pertenecen a ninguno.
     *
     * El super-admin sí puede: administra todos los equipos por definición.
     */
    private function authorizeNoCrossTeamMove(User $admin, Team $team, array $userIds): void
    {
        if ($admin->isSuperAdmin() || $userIds === []) {
            return;
        }

        $ownTeamIds = $admin->teams()->pluck('teams.id')->all();

        // Ilegales = los que NO están en ninguno de los equipos del admin, pero
        // sí están en al menos un equipo (o sea: viven en equipos ajenos).
        $forbidden = User::whereIn('id', $userIds)
            ->whereDoesntHave('teams', fn ($q) => $q->whereIn('teams.id', $ownTeamIds))
            ->whereHas('teams')
            ->pluck('id')
            ->all();

        if ($forbidden !== []) {
            abort(403, __('admin.cannot_move_users_from_other_teams'));
        }
    }

    /**
     * Tras aplicar el sync, el equipo debe seguir teniendo al menos un
     * administrador, o quedaría ingobernable para todos menos el super-admin.
     * Solo se exige a los admins de equipo: el super-admin siempre puede
     * entrar a cualquier equipo y es la válvula de escape.
     */
    private function authorizeTeamKeepsAdministrator(User $admin, Team $team, array $userIds): void
    {
        if ($admin->isSuperAdmin()) {
            return;
        }

        $remaining = User::whereIn('id', $userIds)
            ->whereHas('roles', fn ($q) => $q->where('name', 'administrador'))
            ->exists();

        if (! $remaining) {
            abort(403, __('admin.team_would_be_without_administrator'));
        }
    }

    public function update(Request $request, Team $team)
    {
        $admin = $request->user();
        $this->authorizeTeamAccess($admin, $team);

        $request->validate([
            'name' => 'required|string|max:255|unique:teams,name,' . $team->id,
            'users' => 'array',
            'users.*' => 'exists:users,id',
        ]);

        $team->update(['name' => $request->name]);

        if ($request->has('users')) {
            $userIds = $request->input('users', []);

            $this->authorizeNoCrossTeamMove($admin, $team, $userIds);
            $this->authorizeTeamKeepsAdministrator($admin, $team, $userIds);

            $team->users()->sync($userIds);
        }

        return redirect()->route('admin.teams.index')
            ->with('success', __('admin.team_updated_successfully'));
    }

    public function destroy(Request $request, Team $team)
    {
        abort_unless($request->user()->isSuperAdmin(), 403, 'Solo el super-admin puede eliminar equipos.');

        $team->delete();

        return redirect()->route('admin.teams.index')
            ->with('success', __('admin.team_deleted_successfully'));
    }
}
