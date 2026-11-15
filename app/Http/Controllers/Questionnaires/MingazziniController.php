<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Models\Mingazzini;
use App\Support\BoolCoerce;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MingazziniController extends Controller
{
    use HandlesAttachments, RestrictsQuestionnaireByTeam;

    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $this->currentTeam($request);

        $query = Mingazzini::with(['team', 'creator', 'editor'])->where('team_id', $team->id);

        $this->applyIndexFilters($query, $request, ['nome_completo', 'rg_ou_cpf'], ['nome_completo', 'rg_ou_cpf', 'clinica', 'data_exame', 'created_at']);

        $questionnaires = $query->paginate(15);

        // No mandamos al listado la firma (LONGTEXT base64) ni el pedido
        // medico: no se muestran en la tabla y engordaban el payload de
        // cada pagina (el EEG, con mas registros/fotos, era el que mas sufria).
        $questionnaires->through(fn ($q) => $q->makeHidden(['assinatura_paciente', 'pedido_medico']));

        return Inertia::render('Questionnaires/Mingazzini/Index', [
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
        return Inertia::render('Questionnaires/Mingazzini/Create');
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
            'mmii_sustenta_posicao' => 'required|boolean',
            'mmii_queda' => 'required|boolean',
            'mmii_queda_lados' => 'nullable|array|max:2',
            'mmii_queda_lados.*' => ['string', 'distinct', Rule::in(['Direita', 'Esquerda'])],
            'mmii_tremor' => 'required|boolean',
            'mmii_tremor_lados' => 'nullable|array|max:2',
            'mmii_tremor_lados.*' => ['string', 'distinct', Rule::in(['Direita', 'Esquerda'])],
            'mmii_assimetria' => 'required|boolean',
            'mmii_assimetria_lado' => 'nullable|in:Direita,Esquerda',
            'mmii_interrupcao' => 'required|boolean',
            'mmii_interrupcao_lados' => 'nullable|array|max:2',
            'mmii_interrupcao_lados.*' => ['string', 'distinct', Rule::in(['Direita', 'Esquerda'])],
            'mmii_tempo_direito_segundos' => 'nullable|integer|min:0|max:3600',
            'mmii_tempo_esquerdo_segundos' => 'nullable|integer|min:0|max:3600',
            'mmii_alteracoes' => 'nullable|array|max:10',
            'mmii_alteracoes.*' => ['string', 'distinct', Rule::in(['queda_progressiva_direita', 'queda_progressiva_esquerda', 'queda_subita_direita', 'queda_subita_esquerda', 'fadiga_direita', 'fadiga_esquerda', 'tremor', 'dor', 'incapacidade', 'sem_alteracoes'])],
            'mmss_sustenta_posicao' => 'required|boolean',
            'mmss_queda_pronacao' => 'required|boolean',
            'mmss_queda_lados' => 'nullable|array|max:2',
            'mmss_queda_lados.*' => ['string', 'distinct', Rule::in(['Direita', 'Esquerda'])],
            'mmss_tremor' => 'required|boolean',
            'mmss_tremor_lados' => 'nullable|array|max:2',
            'mmss_tremor_lados.*' => ['string', 'distinct', Rule::in(['Direita', 'Esquerda'])],
            'mmss_assimetria' => 'required|boolean',
            'mmss_assimetria_lado' => 'nullable|in:Direita,Esquerda,Bilateral',
            'mmss_desconforto' => 'required|boolean',
            'observacoes' => 'nullable|string|max:5000',
            'mmss_tempo_direito_segundos' => 'nullable|integer|min:0|max:3600',
            'mmss_tempo_esquerdo_segundos' => 'nullable|integer|min:0|max:3600',
            'nome_avaliador' => 'nullable|string|max:255',
            'cid' => 'nullable|string|max:255',
            'comentario' => 'nullable|string',
            'assinatura_paciente' => 'nullable|string',
            'pedido_medico' => 'nullable|file|image|max:10240',
        ];
    }

    private function normalizeAnswers(array $validated): array
    {
        $validated['mmii_queda_lados'] = $validated['mmii_queda'] ? ($validated['mmii_queda_lados'] ?? []) : [];
        $validated['mmii_tremor_lados'] = $validated['mmii_tremor'] ? ($validated['mmii_tremor_lados'] ?? []) : [];
        $validated['mmii_assimetria_lado'] = $validated['mmii_assimetria'] ? ($validated['mmii_assimetria_lado'] ?? null) : null;
        $validated['mmii_interrupcao_lados'] = $validated['mmii_interrupcao'] ? ($validated['mmii_interrupcao_lados'] ?? []) : [];
        $validated['mmii_tempo_direito_segundos'] = $validated['mmii_interrupcao'] ? ($validated['mmii_tempo_direito_segundos'] ?? null) : null;
        $validated['mmii_tempo_esquerdo_segundos'] = $validated['mmii_interrupcao'] ? ($validated['mmii_tempo_esquerdo_segundos'] ?? null) : null;
        $validated['mmii_alteracoes'] = $validated['mmii_alteracoes'] ?? [];
        if (in_array('sem_alteracoes', $validated['mmii_alteracoes'], true) && (count($validated['mmii_alteracoes']) > 1 || ! $validated['mmii_sustenta_posicao'] || $validated['mmii_queda'] || $validated['mmii_tremor'] || $validated['mmii_assimetria'] || $validated['mmii_interrupcao'])) {
            throw ValidationException::withMessages(['mmii_alteracoes' => 'A opção sem alterações não pode ser combinada com outras alterações.']);
        }
        $validated['mmss_queda_lados'] = $validated['mmss_queda_pronacao'] ? ($validated['mmss_queda_lados'] ?? []) : [];
        $validated['mmss_tremor_lados'] = $validated['mmss_tremor'] ? ($validated['mmss_tremor_lados'] ?? []) : [];
        $validated['mmss_assimetria_lado'] = $validated['mmss_assimetria'] ? ($validated['mmss_assimetria_lado'] ?? null) : null;
        $validated['observacoes'] = $validated['mmss_desconforto'] ? ($validated['observacoes'] ?? null) : null;
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

        $model = Mingazzini::create($validated);

        $this->storeAttachments($model, $request);

        return redirect()->route('questionnaires.mingazzini.index')
            ->with('success', 'Questionário criado com sucesso!');
    }

    public function show(Mingazzini $mingazzini): Response
    {
        $this->authorizeTeamAccess($mingazzini);

        $mingazzini->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Mingazzini/Show', [
            'questionnaire' => $mingazzini,
            'pedidoMedicoUrl' => $mingazzini->pedido_medico
                ? route('pedidos-medicos.show', ['type' => 'mingazzini', 'id' => $mingazzini->id])
                : null,
            'can' => [
                'edit' => auth()->user()->can('edit questionnaires'),
                'delete' => auth()->user()->can('delete questionnaires'),
            ],
        ]);
    }

    public function edit(Mingazzini $mingazzini): Response
    {
        $this->authorizeTeamAccess($mingazzini);

        $mingazzini->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Mingazzini/Edit', [
            'questionnaire' => $mingazzini,
            'pedidoMedicoUrl' => $mingazzini->pedido_medico ? route('pedidos-medicos.show', ['type' => 'mingazzini', 'id' => $mingazzini->id]) : null,
        ]);
    }

    public function update(Request $request, Mingazzini $mingazzini)
    {
        $this->authorizeTeamAccess($mingazzini);

        BoolCoerce::apply($request);

        $validated = $request->validate(array_merge($this->rules(), $this->attachmentRules()));
        $validated = $this->normalizeAnswers($validated);
        $validated['updated_by'] = auth()->id();

        if ($request->hasFile('pedido_medico')) {
            if ($mingazzini->pedido_medico) {
                Storage::disk('private')->delete($mingazzini->pedido_medico);
            }
            $validated['pedido_medico'] = $request->file('pedido_medico')->store('medical_requests', 'private');
        } else {
            unset($validated['pedido_medico']);
        }

        $mingazzini->update($validated);

        $this->storeAttachments($mingazzini, $request);

        return redirect()->route('questionnaires.mingazzini.index')
            ->with('success', 'Questionário atualizado com sucesso!');
    }

    public function destroy(Mingazzini $mingazzini)
    {
        $this->authorizeTeamAccess($mingazzini);

        if ($mingazzini->pedido_medico) {
            Storage::disk('private')->delete($mingazzini->pedido_medico);
        }

        $mingazzini->delete();

        return redirect()->route('questionnaires.mingazzini.index')
            ->with('success', 'Questionário excluído com sucesso!');
    }
}
