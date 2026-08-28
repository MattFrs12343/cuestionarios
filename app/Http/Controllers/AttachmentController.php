<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\AvaliacaoEquilibrio;
use App\Models\Electroneuromiografia;
use App\Models\EletroneuromiografiaFacial;
use App\Models\Potencial;
use App\Models\Questionnaire;
use App\Models\RastreioCognitivo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    /** Máximo de anexos por cuestionario. */
    private const MAX = 5;

    /** Mapa slug de tipo -> modelo dueño. */
    private const TYPES = [
        'electroencefalograma'         => Questionnaire::class,
        'electroneuromiografia'        => Electroneuromiografia::class,
        'eletroneuromiografia-facial'  => EletroneuromiografiaFacial::class,
        'potencial'                    => Potencial::class,
        'rastreio-cognitivo'           => RastreioCognitivo::class,
        'equilibrio'                   => AvaliacaoEquilibrio::class,
    ];

    /**
     * Sube anexos (imágenes) a un cuestionario, respetando el tope de 5.
     */
    public function store(Request $request, string $type, int $id)
    {
        abort_unless(isset(self::TYPES[$type]), 404);

        $owner = self::TYPES[$type]::findOrFail($id);
        $this->authorizeAccess($owner);

        $request->validate([
            'anexos' => ['required', 'array', 'max:' . self::MAX],
            'anexos.*' => ['file', 'image', 'max:10240'], // 10 MB por imagen
        ]);

        $remaining = self::MAX - $owner->attachments()->count();

        if ($remaining <= 0) {
            return back()->with('error', 'Já foram atingidos os ' . self::MAX . ' anexos permitidos.');
        }

        foreach (array_slice($request->file('anexos'), 0, $remaining) as $file) {
            $path = $file->store('anexos', 'public');
            $owner->attachments()->create([
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
            ]);
        }

        return back()->with('success', 'Anexos enviados com sucesso!');
    }

    /**
     * Elimina un anexo, validando el acceso al cuestionario padre.
     */
    public function destroy(Attachment $attachment)
    {
        $owner = $attachment->attachable;

        if ($owner) {
            $this->authorizeAccess($owner);
        }

        Storage::disk('public')->delete($attachment->path);
        $attachment->delete();

        return back()->with('success', 'Anexo excluído com sucesso!');
    }

    /**
     * Verifica que el usuario pertenezca al equipo del cuestionario (o sea admin).
     */
    private function authorizeAccess($owner): void
    {
        $user = auth()->user();
        $teamId = $owner->team_id ?? null;

        if (! $user->isAdmin() && ! $user->teams->contains('id', $teamId)) {
            abort(403, 'No tienes permisos para gestionar los anexos de este cuestionario.');
        }
    }
}
