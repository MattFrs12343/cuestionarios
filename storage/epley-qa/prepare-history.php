<?php
require __DIR__.'/../../vendor/autoload.php';
$app=require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
if(realpath(config('database.connections.sqlite.database'))!==realpath(__DIR__.'/database.sqlite')) throw new RuntimeException('QA only');
$cases=require __DIR__.'/../../tests/Fixtures/motor_maneuvers.php';
foreach(['finger_tapping','mingazzini'] as $key){
 [$case]=$cases[$key];
 $source=$case['model']::firstOrFail();
 $data=$source->getAttributes(); unset($data['id'],$data['created_at'],$data['updated_at']);
 $data=array_merge($data,['nome_completo'=>'PACIENTE DEMO HISTORIAL','rg_ou_cpf'=>'QA-HISTORIA-001','data_nascimento'=>'1992-08-12']);
 $case['model']::firstOrCreate(['rg_ou_cpf'=>'QA-HISTORIA-001'],$data);
}
echo "QA history fixture ready\n";
