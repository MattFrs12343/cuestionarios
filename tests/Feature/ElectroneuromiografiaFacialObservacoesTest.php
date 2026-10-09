<?php

namespace Tests\Feature;

use App\Models\ElectroneuromiografiaFacial;
use App\Models\Team;
use App\Models\User;
use App\Models\UserModule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * El apartado "Observações" es el único campo libre que faltaba en el
 * cuestionario de Electroneuromiografía Facial. Se verifica que se persista al
 * crear, que se devuelva en el detalle y que se actualice en la edición.
 */
class ElectroneuromiografiaFacialObservacoesTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Team $team;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'laudador']);

        $this->team = Team::factory()->create();
        $this->team->modules()->updateOrCreate(
            ['module_name' => 'electroneuromiografia_facial'],
            ['is_active' => true]
        );

        $this->user = User::factory()->create();
        $this->user->assignRole('laudador');
        $this->user->teams()->attach($this->team);

        UserModule::create([
            'user_id' => $this->user->id,
            'module_name' => 'electroneuromiografia_facial',
            'is_active' => true,
        ]);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'nome' => 'Paciente Teste',
            'data_nascimento' => '1990-05-10',
            'data_exame' => '2026-10-07',
            'rg' => '123456789',
            'solicitante' => 'Dr. Solicitante',
            'clinica' => 'Clínica Teste',
            'sexo' => 'Masculino',
        ], $overrides);
    }

    public function test_se_guarda_la_observacion_al_crear(): void
    {
        $this->actingAs($this->user)
            ->post(
                route('questionnaires.electroneuromiografia-facial.store'),
                $this->payload(['observacoes' => 'Paciente relata dor na face ao acordar.'])
            )
            ->assertRedirect(route('questionnaires.electroneuromiografia-facial.index'));

        $this->assertDatabaseHas('electroneuromiografia_facial', [
            'nome' => 'PACIENTE TESTE',
            'observacoes' => 'PACIENTE RELATA DOR NA FACE AO ACORDAR.',
        ]);
    }

    public function test_la_observacion_se_devuelve_en_el_detalle(): void
    {
        $registro = ElectroneuromiografiaFacial::factory()->create([
            'team_id' => $this->team->id,
            'observacoes' => 'Observação de teste',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('questionnaires.electroneuromiografia-facial.show', $registro));

        $response->assertOk();
        $this->assertSame(
            'OBSERVAÇÃO DE TESTE',
            $response->inertiaPage()['props']['questionnaire']['observacoes']
        );
    }

    public function test_se_actualiza_la_observacion_al_editar(): void
    {
        $registro = ElectroneuromiografiaFacial::factory()->create([
            'team_id' => $this->team->id,
            'observacoes' => 'Texto original',
        ]);

        $this->actingAs($this->user)
            ->put(
                route('questionnaires.electroneuromiografia-facial.update', $registro),
                $this->payload(['observacoes' => 'Observação editada'])
            )
            ->assertRedirect(route('questionnaires.electroneuromiografia-facial.index'));

        $this->assertSame('OBSERVAÇÃO EDITADA', $registro->fresh()->observacoes);
    }
}
