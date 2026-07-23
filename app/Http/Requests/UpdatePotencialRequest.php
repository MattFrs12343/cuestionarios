<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePotencialRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Datos básicos
            'nome' => 'required|string|max:255',
            'data_nascimento' => 'required|date|before:today',
            'peso' => 'nullable|string|max:255',
            'altura' => 'nullable|string|max:255',
            'data_exame' => 'required|date|after_or_equal:data_nascimento',
            'rg' => 'required|string|max:255',
            'sexo' => 'required|in:Feminino,Masculino',
            'solicitante' => 'required|string|max:255',
            'clinica' => 'required|string|max:255',
            'team_id' => 'required|exists:teams,id',
            
            // Potencial Evocado Auditivo
            'tem_zumbido_ouvido' => 'boolean',
            'passou_fonoaudiologo' => 'boolean',
            'fonoaudiologo_motivo' => 'nullable|string|max:255',
            'passou_otorrino' => 'boolean',
            'otorrino_motivo' => 'nullable|string|max:255',
            'passa_neurologista' => 'boolean',
            'neurologista_motivo' => 'nullable|string|max:255',
            'passa_neuropediatra' => 'boolean',
            'neuropediatra_motivo' => 'nullable|string|max:255',
            'passa_psiquiatra' => 'boolean',
            'psiquiatra_motivo' => 'nullable|string|max:255',
            'tem_retardo_mental' => 'boolean',
            'retardo_mental_grau' => 'nullable|string|in:Leve,Moderado,Grave',
            'tem_paralisia_cerebral' => 'boolean',
            'sindrome_down' => 'boolean',
            'autismo' => 'boolean',
            'cefaleia_enxaqueca' => 'boolean',
            'crise_convulsiva' => 'boolean',
            'desmaios' => 'boolean',
            'dificuldade_fala' => 'boolean',
            'deficit_atencao' => 'boolean',
            'dificuldade_aprendizado' => 'boolean',
            'familiar_perda_auditiva' => 'boolean',
            'familiar_perda_auditiva_quem' => 'nullable|string|max:255',
            'teste_orelhinha_alterado' => 'boolean',
            'gestacao_meses' => 'nullable|integer|min:1|max:12',
            'teve_perda_audicao' => 'boolean',
            'perda_audicao_ouvido' => 'nullable|string|max:255',
            'teve_infeccao_ouvido' => 'boolean',
            'teve_trauma_ouvido' => 'boolean',
            'tem_labirintite_tontura_auditivo' => 'boolean',
            'tem_hipertensao_auditivo' => 'boolean',
            'tem_diabetes_auditivo' => 'boolean',
            
            // Potencial Evocado Visual
            'teve_avc' => 'boolean',
            'avc_quando' => 'nullable|string|max:255',
            'dificuldade_olhar_fixo' => 'boolean',
            'tem_diplopia' => 'boolean',
            'passou_oftalmologista' => 'boolean',
            'oftalmologista_motivo' => 'nullable|string|max:255',
            'tem_patologia_olho' => 'boolean',
            'patologia_olho_detalhes' => 'nullable|string|max:255',
            'usa_oculos' => 'boolean',
            'grau_oculos' => 'nullable|string|max:255',
            'cefaleia_visual' => 'boolean',
            'tem_enxaqueca_visual' => 'boolean',
            'incomoda_claridade' => 'boolean',
            've_pontinhos_coloridos' => 'boolean',
            'tem_alucinacoes_visuais' => 'boolean',
            'tem_labirintite_tontura_visual' => 'boolean',
            'tem_hipertensao_visual' => 'boolean',
            'tem_diabetes_visual' => 'boolean',
            
            // Observaciones
            'observacoes' => 'nullable|string',
            
            // Archivos
            'assinatura_paciente' => 'nullable|string',
            'pedido_medico' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf|max:10240',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Convertir strings '1' y '0' a booleanos para campos booleanos
        $booleanFields = [
            'tem_zumbido_ouvido', 'passou_fonoaudiologo', 'passou_otorrino', 'passa_neurologista',
            'passa_neuropediatra', 'passa_psiquiatra', 'tem_retardo_mental', 'tem_paralisia_cerebral',
            'sindrome_down', 'autismo', 'cefaleia_enxaqueca', 'crise_convulsiva', 'desmaios',
            'dificuldade_fala', 'deficit_atencao', 'dificuldade_aprendizado', 'familiar_perda_auditiva',
            'teste_orelhinha_alterado', 'teve_perda_audicao', 'teve_infeccao_ouvido', 'teve_trauma_ouvido',
            'tem_labirintite_tontura_auditivo', 'tem_hipertensao_auditivo', 'tem_diabetes_auditivo',
            'teve_avc', 'dificuldade_olhar_fixo', 'tem_diplopia', 'passou_oftalmologista',
            'tem_patologia_olho', 'usa_oculos', 'cefaleia_visual', 'tem_enxaqueca_visual',
            'incomoda_claridade', 've_pontinhos_coloridos', 'tem_alucinacoes_visuais',
            'tem_labirintite_tontura_visual', 'tem_hipertensao_visual', 'tem_diabetes_visual'
        ];

        $input = $this->all();
        
        foreach ($booleanFields as $field) {
            if (isset($input[$field])) {
                if ($input[$field] === '1' || $input[$field] === 1 || $input[$field] === true) {
                    $input[$field] = true;
                } else {
                    $input[$field] = false;
                }
            }
        }

        $this->replace($input);
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nome.required' => 'O campo nome é obrigatório.',
            'data_nascimento.required' => 'O campo data de nascimento é obrigatório.',
            'data_nascimento.before' => 'A data de nascimento deve ser anterior a hoje.',
            'data_exame.required' => 'O campo data do exame é obrigatório.',
            'data_exame.after_or_equal' => 'A data do exame deve ser posterior ou igual à data de nascimento.',
            'rg.required' => 'O campo RG ou CPF é obrigatório.',
            'sexo.required' => 'O campo sexo é obrigatório.',
            'solicitante.required' => 'O campo solicitante é obrigatório.',
            'clinica.required' => 'O campo clínica é obrigatório.',
            'team_id.required' => 'O campo equipe é obrigatório.',
            'team_id.exists' => 'A equipe selecionada não existe.',
            'retardo_mental_grau.in' => 'O grau de retardo mental deve ser Leve, Moderado ou Grave.',
            'gestacao_meses.integer' => 'Os meses de gestação devem ser um número inteiro.',
            'gestacao_meses.min' => 'Os meses de gestação devem ser no mínimo 1.',
            'gestacao_meses.max' => 'Os meses de gestação devem ser no máximo 12.',
            'pedido_medico.mimes' => 'O pedido médico deve ser um arquivo do tipo: jpeg, png, jpg, gif, pdf.',
            'pedido_medico.max' => 'O pedido médico não pode ser maior que 10MB.',
        ];
    }
}