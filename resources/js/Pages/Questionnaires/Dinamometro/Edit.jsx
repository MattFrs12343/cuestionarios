import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AnexosUploader from '@/Components/AnexosUploader';
import SignaturePad from '@/Components/SignaturePad';
import BirthDateSelectInput from '@/Components/BirthDateSelectInput';
import QuestionnaireSectionNav from '@/Components/QuestionnaireSectionNav';

const CONTEXTOS = [
    { value: 'neurologico', label: 'Neurológico', help: 'AVC, Parkinson, neuropatia...' },
    { value: 'ortopedico', label: 'Ortopédico', help: 'Lesão, fratura, pós-cirúrgico...' },
    { value: 'geriatrico', label: 'Geriátrico', help: '≥ 60 anos, fragilidade...' },
    { value: 'pediatrico', label: 'Pediátrico', help: '< 18 anos, paralisia cerebral...' },
];

const SECTIONS = [
    { id: 'sec-identificacao', label: '1. Identificação' },
    { id: 'sec-contexto', label: '2. Contexto Clínico' },
    { id: 'sec-historico', label: '3. Histórico Clínico' },
    { id: 'sec-secoes', label: '4. Avaliação por Contexto' },
    { id: 'sec-condicoes', label: '5. Condições do Teste' },
    { id: 'sec-resultados', label: '6. Resultados' },
    { id: 'sec-referencia', label: '7. Valores de Referência' },
    { id: 'sec-interpretacao', label: '8. Interpretação' },
    { id: 'sec-arquivos', label: 'Arquivos e Assinatura' },
];

const Toggle = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
        <span className="text-base text-gray-800 dark:text-gray-200">{label}</span>
        <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="w-6 h-6 text-violet-600 dark:text-violet-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded focus:ring-violet-500 dark:focus:ring-violet-600 flex-shrink-0" />
    </label>
);

