<?php
namespace Tests\Feature;

use App\Models\Team;
use App\Models\User;
use App\Models\UserModule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PatientDirectoryOptimizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_navigation_exposes_roles_only_for_super_admin(): void
    {
        Role::firstOrCreate(['name' => 'administrador']);
        $admin = User::factory()->create();
        $admin->assignRole('administrador');
        $team = Team::factory()->create();
        $admin->teams()->attach($team);
        $page = $this->actingAs($admin)->get('/questionnaires')->assertOk()->inertiaPage();
        $this->assertTrue($page['props']['navigation']['administration']);
        $this->assertFalse($page['props']['navigation']['manageRoles']);
        $this->get('/admin/roles')->assertForbidden();
        $super = User::factory()->create(['is_super_admin' => true]);
        $page = $this->actingAs($super)->get('/questionnaires')->assertOk()->inertiaPage();
        $this->assertTrue($page['props']['navigation']['manageRoles']);
        $regular = User::factory()->create();
        $regular->teams()->attach($team);
        $page = $this->actingAs($regular)->get('/questionnaires')->assertOk()->inertiaPage();
        $this->assertFalse($page['props']['navigation']['administration']);
        $this->assertFalse($page['props']['navigation']['manageRoles']);
    }

    public static function modules(): array
    {
        $config = require __DIR__.'/../../config/questionnaires.php';
        $cases = [];
        foreach ($config['types'] as $key => $type) $cases[$key] = [$key, $type];
        return $cases;
    }

    /** @dataProvider modules */
    public function test_lightweight_directory_preserves_team_and_module_scope(string $key, array $type): void
    {
        Role::firstOrCreate(['name' => 'laudador']);
        $user = User::factory()->create();
        $user->assignRole('laudador');
        $team = Team::factory()->create();
        $otherTeam = Team::factory()->create();
        $user->teams()->attach($team);
        UserModule::create(['user_id' => $user->id, 'module_name' => $key, 'is_active' => true]);
        $own = $type['model']::factory()->create(['team_id' => $team->id]);
        $type['model']::factory()->create(['team_id' => $otherTeam->id]);
        $component = str_replace('/Create.jsx', '/Index', $type['jsx']);
        $version = $this->actingAs($user)->get('/questionnaires')->inertiaPage()['version'];
        $response = $this->actingAs($user)->withHeaders([
            'X-Inertia-Version' => $version ?? '',
            'X-Inertia' => 'true', 'X-Inertia-Partial-Component' => $component,
            'X-Inertia-Partial-Data' => 'questionnaires',
        ])->get(route('questionnaires.'.$type['slug'].'.index', ['directory' => 1]));
        $response->assertOk();
        $props = $response->json('props');
        $this->assertArrayNotHasKey('auth', $props);
        $this->assertArrayNotHasKey('switchableTeams', $props);
        $this->assertSame(100, $props['questionnaires']['per_page']);
        $this->assertSame(1, $props['questionnaires']['total']);
        $row = $props['questionnaires']['data'][0];
        $this->assertSame($own->id, $row['id']);
        foreach (['assinatura_paciente', 'pedido_medico', 'comentario', 'observacoes', 'team', 'editor'] as $field) {
            $this->assertArrayNotHasKey($field, $row);
        }
        UserModule::where('user_id', $user->id)->update(['is_active' => false]);
        $this->get(route('questionnaires.'.$type['slug'].'.index', ['directory' => 1]))->assertForbidden();
    }
}
