<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Models\RastreioCognitivo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class RastreioCognitivoController extends Controller
{
    use RestrictsQuestionnaireByTeam, HandlesAttachments;

    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $this->currentTeam($request);

        $query = RastreioCognitivo::with(['team', 'creator', 'editor'])->where('team_id', $team->id);

        $this->applyIndexFilters($query, $request, ['nome_completo', 'rg_ou_cpf'], ['nome_completo', 'rg_ou_cpf', 'clinica', 'data_exame', 'created_at']);

        $questionnaires = $query->paginate(15);

        return Inertia::render('Questionnaires/RastreioCognitivo/Index', [
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
        return Inertia::render('Questionnaires/RastreioCognitivo/Create');
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
            'pontuacao_visoespacial' => 'nullable|integer|min:0|max:5',
            'pontuacao_nomeacao' => 'nullable|integer|min:0|max:3',
            'pontuacao_atencao' => 'nullable|integer|min:0|max:6',
            'pontuacao_linguagem' => 'nullable|integer|min:0|max:3',
            'pontuacao_abstracao' => 'nullable|integer|min:0|max:2',
            'pontuacao_evocacao_tardia' => 'nullable|integer|min:0|max:5',
            'pontuacao_orientacao' => 'nullable|integer|min:0|max:6',
            'desenho_visoespacial' => 'nullable|string',
            'desenho_atencao' => 'nullable|string',
            'desenho_evocacao_tardia' => 'nullable|string',
            'desenho_orientacao' => 'nullable|string',
            'ajuste_escolaridade' => 'boolean',
            'pontuacao_total' => 'nullable|integer|min:0|max:30',
            'nome_avaliador' => 'nullable|string|max:255',
            'cid' => 'nullable|string|max:255',
            'comentario' => 'nullable|string',
            'assinatura_paciente' => 'nullable|string',
            'pedido_medico' => 'nullable|file|image|max:10240',
        ];
    }

    public function store(Request $request)
    {
        \App\Support\BoolCoerce::apply($request);

        $validated = $request->validate($this->rules());
        $validated['team_id'] = $this->currentTeam($request)->id;
        $validated['created_by'] = auth()->id();

        if ($request->hasFile('pedido_medico')) {
            $validated['pedido_medico'] = $request->file('pedido_medico')->store('medical_requests', 'private');
        }

        $request->validate($this->attachmentRules());

        $model = RastreioCognitivo::create($validated);

        $this->storeAttachments($model, $request);

        return redirect()->route('questionnaires.rastreio-cognitivo.index')
            ->with('success', 'Questionário criado com sucesso!');
    }

    public function show(RastreioCognitivo $rastreioCognitivo): Response
    {
        $this->authorizeTeamAccess($rastreioCognitivo);

        $rastreioCognitivo->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/RastreioCognitivo/Show', [
            'questionnaire' => $rastreioCognitivo,
            'pedidoMedicoUrl' => $rastreioCognitivo->pedido_medico
                ? route('pedidos-medicos.show', ['type' => 'rastreio-cognitivo', 'id' => $rastreioCognitivo->id])
                : null,
            'can' => [
                'edit' => auth()->user()->can('edit questionnaires'),
                'delete' => auth()->user()->can('delete questionnaires'),
            ],
        ]);
    }

    public function edit(RastreioCognitivo $rastreioCognitivo): Response
    {
        $this->authorizeTeamAccess($rastreioCognitivo);

        $rastreioCognitivo->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/RastreioCognitivo/Edit', [
            'questionnaire' => $rastreioCognitivo,
        ]);
    }

    public function update(Request $request, RastreioCognitivo $rastreioCognitivo)
    {
        $this->authorizeTeamAccess($rastreioCognitivo);

        \App\Support\BoolCoerce::apply($request);

        $validated = $request->validate($this->rules());
        $validated['updated_by'] = auth()->id();

        if ($request->hasFile('pedido_medico')) {
            if ($rastreioCognitivo->pedido_medico) {
                Storage::disk('private')->delete($rastreioCognitivo->pedido_medico);
            }
            $validated['pedido_medico'] = $request->file('pedido_medico')->store('medical_requests', 'private');
        } else {
            unset($validated['pedido_medico']);
        }

        $request->validate($this->attachmentRules());

        $rastreioCognitivo->update($validated);

        $this->storeAttachments($rastreioCognitivo, $request);

        return redirect()->route('questionnaires.rastreio-cognitivo.index')
            ->with('success', 'Questionário atualizado com sucesso!');
    }

    public function destroy(RastreioCognitivo $rastreioCognitivo)
    {
        $this->authorizeTeamAccess($rastreioCognitivo);

        if ($rastreioCognitivo->pedido_medico) {
            Storage::disk('private')->delete($rastreioCognitivo->pedido_medico);
        }

        $rastreioCognitivo->delete();

        return redirect()->route('questionnaires.rastreio-cognitivo.index')
            ->with('success', 'Questionário excluído com sucesso!');
    }
}
