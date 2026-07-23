<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateQuestionnaireRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('edit questionnaires');
    }

    public function rules(): array
    {
        return [
            'clinica' => ['required', 'string', 'max:255'],
            'data_exame' => ['required', 'date'],
            'nome_completo' => ['required', 'string', 'max:255'],
            'data_nascimento' => ['required', 'date', 'before:today'],
            'sexo' => ['required', 'string', 'max:255'],
            'rg_ou_cpf' => ['required', 'string', 'max:255'],
            'team_id' => ['required', 'exists:teams,id'],
            'tipo_exame' => ['required', 'in:EEG,MAPA,FOTO'],
            
            // Campos boolean
            'teve_covid' => ['boolean'],
            'teve_desmaio' => ['boolean'],
            'ja_teve_avc' => ['boolean'],
            'quando_teve_avc' => ['nullable', 'required_if:ja_teve_avc,true', 'string', 'max:255'],
            'ja_teve_convulsao' => ['boolean'],
            'quando_teve_convulsao' => ['nullable', 'required_if:ja_teve_convulsao,true', 'string', 'max:255'],
            'ja_bateu_cabeca' => ['boolean'],
            'tem_dor_cabeca' => ['boolean'],
            'tem_depressao' => ['boolean'],
            'tem_ansiedade' => ['boolean'],
            'tem_insonia' => ['boolean'],
            'tem_esquecimento' => ['boolean'],
            'tem_alzheimer' => ['boolean'],
            'tem_parkinson' => ['boolean'],
            
            // Hipertensión
            'hipertensao' => ['boolean'],
            'hipertensao_faz_uso' => ['nullable', 'required_if:hipertensao,true', 'string', 'max:255'],
            
            // Diabetes
            'diabetes' => ['boolean'],
            'diabetes_faz_uso' => ['nullable', 'required_if:diabetes,true', 'string', 'max:255'],
            
            // Otros campos boolean
            'tem_dificuldade_aprendizado' => ['boolean'],
            'hiperativo' => ['boolean'],
            'agressivo' => ['boolean'],
            'autismo' => ['boolean'],
            'tem_dificuldade_dormir' => ['boolean'],
            
            // Profesionales
            'nome_profissional_pedido' => ['required', 'string', 'max:255'],
            'nome_tecnico_medico_exame' => ['required', 'string', 'max:255'],
            
            // Momento del examen
            'momento_exame' => ['required', Rule::in([
                'O PACIENTE FICOU CALMO',
                'O PACIENTE FICOU ANSISO E NERVOSO E MOVIMENTANDO-SE TODO O TEMPO',
                'O PACIENTE NÃO DEIXOU FAZER O EXAME'
            ])],
            
            'comentario' => ['nullable', 'string'],
            
            // Archivos
            'assinatura_paciente' => ['nullable', 'string'],
            'pedido_medico' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            // Campos obrigatórios básicos
            'clinica.required' => 'O campo clínica é obrigatório.',
            'data_exame.required' => 'A data do exame é obrigatória.',
            'data_exame.date' => 'A data do exame deve ser uma data válida.',
            'nome_completo.required' => 'O nome completo é obrigatório.',
            'nome_completo.max' => 'O nome completo não pode ter mais de 255 caracteres.',
            'data_nascimento.required' => 'A data de nascimento é obrigatória.',
            'data_nascimento.date' => 'A data de nascimento deve ser uma data válida.',
            'data_nascimento.before' => 'A data de nascimento deve ser anterior a hoje.',
            'sexo.required' => 'O sexo é obrigatório.',
            'rg_ou_cpf.required' => 'O RG ou CPF é obrigatório.',
            
            // Equipe
            'team_id.required' => 'A equipe é obrigatória.',
            'team_id.exists' => 'A equipe selecionada não existe.',
            
            // Novos campos
            'tipo_exame.required' => 'O tipo de exame é obrigatório.',
            'tipo_exame.in' => 'O tipo de exame deve ser EEG, MAPA ou FOTO.',
            
            // Validações condicionais - AVC
            'quando_teve_avc.required_if' => 'O campo "quando teve AVC" é obrigatório quando o paciente já teve AVC.',
            'quando_teve_avc.max' => 'O campo "quando teve AVC" não pode ter mais de 255 caracteres.',
            
            // Validações condicionais - Convulsão
            'quando_teve_convulsao.required_if' => 'O campo "quando teve convulsão" é obrigatório quando o paciente já teve convulsão.',
            'quando_teve_convulsao.max' => 'O campo "quando teve convulsão" não pode ter mais de 255 caracteres.',
            
            // Validações condicionais - Hipertensão
            'hipertensao_faz_uso.required_if' => 'O campo "medicamento para hipertensão" é obrigatório quando o paciente tem hipertensão.',
            'hipertensao_faz_uso.max' => 'O campo "medicamento para hipertensão" não pode ter mais de 255 caracteres.',
            
            // Validações condicionais - Diabetes
            'diabetes_faz_uso.required_if' => 'O campo "medicamento para diabetes" é obrigatório quando o paciente tem diabetes.',
            'diabetes_faz_uso.max' => 'O campo "medicamento para diabetes" não pode ter mais de 255 caracteres.',
            
            // Profissionais
            'nome_profissional_pedido.required' => 'O nome do profissional que solicitou o exame é obrigatório.',
            'nome_profissional_pedido.max' => 'O nome do profissional não pode ter mais de 255 caracteres.',
            'nome_tecnico_medico_exame.required' => 'O nome do técnico ou médico que realizou o exame é obrigatório.',
            'nome_tecnico_medico_exame.max' => 'O nome do técnico/médico não pode ter mais de 255 caracteres.',
            
            // Momento do exame
            'momento_exame.required' => 'O momento do exame é obrigatório.',
            'momento_exame.in' => 'O momento do exame selecionado é inválido.',
            
            // Arquivo - Pedido médico
            'pedido_medico.image' => 'O pedido médico deve ser uma imagem.',
            'pedido_medico.mimes' => 'O pedido médico deve ser um arquivo PNG, JPG, JPEG ou WEBP.',
            'pedido_medico.max' => 'O pedido médico não pode ser maior que 5MB.',
        ];
    }
}
