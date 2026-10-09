<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;

/**
 * Convierte a MAYÚSCULAS los campos de texto libre ingresados por el usuario.
 *
 * Solo se normalizan los campos listados en uppercaseTextFields() (los mismos
 * que usa resources/js/Utils/uppercase.js). Los select/checkbox/radio y los
 * campos técnicos o con validación in: quedan excluidos a propósito para no
 * romper validaciones, opciones de select ni firmas base64.
 */
trait UppercasesTextAttributes
{
    protected static function bootUppercasesTextAttributes(): void
    {
        static::saving(function (Model $model): void {
            $model->applyUppercaseToTextFields();
        });
    }

    /**
     * @return array<int, string>
     */
    public static function uppercaseTextFields(): array
    {
        return [
            'alcool_frequencia',
            'antecedentes_outra',
            'avc_quando',
            'botox_parte_face',
            'cid',
            'cirurgias_membro_superior',
            'classificacao',
            'clinica',
            'comentario',
            'conclusao',
            'conclusao_final',
            'conduta',
            'crefito_crm',
            'crm_registro',
            'crm_rg',
            'dermatologista_motivo',
            'diabetes_faz_uso',
            'diagnostico',
            'diagnostico_principal',
            'dispositivo_auxiliar_outro',
            'doencas_cronicas',
            'dor_localizacao',
            'dor_olhos_lado',
            'drogas_quais',
            'escolaridade',
            'espasmos_face_parte',
            'examinador',
            'familiar_perda_auditiva_quem',
            'fonoaudiologo_motivo',
            'fraturas_regiao',
            'geriatra_motivo',
            'grau_oculos',
            'hipertensao_faz_uso',
            'indicacao_avaliacao',
            'indicacao_clinica',
            'lesao_previa_atual_qual',
            'localizacao_dor',
            'maior_assimetria_movimento',
            'medicacoes_uso',
            'medicamentos',
            'medicamentos_detalhes',
            'neurocirurgiao_motivo',
            'neurologista_motivo',
            'neuropediatra_motivo',
            'nome',
            'nome_avaliador',
            'nome_completo',
            'nome_profissional_pedido',
            'nome_tecnico_medico_exame',
            'observacoes',
            'observacoes_correlacao',
            'oftalmologista_motivo',
            'ortopedista_motivo',
            'otorrino_motivo',
            'parestesias_localizacao',
            'parte_face_paralisada_qual',
            'patologia_olho_detalhes',
            'pedi_idade_cronologica_vs_desenvolvimento',
            'perda_audicao_ouvido',
            'peso',
            'posicao_protocolo',
            'processo_infeccioso_detalhes',
            'profissao',
            'psiquiatra_motivo',
            'quando_teve_avc',
            'quando_teve_convulsao',
            'responsavel_menor',
            'reumatologista_motivo',
            'rg',
            'rg_ou_cpf',
            'seguranca_observacoes',
            'solicitante',
            'tipo_trabalho',
            'tug_tempo_segundos',
            'unidade_outra',
            'valor_analise_outro',
        ];
    }

    protected function applyUppercaseToTextFields(): void
    {
        $fields = static::uppercaseTextFields();

        foreach ($this->getAttributes() as $key => $value) {
            if (! is_string($value) || $value === '') {
                continue;
            }

            if (! in_array($key, $fields, true)) {
                continue;
            }

            // Nada de firmas base64, data URIs ni URLs.
            if (str_starts_with($value, 'data:') || str_contains($value, '://') || strlen($value) > 5000) {
                continue;
            }

            $normalized = class_exists(\Normalizer::class)
                ? (\Normalizer::normalize($value, \Normalizer::FORM_C) ?: $value)
                : $value;

            $this->attributes[$key] = mb_strtoupper(trim($normalized), 'UTF-8');
        }
    }
}
