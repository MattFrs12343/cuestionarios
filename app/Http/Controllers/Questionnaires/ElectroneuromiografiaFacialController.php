<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Models\ElectroneuromiografiaFacial;
use App\Support\QuestionnaireFields;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ElectroneuromiografiaFacialController extends Controller
{
    use RestrictsQuestionnaireByTeam, HandlesAttachments;

    /** Slug del cuestionario, para resolver la visibilidad de campos. */
    private const SLUG = 'electroneuromiografia-facial';

    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $this->currentTeam($request);

        $query = ElectroneuromiografiaFacial::with(['team', 'creator', 'editor'])->where('team_id', $team->id);

        $this->applyIndexFilters($query, $request, ['nome', 'rg'], ['nome', 'clinica', 'rg', 'data_exame', 'created_at']);

        $questionnaires = $query->paginate(15);

        return Inertia::render('Questionnaires/ElectroneuromiografiaFacial/Index', [
            'questionnaires' => $questionnaires,
            'fieldVisibility' => QuestionnaireFields::forInertia($team, self::SLUG),
            'filters' => array_filter($request->only(['search', 'date_from', 'date_to', 'clinica', 'sort', 'direction']), function($value) {
                return $value !== null && $value !== '';
            }),
            'can' => [
                'create' => $user->can('create questionnaires'),
                'edit' => $user->can('edit questionnaires'),
                'delete' => $user->can('delete questionnaires'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Questionnaires/ElectroneuromiografiaFacial/Create', [
            // En la creación todavía no hay un equipo concreto: se decide por
            // pertenencia del usuario (ver QuestionnaireFields::forUser).
            'fieldVisibility' => QuestionnaireFields::forUser($request->user(), self::SLUG),
        ]);
    }

    public function store(Request $request)
    {
        $team = $this->currentTeam($request);

        \App\Support\BoolCoerce::apply($request);

        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'data_nascimento' => 'required|date',
            'idade' => 'nullable|integer',
            'peso' => 'nullable|numeric',
            'altura' => 'nullable|numeric',
            'data_exame' => 'required|date',
            'rg' => 'required|string|max:255',
            'solicitante' => 'required|string|max:255',
            'clinica' => 'required|string|max:255',
            'sexo' => 'required|in:Feminino,Masculino',
            'tem_dor_testa' => 'boolean',
            'tem_dor_olhos' => 'boolean',
            'dor_olhos_lado' => 'nullable|string|max:255',
            'tem_dor_mandibula' => 'boolean',
            'tem_dor_dentes_agua_gelada' => 'boolean',
            'tem_espasmos_face' => 'boolean',
            'espasmos_face_parte' => 'nullable|string|max:255',
            'aplicou_botox' => 'boolean',
            'botox_parte_face' => 'nullable|string|max:255',
            'tem_implante_dentario' => 'boolean',
            'tem_dores_apos_implante' => 'boolean',
            'teve_paralisia_facial' => 'boolean',
            'paralisia_facial_vezes' => 'nullable|integer',
            'tem_parte_face_paralisada' => 'boolean',
            'parte_face_paralisada_qual' => 'nullable|string|max:255',
            'tem_enxaqueca' => 'boolean',
            'consegue_sorrir_normalmente' => 'boolean',
            'pode_comer_normalmente' => 'boolean',
            'pode_assoviar' => 'boolean',
            'consegue_encher_bexiga' => 'boolean',
            'tem_infeccao_ouvido_repetidamente' => 'boolean',
            'teve_avc' => 'boolean',
            'avc_quando' => 'nullable|string|max:255',
            'diabetico' => 'boolean',
            'toma_medicamento' => 'boolean',
            'medicamentos' => 'nullable|string',
            'observacoes' => 'nullable|string',
            'assinatura_paciente' => 'nullable|string',
            'pedido_medico' => 'nullable|file|image|max:10240',
        ]);

        // Descarta los campos que este equipo no debe ver, antes de guardar.
        $validated = QuestionnaireFields::onlyVisible($team, self::SLUG, $validated);
        $validated['team_id'] = $team->id;
        $validated['created_by'] = auth()->id();
        
        // Calcular idade automaticamente
        if (isset($validated['data_nascimento']) && isset($validated['data_exame'])) {
            $birthDate = new \DateTime($validated['data_nascimento']);
            $examDate = new \DateTime($validated['data_exame']);
            $age = $examDate->diff($birthDate)->y;
            
            // Si es menor de 1 año, calcular en meses
            if ($age < 1) {
                $months = $examDate->diff($birthDate)->m + ($examDate->diff($birthDate)->y * 12);
                $validated['idade'] = $months < 1 ? 0 : $months;
            } else {
                $validated['idade'] = $age;
            }
        }

        if ($request->hasFile('pedido_medico')) {
            $filePath = $request->file('pedido_medico')
                ->store('medical_requests', 'private');
            $validated['pedido_medico'] = $filePath;
        }

        $request->validate($this->attachmentRules());

        $model = ElectroneuromiografiaFacial::create($validated);

        $this->storeAttachments($model, $request);

        return redirect()->route('questionnaires.electroneuromiografia-facial.index')
            ->with('success', 'Questionário criado com sucesso!');
    }

    public function show(ElectroneuromiografiaFacial $electroneuromiografiaFacial): Response
    {
        $this->authorizeTeamAccess($electroneuromiografiaFacial);

        $electroneuromiografiaFacial->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/ElectroneuromiografiaFacial/Show', [
            'questionnaire' => $electroneuromiografiaFacial,
            'pedidoMedicoUrl' => $electroneuromiografiaFacial->pedido_medico
                ? route('pedidos-medicos.show', ['type' => 'electroneuromiografia-facial', 'id' => $electroneuromiografiaFacial->id])
                : null,
            'fieldVisibility' => QuestionnaireFields::forInertia($electroneuromiografiaFacial->team, self::SLUG),
            'can' => [
                'edit' => auth()->user()->can('edit questionnaires'),
                'delete' => auth()->user()->can('delete questionnaires'),
            ],
        ]);
    }

    public function edit(ElectroneuromiografiaFacial $electroneuromiografiaFacial): Response
    {
        $this->authorizeTeamAccess($electroneuromiografiaFacial);

        $user = auth()->user();
        $electroneuromiografiaFacial->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/ElectroneuromiografiaFacial/Edit', [
            'questionnaire' => $electroneuromiografiaFacial,
            'pedidoMedicoUrl' => $electroneuromiografiaFacial->pedido_medico
                ? route('pedidos-medicos.show', ['type' => 'electroneuromiografia-facial', 'id' => $electroneuromiografiaFacial->id])
                : null,
            'fieldVisibility' => QuestionnaireFields::forInertia($electroneuromiografiaFacial->team, self::SLUG),
        ]);
    }

    public function update(Request $request, ElectroneuromiografiaFacial $electroneuromiografiaFacial)
    {
        $this->authorizeTeamAccess($electroneuromiografiaFacial);

        \App\Support\BoolCoerce::apply($request);

        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'data_nascimento' => 'required|date',
            'idade' => 'nullable|integer',
            'peso' => 'nullable|numeric',
            'altura' => 'nullable|numeric',
            'data_exame' => 'required|date',
            'rg' => 'required|string|max:255',
            'solicitante' => 'required|string|max:255',
            'clinica' => 'required|string|max:255',
            'sexo' => 'required|in:Feminino,Masculino',
            'tem_dor_testa' => 'boolean',
            'tem_dor_olhos' => 'boolean',
            'dor_olhos_lado' => 'nullable|string|max:255',
            'tem_dor_mandibula' => 'boolean',
            'tem_dor_dentes_agua_gelada' => 'boolean',
            'tem_espasmos_face' => 'boolean',
            'espasmos_face_parte' => 'nullable|string|max:255',
            'aplicou_botox' => 'boolean',
            'botox_parte_face' => 'nullable|string|max:255',
            'tem_implante_dentario' => 'boolean',
            'tem_dores_apos_implante' => 'boolean',
            'teve_paralisia_facial' => 'boolean',
            'paralisia_facial_vezes' => 'nullable|integer',
            'tem_parte_face_paralisada' => 'boolean',
            'parte_face_paralisada_qual' => 'nullable|string|max:255',
            'tem_enxaqueca' => 'boolean',
            'consegue_sorrir_normalmente' => 'boolean',
            'pode_comer_normalmente' => 'boolean',
            'pode_assoviar' => 'boolean',
            'consegue_encher_bexiga' => 'boolean',
            'tem_infeccao_ouvido_repetidamente' => 'boolean',
            'teve_avc' => 'boolean',
            'avc_quando' => 'nullable|string|max:255',
            'diabetico' => 'boolean',
            'toma_medicamento' => 'boolean',
            'medicamentos' => 'nullable|string',
            'observacoes' => 'nullable|string',
            'assinatura_paciente' => 'nullable|string',
            'pedido_medico' => 'nullable|file|image|max:10240',
        ]);

        // Se filtra contra el equipo del registro, no el actual: es el que
        // determina qué campos puede tener guardados este cuestionario.
        $validated = QuestionnaireFields::onlyVisible(
            $electroneuromiografiaFacial->team,
            self::SLUG,
            $validated
        );
        $validated['updated_by'] = auth()->id();
        
        // Calcular idade automaticamente
        if (isset($validated['data_nascimento']) && isset($validated['data_exame'])) {
            $birthDate = new \DateTime($validated['data_nascimento']);
            $examDate = new \DateTime($validated['data_exame']);
            $age = $examDate->diff($birthDate)->y;
            
            // Si es menor de 1 año, calcular en meses
            if ($age < 1) {
                $months = $examDate->diff($birthDate)->m + ($examDate->diff($birthDate)->y * 12);
                $validated['idade'] = $months < 1 ? 0 : $months;
            } else {
                $validated['idade'] = $age;
            }
        }

        if ($request->hasFile('pedido_medico')) {
            if ($electroneuromiografiaFacial->pedido_medico) {
                Storage::disk('private')->delete($electroneuromiografiaFacial->pedido_medico);
            }
            $filePath = $request->file('pedido_medico')
                ->store('medical_requests', 'private');
            $validated['pedido_medico'] = $filePath;
        } else {
            unset($validated['pedido_medico']);
        }

        $request->validate($this->attachmentRules());

        $electroneuromiografiaFacial->update($validated);

        $this->storeAttachments($electroneuromiografiaFacial, $request);

        return redirect()->route('questionnaires.electroneuromiografia-facial.index')
            ->with('success', 'Questionário atualizado com sucesso!');
    }

    public function destroy(ElectroneuromiografiaFacial $electroneuromiografiaFacial)
    {
        $this->authorizeTeamAccess($electroneuromiografiaFacial);

        if ($electroneuromiografiaFacial->pedido_medico) {
            Storage::disk('private')->delete($electroneuromiografiaFacial->pedido_medico);
        }

        $electroneuromiografiaFacial->delete();

        return redirect()->route('questionnaires.electroneuromiografia-facial.index')
            ->with('success', 'Questionário excluído com sucesso!');
    }
}

