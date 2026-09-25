import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AnexosUploader from '@/Components/AnexosUploader';
import SignaturePad from '@/Components/SignaturePad';
import BirthDateSelectInput from '@/Components/BirthDateSelectInput';

const SCALE_OPTIONS = [
    { value: 0, label: 'Nunca' },
    { value: 1, label: 'Raramente' },
    { value: 2, label: 'Algumas vezes' },
    { value: 3, label: 'Frequentemente' },
    { value: 4, label: 'Muito frequentemente' },
];

const PARTE_A_PERGUNTAS = [
    'Com que frequência você comete erros por falta de atenção quando tem que trabalhar em um projeto chato ou difícil?',
    'Com que frequência você tem dificuldade para manter a atenção quando está fazendo um trabalho chato ou repetitivo?',
    'Com que frequência você tem dificuldade para se concentrar no que as pessoas dizem, mesmo quando elas estão falando diretamente com você?',
    'Com que frequência você deixa um projeto pela metade depois de já ter feito as partes mais difíceis?',
    'Com que frequência você tem dificuldade de fazer um trabalho que exige organização?',
    'Quando você precisa fazer algo que exige muita concentração, com que frequência você evita ou adia o início?',
    'Com que frequência você coloca as coisas fora do lugar ou tem dificuldade de encontrar as coisas em casa ou no trabalho?',
    'Com que frequência você se distrai com atividades ou barulho a sua volta?',
    'Com que frequência você tem dificuldade para lembrar de compromissos ou obrigações?',
];

const PARTE_B_PERGUNTAS = [
    'Com que frequência você fica se mexendo na cadeira ou balançando as mãos ou os pés quando precisa ficar sentado(a) por muito tempo?',
    'Com que frequência você se levanta da cadeira em reuniões ou em outras situações onde deveria ficar sentado(a)?',
    'Com que frequência você se sente inquieto(a) ou agitado(a)?',
    'Com que frequência você tem dificuldade para sossegar e relaxar quando tem tempo livre para você?',
    'Com que frequência você se sente ativo(a) demais e necessitando fazer coisas como se estivesse "com um motor ligado"?',
    'Com que frequência você se pega falando demais em situações sociais?',
    'Quando você está conversando, com que frequência você se pega terminando as frases das pessoas antes delas?',
    'Com que frequência você tem dificuldade para esperar nas situações onde cada um tem a sua vez?',
    'Com que frequência você interrompe os outros quando eles estão ocupados?',
];

