<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuestionnaireRequest;
use App\Http\Requests\UpdateQuestionnaireRequest;
use App\Models\Questionnaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ElectroencefalogramaController extends Controller
{
    use RestrictsQuestionnaireByTeam, HandlesAttachments;

    public function __construct()
    {
        // Removido authorizeResource para usar permisos de Spatie directamente
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $this->currentTeam($request);

        $query = Questionnaire::with(['team', 'creator', 'editor'])->where('team_id', $team->id);

        $this->applyIndexFilters($query, $request, ['nome_completo', 'rg_ou_cpf'], ['nome_completo', 'clinica', 'rg_ou_cpf', 'data_exame', 'created_at']);

        $questionnaires = $query->paginate(15);

        return Inertia::render('Questionnaires/Electroencefalograma/Index', [
            'questionnaires' => $questionnaires,
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

    public function create(): Response
    {
        return Inertia::render('Questionnaires/Electroencefalograma/Create', [
            'momentoExameOptions' => [
                'O PACIENTE FICOU CALMO',
                'O PACIENTE FICOU ANSISO E NERVOSO E MOVIMENTANDO-SE TODO O TEMPO',
                'O PACIENTE NÃO DEIXOU FAZER O EXAME'
            ],
            'tipoExameOptions' => ['EEG', 'MAPA', 'FOTO'],
        ]);
    }

    public function store(StoreQuestionnaireRequest $request)
    {
        $data = $request->validated();
        $data['team_id'] = $this->currentTeam($request)->id;
        $data['created_by'] = auth()->id();

        // Debug logging
        \Log::info('Store Questionnaire - Request data:', [
            'has_file' => $request->hasFile('pedido_medico'),
            'file_info' => $request->hasFile('pedido_medico') ? [
                'name' => $request->file('pedido_medico')->getClientOriginalName(),
                'size' => $request->file('pedido_medico')->getSize(),
                'mime' => $request->file('pedido_medico')->getMimeType()
            ] : null
        ]);

        // Manejar assinatura (base64)
        if ($request->filled('assinatura_paciente')) {
            $data['assinatura_paciente'] = $request->assinatura_paciente;
        }

        if ($request->hasFile('pedido_medico')) {
            $filePath = $request->file('pedido_medico')
                ->store('medical_requests', 'private');
            $data['pedido_medico'] = $filePath;
            \Log::info('File stored at:', ['path' => $filePath]);
        }

        \Log::info('Data before create:', ['pedido_medico' => $data['pedido_medico'] ?? 'NULL']);
        
        $request->validate($this->attachmentRules());

        $questionnaire = Questionnaire::create($data);

        $this->storeAttachments($questionnaire, $request);
        
        \Log::info('Questionnaire created:', [
            'id' => $questionnaire->id,
            'pedido_medico_saved' => $questionnaire->pedido_medico
        ]);

        return redirect()->route('questionnaires.electroencefalograma.index')
            ->with('success', __('questionnaires.created_successfully'));
    }

    public function show(Questionnaire $questionnaire): Response
    {
        $this->authorizeTeamAccess($questionnaire);

        $questionnaire->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Electroencefalograma/Show', [
            'questionnaire' => $questionnaire,
            'pedidoMedicoUrl' => $questionnaire->pedido_medico
                ? route('pedidos-medicos.show', ['type' => 'electroencefalograma', 'id' => $questionnaire->id])
                : null,
            'can' => [
                'edit' => auth()->user()->can('update', $questionnaire),
                'delete' => auth()->user()->can('delete', $questionnaire),
            ],
        ]);
    }

    public function edit(Questionnaire $questionnaire): Response
    {
        $this->authorizeTeamAccess($questionnaire);

        $questionnaire->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Electroencefalograma/Edit', [
            'questionnaire' => $questionnaire,
            'pedidoMedicoUrl' => $questionnaire->pedido_medico
                ? route('pedidos-medicos.show', ['type' => 'electroencefalograma', 'id' => $questionnaire->id])
                : null,
            'momentoExameOptions' => [
                'O PACIENTE FICOU CALMO',
                'O PACIENTE FICOU ANSISO E NERVOSO E MOVIMENTANDO-SE TODO O TEMPO',
                'O PACIENTE NÃO DEIXOU FAZER O EXAME'
            ],
            'tipoExameOptions' => ['EEG', 'MAPA', 'FOTO'],
        ]);
    }

    public function update(UpdateQuestionnaireRequest $request, Questionnaire $questionnaire)
    {
        $this->authorizeTeamAccess($questionnaire);

        $data = $request->validated();
        $data['updated_by'] = auth()->id();

        // Debug logging
        \Log::info('Update Questionnaire - Request data:', [
            'questionnaire_id' => $questionnaire->id,
            'has_file' => $request->hasFile('pedido_medico'),
            'current_pedido_medico' => $questionnaire->pedido_medico,
            'file_info' => $request->hasFile('pedido_medico') ? [
                'name' => $request->file('pedido_medico')->getClientOriginalName(),
                'size' => $request->file('pedido_medico')->getSize(),
                'mime' => $request->file('pedido_medico')->getMimeType()
            ] : null
        ]);

        // Manejar assinatura (base64)
        if ($request->filled('assinatura_paciente')) {
            $data['assinatura_paciente'] = $request->assinatura_paciente;
        }

        if ($request->hasFile('pedido_medico')) {
            // Eliminar archivo anterior si existe
            if ($questionnaire->pedido_medico) {
                Storage::disk('private')->delete($questionnaire->pedido_medico);
                \Log::info('Deleted old file:', ['path' => $questionnaire->pedido_medico]);
            }
            $filePath = $request->file('pedido_medico')
                ->store('medical_requests', 'private');
            $data['pedido_medico'] = $filePath;
            \Log::info('New file stored at:', ['path' => $filePath]);
        } else {
            // Si no hay archivo nuevo, mantener el archivo actual
            unset($data['pedido_medico']);
            \Log::info('No new file uploaded, keeping current file:', ['current' => $questionnaire->pedido_medico]);
        }

        \Log::info('Data before update:', ['pedido_medico' => $data['pedido_medico'] ?? 'NOT_SET']);
        
        $request->validate($this->attachmentRules());

        $questionnaire->update($data);

        $this->storeAttachments($questionnaire, $request);
        
        \Log::info('Questionnaire updated:', [
            'id' => $questionnaire->id,
            'pedido_medico_saved' => $questionnaire->fresh()->pedido_medico
        ]);

        return redirect()->route('questionnaires.electroencefalograma.index')
            ->with('success', __('questionnaires.updated_successfully'));
    }

    public function destroy(Questionnaire $questionnaire)
    {
        $this->authorizeTeamAccess($questionnaire);

        // No necesita eliminar assinatura_paciente ya que es base64 en BD
        
        if ($questionnaire->pedido_medico) {
            Storage::disk('private')->delete($questionnaire->pedido_medico);
        }

        $questionnaire->delete();

        return redirect()->route('questionnaires.electroencefalograma.index')
            ->with('success', __('questionnaires.deleted_successfully'));
    }
}