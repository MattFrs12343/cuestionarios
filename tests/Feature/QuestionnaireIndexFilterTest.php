<?php

namespace Tests\Feature;

use App\Models\RastreioCognitivo;
use App\Models\Team;
use App\Models\User;
use App\Models\UserModule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Cubre el filtrado compartido (RestrictsQuestionnaireByTeam::applyIndexFilters)
 * que reemplazó la lógica duplicada 11 veces. Se prueba una sola vez, sobre
 * rastreio-cognitivo (2 campos de búsqueda + clinica + whitelist de orden),
 * porque los 11 controladores ahora llaman al mismo método.
 */
class QuestionnaireIndexFilterTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Team $team;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'laudador']);

        $this->team = Team::factory()->create();
        $this->user = User::factory()->create();
        $this->user->assignRole('laudador');
        $this->user->teams()->attach($this->team);

        UserModule::create([
            'user_id' => $this->user->id,
            'module_name' => 'rastreio_cognitivo',
            'is_active' => true,
        ]);
    }

    public function test_search_matches_case_insensitively_across_multiple_fields(): void
    {
        RastreioCognitivo::factory()->create(['team_id' => $this->team->id, 'nome_completo' => 'Maria Silva', 'rg_ou_cpf' => '111']);
        RastreioCognitivo::factory()->create(['team_id' => $this->team->id, 'nome_completo' => 'Joao Souza', 'rg_ou_cpf' => '222']);

        $response = $this->actingAs($this->user)
            ->get(route('questionnaires.rastreio-cognitivo.index', ['search' => 'MARIA']));

        $names = collect($response->inertiaPage()['props']['questionnaires']['data'])->pluck('nome_completo');

        $this->assertTrue($names->contains('Maria Silva'));
        $this->assertFalse($names->contains('Joao Souza'));
    }

    public function test_clinica_filter_matches_case_insensitively(): void
    {
        RastreioCognitivo::factory()->create(['team_id' => $this->team->id, 'clinica' => 'Clinica Vida']);
        RastreioCognitivo::factory()->create(['team_id' => $this->team->id, 'clinica' => 'Outra Clinica']);

        $response = $this->actingAs($this->user)
            ->get(route('questionnaires.rastreio-cognitivo.index', ['clinica' => 'vida']));

        $clinicas = collect($response->inertiaPage()['props']['questionnaires']['data'])->pluck('clinica');

        $this->assertTrue($clinicas->contains('Clinica Vida'));
        $this->assertFalse($clinicas->contains('Outra Clinica'));
    }

    public function test_date_range_filters_are_applied(): void
    {
        RastreioCognitivo::factory()->create(['team_id' => $this->team->id, 'data_exame' => '2026-01-10']);
        RastreioCognitivo::factory()->create(['team_id' => $this->team->id, 'data_exame' => '2026-06-15']);

        $response = $this->actingAs($this->user)
            ->get(route('questionnaires.rastreio-cognitivo.index', ['date_from' => '2026-05-01', 'date_to' => '2026-07-01']));

        $dates = collect($response->inertiaPage()['props']['questionnaires']['data'])->pluck('data_exame');

        $this->assertTrue($dates->contains(fn ($d) => str_starts_with($d, '2026-06-15')));
        $this->assertFalse($dates->contains(fn ($d) => str_starts_with($d, '2026-01-10')));
    }

    public function test_invalid_sort_field_falls_back_to_default_without_erroring(): void
    {
        RastreioCognitivo::factory()->create(['team_id' => $this->team->id]);

        $response = $this->actingAs($this->user)
            ->get(route('questionnaires.rastreio-cognitivo.index', ['sort' => 'DROP TABLE users;']));

        $response->assertOk();
    }
}
