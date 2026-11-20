<?php
require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
if (realpath(config('database.connections.sqlite.database')) !== realpath(__DIR__.'/database.sqlite')) {
    throw new RuntimeException('Only the isolated QA database is permitted.');
}
$team = App\Models\Team::where('name', 'Equipe Principal')->firstOrFail();
$team->modules()->updateOrCreate(['module_name' => 'barre'], ['is_active' => true]);
echo "Barre enabled for the isolated QA team.\n";
