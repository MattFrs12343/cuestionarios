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

const PARTE_1_PERGUNTAS = [
    'A criança costuma errar atividades porque não presta atenção nos detalhes?',
    'Tem dificuldade para manter a atenção em tarefas, brincadeiras ou outras atividades?',
    'Parece não escutar quando alguém fala diretamente com ela?',
    'Começa uma tarefa, mas não consegue terminar ou não segue as instruções até o fim?',
    'Tem dificuldade para organizar os materiais ou a rotina?',
    'Evita ou reclama quando precisa fazer atividades que exigem pensar ou se concentrar por muito tempo (como lição de casa ou leitura)?',
    'Perde ou esquece onde colocou objetos importantes, como caderno, brinquedos ou lápis?',
    'Se distrai facilmente com barulhos, pessoas ou qualquer coisa ao redor?',
    'Esquece compromissos, recados ou tarefas do dia a dia?',
];

const PARTE_2_PERGUNTAS = [
    'Mexe muito as mãos, os pés ou fica inquieta quando está sentada?',
    'Levanta da cadeira quando deveria permanecer sentada (na escola, em casa ou em outros lugares)?',
    'Corre, sobe em móveis ou se movimenta demais em momentos em que deveria ficar calma?',
    'Tem dificuldade para brincar ou fazer atividades tranquilas?',
    'Parece estar sempre agitada, como se estivesse "ligada no máximo" ou "a mil por hora"?',
    'Fala mais do que o esperado?',
    'Responde antes da pergunta terminar ou interrompe a resposta dos outros?',
    'Tem dificuldade para esperar sua vez em filas, jogos ou conversas?',
    'Costuma interromper conversas, brincadeiras ou se intrometer nas atividades dos outros?',
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
                            <label key={opt.value} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs cursor-pointer transition-colors ${respostas[idx] === opt.value ? 'bg-pink-500 border-pink-500 text-white' : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}>
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
        rg_ou_cpf: '',
        peso: '',
        altura: '',
        sexo: '',
        solicitante: '',
        team_id: '',
        parte_1_respostas: Array(9).fill(null),
        parte_1_total: '',
        parte_2_respostas: Array(9).fill(null),
        parte_2_total: '',
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
        const total = data.parte_1_respostas.reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0);
        if (String(total) !== String(data.parte_1_total)) setData('parte_1_total', total);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.parte_1_respostas]);

    useEffect(() => {
        const total = data.parte_2_respostas.reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0);
        if (String(total) !== String(data.parte_2_total)) setData('parte_2_total', total);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.parte_2_respostas]);

    const updateResposta = (field) => (idx, value) => {
        const updated = [...data[field]];
        updated[idx] = value;
        setData(field, updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('questionnaires.tdah-infantil.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">Novo Questionário</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">TDAH Infantil - SNAP-IV</p>
                    </div>
                </div>
            }
        >
            <Head title="Novo Questionário - TDAH Infantil" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <div className="bg-gradient-to-r from-pink-500 to-fuchsia-600 dark:from-pink-600 dark:to-fuchsia-700 px-6 py-4">
                            <h3 className="text-xl font-bold text-white">Questionário SNAP-IV — Escala de Autoavaliação para TDAH em Crianças</h3>
                        </div>

                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <form onSubmit={handleSubmit} encType="multipart/form-data">
                                {/* Dados básicos */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-fuchsia-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dados Básicos</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
                                            <input type="text" value={data.nome_completo} onChange={(e) => setData('nome_completo', e.target.value.toUpperCase())} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-pink-500 dark:focus:ring-pink-600 focus:border-pink-500 dark:focus:border-pink-600 uppercase" required />
                                            {errors.nome_completo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.nome_completo}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Nascimento *</label>
                                            <BirthDateSelectInput value={data.data_nascimento} onChange={(value) => setData('data_nascimento', value)} required={true} />
                                            {idadeCalculada !== null && (<div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Idade: {idadeCalculada}</div>)}
                                            {errors.data_nascimento && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.data_nascimento}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RG/CPF</label>
                                            <input type="text" value={data.rg_ou_cpf} onChange={(e) => setData('rg_ou_cpf', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-pink-500 dark:focus:ring-pink-600 focus:border-pink-500 dark:focus:border-pink-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sexo *</label>
                                            <select value={data.sexo} onChange={(e) => setData('sexo', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-pink-500 dark:focus:ring-pink-600 focus:border-pink-500 dark:focus:border-pink-600" required>
                                                <option value="">Selecione...</option>
                                                <option value="Masculino">Masculino</option>
                                                <option value="Feminino">Feminino</option>
                                            </select>
                                            {errors.sexo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.sexo}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Peso (kg)</label>
                                            <input type="number" step="0.01" value={data.peso} onChange={(e) => setData('peso', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-pink-500 dark:focus:ring-pink-600 focus:border-pink-500 dark:focus:border-pink-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Altura (cm)</label>
                                            <input type="number" step="0.01" value={data.altura} onChange={(e) => setData('altura', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-pink-500 dark:focus:ring-pink-600 focus:border-pink-500 dark:focus:border-pink-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data do Exame *</label>
                                            <input type="date" value={data.data_exame} onChange={(e) => setData('data_exame', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-pink-500 dark:focus:ring-pink-600 focus:border-pink-500 dark:focus:border-pink-600" required />
                                            {errors.data_exame && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.data_exame}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Clínica</label>
                                            <input type="text" value={data.clinica} onChange={(e) => setData('clinica', e.target.value.toUpperCase())} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-pink-500 dark:focus:ring-pink-600 focus:border-pink-500 dark:focus:border-pink-600 uppercase" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Solicitante</label>
                                            <input type="text" value={data.solicitante} onChange={(e) => setData('solicitante', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-pink-500 dark:focus:ring-pink-600 focus:border-pink-500 dark:focus:border-pink-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Equipe *</label>
                                            <select value={data.team_id} onChange={(e) => setData('team_id', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-pink-500 dark:focus:ring-pink-600 focus:border-pink-500 dark:focus:border-pink-600" required>
                                                <option value="">Selecione uma equipe...</option>
                                                {teams.map((team) => (<option key={team.id} value={team.id}>{team.name}</option>))}
                                            </select>
                                            {errors.team_id && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.team_id}</div>}
                                        </div>
                                    </div>
                                </div>

                                <ScaleSection title="Parte I — Desatenção" perguntas={PARTE_1_PERGUNTAS} respostas={data.parte_1_respostas} onChange={updateResposta('parte_1_respostas')} colorFrom="from-pink-500" colorTo="to-fuchsia-600" />
                                <ScaleSection title="Parte II — Hiperatividade/Impulsividade" perguntas={PARTE_2_PERGUNTAS} respostas={data.parte_2_respostas} onChange={updateResposta('parte_2_respostas')} colorFrom="from-fuchsia-500" colorTo="to-purple-600" />

                                <div className="mb-8 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl p-6 flex flex-col sm:flex-row gap-6">
                                    <div>
                                        <p className="text-sm font-semibold text-pink-700 dark:text-pink-300 uppercase tracking-wide mb-1">Parte I — Total</p>
                                        <p className="text-3xl font-bold text-pink-700 dark:text-pink-300">{data.parte_1_total || 0} <span className="text-base font-medium text-pink-600 dark:text-pink-400">/ 36</span></p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-pink-700 dark:text-pink-300 uppercase tracking-wide mb-1">Parte II — Total</p>
                                        <p className="text-3xl font-bold text-pink-700 dark:text-pink-300">{data.parte_2_total || 0} <span className="text-base font-medium text-pink-600 dark:text-pink-400">/ 36</span></p>
                                    </div>
                                </div>

                                {/* Complementares */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CID</label>
                                            <input type="text" value={data.cid} onChange={(e) => setData('cid', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-pink-500 dark:focus:ring-pink-600 focus:border-pink-500 dark:focus:border-pink-600" />
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comentário</label>
                                        <textarea value={data.comentario} onChange={(e) => setData('comentario', e.target.value)} rows={3} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-pink-500 dark:focus:ring-pink-600 focus:border-pink-500 dark:focus:border-pink-600" />
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
                                            <AnexosUploader type="tdah-infantil" files={data.anexos} onFilesChange={(f) => setData('anexos', f)} />
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
                                    <button type="submit" disabled={processing} className="px-6 py-2 bg-gradient-to-r from-pink-500 to-fuchsia-600 dark:from-pink-600 dark:to-fuchsia-700 text-white rounded-lg hover:from-pink-600 hover:to-fuchsia-700 dark:hover:from-pink-700 dark:hover:to-fuchsia-800 transition-colors duration-200 disabled:opacity-50">{processing ? 'Salvando...' : 'Salvar Questionário'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
