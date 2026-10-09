<?php

namespace Tests\Feature;

use App\Models\Potencial;
use App\Models\Team;
use App\Models\User;
use App\Models\UserModule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Recorrido end-to-end del trait UppercasesTextAttributes:
 * el payload llega en minúsculas por HTTP (como lo enviaría un navegador sin
 * el transform() de JavaScript) y el backend debe persistir MAYÚSCULAS en los
 * campos de texto libre, preservar los select y normalizar Unicode (NFC).
 *
 * resources/js/Utils/uppercase.js es el equivalente del lado del cliente;
 * estos tests cubren la red de seguridad del servidor.
 */
class UppercasesTextAttributesTest extends TestCase
{
    use RefreshDatabase;

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

    private function payload(array $extra = []): array
    {
        return array_merge([
            'nome' => 'Paciente Teste',
            'rg' => '123.456.789-00',
            'data_nascimento' => '1990-01-15',
            'data_exame' => '2026-10-08',
            'sexo' => 'Feminino',
            'solicitante' => 'Dr. Solicitante',
            'clinica' => 'Clinica Teste',
        ], $extra);
    }

    public function test_store_convierte_texto_libre_a_mayusculas_y_preserva_selects(): void
    {
        $team = Team::factory()->create();
        $user = $this->makeUserForTeam($team, 'potencial');

        $this->actingAs($user)->post(
            route('questionnaires.potencial.store'),
            $this->payload([
                'nome' => 'joão da silva',
                'clinica' => 'clínica são lucas',
                'solicitante' => 'dra. ana souza',
                'sexo' => 'Feminino',
            ])
        )->assertRedirect();

        $potencial = Potencial::firstOrFail();

        // Texto libre (whitelist del trait) => MAYÚSCULAS.
        $this->assertSame('JOÃO DA SILVA', $potencial->nome);
        $this->assertSame('CLÍNICA SÃO LUCAS', $potencial->clinica);
        $this->assertSame('DRA. ANA SOUZA', $potencial->solicitante);

        // Select con validación in: => valor exacto preservado (no se rompe).
        $this->assertSame('Feminino', $potencial->sexo);
    }

    public function test_update_vuelve_a_aplicar_mayusculas(): void
    {
        $team = Team::factory()->create();
        $user = $this->makeUserForTeam($team, 'potencial');

        $potencial = Potencial::factory()->create(['team_id' => $team->id]);

        $this->actingAs($user)->put(
            route('questionnaires.potencial.update', $potencial),
            $this->payload([
                'nome' => 'maria gonçalves',
                'clinica' => 'hospital santa rita',
            ])
        )->assertRedirect();

        $potencial->refresh();

        $this->assertSame('MARIA GONÇALVES', $potencial->nome);
        $this->assertSame('HOSPITAL SANTA RITA', $potencial->clinica);
    }

    public function test_normaliza_unicode_a_nfc_antes_de_encadenar_mayusculas(): void
    {
        $team = Team::factory()->create();
        $user = $this->makeUserForTeam($team, 'potencial');

        // "jose" + U+0301 (acento combinante) = forma descompuesta NFD.
        $this->actingAs($user)->post(
            route('questionnaires.potencial.store'),
            $this->payload([
                'nome' => "jose\u{0301} silva",
            ])
        )->assertRedirect();

        $potencial = Potencial::firstOrFail();

        // NFC compuesto: JOSÉ con É de un solo codepoint, sin combining marks.
        $this->assertSame('JOSÉ SILVA', $potencial->nome);
        $this->assertStringNotContainsString("\u{0301}", $potencial->nome);
    }

    public function test_el_trait_no_toca_campos_fuera_de_la_whitelist(): void
    {
        $team = Team::factory()->create();
        $user = $this->makeUserForTeam($team, 'potencial');

        $this->actingAs($user)->post(
            route('questionnaires.potencial.store'),
            $this->payload([
                'nome' => 'texto libre',
                'rg' => '123.456.789-00',
            ])
        )->assertRedirect();

        $potencial = Potencial::firstOrFail();

        // 'rg' tiene dígitos/puntuación: la whitelist lo incluye pero el
        // resultado es idéntico (no debe alterarse).
        $this->assertSame('123.456.789-00', $potencial->rg);
        $this->assertSame('TEXTO LIBRE', $potencial->nome);
    }
}
