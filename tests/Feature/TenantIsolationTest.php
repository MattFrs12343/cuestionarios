<?php

namespace Tests\Feature;

use App\Models\RastreioCognitivo;
use App\Models\Team;
use App\Models\User;
use App\Models\UserModule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Verifica, para cada uno de los 11 tipos de cuestionario, que un usuario de
 * un equipo NO pueda ver/editar/actualizar/eliminar un registro de OTRO
 * equipo (Fase 1 del hardening multi-tenant), y que el índice no filtre
 * registros ajenos.
 */
class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'laudador']);
    }

    /**
     * Lee el registro central de tipos directamente del archivo de config
     * (sin pasar por el helper config(), que todavía no está disponible
     * cuando PHPUnit arma los data providers).
     */
    public static function questionnaireTypes(): array
    {
        $config = require __DIR__.'/../../config/questionnaires.php';

        $cases = [];
        foreach ($config['types'] as $moduleName => $type) {
            $cases[$moduleName] = [$moduleName, $type['slug'], $type['model']];
        }

        return $cases;
    }

    /**
     * Igual que questionnaireTypes(), pero sin los 3 tipos que usan
     * FormRequest (electroencefalograma, electroneuromiografia, potencial):
     * ahí Laravel valida el payload ANTES de que el controlador llegue a
     * authorizeTeamAccess(), así que un PUT con body vacío da 422 (no 403)
     * por una razón ajena al aislamiento. authorizeTeamAccess() es el mismo
     * método compartido que ya se ejercita en show/edit/destroy para estos
     * 3 tipos, así que la lógica de seguridad igual queda cubierta.
     */
    public static function questionnaireTypesWithoutFormRequest(): array
    {
        $cases = self::questionnaireTypes();
        unset($cases['electroencefalograma'], $cases['electroneuromiografia'], $cases['potencial']);

        return $cases;
    }

    /**
     * Crea un equipo + un usuario LAUDADOR con el módulo dado habilitado
     * (tanto a nivel de equipo -team_modules- como asignado individualmente
     * -user_modules-), para que solo el aislamiento por equipo esté en juego.
     */
    private function makeUserForTeam(Team $team, string $moduleName): User
    {
        $team->modules()->updateOrCreate(
            ['module_name' => $moduleName],
            ['is_active' => true]
        );

        $user = User::factory()->create();
        $user->assignRole('laudador');
        $user->teams()->attach($team);

        UserModule::create([
            'user_id' => $user->id,
            'module_name' => $moduleName,
            'is_active' => true,
        ]);

        return $user;
    }

    #[DataProvider('questionnaireTypes')]
    public function test_show_is_forbidden_for_another_teams_record(string $moduleName, string $slug, string $modelClass): void
    {
        $teamA = Team::factory()->create();
        $teamB = Team::factory()->create();
        $userA = $this->makeUserForTeam($teamA, $moduleName);
        $this->makeUserForTeam($teamB, $moduleName);

        $recordB = $modelClass::factory()->create(['team_id' => $teamB->id]);

        $this->actingAs($userA)
            ->get(route("questionnaires.{$slug}.show", $recordB))
            ->assertForbidden();
    }

    #[DataProvider('questionnaireTypes')]
    public function test_edit_is_forbidden_for_another_teams_record(string $moduleName, string $slug, string $modelClass): void
    {
        $teamA = Team::factory()->create();
        $teamB = Team::factory()->create();
        $userA = $this->makeUserForTeam($teamA, $moduleName);
        $this->makeUserForTeam($teamB, $moduleName);

        $recordB = $modelClass::factory()->create(['team_id' => $teamB->id]);

        $this->actingAs($userA)
            ->get(route("questionnaires.{$slug}.edit", $recordB))
            ->assertForbidden();
    }

    #[DataProvider('questionnaireTypesWithoutFormRequest')]
    public function test_update_is_forbidden_for_another_teams_record(string $moduleName, string $slug, string $modelClass): void
    {
        $teamA = Team::factory()->create();
        $teamB = Team::factory()->create();
        $userA = $this->makeUserForTeam($teamA, $moduleName);
        $this->makeUserForTeam($teamB, $moduleName);

        $recordB = $modelClass::factory()->create(['team_id' => $teamB->id]);

        $this->actingAs($userA)
            ->put(route("questionnaires.{$slug}.update", $recordB), [])
            ->assertForbidden();
    }

    #[DataProvider('questionnaireTypes')]
    public function test_destroy_is_forbidden_for_another_teams_record(string $moduleName, string $slug, string $modelClass): void
    {
        $teamA = Team::factory()->create();
        $teamB = Team::factory()->create();
        $userA = $this->makeUserForTeam($teamA, $moduleName);
        $this->makeUserForTeam($teamB, $moduleName);

        $recordB = $modelClass::factory()->create(['team_id' => $teamB->id]);

        $this->actingAs($userA)
            ->delete(route("questionnaires.{$slug}.destroy", $recordB))
            ->assertForbidden();

        $this->assertDatabaseHas($recordB->getTable(), ['id' => $recordB->id]);
    }

    #[DataProvider('questionnaireTypes')]
    public function test_index_only_shows_current_teams_records(string $moduleName, string $slug, string $modelClass): void
    {
        $teamA = Team::factory()->create();
        $teamB = Team::factory()->create();
        $userA = $this->makeUserForTeam($teamA, $moduleName);
        $this->makeUserForTeam($teamB, $moduleName);

        $recordA = $modelClass::factory()->create(['team_id' => $teamA->id]);
        $recordB = $modelClass::factory()->create(['team_id' => $teamB->id]);

        $response = $this->actingAs($userA)->get(route("questionnaires.{$slug}.index"));

        $response->assertOk();

        $ids = collect($response->inertiaPage()['props']['questionnaires']['data'])->pluck('id');

        $this->assertTrue($ids->contains($recordA->id), 'El registro del equipo propio debería aparecer en el índice.');
        $this->assertFalse($ids->contains($recordB->id), 'El registro de otro equipo NO debería aparecer en el índice.');
    }

    public function test_attachment_is_forbidden_for_another_teams_questionnaire(): void
    {
        $teamA = Team::factory()->create();
        $teamB = Team::factory()->create();
        $userA = $this->makeUserForTeam($teamA, 'rastreio_cognitivo');
        $this->makeUserForTeam($teamB, 'rastreio_cognitivo');

        $recordB = RastreioCognitivo::factory()->create(['team_id' => $teamB->id]);
        $attachment = $recordB->attachments()->create([
            'path' => 'anexos/fake.jpg',
            'original_name' => 'fake.jpg',
        ]);

        $this->actingAs($userA)
            ->get(route('attachments.show', $attachment))
            ->assertForbidden();

        $this->actingAs($userA)
            ->delete(route('attachments.destroy', $attachment))
            ->assertForbidden();

        $this->assertDatabaseHas('attachments', ['id' => $attachment->id]);
    }
}
