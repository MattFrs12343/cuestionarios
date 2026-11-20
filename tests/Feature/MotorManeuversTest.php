<?php

namespace Tests\Feature;

use App\Models\Team;
use App\Models\User;
use App\Models\UserModule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class MotorManeuversTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Team $team;

    public static function cases(): array
    {
        return require __DIR__.'/../Fixtures/motor_maneuvers.php';
    }

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'laudador']);
        $this->team = Team::factory()->create();
        $this->user = User::factory()->create();
        $this->user->assignRole('laudador');
        $this->user->teams()->attach($this->team);
        foreach (array_keys(self::cases()) as $key) {
            UserModule::create(['user_id' => $this->user->id, 'module_name' => $key, 'is_active' => true]);
        }
    }

    private function payload(array $case, array $overrides = []): array
    {
        return array_merge([
            'nome_completo' => 'Paciente de teste', 'rg_ou_cpf' => 'TESTE-100',
            'data_nascimento' => '1990-05-10', 'sexo' => 'Feminino',
            'data_exame' => '2026-11-15', 'clinica' => 'Clínica Teste',
            'nome_avaliador' => 'Avaliador Teste', 'comentario' => 'Comentário do avaliador',
        ], $case['payload'], $overrides);
    }

    public function test_mingazzini_saves_either_block_and_clears_the_removed_block_on_edit(): void
    {
        $case = self::cases()['mingazzini'][0];
        $payload = $this->payload($case);
        $mmii = array_filter($payload, fn ($key) => ! str_starts_with($key, 'mmss_') && $key !== 'observacoes', ARRAY_FILTER_USE_KEY);
        $mmss = array_filter($payload, fn ($key) => ! str_starts_with($key, 'mmii_'), ARRAY_FILTER_USE_KEY);
        $this->actingAs($this->user)->post(route('questionnaires.mingazzini.store'), $mmii)->assertSessionHasNoErrors()->assertRedirect();
        $record = $case['model']::sole();
        $this->assertNull($record->mmss_desconforto);
        $this->assertSame('Direita', $record->mmii_membro_avaliado);
        $this->post(route('questionnaires.mingazzini.update', $record), $mmss + ['_method' => 'put'])->assertSessionHasNoErrors()->assertRedirect();
        $record->refresh();
        $this->assertNull($record->mmii_sustenta_posicao);
        $this->assertNull($record->mmii_membro_avaliado);
        $this->assertSame(mb_strtoupper($mmss['observacoes']), $record->observacoes);
        $this->post(route('questionnaires.mingazzini.store'), $mmss)->assertSessionHasNoErrors()->assertRedirect();
        $blank = array_filter($mmii, fn ($key) => ! str_starts_with($key, 'mmii_'), ARRAY_FILTER_USE_KEY);
        $this->post(route('questionnaires.mingazzini.store'), $blank)->assertSessionHasErrors('mmii_sustenta_posicao');
        $this->assertDatabaseCount('mingazzinis', 2);
    }

    #[DataProvider('cases')]
    public function test_create_preserves_every_clinical_answer_and_zero_seconds(array $case): void
    {
        $this->actingAs($this->user)->get(route("questionnaires.{$case['slug']}.create"))->assertOk();
        $this->post(route("questionnaires.{$case['slug']}.store"), $this->payload($case, ['team_id' => Team::factory()->create()->id, 'created_by' => 999]))
            ->assertSessionHasNoErrors()->assertRedirect(route("questionnaires.{$case['slug']}.index"));
        $q = $case['model']::sole();
        $this->assertSame($this->team->id, $q->team_id);
        $this->assertSame($this->user->id, $q->created_by);
        foreach ($case['payload'] as $field => $expected) {
            $this->assertSame($field === 'observacoes' ? mb_strtoupper($expected) : $expected, $q->$field, $field);
        }
        $response = $this->get(route("questionnaires.{$case['slug']}.show", $q))->assertOk();
        foreach ($case['payload'] as $field => $expected) {
            $this->assertSame($q->$field, $response->inertiaPage()['props']['questionnaire'][$field], $field);
        }
        $history = $this->get(route('history.index'))->assertOk();
        $this->assertSame($case['key'], $history->inertiaPage()['props']['timeline']['data'][0]['type_key']);
    }

    #[DataProvider('cases')]
    public function test_multipart_update_clears_hidden_fields_and_preserves_private_files(array $case): void
    {
        Storage::fake('private');
        $this->actingAs($this->user)->post(route("questionnaires.{$case['slug']}.store"), $this->payload($case, [
            'pedido_medico' => UploadedFile::fake()->image('pedido.png'),
            'anexos' => [UploadedFile::fake()->image('anexo.png')],
            'assinatura_paciente' => 'data:image/png;base64,dGVzdA==',
        ]))->assertSessionHasNoErrors();
        $q = $case['model']::sole();
        $pedido = $q->pedido_medico;
        $attachment = $q->attachments()->sole();
        $edit = $this->get(route("questionnaires.{$case['slug']}.edit", $q))->assertOk();
        $this->assertSame(route('pedidos-medicos.show', ['type' => $case['slug'], 'id' => $q->id]), $edit->inertiaPage()['props']['pedidoMedicoUrl']);
        $this->get(route('pedidos-medicos.show', ['type' => $case['slug'], 'id' => $q->id]))->assertOk();
        $this->get(route('attachments.show', $attachment))->assertOk();
        $this->post(route("questionnaires.{$case['slug']}.update", $q), $this->payload($case, array_merge(
            array_fill_keys($case['booleans'], false), ['_method' => 'put', 'pedido_medico' => null]
        )))->assertSessionHasNoErrors()->assertRedirect(route("questionnaires.{$case['slug']}.index"));
        $q->refresh();
        foreach ($case['conditional'] as $field => $expected) {
            $this->assertSame($expected, $q->$field, $field);
        }
        foreach ($case['booleans'] as $field) {
            $this->assertFalse($q->$field, $field);
        }
        $this->assertSame($pedido, $q->pedido_medico);
        $this->assertSame('data:image/png;base64,dGVzdA==', $q->assinatura_paciente);
        $this->assertSame($this->user->id, $q->updated_by);
        $this->delete(route("questionnaires.{$case['slug']}.destroy", $q))->assertRedirect();
        $this->assertModelMissing($q);
        Storage::disk('private')->assertMissing($pedido);
        Storage::disk('private')->assertMissing($attachment->path);
    }

    #[DataProvider('cases')]
    public function test_invalid_clinical_values_do_not_save_records_or_uploaded_files(array $case): void
    {
        Storage::fake('private');
        $this->actingAs($this->user)->post(route("questionnaires.{$case['slug']}.store"), $this->payload($case, array_merge($case['invalid'], [
            'pedido_medico' => UploadedFile::fake()->image('pedido.png'),
            'anexos' => [UploadedFile::fake()->create('invalid.txt')],
        ])))->assertSessionHasErrors([$case['key'] === 'mingazzini' ? 'mmii_assimetria_lado' : $case['booleans'][0], 'anexos.0']);
        $this->assertDatabaseCount($case['table'], 0);
        $this->assertSame([], Storage::disk('private')->allFiles());
    }

    #[DataProvider('cases')]
    public function test_module_can_be_disabled_without_disabling_the_others(array $case): void
    {
        $this->user->userModules()->where('module_name', $case['key'])->update(['is_active' => false]);
        $this->actingAs($this->user)->get(route("questionnaires.{$case['slug']}.index"))->assertForbidden();
        $this->post(route("questionnaires.{$case['slug']}.store"), $this->payload($case))->assertForbidden();
        foreach (self::cases() as $key => [$other]) {
            if ($key !== $case['key']) {
                $this->get(route("questionnaires.{$other['slug']}.index"))->assertOk();
            }
        }
    }

    #[DataProvider('cases')]
    public function test_index_filters_and_private_payloads_follow_existing_behavior(array $case): void
    {
        $case['model']::factory()->create(['team_id' => $this->team->id, 'nome_completo' => 'Maria Silva', 'clinica' => 'Centro', 'data_exame' => '2026-11-15', 'assinatura_paciente' => 'private-signature']);
        $case['model']::factory()->create(['team_id' => Team::factory()->create()->id, 'nome_completo' => 'Maria Outro']);
        $response = $this->actingAs($this->user)->get(route("questionnaires.{$case['slug']}.index", ['search' => 'maria', 'clinica' => 'centro', 'date_from' => '2026-11-01', 'date_to' => '2026-11-30', 'sort' => 'nome_completo', 'direction' => 'asc']))->assertOk();
        $rows = $response->inertiaPage()['props']['questionnaires']['data'];
        $this->assertCount(1, $rows);
        $this->assertSame('MARIA SILVA', $rows[0]['nome_completo']);
        $this->assertArrayNotHasKey('assinatura_paciente', $rows[0]);
        $this->assertArrayNotHasKey('pedido_medico', $rows[0]);
    }

    public function test_mingazzini_rejects_no_changes_when_abnormal_findings_are_selected(): void
    {
        [$case] = self::cases()['mingazzini'];
        $this->actingAs($this->user)->post(route('questionnaires.mingazzini.store'), $this->payload($case, ['mmii_alteracoes' => ['sem_alteracoes']]))->assertSessionHasErrors('mmii_alteracoes');
        $this->assertDatabaseCount('mingazzinis', 0);
    }
}
