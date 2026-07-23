<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:administrador']);
    }

    public function index(Request $request)
    {
        $users = User::with(['roles', 'teams'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->role, function ($query, $role) {
                $query->whereHas('roles', function ($q) use ($role) {
                    $q->where('name', $role);
                });
            })
            ->when($request->team, function ($query, $team) {
                $query->whereHas('teams', function ($q) use ($team) {
                    $q->where('id', $team);
                });
            })
            ->when($request->status !== null, function ($query) use ($request) {
                $query->where('is_active', $request->status);
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $roles = Role::all();
        $teams = Team::all();

        return Inertia::render('Admin/Users/IndexWithFilters', [
            'users' => $users,
            'roles' => $roles,
            'teams' => $teams,
            'filters' => $request->only(['search', 'role', 'team', 'status'])
        ]);
    }

    public function create()
    {
        $roles = Role::all();
        $teams = Team::all();

        return Inertia::render('Admin/Users/Create', [
            'roles' => $roles,
            'teams' => $teams
        ]);
    }

    public function store(Request $request)
    {
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
            'teams.*' => 'exists:teams,id',
        ]);

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

        return redirect()->route('admin.users.index')
            ->with('success', __('admin.user_created_successfully'));
    }

    public function show(User $user)
    {
        $user->load(['roles', 'teams', 'createdQuestionnaires', 'editedQuestionnaires']);

        return Inertia::render('Admin/Users/Show', [
            'user' => $user
        ]);
    }

    public function edit(User $user)
    {
        $user->load(['roles', 'teams']);
        $roles = Role::all();
        $teams = Team::all();

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'roles' => $roles,
            'teams' => $teams
        ]);
    }

    public function update(Request $request, User $user)
    {
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
            'teams.*' => 'exists:teams,id',
        ]);

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
        }

        return redirect()->route('admin.users.index')
            ->with('success', __('admin.user_updated_successfully'));
    }

    public function destroy(User $user)
    {
        // Prevenir eliminación del propio usuario administrador
        if ($user->id === auth()->id()) {
            return redirect()->route('admin.users.index')
                ->with('error', __('admin.cannot_delete_own_user'));
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', __('admin.user_deleted_successfully'));
    }

    public function toggleStatus(User $user)
    {
        // Prevenir desactivación del propio usuario administrador
        if ($user->id === auth()->id()) {
            return response()->json(['error' => __('admin.cannot_deactivate_own_user')], 422);
        }

        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'success' => true,
            'message' => $user->is_active ? __('admin.user_activated') : __('admin.user_deactivated'),
            'is_active' => $user->is_active
        ]);
    }
}