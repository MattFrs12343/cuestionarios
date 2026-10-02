<?php

namespace Tests\Feature;

use App\Models\Team;
use App\Models\User;
use App\Models\UserModule;
use App\Services\UserModuleProvisioner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * La decisión del administrador sobre los módulos de UNA persona tiene que ser
 * la que manda, sin que nada la anule en silencio.
 *
 * Antes el acceso era la intersección de team_modules (el "plan" del equipo) y
 * user_modules (la asignación individual), y la intersección siempre ganaba:
 * encender un módulo desde el panel no se reflejaba si el plan del equipo no lo
 * tenía, y el plan sí ocultaba en silencio lo que se había encendido. Estos
 * tests fijan el comportamiento nuevo.
 */
class UserModuleAccessTest extends TestCase
{
    use RefreshDatabase;

    private const MODULE = 'dinamometro';

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['administrador', 'tecnico', 'laudador'] as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }
    }

    private function makeSuperAdmin(): User
    {
        $user = User::factory()->create();
        $user->forceFill(['is_super_admin' => true])->save();

        return $user->fresh();
    }

    private function makeLaudador(Team $team): User
    {
        $user = User::factory()->create();
        $user->assignRole('laudador');
        $user->teams()->attach($team);

        return $user;
    }

    private function assign(User $user, string $moduleName, bool $isActive = true, ?User $by = null): void
    {
        UserModule::updateOrCreate(
            ['user_id' => $user->id, 'module_name' => $moduleName],
            ['is_active' => $isActive, 'assigned_by' => $by?->id]
        );
    }

    private function setPlan(Team $team, string $moduleName, bool $isActive): void
    {
        $team->modules()->updateOrCreate(
            ['module_name' => $moduleName],
            ['is_active' => $isActive]
        );
    }

    /**
     * Los módulos que la pantalla de cuestionarios le devuelve a esta persona.
     * Se leen de props['modules'] directamente (el assert de Ineria no entrega
     * el prop crudo a un closure) y se filtran por icon == module_name.
     *
     * @return array<int, string>
     */
    private function modulesSeenBy(User $user): array
    {
        $seen = [];

        // fresh() para que cada petición parta de una instancia nueva, igual
        // que en producción. Reutilizar el mismo objeto dejaría cacheada la
        // relación userModules de una petición anterior y el test mentiría.
        $this->actingAs($user->fresh())
            ->get(route('questionnaires.index'))
            ->assertOk()
            ->assertInertia(function (AssertableInertia $page) use (&$seen) {
                $seen = array_column(
                    collect($page->toArray()['props']['modules'] ?? [])->all(),
                    'icon'
                );

                return $page->component('Questionnaires/Index');
            });

        return $seen;
    }

    // ------------------------------------------------------------------
    // La decisión por usuario manda
    // ------------------------------------------------------------------

    public function test_un_modulo_asignado_se_ve_en_el_cuestionario(): void
    {
        $team = Team::factory()->create();
        $laudador = $this->makeLaudador($team);
        $this->assign($laudador, self::MODULE);

        $this->assertContains(self::MODULE, $this->modulesSeenBy($laudador));
    }

    public function test_apagar_un_modulo_lo_oculta_y_bloquea_el_acceso_directo(): void
    {
        $team = Team::factory()->create();
        $laudador = $this->makeLaudador($team);
        $superAdmin = $this->makeSuperAdmin();

        $this->assign($laudador, self::MODULE, true, $superAdmin);
        $this->actingAs($laudador)
            ->get(route('questionnaires.dinamometro.index'))
            ->assertOk();

        // El super-admin apaga ese módulo para esta persona.
        $this->actingAs($superAdmin)
            ->put(route('admin.user-modules.update', $laudador->id), [
                'modules' => [self::MODULE => false],
            ])
            ->assertRedirect(route('admin.user-modules.index'));

        $this->assertNotContains(self::MODULE, $this->modulesSeenBy($laudador));

        // Y además no se puede entrar por URL directa: "no se|ruplica".
        $this->actingAs($laudador)
            ->get(route('questionnaires.dinamometro.index'))
            ->assertForbidden();
    }

    /**
     * La regresión que reportó el super-admin: encender un módulo para una
     * persona tiene que notarse, incluso si el plan de su equipo lo tiene
     * apagado. Antes ganaba la intersección y el guardado no se veía.
     */
    public function test_encender_un_modulo_se_refleja_aunque_el_plan_del_equipo_lo_tenga_apagado(): void
    {
        $team = Team::factory()->create();
        $laudador = $this->makeLaudador($team);
        $superAdmin = $this->makeSuperAdmin();

        $this->setPlan($team, self::MODULE, false);

        $this->assertNotContains(self::MODULE, $this->modulesSeenBy($laudador));

        $this->actingAs($superAdmin)
            ->put(route('admin.user-modules.update', $laudador->id), [
                'modules' => [self::MODULE => true],
            ])
            ->assertRedirect(route('admin.user-modules.index'));

        $this->assertDatabaseHas('user_modules', [
            'user_id' => $laudador->id,
            'module_name' => self::MODULE,
            'is_active' => true,
        ]);

        $this->assertContains(self::MODULE, $this->modulesSeenBy($laudador));

        $this->actingAs($laudador)
            ->get(route('questionnaires.dinamometro.index'))
            ->assertOk();
    }

    public function test_la_pantalla_de_asignacion_ofrece_el_catalogo_completo(): void
    {
        $team = Team::factory()->create();
        $laudador = $this->makeLaudador($team);
        $superAdmin = $this->makeSuperAdmin();

        // El plan del equipo no tiene el módulo, pero debe poder encenderse.
        $this->setPlan($team, self::MODULE, false);

        $this->actingAs($superAdmin)
            ->get(route('admin.user-modules.edit', $laudador->id))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/UserModules/Edit')
                ->has('modules')
                ->where('modules', fn ($modules) => array_key_exists(self::MODULE, collect($modules)->all()))
            );
    }

    // ------------------------------------------------------------------
    // El plan del equipo es valor inicial, no un techo
    // ------------------------------------------------------------------

    public function test_apagar_en_el_plan_no_toca_a_quien_ya_lo_tiene(): void
    {
        $team = Team::factory()->create();
        $laudador = $this->makeLaudador($team);
        $superAdmin = $this->makeSuperAdmin();

        $this->assign($laudador, self::MODULE, true, $superAdmin);
        $this->setPlan($team, self::MODULE, true);

        $this->actingAs($superAdmin)
            ->put(route('admin.teams.update-modules', $team->id), [
                'modules' => array_fill_keys(array_keys(config('questionnaires.types')), false),
            ])
            ->assertRedirect(route('admin.teams.edit', $team->id));

        // El plan ya no lo tiene, pero la asignación individual sigue viva.
        $this->assertFalse($team->fresh()->hasModuleEnabled(self::MODULE));
        $this->assertContains(self::MODULE, $this->modulesSeenBy($laudador));
    }

    public function test_el_plan_no_toca_los_usuarios_actuales_sin_apply_to_members(): void
    {
        $team = Team::factory()->create();
        $laudador = $this->makeLaudador($team);
        $superAdmin = $this->makeSuperAdmin();

        $this->setPlan($team, self::MODULE, false);
        $this->assign($laudador, 'rastreio_cognitivo', true, $superAdmin);

        $payload = ['modules' => array_fill_keys(array_keys(config('questionnaires.types')), false)];
        $payload['modules']['rastreio_cognitivo'] = true;

        $this->actingAs($superAdmin)
            ->put(route('admin.teams.update-modules', $team->id), $payload)
            ->assertRedirect(route('admin.teams.edit', $team->id));

        // El módulo nuevo del plan NO se propagó solo.
        $this->assertDatabaseMissing('user_modules', [
            'user_id' => $laudador->id,
            'module_name' => self::MODULE,
        ]);
    }

    public function test_apply_to_members_si_propaga_el_plan_a_los_usuarios_actuales(): void
    {
        $team = Team::factory()->create();
        $laudador = $this->makeLaudador($team);
        $superAdmin = $this->makeSuperAdmin();

        $this->setPlan($team, self::MODULE, true);

        $payload = array_fill_keys(array_keys(config('questionnaires.types')), false);
        $payload[self::MODULE] = true;

        $this->actingAs($superAdmin)
            ->put(route('admin.teams.update-modules', $team->id), [
                'modules' => $payload,
                'apply_to_members' => true,
            ])
            ->assertRedirect(route('admin.teams.edit', $team->id));

        $this->assertDatabaseHas('user_modules', [
            'user_id' => $laudador->id,
            'module_name' => self::MODULE,
            'is_active' => true,
        ]);

        $this->assertContains(self::MODULE, $this->modulesSeenBy($laudador));
    }

    // ------------------------------------------------------------------
    // Aprovisionamiento
    // ------------------------------------------------------------------

    public function test_quien_entra_a_un_equipo_nace_con_el_valor_inicial_del_plan(): void
    {
        $team = Team::factory()->create();
        $this->setPlan($team, self::MODULE, true);
        $laudador = $this->makeLaudador($team);

        $seeded = app(UserModuleProvisioner::class)->provisionNewMember($laudador, $team);

        // El plan del equipo trae los módulos core más el que se acaba de
        // habilitar, así que se siembran todos los activos, no solo uno.
        $this->assertSame(count($team->activeModuleNames()), $seeded);
        $this->assertContains(self::MODULE, $this->modulesSeenBy($laudador));
    }

    public function test_provisionar_no_pisa_un_modulo_que_el_admin_apago(): void
    {
        $team = Team::factory()->create();
        $this->setPlan($team, self::MODULE, true);
        $laudador = $this->makeLaudador($team);

        // El admin se lo apaga explícitamente (deja de estar activo).
        $this->assign($laudador, self::MODULE, false);

        app(UserModuleProvisioner::class)->provisionNewMember($laudador, $team);

        $this->assertDatabaseHas('user_modules', [
            'user_id' => $laudador->id,
            'module_name' => self::MODULE,
            'is_active' => false,
        ]);

        $this->assertNotContains(self::MODULE, $this->modulesSeenBy($laudador));
    }

    public function test_alta_de_usuario_desde_el_panel_lo_siembra_con_el_plan(): void
    {
        $team = Team::factory()->create();
        $this->setPlan($team, self::MODULE, true);
        $roleId = Role::where('name', 'laudador')->value('id');
        $superAdmin = $this->makeSuperAdmin();

        $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), [
                'name' => 'Nueva',
                'email' => 'nueva@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'is_active' => true,
                'roles' => [$roleId],
                'teams' => [$team->id],
            ])
            ->assertRedirect(route('admin.users.index'));

        $created = User::where('email', 'nueva@example.com')->firstOrFail();

        $this->assertDatabaseHas('user_modules', [
            'user_id' => $created->id,
            'module_name' => self::MODULE,
            'is_active' => true,
        ]);
    }

    // ------------------------------------------------------------------
    // Técnicos y administradores
    // ------------------------------------------------------------------

    public function test_un_tecnico_ve_el_plan_de_su_equipo_sin_asignacion_individual(): void
    {
        $team = Team::factory()->create();
        $this->setPlan($team, self::MODULE, true);

        $tecnico = User::factory()->create();
        $tecnico->assignRole('tecnico');
        $tecnico->teams()->attach($team);

        $this->assertContains(self::MODULE, $this->modulesSeenBy($tecnico));
    }

    /**
     * Regresión de Agatha (agatha@tecnico.com): el panel de módulos offering
     * interruptores para un técnico aceptaba y guardaba la decisión, pero el
     * acceso se calculaba solo con el plan del equipo. Apagar un módulo a un
     * técnico no le ocultaba nada.
     */
    public function test_apagar_un_modulo_a_un_tecnico_si_lo_oculta(): void
    {
        $team = Team::factory()->create();
        $this->setPlan($team, self::MODULE, true);
        $superAdmin = $this->makeSuperAdmin();

        $tecnico = User::factory()->create();
        $tecnico->assignRole('tecnico');
        $tecnico->teams()->attach($team);

        $this->assertContains(self::MODULE, $this->modulesSeenBy($tecnico));

        $this->actingAs($superAdmin)
            ->put(route('admin.user-modules.update', $tecnico->id), [
                'modules' => [self::MODULE => false],
            ])
            ->assertRedirect(route('admin.user-modules.index'));

        $this->assertNotContains(self::MODULE, $this->modulesSeenBy($tecnico));

        $this->actingAs($tecnico)
            ->get(route('questionnaires.dinamometro.index'))
            ->assertForbidden();
    }

    public function test_encender_un_modulo_a_un_tecnico_si_lo_muestra_aunque_el_plan_no_lo_tenga(): void
    {
        $team = Team::factory()->create();
        $this->setPlan($team, self::MODULE, false);
        $superAdmin = $this->makeSuperAdmin();

        $tecnico = User::factory()->create();
        $tecnico->assignRole('tecnico');
        $tecnico->teams()->attach($team);

        $this->assertNotContains(self::MODULE, $this->modulesSeenBy($tecnico));

        $this->actingAs($superAdmin)
            ->put(route('admin.user-modules.update', $tecnico->id), [
                'modules' => [self::MODULE => true],
            ])
            ->assertRedirect(route('admin.user-modules.index'));

        $this->assertContains(self::MODULE, $this->modulesSeenBy($tecnico));

        $this->actingAs($tecnico)
            ->get(route('questionnaires.dinamometro.index'))
            ->assertOk();
    }

    /**
     * El plan del equipo sigue siendo el valor por defecto de los módulos que el
     * administrador todavía no tocó en la pantalla del técnico.
     */
    public function test_los_modulos_que_no_se_toquaron_siguen_siguiendo_el_plan(): void
    {
        $team = Team::factory()->create();
        $this->setPlan($team, self::MODULE, true);
        $this->setPlan($team, 'rastreio_cognitivo', true);
        $superAdmin = $this->makeSuperAdmin();

        $tecnico = User::factory()->create();
        $tecnico->assignRole('tecnico');
        $tecnico->teams()->attach($team);

        // El formulario manda el estado completo que se estaba mostrando, con
        // dinamometro apagado: es lo que realmente envía la pantalla.
        $payload = [];
        foreach (array_keys(config('questionnaires.types')) as $name) {
            $payload[$name] = $name !== self::MODULE;
        }

        $this->actingAs($superAdmin)
            ->put(route('admin.user-modules.update', $tecnico->id), ['modules' => $payload])
            ->assertRedirect(route('admin.user-modules.index'));

        $seen = $this->modulesSeenBy($tecnico);

        $this->assertNotContains(self::MODULE, $seen);
        $this->assertContains('rastreio_cognitivo', $seen);
    }

    /**
     * Guardar sin tocar nada no debe quitarle al técnico los módulos que le
     * vienen del plan: la pantalla abre en el acceso efectivo, y al guardar se
     * reenvía tal cual.
     */
    public function test_guardar_sin_tocar_nada_no_le_quita_los_modulos_del_plan(): void
    {
        $team = Team::factory()->create();
        $this->setPlan($team, self::MODULE, true);
        $superAdmin = $this->makeSuperAdmin();

        $tecnico = User::factory()->create();
        $tecnico->assignRole('tecnico');
        $tecnico->teams()->attach($team);

        // Lo que la pantalla le manda al administrador al abrirla.
        $edit = $this->actingAs($superAdmin)
            ->get(route('admin.user-modules.edit', $tecnico->id))
            ->assertOk();

        $effective = json_decode(
            html_entity_decode(
                (string) preg_replace(
                    '/^.*?data-page="(.*)".*$/s',
                    '$1',
                    $edit->getContent()
                )
            ),
            true
        )['props']['effectiveModules'] ?? null;

        $this->assertContains(self::MODULE, (array) $effective);

        $this->actingAs($superAdmin)
            ->put(route('admin.user-modules.update', $tecnico->id), [
                'modules' => array_fill_keys((array) $effective, true),
            ])
            ->assertRedirect(route('admin.user-modules.index'));

        $this->assertContains(self::MODULE, $this->modulesSeenBy($tecnico));
    }

    public function test_un_administrador_no_se_gestiona_por_modulos(): void
    {
        $team = Team::factory()->create();
        $superAdmin = $this->makeSuperAdmin();

        $admin = User::factory()->create();
        $admin->assignRole('administrador');
        $admin->teams()->attach($team);

        $this->actingAs($superAdmin)
            ->get(route('admin.user-modules.edit', $admin->id))
            ->assertRedirect(route('admin.user-modules.index'));
    }

    // ------------------------------------------------------------------
    // Aislamiento entre personas
    // ------------------------------------------------------------------

    public function test_apagar_a_uno_no_toca_a_los_demas_del_equipo(): void
    {
        $team = Team::factory()->create();
        $superAdmin = $this->makeSuperAdmin();
        $one = $this->makeLaudador($team);
        $two = $this->makeLaudador($team);

        foreach ([$one, $two] as $member) {
            $this->assign($member, self::MODULE, true, $superAdmin);
        }

        $this->actingAs($superAdmin)
            ->put(route('admin.user-modules.update', $one->id), [
                'modules' => [self::MODULE => false],
            ])
            ->assertRedirect(route('admin.user-modules.index'));

        $this->assertNotContains(self::MODULE, $this->modulesSeenBy($one));
        $this->assertContains(self::MODULE, $this->modulesSeenBy($two));
    }

    // ------------------------------------------------------------------
    // Guardar la lista de miembros no puede deshacer decisiones individuales
    // ------------------------------------------------------------------

    public function test_guardar_la_lista_de_miembros_no_reactiva_lo_que_se_apago(): void
    {
        $team = Team::factory()->create();
        $laudador = $this->makeLaudador($team);
        $superAdmin = $this->makeSuperAdmin();

        $this->setPlan($team, self::MODULE, true);
        $this->assign($laudador, self::MODULE, true, $superAdmin);

        $this->actingAs($superAdmin)
            ->put(route('admin.user-modules.update', $laudador->id), [
                'modules' => [self::MODULE => false],
            ])
            ->assertRedirect(route('admin.user-modules.index'));

        // Volver a guardar el equipo con la MISMA lista de miembros (un cambio
        // de nombre, o simplemente reenviar el formulario) no debe resucitar el
        // módulo que se acababa de apagar.
        $this->actingAs($superAdmin)
            ->put(route('admin.teams.update', $team->id), [
                'name' => $team->name,
                'users' => [$laudador->id],
            ])
            ->assertRedirect(route('admin.teams.index'));

        $this->assertDatabaseHas('user_modules', [
            'user_id' => $laudador->id,
            'module_name' => self::MODULE,
            'is_active' => false,
        ]);

        $this->assertNotContains(self::MODULE, $this->modulesSeenBy($laudador));
    }

    public function test_quien_entra_al_equipo_sin_lista_lo_siembra_con_el_plan(): void
    {
        $team = Team::factory()->create();
        $this->setPlan($team, self::MODULE, true);
        $superAdmin = $this->makeSuperAdmin();

        // Todavía NO es miembro: entra al guardar la lista del equipo.
        $laudador = User::factory()->create();
        $laudador->assignRole('laudador');

        $this->actingAs($superAdmin)
            ->put(route('admin.teams.update', $team->id), [
                'name' => $team->name,
                'users' => [$laudador->id],
            ])
            ->assertRedirect(route('admin.teams.index'));

        $this->assertDatabaseHas('user_modules', [
            'user_id' => $laudador->id,
            'module_name' => self::MODULE,
            'is_active' => true,
        ]);

        $this->assertContains(self::MODULE, $this->modulesSeenBy($laudador));
    }

    public function test_el_barrido_de_reparacion_no_reactiva_modulos_apagados(): void
    {
        $team = Team::factory()->create();
        $this->setPlan($team, self::MODULE, true);
        $laudador = $this->makeLaudador($team);

        // El admin lo apaga y además le quita otro módulo del plan, para que el
        // barrido tenga que rellenar ese hueco sí o sí.
        $this->assign($laudador, self::MODULE, false);
        $this->assertDatabaseMissing('user_modules', [
            'user_id' => $laudador->id,
            'module_name' => 'rastreio_cognitivo',
        ]);

        $seeded = app(UserModuleProvisioner::class)->seedMissingForMembers($team);

        // Rellena el que faltaba...
        $this->assertDatabaseHas('user_modules', [
            'user_id' => $laudador->id,
            'module_name' => 'rastreio_cognitivo',
            'is_active' => true,
        ]);

        // ...pero no toca el que estaba apagado.
        $this->assertDatabaseHas('user_modules', [
            'user_id' => $laudador->id,
            'module_name' => self::MODULE,
            'is_active' => false,
        ]);

        $this->assertGreaterThan(0, $seeded['modules']);
        $this->assertNotContains(self::MODULE, $this->modulesSeenBy($laudador));
    }

    // ------------------------------------------------------------------
    // El super-admin necesita poder llegar al panel
    // ------------------------------------------------------------------

    public function test_el_super_admin_tiene_is_super_admin_expuesto_a_la_interfaz(): void
    {
        $superAdmin = $this->makeSuperAdmin();

        $this->actingAs($superAdmin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('auth.user.is_super_admin', true)
                ->where('isSuperAdmin', true)
            );
    }
}