export default function Edit({ auth, teams, questionnaire }) {
    const { data, setData, put, processing, errors } = useForm({
        clinica: questionnaire.clinica || '',
        data_exame: questionnaire.data_exame || '',
        nome_completo: questionnaire.nome_completo || '',
        data_nascimento: questionnaire.data_nascimento || '',
        sexo: questionnaire.sexo || '',
        peso: questionnaire.peso ?? '',
        altura: questionnaire.altura ?? '',
        dominancia: questionnaire.dominancia || '',
        profissao: questionnaire.profissao || '',
        responsavel_menor: questionnaire.responsavel_menor || '',
        diagnostico_principal: questionnaire.diagnostico_principal || '',
        indicacao_avaliacao: questionnaire.indicacao_avaliacao || '',
        team_id: questionnaire.team_id || '',
        contextos_clinicos: questionnaire.contextos_clinicos || [],

        doencas_cronicas: questionnaire.doencas_cronicas || '',
        cirurgias_membro_superior: questionnaire.cirurgias_membro_superior || '',
        medicacoes_uso: questionnaire.medicacoes_uso || '',
        fisioterapia_recente: questionnaire.fisioterapia_recente || false,
        lesao_previa_atual: questionnaire.lesao_previa_atual || false,
        lesao_previa_atual_qual: questionnaire.lesao_previa_atual_qual || '',
        dor_atual: questionnaire.dor_atual ?? '',
        dor_piora_com_forca: questionnaire.dor_piora_com_forca || false,
        localizacao_dor: questionnaire.localizacao_dor || '',

        neuro_lado_afetado: questionnaire.neuro_lado_afetado || '',
        neuro_espasticidade: questionnaire.neuro_espasticidade || false,
        neuro_tremor: questionnaire.neuro_tremor || false,
        neuro_dominancia_igual_lado_afetado: questionnaire.neuro_dominancia_igual_lado_afetado || false,
        neuro_melhor_efeito_medicacao: questionnaire.neuro_melhor_efeito_medicacao || false,

        orto_fase_aguda_lesao: questionnaire.orto_fase_aguda_lesao || false,
        orto_dor_piora_forca: questionnaire.orto_dor_piora_forca || false,
        orto_quickdash_score: questionnaire.orto_quickdash_score ?? '',
        orto_fase_tratamento: questionnaire.orto_fase_tratamento || '',

        geri_quedas_ultimo_ano: questionnaire.geri_quedas_ultimo_ano || false,
        geri_num_medicamentos_dia: questionnaire.geri_num_medicamentos_dia ?? '',
        geri_fragilidade_fried: questionnaire.geri_fragilidade_fried ?? '',
        geri_classificacao_fragilidade: questionnaire.geri_classificacao_fragilidade || '',
        geri_comprometimento_cognitivo: questionnaire.geri_comprometimento_cognitivo || false,

        pedi_dominancia_nao_definida: questionnaire.pedi_dominancia_nao_definida || false,
        pedi_paralisia_cerebral_sindrome: questionnaire.pedi_paralisia_cerebral_sindrome || false,
        pedi_segura_objetos_normalmente: questionnaire.pedi_segura_objetos_normalmente || false,
        pedi_coopera_teste: questionnaire.pedi_coopera_teste || false,
        pedi_idade_cronologica_vs_desenvolvimento: questionnaire.pedi_idade_cronologica_vs_desenvolvimento || '',

        dormiu_bem: questionnaire.dormiu_bem || false,
        esforco_fisico_24h: questionnaire.esforco_fisico_24h || false,
        dor_desconforto_hoje: questionnaire.dor_desconforto_hoje || false,
        consentimento_tcle: questionnaire.consentimento_tcle || false,

        tentativas: questionnaire.tentativas ?? '',
        intervalo_segundos: questionnaire.intervalo_segundos ?? '',
        mao_dominante_t1: questionnaire.mao_dominante_t1 ?? '',
        mao_dominante_t2: questionnaire.mao_dominante_t2 ?? '',
        mao_dominante_t3: questionnaire.mao_dominante_t3 ?? '',
        mao_dominante_media: questionnaire.mao_dominante_media ?? '',
        mao_nao_dominante_t1: questionnaire.mao_nao_dominante_t1 ?? '',
        mao_nao_dominante_t2: questionnaire.mao_nao_dominante_t2 ?? '',
        mao_nao_dominante_t3: questionnaire.mao_nao_dominante_t3 ?? '',
        mao_nao_dominante_media: questionnaire.mao_nao_dominante_media ?? '',

        classificacao: questionnaire.classificacao || '',
        assimetria_percentual: questionnaire.assimetria_percentual ?? '',
        conclusao: questionnaire.conclusao || '',
        conduta: questionnaire.conduta || '',
        nome_avaliador: questionnaire.nome_avaliador || '',
        crefito_crm: questionnaire.crefito_crm || '',

        comentario: questionnaire.comentario || '',
        assinatura_paciente: questionnaire.assinatura_paciente || null,
        pedido_medico: null,
        anexos: [],
        _method: 'put',
    });

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

    useEffect(() => {
        const vals = [data.mao_dominante_t1, data.mao_dominante_t2, data.mao_dominante_t3].map(v => parseFloat(v)).filter(v => !isNaN(v));
        const media = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : '';
        if (media !== String(data.mao_dominante_media)) setData('mao_dominante_media', media);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.mao_dominante_t1, data.mao_dominante_t2, data.mao_dominante_t3]);

    useEffect(() => {
        const vals = [data.mao_nao_dominante_t1, data.mao_nao_dominante_t2, data.mao_nao_dominante_t3].map(v => parseFloat(v)).filter(v => !isNaN(v));
        const media = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : '';
        if (media !== String(data.mao_nao_dominante_media)) setData('mao_nao_dominante_media', media);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.mao_nao_dominante_t1, data.mao_nao_dominante_t2, data.mao_nao_dominante_t3]);

    useEffect(() => {
        const d = parseFloat(data.mao_dominante_media);
        const nd = parseFloat(data.mao_nao_dominante_media);
        if (!isNaN(d) && !isNaN(nd) && Math.max(d, nd) > 0) {
            const assimetria = (Math.abs(d - nd) / Math.max(d, nd) * 100).toFixed(2);
            if (assimetria !== String(data.assimetria_percentual)) setData('assimetria_percentual', assimetria);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.mao_dominante_media, data.mao_nao_dominante_media]);

    const toggleContexto = (value) => {
        const has = data.contextos_clinicos.includes(value);
        setData('contextos_clinicos', has ? data.contextos_clinicos.filter(c => c !== value) : [...data.contextos_clinicos, value]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (data.anexos.length > 0) {
            router.post(route('questionnaires.dinamometro.update', questionnaire.id), { ...data, _method: 'PUT' }, {
                forceFormData: true,
                preserveScroll: true,
            });
        } else {
            put(route('questionnaires.dinamometro.update', questionnaire.id));
        }
    };

    const labelClass = "block text-base font-semibold text-gray-700 dark:text-gray-300 mb-1.5";
    const inputClass = "w-full text-base py-2.5 px-3.5 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-violet-500 dark:focus:ring-violet-600 focus:border-violet-500 dark:focus:border-violet-600";
    const subLabelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";
    const subInputClass = "w-full text-sm py-2 px-3 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-violet-500 dark:focus:ring-violet-600 focus:border-violet-500 dark:focus:border-violet-600";
    const errorClass = "text-red-600 dark:text-red-400 text-sm mt-1.5";

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">Editar Questionário</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Dinamômetro - Força de Preensão Manual</p>
                    </div>
                </div>
            }
        >
            <Head title="Editar Questionário - Dinamômetro" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:flex lg:gap-8 lg:items-start">
                        <QuestionnaireSectionNav sections={SECTIONS} color="violet" />

                        <div className="flex-1 min-w-0 max-w-4xl">
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                                <div className="bg-gradient-to-r from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 px-6 py-5">
                                    <h3 className="text-2xl font-bold text-white">Editar Avaliação de Força de Preensão Manual</h3>
                                </div>

                                <div className="p-6 text-gray-900 dark:text-gray-100">
                                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                                        {/* Identificação */}
                                        <div id="sec-identificacao" className="scroll-mt-24 mb-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                            <div className="flex items-center mb-5">
                                                <div className="w-1 h-9 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full mr-3"></div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">1. Identificação do Paciente</h3>
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
                                                    {idadeCalculada !== null && (<div className="text-sm text-gray-600 dark:text-gray-400 mt-1.5">Idade: {idadeCalculada}</div>)}
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
                                                        <option value="Destro">Destro</option>
                                                        <option value="Canhoto">Canhoto</option>
                                                        <option value="Ambidestro">Ambidestro</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Profissão</label>
                                                    <input type="text" value={data.profissao} onChange={(e) => setData('profissao', e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Responsável (se menor)</label>
                                                    <input type="text" value={data.responsavel_menor} onChange={(e) => setData('responsavel_menor', e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Diagnóstico Principal</label>
                                                    <input type="text" value={data.diagnostico_principal} onChange={(e) => setData('diagnostico_principal', e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Clínica</label>
                                                    <input type="text" value={data.clinica} onChange={(e) => setData('clinica', e.target.value.toUpperCase())} className={`${inputClass} uppercase`} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Equipe *</label>
                                                    <select value={data.team_id} onChange={(e) => setData('team_id', e.target.value)} className={inputClass} required>
                                                        <option value="">Selecione uma equipe...</option>
                                                        {teams.map((team) => (<option key={team.id} value={team.id}>{team.name}</option>))}
                                                    </select>
                                                    {errors.team_id && <div className={errorClass}>{errors.team_id}</div>}
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className={labelClass}>Indicação da Avaliação</label>
                                                    <textarea value={data.indicacao_avaliacao} onChange={(e) => setData('indicacao_avaliacao', e.target.value)} rows={2} className={inputClass} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contexto clínico */}
                                        <div id="sec-contexto" className="scroll-mt-24 mb-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                            <div className="flex items-center mb-5">
                                                <div className="w-1 h-9 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full mr-3"></div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">2. Contexto Clínico</h3>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {CONTEXTOS.map((c) => (
                                                    <label key={c.value} className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${data.contextos_clinicos.includes(c.value) ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-400 dark:border-violet-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'}`}>
                                                        <input type="checkbox" checked={data.contextos_clinicos.includes(c.value)} onChange={() => toggleContexto(c.value)} className="mt-1 w-6 h-6 text-violet-600 dark:text-violet-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded focus:ring-violet-500 dark:focus:ring-violet-600" />
                                                        <span>
                                                            <span className="block text-base font-semibold text-gray-900 dark:text-gray-100">{c.label}</span>
                                                            <span className="block text-sm text-gray-500 dark:text-gray-400">{c.help}</span>
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Histórico clínico */}
                                        <div id="sec-historico" className="scroll-mt-24 mb-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                            <div className="flex items-center mb-5">
                                                <div className="w-1 h-9 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full mr-3"></div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">3. Histórico Clínico</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                                                <div>
                                                    <label className={labelClass}>Doenças Crônicas / Comorbidades</label>
                                                    <input type="text" value={data.doencas_cronicas} onChange={(e) => setData('doencas_cronicas', e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Cirurgias Membro Superior</label>
                                                    <input type="text" value={data.cirurgias_membro_superior} onChange={(e) => setData('cirurgias_membro_superior', e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Medicações em Uso</label>
                                                    <input type="text" value={data.medicacoes_uso} onChange={(e) => setData('medicacoes_uso', e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Dor Atual (0-10)</label>
                                                    <input type="number" min="0" max="10" value={data.dor_atual} onChange={(e) => setData('dor_atual', e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Localização da Dor</label>
                                                    <input type="text" value={data.localizacao_dor} onChange={(e) => setData('localizacao_dor', e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Se houve lesão, qual?</label>
                                                    <input type="text" value={data.lesao_previa_atual_qual} onChange={(e) => setData('lesao_previa_atual_qual', e.target.value)} className={inputClass} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <Toggle label="Fisioterapia recente" checked={data.fisioterapia_recente} onChange={(v) => setData('fisioterapia_recente', v)} />
                                                <Toggle label="Lesão prévia/atual mão-punho-cotovelo-ombro" checked={data.lesao_previa_atual} onChange={(v) => setData('lesao_previa_atual', v)} />
                                                <Toggle label="Dor piora com força" checked={data.dor_piora_com_forca} onChange={(v) => setData('dor_piora_com_forca', v)} />
                                            </div>
                                        </div>

                                        {/* Seções por contexto */}
                                        <div id="sec-secoes" className="scroll-mt-24 mb-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                            <div className="flex items-center mb-5">
                                                <div className="w-1 h-9 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full mr-3"></div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">4. Seção Específica por Contexto</h3>
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div className="border border-cyan-200 dark:border-cyan-800 rounded-lg p-5 bg-cyan-50/50 dark:bg-cyan-900/10">
                                                    <h4 className="text-base font-bold text-cyan-700 dark:text-cyan-300 uppercase mb-4">Neurológico</h4>
                                                    <div className="mb-4">
                                                        <label className={subLabelClass}>Lado Afetado</label>
                                                        <select value={data.neuro_lado_afetado} onChange={(e) => setData('neuro_lado_afetado', e.target.value)} className={subInputClass}>
                                                            <option value="">-</option>
                                                            <option value="Direito">Direito</option>
                                                            <option value="Esquerdo">Esquerdo</option>
                                                            <option value="Bilateral">Bilateral</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        <Toggle label="Espasticidade" checked={data.neuro_espasticidade} onChange={(v) => setData('neuro_espasticidade', v)} />
                                                        <Toggle label="Tremor" checked={data.neuro_tremor} onChange={(v) => setData('neuro_tremor', v)} />
                                                        <Toggle label="Dominância = lado afetado" checked={data.neuro_dominancia_igual_lado_afetado} onChange={(v) => setData('neuro_dominancia_igual_lado_afetado', v)} />
                                                        <Toggle label="No melhor efeito da medicação" checked={data.neuro_melhor_efeito_medicacao} onChange={(v) => setData('neuro_melhor_efeito_medicacao', v)} />
                                                    </div>
                                                </div>

                                                <div className="border border-green-200 dark:border-green-800 rounded-lg p-5 bg-green-50/50 dark:bg-green-900/10">
                                                    <h4 className="text-base font-bold text-green-700 dark:text-green-300 uppercase mb-4">Ortopédico</h4>
                                                    <div className="mb-4 grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className={subLabelClass}>QuickDASH score</label>
                                                            <input type="number" step="0.01" value={data.orto_quickdash_score} onChange={(e) => setData('orto_quickdash_score', e.target.value)} className={subInputClass} />
                                                        </div>
                                                        <div>
                                                            <label className={subLabelClass}>Fase do Tratamento</label>
                                                            <select value={data.orto_fase_tratamento} onChange={(e) => setData('orto_fase_tratamento', e.target.value)} className={subInputClass}>
                                                                <option value="">-</option>
                                                                <option value="Aguda">Aguda</option>
                                                                <option value="Subaguda">Subaguda</option>
                                                                <option value="Crônica">Crônica</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        <Toggle label="Fase aguda da lesão" checked={data.orto_fase_aguda_lesao} onChange={(v) => setData('orto_fase_aguda_lesao', v)} />
                                                        <Toggle label="Dor piora com força" checked={data.orto_dor_piora_forca} onChange={(v) => setData('orto_dor_piora_forca', v)} />
                                                    </div>
                                                </div>

                                                <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-5 bg-orange-50/50 dark:bg-orange-900/10">
                                                    <h4 className="text-base font-bold text-orange-700 dark:text-orange-300 uppercase mb-4">Geriátrico</h4>
                                                    <div className="mb-4 grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className={subLabelClass}>Nº medicamentos/dia</label>
                                                            <input type="number" value={data.geri_num_medicamentos_dia} onChange={(e) => setData('geri_num_medicamentos_dia', e.target.value)} className={subInputClass} />
                                                        </div>
                                                        <div>
                                                            <label className={subLabelClass}>Fragilidade (Fried 0-5)</label>
                                                            <input type="number" min="0" max="5" value={data.geri_fragilidade_fried} onChange={(e) => setData('geri_fragilidade_fried', e.target.value)} className={subInputClass} />
                                                        </div>
                                                    </div>
                                                    <div className="mb-4">
                                                        <label className={subLabelClass}>Classificação de Fragilidade</label>
                                                        <select value={data.geri_classificacao_fragilidade} onChange={(e) => setData('geri_classificacao_fragilidade', e.target.value)} className={subInputClass}>
                                                            <option value="">-</option>
                                                            <option value="Robusto">Robusto (0)</option>
                                                            <option value="Pré-frágil">Pré-frágil (1-2)</option>
                                                            <option value="Frágil">Frágil (≥3)</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        <Toggle label="Quedas no último ano" checked={data.geri_quedas_ultimo_ano} onChange={(v) => setData('geri_quedas_ultimo_ano', v)} />
                                                        <Toggle label="Comprometimento cognitivo" checked={data.geri_comprometimento_cognitivo} onChange={(v) => setData('geri_comprometimento_cognitivo', v)} />
                                                    </div>
                                                </div>

                                                <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-5 bg-purple-50/50 dark:bg-purple-900/10">
                                                    <h4 className="text-base font-bold text-purple-700 dark:text-purple-300 uppercase mb-4">Pediátrico</h4>
                                                    <div className="mb-4">
                                                        <label className={subLabelClass}>Idade Cronológica vs. Desenvolvimento</label>
                                                        <input type="text" value={data.pedi_idade_cronologica_vs_desenvolvimento} onChange={(e) => setData('pedi_idade_cronologica_vs_desenvolvimento', e.target.value)} className={subInputClass} />
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        <Toggle label="Dominância ainda não definida" checked={data.pedi_dominancia_nao_definida} onChange={(v) => setData('pedi_dominancia_nao_definida', v)} />
                                                        <Toggle label="Paralisia cerebral / síndrome genética" checked={data.pedi_paralisia_cerebral_sindrome} onChange={(v) => setData('pedi_paralisia_cerebral_sindrome', v)} />
                                                        <Toggle label="Segura brinquedos/lápis normalmente" checked={data.pedi_segura_objetos_normalmente} onChange={(v) => setData('pedi_segura_objetos_normalmente', v)} />
                                                        <Toggle label="Coopera com o teste" checked={data.pedi_coopera_teste} onChange={(v) => setData('pedi_coopera_teste', v)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Condições no dia do teste */}
                                        <div id="sec-condicoes" className="scroll-mt-24 mb-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                            <div className="flex items-center mb-5">
                                                <div className="w-1 h-9 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full mr-3"></div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">5. Condições no Dia do Teste</h3>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <Toggle label="Dormiu bem?" checked={data.dormiu_bem} onChange={(v) => setData('dormiu_bem', v)} />
                                                <Toggle label="Esforço físico nas últimas 24h?" checked={data.esforco_fisico_24h} onChange={(v) => setData('esforco_fisico_24h', v)} />
                                                <Toggle label="Dor ou desconforto hoje?" checked={data.dor_desconforto_hoje} onChange={(v) => setData('dor_desconforto_hoje', v)} />
                                                <Toggle label="Consentimento / assinou TCLE?" checked={data.consentimento_tcle} onChange={(v) => setData('consentimento_tcle', v)} />
                                            </div>
                                        </div>

                                        {/* Padronização e resultados */}
                                        <div id="sec-resultados" className="scroll-mt-24 mb-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                            <div className="flex items-center mb-5">
                                                <div className="w-1 h-9 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full mr-3"></div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">6. Padronização e Resultados</h3>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-5">Posição: sentado, cotovelo 90°, punho neutro</p>
                                            <div className="grid grid-cols-2 gap-6 mb-6">
                                                <div>
                                                    <label className={labelClass}>Tentativas</label>
                                                    <input type="number" value={data.tentativas} onChange={(e) => setData('tentativas', e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Intervalo (s)</label>
                                                    <input type="number" value={data.intervalo_segundos} onChange={(e) => setData('intervalo_segundos', e.target.value)} className={inputClass} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-5">
                                                    <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3">Mão Dominante (kgf)</h4>
                                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                                        <input type="number" step="0.01" placeholder="1ª" value={data.mao_dominante_t1} onChange={(e) => setData('mao_dominante_t1', e.target.value)} className={subInputClass} />
                                                        <input type="number" step="0.01" placeholder="2ª" value={data.mao_dominante_t2} onChange={(e) => setData('mao_dominante_t2', e.target.value)} className={subInputClass} />
                                                        <input type="number" step="0.01" placeholder="3ª" value={data.mao_dominante_t3} onChange={(e) => setData('mao_dominante_t3', e.target.value)} className={subInputClass} />
                                                    </div>
                                                    <p className="text-base text-gray-700 dark:text-gray-300">Média: <span className="font-bold text-lg text-violet-700 dark:text-violet-300">{data.mao_dominante_media || '-'}</span></p>
                                                </div>
                                                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-5">
                                                    <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3">Mão Não Dominante (kgf)</h4>
                                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                                        <input type="number" step="0.01" placeholder="1ª" value={data.mao_nao_dominante_t1} onChange={(e) => setData('mao_nao_dominante_t1', e.target.value)} className={subInputClass} />
                                                        <input type="number" step="0.01" placeholder="2ª" value={data.mao_nao_dominante_t2} onChange={(e) => setData('mao_nao_dominante_t2', e.target.value)} className={subInputClass} />
                                                        <input type="number" step="0.01" placeholder="3ª" value={data.mao_nao_dominante_t3} onChange={(e) => setData('mao_nao_dominante_t3', e.target.value)} className={subInputClass} />
                                                    </div>
                                                    <p className="text-base text-gray-700 dark:text-gray-300">Média: <span className="font-bold text-lg text-violet-700 dark:text-violet-300">{data.mao_nao_dominante_media || '-'}</span></p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Valores de referência */}
                                        <div id="sec-referencia" className="scroll-mt-24 mb-10 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-6">
                                            <h4 className="text-base font-bold text-violet-700 dark:text-violet-300 uppercase mb-4">7. Valores de Referência (kgf) — Adultos</h4>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full text-sm text-center border border-violet-200 dark:border-violet-700">
                                                    <thead>
                                                        <tr className="bg-violet-100 dark:bg-violet-900/40">
                                                            <th className="px-3 py-2 border border-violet-200 dark:border-violet-700">Faixa etária</th>
                                                            <th className="px-3 py-2 border border-violet-200 dark:border-violet-700">18-29</th>
                                                            <th className="px-3 py-2 border border-violet-200 dark:border-violet-700">30-39</th>
                                                            <th className="px-3 py-2 border border-violet-200 dark:border-violet-700">40-49</th>
                                                            <th className="px-3 py-2 border border-violet-200 dark:border-violet-700">50-59</th>
                                                            <th className="px-3 py-2 border border-violet-200 dark:border-violet-700">60-69</th>
                                                            <th className="px-3 py-2 border border-violet-200 dark:border-violet-700">≥70</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr><td className="px-3 py-2 border border-violet-200 dark:border-violet-700 font-semibold">Homens</td><td className="px-3 py-2 border border-violet-200 dark:border-violet-700">45-55</td><td className="px-3 py-2 border border-violet-200 dark:border-violet-700">40-50</td><td className="px-3 py-2 border border-violet-200 dark:border-violet-700">35-45</td><td className="px-3 py-2 border border-violet-200 dark:border-violet-700">30-40</td><td className="px-3 py-2 border border-violet-200 dark:border-violet-700">25-35</td><td className="px-3 py-2 border border-violet-200 dark:border-violet-700">20-30</td></tr>
                                                        <tr><td className="px-3 py-2 border border-violet-200 dark:border-violet-700 font-semibold">Mulheres</td><td className="px-3 py-2 border border-violet-200 dark:border-violet-700">25-35</td><td className="px-3 py-2 border border-violet-200 dark:border-violet-700">22-32</td><td className="px-3 py-2 border border-violet-200 dark:border-violet-700">20-30</td><td className="px-3 py-2 border border-violet-200 dark:border-violet-700">18-28</td><td className="px-3 py-2 border border-violet-200 dark:border-violet-700">15-25</td><td className="px-3 py-2 border border-violet-200 dark:border-violet-700">12-22</td></tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <p className="text-sm text-violet-700 dark:text-violet-300 italic mt-3">Pediátrico (referência aproximada): Meninos 6-14 anos: 8-30 kgf | Meninas 6-14 anos: 7-24 kgf</p>
                                        </div>

                                        {/* Interpretação e conduta */}
                                        <div id="sec-interpretacao" className="scroll-mt-24 mb-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                            <div className="flex items-center mb-5">
                                                <div className="w-1 h-9 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full mr-3"></div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">8. Interpretação e Conduta</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div>
                                                    <label className={labelClass}>Classificação</label>
                                                    <input type="text" value={data.classificacao} onChange={(e) => setData('classificacao', e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Assimetria % (&gt;15% relevante)</label>
                                                    <input type="number" step="0.01" value={data.assimetria_percentual} onChange={(e) => setData('assimetria_percentual', e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Profissional (Avaliador)</label>
                                                    <input type="text" value={data.nome_avaliador} onChange={(e) => setData('nome_avaliador', e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>CREFITO/CRM</label>
                                                    <input type="text" value={data.crefito_crm} onChange={(e) => setData('crefito_crm', e.target.value)} className={inputClass} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelClass}>Conclusão</label>
                                                    <textarea value={data.conclusao} onChange={(e) => setData('conclusao', e.target.value)} rows={3} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Conduta</label>
                                                    <textarea value={data.conduta} onChange={(e) => setData('conduta', e.target.value)} rows={3} className={inputClass} />
                                                </div>
                                            </div>
                                            <div className="mt-6">
                                                <label className={labelClass}>Comentário</label>
                                                <textarea value={data.comentario} onChange={(e) => setData('comentario', e.target.value)} rows={2} className={inputClass} />
                                            </div>
                                        </div>

                                        {/* Arquivos */}
                                        <div id="sec-arquivos" className="scroll-mt-24 mb-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                            <div className="flex items-center mb-5">
                                                <div className="w-1 h-9 bg-gradient-to-b from-green-500 to-teal-600 rounded-full mr-3"></div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Arquivos e Assinatura</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelClass}>Pedido Médico / Anexos</label>
                                                    <AnexosUploader type="dinamometro" id={questionnaire.id} files={data.anexos} onFilesChange={(f) => setData('anexos', f)} existing={questionnaire.attachments || []} />
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
                                            <button type="button" onClick={() => window.history.back()} className="px-7 py-3 text-base font-semibold bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200">Cancelar</button>
                                            <button type="submit" disabled={processing} className="px-7 py-3 text-base font-semibold bg-gradient-to-r from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 dark:hover:from-violet-700 dark:hover:to-purple-800 transition-colors duration-200 disabled:opacity-50">{processing ? 'Salvando...' : 'Salvar Alterações'}</button>
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
