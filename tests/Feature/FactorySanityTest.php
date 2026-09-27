<?php

namespace Tests\Feature;

use App\Models\RastreioCognitivo;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FactorySanityTest extends TestCase
{
    use RefreshDatabase;

    public function test_factories_create_records_and_team_modules_autoprovision(): void
    {
        $team = Team::factory()->create();
        $user = User::factory()->create();
        $user->teams()->attach($team);

        $questionnaire = RastreioCognitivo::factory()->create(['team_id' => $team->id]);

        $this->assertDatabaseHas('rastreio_cognitivos', ['id' => $questionnaire->id]);
        $this->assertTrue($team->hasModuleEnabled('rastreio_cognitivo'));
        $this->assertFalse($team->hasModuleEnabled('estesiometria'));
    }
}
