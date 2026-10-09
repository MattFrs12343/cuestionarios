<?php

namespace Tests\Feature;

use App\Models\ElectroneuromiografiaFacial;
use App\Models\Potencial;
use App\Models\Team;
use App\Models\User;
use App\Models\UserModule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Visibilidad de campos a nivel HTTP: que el controlador pase la prop
 * `fieldVisibility` a las cuatro vistas y que descarte en el servidor lo que el
 * equipo no tiene permitido, aunque venga manipulado en el payload.
 *
 * El id 5 es el equipo "Azul" configurado en config/questionnaire_fields.php.
 */
class QuestionnaireFieldVisibilityTest extends TestCase
{
    use RefreshDatabase;

    private const AZUL_ID = 5;
    private const OTRO_ID = 1;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'laudador']);
    }

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

    private function azul(): Team
    {
        return Team::factory()->create(['id' => self::AZUL_ID, 'name' => 'Azul']);
    }

    private function otro(): Team
    {
        return Team::factory()->create(['id' => self::OTRO_ID, 'name' => 'Rojo']);
    }

    private function potencialPayload(array $extra = []): array
    {
        return array_merge([
            'nome' => 'Paciente Teste',
            'rg' => '123.456.789-00',
            'data_nascimento' => '1990-01-15',
            'data_exame' => '2026-09-29',
            'sexo' => 'Feminino',
            'solicitante' => 'Dr. Solicitante',
            'clinica' => 'Clínica Teste',
        ], $extra);
    }

    private function facialPayload(array $extra = []): array
    {
        return array_merge([
            'nome' => 'Paciente Teste',
            'rg' => '123.456.789-00',
            'data_nascimento' => '1990-01-15',
            'data_exame' => '2026-09-29',
            'sexo' => 'Feminino',
            'solicitante' => 'Dr. Solicitante',
            'clinica' => 'Clínica Teste',
        ], $extra);
    }

    // ---------------------------------------------------------------- Potencial

    public function test_potencial_azul_no_persiste_peso_ni_altura_manipulados(): void
    {
        $team = $this->azul();
        $user = $this->makeUserForTeam($team, 'potencial');

        $this->actingAs($user)->post(route('questionnaires.potencial.store'), $this->potencialPayload([
            'peso' => '80',
            'altura' => '1,75',
            'hiperativo' => true,
        ]))->assertRedirect();

        $potencial = Potencial::firstOrFail();

        // Ocultos en la UI => el backend tampoco los acepta si se mandan a mano.
        $this->assertNull($potencial->peso);
        $this->assertNull($potencial->altura);

        // Exclusivo de Azul => sí se guarda.
        $this->assertTrue($potencial->hiperativo);
    }

    public function test_potencial_otro_equipo_no_persiste_hiperativo_manipulado(): void
    {
        $team = $this->otro();
        $user = $this->makeUserForTeam($team, 'potencial');

        $this->actingAs($user)->post(route('questionnaires.potencial.store'), $this->potencialPayload([
            'peso' => '80',
            'altura' => '1,75',
            'hiperativo' => true,
        ]))->assertRedirect();

        $potencial = Potencial::firstOrFail();

        // Este equipo sí llena peso/altura...
        $this->assertSame('80', $potencial->peso);
        $this->assertSame('1,75', $potencial->altura);

        // ...pero el exclusivo de Azul no entra.
        $this->assertNull($potencial->hiperativo);
    }

    public function test_potencial_update_tambien_filtra(): void
    {
        $team = $this->otro();
        $user = $this->makeUserForTeam($team, 'potencial');

        $potencial = Potencial::factory()->create([
            'team_id' => $team->id,
            'peso' => '80',
        ]);

        $this->actingAs($user)->put(route('questionnaires.potencial.update', $potencial), $this->potencialPayload([
            'peso' => '99',
            'hiperativo' => true,
        ]))->assertRedirect();

        $potencial->refresh();

        $this->assertNull($potencial->hiperativo);
        $this->assertSame('99', $potencial->peso);
    }

    public function test_potencial_conserva_datos_existentes_de_peso_al_editar_para_azul(): void
    {
        // Al ocultar los campos NO se borra lo que ya estaba cargado.
        $team = $this->azul();
        $user = $this->makeUserForTeam($team, 'potencial');

        $potencial = Potencial::factory()->create([
            'team_id' => $team->id,
            'peso' => '80',
            'altura' => '1,75',
        ]);

        $this->actingAs($user)->put(route('questionnaires.potencial.update', $potencial), $this->potencialPayload([
            'nome' => 'Nombre Actualizado',
        ]))->assertRedirect();

        $potencial->refresh();

        $this->assertSame('80', $potencial->peso);
        $this->assertSame('1,75', $potencial->altura);
        $this->assertSame('NOMBRE ACTUALIZADO', $potencial->nome);
    }

    public function test_potencial_prop_de_visibilidad_por_vista(): void
    {
        $team = $this->azul();
        $user = $this->makeUserForTeam($team, 'potencial');
        $potencial = Potencial::factory()->create(['team_id' => $team->id]);

        $vistas = [
            'index' => route('questionnaires.potencial.index'),
            'create' => route('questionnaires.potencial.create'),
            'show' => route('questionnaires.potencial.show', $potencial),
            'edit' => route('questionnaires.potencial.edit', $potencial),
        ];

        foreach ($vistas as $nombre => $url) {
            $this->actingAs($user)->get($url)
                ->assertOk()
                ->assertInertia(fn ($page) => $page
                    ->where('fieldVisibility.hidden', fn ($hidden) => collect($hidden)->contains('peso') && collect($hidden)->contains('altura'))
                    ->where('fieldVisibility.hidden', fn ($hidden) => ! collect($hidden)->contains('hiperativo'))
                );
        }
    }

    public function test_potencial_otro_equipo_recibe_lista_oculta_con_hiperativo(): void
    {
        $team = $this->otro();
        $user = $this->makeUserForTeam($team, 'potencial');

        $this->actingAs($user)->get(route('questionnaires.potencial.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('fieldVisibility.hidden', fn ($hidden) => collect($hidden)->contains('hiperativo'))
                ->where('fieldVisibility.hidden', fn ($hidden) => ! collect($hidden)->contains('peso'))
            );
    }

    // ------------------------------------------------------------------- Facial

    public function test_facial_azul_persiste_avc(): void
    {
        $team = $this->azul();
        $user = $this->makeUserForTeam($team, 'electroneuromiografia_facial');

        $this->actingAs($user)->post(
            route('questionnaires.electroneuromiografia-facial.store'),
            $this->facialPayload(['teve_avc' => '1', 'avc_quando' => '2019'])
        )->assertRedirect();

        $facial = ElectroneuromiografiaFacial::firstOrFail();

        $this->assertTrue($facial->teve_avc);
        $this->assertSame('2019', $facial->avc_quando);
    }

    public function test_facial_otro_equipo_no_persiste_avc_manipulado(): void
    {
        $team = $this->otro();
        $user = $this->makeUserForTeam($team, 'electroneuromiografia_facial');

        $this->actingAs($user)->post(
            route('questionnaires.electroneuromiografia-facial.store'),
            $this->facialPayload([
                'teve_avc' => '1',
                'avc_quando' => '2019',
                'tem_enxaqueca' => '1',
            ])
        )->assertRedirect();

        $facial = ElectroneuromiografiaFacial::firstOrFail();

        $this->assertNull($facial->teve_avc);
        $this->assertNull($facial->avc_quando);

        // Un campo normal del mismo cuestionario sigue guardando normal.
        $this->assertTrue($facial->tem_enxaqueca);
    }

    public function test_facial_prop_de_visibilidad_por_vista(): void
    {
        $team = $this->azul();
        $user = $this->makeUserForTeam($team, 'electroneuromiografia_facial');
        $facial = ElectroneuromiografiaFacial::factory()->create(['team_id' => $team->id]);

        $vistas = [
            'index' => route('questionnaires.electroneuromiografia-facial.index'),
            'create' => route('questionnaires.electroneuromiografia-facial.create'),
            'show' => route('questionnaires.electroneuromiografia-facial.show', $facial),
            'edit' => route('questionnaires.electroneuromiografia-facial.edit', $facial),
        ];

        foreach ($vistas as $nombre => $url) {
            $this->actingAs($user)->get($url)
                ->assertOk()
                ->assertInertia(fn ($page) => $page
                    ->where('fieldVisibility.hidden', fn ($hidden) => ! collect($hidden)->contains('teve_avc') && ! collect($hidden)->contains('avc_quando'))
                );
        }
    }

    public function test_facial_otro_equipo_recibe_lista_oculta_con_avc(): void
    {
        $team = $this->otro();
        $user = $this->makeUserForTeam($team, 'electroneuromiografia_facial');

        $this->actingAs($user)->get(route('questionnaires.electroneuromiografia-facial.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('fieldVisibility.hidden', fn ($hidden) => collect($hidden)->contains('teve_avc') && collect($hidden)->contains('avc_quando'))
            );
    }
}
