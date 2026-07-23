<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreElectroneuromiografiaRequest;
use App\Http\Requests\UpdateElectroneuromiografiaRequest;
use App\Models\Electroneuromiografia;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ElectroneuromiografiaController extends Controller
{
    public function __construct()
    {
        // Removido authorizeResource para usar permisos de Spatie directamente
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $teamId = $request->get('team_id');

        $query = Electroneuromiografia::with(['team', 'creator', 'editor'])
            ->whereIn('team_id', $user->teams->pluck('id'));

        // Solo filtrar por equipo específico si se proporciona team_id
        if ($teamId) {
            $query->where('team_id', $teamId);
        }

        // Filtros de búsqueda
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                  ->orWhere('rg', 'like', "%{$search}%");
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
        $allowedSortFields = ['nome', 'clinica', 'rg', 'data_exame', 'created_at'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }
        
        // Validar dirección de ordenamiento
        if (!in_array($sortDirection, ['asc', 'desc'])) {
            $sortDirection = 'desc';
        }

        $questionnaires = $query->orderBy($sortField, $sortDirection)->paginate(15);

        return Inertia::render('Questionnaires/Electroneuromiografia/Index', [
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
        
        return Inertia::render('Questionnaires/Electroneuromiografia/Create', [
            'teams' => $user->teams,
            'tiposExameOptions' => ['MSD', 'MSE', 'MID', 'MIE'],
            'areasColuna' => ['Cervical', 'Torácica', 'Lombar', 'Região Sacral', 'Região do Cóccix'],
            'momentoExameOptions' => [
                'O PACIENTE FICOU CALMO',
                'O PACIENTE FICOU ANSISO E NERVOSO E MOVIMENTANDO-SE TODO O TEMPO',
                'O PACIENTE NÃO DEIXOU FAZER O EXAME'
            ],
        ]);
    }

    public function store(StoreElectroneuromiografiaRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = auth()->id();

        // Debug logging
        \Log::info('Store Electroneuromiografia - Request data:', [
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
        
        $questionnaire = Electroneuromiografia::create($data);
        
        \Log::info('Electroneuromiografia created:', [
            'id' => $questionnaire->id,
            'pedido_medico_saved' => $questionnaire->pedido_medico
        ]);

        return redirect()->route('questionnaires.electroneuromiografia.index')
            ->with('success', 'Questionário criado com sucesso!');
    }

    public function show(Electroneuromiografia $electroneuromiografia): Response
    {
        $electroneuromiografia->load(['team', 'creator', 'editor']);

        return Inertia::render('Questionnaires/Electroneuromiografia/Show', [
            'questionnaire' => $electroneuromiografia,
            'can' => [
                'edit' => auth()->user()->can('update', $electroneuromiografia),
                'delete' => auth()->user()->can('delete', $electroneuromiografia),
            ],
        ]);
    }

    public function edit(Electroneuromiografia $electroneuromiografia): Response
    {
        $user = auth()->user();
        $electroneuromiografia->load(['team', 'creator', 'editor']);

        return Inertia::render('Questionnaires/Electroneuromiografia/Edit', [
            'questionnaire' => $electroneuromiografia,
            'teams' => $user->teams,
            'tiposExameOptions' => ['MSD', 'MSE', 'MID', 'MIE'],
            'areasColuna' => ['Cervical', 'Torácica', 'Lombar', 'Região Sacral', 'Região do Cóccix'],
            'momentoExameOptions' => [
                'O PACIENTE FICOU CALMO',
                'O PACIENTE FICOU ANSISO E NERVOSO E MOVIMENTANDO-SE TODO O TEMPO',
                'O PACIENTE NÃO DEIXOU FAZER O EXAME'
            ],
        ]);
    }

    public function update(UpdateElectroneuromiografiaRequest $request, Electroneuromiografia $electroneuromiografia)
    {
        $data = $request->validated();
        $data['updated_by'] = auth()->id();

        // Debug logging
        \Log::info('Update Electroneuromiografia - Request data:', [
            'questionnaire_id' => $electroneuromiografia->id,
            'has_file' => $request->hasFile('pedido_medico'),
            'current_pedido_medico' => $electroneuromiografia->pedido_medico,
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
            if ($electroneuromiografia->pedido_medico) {
                Storage::disk('public')->delete($electroneuromiografia->pedido_medico);
                \Log::info('Deleted old file:', ['path' => $electroneuromiografia->pedido_medico]);
            }
            $filePath = $request->file('pedido_medico')
                ->store('medical_requests', 'public');
            $data['pedido_medico'] = $filePath;
            \Log::info('New file stored at:', ['path' => $filePath]);
        } else {
            // Si no hay archivo nuevo, mantener el archivo actual
            unset($data['pedido_medico']);
            \Log::info('No new file uploaded, keeping current file:', ['current' => $electroneuromiografia->pedido_medico]);
        }

        \Log::info('Data before update:', ['pedido_medico' => $data['pedido_medico'] ?? 'NOT_SET']);
        
        $electroneuromiografia->update($data);
        
        \Log::info('Electroneuromiografia updated:', [
            'id' => $electroneuromiografia->id,
            'pedido_medico_saved' => $electroneuromiografia->fresh()->pedido_medico
        ]);

        return redirect()->route('questionnaires.electroneuromiografia.index')
            ->with('success', 'Questionário atualizado com sucesso!');
    }

    public function destroy(Electroneuromiografia $electroneuromiografia)
    {
        // No necesita eliminar assinatura_paciente ya que es base64 en BD
        
        if ($electroneuromiografia->pedido_medico) {
            Storage::disk('public')->delete($electroneuromiografia->pedido_medico);
        }

        $electroneuromiografia->delete();

        return redirect()->route('questionnaires.electroneuromiografia.index')
            ->with('success', 'Questionário excluído com sucesso!');
    }
}