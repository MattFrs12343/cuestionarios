<?php

namespace Tests\Feature;

use App\Models\Epley;
use App\Models\Team;
use App\Models\User;
use App\Models\UserModule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class EpleyTest extends TestCase
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
        UserModule::create(['user_id' => $this->user->id, 'module_name' => 'epley', 'is_active' => true]);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'nome_completo' => 'Paciente de prueba', 'rg_ou_cpf' => '123456',
            'data_nascimento' => '1990-05-10', 'sexo' => 'Feminino',
            'clinica' => 'Clínica de prueba', 'data_exame' => '2026-11-15',
            'vertigem' => 'true', 'vertigem_lados' => ['Direita', 'Esquerda'],
            'nistagmo' => 'false', 'nistagmo_lados' => [],
            'desconforto' => 'true', 'observacoes' => 'Náuseas',
            'mantem_posicao' => 'true', 'tempo_mantido_segundos' => 45,
            'melhora_vertigem' => 'Melhora parcial', 'nome_avaliador' => 'Dra. Teste',
            'cid' => 'H81.1', 'comentario' => 'Observación de prueba',
        ], $overrides);
    }

    public function test_create_and_detail_preserve_answers_and_force_current_team(): void
    {
        $this->actingAs($this->user)->get(route('questionnaires.epley.create'))->assertOk();
        $this->post(route('questionnaires.epley.store'), $this->payload(['team_id' => Team::factory()->create()->id, 'created_by' => 999]))
            ->assertSessionHasNoErrors()->assertRedirect(route('questionnaires.epley.index'));
        $q = Epley::sole();
        $this->assertSame($this->team->id, $q->team_id);
        $this->assertSame($this->user->id, $q->created_by);
        $this->assertSame(['Direita', 'Esquerda'], $q->vertigem_lados);
        $this->assertFalse($q->nistagmo);
        $this->assertSame('NÁUSEAS', $q->observacoes);
        $this->assertSame('Melhora parcial', $q->melhora_vertigem);
        $response = $this->get(route('questionnaires.epley.show', $q))->assertOk();
        $this->assertSame(45, $response->inertiaPage()['props']['questionnaire']['tempo_mantido_segundos']);
        $this->get(route('history.index'))->assertOk();
        $this->get(route('questionnaires.index'))->assertOk();
    }

    public function test_multipart_update_clears_hidden_answers_and_preserves_files(): void
    {
        Storage::fake('private');
        $this->actingAs($this->user)->post(route('questionnaires.epley.store'), $this->payload([
            'pedido_medico' => UploadedFile::fake()->image('pedido.png'),
            'anexos' => [UploadedFile::fake()->image('anexo.png')],
            'assinatura_paciente' => 'data:image/png;base64,dGVzdA==',
        ]))->assertSessionHasNoErrors();
        $q = Epley::sole();
        $pedido = $q->pedido_medico;
        $attachment = $q->attachments()->sole();
        $this->get(route('questionnaires.epley.edit', $q))->assertOk();
        $this->get(route('pedidos-medicos.show', ['type' => 'epley', 'id' => $q->id]))->assertOk();
        $this->get(route('attachments.show', $attachment))->assertOk();
        $this->post(route('questionnaires.epley.update', $q), $this->payload([
            '_method' => 'put', 'pedido_medico' => null,
            'vertigem' => 'false', 'nistagmo' => 'false', 'nistagmo_lados' => ['Direita'],
            'desconforto' => 'false', 'observacoes' => 'Stale hidden value',
            'melhora_vertigem' => 'Não', 'tempo_mantido_segundos' => 0,
        ]))->assertSessionHasNoErrors()->assertRedirect(route('questionnaires.epley.index'));
        $q->refresh();
        $this->assertSame([], $q->vertigem_lados);
        $this->assertSame([], $q->nistagmo_lados);
        $this->assertNull($q->observacoes);
        $this->assertSame(0, $q->tempo_mantido_segundos);
        $this->assertSame($pedido, $q->pedido_medico);
        $this->assertSame($this->user->id, $q->updated_by);
        $this->assertSame('data:image/png;base64,dGVzdA==', $q->assinatura_paciente);
        Storage::disk('private')->assertExists($pedido);
        $this->delete(route('questionnaires.epley.destroy', $q))->assertRedirect();
        $this->assertModelMissing($q);
        Storage::disk('private')->assertMissing($pedido);
        Storage::disk('private')->assertMissing($attachment->path);
    }

    public function test_other_team_records_and_files_are_forbidden_and_not_listed(): void
    {
        $q = Epley::factory()->create(['team_id' => Team::factory()->create()->id, 'pedido_medico' => 'secret.png']);
        $attachment = $q->attachments()->create(['path' => 'secret.png', 'original_name' => 'secret.png']);
        $this->actingAs($this->user)->get(route('questionnaires.epley.show', $q))->assertForbidden();
        $this->get(route('questionnaires.epley.edit', $q))->assertForbidden();
        $this->put(route('questionnaires.epley.update', $q), $this->payload())->assertForbidden();
        $this->delete(route('questionnaires.epley.destroy', $q))->assertForbidden();
        $this->get(route('pedidos-medicos.show', ['type' => 'epley', 'id' => $q->id]))->assertForbidden();
        $this->get(route('attachments.show', $attachment))->assertForbidden();
        $response = $this->get(route('questionnaires.epley.index'))->assertOk();
        $this->assertSame([], $response->inertiaPage()['props']['questionnaires']['data']);
    }

    public function test_disabled_module_blocks_direct_access(): void
    {
        $this->user->userModules()->update(['is_active' => false]);
        $this->actingAs($this->user)->get(route('questionnaires.epley.index'))->assertForbidden();
        $this->post(route('questionnaires.epley.store'), $this->payload())->assertForbidden();
    }

    public function test_invalid_answers_and_attachments_do_not_create_records(): void
    {
        Storage::fake('private');
        $this->actingAs($this->user)->post(route('questionnaires.epley.store'), $this->payload([
            'vertigem' => null, 'vertigem_lados' => ['invalid'], 'tempo_mantido_segundos' => -1,
            'melhora_vertigem' => 'invalid', 'anexos' => [UploadedFile::fake()->create('invalid.txt')],
            'pedido_medico' => UploadedFile::fake()->image('pedido.png'),
        ]))->assertSessionHasErrors(['vertigem', 'vertigem_lados.0', 'tempo_mantido_segundos', 'melhora_vertigem', 'anexos.0']);
        $this->assertDatabaseCount('epleys', 0);
        $this->assertSame([], Storage::disk('private')->allFiles());
    }

    public function test_filters_and_list_payload_match_existing_questionnaires(): void
    {
        Epley::factory()->create(['team_id' => $this->team->id, 'nome_completo' => 'Maria Silva', 'clinica' => 'Centro', 'data_exame' => '2026-11-15', 'assinatura_paciente' => 'large-signature']);
        Epley::factory()->create(['team_id' => $this->team->id, 'nome_completo' => 'Outro', 'data_exame' => '2026-01-01']);
        $response = $this->actingAs($this->user)->get(route('questionnaires.epley.index', ['search' => 'maria', 'clinica' => 'centro', 'date_from' => '2026-11-01', 'date_to' => '2026-11-30', 'sort' => 'nome_completo', 'direction' => 'asc']))->assertOk();
        $rows = $response->inertiaPage()['props']['questionnaires']['data'];
        $this->assertCount(1, $rows);
        $this->assertSame('MARIA SILVA', $rows[0]['nome_completo']);
        $this->assertArrayNotHasKey('assinatura_paciente', $rows[0]);
    }
}
