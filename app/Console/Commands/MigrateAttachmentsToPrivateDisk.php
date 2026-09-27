<?php

namespace App\Console\Commands;

use App\Models\Attachment;
use App\Models\AvaliacaoEquilibrio;
use App\Models\Dinamometro;
use App\Models\Electroneuromiografia;
use App\Models\EletroneuromiografiaFacial;
use App\Models\Estesiometria;
use App\Models\MiniExameMental;
use App\Models\Potencial;
use App\Models\Questionnaire;
use App\Models\RastreioCognitivo;
use App\Models\TdahAdulto;
use App\Models\TdahInfantil;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Fase 2 del hardening multi-tenant: mueve anexos y pedidos médicos del disco
 * público (accesible sin login vía /storage) al disco privado.
 *
 * Los paths guardados en BD (ej. "anexos/abc.jpg") son relativos a la raíz del
 * disco, así que no hace falta reescribirlos: alcanza con mover el archivo
 * físico de una raíz a la otra.
 */
class MigrateAttachmentsToPrivateDisk extends Command
{
    protected $signature = 'attachments:migrate-to-private {--rollback : Mueve los archivos de vuelta al disco público}';

    protected $description = 'Mueve anexos y pedidos médicos del disco público al privado';

    private const PEDIDO_MEDICO_MODELS = [
        Questionnaire::class,
        Electroneuromiografia::class,
        EletroneuromiografiaFacial::class,
        Potencial::class,
        RastreioCognitivo::class,
        AvaliacaoEquilibrio::class,
        Estesiometria::class,
        TdahInfantil::class,
        TdahAdulto::class,
        Dinamometro::class,
        MiniExameMental::class,
    ];

    public function handle(): int
    {
        $rollback = (bool) $this->option('rollback');
        [$from, $to] = $rollback ? ['private', 'public'] : ['public', 'private'];

        $this->info(($rollback ? 'Revirtiendo' : 'Migrando')." archivos de disco '{$from}' a '{$to}'...");

        $movedAttachments = $this->moveAttachments($from, $to);
        $movedPedidos = $this->movePedidosMedicos($from, $to);

        $this->info("Anexos movidos: {$movedAttachments}. Pedidos médicos movidos: {$movedPedidos}.");

        return self::SUCCESS;
    }

    private function moveAttachments(string $from, string $to): int
    {
        $moved = 0;

        Attachment::query()->orderBy('id')->chunk(100, function ($attachments) use ($from, $to, &$moved) {
            foreach ($attachments as $attachment) {
                if ($this->moveFile($attachment->path, $from, $to)) {
                    $moved++;
                }
            }
        });

        return $moved;
    }

    private function movePedidosMedicos(string $from, string $to): int
    {
        $moved = 0;

        foreach (self::PEDIDO_MEDICO_MODELS as $modelClass) {
            $modelClass::query()->whereNotNull('pedido_medico')->orderBy('id')
                ->chunk(100, function ($models) use ($from, $to, &$moved) {
                    foreach ($models as $model) {
                        if ($this->moveFile($model->pedido_medico, $from, $to)) {
                            $moved++;
                        }
                    }
                });
        }

        return $moved;
    }

    /**
     * Mueve un archivo entre discos. Idempotente: si ya no está en el disco de
     * origen (ya migrado en una corrida anterior), no hace nada.
     */
    private function moveFile(?string $path, string $from, string $to): bool
    {
        if (! $path || ! Storage::disk($from)->exists($path)) {
            return false;
        }

        if (! Storage::disk($to)->exists($path)) {
            Storage::disk($to)->put($path, Storage::disk($from)->get($path));
        }

        Storage::disk($from)->delete($path);

        return true;
    }
}
