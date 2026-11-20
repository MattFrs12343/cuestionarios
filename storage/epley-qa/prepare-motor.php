<?php
require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
if (realpath(config('database.connections.sqlite.database')) !== realpath(__DIR__.'/database.sqlite')) {
    throw new RuntimeException('Only the isolated QA database is permitted.');
}
$team = App\Models\Team::where('name', 'Equipe Principal')->firstOrFail();
$user = App\Models\User::where('email', 'admin@cuestionarios.test')->firstOrFail();
$cases = require __DIR__.'/../../tests/Fixtures/motor_maneuvers.php';
foreach ($cases as $key => [$case]) {
    $team->modules()->updateOrCreate(['module_name' => $key], ['is_active' => true]);
    $data = array_merge($case['payload'], [
        'nome_completo' => 'PACIENTE TESTE '.strtoupper($key), 'rg_ou_cpf' => 'QA-'.$key,
        'data_nascimento' => '1990-05-10', 'data_exame' => '2026-11-15', 'sexo' => 'Feminino',
        'clinica' => 'CLINICA TESTE', 'nome_avaliador' => 'AVALIADOR TESTE',
        'team_id' => $team->id, 'created_by' => $user->id,
    ]);
    $record = $case['model']::firstOrCreate(['rg_ou_cpf' => 'QA-'.$key], $data);
    echo $case['slug'].' '.$record->id."\n";
}
