<?php

namespace Tests\Feature;

use App\Models\Barre;
use App\Models\Team;
use App\Models\User;
use App\Models\UserModule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BarreTest extends TestCase
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
        UserModule::create(['user_id' => $this->user->id, 'module_name' => 'barre', 'is_active' => true]);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'nome_completo' => 'Paciente Barré', 'rg_ou_cpf' => 'TESTE-002',
            'data_nascimento' => '1990-05-10', 'sexo' => 'Masculino',
            'clinica' => 'Clínica Teste', 'data_exame' => '2026-11-15',
            'sustenta_60_segundos' => 'false', 'queda_progressiva' => 'true',
            'queda_lados' => ['Direita', 'Esquerda'],
            'tremor_oscilacao' => 'true', 'tremor_lados' => ['Direita'],
            'assimetria' => 'true', 'assimetria_lado' => 'Direita',
            'interrupcao' => 'true', 'interrupcao_lados' => ['Direita', 'Esquerda'],
            'tempo_direito_segundos' => 15, 'tempo_esquerdo_segundos' => 30,
            'alteracoes' => ['queda_progressiva_direita', 'perda_flexao_esquerda', 'fadiga'],
            'nome_avaliador' => 'Dra. Teste', 'comentario' => 'Observação da manobra',
        ], $overrides);
    }

    public function test_create_preserves_bilateral_answers_times_and_current_team(): void
    {
        $this->actingAs($this->user)->get(route('questionnaires.barre.create'))->assertOk();
        $this->post(route('questionnaires.barre.store'), $this->payload(['team_id' => Team::factory()->create()->id, 'created_by' => 999]))
            ->assertSessionHasNoErrors()->assertRedirect(route('questionnaires.barre.index'));
        $q = Barre::sole();
        $this->assertSame($this->team->id, $q->team_id);
        $this->assertSame($this->user->id, $q->created_by);
        $this->assertSame('PACIENTE BARRÉ', $q->nome_completo);
        $this->assertFalse($q->sustenta_60_segundos);
        $this->assertSame(['Direita', 'Esquerda'], $q->queda_lados);
        $this->assertSame('Direita', $q->assimetria_lado);
        $this->assertSame(15, $q->tempo_direito_segundos);
        $this->assertSame(30, $q->tempo_esquerdo_segundos);
        $response = $this->get(route('questionnaires.barre.show', $q))->assertOk();
        $this->assertSame($q->alteracoes, $response->inertiaPage()['props']['questionnaire']['alteracoes']);
        $history = $this->get(route('history.index'))->assertOk();
        $this->assertSame('barre', $history->inertiaPage()['props']['timeline']['data'][0]['type_key']);
    }

    public function test_multipart_update_clears_hidden_answers_and_preserves_signature_and_files(): void
    {
        Storage::fake('private');
        $this->actingAs($this->user)->post(route('questionnaires.barre.store'), $this->payload([
            'pedido_medico' => UploadedFile::fake()->image('pedido.png'),
            'anexos' => [UploadedFile::fake()->image('anexo.png')],
            'assinatura_paciente' => 'data:image/png;base64,dGVzdA==',
        ]))->assertSessionHasNoErrors();
        $q = Barre::sole();
        $pedido = $q->pedido_medico;
        $attachment = $q->attachments()->sole();
        $response = $this->get(route('questionnaires.barre.edit', $q))->assertOk();
        $this->assertSame(route('pedidos-medicos.show', ['type' => 'barre', 'id' => $q->id]), $response->inertiaPage()['props']['pedidoMedicoUrl']);
        $this->get(route('pedidos-medicos.show', ['type' => 'barre', 'id' => $q->id]))->assertOk();
        $this->get(route('attachments.show', $attachment))->assertOk();
        $this->post(route('questionnaires.barre.update', $q), $this->payload([
            '_method' => 'put', 'pedido_medico' => null,
            'sustenta_60_segundos' => 'true', 'queda_progressiva' => 'false',
            'tremor_oscilacao' => 'false', 'assimetria' => 'false', 'interrupcao' => 'false',
            'alteracoes' => ['sem_alteracoes'],
        ]))->assertSessionHasNoErrors()->assertRedirect(route('questionnaires.barre.index'));
        $q->refresh();
        $this->assertSame([], $q->queda_lados);
        $this->assertSame([], $q->tremor_lados);
        $this->assertNull($q->assimetria_lado);
        $this->assertSame([], $q->interrupcao_lados);
        $this->assertNull($q->tempo_direito_segundos);
        $this->assertNull($q->tempo_esquerdo_segundos);
        $this->assertSame(['sem_alteracoes'], $q->alteracoes);
        $this->assertSame($pedido, $q->pedido_medico);
        $this->assertSame($this->user->id, $q->updated_by);
        $this->assertSame('data:image/png;base64,dGVzdA==', $q->assinatura_paciente);
        Storage::disk('private')->assertExists($pedido);
        $this->delete(route('questionnaires.barre.destroy', $q))->assertRedirect();
        $this->assertModelMissing($q);
        Storage::disk('private')->assertMissing($pedido);
        Storage::disk('private')->assertMissing($attachment->path);
    }

    public function test_zero_seconds_is_preserved_and_all_source_alterations_are_supported(): void
    {
        $alterations = array_values(array_diff(Barre::ALTERACOES, ['sem_alteracoes']));
        $this->actingAs($this->user)->post(route('questionnaires.barre.store'), $this->payload([
            'tempo_direito_segundos' => 0, 'alteracoes' => $alterations,
        ]))->assertSessionHasNoErrors();
        $q = Barre::sole();
        $this->assertSame(0, $q->tempo_direito_segundos);
        $this->assertSame($alterations, $q->alteracoes);
    }

    public function test_other_teams_cannot_access_records_or_private_files(): void
    {
        $q = Barre::factory()->create(['team_id' => Team::factory()->create()->id, 'pedido_medico' => 'secret.png']);
        $attachment = $q->attachments()->create(['path' => 'secret.png', 'original_name' => 'secret.png']);
        $this->actingAs($this->user)->get(route('questionnaires.barre.show', $q))->assertForbidden();
        $this->get(route('questionnaires.barre.edit', $q))->assertForbidden();
        $this->put(route('questionnaires.barre.update', $q), $this->payload())->assertForbidden();
        $this->delete(route('questionnaires.barre.destroy', $q))->assertForbidden();
        $this->get(route('pedidos-medicos.show', ['type' => 'barre', 'id' => $q->id]))->assertForbidden();
        $this->get(route('attachments.show', $attachment))->assertForbidden();
        $response = $this->get(route('questionnaires.barre.index'))->assertOk();
        $this->assertSame([], $response->inertiaPage()['props']['questionnaires']['data']);
    }

    public function test_disabled_module_blocks_direct_access(): void
    {
        $this->user->userModules()->update(['is_active' => false]);
        $this->actingAs($this->user)->get(route('questionnaires.barre.index'))->assertForbidden();
        $this->post(route('questionnaires.barre.store'), $this->payload())->assertForbidden();
    }

    public function test_invalid_data_does_not_save_records_or_uploaded_files(): void
    {
        Storage::fake('private');
        $this->actingAs($this->user)->post(route('questionnaires.barre.store'), $this->payload([
            'sustenta_60_segundos' => null, 'queda_lados' => ['invalid'],
            'assimetria_lado' => 'invalid', 'tempo_direito_segundos' => -1,
            'tempo_esquerdo_segundos' => 1.5, 'alteracoes' => ['invalid'],
            'anexos' => [UploadedFile::fake()->create('invalid.txt')],
            'pedido_medico' => UploadedFile::fake()->image('pedido.png'),
        ]))->assertSessionHasErrors(['sustenta_60_segundos', 'queda_lados.0', 'assimetria_lado', 'tempo_direito_segundos', 'tempo_esquerdo_segundos', 'alteracoes.0', 'anexos.0']);
        $this->assertDatabaseCount('barres', 0);
        $this->assertSame([], Storage::disk('private')->allFiles());
    }

    public function test_no_alterations_cannot_be_combined_with_abnormal_answers(): void
    {
        $this->actingAs($this->user)->post(route('questionnaires.barre.store'), $this->payload([
            'alteracoes' => ['sem_alteracoes'],
        ]))->assertSessionHasErrors('alteracoes');
        $this->assertDatabaseCount('barres', 0);
        $this->post(route('questionnaires.barre.store'), $this->payload([
            'alteracoes' => ['sem_alteracoes', 'fadiga'],
        ]))->assertSessionHasErrors('alteracoes');
        $this->assertDatabaseCount('barres', 0);
    }

    public function test_filters_and_list_payload_match_existing_questionnaires(): void
    {
        Barre::factory()->create(['team_id' => $this->team->id, 'nome_completo' => 'Maria Silva', 'clinica' => 'Centro', 'data_exame' => '2026-11-15', 'assinatura_paciente' => 'large-signature']);
        Barre::factory()->create(['team_id' => $this->team->id, 'nome_completo' => 'Outro', 'data_exame' => '2026-01-01']);
        $response = $this->actingAs($this->user)->get(route('questionnaires.barre.index', ['search' => 'maria', 'clinica' => 'centro', 'date_from' => '2026-11-01', 'date_to' => '2026-11-30', 'sort' => 'nome_completo', 'direction' => 'asc']))->assertOk();
        $rows = $response->inertiaPage()['props']['questionnaires']['data'];
        $this->assertCount(1, $rows);
        $this->assertSame('MARIA SILVA', $rows[0]['nome_completo']);
        $this->assertArrayNotHasKey('assinatura_paciente', $rows[0]);
    }
}
