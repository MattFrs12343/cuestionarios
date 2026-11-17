<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Models\Epley;
use App\Support\BoolCoerce;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EpleyController extends Controller
{
    use HandlesAttachments, RestrictsQuestionnaireByTeam;

    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $this->currentTeam($request);

        $query = Epley::with(['team', 'creator', 'editor'])->where('team_id', $team->id);

        $this->applyIndexFilters($query, $request, ['nome_completo', 'rg_ou_cpf'], ['nome_completo', 'rg_ou_cpf', 'clinica', 'data_exame', 'created_at']);

        $questionnaires = $query->paginate($request->boolean('directory') ? 100 : 15);

        // No mandamos al listado la firma (LONGTEXT base64) ni el pedido
        // medico: no se muestran en la tabla y engordaban el payload de
        // cada pagina (el EEG, con mas registros/fotos, era el que mas sufria).
        $questionnaires->through(fn ($q) => $q->makeHidden(['assinatura_paciente', 'pedido_medico']));

        return Inertia::render('Questionnaires/Epley/Index', [
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
        return Inertia::render('Questionnaires/Epley/Create');
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
            'vertigem' => 'required|boolean',
            'vertigem_lados' => 'nullable|array|max:2',
            'vertigem_lados.*' => 'in:Direita,Esquerda|distinct',
            'nistagmo' => 'required|boolean',
            'nistagmo_lados' => 'nullable|array|max:2',
            'nistagmo_lados.*' => 'in:Direita,Esquerda|distinct',
            'desconforto' => 'required|boolean',
            'observacoes' => 'nullable|string|max:5000',
            'mantem_posicao' => 'required|boolean',
            'tempo_mantido_segundos' => 'nullable|integer|min:0|max:3600',
            'melhora_vertigem' => 'required|in:Sim,Não,Melhora parcial',
            'nome_avaliador' => 'nullable|string|max:255',
            'cid' => 'nullable|string|max:255',
            'comentario' => 'nullable|string',
            'assinatura_paciente' => 'nullable|string',
            'pedido_medico' => 'nullable|file|image|max:10240',
        ];
    }

    public function store(Request $request)
    {
        BoolCoerce::apply($request);

        $validated = $request->validate(array_merge($this->rules(), $this->attachmentRules()));
        $validated['vertigem_lados'] = $validated['vertigem'] ? ($validated['vertigem_lados'] ?? []) : [];
        $validated['nistagmo_lados'] = $validated['nistagmo'] ? ($validated['nistagmo_lados'] ?? []) : [];
        $validated['observacoes'] = $validated['desconforto'] ? ($validated['observacoes'] ?? null) : null;
        unset($validated['anexos']);
        $validated['team_id'] = $this->currentTeam($request)->id;
        $validated['created_by'] = auth()->id();

        if ($request->hasFile('pedido_medico')) {
            $validated['pedido_medico'] = $request->file('pedido_medico')->store('medical_requests', 'private');
        }

        $model = Epley::create($validated);

        $this->storeAttachments($model, $request);

        return redirect()->route('questionnaires.epley.index')
            ->with('success', 'Questionário criado com sucesso!');
    }

    public function show(Epley $epley): Response
    {
        $this->authorizeTeamAccess($epley);

        $epley->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Epley/Show', [
            'questionnaire' => $epley,
            'pedidoMedicoUrl' => $epley->pedido_medico
                ? route('pedidos-medicos.show', ['type' => 'epley', 'id' => $epley->id])
                : null,
            'can' => [
                'edit' => auth()->user()->can('edit questionnaires'),
                'delete' => auth()->user()->can('delete questionnaires'),
            ],
        ]);
    }

    public function edit(Epley $epley): Response
    {
        $this->authorizeTeamAccess($epley);

        $epley->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Epley/Edit', [
            'questionnaire' => $epley,
            'pedidoMedicoUrl' => $epley->pedido_medico ? route('pedidos-medicos.show', ['type' => 'epley', 'id' => $epley->id]) : null,
        ]);
    }

    public function update(Request $request, Epley $epley)
    {
        $this->authorizeTeamAccess($epley);

        BoolCoerce::apply($request);

        $validated = $request->validate(array_merge($this->rules(), $this->attachmentRules()));
        $validated['vertigem_lados'] = $validated['vertigem'] ? ($validated['vertigem_lados'] ?? []) : [];
        $validated['nistagmo_lados'] = $validated['nistagmo'] ? ($validated['nistagmo_lados'] ?? []) : [];
        $validated['observacoes'] = $validated['desconforto'] ? ($validated['observacoes'] ?? null) : null;
        unset($validated['anexos']);
        $validated['updated_by'] = auth()->id();

        if ($request->hasFile('pedido_medico')) {
            if ($epley->pedido_medico) {
                Storage::disk('private')->delete($epley->pedido_medico);
            }
            $validated['pedido_medico'] = $request->file('pedido_medico')->store('medical_requests', 'private');
        } else {
            unset($validated['pedido_medico']);
        }

        $epley->update($validated);

        $this->storeAttachments($epley, $request);

        return redirect()->route('questionnaires.epley.index')
            ->with('success', 'Questionário atualizado com sucesso!');
    }

    public function destroy(Epley $epley)
    {
        $this->authorizeTeamAccess($epley);

        if ($epley->pedido_medico) {
            Storage::disk('private')->delete($epley->pedido_medico);
        }

        $epley->delete();

        return redirect()->route('questionnaires.epley.index')
            ->with('success', 'Questionário excluído com sucesso!');
    }
}
