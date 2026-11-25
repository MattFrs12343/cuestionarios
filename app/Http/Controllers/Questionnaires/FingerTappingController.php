<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Models\FingerTapping;
use App\Support\BoolCoerce;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FingerTappingController extends Controller
{
    use HandlesAttachments, RestrictsQuestionnaireByTeam, HandlesSignatureUploads;

    private const SIGNATURE_FIELDS = ['assinatura_paciente'];

    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $this->currentTeam($request);

        $query = FingerTapping::with(['team', 'creator', 'editor'])->where('team_id', $team->id);

        $this->applyIndexFilters($query, $request, ['nome_completo', 'rg_ou_cpf'], ['nome_completo', 'rg_ou_cpf', 'clinica', 'data_exame', 'created_at']);

        $questionnaires = $query->paginate($request->boolean('directory') ? 100 : 15);

        // No mandamos al listado la firma (LONGTEXT base64) ni el pedido
        // medico: no se muestran en la tabla y engordaban el payload de
        // cada pagina (el EEG, con mas registros/fotos, era el que mas sufria).
        $questionnaires->through(fn ($q) => $q->makeHidden(['assinatura_paciente', 'pedido_medico']));

        return Inertia::render('Questionnaires/FingerTapping/Index', [
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
        return Inertia::render('Questionnaires/FingerTapping/Create');
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
            'mao_avaliada' => 'nullable|in:Direita,Esquerda,Bilateral',
            'movimentos_rapidos' => 'required|boolean',
            'bradicinesia' => 'required|boolean',
            'bradicinesia_lados' => 'nullable|array|max:2',
            'bradicinesia_lados.*' => ['string', 'distinct', Rule::in(['Direita', 'Esquerda'])],
            'reducao_progressiva' => 'required|boolean',
            'reducao_lados' => 'nullable|array|max:2',
            'reducao_lados.*' => ['string', 'distinct', Rule::in(['Direita', 'Esquerda'])],
            'irregularidade_ritmo' => 'required|boolean',
            'irregularidade_lados' => 'nullable|array|max:2',
            'irregularidade_lados.*' => ['string', 'distinct', Rule::in(['Direita', 'Esquerda'])],
            'interrupcao' => 'required|boolean',
            'interrupcao_lados' => 'nullable|array|max:2',
            'interrupcao_lados.*' => ['string', 'distinct', Rule::in(['Direita', 'Esquerda'])],
            'tempo_direito_segundos' => 'nullable|integer|min:0|max:3600',
            'tempo_esquerdo_segundos' => 'nullable|integer|min:0|max:3600',
            'alteracoes' => 'nullable|array|max:5',
            'alteracoes.*' => ['string', 'distinct', Rule::in(['interrupcao_espontanea', 'reducao_velocidade', 'reducao_amplitude', 'incapacidade', 'completou_tempo'])],
            'nome_avaliador' => 'nullable|string|max:255',
            'cid' => 'nullable|string|max:255',
            'comentario' => 'nullable|string',
            'pedido_medico' => 'nullable|file|image|max:10240',
        ] + $this->signatureRules(self::SIGNATURE_FIELDS);
    }

    private function normalizeAnswers(array $validated): array
    {
        $validated['bradicinesia_lados'] = $validated['bradicinesia'] ? ($validated['bradicinesia_lados'] ?? []) : [];
        $validated['reducao_lados'] = $validated['reducao_progressiva'] ? ($validated['reducao_lados'] ?? []) : [];
        $validated['irregularidade_lados'] = $validated['irregularidade_ritmo'] ? ($validated['irregularidade_lados'] ?? []) : [];
        $validated['interrupcao_lados'] = $validated['interrupcao'] ? ($validated['interrupcao_lados'] ?? []) : [];
        $validated['tempo_direito_segundos'] = $validated['interrupcao'] ? ($validated['tempo_direito_segundos'] ?? null) : null;
        $validated['tempo_esquerdo_segundos'] = $validated['interrupcao'] ? ($validated['tempo_esquerdo_segundos'] ?? null) : null;
        $validated['alteracoes'] = $validated['alteracoes'] ?? [];
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

        $this->applySignatureFields(null, $request, self::SIGNATURE_FIELDS, $validated);

        $model = FingerTapping::create($validated);

        $this->storeAttachments($model, $request);

        return redirect()->route('questionnaires.finger-tapping.index')
            ->with('success', 'Questionário criado com sucesso!');
    }

    public function show(FingerTapping $fingerTapping): Response
    {
        $this->authorizeTeamAccess($fingerTapping);

        $fingerTapping->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/FingerTapping/Show', [
            'questionnaire' => $fingerTapping->makeHidden(self::SIGNATURE_FIELDS),
            'pedidoMedicoUrl' => $fingerTapping->pedido_medico
                ? route('pedidos-medicos.show', ['type' => 'finger-tapping', 'id' => $fingerTapping->id])
                : null,
            'assinaturaPacienteUrl' => $this->signatureUrl($fingerTapping, 'assinatura_paciente', 'finger-tapping'),
            'can' => [
                'edit' => auth()->user()->can('edit questionnaires'),
                'delete' => auth()->user()->can('delete questionnaires'),
            ],
        ]);
    }

    public function edit(FingerTapping $fingerTapping): Response
    {
        $this->authorizeTeamAccess($fingerTapping);

        $fingerTapping->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/FingerTapping/Edit', [
            'questionnaire' => $fingerTapping->makeHidden(self::SIGNATURE_FIELDS),
            'pedidoMedicoUrl' => $fingerTapping->pedido_medico ? route('pedidos-medicos.show', ['type' => 'finger-tapping', 'id' => $fingerTapping->id]) : null,
            'assinaturaPacienteUrl' => $this->signatureUrl($fingerTapping, 'assinatura_paciente', 'finger-tapping'),
        ]);
    }

    public function update(Request $request, FingerTapping $fingerTapping)
    {
        $this->authorizeTeamAccess($fingerTapping);

        BoolCoerce::apply($request);

        $validated = $request->validate(array_merge($this->rules(), $this->attachmentRules()));
        $validated = $this->normalizeAnswers($validated);
        $validated['updated_by'] = auth()->id();

        if ($request->hasFile('pedido_medico')) {
            if ($fingerTapping->pedido_medico) {
                Storage::disk('private')->delete($fingerTapping->pedido_medico);
            }
            $validated['pedido_medico'] = $request->file('pedido_medico')->store('medical_requests', 'private');
        } else {
            unset($validated['pedido_medico']);
        }

        $this->applySignatureFields($fingerTapping, $request, self::SIGNATURE_FIELDS, $validated);

        $fingerTapping->update($validated);

        $this->storeAttachments($fingerTapping, $request);

        return redirect()->route('questionnaires.finger-tapping.index')
            ->with('success', 'Questionário atualizado com sucesso!');
    }

    public function destroy(FingerTapping $fingerTapping)
    {
        $this->authorizeTeamAccess($fingerTapping);

        if ($fingerTapping->pedido_medico) {
            Storage::disk('private')->delete($fingerTapping->pedido_medico);
        }

        foreach (self::SIGNATURE_FIELDS as $field) {
            $this->deleteStoredSignature($fingerTapping->{$field});
        }

        $fingerTapping->delete();

        return redirect()->route('questionnaires.finger-tapping.index')
            ->with('success', 'Questionário excluído com sucesso!');
    }
}
