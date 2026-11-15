<?php

namespace Tests\Feature;

use App\Models\Team;
use App\Models\User;
use App\Models\UserModule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class LoginRedirectTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'laudador']);
        $this->user = User::factory()->create();
        $this->user->assignRole('laudador');
        $this->user->teams()->attach(Team::factory()->create());
        UserModule::create(['user_id' => $this->user->id, 'module_name' => 'potencial', 'is_active' => true]);
    }

    private function credentials(): array
    {
        return ['email' => $this->user->email, 'password' => 'password'];
    }

    public function test_direct_login_opens_the_main_questionnaire_catalog(): void
    {
        $this->post(route('login'), $this->credentials())
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('questionnaires.index'));
        $this->assertAuthenticatedAs($this->user);
        $response = $this->get(route('questionnaires.index'))->assertOk();
        $this->assertSame('Questionnaires/Index', $response->inertiaPage()['component']);
        $modules = $response->inertiaPage()['props']['modules'];
        $this->assertCount(1, $modules);
        $this->assertSame('potencial', $modules[0]['icon']);
    }

    public function test_saved_potential_destination_does_not_override_the_main_catalog(): void
    {
        $this->get(route('questionnaires.potencial.index'))
            ->assertRedirect(route('login'));
        $this->assertSame(route('questionnaires.potencial.index'), session('url.intended'));

        $this->post(route('login'), $this->credentials())
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('questionnaires.index'))
            ->assertSessionMissing('url.intended');
        $this->assertAuthenticatedAs($this->user);
    }

    public function test_other_saved_destinations_are_also_cleared_after_login(): void
    {
        $this->withSession(['url.intended' => route('profile.edit')])
            ->post(route('login'), $this->credentials())
            ->assertRedirect(route('questionnaires.index'))
            ->assertSessionMissing('url.intended');
    }

    public function test_invalid_credentials_keep_the_user_on_the_login_page(): void
    {
        $this->from(route('login'))
            ->post(route('login'), ['email' => $this->user->email, 'password' => 'incorrect'])
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');
        $this->assertGuest();
    }
}
