<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:administrador']);
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
            'teams' => $teams
        ]);
    }

    public function create()
    {
        $users = User::active()->get();

        return Inertia::render('Admin/Teams/Create', [
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:teams',
            'users' => 'array',
            'users.*' => 'exists:users,id',
        ]);

        $team = Team::create(['name' => $request->name]);

        if ($request->users) {
            $team->users()->sync($request->users);
        }

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
        $users = User::active()->get();

        return Inertia::render('Admin/Teams/Edit', [
            'team' => $team,
            'users' => $users
        ]);
    }

    public function update(Request $request, Team $team)
    {
        $this->authorizeTeamAccess($request->user(), $team);

        $request->validate([
            'name' => 'required|string|max:255|unique:teams,name,' . $team->id,
            'users' => 'array',
            'users.*' => 'exists:users,id',
        ]);

        $team->update(['name' => $request->name]);

        if ($request->has('users')) {
            $team->users()->sync($request->users);
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
