<?php

namespace Tests\Feature;

use App\Models\Team;
use App\Models\User;
use App\Models\UserModule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Cubre el camino feliz de servir los archivos de "Arquivos / Pedido Médico".
 *
 * Hasta ahora solo había tests del camino 403 (TenantIsolationTest), nunca del
 * 200: por eso un cambio que dejaba todas las <img> apuntando a una URL muerta
 * pasó inadvertido. Estos tests fijan tres cosas:
 *
 *  1. la prop `pedidoMedicoUrl` que ve el frontend es la ruta autenticada, no
 *     una ruta /storage... servida por el web server;
 *  2. la ruta autenticada devuelve 200 con los bytes reales y el Content-Type
 *     de la imagen (si devuelve HTML de login o un Content-Type vacío, el
 *     <img> se ve roto aunque el status sea 200);
 *  3. sin archivo en disco la ruta da 404 en vez de reventar.
 */
class AttachmentServingTest extends TestCase
{
    use RefreshDatabase;

    private const IMAGE = "\xFF\xD8\xFF\xE0JFIF-fake-bytes";

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'laudador']);

        Storage::fake('private');
    }

    /**
     * Los 11 tipos del registro central, leídos del config para no duplicar la
     * lista (mismo criterio que TenantIsolationTest).
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
     * Tipos cuya pantalla de detalle MUESTRA el pedido médico, y por lo tanto
     * necesitan que el controlador pase la prop `pedidoMedicoUrl`.
     */
    public static function questionnaireTypesWithPedidoMedico(): array
    {
        $cases = self::questionnaireTypes();

        unset(
            $cases['dinamometro'],
            $cases['estesiometria'],
            $cases['tdah_infantil'],
            $cases['tdah_adulto'],
        );

        return $cases;
    }

    /**
     * Tipos que todavía NO tienen la sección de pedido médico en su Show.
     * El backend acepta y borra el archivo (store/update/destroy), pero el
     * frontend nunca lo muestra. Se listan aparte para que la brecha sea
     * explícita: si se agrega la imagen a su Show, hay que pasar también la
     * prop en el controlador, y este provider obliga a actualizarlo.
     */
    public static function questionnaireTypesWithoutPedidoMedico(): array
    {
        $cases = self::questionnaireTypes();

        return array_intersect_key($cases, array_flip([
            'dinamometro', 'estesiometria', 'tdah_infantil', 'tdah_adulto',
        ]));
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

    #[DataProvider('questionnaireTypesWithPedidoMedico')]
    public function test_pedido_medico_url_is_the_authenticated_route(string $moduleName, string $slug, string $modelClass): void
    {
        $team = Team::factory()->create();
        $user = $this->makeUserForTeam($team, $moduleName);

        $path = 'medical_requests/fake-'.$moduleName.'.jpg';
        Storage::disk('private')->put($path, self::IMAGE);

        $record = $modelClass::factory()->create([
            'team_id' => $team->id,
            'pedido_medico' => $path,
        ]);

        $props = $this->actingAs($user)
            ->get(route("questionnaires.{$slug}.show", $record))
            ->assertOk()
            ->inertiaPage()['props'];

        $expected = route('pedidos-medicos.show', ['type' => $slug, 'id' => $record->id]);

        $this->assertSame($expected, $props['pedidoMedicoUrl']);
        $this->assertStringNotContainsString('/storage/', $props['pedidoMedicoUrl']);
    }

    #[DataProvider('questionnaireTypes')]
    public function test_pedido_medico_route_streams_the_image(string $moduleName, string $slug, string $modelClass): void
    {
        $team = Team::factory()->create();
        $user = $this->makeUserForTeam($team, $moduleName);

        $path = 'medical_requests/fake-'.$moduleName.'.jpg';
        Storage::disk('private')->put($path, self::IMAGE);

        $record = $modelClass::factory()->create([
            'team_id' => $team->id,
            'pedido_medico' => $path,
        ]);

        $response = $this->actingAs($user)
            ->get(route('pedidos-medicos.show', ['type' => $slug, 'id' => $record->id]));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'image/jpeg');
        $this->assertSame(self::IMAGE, $response->streamedContent());
    }

    #[DataProvider('questionnaireTypes')]
    public function test_pedido_medico_route_404s_when_the_file_is_gone(string $moduleName, string $slug, string $modelClass): void
    {
        $team = Team::factory()->create();
        $user = $this->makeUserForTeam($team, $moduleName);

        $record = $modelClass::factory()->create([
            'team_id' => $team->id,
            'pedido_medico' => 'medical_requests/ya-borrado.jpg',
        ]);

        $this->actingAs($user)
            ->get(route('pedidos-medicos.show', ['type' => $slug, 'id' => $record->id]))
            ->assertNotFound();
    }

    #[DataProvider('questionnaireTypesWithPedidoMedico')]
    public function test_pedido_medico_url_is_null_when_there_is_no_file(string $moduleName, string $slug, string $modelClass): void
    {
        $team = Team::factory()->create();
        $user = $this->makeUserForTeam($team, $moduleName);

        $record = $modelClass::factory()->create([
            'team_id' => $team->id,
            'pedido_medico' => null,
        ]);

        $props = $this->actingAs($user)
            ->get(route("questionnaires.{$slug}.show", $record))
            ->assertOk()
            ->inertiaPage()['props'];

        $this->assertNull($props['pedidoMedicoUrl']);
    }

    /**
     * Fija la brecha conocida: estos tipos guardan `pedido_medico` pero su Show
     * no lo muestra, así que el controlador no debe pasar la prop. Si alguien
     * agrega la sección al frontend, este test falla y le recuerda pasar también
     * `pedidoMedicoUrl` (o sacarlo de este provider).
     */
    #[DataProvider('questionnaireTypesWithoutPedidoMedico')]
    public function test_types_without_pedido_medico_ui_do_not_send_the_prop(string $moduleName, string $slug, string $modelClass): void
    {
        $team = Team::factory()->create();
        $user = $this->makeUserForTeam($team, $moduleName);

        $path = 'medical_requests/fake-'.$moduleName.'.jpg';
        Storage::disk('private')->put($path, self::IMAGE);

        $record = $modelClass::factory()->create([
            'team_id' => $team->id,
            'pedido_medico' => $path,
        ]);

        $props = $this->actingAs($user)
            ->get(route("questionnaires.{$slug}.show", $record))
            ->assertOk()
            ->inertiaPage()['props'];

        $this->assertArrayNotHasKey(
            'pedidoMedicoUrl',
            $props,
            "El Show de [{$slug}] todavia no muestra el pedido medico. Si le agregas la imagen, "
            .'pasa tambien la prop pedidoMedicoUrl en el controlador y mueve el tipo a '
            .'questionnaireTypesWithPedidoMedico().'
        );
    }

    public function test_pedido_medico_route_404s_for_an_unknown_type(): void
    {
        $team = Team::factory()->create();
        $user = $this->makeUserForTeam($team, 'potencial');

        $this->actingAs($user)
            ->get(route('pedidos-medicos.show', ['type' => 'no-existe', 'id' => 1]))
            ->assertNotFound();
    }

    public function test_attachment_route_streams_the_image(): void
    {
        $team = Team::factory()->create();
        $user = $this->makeUserForTeam($team, 'potencial');

        Storage::disk('private')->put('anexos/fake.jpg', self::IMAGE);

        $record = \App\Models\Potencial::factory()->create(['team_id' => $team->id]);
        $attachment = $record->attachments()->create([
            'path' => 'anexos/fake.jpg',
            'original_name' => 'fake.jpg',
        ]);

        $this->assertSame(
            route('attachments.show', $attachment),
            $attachment->url,
            'El accessor url del modelo debe apuntar a la ruta autenticada.'
        );

        $response = $this->actingAs($user)->get(route('attachments.show', $attachment));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'image/jpeg');
        $this->assertSame(self::IMAGE, $response->streamedContent());
    }

    public function test_attachment_route_404s_when_the_file_is_gone(): void
    {
        $team = Team::factory()->create();
        $user = $this->makeUserForTeam($team, 'potencial');

        $record = \App\Models\Potencial::factory()->create(['team_id' => $team->id]);
        $attachment = $record->attachments()->create([
            'path' => 'anexos/ya-borrado.jpg',
            'original_name' => 'ya-borrado.jpg',
        ]);

        $this->actingAs($user)
            ->get(route('attachments.show', $attachment))
            ->assertNotFound();
    }
}
