<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Models\TdahInfantil;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TdahInfantilController extends Controller
{
    use RestrictsQuestionnaireByTeam, HandlesAttachments;

    public function index(Request $request): Response
    {
        $user = $request->user();
        $teamId = $request->get('team_id');

        $query = TdahInfantil::with(['team', 'creator', 'editor']);

        if (! $this->bypassesTeamRestriction($user)) {
            $query->whereIn('team_id', $user->teams->pluck('id'));
        }

        if ($teamId) {
            $query->where('team_id', $teamId);
        }

        if ($search = $request->get('search')) {
            $query->where('nome_completo', 'like', "%{$search}%");
        }

        if ($dateFrom = $request->get('date_from')) {
            $query->where('data_exame', '>=', $dateFrom);
        }

        if ($dateTo = $request->get('date_to')) {
            $query->where('data_exame', '<=', $dateTo);
        }

        if ($clinica = $request->get('clinica')) {
            $query->whereRaw('LOWER(clinica) LIKE LOWER(?)', ["%{$clinica}%"]);
        }

        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        $allowedSortFields = ['nome_completo', 'clinica', 'data_exame', 'created_at'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }

        if (!in_array($sortDirection, ['asc', 'desc'])) {
            $sortDirection = 'desc';
        }

        $questionnaires = $query->orderBy($sortField, $sortDirection)->paginate(15);

        return Inertia::render('Questionnaires/TdahInfantil/Index', [
            'questionnaires' => $questionnaires,
            'teams' => $this->bypassesTeamRestriction($user) ? Team::all() : $user->teams,
            'currentTeam' => $teamId ? Team::find($teamId) : null,
            'filters' => array_filter($request->only(['search', 'date_from', 'date_to', 'clinica', 'team_id', 'sort', 'direction']), function ($value) {
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
        $user = auth()->user();

        return Inertia::render('Questionnaires/TdahInfantil/Create', [
            'teams' => $this->bypassesTeamRestriction($user) ? Team::all() : $user->teams,
        ]);
    }

    private function rules(): array
    {
        return [
            'clinica' => 'nullable|string|max:255',
            'data_exame' => 'required|date',
            'nome_completo' => 'required|string|max:255',
            'data_nascimento' => 'required|date',
            'rg_ou_cpf' => 'nullable|string|max:255',
            'peso' => 'nullable|numeric|min:0|max:999.99',
            'altura' => 'nullable|numeric|min:0|max:999.99',
            'sexo' => 'required|in:Masculino,Feminino',
            'solicitante' => 'nullable|string|max:255',
            'team_id' => $this->teamIdRule(),

            'parte_1_respostas' => 'nullable|array|size:9',
            'parte_1_respostas.*' => 'nullable|integer|min:0|max:4',
            'parte_1_total' => 'nullable|integer|min:0|max:36',

            'parte_2_respostas' => 'nullable|array|size:9',
            'parte_2_respostas.*' => 'nullable|integer|min:0|max:4',
            'parte_2_total' => 'nullable|integer|min:0|max:36',

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

        $model = TdahInfantil::create($validated);

        $this->storeAttachments($model, $request);

        return redirect()->route('questionnaires.tdah-infantil.index')
            ->with('success', 'Questionário criado com sucesso!');
    }

    public function show(TdahInfantil $tdahInfantil): Response
    {
        $this->authorizeTeamAccess($tdahInfantil);

        $tdahInfantil->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/TdahInfantil/Show', [
            'questionnaire' => $tdahInfantil,
            'can' => [
                'edit' => auth()->user()->can('edit questionnaires'),
                'delete' => auth()->user()->can('delete questionnaires'),
            ],
        ]);
    }

    public function edit(TdahInfantil $tdahInfantil): Response
    {
        $this->authorizeTeamAccess($tdahInfantil);

        $user = auth()->user();
        $tdahInfantil->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/TdahInfantil/Edit', [
            'questionnaire' => $tdahInfantil,
            'teams' => $this->bypassesTeamRestriction($user) ? Team::all() : $user->teams,
        ]);
    }

    public function update(Request $request, TdahInfantil $tdahInfantil)
    {
        $this->authorizeTeamAccess($tdahInfantil);

        \App\Support\BoolCoerce::apply($request);

        $validated = $request->validate($this->rules());
        $validated['updated_by'] = auth()->id();

        if ($request->hasFile('pedido_medico')) {
            if ($tdahInfantil->pedido_medico) {
                Storage::disk('public')->delete($tdahInfantil->pedido_medico);
            }
            $validated['pedido_medico'] = $request->file('pedido_medico')->store('medical_requests', 'public');
        } else {
            unset($validated['pedido_medico']);
        }

        $request->validate($this->attachmentRules());

        $tdahInfantil->update($validated);

        $this->storeAttachments($tdahInfantil, $request);

        return redirect()->route('questionnaires.tdah-infantil.index')
            ->with('success', 'Questionário atualizado com sucesso!');
    }

    public function destroy(TdahInfantil $tdahInfantil)
    {
        $this->authorizeTeamAccess($tdahInfantil);

        if ($tdahInfantil->pedido_medico) {
            Storage::disk('public')->delete($tdahInfantil->pedido_medico);
        }

        $tdahInfantil->delete();

        return redirect()->route('questionnaires.tdah-infantil.index')
            ->with('success', 'Questionário excluído com sucesso!');
    }
}
