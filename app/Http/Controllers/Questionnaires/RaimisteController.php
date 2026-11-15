<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Models\Raimiste;
use App\Support\BoolCoerce;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RaimisteController extends Controller
{
    use HandlesAttachments, RestrictsQuestionnaireByTeam;

    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $this->currentTeam($request);

        $query = Raimiste::with(['team', 'creator', 'editor'])->where('team_id', $team->id);

        $this->applyIndexFilters($query, $request, ['nome_completo', 'rg_ou_cpf'], ['nome_completo', 'rg_ou_cpf', 'clinica', 'data_exame', 'created_at']);

        $questionnaires = $query->paginate(15);

        // No mandamos al listado la firma (LONGTEXT base64) ni el pedido
        // medico: no se muestran en la tabla y engordaban el payload de
        // cada pagina (el EEG, con mas registros/fotos, era el que mas sufria).
        $questionnaires->through(fn ($q) => $q->makeHidden(['assinatura_paciente', 'pedido_medico']));

        return Inertia::render('Questionnaires/Raimiste/Index', [
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
        return Inertia::render('Questionnaires/Raimiste/Create');
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
            'sustenta_posicao' => 'required|boolean',
            'pronacao_supinacao' => 'required|boolean',
            'pronacao_lados' => 'nullable|array|max:2',
            'pronacao_lados.*' => ['string', 'distinct', Rule::in(['Direita', 'Esquerda'])],
            'tremor_oscilacao' => 'required|boolean',
            'tremor_lados' => 'nullable|array|max:2',
            'tremor_lados.*' => ['string', 'distinct', Rule::in(['Direita', 'Esquerda'])],
            'assimetria' => 'required|boolean',
            'assimetria_lado' => 'nullable|in:Direita,Esquerda,Bilateral',
            'desconforto' => 'required|boolean',
            'observacoes' => 'nullable|string|max:5000',
            'tempo_direito_segundos' => 'nullable|integer|min:0|max:3600',
            'tempo_esquerdo_segundos' => 'nullable|integer|min:0|max:3600',
            'nome_avaliador' => 'nullable|string|max:255',
            'cid' => 'nullable|string|max:255',
            'comentario' => 'nullable|string',
            'assinatura_paciente' => 'nullable|string',
            'pedido_medico' => 'nullable|file|image|max:10240',
        ];
    }

    private function normalizeAnswers(array $validated): array
    {
        $validated['pronacao_lados'] = $validated['pronacao_supinacao'] ? ($validated['pronacao_lados'] ?? []) : [];
        $validated['tremor_lados'] = $validated['tremor_oscilacao'] ? ($validated['tremor_lados'] ?? []) : [];
        $validated['assimetria_lado'] = $validated['assimetria'] ? ($validated['assimetria_lado'] ?? null) : null;
        $validated['observacoes'] = $validated['desconforto'] ? ($validated['observacoes'] ?? null) : null;
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

        $model = Raimiste::create($validated);

        $this->storeAttachments($model, $request);

        return redirect()->route('questionnaires.raimiste.index')
            ->with('success', 'Questionário criado com sucesso!');
    }

    public function show(Raimiste $raimiste): Response
    {
        $this->authorizeTeamAccess($raimiste);

        $raimiste->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Raimiste/Show', [
            'questionnaire' => $raimiste,
            'pedidoMedicoUrl' => $raimiste->pedido_medico
                ? route('pedidos-medicos.show', ['type' => 'raimiste', 'id' => $raimiste->id])
                : null,
            'can' => [
                'edit' => auth()->user()->can('edit questionnaires'),
                'delete' => auth()->user()->can('delete questionnaires'),
            ],
        ]);
    }

    public function edit(Raimiste $raimiste): Response
    {
        $this->authorizeTeamAccess($raimiste);

        $raimiste->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Raimiste/Edit', [
            'questionnaire' => $raimiste,
            'pedidoMedicoUrl' => $raimiste->pedido_medico ? route('pedidos-medicos.show', ['type' => 'raimiste', 'id' => $raimiste->id]) : null,
        ]);
    }

    public function update(Request $request, Raimiste $raimiste)
    {
        $this->authorizeTeamAccess($raimiste);

        BoolCoerce::apply($request);

        $validated = $request->validate(array_merge($this->rules(), $this->attachmentRules()));
        $validated = $this->normalizeAnswers($validated);
        $validated['updated_by'] = auth()->id();

        if ($request->hasFile('pedido_medico')) {
            if ($raimiste->pedido_medico) {
                Storage::disk('private')->delete($raimiste->pedido_medico);
            }
            $validated['pedido_medico'] = $request->file('pedido_medico')->store('medical_requests', 'private');
        } else {
            unset($validated['pedido_medico']);
        }

        $raimiste->update($validated);

        $this->storeAttachments($raimiste, $request);

        return redirect()->route('questionnaires.raimiste.index')
            ->with('success', 'Questionário atualizado com sucesso!');
    }

    public function destroy(Raimiste $raimiste)
    {
        $this->authorizeTeamAccess($raimiste);

        if ($raimiste->pedido_medico) {
            Storage::disk('private')->delete($raimiste->pedido_medico);
        }

        $raimiste->delete();

        return redirect()->route('questionnaires.raimiste.index')
            ->with('success', 'Questionário excluído com sucesso!');
    }
}
