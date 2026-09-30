<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreElectroneuromiografiaRequest;
use App\Http\Requests\UpdateElectroneuromiografiaRequest;
use App\Models\Electroneuromiografia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ElectroneuromiografiaController extends Controller
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

        $query = Electroneuromiografia::with(['team', 'creator', 'editor'])->where('team_id', $team->id);

        $this->applyIndexFilters($query, $request, ['nome', 'rg'], ['nome', 'clinica', 'rg', 'data_exame', 'created_at']);

        $questionnaires = $query->paginate(15);

        return Inertia::render('Questionnaires/Electroneuromiografia/Index', [
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
        return Inertia::render('Questionnaires/Electroneuromiografia/Create', [
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

        $questionnaire = Electroneuromiografia::create($data);

        $this->storeAttachments($questionnaire, $request);

        return redirect()->route('questionnaires.electroneuromiografia.index')
            ->with('success', 'Questionário criado com sucesso!');
    }

    public function show(Electroneuromiografia $electroneuromiografia): Response
    {
        $this->authorizeTeamAccess($electroneuromiografia);

        $electroneuromiografia->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Electroneuromiografia/Show', [
            'questionnaire' => $electroneuromiografia,
            'pedidoMedicoUrl' => $electroneuromiografia->pedido_medico
                ? route('pedidos-medicos.show', ['type' => 'electroneuromiografia', 'id' => $electroneuromiografia->id])
                : null,
            'can' => [
                'edit' => auth()->user()->can('update', $electroneuromiografia),
                'delete' => auth()->user()->can('delete', $electroneuromiografia),
            ],
        ]);
    }

    public function edit(Electroneuromiografia $electroneuromiografia): Response
    {
        $this->authorizeTeamAccess($electroneuromiografia);

        $electroneuromiografia->load(['team', 'creator', 'editor', 'attachments']);

        return Inertia::render('Questionnaires/Electroneuromiografia/Edit', [
            'questionnaire' => $electroneuromiografia,
            'pedidoMedicoUrl' => $electroneuromiografia->pedido_medico
                ? route('pedidos-medicos.show', ['type' => 'electroneuromiografia', 'id' => $electroneuromiografia->id])
                : null,
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
        $this->authorizeTeamAccess($electroneuromiografia);

        $data = $request->validated();
        $data['updated_by'] = auth()->id();

        // Manejar assinatura (base64)
        if ($request->filled('assinatura_paciente')) {
            $data['assinatura_paciente'] = $request->assinatura_paciente;
        }

        if ($request->hasFile('pedido_medico')) {
            // Eliminar archivo anterior si existe
            if ($electroneuromiografia->pedido_medico) {
                Storage::disk('private')->delete($electroneuromiografia->pedido_medico);
            }
            $filePath = $request->file('pedido_medico')
                ->store('medical_requests', 'private');
            $data['pedido_medico'] = $filePath;
        } else {
            // Si no hay archivo nuevo, mantener el archivo actual
            unset($data['pedido_medico']);
        }

        $request->validate($this->attachmentRules());

        $electroneuromiografia->update($data);

        $this->storeAttachments($electroneuromiografia, $request);

        return redirect()->route('questionnaires.electroneuromiografia.index')
            ->with('success', 'Questionário atualizado com sucesso!');
    }

    public function destroy(Electroneuromiografia $electroneuromiografia)
    {
        $this->authorizeTeamAccess($electroneuromiografia);

        // No necesita eliminar assinatura_paciente ya que es base64 en BD
        
        if ($electroneuromiografia->pedido_medico) {
            Storage::disk('private')->delete($electroneuromiografia->pedido_medico);
        }

        $electroneuromiografia->delete();

        return redirect()->route('questionnaires.electroneuromiografia.index')
            ->with('success', 'Questionário excluído com sucesso!');
    }
}