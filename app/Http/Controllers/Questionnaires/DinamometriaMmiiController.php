<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Models\DinamometriaMmii;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DinamometriaMmiiController extends Controller
{
    use RestrictsQuestionnaireByTeam, HandlesAttachments;

    private const FRAQUEZA_TIPOS = ['Proximal', 'Distal', 'Difusa', 'Assimétrica'];

    private const DIFICULDADE_ATIVIDADES = [
        'Caminhar', 'Subir escadas', 'Descer escadas', 'Levantar-se de uma cadeira',
        'Levantar-se da cama', 'Permanecer em pé', 'Correr', 'Agachar',
        'Sustentar o peso corporal', 'Flexão/extensão do joelho',
        'Dorsiflexão/flexão plantar do tornozelo',
    ];

    private const ANTECEDENTES = [
        'Acidente vascular cerebral – AVC', 'Polineuropatia', 'Radiculopatia lombossacra',
        'Hérnia/protusão discal', 'Doença neuromuscular', 'Miopatia',
        'Esclerose múltipla', 'Doença de Parkinson/parkinsonismo', 'Neuropatia diabética',
        'Traumatismo cranioencefálico', 'Traumatismo raquimedular', 'Lesão de nervo periférico',
        'Artrose de quadril/joelho/tornozelo', 'Cirurgia ortopédica prévia',
        'Fratura prévia de membro inferior', 'Prótese de quadril ou joelho',
    ];

    private const SEGURANCA = [
        'Dor aguda ou incapacitante', 'Trauma recente', 'Fratura recente ou suspeita',
        'Cirurgia recente no membro avaliado', 'Processo inflamatório/infeccioso local',
        'Edema importante', 'Lesão cutânea no local de posicionamento da cinta',
        'Trombose venosa conhecida/suspeita', 'Restrição médica para esforço',
        'Nenhuma das condições acima',
    ];

    private const INTERCORRENCIAS = [
        'Sem intercorrências', 'Dor', 'Fatigabilidade precoce', 'Tremor',
        'Compensação postural', 'Incapacidade de sustentar a contração',
        'Interrupção por desconforto',
    ];

    private const IMPRESSAO_FUNCIONAL = [
        'Força muscular preservada', 'Redução leve da força muscular',
        'Redução moderada da força muscular', 'Redução acentuada da força muscular',
        'Assimetria de força entre os membros inferiores', 'Fatigabilidade muscular',
        'Resultado limitado por dor', 'Resultado limitado pela colaboração/compreensão do paciente',
    ];

    private const MODELO_CONCLUSAO = [
        'Força com elevada simetria entre os membros nos movimentos avaliados.',
        'Pequena diferença interlateral, sem assimetria expressiva pelo critério adotado.',
        'Assimetria discreta de força entre os membros inferiores.',
        'Assimetria interlateral evidente.',
        'Assimetria acentuada de força entre os membros inferiores.',
        'Assimetria muito acentuada de força entre os membros inferiores.',
    ];

    private const COMPORTAMENTO_TESTE = [
        'Sem intercorrências', 'Dor', 'Fatigabilidade', 'Tremor',
        'Compensação postural', 'Dificuldade de sustentar a contração',
    ];

    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $this->currentTeam($request);

        $query = DinamometriaMmii::with(['team', 'creator', 'editor'])->where('team_id', $team->id);

        $this->applyIndexFilters($query, $request, ['nome_completo'], ['nome_completo', 'clinica', 'data_exame', 'created_at']);

        $questionnaires = $query->paginate(15);

        return Inertia::render('Questionnaires/DinamometriaMmii/Index', [
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
        return Inertia::render('Questionnaires/DinamometriaMmii/Create');
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
            'dominancia' => 'nullable|in:Direita,Esquerda',
            'profissao' => 'nullable|string|max:255',
            'indicacao_clinica' => 'nullable|string',

            'fraqueza_muscular' => 'boolean',
            'fraqueza_lado' => 'nullable|in:Direita,Esquerda,Bilateral',
            'fraqueza_tipo' => 'nullable|array',
            'fraqueza_tipo.*' => 'in:' . implode(',', self::FRAQUEZA_TIPOS),
            'dificuldade_atividades' => 'nullable|array',
            'dificuldade_atividades.*' => 'in:' . implode(',', self::DIFICULDADE_ATIVIDADES),
            'fadiga_muscular' => 'boolean',
            'dor_membros' => 'boolean',
            'dor_localizacao' => 'nullable|string|max:255',
            'dor_eva' => 'nullable|integer|min:0|max:10',
            'parestesias' => 'boolean',
            'parestesias_localizacao' => 'nullable|string|max:255',
            'dor_neuropatica' => 'boolean',
            'caimbras' => 'boolean',
            'tremores' => 'boolean',
            'rigidez_muscular' => 'boolean',
            'alteracao_equilibrio' => 'boolean',
            'quedas_6meses' => 'boolean',
            'quedas_quantidade' => 'nullable|integer|min:0|max:999',
            'dispositivo_auxiliar' => 'nullable|in:Não,Bengala,Muleta,Andador,Cadeira de rodas,Outro',
            'dispositivo_auxiliar_outro' => 'nullable|string|max:255',

            'antecedentes_clinicos' => 'nullable|array',
            'antecedentes_clinicos.*' => 'in:' . implode(',', self::ANTECEDENTES),
            'antecedentes_outra' => 'nullable|string|max:255',

            'seguranca_teste' => 'nullable|array',
            'seguranca_teste.*' => 'in:' . implode(',', self::SEGURANCA),
            'seguranca_observacoes' => 'nullable|string',

            'tono_mid' => 'nullable|in:Normal,Hipotonia,Hipertonia',
            'tono_mie' => 'nullable|in:Normal,Hipotonia,Hipertonia',
            'forca_mrc' => 'nullable|array',
            'forca_mrc.*.movimento' => 'nullable|string|max:255',
            'forca_mrc.*.direito' => 'nullable|numeric|min:0|max:5',
            'forca_mrc.*.esquerdo' => 'nullable|numeric|min:0|max:5',

            'posicao_protocolo' => 'nullable|string|max:255',
            'unidade' => 'nullable|in:kgf,N,Outra',
            'unidade_outra' => 'nullable|string|max:255',
            'dinamometria' => 'nullable|array',
            'dinamometria.*.movimento' => 'nullable|string|max:255',
            'dinamometria.*.d1' => 'nullable|numeric|min:0|max:999.99',
            'dinamometria.*.d2' => 'nullable|numeric|min:0|max:999.99',
            'dinamometria.*.d3' => 'nullable|numeric|min:0|max:999.99',
            'dinamometria.*.d_melhor' => 'nullable|numeric|min:0|max:999.99',
            'dinamometria.*.d_media' => 'nullable|numeric|min:0|max:999.99',
            'dinamometria.*.e1' => 'nullable|numeric|min:0|max:999.99',
            'dinamometria.*.e2' => 'nullable|numeric|min:0|max:999.99',
            'dinamometria.*.e3' => 'nullable|numeric|min:0|max:999.99',
            'dinamometria.*.e_melhor' => 'nullable|numeric|min:0|max:999.99',
            'dinamometria.*.e_media' => 'nullable|numeric|min:0|max:999.99',
            'dinamometria.*.assimetria_pct' => 'nullable|numeric|min:0|max:999.99',
            'dinamometria.*.menor' => 'nullable|in:D,E',
            'valor_analise' => 'nullable|in:Melhor de 3 medidas,Média de 3 medidas,Outro',
            'valor_analise_outro' => 'nullable|string|max:255',
            'tempo_sustentacao_segundos' => 'nullable|integer|min:0|max:999',
            'assimetria_global_pct' => 'nullable|numeric|min:0|max:999.99',
            'intercorrencias_teste' => 'nullable|array',
            'intercorrencias_teste.*' => 'in:' . implode(',', self::INTERCORRENCIAS),

            'impressao_funcional' => 'nullable|array',
            'impressao_funcional.*' => 'in:' . implode(',', self::IMPRESSAO_FUNCIONAL),
            'observacoes_correlacao' => 'nullable|string',
            'modelo_conclusao' => 'nullable|in:' . implode(',', self::MODELO_CONCLUSAO),
            'maior_assimetria_pct' => 'nullable|numeric|min:0|max:999.99',
            'maior_assimetria_movimento' => 'nullable|string|max:255',
            'menor_forca_lado' => 'nullable|in:Direito,Esquerdo',
            'comportamento_teste' => 'nullable|array',
            'comportamento_teste.*' => 'in:' . implode(',', self::COMPORTAMENTO_TESTE),
            'conclusao_final' => 'nullable|string',
            'examinador' => 'nullable|string|max:255',
            'crm_registro' => 'nullable|string|max:255',

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

        $model = DinamometriaMmii::create($validated);

        $this->storeAttachments($model, $request);

        return redirect()->route('questionnaires.dinamometria-mmii.index')
            ->with('success', 'Questionário criado com sucesso!');
    }

    public function show(DinamometriaMmii $dinamometriaMmii): Response
    {
        $this->authorizeTeamAccess($dinamometriaMmii);

        $dinamometriaMmii->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/DinamometriaMmii/Show', [
            'questionnaire' => $dinamometriaMmii,
            'pedidoMedicoUrl' => $dinamometriaMmii->pedido_medico
                ? route('pedidos-medicos.show', ['type' => 'dinamometria-mmii', 'id' => $dinamometriaMmii->id])
                : null,
            'can' => [
                'edit' => auth()->user()->can('edit questionnaires'),
                'delete' => auth()->user()->can('delete questionnaires'),
            ],
        ]);
    }

    public function edit(DinamometriaMmii $dinamometriaMmii): Response
    {
        $this->authorizeTeamAccess($dinamometriaMmii);

        $dinamometriaMmii->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/DinamometriaMmii/Edit', [
            'questionnaire' => $dinamometriaMmii,
            'pedidoMedicoUrl' => $dinamometriaMmii->pedido_medico
                ? route('pedidos-medicos.show', ['type' => 'dinamometria-mmii', 'id' => $dinamometriaMmii->id])
                : null,
        ]);
    }

    public function update(Request $request, DinamometriaMmii $dinamometriaMmii)
    {
        $this->authorizeTeamAccess($dinamometriaMmii);

        \App\Support\BoolCoerce::apply($request);

        $validated = $request->validate($this->rules());
        $validated['updated_by'] = auth()->id();

        if ($request->hasFile('pedido_medico')) {
            if ($dinamometriaMmii->pedido_medico) {
                Storage::disk('private')->delete($dinamometriaMmii->pedido_medico);
            }
            $validated['pedido_medico'] = $request->file('pedido_medico')->store('medical_requests', 'private');
        } else {
            unset($validated['pedido_medico']);
        }

        $request->validate($this->attachmentRules());

        $dinamometriaMmii->update($validated);

        $this->storeAttachments($dinamometriaMmii, $request);

        return redirect()->route('questionnaires.dinamometria-mmii.index')
            ->with('success', 'Questionário atualizado com sucesso!');
    }

    public function destroy(DinamometriaMmii $dinamometriaMmii)
    {
        $this->authorizeTeamAccess($dinamometriaMmii);

        if ($dinamometriaMmii->pedido_medico) {
            Storage::disk('private')->delete($dinamometriaMmii->pedido_medico);
        }

        $dinamometriaMmii->delete();

        return redirect()->route('questionnaires.dinamometria-mmii.index')
            ->with('success', 'Questionário excluído com sucesso!');
    }
}
