<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePotencialRequest;
use App\Http\Requests\UpdatePotencialRequest;
use App\Models\Potencial;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PotencialController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $teamId = $request->get('team_id');

        $query = Potencial::with(['team', 'creator', 'editor'])
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

        return Inertia::render('Questionnaires/Potencial/Index', [
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
        
        return Inertia::render('Questionnaires/Potencial/Create', [
            'teams' => $user->teams,
            'retardoMentalGraus' => ['Leve', 'Moderado', 'Grave'],
        ]);
    }

    public function store(StorePotencialRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = auth()->id();

        // Manejar assinatura (base64)
        if ($request->filled('assinatura_paciente')) {
            $data['assinatura_paciente'] = $request->assinatura_paciente;
        }

        if ($request->hasFile('pedido_medico')) {
            $filePath = $request->file('pedido_medico')
                ->store('medical_requests', 'public');
            $data['pedido_medico'] = $filePath;
        }
        
        $questionnaire = Potencial::create($data);

        return redirect()->route('questionnaires.potencial.index')
            ->with('success', 'Questionário de Potencial criado com sucesso!');
    }

    public function show(Potencial $potencial): Response
    {
        $potencial->load(['team', 'creator', 'editor']);

        return Inertia::render('Questionnaires/Potencial/Show', [
            'questionnaire' => $potencial,
            'can' => [
                'edit' => auth()->user()->can('update', $potencial),
                'delete' => auth()->user()->can('delete', $potencial),
            ],
        ]);
    }

    public function edit(Potencial $potencial): Response
    {
        $user = auth()->user();
        $potencial->load(['team', 'creator', 'editor']);

        return Inertia::render('Questionnaires/Potencial/Edit', [
            'questionnaire' => $potencial,
            'teams' => $user->teams,
            'retardoMentalGraus' => ['Leve', 'Moderado', 'Grave'],
        ]);
    }

    public function update(UpdatePotencialRequest $request, Potencial $potencial)
    {
        $data = $request->validated();
        $data['updated_by'] = auth()->id();

        // Manejar assinatura (base64)
        if ($request->filled('assinatura_paciente')) {
            $data['assinatura_paciente'] = $request->assinatura_paciente;
        }

        if ($request->hasFile('pedido_medico')) {
            // Eliminar archivo anterior si existe
            if ($potencial->pedido_medico) {
                Storage::disk('public')->delete($potencial->pedido_medico);
            }
            $filePath = $request->file('pedido_medico')
                ->store('medical_requests', 'public');
            $data['pedido_medico'] = $filePath;
        } else {
            // Si no hay archivo nuevo, mantener el archivo actual
            unset($data['pedido_medico']);
        }
        
        $potencial->update($data);

        return redirect()->route('questionnaires.potencial.index')
            ->with('success', 'Questionário de Potencial atualizado com sucesso!');
    }

    public function destroy(Potencial $potencial)
    {
        if ($potencial->pedido_medico) {
            Storage::disk('public')->delete($potencial->pedido_medico);
        }

        $potencial->delete();

        return redirect()->route('questionnaires.potencial.index')
            ->with('success', 'Questionário de Potencial excluído com sucesso!');
    }
}