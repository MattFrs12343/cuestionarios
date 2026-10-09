// Campos de texto libre ingresados por el usuario en los formularios de
// cuestionarios. Solo estos campos se convierten a MAYÚSCULAS.
// Los select/checkbox/radio y campos técnicos (tipo_exame, areas_coluna,
// assinatura_paciente, pedido_medico, etc.) quedan excluidos a propósito
// para no romper validaciones in:, opciones de select ni firmas base64.
export const UPPERCASE_FIELDS = [
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

const FIELD_SET = new Set(UPPERCASE_FIELDS);

function isFileLike(v) {
    return typeof File !== 'undefined' && v instanceof File
        ? true
        : typeof Blob !== 'undefined' && v instanceof Blob;
}

function shouldSkipString(v) {
    if (v.length === 0) return true;
    if (v.length > 5000) return true;
    if (v.startsWith('data:')) return true;
    if (v.includes('://')) return true;
    return false;
}

function toUpper(v) {
    if (typeof v === 'string') {
        if (shouldSkipString(v)) return v;
        return v.normalize('NFC').toUpperCase();
    }
    if (Array.isArray(v)) return v.map(toUpper);
    if (v && typeof v === 'object') {
        if (isFileLike(v)) return v;
        return upperAll(v);
    }
    return v;
}

export function upperAll(data) {
    if (!data || typeof data !== 'object') return data;
    const out = {};
    for (const [k, v] of Object.entries(data)) {
        if (FIELD_SET.has(k)) {
            out[k] = toUpper(v);
        } else if (v && typeof v === 'object' && !isFileLike(v) && !Array.isArray(v)) {
            out[k] = v;
        } else {
            out[k] = v;
        }
    }
    return out;
}
