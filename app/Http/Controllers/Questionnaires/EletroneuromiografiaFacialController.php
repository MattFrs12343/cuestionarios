<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Models\EletroneuromiografiaFacial;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EletroneuromiografiaFacialController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $teamId = $request->get('team_id');

        $query = EletroneuromiografiaFacial::with(['team', 'creator', 'editor'])
            ->whereIn('team_id', $user->teams->pluck('id'));

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
        
        $allowedSortFields = ['nome', 'clinica', 'rg', 'data_exame', 'created_at'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }
        
        if (!in_array($sortDirection, ['asc', 'desc'])) {
            $sortDirection = 'desc';
        }

        $questionnaires = $query->orderBy($sortField, $sortDirection)->paginate(15);

        return Inertia::render('Questionnaires/EletroneuromiografiaFacial/Index', [
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
        
        return Inertia::render('Questionnaires/EletroneuromiografiaFacial/Create', [
            'teams' => $user->teams,
        ]);
    }

    public function store(Request $request)
    {
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
            'team_id' => 'required|exists:teams,id',
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
            'diabetico' => 'boolean',
            'toma_medicamento' => 'boolean',
            'medicamentos' => 'nullable|string',
            'assinatura_paciente' => 'nullable|string',
            'pedido_medico' => 'nullable|file|image|max:10240',
        ]);

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
                ->store('medical_requests', 'public');
            $validated['pedido_medico'] = $filePath;
        }

        EletroneuromiografiaFacial::create($validated);

        return redirect()->route('questionnaires.eletroneuromiografia-facial.index')
            ->with('success', 'Questionário criado com sucesso!');
    }

    public function show(EletroneuromiografiaFacial $eletroneuromiografiaFacial): Response
    {
        $eletroneuromiografiaFacial->load(['team', 'creator', 'editor']);

        return Inertia::render('Questionnaires/EletroneuromiografiaFacial/Show', [
            'questionnaire' => $eletroneuromiografiaFacial,
            'can' => [
                'edit' => auth()->user()->hasPermissionTo('edit questionnaires'),
                'delete' => auth()->user()->hasPermissionTo('delete questionnaires'),
            ],
        ]);
    }

    public function edit(EletroneuromiografiaFacial $eletroneuromiografiaFacial): Response
    {
        $user = auth()->user();
        $eletroneuromiografiaFacial->load(['team', 'creator', 'editor']);

        return Inertia::render('Questionnaires/EletroneuromiografiaFacial/Edit', [
            'questionnaire' => $eletroneuromiografiaFacial,
            'teams' => $user->teams,
        ]);
    }

    public function update(Request $request, EletroneuromiografiaFacial $eletroneuromiografiaFacial)
    {
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
            'team_id' => 'required|exists:teams,id',
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
            'diabetico' => 'boolean',
            'toma_medicamento' => 'boolean',
            'medicamentos' => 'nullable|string',
            'assinatura_paciente' => 'nullable|string',
            'pedido_medico' => 'nullable|file|image|max:10240',
        ]);

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
            if ($eletroneuromiografiaFacial->pedido_medico) {
                Storage::disk('public')->delete($eletroneuromiografiaFacial->pedido_medico);
            }
            $filePath = $request->file('pedido_medico')
                ->store('medical_requests', 'public');
            $validated['pedido_medico'] = $filePath;
        } else {
            unset($validated['pedido_medico']);
        }

        $eletroneuromiografiaFacial->update($validated);

        return redirect()->route('questionnaires.eletroneuromiografia-facial.index')
            ->with('success', 'Questionário atualizado com sucesso!');
    }

    public function destroy(EletroneuromiografiaFacial $eletroneuromiografiaFacial)
    {
        if ($eletroneuromiografiaFacial->pedido_medico) {
            Storage::disk('public')->delete($eletroneuromiografiaFacial->pedido_medico);
        }

        $eletroneuromiografiaFacial->delete();

        return redirect()->route('questionnaires.eletroneuromiografia-facial.index')
            ->with('success', 'Questionário excluído com sucesso!');
    }
}

