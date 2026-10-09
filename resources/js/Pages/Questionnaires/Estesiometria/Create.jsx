import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AnexosUploader from '@/Components/AnexosUploader';
import SignaturePad from '@/Components/SignaturePad';
import BirthDateSelectInput from '@/Components/BirthDateSelectInput';
import { upperAll } from '@/Utils/uppercase';

const FOOT_POINTS = ['Hallux', '1º Metatarso', '3º Metatarso', '5º Metatarso', 'Região Medial', 'Região Central', 'Região Lateral', 'Calcâneo', 'Dorso', 'Medial Pé'];
const HAND_POINTS = ['Polegar', 'Indicador', 'Médio', 'Mínimo', 'Tenar', 'Hipotenar', 'Dorso'];
const CORES = ['Verde', 'Azul', 'Violeta', 'Vermelho', 'Laranja/Rosa'];

const defaultFootPoints = () => FOOT_POINTS.map((ponto) => ({ ponto, sentiu: false, cor_direito: '', cor_esquerdo: '' }));
const defaultHandPoints = () => HAND_POINTS.map((ponto) => ({ ponto, sentiu: false, cor_direita: '', cor_esquerda: '' }));

const PointsTable = ({ title, points, onChange, sideLabels, sideFields }) => (
    <div className="overflow-x-auto">
        <h4 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-3">{title}</h4>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-600 border border-gray-200 dark:border-zinc-600 rounded-lg">
            <thead className="bg-gray-50 dark:bg-zinc-600">
                <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-zinc-300 uppercase">Ponto</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-zinc-300 uppercase">Sentiu?</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-zinc-300 uppercase">{sideLabels[0]}</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-zinc-300 uppercase">{sideLabels[1]}</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-700 divide-y divide-gray-200 dark:divide-zinc-600">
                {points.map((row, idx) => (
                    <tr key={row.ponto}>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-zinc-100 whitespace-nowrap">{row.ponto}</td>
                        <td className="px-4 py-2">
                            <input
                                type="checkbox"
                                checked={!!row.sentiu}
                                onChange={(e) => onChange(idx, 'sentiu', e.target.checked)}
                                className="w-5 h-5 text-red-600 dark:text-red-500 border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 rounded focus:ring-red-500 dark:focus:ring-red-600"
                            />
                        </td>
                        <td className="px-4 py-2">
                            <select value={row[sideFields[0]]} onChange={(e) => onChange(idx, sideFields[0], e.target.value)} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm text-sm focus:ring-red-500 dark:focus:ring-red-600 focus:border-red-500 dark:focus:border-red-600">
                                <option value="">-</option>
                                {CORES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </td>
                        <td className="px-4 py-2">
                            <select value={row[sideFields[1]]} onChange={(e) => onChange(idx, sideFields[1], e.target.value)} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm text-sm focus:ring-red-500 dark:focus:ring-red-600 focus:border-red-500 dark:focus:border-red-600">
                                <option value="">-</option>
                                {CORES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const PRE_EXAM_QUESTIONS = [
    { field: 'dormencia_formigamento', label: 'Você sente dormência, formigamento ou queimação nas mãos/pés?' },
    { field: 'dificuldade_sentir_objetos', label: 'Tem sentido dificuldade para sentir objetos com as mãos?' },
    { field: 'feridas_sem_dor', label: 'Já teve feridas nos pés sem sentir dor?' },
    { field: 'diagnostico_diabetes_hanseniase', label: 'Possui diagnóstico de diabetes, hanseníase ou doença neurológica?' },
    { field: 'cirurgia_fratura_recente', label: 'Fez cirurgia ou teve fratura recente nas regiões a serem avaliadas?' },
    { field: 'medicamentos_sistema_nervoso', label: 'Usa medicamentos que afetam o sistema nervoso? (quimio, anticonvulsivantes, etc.)' },
];

export default function Create({ auth }) {
    const getCurrentDate = () => new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, transform } = useForm({
        clinica: '',
        data_exame: getCurrentDate(),
        nome_completo: '',
        data_nascimento: '',
        sexo: '',
        nome_avaliador: '',
        crm_rg: '',
        diagnostico: '',
        dormencia_formigamento: false,
        dificuldade_sentir_objetos: false,
        feridas_sem_dor: false,
        diagnostico_diabetes_hanseniase: false,
        cirurgia_fratura_recente: false,
        medicamentos_sistema_nervoso: false,
        pontos_pes: defaultFootPoints(),
        pontos_maos: defaultHandPoints(),
        pes_percent_acerto_d: '',
        pes_percent_acerto_e: '',
        pes_classificacao: '',
        maos_percent_acerto_d: '',
        maos_percent_acerto_e: '',
        maos_classificacao: '',
        comentario: '',
        assinatura_paciente: null,
        pedido_medico: null,
        anexos: [],
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

    const updatePoint = (listField) => (idx, field, value) => {
        const updated = data[listField].map((row, i) => (i === idx ? { ...row, [field]: value } : row));
        setData(listField, updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('questionnaires.estesiometria.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="9" strokeWidth={2} />
                            <circle cx="12" cy="12" r="3" strokeWidth={2} />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-zinc-200 leading-tight">Novo Questionário</h2>
                        <p className="text-xs text-gray-600 dark:text-zinc-400">Estesiometria - Avaliação Sensitiva</p>
                    </div>
                    <Link
                        href={route('questionnaires.estesiometria.index')}
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
            <Head title="Novo Questionário - Estesiometria" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-zinc-700 overflow-hidden shadow-xl dark:shadow-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-600 transition-colors duration-200">
                        <div className="bg-gradient-to-r from-red-500 to-rose-600 dark:from-red-600 dark:to-rose-700 px-6 py-4">
                            <h3 className="text-xl font-bold text-white">Formulário de Estesiometria — Avaliação Sensitiva</h3>
                        </div>

                        <div className="p-6 text-gray-900 dark:text-zinc-100">
                            <form onSubmit={handleSubmit} encType="multipart/form-data">
                                {/* Dados básicos */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-rose-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Dados Básicos</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Nome do Paciente *</label>
                                            <input type="text" value={data.nome_completo} onChange={(e) => setData('nome_completo', e.target.value.toUpperCase())} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-red-500 dark:focus:ring-red-600 focus:border-red-500 dark:focus:border-red-600 uppercase" required />
                                            {errors.nome_completo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.nome_completo}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Data de Nascimento *</label>
                                            <BirthDateSelectInput value={data.data_nascimento} onChange={(value) => setData('data_nascimento', value)} required={true} />
                                            {idadeCalculada !== null && (<div className="text-sm text-gray-600 dark:text-zinc-400 mt-1">Idade: {idadeCalculada}</div>)}
                                            {errors.data_nascimento && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.data_nascimento}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Sexo *</label>
                                            <select value={data.sexo} onChange={(e) => setData('sexo', e.target.value)} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-red-500 dark:focus:ring-red-600 focus:border-red-500 dark:focus:border-red-600" required>
                                                <option value="">Selecione...</option>
                                                <option value="Masculino">Masculino</option>
                                                <option value="Feminino">Feminino</option>
                                            </select>
                                            {errors.sexo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.sexo}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Data do Exame *</label>
                                            <input type="date" value={data.data_exame} onChange={(e) => setData('data_exame', e.target.value)} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-red-500 dark:focus:ring-red-600 focus:border-red-500 dark:focus:border-red-600" required />
                                            {errors.data_exame && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.data_exame}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Clínica</label>
                                            <input type="text" value={data.clinica} onChange={(e) => setData('clinica', e.target.value.toUpperCase())} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-red-500 dark:focus:ring-red-600 focus:border-red-500 dark:focus:border-red-600 uppercase" />
                                            {errors.clinica && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.clinica}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Profissional (Avaliador)</label>
                                            <input type="text" value={data.nome_avaliador} onChange={(e) => setData('nome_avaliador', e.target.value)} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-red-500 dark:focus:ring-red-600 focus:border-red-500 dark:focus:border-red-600" />
                                            {errors.nome_avaliador && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.nome_avaliador}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">CRM/RG</label>
                                            <input type="text" value={data.crm_rg} onChange={(e) => setData('crm_rg', e.target.value)} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-red-500 dark:focus:ring-red-600 focus:border-red-500 dark:focus:border-red-600" />
                                            {errors.crm_rg && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.crm_rg}</div>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Diagnóstico</label>
                                            <input type="text" value={data.diagnostico} onChange={(e) => setData('diagnostico', e.target.value)} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-red-500 dark:focus:ring-red-600 focus:border-red-500 dark:focus:border-red-600" />
                                            {errors.diagnostico && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.diagnostico}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Questionário pré-exame */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-rose-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Questionário Pré-Exame</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {PRE_EXAM_QUESTIONS.map((q) => (
                                            <label key={q.field} className="flex items-center justify-between gap-4 bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-500 rounded-lg p-3">
                                                <span className="text-sm text-gray-800 dark:text-zinc-200">{q.label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={!!data[q.field]}
                                                    onChange={(e) => setData(q.field, e.target.checked)}
                                                    className="w-5 h-5 text-red-600 dark:text-red-500 border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 rounded focus:ring-red-500 dark:focus:ring-red-600 flex-shrink-0"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Avaliação dos pés e mãos */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm space-y-8">
                                    <div className="flex items-center mb-2">
                                        <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-rose-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Avaliação com Monofilamentos</h3>
                                    </div>
                                    <PointsTable title="Avaliação dos Pés" points={data.pontos_pes} onChange={updatePoint('pontos_pes')} sideLabels={['Cor Pé Direito', 'Cor Pé Esquerdo']} sideFields={['cor_direito', 'cor_esquerdo']} />
                                    <PointsTable title="Avaliação das Mãos" points={data.pontos_maos} onChange={updatePoint('pontos_maos')} sideLabels={['Cor Mão Direita', 'Cor Mão Esquerda']} sideFields={['cor_direita', 'cor_esquerda']} />
                                </div>

                                {/* Resultado e classificação */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-rose-500 to-pink-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Resultado e Classificação</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Pés — % Acerto D</label>
                                            <input type="number" step="0.01" min="0" max="100" value={data.pes_percent_acerto_d} onChange={(e) => setData('pes_percent_acerto_d', e.target.value)} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-red-500 dark:focus:ring-red-600 focus:border-red-500 dark:focus:border-red-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Pés — % Acerto E</label>
                                            <input type="number" step="0.01" min="0" max="100" value={data.pes_percent_acerto_e} onChange={(e) => setData('pes_percent_acerto_e', e.target.value)} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-red-500 dark:focus:ring-red-600 focus:border-red-500 dark:focus:border-red-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Pés — Classificação</label>
                                            <select value={data.pes_classificacao} onChange={(e) => setData('pes_classificacao', e.target.value)} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-red-500 dark:focus:ring-red-600 focus:border-red-500 dark:focus:border-red-600">
                                                <option value="">-</option>
                                                <option value="Normal">Normal</option>
                                                <option value="Leve">Leve</option>
                                                <option value="Moderada">Moderada</option>
                                                <option value="Grave">Grave</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Mãos — % Acerto D</label>
                                            <input type="number" step="0.01" min="0" max="100" value={data.maos_percent_acerto_d} onChange={(e) => setData('maos_percent_acerto_d', e.target.value)} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-red-500 dark:focus:ring-red-600 focus:border-red-500 dark:focus:border-red-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Mãos — % Acerto E</label>
                                            <input type="number" step="0.01" min="0" max="100" value={data.maos_percent_acerto_e} onChange={(e) => setData('maos_percent_acerto_e', e.target.value)} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-red-500 dark:focus:ring-red-600 focus:border-red-500 dark:focus:border-red-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Mãos — Classificação</label>
                                            <select value={data.maos_classificacao} onChange={(e) => setData('maos_classificacao', e.target.value)} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-red-500 dark:focus:ring-red-600 focus:border-red-500 dark:focus:border-red-600">
                                                <option value="">-</option>
                                                <option value="Normal">Normal</option>
                                                <option value="Leve">Leve</option>
                                                <option value="Moderada">Moderada</option>
                                                <option value="Grave">Grave</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Observações Clínicas</label>
                                        <textarea value={data.comentario} onChange={(e) => setData('comentario', e.target.value)} rows={3} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-red-500 dark:focus:ring-red-600 focus:border-red-500 dark:focus:border-red-600" />
                                    </div>
                                </div>

                                {/* Arquivos e assinaturas */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-teal-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Arquivos e Assinaturas</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Pedido Médico / Anexos</label>
                                            <AnexosUploader type="estesiometria" files={data.anexos} onFilesChange={(f) => setData('anexos', f)} />
                                            {errors.pedido_medico && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.pedido_medico}</div>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Assinatura do Paciente</label>
                                            <SignaturePad onSignatureChange={(signature) => setData('assinatura_paciente', signature)} className="w-full" />
                                            {errors.assinatura_paciente && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.assinatura_paciente}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button type="button" onClick={() => window.history.back()} className="px-6 py-2 bg-gray-500 dark:bg-zinc-500 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-zinc-600 transition-colors duration-200">Cancelar</button>
                                    <button type="submit" disabled={processing} className="px-6 py-2 bg-gradient-to-r from-red-500 to-rose-600 dark:from-red-600 dark:to-rose-700 text-white rounded-lg hover:from-red-600 hover:to-rose-700 dark:hover:from-red-700 dark:hover:to-rose-800 transition-colors duration-200 disabled:opacity-50">{processing ? 'Salvando...' : 'Salvar Questionário'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
