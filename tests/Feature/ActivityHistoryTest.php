<?php

namespace Tests\Feature;

use App\Models\RastreioCognitivo;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Historial de actividad: línea de tiempo UNION de los cuestionarios.
 *
 * Verifica tres cosas críticas:
 * - Un usuario normal solo ve sus propios registros (aislamiento por created_by).
 * - Un administrador de equipo ve todo el equipo activo.
 * - El selector de rango filtra por created_at, no por data_exame.
 */
class ActivityHistoryTest extends TestCase
{
    use RefreshDatabase;

    private Team $team;

    private User $worker;

    private User $other;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'laudador']);
        Role::firstOrCreate(['name' => 'administrador']);

        $this->team = Team::factory()->create();

        $this->worker = User::factory()->create();
        $this->worker->assignRole('laudador');
        $this->worker->teams()->attach($this->team);

        $this->other = User::factory()->create();
        $this->other->assignRole('laudador');
        $this->other->teams()->attach($this->team);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('administrador');
        $this->admin->teams()->attach($this->team);
    }

    private function record(User $creator, ?string $createdAt = null): RastreioCognitivo
    {
        $record = RastreioCognitivo::factory()->create([
            'team_id' => $this->team->id,
            'nome_completo' => 'Paciente '.$creator->id,
            'created_by' => $creator->id,
        ]);

        if ($createdAt) {
            $record->forceFill(['created_at' => $createdAt])->save();
        }

        return $record;
    }

    public function test_un_usuario_solo_ve_sus_propios_registros(): void
    {
        $this->record($this->worker);
        $this->record($this->other);

        $response = $this->actingAs($this->worker)->get(route('history.index'));

        $rows = $response->inertiaPage()['props']['timeline']['data'];

        $this->assertCount(1, $rows);
        $this->assertSame($this->worker->id, $rows[0]['created_by']);
    }

    public function test_un_administrador_ve_todo_el_equipo(): void
    {
        $this->record($this->worker);
        $this->record($this->other);

        $response = $this->actingAs($this->admin)->get(route('history.index'));

        $rows = $response->inertiaPage()['props']['timeline']['data'];

        $this->assertCount(2, $rows);
    }

    public function test_el_rango_filtra_por_created_at(): void
    {
        $this->record($this->worker);
        $this->record($this->worker, now()->subDays(10)->toDateTimeString());

        $sevenDays = $this->actingAs($this->worker)->get(route('history.index', ['range' => '7d']));
        $thirtyDays = $this->actingAs($this->worker)->get(route('history.index', ['range' => '30d']));

        $this->assertCount(1, $sevenDays->inertiaPage()['props']['timeline']['data']);
        $this->assertCount(2, $thirtyDays->inertiaPage()['props']['timeline']['data']);
    }

    public function test_los_conteos_respetan_el_rango(): void
    {
        $this->record($this->worker);
        $this->record($this->worker, now()->subDays(10)->toDateTimeString());

        $response = $this->actingAs($this->worker)->get(route('history.index', ['range' => '7d']));

        $counts = collect($response->inertiaPage()['props']['counts'])
            ->firstWhere('type_key', 'rastreio_cognitivo');

        $this->assertSame(1, $counts['count']);
    }
}
