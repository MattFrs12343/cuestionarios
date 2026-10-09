<?php

namespace Tests\Feature;

use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Garantiza que dar de alta equipos y usuarios siga siendo fácil de hacer en el
 * futuro, sin abrir las puertas que permitirían:
 *
 *  - dejar un equipo ingobernable (sin ningún administrador);
 *  - que un admin de equipo se auto-asigne el rol de administrador;
 *  - que un admin de equipo "robe" usuarios que viven en equipos ajenos;
 *  - que un admin de equipo administre a un super-admin.
 *
 * Y que el alta de un equipo con su gente completa funcione en un solo paso.
 */
class TeamAndUserProvisioningTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['administrador', 'tecnico', 'laudador'] as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }
    }

    /**
     * is_super_admin está fuera de $fillable a propósito (para que ningún
     * payload de request pueda auto-ascenderse), y este proyecto no usa
     * preventSilentlyDiscardingAttributes(), así que hay que setearlo
     * explícitamente con forceFill.
     */
    private function makeSuperAdmin(): User
    {
        $user = User::factory()->create();
        $user->forceFill(['is_super_admin' => true])->save();

        return $user->fresh();
    }

    private function makeTeamAdmin(Team $team): User
    {
        $user = User::factory()->create();
        $user->assignRole('administrador');
        $user->teams()->attach($team);

        return $user;
    }

    private function makeMember(Team $team, string $role = 'laudador'): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);
        $user->teams()->attach($team);

        return $user;
    }

    private function roleId(string $name): int
    {
        return Role::where('name', $name)->value('id');
    }

    private function memberPayload(string $name, string $email, string $role): array
    {
        return [
            'name' => $name,
            'email' => $email,
            'password' => 'secreta123',
            'password_confirmation' => 'secreta123',
            'role' => $role,
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Super-admin por columna, no por email hardcodeado                   */
    /* ------------------------------------------------------------------ */

    public function test_is_super_admin_reads_the_column_not_the_email(): void
    {
        $user = User::factory()->create();
        $user->forceFill([
            'is_super_admin' => true,
            'email' => 'cualquiera@ejemplo.com',
        ])->save();

        $this->assertTrue($user->fresh()->isSuperAdmin());
    }

    public function test_bootstrap_email_only_grants_super_admin_while_there_is_none(): void
    {
        config(['app.super_admin_email' => 'bootstrap@ejemplo.com']);

        $bootstrap = User::factory()->create(['email' => 'bootstrap@ejemplo.com']);

        // Nadie marcado: el email de bootstrap evita quedar sin administración.
        $this->assertTrue($bootstrap->fresh()->isSuperAdmin());

        $this->makeSuperAdmin();

        // Ya hay un super-admin con columna: el email deja de conceder nada.
        $this->assertFalse($bootstrap->fresh()->isSuperAdmin());
    }

    public function test_regular_user_is_not_super_admin(): void
    {
        $this->assertFalse(User::factory()->create()->isSuperAdmin());
    }

    /* ------------------------------------------------------------------ */
    /* Alta de equipo con su gente en un solo paso                         */
    /* ------------------------------------------------------------------ */

    public function test_team_can_be_created_with_all_its_members_in_one_step(): void
    {
        $superAdmin = $this->makeSuperAdmin();

        $response = $this->actingAs($superAdmin)->post(route('admin.teams.store'), [
            'name' => 'Equipo Verde',
            'members' => [
                $this->memberPayload('Ana Admin', 'ana@ejemplo.com', 'administrador'),
                $this->memberPayload('Tito Tecnico', 'tito@ejemplo.com', 'tecnico'),
                $this->memberPayload('Lau Laudador', 'lau@ejemplo.com', 'laudador'),
            ],
        ]);

        $response->assertRedirect(route('admin.teams.index'));

        $team = Team::where('name', 'Equipo Verde')->firstOrFail();

        $this->assertSame(3, $team->users()->count());
        $this->assertTrue($team->hasAdministrator());
        $this->assertDatabaseHas('users', ['email' => 'ana@ejemplo.com']);
        $this->assertSame(
            'administrador',
            User::where('email', 'ana@ejemplo.com')->firstOrFail()->getRoleNames()->first()
        );
        $this->assertSame(
            'laudador',
            User::where('email', 'lau@ejemplo.com')->firstOrFail()->getRoleNames()->first()
        );
    }

    public function test_new_members_survive_the_existing_users_sync(): void
    {
        $superAdmin = $this->makeSuperAdmin();
        $existing = $this->makeMember(Team::factory()->create());

        $this->actingAs($superAdmin)->post(route('admin.teams.store'), [
            'name' => 'Equipo Azul',
            'users' => [$existing->id],
            'members' => [
                $this->memberPayload('Ana Admin', 'ana@ejemplo.com', 'administrador'),
            ],
        ])->assertRedirect(route('admin.teams.index'));

        $team = Team::where('name', 'Equipo Azul')->firstOrFail();

        // El miembro nuevo y el existente quedan ambos dentro: el sync() tiene
        // que correr ANTES de crearlos, o los borraría.
        $this->assertSame(2, $team->users()->count());
    }

    public function test_team_without_administrator_is_rejected(): void
    {
        $superAdmin = $this->makeSuperAdmin();

        $this->actingAs($superAdmin)->post(route('admin.teams.store'), [
            'name' => 'Equipo Sin Admin',
            'members' => [
                $this->memberPayload('Lau Laudador', 'lau@ejemplo.com', 'laudador'),
            ],
        ])->assertSessionHasErrors('members');

        // Y no debe quedar usuario huérfano creado a medias.
        $this->assertDatabaseMissing('teams', ['name' => 'Equipo Sin Admin']);
        $this->assertDatabaseMissing('users', ['email' => 'lau@ejemplo.com']);
    }

    public function test_duplicate_member_emails_are_reported_without_a_500(): void
    {
        $superAdmin = $this->makeSuperAdmin();

        $this->actingAs($superAdmin)->post(route('admin.teams.store'), [
            'name' => 'Equipo Repetido',
            'members' => [
                $this->memberPayload('Ana', 'mismo@ejemplo.com', 'administrador'),
                $this->memberPayload('Another Ana', 'mismo@ejemplo.com', 'laudador'),
            ],
        ])->assertSessionHasErrors('members');

        $this->assertDatabaseMissing('teams', ['name' => 'Equipo Repetido']);
        $this->assertDatabaseMissing('users', ['email' => 'mismo@ejemplo.com']);
    }

    public function test_team_can_be_created_with_an_existing_administrator(): void
    {
        $superAdmin = $this->makeSuperAdmin();
        $existingAdmin = $this->makeMember(Team::factory()->create(), 'administrador');

        $this->actingAs($superAdmin)->post(route('admin.teams.store'), [
            'name' => 'Equipo Reutilizado',
            'users' => [$existingAdmin->id],
        ])->assertRedirect(route('admin.teams.index'));

        $this->assertDatabaseHas('teams', ['name' => 'Equipo Reutilizado']);
    }

    public function test_non_super_admin_cannot_create_teams(): void
    {
        $teamAdmin = $this->makeTeamAdmin(Team::factory()->create());

        $this->actingAs($teamAdmin)->post(route('admin.teams.store'), [
            'name' => 'Equipo Intruso',
            'members' => [
                $this->memberPayload('Ana Admin', 'ana@ejemplo.com', 'administrador'),
            ],
        ])->assertForbidden();

        $this->assertDatabaseMissing('teams', ['name' => 'Equipo Intruso']);
    }

    /* ------------------------------------------------------------------ */
    /* Un equipo siempre conserva un administrador                         */
    /* ------------------------------------------------------------------ */

    public function test_team_admin_cannot_remove_the_last_administrator_via_team_update(): void
    {
        $team = Team::factory()->create();
        $teamAdmin = $this->makeTeamAdmin($team);
        $laudador = $this->makeMember($team, 'laudador');

        $this->actingAs($teamAdmin)->put(route('admin.teams.update', $team), [
            'name' => $team->name,
            'users' => [$laudador->id],
        ])->assertForbidden();

        $this->assertTrue($team->fresh()->users()->where('users.id', $teamAdmin->id)->exists());
    }

    public function test_team_admin_can_hand_the_team_over_to_another_administrator(): void
    {
        $team = Team::factory()->create();
        $teamAdmin = $this->makeTeamAdmin($team);
        $newAdmin = $this->makeMember($team, 'administrador');

        $this->actingAs($teamAdmin)->put(route('admin.teams.update', $team), [
            'name' => $team->name,
            'users' => [$newAdmin->id],
        ])->assertRedirect(route('admin.teams.index'));

        $this->assertFalse($team->fresh()->users()->where('users.id', $teamAdmin->id)->exists());
        $this->assertTrue($team->fresh()->hasAdministrator());
    }

    public function test_team_admin_cannot_strip_the_admin_role_from_the_only_administrator(): void
    {
        $team = Team::factory()->create();
        $teamAdmin = $this->makeTeamAdmin($team);

        $this->actingAs($teamAdmin)->put(route('admin.users.update', $teamAdmin), [
            'name' => $teamAdmin->name,
            'email' => $teamAdmin->email,
            'roles' => [$this->roleId('laudador')],
            'teams' => [$team->id],
        ])->assertForbidden();

        $this->assertTrue($teamAdmin->fresh()->hasRole('administrador'));
    }

    public function test_team_admin_cannot_delete_a_user_who_is_the_last_admin_of_one_of_their_teams(): void
    {
        // El actor administra el equipo A. El objetivo es miembro de A (para
        // que el actor tenga permiso para gestionarlo) y admin único del
        // equipo B, al que el actor NO pertenece: borrarlo dejaría al B sin
        // nadie que lo gobierne.
        $teamA = Team::factory()->create();
        $teamB = Team::factory()->create();
        $actor = $this->makeTeamAdmin($teamA);

        $target = $this->makeTeamAdmin($teamB);
        $target->teams()->attach($teamA);

        $this->actingAs($actor)
            ->delete(route('admin.users.destroy', $target))
            ->assertForbidden();

        $this->assertDatabaseHas('users', ['id' => $target->id]);
    }

    public function test_super_admin_may_leave_a_team_without_administrator(): void
    {
        $team = Team::factory()->create();
        $superAdmin = $this->makeSuperAdmin();
        $teamAdmin = $this->makeTeamAdmin($team);

        $this->actingAs($superAdmin)->put(route('admin.users.update', $teamAdmin), [
            'name' => $teamAdmin->name,
            'email' => $teamAdmin->email,
            'roles' => [$this->roleId('laudador')],
            'teams' => [$team->id],
        ])->assertRedirect(route('admin.users.index'));

        $this->assertFalse($team->fresh()->hasAdministrator());
    }

    /* ------------------------------------------------------------------ */
    /* Escalada de privilegios                                            */
    /* ------------------------------------------------------------------ */

    public function test_team_admin_cannot_touch_the_admin_role_at_all(): void
    {
        $team = Team::factory()->create();
        $teamAdmin = $this->makeTeamAdmin($team);
        $laudador = $this->makeMember($team, 'laudador');

        // Aunque ya tenga el rol, reasignar la lista de roles implica quitar y
        // poner el de administrador: eso es territorio exclusivo del super-admin.
        $this->actingAs($teamAdmin)->put(route('admin.users.update', $laudador), [
            'name' => $laudador->name,
            'email' => $laudador->email,
            'roles' => [$this->roleId('administrador')],
            'teams' => [$team->id],
        ])->assertForbidden();

        $this->assertFalse($laudador->fresh()->hasRole('administrador'));
    }

    public function test_team_admin_cannot_create_a_user_with_the_admin_role(): void
    {
        $teamAdmin = $this->makeTeamAdmin(Team::factory()->create());

        $this->actingAs($teamAdmin)->post(route('admin.users.store'), [
            'name' => 'Complice',
            'email' => 'complice@ejemplo.com',
            'password' => 'secreta123',
            'password_confirmation' => 'secreta123',
            'roles' => [$this->roleId('administrador')],
        ])->assertForbidden();

        $this->assertDatabaseMissing('users', ['email' => 'complice@ejemplo.com']);
    }

    public function test_team_admin_cannot_promote_themselves_to_super_admin(): void
    {
        $teamAdmin = $this->makeTeamAdmin(Team::factory()->create());

        // is_super_admin no está en $fillable, así que ni siquiera llega a la
        // base; el intento se ignora en silencio y el usuario sigue sin serlo.
        $this->actingAs($teamAdmin)->put(route('admin.users.update', $teamAdmin), [
            'name' => $teamAdmin->name,
            'email' => $teamAdmin->email,
            'is_super_admin' => true,
        ])->assertRedirect(route('admin.users.index'));

        $this->assertFalse($teamAdmin->fresh()->isSuperAdmin());
    }

    public function test_team_admin_cannot_manage_a_super_admin(): void
    {
        $team = Team::factory()->create();
        $teamAdmin = $this->makeTeamAdmin($team);
        $superAdmin = $this->makeSuperAdmin();
        $superAdmin->teams()->attach($team);

        $this->actingAs($teamAdmin)
            ->delete(route('admin.users.destroy', $superAdmin))
            ->assertForbidden();

        $this->assertDatabaseHas('users', ['id' => $superAdmin->id]);
    }

    public function test_team_admin_cannot_deactivate_a_super_admin(): void
    {
        $team = Team::factory()->create();
        $teamAdmin = $this->makeTeamAdmin($team);
        $superAdmin = $this->makeSuperAdmin();
        $superAdmin->teams()->attach($team);

        $this->actingAs($teamAdmin)
            ->patch(route('admin.users.toggle-status', $superAdmin))
            ->assertForbidden();

        $this->assertTrue($superAdmin->fresh()->is_active);
    }

    /* ------------------------------------------------------------------ */
    /* Un equipo no puede robarse usuarios de otro equipo                 */
    /* ------------------------------------------------------------------ */

    public function test_team_admin_cannot_pull_a_user_from_another_team(): void
    {
        $teamA = Team::factory()->create();
        $teamB = Team::factory()->create();

        $adminA = $this->makeTeamAdmin($teamA);
        $laudadorA = $this->makeMember($teamA);
        $laudadorB = $this->makeMember($teamB);

        $this->actingAs($adminA)->put(route('admin.teams.update', $teamA), [
            'name' => $teamA->name,
            'users' => [$laudadorA->id, $laudadorB->id],
        ])->assertForbidden();

        $this->assertFalse($teamA->fresh()->users()->where('users.id', $laudadorB->id)->exists());
        $this->assertTrue($teamB->fresh()->users()->where('users.id', $laudadorB->id)->exists());
    }

    public function test_team_admin_can_still_add_a_user_without_any_team(): void
    {
        $team = Team::factory()->create();
        $admin = $this->makeTeamAdmin($team);
        $orphan = User::factory()->create();

        $this->actingAs($admin)->put(route('admin.teams.update', $team), [
            'name' => $team->name,
            'users' => [$admin->id, $orphan->id],
        ])->assertRedirect(route('admin.teams.index'));

        $this->assertTrue($team->fresh()->users()->where('users.id', $orphan->id)->exists());
    }

    public function test_super_admin_can_move_a_user_between_teams(): void
    {
        $superAdmin = $this->makeSuperAdmin();
        $teamA = Team::factory()->create();
        $teamB = Team::factory()->create();
        $laudadorA = $this->makeMember($teamA);

        $this->actingAs($superAdmin)->put(route('admin.teams.update', $teamB), [
            'name' => $teamB->name,
            'users' => [$laudadorA->id],
        ])->assertRedirect(route('admin.teams.index'));

        $this->assertTrue($teamB->fresh()->users()->where('users.id', $laudadorA->id)->exists());
    }
}
