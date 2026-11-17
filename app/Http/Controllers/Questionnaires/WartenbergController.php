<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Models\Wartenberg;
use App\Support\BoolCoerce;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class WartenbergController extends Controller
{
    use HandlesAttachments, RestrictsQuestionnaireByTeam;

    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $this->currentTeam($request);

        $query = Wartenberg::with(['team', 'creator', 'editor'])->where('team_id', $team->id);

        $this->applyIndexFilters($query, $request, ['nome_completo', 'rg_ou_cpf'], ['nome_completo', 'rg_ou_cpf', 'clinica', 'data_exame', 'created_at']);

        $questionnaires = $query->paginate($request->boolean('directory') ? 100 : 15);

        // No mandamos al listado la firma (LONGTEXT base64) ni el pedido
        // medico: no se muestran en la tabla y engordaban el payload de
        // cada pagina (el EEG, con mas registros/fotos, era el que mas sufria).
        $questionnaires->through(fn ($q) => $q->makeHidden(['assinatura_paciente', 'pedido_medico']));

        return Inertia::render('Questionnaires/Wartenberg/Index', [
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
        return Inertia::render('Questionnaires/Wartenberg/Create');
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
            'afastamento_involuntario' => 'required|boolean',
            'afastamento_lados' => 'nullable|array|max:2',
            'afastamento_lados.*' => ['string', 'distinct', Rule::in(['Direita', 'Esquerda'])],
            'dificuldade_manter' => 'required|boolean',
            'manter_lados' => 'nullable|array|max:2',
            'manter_lados.*' => ['string', 'distinct', Rule::in(['Direita', 'Esquerda'])],
            'dificuldade_aproximar' => 'required|boolean',
            'aproximar_lado' => 'nullable|in:Direita,Esquerda',
            'fraqueza_assimetria' => 'required|boolean',
            'fraqueza_lados' => 'nullable|array|max:2',
            'fraqueza_lados.*' => ['string', 'distinct', Rule::in(['Direita', 'Esquerda'])],
            'alteracao_sensibilidade' => 'required|boolean',
            'sensibilidade_lados' => 'nullable|array|max:2',
            'sensibilidade_lados.*' => ['string', 'distinct', Rule::in(['Direita', 'Esquerda'])],
            'tempo_mantido_segundos' => 'nullable|integer|min:0|max:3600',
            'nome_avaliador' => 'nullable|string|max:255',
            'cid' => 'nullable|string|max:255',
            'comentario' => 'nullable|string',
            'assinatura_paciente' => 'nullable|string',
            'pedido_medico' => 'nullable|file|image|max:10240',
        ];
    }

    private function normalizeAnswers(array $validated): array
    {
        $validated['afastamento_lados'] = $validated['afastamento_involuntario'] ? ($validated['afastamento_lados'] ?? []) : [];
        $validated['manter_lados'] = $validated['dificuldade_manter'] ? ($validated['manter_lados'] ?? []) : [];
        $validated['aproximar_lado'] = $validated['dificuldade_aproximar'] ? ($validated['aproximar_lado'] ?? null) : null;
        $validated['fraqueza_lados'] = $validated['fraqueza_assimetria'] ? ($validated['fraqueza_lados'] ?? []) : [];
        $validated['sensibilidade_lados'] = $validated['alteracao_sensibilidade'] ? ($validated['sensibilidade_lados'] ?? []) : [];
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

        $model = Wartenberg::create($validated);

        $this->storeAttachments($model, $request);

        return redirect()->route('questionnaires.wartenberg.index')
            ->with('success', 'Questionário criado com sucesso!');
    }

    public function show(Wartenberg $wartenberg): Response
    {
        $this->authorizeTeamAccess($wartenberg);

        $wartenberg->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Wartenberg/Show', [
            'questionnaire' => $wartenberg,
            'pedidoMedicoUrl' => $wartenberg->pedido_medico
                ? route('pedidos-medicos.show', ['type' => 'wartenberg', 'id' => $wartenberg->id])
                : null,
            'can' => [
                'edit' => auth()->user()->can('edit questionnaires'),
                'delete' => auth()->user()->can('delete questionnaires'),
            ],
        ]);
    }

    public function edit(Wartenberg $wartenberg): Response
    {
        $this->authorizeTeamAccess($wartenberg);

        $wartenberg->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Wartenberg/Edit', [
            'questionnaire' => $wartenberg,
            'pedidoMedicoUrl' => $wartenberg->pedido_medico ? route('pedidos-medicos.show', ['type' => 'wartenberg', 'id' => $wartenberg->id]) : null,
        ]);
    }

    public function update(Request $request, Wartenberg $wartenberg)
    {
        $this->authorizeTeamAccess($wartenberg);

        BoolCoerce::apply($request);

        $validated = $request->validate(array_merge($this->rules(), $this->attachmentRules()));
        $validated = $this->normalizeAnswers($validated);
        $validated['updated_by'] = auth()->id();

        if ($request->hasFile('pedido_medico')) {
            if ($wartenberg->pedido_medico) {
                Storage::disk('private')->delete($wartenberg->pedido_medico);
            }
            $validated['pedido_medico'] = $request->file('pedido_medico')->store('medical_requests', 'private');
        } else {
            unset($validated['pedido_medico']);
        }

        $wartenberg->update($validated);

        $this->storeAttachments($wartenberg, $request);

        return redirect()->route('questionnaires.wartenberg.index')
            ->with('success', 'Questionário atualizado com sucesso!');
    }

    public function destroy(Wartenberg $wartenberg)
    {
        $this->authorizeTeamAccess($wartenberg);

        if ($wartenberg->pedido_medico) {
            Storage::disk('private')->delete($wartenberg->pedido_medico);
        }

        $wartenberg->delete();

        return redirect()->route('questionnaires.wartenberg.index')
            ->with('success', 'Questionário excluído com sucesso!');
    }
}
