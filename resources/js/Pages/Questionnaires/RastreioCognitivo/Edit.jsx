import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import SignaturePad from '@/Components/SignaturePad';
import AnexosUploader from '@/Components/AnexosUploader';
import BirthDateSelectInput from '@/Components/BirthDateSelectInput';
import { compressImage, formatFileSize, getCompressionRatio } from '@/Utils/imageCompression';
import leaoImg from '@/Assets/moca/leao.jpg';
import rinoceronteImg from '@/Assets/moca/rinoceronte.jpg';
import cameloImg from '@/Assets/moca/camelo.jpg';

const ScoreField = ({ label, field, max, help, value, onChange, errors }) => (
    <div className="flex flex-col h-full">
        <div className="mb-2 min-h-[5.5rem]">
            <label className="block text-base font-semibold text-gray-800 dark:text-gray-200">
                {label} <span className="text-gray-500 dark:text-gray-400 font-normal">(0-{max})</span>
            </label>
            {help && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{help}</p>}
        </div>
        <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value}
            onChange={(e) => {
                let digits = e.target.value.replace(/[^0-9]/g, '');
                if (digits !== '' && parseInt(digits, 10) > max) digits = String(max);
                onChange(field, digits);
            }}
            className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm text-lg font-semibold py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200"
        />
        {errors[field] && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors[field]}</div>}
    </div>
);

const APPLICATION_INSTRUCTIONS = [
    { title: 'Visoespacial / Executiva', text: "Unir alternadamente números e letras em ordem ascendente (1-A-2-B...). Desenhar o cubo tridimensional de forma proporcional. Desenhar o relógio redondo indicando exatamente 11:10 (1 ponto para contorno, 1 para números, 1 para ponteiros)." },
    { title: 'Nomeação', text: 'O paciente deve identificar corretamente os 3 animais da folha de estímulos oficiais (Leão, Rinoceronte, Camelo).' },
    { title: 'Memória (Registro)', text: 'Ler as 5 palavras a ritmo de 1 por segundo. Pedir para repetir imediatamente. Fazer duas tentativas. Não pontuar nesta fase.' },
    { title: 'Atenção', text: "Repetição de dígitos em ordem direta e inversa. Bater na mesa a cada letra 'A' dita pelo médico. Subtração seriada de 7 em 7 começando do 100." },
    { title: 'Linguagem', text: "Repetir exatamente duas frases complexas. Fluidez verbal: dizer mais de 11 palavras com a letra indicada (habitualmente 'F') em 1 minuto." },
    { title: 'Abstração', text: 'Encontrar semelhanças entre palavras parecidas (ex: Laranja/Banana = Frutas; Trem/Bicicleta = Meios de transporte).' },
    { title: 'Evocação Tardia', text: 'Pedir para lembrar as 5 palavras do início sem nenhuma pista (1 ponto por palavra espontânea).' },
];

const InstructionCard = ({ title, text }) => (
    <div className="bg-white dark:bg-gray-800 border-l-4 border-teal-500 dark:border-teal-400 border-y border-r border-gray-200 dark:border-gray-600 rounded-lg shadow-sm p-4">
        <p className="text-sm font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide mb-1">{title}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{text}</p>
    </div>
);

const NamingStimuli = () => (
    <div className="mt-4 grid grid-cols-3 gap-4 max-w-2xl">
        {[leaoImg, rinoceronteImg, cameloImg].map((img, i) => (
            <img
                key={i}
                src={img}
                alt={`Estímulo de nomeação ${i + 1}`}
                className="w-full h-32 sm:h-40 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg hover:border-teal-400 dark:hover:border-teal-500"
            />
        ))}
    </div>
);

