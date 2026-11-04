<?php

namespace App\Http\Controllers\Questionnaires;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuestionnaireRequest;
use App\Http\Requests\UpdateQuestionnaireRequest;
use App\Models\Questionnaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ElectroencefalogramaController extends Controller
{
    use RestrictsQuestionnaireByTeam, HandlesAttachments;

    public function __construct()
    {
        // Removido authorizeResource para usar permisos de Spatie directamente
    }

    /**
     * Este questionário costuma chegar com várias fotos + assinatura no mesmo
     * envio, o que faz dele o questionário com a requisição mais pesada da
     * plataforma. Um arquivo fora do padrão (ex.: foto HEIC do iPhone que não
     * foi comprimida no navegador) pode fazer o corpo da requisição passar do
     * limite do servidor (ModSecurity/Apache) antes de chegar ao Laravel, o
     * que aparece pro usuário como tela em branco / "Not Acceptable". Baixamos
     * a margem por imagem aqui (só neste controller, não afeta os outros
     * questionários) para rejeitar esse arquivo com uma mensagem clara em vez
     * de arriscar travar a requisição inteira no servidor.
     */
    protected function attachmentRules(): array
    {
        return [
            'anexos' => ['nullable', 'array', "max:{$this->maxAttachments}"],
            'anexos.*' => ['file', 'image', 'max:3072'], // 3 MB por imagem (padrão da plataforma é 10 MB)
        ];
    }

    protected function attachmentMessages(): array
    {
        return [
            'anexos.max' => 'Você pode enviar no máximo ' . $this->maxAttachments . ' fotos.',
            'anexos.*.image' => 'Cada anexo deve ser uma imagem.',
            'anexos.*.max' => 'Cada foto deve ter no máximo 3MB. Tente tirar a foto novamente ou escolher uma imagem menor.',
        ];
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

        $request->validate($this->attachmentRules(), $this->attachmentMessages());

        try {
            $questionnaire = DB::transaction(function () use ($data, $request) {
                $questionnaire = Questionnaire::create($data);
                $this->storeAttachments($questionnaire, $request);

                return $questionnaire;
            });
        } catch (Throwable $e) {
            // Se o anexo falhar depois de criar o registro, desfazemos tudo:
            // antes disso, o questionário ficava salvo SEM a foto, sem nenhum aviso.
            \Log::error('Falha ao salvar questionário de Electroencefalograma com anexos', [
                'message' => $e->getMessage(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Não foi possível salvar o questionário com as fotos enviadas. Tente novamente (se persistir, tente com fotos menores ou uma por vez).');
        }

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

        $request->validate($this->attachmentRules(), $this->attachmentMessages());

        try {
            DB::transaction(function () use ($data, $questionnaire, $request) {
                $questionnaire->update($data);
                $this->storeAttachments($questionnaire, $request);
            });
        } catch (Throwable $e) {
            // Mesma lógica do store(): se o anexo falhar, desfazemos a atualização
            // também, para não deixar o registro atualizado sem a foto nova.
            \Log::error('Falha ao atualizar questionário de Electroencefalograma com anexos', [
                'questionnaire_id' => $questionnaire->id,
                'message' => $e->getMessage(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Não foi possível salvar as alterações com as fotos enviadas. Tente novamente (se persistir, tente com fotos menores ou uma por vez).');
        }

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