<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    /** Máximo de anexos por cuestionario. */
    private const MAX = 5;

    /**
     * Mapa slug de tipo -> modelo dueño, derivado de config/questionnaires.php.
     * Público: lo reutiliza PedidoMedicoController.
     *
     * Incluye los slugs de "legacy_slugs" (apuntan al mismo modelo) para que
     * los enlaces ya compartidos con el nombre anterior sigan funcionando.
     */
    public static function types(): array
    {
        $types = collect(config('questionnaires.types'))
            ->mapWithKeys(fn (array $type) => [$type['slug'] => $type['model']]);

        $all = config('questionnaires.types');
        foreach (config('questionnaires.legacy_slugs', []) as $legacy => $current) {
            if (isset($all[$current])) {
                $types->put($legacy, $all[$current]['model']);
            }
        }

        return $types->all();
    }

    /**
     * Sube anexos (imágenes) a un cuestionario, respetando el tope de 5.
     */
    public function store(Request $request, string $type, int $id)
    {
        $types = self::types();
        abort_unless(isset($types[$type]), 404);

        $owner = $types[$type]::findOrFail($id);
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
            $path = $file->store('anexos', 'private');
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

        abort_if(! $owner, 404);

        $this->authorizeAccess($owner);

        Storage::disk('private')->delete($attachment->path);
        $attachment->delete();

        return back()->with('success', 'Anexo excluído com sucesso!');
    }

    /**
     * Sirve el anexo de forma autenticada (disco privado). Usa response(), no
     * download(): así el navegador lo muestra inline y el <img src> sigue
     * funcionando en vez de forzar la descarga del archivo.
     */
    public function show(Attachment $attachment)
    {
        $owner = $attachment->attachable;

        abort_if(! $owner, 404);

        $this->authorizeAccess($owner);

        abort_unless(Storage::disk('private')->exists($attachment->path), 404);

        return Storage::disk('private')->response($attachment->path);
    }

    /**
     * Verifica que el usuario pertenezca al equipo del cuestionario (o sea super-admin).
     * Antes usaba isAdmin(), lo que permitía a un administrador de OTRO equipo
     * gestionar anexos de cuestionarios ajenos: isAdmin() es un rol Spatie global,
     * no implica pertenencia al equipo del recurso.
     */
    private function authorizeAccess($owner): void
    {
        $user = auth()->user();
        $teamId = $owner->team_id ?? null;

        if (! $user->isSuperAdmin() && ! $user->teams->contains('id', $teamId)) {
            abort(403, 'No tienes permisos para gestionar los anexos de este cuestionario.');
        }
    }
}
