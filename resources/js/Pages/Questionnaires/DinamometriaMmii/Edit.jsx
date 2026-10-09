import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AnexosUploader from '@/Components/AnexosUploader';
import SignaturePad from '@/Components/SignaturePad';
import BirthDateSelectInput from '@/Components/BirthDateSelectInput';
import QuestionnaireSectionNav from '@/Components/QuestionnaireSectionNav';
import { upperAll } from '@/Utils/uppercase';

const SECTIONS = [
    { id: 'sec-identificacao', label: '1. Identificação' },
    { id: 'sec-anamnese', label: '2. Anamnese' },
    { id: 'sec-antecedentes', label: '3. Antecedentes Clínicos' },
    { id: 'sec-seguranca', label: '4. Segurança do Teste' },
    { id: 'sec-exame-motor', label: '5. Exame Motor Pré-Dinamometria' },
    { id: 'sec-dinamometria', label: '6. Registro da Dinamometria' },
    { id: 'sec-interpretacao', label: '7. Impressão Funcional' },
    { id: 'sec-arquivos', label: 'Arquivos e Assinatura' },
];

const MOVIMENTOS = [
    'Flexão do quadril', 'Extensão do quadril', 'Abdução do quadril', 'Adução do quadril',
    'Flexão do joelho', 'Extensão do joelho', 'Dorsiflexão do tornozelo', 'Flexão plantar',
];

const FRAQUEZA_TIPOS = ['Proximal', 'Distal', 'Difusa', 'Assimétrica'];

const DIFICULDADE_ATIVIDADES = [
    'Caminhar', 'Subir escadas', 'Descer escadas', 'Levantar-se de uma cadeira',
    'Levantar-se da cama', 'Permanecer em pé', 'Correr', 'Agachar',
    'Sustentar o peso corporal', 'Flexão/extensão do joelho',
    'Dorsiflexão/flexão plantar do tornozelo',
];

const ANTECEDENTES = [
    'Acidente vascular cerebral – AVC', 'Polineuropatia', 'Radiculopatia lombossacra',
    'Hérnia/protusão discal', 'Doença neuromuscular', 'Miopatia',
    'Esclerose múltipla', 'Doença de Parkinson/parkinsonismo', 'Neuropatia diabética',
    'Traumatismo cranioencefálico', 'Traumatismo raquimedular', 'Lesão de nervo periférico',
    'Artrose de quadril/joelho/tornozelo', 'Cirurgia ortopédica prévia',
    'Fratura prévia de membro inferior', 'Prótese de quadril ou joelho',
];

const SEGURANCA = [
    'Dor aguda ou incapacitante', 'Trauma recente', 'Fratura recente ou suspeita',
    'Cirurgia recente no membro avaliado', 'Processo inflamatório/infeccioso local',
    'Edema importante', 'Lesão cutânea no local de posicionamento da cinta',
    'Trombose venosa conhecida/suspeita', 'Restrição médica para esforço',
    'Nenhuma das condições acima',
];

const INTERCORRENCIAS = [
    'Sem intercorrências', 'Dor', 'Fatigabilidade precoce', 'Tremor',
    'Compensação postural', 'Incapacidade de sustentar a contração',
    'Interrupção por desconforto',
];

const IMPRESSAO_FUNCIONAL = [
    'Força muscular preservada', 'Redução leve da força muscular',
    'Redução moderada da força muscular', 'Redução acentuada da força muscular',
    'Assimetria de força entre os membros inferiores', 'Fatigabilidade muscular',
    'Resultado limitado por dor', 'Resultado limitado pela colaboração/compreensão do paciente',
];

const MODELO_CONCLUSAO = [
    'Força com elevada simetria entre os membros nos movimentos avaliados.',
    'Pequena diferença interlateral, sem assimetria expressiva pelo critério adotado.',
    'Assimetria discreta de força entre os membros inferiores.',
    'Assimetria interlateral evidente.',
    'Assimetria acentuada de força entre os membros inferiores.',
    'Assimetria muito acentuada de força entre os membros inferiores.',
];

const COMPORTAMENTO_TESTE = [
    'Sem intercorrências', 'Dor', 'Fatigabilidade', 'Tremor',
    'Compensação postural', 'Dificuldade de sustentar a contração',
];

const classifyAssimetria = (pct) => {
    if (pct < 5) return MODELO_CONCLUSAO[0];
    if (pct < 10) return MODELO_CONCLUSAO[1];
    if (pct < 15) return MODELO_CONCLUSAO[2];
    if (pct < 20) return MODELO_CONCLUSAO[3];
    if (pct < 30) return MODELO_CONCLUSAO[4];
    return MODELO_CONCLUSAO[5];
};

const emptyMrc = () => MOVIMENTOS.map((movimento) => ({ movimento, direito: '', esquerdo: '' }));
const emptyDinamometria = () => MOVIMENTOS.map((movimento) => ({
    movimento, d1: '', d2: '', d3: '', d_melhor: '', d_media: '',
    e1: '', e2: '', e3: '', e_melhor: '', e_media: '', assimetria_pct: '', menor: '',
}));

const Toggle = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between gap-4 bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-500 rounded-lg p-4">
        <span className="text-base text-gray-800 dark:text-zinc-200">{label}</span>
        <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="w-6 h-6 text-cyan-600 dark:text-cyan-500 border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 rounded focus:ring-cyan-500 dark:focus:ring-cyan-600 flex-shrink-0" />
    </label>
);

