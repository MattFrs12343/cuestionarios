<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    public function __construct()
    {
        // Los roles/permisos son globales (no por equipo): un admin de un equipo
        // podía editar permisos que afectan a todos los equipos. Solo el super-admin
        // gestiona roles.
        $this->middleware(['auth', 'admin.access']);
        $this->middleware(function ($request, $next) {
            abort_unless($request->user()->isSuperAdmin(), 403, 'Solo el super-admin puede gestionar roles.');
            return $next($request);
        });
    }

    public function index()
    {
        $roles = Role::with('permissions')->withCount('users')->get();

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles
        ]);
    }

    public function create()
    {
        $permissions = Permission::all();

        return Inertia::render('Admin/Roles/Create', [
            'permissions' => $permissions
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::create(['name' => $request->name]);

        if ($request->permissions) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->route('admin.roles.index')
            ->with('success', __('admin.role_created_successfully'));
    }

    public function edit(Role $role)
    {
        $role->load('permissions');
        $permissions = Permission::all();

        return Inertia::render('Admin/Roles/Edit', [
            'role' => $role,
            'permissions' => $permissions
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->update(['name' => $request->name]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->route('admin.roles.index')
            ->with('success', __('admin.role_updated_successfully'));
    }

    public function destroy(Role $role)
    {
        // Prevenir eliminación del rol administrador
        if ($role->name === 'administrador') {
            return redirect()->route('admin.roles.index')
                ->with('error', __('admin.cannot_delete_admin_role'));
        }

        $role->delete();

        return redirect()->route('admin.roles.index')
            ->with('success', __('admin.role_deleted_successfully'));
    }
}