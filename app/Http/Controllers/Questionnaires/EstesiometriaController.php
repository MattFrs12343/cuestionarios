<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Models\Estesiometria;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EstesiometriaController extends Controller
{
    use RestrictsQuestionnaireByTeam, HandlesAttachments;

    private const CORES = ['Verde', 'Azul', 'Violeta', 'Vermelho', 'Laranja/Rosa'];

    public function index(Request $request): Response
    {
        $user = $request->user();
        $teamId = $request->get('team_id');

        $query = Estesiometria::with(['team', 'creator', 'editor']);

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

        return Inertia::render('Questionnaires/Estesiometria/Index', [
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

        return Inertia::render('Questionnaires/Estesiometria/Create', [
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
            'sexo' => 'required|in:Masculino,Feminino',
            'team_id' => $this->teamIdRule(),

            'nome_avaliador' => 'nullable|string|max:255',
            'crm_rg' => 'nullable|string|max:255',
            'diagnostico' => 'nullable|string|max:255',

            'dormencia_formigamento' => 'boolean',
            'dificuldade_sentir_objetos' => 'boolean',
            'feridas_sem_dor' => 'boolean',
            'diagnostico_diabetes_hanseniase' => 'boolean',
            'cirurgia_fratura_recente' => 'boolean',
            'medicamentos_sistema_nervoso' => 'boolean',

            'pontos_pes' => 'nullable|array',
            'pontos_pes.*.ponto' => 'required|string',
            'pontos_pes.*.sentiu' => 'nullable|boolean',
            'pontos_pes.*.cor_direito' => 'nullable|in:' . implode(',', self::CORES),
            'pontos_pes.*.cor_esquerdo' => 'nullable|in:' . implode(',', self::CORES),

            'pontos_maos' => 'nullable|array',
            'pontos_maos.*.ponto' => 'required|string',
            'pontos_maos.*.sentiu' => 'nullable|boolean',
            'pontos_maos.*.cor_direita' => 'nullable|in:' . implode(',', self::CORES),
            'pontos_maos.*.cor_esquerda' => 'nullable|in:' . implode(',', self::CORES),

            'pes_percent_acerto_d' => 'nullable|numeric|min:0|max:100',
            'pes_percent_acerto_e' => 'nullable|numeric|min:0|max:100',
            'pes_classificacao' => 'nullable|in:Normal,Leve,Moderada,Grave',
            'maos_percent_acerto_d' => 'nullable|numeric|min:0|max:100',
            'maos_percent_acerto_e' => 'nullable|numeric|min:0|max:100',
            'maos_classificacao' => 'nullable|in:Normal,Leve,Moderada,Grave',

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

        $model = Estesiometria::create($validated);

        $this->storeAttachments($model, $request);

        return redirect()->route('questionnaires.estesiometria.index')
            ->with('success', 'Questionário criado com sucesso!');
    }

    public function show(Estesiometria $estesiometria): Response
    {
        $this->authorizeTeamAccess($estesiometria);

        $estesiometria->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Estesiometria/Show', [
            'questionnaire' => $estesiometria,
            'can' => [
                'edit' => auth()->user()->can('edit questionnaires'),
                'delete' => auth()->user()->can('delete questionnaires'),
            ],
        ]);
    }

    public function edit(Estesiometria $estesiometria): Response
    {
        $this->authorizeTeamAccess($estesiometria);

        $user = auth()->user();
        $estesiometria->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Estesiometria/Edit', [
            'questionnaire' => $estesiometria,
            'teams' => $this->bypassesTeamRestriction($user) ? Team::all() : $user->teams,
        ]);
    }

    public function update(Request $request, Estesiometria $estesiometria)
    {
        $this->authorizeTeamAccess($estesiometria);

        \App\Support\BoolCoerce::apply($request);

        $validated = $request->validate($this->rules());
        $validated['updated_by'] = auth()->id();

        if ($request->hasFile('pedido_medico')) {
            if ($estesiometria->pedido_medico) {
                Storage::disk('public')->delete($estesiometria->pedido_medico);
            }
            $validated['pedido_medico'] = $request->file('pedido_medico')->store('medical_requests', 'public');
        } else {
            unset($validated['pedido_medico']);
        }

        $request->validate($this->attachmentRules());

        $estesiometria->update($validated);

        $this->storeAttachments($estesiometria, $request);

        return redirect()->route('questionnaires.estesiometria.index')
            ->with('success', 'Questionário atualizado com sucesso!');
    }

    public function destroy(Estesiometria $estesiometria)
    {
        $this->authorizeTeamAccess($estesiometria);

        if ($estesiometria->pedido_medico) {
            Storage::disk('public')->delete($estesiometria->pedido_medico);
        }

        $estesiometria->delete();

        return redirect()->route('questionnaires.estesiometria.index')
            ->with('success', 'Questionário excluído com sucesso!');
    }
}
