<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Models\Barre;
use App\Support\BoolCoerce;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BarreController extends Controller
{
    use HandlesAttachments, RestrictsQuestionnaireByTeam, HandlesSignatureUploads;

    private const SIGNATURE_FIELDS = ['assinatura_paciente'];

    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $this->currentTeam($request);

        $query = Barre::with(['team', 'creator', 'editor'])->where('team_id', $team->id);

        $this->applyIndexFilters($query, $request, ['nome_completo', 'rg_ou_cpf'], ['nome_completo', 'rg_ou_cpf', 'clinica', 'data_exame', 'created_at']);

        $questionnaires = $query->paginate($request->boolean('directory') ? 100 : 15);

        // No mandamos al listado la firma (LONGTEXT base64) ni el pedido
        // medico: no se muestran en la tabla y engordaban el payload de
        // cada pagina (el EEG, con mas registros/fotos, era el que mas sufria).
        $questionnaires->through(fn ($q) => $q->makeHidden(['assinatura_paciente', 'pedido_medico']));

        return Inertia::render('Questionnaires/Barre/Index', [
            'questionnaires' => $questionnaires,
            'filters' => array_filter($request->only(['search', 'date_from', 'date_to', 'clinica', 'sort', 'direction']), function ($value) {
                return $value !== null && $value !== '';
            }),
            'can' => [
                'create' => $user->can('create questionnaires'),
                'edit' => $user->can('edit questionnaires'),
                'delete' => $user->can('delete questionnaires'),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Questionnaires/Barre/Create');
    }

    private function rules(): array
    {
        return [
            'nome_completo' => 'required|string|max:255',
            'rg_ou_cpf' => 'required|string|max:255',
            'data_nascimento' => 'required|date',
            'sexo' => 'required|in:Masculino,Feminino',
            'clinica' => 'nullable|string|max:255',
            'data_exame' => 'required|date',
            'sustenta_60_segundos' => 'required|boolean',
            'queda_progressiva' => 'required|boolean',
            'queda_lados' => 'nullable|array|max:2',
            'queda_lados.*' => 'in:Direita,Esquerda|distinct',
            'tremor_oscilacao' => 'required|boolean',
            'tremor_lados' => 'nullable|array|max:2',
            'tremor_lados.*' => 'in:Direita,Esquerda|distinct',
            'assimetria' => 'required|boolean',
            'assimetria_lado' => 'nullable|in:Direita,Esquerda',
            'interrupcao' => 'required|boolean',
            'interrupcao_lados' => 'nullable|array|max:2',
            'interrupcao_lados.*' => 'in:Direita,Esquerda|distinct',
            'tempo_direito_segundos' => 'nullable|integer|min:0|max:3600',
            'tempo_esquerdo_segundos' => 'nullable|integer|min:0|max:3600',
            'alteracoes' => 'nullable|array|max:11',
            'alteracoes.*' => ['string', 'distinct', Rule::in(Barre::ALTERACOES)],
            'nome_avaliador' => 'nullable|string|max:255',
            'cid' => 'nullable|string|max:255',
            'comentario' => 'nullable|string',
            'pedido_medico' => 'nullable|file|image|max:10240',
        ] + $this->signatureRules(self::SIGNATURE_FIELDS);
    }

    private function normalizeAnswers(array $validated): array
    {
        $validated['queda_lados'] = $validated['queda_progressiva'] ? ($validated['queda_lados'] ?? []) : [];
        $validated['tremor_lados'] = $validated['tremor_oscilacao'] ? ($validated['tremor_lados'] ?? []) : [];
        $validated['assimetria_lado'] = $validated['assimetria'] ? ($validated['assimetria_lado'] ?? null) : null;
        $validated['interrupcao_lados'] = $validated['interrupcao'] ? ($validated['interrupcao_lados'] ?? []) : [];
        $validated['tempo_direito_segundos'] = $validated['interrupcao'] ? ($validated['tempo_direito_segundos'] ?? null) : null;
        $validated['tempo_esquerdo_segundos'] = $validated['interrupcao'] ? ($validated['tempo_esquerdo_segundos'] ?? null) : null;
        $validated['alteracoes'] = $validated['alteracoes'] ?? [];

        if (in_array('sem_alteracoes', $validated['alteracoes'], true)
            && (count($validated['alteracoes']) > 1 || $validated['queda_progressiva']
                || $validated['tremor_oscilacao'] || $validated['assimetria']
                || $validated['interrupcao'] || ! $validated['sustenta_60_segundos'])) {
            throw ValidationException::withMessages([
                'alteracoes' => 'A opção sem alterações não pode ser combinada com alterações ou interrupção da manobra.',
            ]);
        }

        unset($validated['anexos']);

        return $validated;
    }

    public function store(Request $request)
    {
        BoolCoerce::apply($request);

        $validated = $request->validate(array_merge($this->rules(), $this->attachmentRules()));
        $validated = $this->normalizeAnswers($validated);
        $validated['team_id'] = $this->currentTeam($request)->id;
        $validated['created_by'] = auth()->id();

        if ($request->hasFile('pedido_medico')) {
            $validated['pedido_medico'] = $request->file('pedido_medico')->store('medical_requests', 'private');
        }

        $this->applySignatureFields(null, $request, self::SIGNATURE_FIELDS, $validated);

        $model = Barre::create($validated);

        $this->storeAttachments($model, $request);

        return redirect()->route('questionnaires.barre.index')
            ->with('success', 'Questionário criado com sucesso!');
    }

    public function show(Barre $barre): Response
    {
        $this->authorizeTeamAccess($barre);

        $barre->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Barre/Show', [
            'questionnaire' => $barre->makeHidden(self::SIGNATURE_FIELDS),
            'pedidoMedicoUrl' => $barre->pedido_medico
                ? route('pedidos-medicos.show', ['type' => 'barre', 'id' => $barre->id])
                : null,
            'assinaturaPacienteUrl' => $this->signatureUrl($barre, 'assinatura_paciente', 'barre'),
            'can' => [
                'edit' => auth()->user()->can('edit questionnaires'),
                'delete' => auth()->user()->can('delete questionnaires'),
            ],
        ]);
    }

    public function edit(Barre $barre): Response
    {
        $this->authorizeTeamAccess($barre);

        $barre->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Barre/Edit', [
            'questionnaire' => $barre->makeHidden(self::SIGNATURE_FIELDS),
            'pedidoMedicoUrl' => $barre->pedido_medico ? route('pedidos-medicos.show', ['type' => 'barre', 'id' => $barre->id]) : null,
            'assinaturaPacienteUrl' => $this->signatureUrl($barre, 'assinatura_paciente', 'barre'),
        ]);
    }

    public function update(Request $request, Barre $barre)
    {
        $this->authorizeTeamAccess($barre);

        BoolCoerce::apply($request);

        $validated = $request->validate(array_merge($this->rules(), $this->attachmentRules()));
        $validated = $this->normalizeAnswers($validated);
        $validated['updated_by'] = auth()->id();

        if ($request->hasFile('pedido_medico')) {
            if ($barre->pedido_medico) {
                Storage::disk('private')->delete($barre->pedido_medico);
            }
            $validated['pedido_medico'] = $request->file('pedido_medico')->store('medical_requests', 'private');
        } else {
            unset($validated['pedido_medico']);
        }

        $this->applySignatureFields($barre, $request, self::SIGNATURE_FIELDS, $validated);

        $barre->update($validated);

        $this->storeAttachments($barre, $request);

        return redirect()->route('questionnaires.barre.index')
            ->with('success', 'Questionário atualizado com sucesso!');
    }

    public function destroy(Barre $barre)
    {
        $this->authorizeTeamAccess($barre);

        if ($barre->pedido_medico) {
            Storage::disk('private')->delete($barre->pedido_medico);
        }

        foreach (self::SIGNATURE_FIELDS as $field) {
            $this->deleteStoredSignature($barre->{$field});
        }

        $barre->delete();

        return redirect()->route('questionnaires.barre.index')
            ->with('success', 'Questionário excluído com sucesso!');
    }
}
