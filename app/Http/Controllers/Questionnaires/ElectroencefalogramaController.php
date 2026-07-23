<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuestionnaireRequest;
use App\Http\Requests\UpdateQuestionnaireRequest;
use App\Models\Questionnaire;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ElectroencefalogramaController extends Controller
{
    public function __construct()
    {
        // Removido authorizeResource para usar permisos de Spatie directamente
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $teamId = $request->get('team_id');

        $query = Questionnaire::with(['team', 'creator', 'editor'])
            ->whereIn('team_id', $user->teams->pluck('id'));

        // Solo filtrar por equipo específico si se proporciona team_id
        if ($teamId) {
            $query->where('team_id', $teamId);
        }

        // Filtros de búsqueda
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nome_completo', 'like', "%{$search}%")
                  ->orWhere('rg_ou_cpf', 'like', "%{$search}%");
            });
        }

        if ($dateFrom = $request->get('date_from')) {
            $query->where('data_exame', '>=', $dateFrom);
        }

        if ($dateTo = $request->get('date_to')) {
            $query->where('data_exame', '<=', $dateTo);
        }

        if ($clinica = $request->get('clinica')) {
            $query->where('clinica', 'like', "%{$clinica}%");
        }

        // Ordenamiento
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        
        // Validar campos de ordenamiento permitidos
        $allowedSortFields = ['nome_completo', 'clinica', 'rg_ou_cpf', 'data_exame', 'created_at'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }
        
        // Validar dirección de ordenamiento
        if (!in_array($sortDirection, ['asc', 'desc'])) {
            $sortDirection = 'desc';
        }

        $questionnaires = $query->orderBy($sortField, $sortDirection)->paginate(15);

        return Inertia::render('Questionnaires/Electroencefalograma/Index', [
            'questionnaires' => $questionnaires,
            'teams' => $user->teams,
            'currentTeam' => $teamId ? Team::find($teamId) : null,
            'filters' => array_filter($request->only(['search', 'date_from', 'date_to', 'team_id', 'clinica', 'sort', 'direction']), function($value) {
                return $value !== null && $value !== '';
            }),
            'can' => [
                'create' => $user->hasPermissionTo('create questionnaires'),
                'edit' => $user->hasPermissionTo('edit questionnaires'),
                'delete' => $user->hasPermissionTo('delete questionnaires'),
            ],
        ]);
    }

    public function create(): Response
    {
        $user = auth()->user();
        
        return Inertia::render('Questionnaires/Electroencefalograma/Create', [
            'teams' => $user->teams,
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
                ->store('medical_requests', 'public');
            $data['pedido_medico'] = $filePath;
            \Log::info('File stored at:', ['path' => $filePath]);
        }

        \Log::info('Data before create:', ['pedido_medico' => $data['pedido_medico'] ?? 'NULL']);
        
        $questionnaire = Questionnaire::create($data);
        
        \Log::info('Questionnaire created:', [
            'id' => $questionnaire->id,
            'pedido_medico_saved' => $questionnaire->pedido_medico
        ]);

        return redirect()->route('questionnaires.electroencefalograma.index')
            ->with('success', __('questionnaires.created_successfully'));
    }

    public function show(Questionnaire $questionnaire): Response
    {
        $questionnaire->load(['team', 'creator', 'editor']);

        return Inertia::render('Questionnaires/Electroencefalograma/Show', [
            'questionnaire' => $questionnaire,
            'can' => [
                'edit' => auth()->user()->can('update', $questionnaire),
                'delete' => auth()->user()->can('delete', $questionnaire),
            ],
        ]);
    }

    public function edit(Questionnaire $questionnaire): Response
    {
        $user = auth()->user();
        $questionnaire->load(['team', 'creator', 'editor']);

        return Inertia::render('Questionnaires/Electroencefalograma/Edit', [
            'questionnaire' => $questionnaire,
            'teams' => $user->teams,
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
                Storage::disk('public')->delete($questionnaire->pedido_medico);
                \Log::info('Deleted old file:', ['path' => $questionnaire->pedido_medico]);
            }
            $filePath = $request->file('pedido_medico')
                ->store('medical_requests', 'public');
            $data['pedido_medico'] = $filePath;
            \Log::info('New file stored at:', ['path' => $filePath]);
        } else {
            // Si no hay archivo nuevo, mantener el archivo actual
            unset($data['pedido_medico']);
            \Log::info('No new file uploaded, keeping current file:', ['current' => $questionnaire->pedido_medico]);
        }

        \Log::info('Data before update:', ['pedido_medico' => $data['pedido_medico'] ?? 'NOT_SET']);
        
        $questionnaire->update($data);
        
        \Log::info('Questionnaire updated:', [
            'id' => $questionnaire->id,
            'pedido_medico_saved' => $questionnaire->fresh()->pedido_medico
        ]);

        return redirect()->route('questionnaires.electroencefalograma.index')
            ->with('success', __('questionnaires.updated_successfully'));
    }

    public function destroy(Questionnaire $questionnaire)
    {
        // No necesita eliminar assinatura_paciente ya que es base64 en BD
        
        if ($questionnaire->pedido_medico) {
            Storage::disk('public')->delete($questionnaire->pedido_medico);
        }

        $questionnaire->delete();

        return redirect()->route('questionnaires.electroencefalograma.index')
            ->with('success', __('questionnaires.deleted_successfully'));
    }
}