const CheckboxGroup = ({ options, selected, onToggle, cols = 'grid-cols-1 sm:grid-cols-2' }) => (
    <div className={`grid ${cols} gap-2`}>
        {options.map((opt) => (
            <label key={opt} className={`flex items-start gap-2 border rounded-lg px-3 py-2.5 text-sm cursor-pointer transition-colors ${selected.includes(opt) ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-400 dark:border-cyan-600 text-cyan-900 dark:text-cyan-200' : 'bg-white dark:bg-zinc-700 border-gray-200 dark:border-zinc-500 text-gray-700 dark:text-zinc-300'}`}>
                <input type="checkbox" checked={selected.includes(opt)} onChange={() => onToggle(opt)} className="mt-0.5 w-5 h-5 text-cyan-600 dark:text-cyan-500 border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 rounded focus:ring-cyan-500 dark:focus:ring-cyan-600 flex-shrink-0" />
                <span>{opt}</span>
            </label>
        ))}
    </div>
);

export default function Edit({ auth, questionnaire }) {
    const { data, setData, put, processing, errors, transform } = useForm({
        clinica: questionnaire.clinica || '',
        data_exame: questionnaire.data_exame?.slice(0, 10) || '',
        nome_completo: questionnaire.nome_completo || '',
        data_nascimento: questionnaire.data_nascimento?.slice(0, 10) || '',
        sexo: questionnaire.sexo || '',
        peso: questionnaire.peso ?? '',
        altura: questionnaire.altura ?? '',
        dominancia: questionnaire.dominancia || '',
        profissao: questionnaire.profissao || '',
        indicacao_clinica: questionnaire.indicacao_clinica || '',

        fraqueza_muscular: questionnaire.fraqueza_muscular || false,
        fraqueza_lado: questionnaire.fraqueza_lado || '',
        fraqueza_tipo: questionnaire.fraqueza_tipo || [],
        dificuldade_atividades: questionnaire.dificuldade_atividades || [],
        fadiga_muscular: questionnaire.fadiga_muscular || false,
        dor_membros: questionnaire.dor_membros || false,
        dor_localizacao: questionnaire.dor_localizacao || '',
        dor_eva: questionnaire.dor_eva ?? '',
        parestesias: questionnaire.parestesias || false,
        parestesias_localizacao: questionnaire.parestesias_localizacao || '',
        dor_neuropatica: questionnaire.dor_neuropatica || false,
        caimbras: questionnaire.caimbras || false,
        tremores: questionnaire.tremores || false,
        rigidez_muscular: questionnaire.rigidez_muscular || false,
        alteracao_equilibrio: questionnaire.alteracao_equilibrio || false,
        quedas_6meses: questionnaire.quedas_6meses || false,
        quedas_quantidade: questionnaire.quedas_quantidade ?? '',
        dispositivo_auxiliar: questionnaire.dispositivo_auxiliar || '',
        dispositivo_auxiliar_outro: questionnaire.dispositivo_auxiliar_outro || '',

        antecedentes_clinicos: questionnaire.antecedentes_clinicos || [],
        antecedentes_outra: questionnaire.antecedentes_outra || '',

        seguranca_teste: questionnaire.seguranca_teste || [],
        seguranca_observacoes: questionnaire.seguranca_observacoes || '',

        tono_mid: questionnaire.tono_mid || '',
        tono_mie: questionnaire.tono_mie || '',
        forca_mrc: (questionnaire.forca_mrc && questionnaire.forca_mrc.length > 0) ? questionnaire.forca_mrc : emptyMrc(),

        posicao_protocolo: questionnaire.posicao_protocolo || '',
        unidade: questionnaire.unidade || 'kgf',
        unidade_outra: questionnaire.unidade_outra || '',
        dinamometria: (questionnaire.dinamometria && questionnaire.dinamometria.length > 0) ? questionnaire.dinamometria : emptyDinamometria(),
        valor_analise: questionnaire.valor_analise || 'Melhor de 3 medidas',
        valor_analise_outro: questionnaire.valor_analise_outro || '',
        tempo_sustentacao_segundos: questionnaire.tempo_sustentacao_segundos ?? '',
        assimetria_global_pct: questionnaire.assimetria_global_pct ?? '',
        intercorrencias_teste: questionnaire.intercorrencias_teste || [],

        impressao_funcional: questionnaire.impressao_funcional || [],
        observacoes_correlacao: questionnaire.observacoes_correlacao || '',
        modelo_conclusao: questionnaire.modelo_conclusao || '',
        maior_assimetria_pct: questionnaire.maior_assimetria_pct ?? '',
        maior_assimetria_movimento: questionnaire.maior_assimetria_movimento || '',
        menor_forca_lado: questionnaire.menor_forca_lado || '',
        comportamento_teste: questionnaire.comportamento_teste || [],
        conclusao_final: questionnaire.conclusao_final || '',
        examinador: questionnaire.examinador || '',
        crm_registro: questionnaire.crm_registro || '',

        comentario: questionnaire.comentario || '',
        assinatura_paciente: questionnaire.assinatura_paciente || null,
        pedido_medico: null,
        anexos: [],
        _method: 'put',
    });

    transform(upperAll);

    const [idadeCalculada, setIdadeCalculada] = useState(null);

    useEffect(() => {
        if (data.data_nascimento) {
            const birthDate = new Date(data.data_nascimento);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            let finalAge = age;
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                finalAge = age - 1;
            }
            setIdadeCalculada(finalAge + (finalAge === 1 ? ' ano' : ' anos'));
        } else {
            setIdadeCalculada(null);
        }
    }, [data.data_nascimento]);

    const toggleInArray = (field, value) => {
        const arr = data[field] || [];
        setData(field, arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
    };

    const updateMrcField = (index, field, value) => {
        setData('forca_mrc', data.forca_mrc.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    };

    const updateDinField = (index, field, value) => {
        setData('dinamometria', data.dinamometria.map((row, i) => {
            if (i !== index) return row;
            const updated = { ...row, [field]: value };

            const dVals = [updated.d1, updated.d2, updated.d3].map((v) => parseFloat(v)).filter((v) => !isNaN(v));
            const eVals = [updated.e1, updated.e2, updated.e3].map((v) => parseFloat(v)).filter((v) => !isNaN(v));
            const dMelhor = dVals.length ? Math.max(...dVals) : null;
            const eMelhor = eVals.length ? Math.max(...eVals) : null;
            const dMedia = dVals.length ? dVals.reduce((a, b) => a + b, 0) / dVals.length : null;
            const eMedia = eVals.length ? eVals.reduce((a, b) => a + b, 0) / eVals.length : null;

            updated.d_melhor = dMelhor !== null ? dMelhor.toFixed(2) : '';
            updated.e_melhor = eMelhor !== null ? eMelhor.toFixed(2) : '';
            updated.d_media = dMedia !== null ? dMedia.toFixed(2) : '';
            updated.e_media = eMedia !== null ? eMedia.toFixed(2) : '';

            if (dMelhor !== null && eMelhor !== null) {
                const maior = Math.max(dMelhor, eMelhor);
                const menorVal = Math.min(dMelhor, eMelhor);
                updated.assimetria_pct = maior > 0 ? ((maior - menorVal) / maior * 100).toFixed(2) : '0.00';
                updated.menor = dMelhor < eMelhor ? 'D' : (eMelhor < dMelhor ? 'E' : '');
            } else {
                updated.assimetria_pct = '';
                updated.menor = '';
            }

            return updated;
        }));
    };

    // Maior assimetria, lado mais fraco e classificação sugerida — calculados a partir da tabela
    useEffect(() => {
        const rows = (data.dinamometria || []).filter((r) => r.assimetria_pct !== '' && r.assimetria_pct != null);
        if (rows.length === 0) return;

        const maxRow = rows.reduce((a, b) => (parseFloat(b.assimetria_pct) > parseFloat(a.assimetria_pct) ? b : a));
        const maxVal = parseFloat(maxRow.assimetria_pct);
        if (isNaN(maxVal)) return;

        const fixed = maxVal.toFixed(2);
        if (fixed !== String(data.assimetria_global_pct)) setData('assimetria_global_pct', fixed);
        if (fixed !== String(data.maior_assimetria_pct)) setData('maior_assimetria_pct', fixed);
        if (maxRow.movimento !== data.maior_assimetria_movimento) setData('maior_assimetria_movimento', maxRow.movimento);

        const ladoSugerido = maxRow.menor === 'D' ? 'Direito' : (maxRow.menor === 'E' ? 'Esquerdo' : '');
        if (ladoSugerido && ladoSugerido !== data.menor_forca_lado) setData('menor_forca_lado', ladoSugerido);

        const classificacao = classifyAssimetria(maxVal);
        if (classificacao !== data.modelo_conclusao) setData('modelo_conclusao', classificacao);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.dinamometria]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (data.anexos.length > 0) {
            put(route('questionnaires.dinamometria-mmii.update', questionnaire.id), {
                forceFormData: true,
                preserveScroll: true,
            });
        } else {
            put(route('questionnaires.dinamometria-mmii.update', questionnaire.id));
        }
    };

    const labelClass = "block text-base font-semibold text-gray-700 dark:text-zinc-300 mb-1.5";
    const inputClass = "w-full text-base py-2.5 px-3.5 border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-cyan-500 dark:focus:ring-cyan-600 focus:border-cyan-500 dark:focus:border-cyan-600";
    const subLabelClass = "block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1.5";
    const subInputClass = "w-full text-sm py-2 px-3 border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-cyan-500 dark:focus:ring-cyan-600 focus:border-cyan-500 dark:focus:border-cyan-600";
    const errorClass = "text-red-600 dark:text-red-400 text-sm mt-1.5";
    const tdInputClass = "w-16 text-xs py-1.5 px-1.5 border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded focus:ring-cyan-500 dark:focus:ring-cyan-600 focus:border-cyan-500 dark:focus:border-cyan-600";

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-lg shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-gray-800 dark:text-zinc-200 leading-tight">Editar Questionário</h2>
                            <p className="text-xs text-gray-600 dark:text-zinc-400">Dinamometria de Membros Inferiores</p>
                        </div>
                    </div>
                    <Link
                        href={route('questionnaires.dinamometria-mmii.index')}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-500 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-600 transition-all duration-200 shadow-sm hover:shadow"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar
                    </Link>
                </div>
            }
        >
            <Head title="Editar Questionário - Dinamometria MMII" />

            <div className="py-8">
                <div className="max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:flex lg:gap-8">
                        <QuestionnaireSectionNav sections={SECTIONS} color="cyan" />

                        <div className="flex-1 min-w-0">
                    <div className="bg-white dark:bg-zinc-700 overflow-hidden shadow-xl dark:shadow-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-600 transition-colors duration-200">
                                <div className="bg-gradient-to-r from-cyan-500 to-sky-600 dark:from-cyan-600 dark:to-sky-700 px-6 py-5">
                                    <h3 className="text-2xl font-bold text-white">Formulário de Avaliação Neurológica e Funcional</h3>
                                    <p className="text-base text-cyan-100 mt-1">Dinamometria de Membros Inferiores</p>
                                </div>

                                <div className="p-6 text-gray-900 dark:text-zinc-100">
                                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                                        {/* 1. Identificação */}
                                        <div id="sec-identificacao" className="scroll-mt-24 mb-10 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                            <div className="flex items-center mb-5">
                                                <div className="w-1 h-9 bg-gradient-to-b from-cyan-500 to-sky-600 rounded-full mr-3"></div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">1. Identificação do Paciente</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelClass}>Nome *</label>
                                                    <input type="text" value={data.nome_completo} onChange={(e) => setData('nome_completo', e.target.value.toUpperCase())} className={`${inputClass} uppercase`} required />
                                                    {errors.nome_completo && <div className={errorClass}>{errors.nome_completo}</div>}
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Data de Nascimento *</label>
                                                    <BirthDateSelectInput value={data.data_nascimento} onChange={(value) => setData('data_nascimento', value)} required={true} />
                                                    {idadeCalculada !== null && (<div className="text-sm text-gray-600 dark:text-zinc-400 mt-1.5">Idade: {idadeCalculada}</div>)}
                                                    {errors.data_nascimento && <div className={errorClass}>{errors.data_nascimento}</div>}
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Sexo *</label>
                                                    <select value={data.sexo} onChange={(e) => setData('sexo', e.target.value)} className={inputClass} required>
                                                        <option value="">Selecione...</option>
                                                        <option value="Masculino">Masculino</option>
                                                        <option value="Feminino">Feminino</option>
                                                    </select>
                                                    {errors.sexo && <div className={errorClass}>{errors.sexo}</div>}
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Data do Exame *</label>
                                                    <input type="date" value={data.data_exame} onChange={(e) => setData('data_exame', e.target.value)} className={inputClass} required />
                                                    {errors.data_exame && <div className={errorClass}>{errors.data_exame}</div>}
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Peso (kg)</label>
                                                    <input type="number" step="0.01" value={data.peso} onChange={(e) => setData('peso', e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Altura (cm)</label>
                                                    <input type="number" step="0.01" value={data.altura} onChange={(e) => setData('altura', e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Dominância</label>
                                                    <select value={data.dominancia} onChange={(e) => setData('dominancia', e.target.value)} className={inputClass}>
                                                        <option value="">-</option>
                                                        <option value="Direita">Direita</option>
                                                        <option value="Esquerda">Esquerda</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Profissão</label>
                                                    <input type="text" value={data.profissao} onChange={(e) => setData('profissao', e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Clínica</label>
                                                    <input type="text" value={data.clinica} onChange={(e) => setData('clinica', e.target.value.toUpperCase())} className={`${inputClass} uppercase`} />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className={labelClass}>Indicação Clínica para Realização da Dinamometria</label>
                                                    <textarea value={data.indicacao_clinica} onChange={(e) => setData('indicacao_clinica', e.target.value)} rows={2} className={inputClass} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. Anamnese */}
                                        <div id="sec-anamnese" className="scroll-mt-24 mb-10 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                            <div className="flex items-center mb-5">
                                                <div className="w-1 h-9 bg-gradient-to-b from-cyan-500 to-sky-600 rounded-full mr-3"></div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">2. Anamnese Neurológica e Musculoesquelética</h3>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                                                <Toggle label="Apresenta fraqueza muscular nos MMII?" checked={data.fraqueza_muscular} onChange={(v) => setData('fraqueza_muscular', v)} />
                                                {data.fraqueza_muscular && (
                                                    <div>
                                                        <label className={subLabelClass}>Lado</label>
                                                        <select value={data.fraqueza_lado} onChange={(e) => setData('fraqueza_lado', e.target.value)} className={subInputClass}>
                                                            <option value="">-</option>
                                                            <option value="Direita">Direita</option>
                                                            <option value="Esquerda">Esquerda</option>
                                                            <option value="Bilateral">Bilateral</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>

                                            {data.fraqueza_muscular && (
                                                <div className="mb-5">
                                                    <label className={subLabelClass}>A fraqueza é:</label>
                                                    <CheckboxGroup options={FRAQUEZA_TIPOS} selected={data.fraqueza_tipo} onToggle={(v) => toggleInArray('fraqueza_tipo', v)} cols="grid-cols-2 sm:grid-cols-4" />
                                                </div>
                                            )}

                                            <div className="mb-5">
                                                <label className={subLabelClass}>Apresenta dificuldade para:</label>
                                                <CheckboxGroup options={DIFICULDADE_ATIVIDADES} selected={data.dificuldade_atividades} onToggle={(v) => toggleInArray('dificuldade_atividades', v)} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                                                <Toggle label="Fadiga muscular ou fatigabilidade aos esforços?" checked={data.fadiga_muscular} onChange={(v) => setData('fadiga_muscular', v)} />
                                                <Toggle label="Sensação de queimação, choque ou dor neuropática?" checked={data.dor_neuropatica} onChange={(v) => setData('dor_neuropatica', v)} />
                                                <Toggle label="Câimbras ou espasmos musculares frequentes?" checked={data.caimbras} onChange={(v) => setData('caimbras', v)} />
                                                <Toggle label="Tremores nos membros inferiores?" checked={data.tremores} onChange={(v) => setData('tremores', v)} />
                                                <Toggle label="Rigidez muscular?" checked={data.rigidez_muscular} onChange={(v) => setData('rigidez_muscular', v)} />
                                                <Toggle label="Alterações do equilíbrio ou instabilidade postural?" checked={data.alteracao_equilibrio} onChange={(v) => setData('alteracao_equilibrio', v)} />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                                <div>
                                                    <Toggle label="Dor nos membros inferiores?" checked={data.dor_membros} onChange={(v) => setData('dor_membros', v)} />
                                                </div>
                                                {data.dor_membros && (
                                                    <>
                                                        <div>
                                                            <label className={subLabelClass}>Localização</label>
                                                            <input type="text" value={data.dor_localizacao} onChange={(e) => setData('dor_localizacao', e.target.value)} className={subInputClass} />
                                                        </div>
                                                        <div>
                                                            <label className={subLabelClass}>Intensidade EVA (0–10)</label>
                                                            <input type="number" min="0" max="10" value={data.dor_eva} onChange={(e) => setData('dor_eva', e.target.value)} className={subInputClass} />
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                                <div>
                                                    <Toggle label="Parestesias, dormência ou formigamento?" checked={data.parestesias} onChange={(v) => setData('parestesias', v)} />
                                                </div>
                                                {data.parestesias && (
                                                    <div>
                                                        <label className={subLabelClass}>Localização</label>
                                                        <input type="text" value={data.parestesias_localizacao} onChange={(e) => setData('parestesias_localizacao', e.target.value)} className={subInputClass} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                                <div>
                                                    <Toggle label="Sofreu quedas nos últimos 6 meses?" checked={data.quedas_6meses} onChange={(v) => setData('quedas_6meses', v)} />
                                                </div>
                                                {data.quedas_6meses && (
                                                    <div>
                                                        <label className={subLabelClass}>Quantidade aproximada</label>
                                                        <input type="number" min="0" value={data.quedas_quantidade} onChange={(e) => setData('quedas_quantidade', e.target.value)} className={subInputClass} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className={subLabelClass}>Necessita de dispositivo auxiliar para deambulação?</label>
                                                    <select value={data.dispositivo_auxiliar} onChange={(e) => setData('dispositivo_auxiliar', e.target.value)} className={subInputClass}>
                                                        <option value="">-</option>
                                                        <option value="Não">Não</option>
                                                        <option value="Bengala">Bengala</option>
                                                        <option value="Muleta">Muleta</option>
                                                        <option value="Andador">Andador</option>
                                                        <option value="Cadeira de rodas">Cadeira de rodas</option>
                                                        <option value="Outro">Outro</option>
                                                    </select>
                                                </div>
                                                {data.dispositivo_auxiliar === 'Outro' && (
                                                    <div>
                                                        <label className={subLabelClass}>Qual?</label>
                                                        <input type="text" value={data.dispositivo_auxiliar_outro} onChange={(e) => setData('dispositivo_auxiliar_outro', e.target.value)} className={subInputClass} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 3. Antecedentes Clínicos */}
                                        <div id="sec-antecedentes" className="scroll-mt-24 mb-10 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                            <div className="flex items-center mb-5">
                                                <div className="w-1 h-9 bg-gradient-to-b from-cyan-500 to-sky-600 rounded-full mr-3"></div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">3. Antecedentes Clínicos</h3>
                                            </div>
                                            <CheckboxGroup options={ANTECEDENTES} selected={data.antecedentes_clinicos} onToggle={(v) => toggleInArray('antecedentes_clinicos', v)} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
                                            <div className="mt-5">
                                                <label className={labelClass}>Outra condição neurológica/ortopédica</label>
                                                <input type="text" value={data.antecedentes_outra} onChange={(e) => setData('antecedentes_outra', e.target.value)} className={inputClass} />
                                            </div>
                                        </div>

                                        {/* 4. Segurança do Teste */}
                                        <div id="sec-seguranca" className="scroll-mt-24 mb-10 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                            <div className="flex items-center mb-5">
                                                <div className="w-1 h-9 bg-gradient-to-b from-cyan-500 to-sky-600 rounded-full mr-3"></div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">4. Segurança para Realização do Teste</h3>
                                            </div>
                                            <CheckboxGroup options={SEGURANCA} selected={data.seguranca_teste} onToggle={(v) => toggleInArray('seguranca_teste', v)} cols="grid-cols-1 sm:grid-cols-2" />
                                            <div className="mt-5">
                                                <label className={labelClass}>Observações</label>
                                                <textarea value={data.seguranca_observacoes} onChange={(e) => setData('seguranca_observacoes', e.target.value)} rows={2} className={inputClass} />
                                            </div>
                                        </div>

                                        {/* 5. Exame Motor Pré-Dinamometria */}
                                        <div id="sec-exame-motor" className="scroll-mt-24 mb-10 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                            <div className="flex items-center mb-5">
                                                <div className="w-1 h-9 bg-gradient-to-b from-cyan-500 to-sky-600 rounded-full mr-3"></div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">5. Exame Motor Pré-Dinamometria</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div>
                                                    <label className={labelClass}>Tônus Muscular — MID</label>
                                                    <select value={data.tono_mid} onChange={(e) => setData('tono_mid', e.target.value)} className={inputClass}>
                                                        <option value="">-</option>
                                                        <option value="Normal">Normal</option>
                                                        <option value="Hipotonia">Hipotonia</option>
                                                        <option value="Hipertonia">Hipertonia</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Tônus Muscular — MIE</label>
                                                    <select value={data.tono_mie} onChange={(e) => setData('tono_mie', e.target.value)} className={inputClass}>
                                                        <option value="">-</option>
                                                        <option value="Normal">Normal</option>
                                                        <option value="Hipotonia">Hipotonia</option>
                                                        <option value="Hipertonia">Hipertonia</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <h4 className="text-base font-bold text-gray-800 dark:text-zinc-200 mb-3">Força Muscular — Escala MRC (0–5)</h4>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full text-sm text-center border border-gray-200 dark:border-zinc-500">
                                                    <thead>
                                                        <tr className="bg-gray-100 dark:bg-zinc-600">
                                                            <th className="px-3 py-2 border border-gray-200 dark:border-zinc-500 text-left">Movimento</th>
                                                            <th className="px-3 py-2 border border-gray-200 dark:border-zinc-500">Direito</th>
                                                            <th className="px-3 py-2 border border-gray-200 dark:border-zinc-500">Esquerdo</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.forca_mrc.map((row, i) => (
                                                            <tr key={row.movimento} className={i % 2 === 0 ? 'bg-white dark:bg-zinc-700' : 'bg-gray-50 dark:bg-zinc-600/40'}>
                                                                <td className="px-3 py-1.5 border border-gray-200 dark:border-zinc-500 text-left">{row.movimento}</td>
                                                                <td className="px-2 py-1.5 border border-gray-200 dark:border-zinc-500">
                                                                    <input type="number" min="0" max="5" value={row.direito} onChange={(e) => updateMrcField(i, 'direito', e.target.value)} className={`${tdInputClass} mx-auto`} />
                                                                </td>
                                                                <td className="px-2 py-1.5 border border-gray-200 dark:border-zinc-500">
                                                                    <input type="number" min="0" max="5" value={row.esquerdo} onChange={(e) => updateMrcField(i, 'esquerdo', e.target.value)} className={`${tdInputClass} mx-auto`} />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* 6. Registro da Dinamometria */}
                                        <div id="sec-dinamometria" className="scroll-mt-24 mb-10 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                            <div className="flex items-center mb-5">
                                                <div className="w-1 h-9 bg-gradient-to-b from-cyan-500 to-sky-600 rounded-full mr-3"></div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">6. Registro da Dinamometria</h3>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-zinc-400 italic mb-5">Método: dinamometria digital com sistema de ancoragem e contração isométrica. Melhor valor e média são calculados automaticamente a partir das 3 medidas.</p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div>
                                                    <label className={labelClass}>Posição/Protocolo Utilizado</label>
                                                    <input type="text" value={data.posicao_protocolo} onChange={(e) => setData('posicao_protocolo', e.target.value)} className={inputClass} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className={labelClass}>Unidade</label>
                                                        <select value={data.unidade} onChange={(e) => setData('unidade', e.target.value)} className={inputClass}>
                                                            <option value="kgf">kgf</option>
                                                            <option value="N">N</option>
                                                            <option value="Outra">Outra</option>
                                                        </select>
                                                    </div>
                                                    {data.unidade === 'Outra' && (
                                                        <div>
                                                            <label className={labelClass}>Qual?</label>
                                                            <input type="text" value={data.unidade_outra} onChange={(e) => setData('unidade_outra', e.target.value)} className={inputClass} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="overflow-x-auto mb-6">
                                                <table className="min-w-full text-xs text-center border border-gray-200 dark:border-zinc-500">
                                                    <thead>
                                                        <tr className="bg-gray-100 dark:bg-zinc-600">
                                                            <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500 text-left">Movimento</th>
                                                            <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500">1ª D</th>
                                                            <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500">2ª D</th>
                                                            <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500">3ª D</th>
                                                            <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500 bg-cyan-50 dark:bg-cyan-900/20">Melh. D</th>
                                                            <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500 bg-cyan-50 dark:bg-cyan-900/20">Méd. D</th>
                                                            <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500">1ª E</th>
                                                            <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500">2ª E</th>
                                                            <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500">3ª E</th>
                                                            <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500 bg-cyan-50 dark:bg-cyan-900/20">Melh. E</th>
                                                            <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500 bg-cyan-50 dark:bg-cyan-900/20">Méd. E</th>
                                                            <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500 bg-amber-50 dark:bg-amber-900/20">Assim. %</th>
                                                            <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500 bg-amber-50 dark:bg-amber-900/20">Menor</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.dinamometria.map((row, i) => (
                                                            <tr key={row.movimento} className={i % 2 === 0 ? 'bg-white dark:bg-zinc-700' : 'bg-gray-50 dark:bg-zinc-600/40'}>
                                                                <td className="px-2 py-1 border border-gray-200 dark:border-zinc-500 text-left whitespace-nowrap">{row.movimento}</td>
                                                                <td className="px-1 py-1 border border-gray-200 dark:border-zinc-500"><input type="number" step="0.01" value={row.d1} onChange={(e) => updateDinField(i, 'd1', e.target.value)} className={tdInputClass} /></td>
                                                                <td className="px-1 py-1 border border-gray-200 dark:border-zinc-500"><input type="number" step="0.01" value={row.d2} onChange={(e) => updateDinField(i, 'd2', e.target.value)} className={tdInputClass} /></td>
                                                                <td className="px-1 py-1 border border-gray-200 dark:border-zinc-500"><input type="number" step="0.01" value={row.d3} onChange={(e) => updateDinField(i, 'd3', e.target.value)} className={tdInputClass} /></td>
                                                                <td className="px-2 py-1 border border-gray-200 dark:border-zinc-500 bg-cyan-50/50 dark:bg-cyan-900/10 font-semibold">{row.d_melhor || '-'}</td>
                                                                <td className="px-2 py-1 border border-gray-200 dark:border-zinc-500 bg-cyan-50/50 dark:bg-cyan-900/10 font-semibold">{row.d_media || '-'}</td>
                                                                <td className="px-1 py-1 border border-gray-200 dark:border-zinc-500"><input type="number" step="0.01" value={row.e1} onChange={(e) => updateDinField(i, 'e1', e.target.value)} className={tdInputClass} /></td>
                                                                <td className="px-1 py-1 border border-gray-200 dark:border-zinc-500"><input type="number" step="0.01" value={row.e2} onChange={(e) => updateDinField(i, 'e2', e.target.value)} className={tdInputClass} /></td>
                                                                <td className="px-1 py-1 border border-gray-200 dark:border-zinc-500"><input type="number" step="0.01" value={row.e3} onChange={(e) => updateDinField(i, 'e3', e.target.value)} className={tdInputClass} /></td>
                                                                <td className="px-2 py-1 border border-gray-200 dark:border-zinc-500 bg-cyan-50/50 dark:bg-cyan-900/10 font-semibold">{row.e_melhor || '-'}</td>
                                                                <td className="px-2 py-1 border border-gray-200 dark:border-zinc-500 bg-cyan-50/50 dark:bg-cyan-900/10 font-semibold">{row.e_media || '-'}</td>
                                                                <td className="px-2 py-1 border border-gray-200 dark:border-zinc-500 bg-amber-50/50 dark:bg-amber-900/10 font-semibold">{row.assimetria_pct || '-'}</td>
                                                                <td className="px-2 py-1 border border-gray-200 dark:border-zinc-500 bg-amber-50/50 dark:bg-amber-900/10 font-semibold">{row.menor || '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div>
                                                    <label className={labelClass}>Valor Utilizado para Análise</label>
                                                    <select value={data.valor_analise} onChange={(e) => setData('valor_analise', e.target.value)} className={inputClass}>
                                                        <option value="Melhor de 3 medidas">Melhor de 3 medidas</option>
                                                        <option value="Média de 3 medidas">Média de 3 medidas</option>
                                                        <option value="Outro">Outro</option>
                                                    </select>
                                                </div>
                                                {data.valor_analise === 'Outro' && (
                                                    <div>
                                                        <label className={labelClass}>Qual?</label>
                                                        <input type="text" value={data.valor_analise_outro} onChange={(e) => setData('valor_analise_outro', e.target.value)} className={inputClass} />
                                                    </div>
                                                )}
                                                <div>
                                                    <label className={labelClass}>Tempo de Sustentação da Contração (s)</label>
                                                    <input type="number" min="0" value={data.tempo_sustentacao_segundos} onChange={(e) => setData('tempo_sustentacao_segundos', e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Assimetria Global / Maior Assimetria (%)</label>
                                                    <input type="number" step="0.01" value={data.assimetria_global_pct} onChange={(e) => setData('assimetria_global_pct', e.target.value)} className={inputClass} />
                                                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Calculado automaticamente a partir da maior assimetria da tabela; pode ser ajustado.</p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelClass}>Durante o Teste Ocorreu:</label>
                                                <CheckboxGroup options={INTERCORRENCIAS} selected={data.intercorrencias_teste} onToggle={(v) => toggleInArray('intercorrencias_teste', v)} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
                                            </div>
                                        </div>

                                        {/* 7. Impressão Funcional */}
                                        <div id="sec-interpretacao" className="scroll-mt-24 mb-10 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                            <div className="flex items-center mb-5">
                                                <div className="w-1 h-9 bg-gradient-to-b from-cyan-500 to-sky-600 rounded-full mr-3"></div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">7. Impressão Funcional</h3>
                                            </div>

                                            <div className="mb-5">
                                                <CheckboxGroup options={IMPRESSAO_FUNCIONAL} selected={data.impressao_funcional} onToggle={(v) => toggleInArray('impressao_funcional', v)} cols="grid-cols-1 sm:grid-cols-2" />
                                            </div>

                                            <div className="mb-5">
                                                <label className={labelClass}>Observações e Correlação Clínico-Funcional</label>
                                                <textarea value={data.observacoes_correlacao} onChange={(e) => setData('observacoes_correlacao', e.target.value)} rows={3} className={inputClass} />
                                            </div>

                                            <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-5 mb-6">
                                                <h4 className="text-base font-bold text-cyan-700 dark:text-cyan-300 uppercase mb-4">Modelo de Conclusão</h4>
                                                <div className="space-y-2 mb-4">
                                                    {MODELO_CONCLUSAO.map((opt) => (
                                                        <label key={opt} className={`flex items-start gap-2 border rounded-lg px-3 py-2.5 text-sm cursor-pointer transition-colors ${data.modelo_conclusao === opt ? 'bg-white dark:bg-zinc-700 border-cyan-400 dark:border-cyan-600 font-semibold' : 'bg-white/60 dark:bg-zinc-700/60 border-cyan-100 dark:border-cyan-900'}`}>
                                                            <input type="checkbox" checked={data.modelo_conclusao === opt} onChange={() => setData('modelo_conclusao', data.modelo_conclusao === opt ? '' : opt)} className="mt-0.5 w-5 h-5 text-cyan-600 dark:text-cyan-500 border-gray-300 dark:border-zinc-500 rounded focus:ring-cyan-500 dark:focus:ring-cyan-600 flex-shrink-0" />
                                                            <span>{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className={subLabelClass}>Maior Assimetria Encontrada (%)</label>
                                                        <input type="number" step="0.01" value={data.maior_assimetria_pct} onChange={(e) => setData('maior_assimetria_pct', e.target.value)} className={subInputClass} />
                                                    </div>
                                                    <div>
                                                        <label className={subLabelClass}>Movimento</label>
                                                        <input type="text" value={data.maior_assimetria_movimento} onChange={(e) => setData('maior_assimetria_movimento', e.target.value)} className={subInputClass} />
                                                    </div>
                                                    <div>
                                                        <label className={subLabelClass}>Menor Força Observada no Lado</label>
                                                        <select value={data.menor_forca_lado} onChange={(e) => setData('menor_forca_lado', e.target.value)} className={subInputClass}>
                                                            <option value="">-</option>
                                                            <option value="Direito">Direito</option>
                                                            <option value="Esquerdo">Esquerdo</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-5">
                                                <label className={labelClass}>Comportamento Durante o Teste</label>
                                                <CheckboxGroup options={COMPORTAMENTO_TESTE} selected={data.comportamento_teste} onToggle={(v) => toggleInArray('comportamento_teste', v)} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div className="md:col-span-2">
                                                    <label className={labelClass}>Conclusão Final</label>
                                                    <textarea value={data.conclusao_final} onChange={(e) => setData('conclusao_final', e.target.value)} rows={3} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Examinador</label>
                                                    <input type="text" value={data.examinador} onChange={(e) => setData('examinador', e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>CRM/Registro Profissional</label>
                                                    <input type="text" value={data.crm_registro} onChange={(e) => setData('crm_registro', e.target.value)} className={inputClass} />
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelClass}>Comentário</label>
                                                <textarea value={data.comentario} onChange={(e) => setData('comentario', e.target.value)} rows={2} className={inputClass} />
                                            </div>
                                        </div>

                                        {/* Arquivos */}
                                        <div id="sec-arquivos" className="scroll-mt-24 mb-10 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                            <div className="flex items-center mb-5">
                                                <div className="w-1 h-9 bg-gradient-to-b from-green-500 to-teal-600 rounded-full mr-3"></div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Arquivos e Assinatura</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelClass}>Pedido Médico / Anexos</label>
                                                    <AnexosUploader type="dinamometria-mmii" id={questionnaire.id} files={data.anexos} onFilesChange={(f) => setData('anexos', f)} existing={questionnaire.attachments || []} />
                                                    {errors.pedido_medico && <div className={errorClass}>{errors.pedido_medico}</div>}
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Assinatura do Paciente</label>
                                                    <SignaturePad initialSignature={questionnaire.assinatura_paciente} onSignatureChange={(signature) => setData('assinatura_paciente', signature)} className="w-full" />
                                                    {errors.assinatura_paciente && <div className={errorClass}>{errors.assinatura_paciente}</div>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-3">
                                            <button type="button" onClick={() => window.history.back()} className="px-7 py-3 text-base font-semibold bg-gray-500 dark:bg-zinc-500 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-zinc-600 transition-colors duration-200">Cancelar</button>
                                            <button type="submit" disabled={processing} className="px-7 py-3 text-base font-semibold bg-gradient-to-r from-cyan-500 to-sky-600 dark:from-cyan-600 dark:to-sky-700 text-white rounded-lg hover:from-cyan-600 hover:to-sky-700 dark:hover:from-cyan-700 dark:hover:to-sky-800 transition-colors duration-200 disabled:opacity-50">{processing ? 'Salvando...' : 'Salvar Alterações'}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
