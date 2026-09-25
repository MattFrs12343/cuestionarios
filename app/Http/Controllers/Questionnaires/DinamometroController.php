<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Models\Dinamometro;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DinamometroController extends Controller
{
    use RestrictsQuestionnaireByTeam, HandlesAttachments;

    private const CONTEXTOS = ['neurologico', 'ortopedico', 'geriatrico', 'pediatrico'];

    public function index(Request $request): Response
    {
        $user = $request->user();
        $teamId = $request->get('team_id');

        $query = Dinamometro::with(['team', 'creator', 'editor']);

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

        return Inertia::render('Questionnaires/Dinamometro/Index', [
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

        return Inertia::render('Questionnaires/Dinamometro/Create', [
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
            'peso' => 'nullable|numeric|min:0|max:999.99',
            'altura' => 'nullable|numeric|min:0|max:999.99',
            'dominancia' => 'nullable|in:Destro,Canhoto,Ambidestro',
            'profissao' => 'nullable|string|max:255',
            'responsavel_menor' => 'nullable|string|max:255',
            'diagnostico_principal' => 'nullable|string|max:255',
            'indicacao_avaliacao' => 'nullable|string',
            'team_id' => $this->teamIdRule(),

            'contextos_clinicos' => 'nullable|array',
            'contextos_clinicos.*' => 'in:' . implode(',', self::CONTEXTOS),

            'doencas_cronicas' => 'nullable|string',
            'cirurgias_membro_superior' => 'nullable|string',
            'medicacoes_uso' => 'nullable|string',
            'fisioterapia_recente' => 'boolean',
            'lesao_previa_atual' => 'boolean',
            'lesao_previa_atual_qual' => 'nullable|string|max:255',
            'dor_atual' => 'nullable|integer|min:0|max:10',
            'dor_piora_com_forca' => 'boolean',
            'localizacao_dor' => 'nullable|string|max:255',

            'neuro_lado_afetado' => 'nullable|in:Direito,Esquerdo,Bilateral',
            'neuro_espasticidade' => 'boolean',
            'neuro_tremor' => 'boolean',
            'neuro_dominancia_igual_lado_afetado' => 'boolean',
            'neuro_melhor_efeito_medicacao' => 'boolean',

            'orto_fase_aguda_lesao' => 'boolean',
            'orto_dor_piora_forca' => 'boolean',
            'orto_quickdash_score' => 'nullable|numeric|min:0|max:100',
            'orto_fase_tratamento' => 'nullable|in:Aguda,Subaguda,Crônica',

            'geri_quedas_ultimo_ano' => 'boolean',
            'geri_num_medicamentos_dia' => 'nullable|integer|min:0|max:255',
            'geri_fragilidade_fried' => 'nullable|integer|min:0|max:5',
            'geri_classificacao_fragilidade' => 'nullable|in:Robusto,Pré-frágil,Frágil',
            'geri_comprometimento_cognitivo' => 'boolean',

            'pedi_dominancia_nao_definida' => 'boolean',
            'pedi_paralisia_cerebral_sindrome' => 'boolean',
            'pedi_segura_objetos_normalmente' => 'boolean',
            'pedi_coopera_teste' => 'boolean',
            'pedi_idade_cronologica_vs_desenvolvimento' => 'nullable|string|max:255',

            'dormiu_bem' => 'boolean',
            'esforco_fisico_24h' => 'boolean',
            'dor_desconforto_hoje' => 'boolean',
            'consentimento_tcle' => 'boolean',

            'tentativas' => 'nullable|integer|min:0|max:255',
            'intervalo_segundos' => 'nullable|integer|min:0|max:255',
            'mao_dominante_t1' => 'nullable|numeric|min:0|max:999.99',
            'mao_dominante_t2' => 'nullable|numeric|min:0|max:999.99',
            'mao_dominante_t3' => 'nullable|numeric|min:0|max:999.99',
            'mao_dominante_media' => 'nullable|numeric|min:0|max:999.99',
            'mao_nao_dominante_t1' => 'nullable|numeric|min:0|max:999.99',
            'mao_nao_dominante_t2' => 'nullable|numeric|min:0|max:999.99',
            'mao_nao_dominante_t3' => 'nullable|numeric|min:0|max:999.99',
            'mao_nao_dominante_media' => 'nullable|numeric|min:0|max:999.99',

            'classificacao' => 'nullable|string|max:255',
            'assimetria_percentual' => 'nullable|numeric|min:0|max:999.99',
            'conclusao' => 'nullable|string',
            'conduta' => 'nullable|string',
            'nome_avaliador' => 'nullable|string|max:255',
            'crefito_crm' => 'nullable|string|max:255',

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

        $model = Dinamometro::create($validated);

        $this->storeAttachments($model, $request);

        return redirect()->route('questionnaires.dinamometro.index')
            ->with('success', 'Questionário criado com sucesso!');
    }

    public function show(Dinamometro $dinamometro): Response
    {
        $this->authorizeTeamAccess($dinamometro);

        $dinamometro->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Dinamometro/Show', [
            'questionnaire' => $dinamometro,
            'can' => [
                'edit' => auth()->user()->can('edit questionnaires'),
                'delete' => auth()->user()->can('delete questionnaires'),
            ],
        ]);
    }

    public function edit(Dinamometro $dinamometro): Response
    {
        $this->authorizeTeamAccess($dinamometro);

        $user = auth()->user();
        $dinamometro->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Dinamometro/Edit', [
            'questionnaire' => $dinamometro,
            'teams' => $this->bypassesTeamRestriction($user) ? Team::all() : $user->teams,
        ]);
    }

    public function update(Request $request, Dinamometro $dinamometro)
    {
        $this->authorizeTeamAccess($dinamometro);

        \App\Support\BoolCoerce::apply($request);

        $validated = $request->validate($this->rules());
        $validated['updated_by'] = auth()->id();

        if ($request->hasFile('pedido_medico')) {
            if ($dinamometro->pedido_medico) {
                Storage::disk('public')->delete($dinamometro->pedido_medico);
            }
            $validated['pedido_medico'] = $request->file('pedido_medico')->store('medical_requests', 'public');
        } else {
            unset($validated['pedido_medico']);
        }

        $request->validate($this->attachmentRules());

        $dinamometro->update($validated);

        $this->storeAttachments($dinamometro, $request);

        return redirect()->route('questionnaires.dinamometro.index')
            ->with('success', 'Questionário atualizado com sucesso!');
    }

    public function destroy(Dinamometro $dinamometro)
    {
        $this->authorizeTeamAccess($dinamometro);

        if ($dinamometro->pedido_medico) {
            Storage::disk('public')->delete($dinamometro->pedido_medico);
        }

        $dinamometro->delete();

        return redirect()->route('questionnaires.dinamometro.index')
            ->with('success', 'Questionário excluído com sucesso!');
    }
}
