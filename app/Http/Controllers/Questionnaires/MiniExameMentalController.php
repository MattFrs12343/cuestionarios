<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Models\MiniExameMental;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MiniExameMentalController extends Controller
{
    use RestrictsQuestionnaireByTeam, HandlesAttachments;

    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $this->currentTeam($request);

        $query = MiniExameMental::with(['team', 'creator', 'editor'])->where('team_id', $team->id);

        $this->applyIndexFilters($query, $request, ['nome_completo', 'rg_ou_cpf'], ['nome_completo', 'rg_ou_cpf', 'clinica', 'data_exame', 'created_at']);

        $questionnaires = $query->paginate(15);

        return Inertia::render('Questionnaires/MiniExameMental/Index', [
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
        return Inertia::render('Questionnaires/MiniExameMental/Create');
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
            'escolaridade' => 'nullable|string|max:100',
            'pontuacao_orientacao_temporal' => 'nullable|integer|min:0|max:5',
            'pontuacao_orientacao_espacial' => 'nullable|integer|min:0|max:5',
            'pontuacao_registro' => 'nullable|integer|min:0|max:3',
            'pontuacao_atencao_calculo' => 'nullable|integer|min:0|max:5',
            'pontuacao_evocacao' => 'nullable|integer|min:0|max:3',
            'pontuacao_linguagem' => 'nullable|integer|min:0|max:8',
            'pontuacao_desenho' => 'nullable|integer|min:0|max:1',
            'pontuacao_total' => 'nullable|integer|min:0|max:30',
            'desenho_copia' => 'nullable|string',
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

        $model = MiniExameMental::create($validated);

        $this->storeAttachments($model, $request);

        return redirect()->route('questionnaires.mini-exame-mental.index')
            ->with('success', 'Questionário criado com sucesso!');
    }

    public function show(MiniExameMental $miniExameMental): Response
    {
        $this->authorizeTeamAccess($miniExameMental);

        $miniExameMental->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/MiniExameMental/Show', [
            'questionnaire' => $miniExameMental,
            'pedidoMedicoUrl' => $miniExameMental->pedido_medico
                ? route('pedidos-medicos.show', ['type' => 'mini-exame-mental', 'id' => $miniExameMental->id])
                : null,
            'can' => [
                'edit' => auth()->user()->can('edit questionnaires'),
                'delete' => auth()->user()->can('delete questionnaires'),
            ],
        ]);
    }

    public function edit(MiniExameMental $miniExameMental): Response
    {
        $this->authorizeTeamAccess($miniExameMental);

        $miniExameMental->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/MiniExameMental/Edit', [
            'questionnaire' => $miniExameMental,
        ]);
    }

    public function update(Request $request, MiniExameMental $miniExameMental)
    {
        $this->authorizeTeamAccess($miniExameMental);

        \App\Support\BoolCoerce::apply($request);

        $validated = $request->validate($this->rules());
        $validated['updated_by'] = auth()->id();

        if ($request->hasFile('pedido_medico')) {
            if ($miniExameMental->pedido_medico) {
                Storage::disk('private')->delete($miniExameMental->pedido_medico);
            }
            $validated['pedido_medico'] = $request->file('pedido_medico')->store('medical_requests', 'private');
        } else {
            unset($validated['pedido_medico']);
        }

        $request->validate($this->attachmentRules());

        $miniExameMental->update($validated);

        $this->storeAttachments($miniExameMental, $request);

        return redirect()->route('questionnaires.mini-exame-mental.index')
            ->with('success', 'Questionário atualizado com sucesso!');
    }

    public function destroy(MiniExameMental $miniExameMental)
    {
        $this->authorizeTeamAccess($miniExameMental);

        if ($miniExameMental->pedido_medico) {
            Storage::disk('private')->delete($miniExameMental->pedido_medico);
        }

        $miniExameMental->delete();

        return redirect()->route('questionnaires.mini-exame-mental.index')
            ->with('success', 'Questionário excluído com sucesso!');
    }
}