export default function Edit({ auth, teams, questionnaire }) {
    const { data, setData, put, processing, errors } = useForm({
        nome_completo: questionnaire.nome_completo || '',
        rg_ou_cpf: questionnaire.rg_ou_cpf || '',
        data_nascimento: questionnaire.data_nascimento || '',
        sexo: questionnaire.sexo || '',
        data_exame: questionnaire.data_exame || '',
        team_id: questionnaire.team_id || '',
        pontuacao_visoespacial: questionnaire.pontuacao_visoespacial ?? '',
        pontuacao_nomeacao: questionnaire.pontuacao_nomeacao ?? '',
        pontuacao_atencao: questionnaire.pontuacao_atencao ?? '',
        pontuacao_linguagem: questionnaire.pontuacao_linguagem ?? '',
        pontuacao_abstracao: questionnaire.pontuacao_abstracao ?? '',
        pontuacao_evocacao_tardia: questionnaire.pontuacao_evocacao_tardia ?? '',
        pontuacao_orientacao: questionnaire.pontuacao_orientacao ?? '',
        ajuste_escolaridade: questionnaire.ajuste_escolaridade || false,
        pontuacao_total: questionnaire.pontuacao_total ?? '',
        nome_avaliador: questionnaire.nome_avaliador || '',
        cid: questionnaire.cid || '',
        comentario: questionnaire.comentario || '',
        assinatura_paciente: questionnaire.assinatura_paciente || null,
        pedido_medico: null,
        anexos: [],
        _method: 'put',
    });

    const [idadeCalculada, setIdadeCalculada] = useState(null);
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [pedidoMedicoPreview, setPedidoMedicoPreview] = useState(null);
    const [imageCompressionInfo, setImageCompressionInfo] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);

    useEffect(() => {
        setIsMobileDevice(/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }, []);

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
        const scoreFields = [
            'pontuacao_visoespacial',
            'pontuacao_nomeacao',
            'pontuacao_atencao',
            'pontuacao_linguagem',
            'pontuacao_abstracao',
            'pontuacao_evocacao_tardia',
            'pontuacao_orientacao',
        ];
        const sum = scoreFields.reduce((acc, field) => acc + (parseInt(data[field]) || 0), 0);
        const total = sum + (data.ajuste_escolaridade ? 1 : 0);
        if (String(total) !== String(data.pontuacao_total)) {
            setData('pontuacao_total', total);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        data.pontuacao_visoespacial,
        data.pontuacao_nomeacao,
        data.pontuacao_atencao,
        data.pontuacao_linguagem,
        data.pontuacao_abstracao,
        data.pontuacao_evocacao_tardia,
        data.pontuacao_orientacao,
        data.ajuste_escolaridade,
    ]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (data.anexos.length > 0) {
            router.post(route('questionnaires.rastreio-cognitivo.update', questionnaire.id), { ...data, _method: 'PUT' }, {
                forceFormData: true,
                preserveScroll: true,
            });
        } else {
            put(route('questionnaires.rastreio-cognitivo.update', questionnaire.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">Editar Questionário</h2>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Rastreio Cognitivo (MoCA)</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Editar Questionário - Rastreio Cognitivo" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 dark:from-teal-600 dark:to-cyan-700 px-6 py-4">
                            <div className="flex items-center">
                                <svg className="w-8 h-8 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Editar Rastreio Cognitivo</h3>
                                    <p className="text-sm text-teal-100">MoCA - Folha de Pontuação Rápida</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <form onSubmit={handleSubmit} encType="multipart/form-data">
                                {/* Dados básicos */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-cyan-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dados Básicos</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Paciente *</label>
                                            <input type="text" value={data.nome_completo} onChange={(e) => setData('nome_completo', e.target.value.toUpperCase())} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 uppercase" required />
                                            {errors.nome_completo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.nome_completo}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RG ou CPF *</label>
                                            <input type="text" value={data.rg_ou_cpf} onChange={(e) => setData('rg_ou_cpf', e.target.value.toUpperCase())} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 uppercase" required />
                                            {errors.rg_ou_cpf && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.rg_ou_cpf}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Nascimento *</label>
                                            <BirthDateSelectInput value={data.data_nascimento} onChange={(value) => setData('data_nascimento', value)} required={true} />
                                            {idadeCalculada !== null && (<div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Idade: {idadeCalculada}</div>)}
                                            {errors.data_nascimento && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.data_nascimento}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sexo *</label>
                                            <select value={data.sexo} onChange={(e) => setData('sexo', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" required>
                                                <option value="">Selecione...</option>
                                                <option value="Masculino">Masculino</option>
                                                <option value="Feminino">Feminino</option>
                                            </select>
                                            {errors.sexo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.sexo}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data do Exame *</label>
                                            <input type="date" value={data.data_exame} onChange={(e) => setData('data_exame', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" required />
                                            {errors.data_exame && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.data_exame}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Equipe *</label>
                                            <select value={data.team_id} onChange={(e) => setData('team_id', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" required>
                                                <option value="">Selecione uma equipe...</option>
                                                {teams.map((team) => (<option key={team.id} value={team.id}>{team.name}</option>))}
                                            </select>
                                            {errors.team_id && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.team_id}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Instruções de Aplicação */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-cyan-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Instruções de Aplicação em Tempo Real</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {APPLICATION_INSTRUCTIONS.map((item) => (
                                            <InstructionCard key={item.title} title={item.title} text={item.text} />
                                        ))}
                                    </div>
                                </div>

                                {/* Folha de Pontuação Rápida */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex items-center mb-6">
                                        <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Folha de Pontuação Rápida</h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                                        <ScoreField label="Visoespacial / Executiva" field="pontuacao_visoespacial" max={5} help="Alternância (1pt), Cubo (1pt), Relógio (3pts - Círculo, Números, Ponteiros)" value={data.pontuacao_visoespacial} onChange={setData} errors={errors} />
                                        <ScoreField label="Atenção" field="pontuacao_atencao" max={6} help="Dígitos (2pts), Vigilância/Letra A (1pt), Subtração de 7 em 7 (3pts)" value={data.pontuacao_atencao} onChange={setData} errors={errors} />
                                        <ScoreField label="Linguagem" field="pontuacao_linguagem" max={3} help="Repetição de frases (2pts), Fluidez verbal/Letra F > 11 palavras (1pt)" value={data.pontuacao_linguagem} onChange={setData} errors={errors} />
                                        <ScoreField label="Abstração" field="pontuacao_abstracao" max={2} help="Semelhança entre objetos (2 pontos no total)" value={data.pontuacao_abstracao} onChange={setData} errors={errors} />
                                        <ScoreField label="Evocação Tardia" field="pontuacao_evocacao_tardia" max={5} help="Recordação das 5 palavras de forma espontânea (1 ponto cada)" value={data.pontuacao_evocacao_tardia} onChange={setData} errors={errors} />
                                        <ScoreField label="Orientação" field="pontuacao_orientacao" max={6} help="Tempo: Dia, Mês, Ano, Dia da semana. Espaço: Lugar, Cidade (1pt cada)" value={data.pontuacao_orientacao} onChange={setData} errors={errors} />
                                    </div>

                                    {/* Nomeação com estímulos visuais */}
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                                        <div className="max-w-md">
                                            <ScoreField label="Nomeação" field="pontuacao_nomeacao" max={3} help="1 ponto por animal correto" value={data.pontuacao_nomeacao} onChange={setData} errors={errors} />
                                        </div>
                                        <NamingStimuli />
                                    </div>

                                    {/* Resultado da avaliação */}
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Resultado da Avaliação</h4>
                                        {/* Card destacado: pontuação total + ajuste de escolaridade */}
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-6 mb-6">
                                            <div className="text-center sm:text-left">
                                                <p className="text-sm font-semibold text-teal-700 dark:text-teal-300 uppercase tracking-wide mb-1">Pontuação Total</p>
                                                <p className="text-4xl font-bold text-teal-700 dark:text-teal-300">
                                                    {data.pontuacao_total || 0}<span className="text-lg font-medium text-teal-600 dark:text-teal-400"> / 30</span>
                                                </p>
                                            </div>
                                            <div className="hidden sm:block w-px h-14 bg-teal-200 dark:bg-teal-700"></div>
                                            <label className="flex items-center cursor-pointer text-base text-gray-800 dark:text-gray-200 justify-center sm:justify-start">
                                                <input
                                                    type="checkbox"
                                                    checked={data.ajuste_escolaridade}
                                                    onChange={(e) => setData('ajuste_escolaridade', e.target.checked)}
                                                    className="mr-3 w-5 h-5 text-indigo-600 dark:text-indigo-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600"
                                                />
                                                Ajuste de escolaridade: +1 ponto (≤12 anos de estudo formal)
                                            </label>
                                        </div>

                                        {/* Identificação do avaliador */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">Nome do Avaliador</label>
                                                <input type="text" value={data.nome_avaliador} onChange={(e) => setData('nome_avaliador', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm text-base py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" />
                                                {errors.nome_avaliador && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.nome_avaliador}</div>}
                                            </div>

                                            <div>
                                                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">CID</label>
                                                <input type="text" value={data.cid} onChange={(e) => setData('cid', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm text-base py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" />
                                                {errors.cid && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.cid}</div>}
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">Comentário</label>
                                            <textarea value={data.comentario} onChange={(e) => setData('comentario', e.target.value)} rows={3} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm text-base py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" />
                                            {errors.comentario && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.comentario}</div>}
                                        </div>
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
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pedido Médico</label>
                                            {questionnaire.pedido_medico && !pedidoMedicoPreview && (
                                                <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">Arquivo atual: mantido salvo se nenhum novo for selecionado.</div>
                                            )}
                                            <AnexosUploader type="rastreio-cognitivo" id={questionnaire.id} files={data.anexos} onFilesChange={(f) => setData('anexos', f)} existing={questionnaire.attachments || []} />
                                            {errors.pedido_medico && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.pedido_medico}</div>}
                                            {isCompressing && (<div className="mt-2 text-sm text-blue-600 dark:text-blue-400">🔄 Comprimindo imagen...</div>)}
                                            {imageCompressionInfo && (<div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm"><div className="text-green-800 dark:text-green-300">✅ Imagen comprimida exitosamente</div><div className="text-green-700 dark:text-green-400 mt-1">Tamaño original: {imageCompressionInfo.originalSize} → Comprimido: {imageCompressionInfo.compressedSize} ({imageCompressionInfo.compressionRatio}% reducción)</div></div>)}
                                            {pedidoMedicoPreview && (<div className="mt-3"><p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pré-visualização:</p><div className="relative"><img src={pedidoMedicoPreview} alt="Pré-visualização do pedido médico" className="max-w-full h-auto max-h-64 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-gray-900/50" /><button type="button" onClick={() => {setPedidoMedicoPreview(null); setData('pedido_medico', null); setImageCompressionInfo(null); const fileInput = document.querySelector('input[type="file"][accept="image/*"]'); if (fileInput) fileInput.value = '';}} className="absolute top-2 right-2 bg-red-500 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors duration-200" title="Excluir imagem">×</button></div></div>)}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assinatura do Avaliador</label>
                                            <SignaturePad initialSignature={questionnaire.assinatura_paciente} onSignatureChange={(signature) => setData('assinatura_paciente', signature)} className="w-full" />
                                            {errors.assinatura_paciente && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.assinatura_paciente}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Botões */}
                                <div className="flex justify-end space-x-3">
                                    <button type="button" onClick={() => window.history.back()} className="px-6 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200">Cancelar</button>
                                    <button type="submit" disabled={processing} className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 dark:from-teal-600 dark:to-cyan-700 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 dark:hover:from-teal-700 dark:hover:to-cyan-800 transition-colors duration-200 disabled:opacity-50">{processing ? 'Salvando...' : 'Salvar Alterações'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