const ScaleSection = ({ title, perguntas, respostas, onChange, colorFrom, colorTo }) => (
    <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
        <div className="flex items-center mb-4">
            <div className={`w-1 h-8 bg-gradient-to-b ${colorFrom} ${colorTo} rounded-full mr-3`}></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        <div className="space-y-4">
            {perguntas.map((pergunta, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">{idx + 1}. {pergunta}</p>
                    <div className="flex flex-wrap gap-2">
                        {SCALE_OPTIONS.map((opt) => (
                            <label key={opt.value} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs cursor-pointer transition-colors ${respostas[idx] === opt.value ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}>
                                <input type="radio" className="hidden" checked={respostas[idx] === opt.value} onChange={() => onChange(idx, opt.value)} />
                                {opt.value} - {opt.label}
                            </label>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default function Create({ auth, teams }) {
    const getCurrentDate = () => new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors } = useForm({
        clinica: '',
        data_exame: getCurrentDate(),
        nome_completo: '',
        data_nascimento: '',
        rg: '',
        peso: '',
        altura: '',
        sexo: '',
        solicitante: '',
        team_id: '',
        parte_a_respostas: Array(9).fill(null),
        parte_a_total: '',
        parte_b_respostas: Array(9).fill(null),
        parte_b_total: '',
        cid: '',
        comentario: '',
        assinatura_paciente: null,
        pedido_medico: null,
        anexos: [],
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
        const total = data.parte_a_respostas.reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0);
        if (String(total) !== String(data.parte_a_total)) setData('parte_a_total', total);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.parte_a_respostas]);

    useEffect(() => {
        const total = data.parte_b_respostas.reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0);
        if (String(total) !== String(data.parte_b_total)) setData('parte_b_total', total);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.parte_b_respostas]);

    const updateResposta = (field) => (idx, value) => {
        const updated = [...data[field]];
        updated[idx] = value;
        setData(field, updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('questionnaires.tdah-adulto.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">Novo Questionário</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">TDAH Adulto - ASRS-18</p>
                    </div>
                </div>
            }
        >
            <Head title="Novo Questionário - TDAH Adulto" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 px-6 py-4">
                            <h3 className="text-xl font-bold text-white">Questionário ASRS-18 — Escala de Autoavaliação para TDAH em Adultos</h3>
                        </div>

                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <form onSubmit={handleSubmit} encType="multipart/form-data">
                                {/* Dados básicos */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-blue-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dados Básicos</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
                                            <input type="text" value={data.nome_completo} onChange={(e) => setData('nome_completo', e.target.value.toUpperCase())} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 uppercase" required />
                                            {errors.nome_completo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.nome_completo}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Nascimento *</label>
                                            <BirthDateSelectInput value={data.data_nascimento} onChange={(value) => setData('data_nascimento', value)} required={true} />
                                            {idadeCalculada !== null && (<div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Idade: {idadeCalculada}</div>)}
                                            {errors.data_nascimento && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.data_nascimento}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RG</label>
                                            <input type="text" value={data.rg} onChange={(e) => setData('rg', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sexo *</label>
                                            <select value={data.sexo} onChange={(e) => setData('sexo', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600" required>
                                                <option value="">Selecione...</option>
                                                <option value="Masculino">Masculino</option>
                                                <option value="Feminino">Feminino</option>
                                            </select>
                                            {errors.sexo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.sexo}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Peso (kg)</label>
                                            <input type="number" step="0.01" value={data.peso} onChange={(e) => setData('peso', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Altura (cm)</label>
                                            <input type="number" step="0.01" value={data.altura} onChange={(e) => setData('altura', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data do Exame *</label>
                                            <input type="date" value={data.data_exame} onChange={(e) => setData('data_exame', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600" required />
                                            {errors.data_exame && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.data_exame}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Clínica</label>
                                            <input type="text" value={data.clinica} onChange={(e) => setData('clinica', e.target.value.toUpperCase())} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 uppercase" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Solicitante</label>
                                            <input type="text" value={data.solicitante} onChange={(e) => setData('solicitante', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Equipe *</label>
                                            <select value={data.team_id} onChange={(e) => setData('team_id', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600" required>
                                                <option value="">Selecione uma equipe...</option>
                                                {teams.map((team) => (<option key={team.id} value={team.id}>{team.name}</option>))}
                                            </select>
                                            {errors.team_id && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.team_id}</div>}
                                        </div>
                                    </div>
                                </div>

                                <ScaleSection title="Parte A" perguntas={PARTE_A_PERGUNTAS} respostas={data.parte_a_respostas} onChange={updateResposta('parte_a_respostas')} colorFrom="from-indigo-500" colorTo="to-blue-600" />
                                <ScaleSection title="Parte B" perguntas={PARTE_B_PERGUNTAS} respostas={data.parte_b_respostas} onChange={updateResposta('parte_b_respostas')} colorFrom="from-blue-500" colorTo="to-cyan-600" />

                                <div className="mb-8 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6 flex flex-col sm:flex-row gap-6">
                                    <div>
                                        <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-1">Parte A — Total</p>
                                        <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{data.parte_a_total || 0} <span className="text-base font-medium text-indigo-600 dark:text-indigo-400">/ 36</span></p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-1">Parte B — Total</p>
                                        <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{data.parte_b_total || 0} <span className="text-base font-medium text-indigo-600 dark:text-indigo-400">/ 36</span></p>
                                    </div>
                                </div>

                                {/* Complementares */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CID</label>
                                            <input type="text" value={data.cid} onChange={(e) => setData('cid', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600" />
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OBS (Comentário)</label>
                                        <textarea value={data.comentario} onChange={(e) => setData('comentario', e.target.value)} rows={3} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600" />
                                    </div>
                                </div>

                                {/* Arquivos */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-teal-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Arquivos</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pedido Médico / Anexos</label>
                                            <AnexosUploader type="tdah-adulto" files={data.anexos} onFilesChange={(f) => setData('anexos', f)} />
                                            {errors.pedido_medico && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.pedido_medico}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assinatura do Paciente/Acompanhante</label>
                                            <SignaturePad onSignatureChange={(signature) => setData('assinatura_paciente', signature)} className="w-full" />
                                            {errors.assinatura_paciente && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.assinatura_paciente}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button type="button" onClick={() => window.history.back()} className="px-6 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200">Cancelar</button>
                                    <button type="submit" disabled={processing} className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 text-white rounded-lg hover:from-indigo-600 hover:to-blue-700 dark:hover:from-indigo-700 dark:hover:to-blue-800 transition-colors duration-200 disabled:opacity-50">{processing ? 'Salvando...' : 'Salvar Questionário'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
