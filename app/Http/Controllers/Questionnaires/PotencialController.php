<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePotencialRequest;
use App\Http\Requests\UpdatePotencialRequest;
use App\Models\Potencial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PotencialController extends Controller
{
    use RestrictsQuestionnaireByTeam, HandlesAttachments;

    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $this->currentTeam($request);

        $query = Potencial::with(['team', 'creator', 'editor'])->where('team_id', $team->id);

        $this->applyIndexFilters($query, $request, ['nome', 'rg'], ['nome', 'clinica', 'rg', 'data_exame', 'created_at']);

        $questionnaires = $query->paginate(15);

        return Inertia::render('Questionnaires/Potencial/Index', [
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
        return Inertia::render('Questionnaires/Potencial/Create', [
            'retardoMentalGraus' => ['Leve', 'Moderado', 'Grave'],
        ]);
    }

    public function store(StorePotencialRequest $request)
    {
        $data = $request->validated();
        $data['team_id'] = $this->currentTeam($request)->id;
        $data['created_by'] = auth()->id();

        // Manejar assinatura (base64)
        if ($request->filled('assinatura_paciente')) {
            $data['assinatura_paciente'] = $request->assinatura_paciente;
        }

        if ($request->hasFile('pedido_medico')) {
            $filePath = $request->file('pedido_medico')
                ->store('medical_requests', 'private');
            $data['pedido_medico'] = $filePath;
        }
        
        $request->validate($this->attachmentRules());

        $questionnaire = Potencial::create($data);

        $this->storeAttachments($questionnaire, $request);

        return redirect()->route('questionnaires.potencial.index')
            ->with('success', 'Questionário de Potencial criado com sucesso!');
    }

    public function show(Potencial $potencial): Response
    {
        $this->authorizeTeamAccess($potencial);

        $potencial->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Potencial/Show', [
            'questionnaire' => $potencial,
            'pedidoMedicoUrl' => $potencial->pedido_medico
                ? route('pedidos-medicos.show', ['type' => 'potencial', 'id' => $potencial->id])
                : null,
            'can' => [
                'edit' => auth()->user()->can('update', $potencial),
                'delete' => auth()->user()->can('delete', $potencial),
            ],
        ]);
    }

    public function edit(Potencial $potencial): Response
    {
        $this->authorizeTeamAccess($potencial);

        $potencial->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Potencial/Edit', [
            'questionnaire' => $potencial,
            'pedidoMedicoUrl' => $potencial->pedido_medico
                ? route('pedidos-medicos.show', ['type' => 'potencial', 'id' => $potencial->id])
                : null,
            'retardoMentalGraus' => ['Leve', 'Moderado', 'Grave'],
        ]);
    }

    public function update(UpdatePotencialRequest $request, Potencial $potencial)
    {
        $this->authorizeTeamAccess($potencial);

        $data = $request->validated();
        $data['updated_by'] = auth()->id();

        // Manejar assinatura (base64)
        if ($request->filled('assinatura_paciente')) {
            $data['assinatura_paciente'] = $request->assinatura_paciente;
        }

        if ($request->hasFile('pedido_medico')) {
            // Eliminar archivo anterior si existe
            if ($potencial->pedido_medico) {
                Storage::disk('private')->delete($potencial->pedido_medico);
            }
            $filePath = $request->file('pedido_medico')
                ->store('medical_requests', 'private');
            $data['pedido_medico'] = $filePath;
        } else {
            // Si no hay archivo nuevo, mantener el archivo actual
            unset($data['pedido_medico']);
        }
        
        $request->validate($this->attachmentRules());

        $potencial->update($data);

        $this->storeAttachments($potencial, $request);

        return redirect()->route('questionnaires.potencial.index')
            ->with('success', 'Questionário de Potencial atualizado com sucesso!');
    }

    public function destroy(Potencial $potencial)
    {
        $this->authorizeTeamAccess($potencial);

        if ($potencial->pedido_medico) {
            Storage::disk('private')->delete($potencial->pedido_medico);
        }

        $potencial->delete();

        return redirect()->route('questionnaires.potencial.index')
            ->with('success', 'Questionário de Potencial excluído com sucesso!');
    }
}