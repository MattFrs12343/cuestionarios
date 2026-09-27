<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Models\AvaliacaoEquilibrio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AvaliacaoEquilibrioController extends Controller
{
    use RestrictsQuestionnaireByTeam, HandlesAttachments;

    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $this->currentTeam($request);

        $query = AvaliacaoEquilibrio::with(['team', 'creator', 'editor'])->where('team_id', $team->id);

        $this->applyIndexFilters($query, $request, ['nome_completo', 'rg_ou_cpf'], ['nome_completo', 'rg_ou_cpf', 'clinica', 'data_exame', 'created_at']);

        $questionnaires = $query->paginate(15);

        return Inertia::render('Questionnaires/AvaliacaoEquilibrio/Index', [
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
        return Inertia::render('Questionnaires/AvaliacaoEquilibrio/Create');
    }

    private function rules(): array
    {
        $bergItem = 'nullable|integer|min:0|max:4';

        return [
            'nome_completo' => 'required|string|max:255',
            'rg_ou_cpf' => 'required|string|max:255',
            'data_nascimento' => 'required|date',
            'sexo' => 'required|in:Masculino,Feminino',
            'clinica' => 'nullable|string|max:255',
            'data_exame' => 'required|date',
            'tug_tempo_segundos' => 'nullable|numeric|min:0',
            'berg_sentado_para_pe' => $bergItem,
            'berg_permanecer_pe_sem_apoio' => $bergItem,
            'berg_sentado_sem_apoio' => $bergItem,
            'berg_pe_para_sentado' => $bergItem,
            'berg_transferencias' => $bergItem,
            'berg_pe_olhos_fechados' => $bergItem,
            'berg_pe_pes_juntos' => $bergItem,
            'berg_alcance_anterior' => $bergItem,
            'berg_pegar_objeto_chao' => $bergItem,
            'berg_olhar_para_tras' => $bergItem,
            'berg_girar_360' => $bergItem,
            'berg_tocar_degrau' => $bergItem,
            'berg_posicao_tandem' => $bergItem,
            'berg_apoio_monopodal' => $bergItem,
            'berg_total' => 'nullable|integer|min:0|max:56',
            'nome_avaliador' => 'nullable|string|max:255',
            'cid' => 'nullable|string|max:255',
            'comentario' => 'nullable|string',
            'assinatura_paciente' => 'nullable|string',
            'pedido_medico' => 'nullable|file|image|max:10240',
        ];
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());
        $validated['team_id'] = $this->currentTeam($request)->id;
        $validated['created_by'] = auth()->id();

        if ($request->hasFile('pedido_medico')) {
            $validated['pedido_medico'] = $request->file('pedido_medico')->store('medical_requests', 'private');
        }

        $request->validate($this->attachmentRules());

        $model = AvaliacaoEquilibrio::create($validated);

        $this->storeAttachments($model, $request);

        return redirect()->route('questionnaires.equilibrio.index')
            ->with('success', 'Questionário criado com sucesso!');
    }

    public function show(AvaliacaoEquilibrio $equilibrio): Response
    {
        $this->authorizeTeamAccess($equilibrio);

        $equilibrio->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/AvaliacaoEquilibrio/Show', [
            'questionnaire' => $equilibrio,
            'pedidoMedicoUrl' => $equilibrio->pedido_medico
                ? route('pedidos-medicos.show', ['type' => 'equilibrio', 'id' => $equilibrio->id])
                : null,
            'can' => [
                'edit' => auth()->user()->can('edit questionnaires'),
                'delete' => auth()->user()->can('delete questionnaires'),
            ],
        ]);
    }

    public function edit(AvaliacaoEquilibrio $equilibrio): Response
    {
        $this->authorizeTeamAccess($equilibrio);

        $equilibrio->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/AvaliacaoEquilibrio/Edit', [
            'questionnaire' => $equilibrio,
        ]);
    }

    public function update(Request $request, AvaliacaoEquilibrio $equilibrio)
    {
        $this->authorizeTeamAccess($equilibrio);

        $validated = $request->validate($this->rules());
        $validated['updated_by'] = auth()->id();

        if ($request->hasFile('pedido_medico')) {
            if ($equilibrio->pedido_medico) {
                Storage::disk('private')->delete($equilibrio->pedido_medico);
            }
            $validated['pedido_medico'] = $request->file('pedido_medico')->store('medical_requests', 'private');
        } else {
            unset($validated['pedido_medico']);
        }

        $request->validate($this->attachmentRules());

        $equilibrio->update($validated);

        $this->storeAttachments($equilibrio, $request);

        return redirect()->route('questionnaires.equilibrio.index')
            ->with('success', 'Questionário atualizado com sucesso!');
    }

    public function destroy(AvaliacaoEquilibrio $equilibrio)
    {
        $this->authorizeTeamAccess($equilibrio);

        if ($equilibrio->pedido_medico) {
            Storage::disk('private')->delete($equilibrio->pedido_medico);
        }

        $equilibrio->delete();

        return redirect()->route('questionnaires.equilibrio.index')
            ->with('success', 'Questionário excluído com sucesso!');
    }
}
