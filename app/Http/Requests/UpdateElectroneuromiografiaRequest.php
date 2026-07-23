<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateElectroneuromiografiaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('edit questionnaires');
    }

    protected function prepareForValidation()
    {
        // Converter strings '1'/'0' para boolean para campos boolean
        $booleanFields = [
            'primeira_vez_exame', 'diabetico', 'diabetico_tratamento', 'tomando_medicamentos',
            'teve_covid', 'teve_avc', 'dor_coluna', 'trabalha', 'teve_fraturas',
            'faz_quimioterapia', 'faz_radioterapia', 'faz_hemodialise', 'tem_marcapasso',
            'processo_infeccioso', 'consome_alcool', 'usa_drogas',
            // Membros Superiores
            'ms_dor_bracos', 'ms_dor_comeca_ombros', 'ms_dor_maos', 'ms_formigamento_bracos',
            'ms_formigamento_comeca_ombros', 'ms_formigamento_maos', 'ms_dormencia_bracos',
            'ms_dormencia_comeca_ombros', 'ms_dormencia_maos', 'ms_tremores_bracos',
            'ms_tremores_maos', 'ms_polegar_treme', 'ms_fraqueza_bracos', 'ms_fraqueza_maos',
            'ms_fadiga_falar', 'ms_perda_peso', 'ms_queimacao', 'ms_caibra',
            // Membros Inferiores
            'mi_dor_pernas', 'mi_dor_comeca_bacia', 'mi_dor_ciatico', 'mi_dor_pes',
            'mi_formigamento_pernas', 'mi_formigamento_comeca_bacia', 'mi_formigamento_pes',
            'mi_dormencia_pernas', 'mi_dormencia_comeca_bacia', 'mi_dormencia_pes',
            'mi_tremores_pernas', 'mi_tremores_pes', 'mi_fraqueza_pernas', 'mi_fraqueza_pes',
            'mi_fraqueza_ascendente', 'mi_fadiga_falar', 'mi_perda_peso', 'mi_queimacao',
            'mi_caibra',
            // Especialistas
            'consultou_reumatologista', 'consultou_neurologista', 'consultou_neurocirurgiao',
            'consultou_dermatologista', 'consultou_geriatra', 'consultou_ortopedista'
        ];

        $data = $this->all();

        // Converter strings '1'/'0' para boolean
        foreach ($booleanFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = $data[$field] === '1' || $data[$field] === 1 || $data[$field] === true;
            }
        }

        // Converter arrays JSON string para arrays
        $arrayFields = ['tipos_exame', 'areas_coluna'];
        foreach ($arrayFields as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $decoded = json_decode($data[$field], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $data[$field] = $decoded;
                }
            }
        }

        $this->replace($data);
    }

    public function rules(): array
    {
        return [
            // Datos básicos
            'nome' => ['required', 'string', 'max:255'],
            'data_nascimento' => ['required', 'date', 'before:today'],
            'peso' => ['nullable', 'string', 'max:50'],
            'altura' => ['nullable', 'string', 'max:50'],
            'data_exame' => ['required', 'date'],
            'rg' => ['required', 'string', 'max:255'],
            'sexo' => ['required', 'string', 'max:255'],
            'solicitante' => ['required', 'string', 'max:255'],
            'clinica' => ['required', 'string', 'max:255'],
            'team_id' => ['required', 'exists:teams,id'],
            'tipos_exame' => ['required', 'array', 'min:1'],
            'tipos_exame.*' => ['in:MSD,MSE,MID,MIE'],
            
            // Información adicional
            'primeira_vez_exame' => ['boolean'],
            'diabetico' => ['boolean'],
            'diabetico_tratamento' => ['boolean'],
            'tomando_medicamentos' => ['boolean'],
            'medicamentos_detalhes' => ['nullable', 'required_if:tomando_medicamentos,true', 'string', 'max:1000'],
            'teve_covid' => ['boolean'],
            'teve_avc' => ['boolean'],
            'avc_tipo' => ['nullable', 'required_if:teve_avc,true', 'string', 'max:255'],
            'avc_quando' => ['nullable', 'required_if:teve_avc,true', 'string', 'max:255'],
            'dor_coluna' => ['boolean'],
            'areas_coluna' => ['nullable', 'array'],
            'areas_coluna.*' => ['in:Cervical,Torácica,Lombar,Região Sacral,Região do Cóccix'],
            'trabalha' => ['boolean'],
            'tipo_trabalho' => ['nullable', 'required_if:trabalha,true', 'string', 'max:255'],
            'teve_fraturas' => ['boolean'],
            'fraturas_regiao' => ['nullable', 'required_if:teve_fraturas,true', 'string', 'max:255'],
            'faz_quimioterapia' => ['boolean'],
            'faz_radioterapia' => ['boolean'],
            'faz_hemodialise' => ['boolean'],
            'tem_marcapasso' => ['boolean'],
            'processo_infeccioso' => ['boolean'],
            'processo_infeccioso_detalhes' => ['nullable', 'required_if:processo_infeccioso,true', 'string', 'max:500'],
            'consome_alcool' => ['boolean'],
            'alcool_frequencia' => ['nullable', 'required_if:consome_alcool,true', 'string', 'max:255'],
            'usa_drogas' => ['boolean'],
            'drogas_quais' => ['nullable', 'required_if:usa_drogas,true', 'string', 'max:255'],
            
            // Membros Superiores
            'ms_dor_bracos' => ['boolean'],
            'ms_dor_comeca_ombros' => ['boolean'],
            'ms_dor_maos' => ['boolean'],
            'ms_dor_mais_de' => ['nullable', 'in:DIA,NOITE,AMBOS'],
            'ms_formigamento_bracos' => ['boolean'],
            'ms_formigamento_comeca_ombros' => ['boolean'],
            'ms_formigamento_maos' => ['boolean'],
            'ms_dormencia_bracos' => ['boolean'],
            'ms_dormencia_comeca_ombros' => ['boolean'],
            'ms_dormencia_maos' => ['boolean'],
            'ms_tremores_bracos' => ['boolean'],
            'ms_tremores_maos' => ['boolean'],
            'ms_polegar_treme' => ['boolean'],
            'ms_fraqueza_bracos' => ['boolean'],
            'ms_fraqueza_maos' => ['boolean'],
            'ms_fadiga_falar' => ['boolean'],
            'ms_perda_peso' => ['boolean'],
            'ms_queimacao' => ['boolean'],
            'ms_caibra' => ['boolean'],
            'ms_membro_mais_afetado' => ['nullable', 'in:DIREITO,ESQUERDO,AMBOS'],
            
            // Membros Inferiores
            'mi_dor_pernas' => ['boolean'],
            'mi_dor_comeca_bacia' => ['boolean'],
            'mi_dor_ciatico' => ['boolean'],
            'mi_dor_pes' => ['boolean'],
            'mi_formigamento_pernas' => ['boolean'],
            'mi_formigamento_comeca_bacia' => ['boolean'],
            'mi_formigamento_pes' => ['boolean'],
            'mi_dormencia_pernas' => ['boolean'],
            'mi_dormencia_comeca_bacia' => ['boolean'],
            'mi_dormencia_pes' => ['boolean'],
            'mi_tremores_pernas' => ['boolean'],
            'mi_tremores_pes' => ['boolean'],
            'mi_fraqueza_pernas' => ['boolean'],
            'mi_fraqueza_pes' => ['boolean'],
            'mi_fraqueza_ascendente' => ['boolean'],
            'mi_fadiga_falar' => ['boolean'],
            'mi_perda_peso' => ['boolean'],
            'mi_queimacao' => ['boolean'],
            'mi_caibra' => ['boolean'],
            'mi_membro_mais_afetado' => ['nullable', 'in:DIREITO,ESQUERDO,AMBOS'],
            
            // Especialistas
            'consultou_reumatologista' => ['boolean'],
            'reumatologista_motivo' => ['nullable', 'required_if:consultou_reumatologista,true', 'string', 'max:500'],
            'consultou_neurologista' => ['boolean'],
            'neurologista_motivo' => ['nullable', 'required_if:consultou_neurologista,true', 'string', 'max:500'],
            'consultou_neurocirurgiao' => ['boolean'],
            'neurocirurgiao_motivo' => ['nullable', 'required_if:consultou_neurocirurgiao,true', 'string', 'max:500'],
            'consultou_dermatologista' => ['boolean'],
            'dermatologista_motivo' => ['nullable', 'required_if:consultou_dermatologista,true', 'string', 'max:500'],
            'consultou_geriatra' => ['boolean'],
            'geriatra_motivo' => ['nullable', 'required_if:consultou_geriatra,true', 'string', 'max:500'],
            'consultou_ortopedista' => ['boolean'],
            'ortopedista_motivo' => ['nullable', 'required_if:consultou_ortopedista,true', 'string', 'max:500'],
            
            // Observaciones
            'observacoes' => ['nullable', 'string'],
            
            // Archivos
            'assinatura_paciente' => ['nullable', 'string'],
            'pedido_medico' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            // Datos básicos
            'nome.required' => 'O nome é obrigatório.',
            'data_nascimento.required' => 'A data de nascimento é obrigatória.',
            'data_nascimento.before' => 'A data de nascimento deve ser anterior a hoje.',
            'data_exame.required' => 'A data do exame é obrigatória.',
            'rg.required' => 'O RG é obrigatório.',
            'sexo.required' => 'O sexo é obrigatório.',
            'solicitante.required' => 'O solicitante é obrigatório.',
            'clinica.required' => 'A clínica é obrigatória.',
            'team_id.required' => 'A equipe é obrigatória.',
            'tipos_exame.required' => 'Pelo menos um tipo de exame deve ser selecionado.',
            'tipos_exame.min' => 'Pelo menos um tipo de exame deve ser selecionado.',
            
            // Validações condicionais
            'avc_tipo.required_if' => 'O tipo de AVC é obrigatório quando o paciente teve AVC.',
            'avc_quando.required_if' => 'A data do AVC é obrigatória quando o paciente teve AVC.',
            'tipo_trabalho.required_if' => 'O tipo de trabalho é obrigatório quando o paciente trabalha.',
            'fraturas_regiao.required_if' => 'A região das fraturas é obrigatória quando o paciente teve fraturas.',
            'processo_infeccioso_detalhes.required_if' => 'Os detalhes do processo infeccioso são obrigatórios.',
            'alcool_frequencia.required_if' => 'A frequência do consumo de álcool é obrigatória.',
            'drogas_quais.required_if' => 'Especificar quais drogas é obrigatório.',
            'medicamentos_detalhes.required_if' => 'Os detalhes dos medicamentos são obrigatórios quando está tomando medicamentos.',
            'medicamentos_detalhes.max' => 'Os detalhes dos medicamentos não podem exceder 1000 caracteres.',
            
            // Especialistas
            'reumatologista_motivo.required_if' => 'O motivo da consulta com reumatologista é obrigatório.',
            'neurologista_motivo.required_if' => 'O motivo da consulta com neurologista é obrigatório.',
            'neurocirurgiao_motivo.required_if' => 'O motivo da consulta com neurocirurgião é obrigatório.',
            'dermatologista_motivo.required_if' => 'O motivo da consulta com dermatologista é obrigatório.',
            'geriatra_motivo.required_if' => 'O motivo da consulta com geriatra é obrigatório.',
            'ortopedista_motivo.required_if' => 'O motivo da consulta com ortopedista é obrigatório.',
            
            // Archivo
            'pedido_medico.image' => 'O pedido médico deve ser uma imagem.',
            'pedido_medico.mimes' => 'O pedido médico deve ser um arquivo PNG, JPG, JPEG ou WEBP.',
            'pedido_medico.max' => 'O pedido médico não pode ser maior que 5MB.',
        ];
    }
}