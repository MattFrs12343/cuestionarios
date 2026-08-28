<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Models\RastreioCognitivo;
use App\Models\Team;
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
        $teamId = $request->get('team_id');

        $query = RastreioCognitivo::with(['team', 'creator', 'editor'])
            ->whereIn('team_id', $user->teams->pluck('id'));

        if ($teamId) {
            $query->where('team_id', $teamId);
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nome_completo', 'like', "%{$search}%")
                  ->orWhere('rg_ou_cpf', 'like', "%{$search}%");
            });
        }

        if ($dateFrom = $request->get('date_from')) {
            $query->where('data_exame', '>=', $dateFrom);
        }

        if ($dateTo = $request->get('date_to')) {
            $query->where('data_exame', '<=', $dateTo);
        }

        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        $allowedSortFields = ['nome_completo', 'rg_ou_cpf', 'data_exame', 'created_at'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }

        if (!in_array($sortDirection, ['asc', 'desc'])) {
            $sortDirection = 'desc';
        }

        $questionnaires = $query->orderBy($sortField, $sortDirection)->paginate(15);

        return Inertia::render('Questionnaires/RastreioCognitivo/Index', [
            'questionnaires' => $questionnaires,
            'teams' => $user->teams,
            'currentTeam' => $teamId ? Team::find($teamId) : null,
            'filters' => array_filter($request->only(['search', 'date_from', 'date_to', 'team_id', 'sort', 'direction']), function ($value) {
                return $value !== null && $value !== '';
            }),
            'can' => [
                'create' => $user->hasPermissionTo('create questionnaires'),
                'edit' => $user->hasPermissionTo('edit questionnaires'),
                'delete' => $user->hasPermissionTo('delete questionnaires'),
            ],
        ]);
    }

    public function create(): Response
    {
        $user = auth()->user();

        return Inertia::render('Questionnaires/RastreioCognitivo/Create', [
            'teams' => $user->teams,
        ]);
    }

    private function rules(): array
    {
        return [
            'nome_completo' => 'required|string|max:255',
            'rg_ou_cpf' => 'required|string|max:255',
            'data_nascimento' => 'required|date',
            'sexo' => 'required|in:Masculino,Feminino',
            'data_exame' => 'required|date',
            'team_id' => $this->teamIdRule(),
            'pontuacao_visoespacial' => 'nullable|integer|min:0|max:5',
            'pontuacao_nomeacao' => 'nullable|integer|min:0|max:3',
            'pontuacao_atencao' => 'nullable|integer|min:0|max:6',
            'pontuacao_linguagem' => 'nullable|integer|min:0|max:3',
            'pontuacao_abstracao' => 'nullable|integer|min:0|max:2',
            'pontuacao_evocacao_tardia' => 'nullable|integer|min:0|max:5',
            'pontuacao_orientacao' => 'nullable|integer|min:0|max:6',
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
        $validated['created_by'] = auth()->id();

        if ($request->hasFile('pedido_medico')) {
            $validated['pedido_medico'] = $request->file('pedido_medico')->store('medical_requests', 'public');
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
            'can' => [
                'edit' => auth()->user()->hasPermissionTo('edit questionnaires'),
                'delete' => auth()->user()->hasPermissionTo('delete questionnaires'),
            ],
        ]);
    }

    public function edit(RastreioCognitivo $rastreioCognitivo): Response
    {
        $this->authorizeTeamAccess($rastreioCognitivo);

        $user = auth()->user();
        $rastreioCognitivo->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/RastreioCognitivo/Edit', [
            'questionnaire' => $rastreioCognitivo,
            'teams' => $user->teams,
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
                Storage::disk('public')->delete($rastreioCognitivo->pedido_medico);
            }
            $validated['pedido_medico'] = $request->file('pedido_medico')->store('medical_requests', 'public');
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
            Storage::disk('public')->delete($rastreioCognitivo->pedido_medico);
        }

        $rastreioCognitivo->delete();

        return redirect()->route('questionnaires.rastreio-cognitivo.index')
            ->with('success', 'Questionário excluído com sucesso!');
    }
}
