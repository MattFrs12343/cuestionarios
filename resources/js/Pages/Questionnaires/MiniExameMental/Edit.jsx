import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import SignaturePad from '@/Components/SignaturePad';
import AnexosUploader from '@/Components/AnexosUploader';
import BirthDateSelectInput from '@/Components/BirthDateSelectInput';
import { upperAll } from '@/Utils/uppercase';

const ScoreField = ({ label, field, max, help, value, onChange, errors, drawing }) => (
    <div className="flex flex-col h-full">
        <div className="mb-2 min-h-[5.5rem]">
            <label className="block text-base font-semibold text-gray-800 dark:text-zinc-200">
                {label} <span className="text-gray-500 dark:text-zinc-400 font-normal">(0-{max})</span>
            </label>
            {help && <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{help}</p>}
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
            className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-lg shadow-sm text-lg font-semibold py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200"
        />
        {errors[field] && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors[field]}</div>}
        {drawing && (
            <div className="mt-3">
                <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">Desenho do paciente</label>
                <SignaturePad initialSignature={drawing.value} onSignatureChange={drawing.onChange} title={drawing.title} className="w-full" />
            </div>
        )}
    </div>
);

const APPLICATION_INSTRUCTIONS = [
    { title: 'Orientação', text: 'Perguntar: ano, estação, dia da semana, dia do mês e mês (5pts). Perguntar: país, estado, cidade, rua ou local e nº ou andar (5pts).' },
    { title: 'Registro', text: 'Dizer três palavras: PENTE, RUA, AZUL. Pedir para prestar atenção, pois terá que repetir mais tarde. Perguntar pelas três palavras após tê-las nomeado, repetindo até 5 vezes até evocar corretamente (3 pontos - 1 por palavra).' },
    { title: 'Atenção e Cálculo', text: 'Subtrair: 100-7 (5 tentativas: 93-86-79-72-65). Alternativo: série de 7 dígitos (5-8-2-6-9-4-1). 5 pontos.' },
    { title: 'Evocação', text: 'Perguntar pelas 3 palavras anteriores (PENTE-RUA-AZUL), sem pistas (3 pontos).' },
    { title: 'Linguagem', text: 'Identificar lápis e relógio de pulso, sem estar no pulso (2pts). Repetir "Nem aqui, nem ali, nem lá" (1pt). Comando de 3 estágios: pegue o papel com a mão direita, dobre ao meio e ponha no chão, falado de forma inteira e apenas uma vez (3pts). Ler só com os olhos e executar "FECHE OS OLHOS" (1pt). Escrever uma frase com um pensamento/ideia completa (1pt).' },
    { title: 'Cópia do Desenho', text: 'Copiar o desenho de dois pentágonos que se interceptam (1 ponto).' },
];

const InstructionCard = ({ title, text }) => (
    <div className="bg-white dark:bg-zinc-700 border-l-4 border-sky-500 dark:border-sky-400 border-y border-r border-gray-200 dark:border-zinc-500 rounded-lg shadow-sm p-4">
        <p className="text-sm font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wide mb-1">{title}</p>
        <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">{text}</p>
    </div>
);

export default function Edit({ auth, questionnaire }) {
    const { data, setData, put, processing, errors, transform } = useForm({
        nome_completo: questionnaire.nome_completo || '',
        rg_ou_cpf: questionnaire.rg_ou_cpf || '',
        data_nascimento: questionnaire.data_nascimento?.slice(0, 10) || '',
        sexo: questionnaire.sexo || '',
        clinica: questionnaire.clinica || '',
        data_exame: questionnaire.data_exame?.slice(0, 10) || '',
        escolaridade: questionnaire.escolaridade || '',
        pontuacao_orientacao_temporal: questionnaire.pontuacao_orientacao_temporal ?? '',
        pontuacao_orientacao_espacial: questionnaire.pontuacao_orientacao_espacial ?? '',
        pontuacao_registro: questionnaire.pontuacao_registro ?? '',
        pontuacao_atencao_calculo: questionnaire.pontuacao_atencao_calculo ?? '',
        pontuacao_evocacao: questionnaire.pontuacao_evocacao ?? '',
        pontuacao_linguagem: questionnaire.pontuacao_linguagem ?? '',
        pontuacao_desenho: questionnaire.pontuacao_desenho ?? '',
        desenho_copia: questionnaire.desenho_copia || null,
        pontuacao_total: questionnaire.pontuacao_total ?? '',
        nome_avaliador: questionnaire.nome_avaliador || '',
        cid: questionnaire.cid || '',
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

    useEffect(() => {
        const scoreFields = [
            'pontuacao_orientacao_temporal',
            'pontuacao_orientacao_espacial',
            'pontuacao_registro',
            'pontuacao_atencao_calculo',
            'pontuacao_evocacao',
            'pontuacao_linguagem',
            'pontuacao_desenho',
        ];
        const total = scoreFields.reduce((acc, field) => acc + (parseInt(data[field]) || 0), 0);
        if (String(total) !== String(data.pontuacao_total)) {
            setData('pontuacao_total', total);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        data.pontuacao_orientacao_temporal,
        data.pontuacao_orientacao_espacial,
        data.pontuacao_registro,
        data.pontuacao_atencao_calculo,
        data.pontuacao_evocacao,
        data.pontuacao_linguagem,
        data.pontuacao_desenho,
    ]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (data.anexos.length > 0) {
            put(route('questionnaires.mini-exame-mental.update', questionnaire.id), {
                forceFormData: true,
                preserveScroll: true,
            });
        } else {
            put(route('questionnaires.mini-exame-mental.update', questionnaire.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-gray-800 dark:text-zinc-200 leading-tight">Editar Questionário</h2>
                            <p className="text-xs text-gray-600 dark:text-zinc-400">Mini Exame do Estado Mental (MEEM)</p>
                        </div>
                    </div>
                    <Link
                        href={route('questionnaires.mini-exame-mental.index')}
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
            <Head title="Editar Questionário - Mini Exame do Estado Mental" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-zinc-700 overflow-hidden shadow-xl dark:shadow-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-600 transition-colors duration-200">
                        <div className="bg-gradient-to-r from-sky-500 to-blue-600 dark:from-sky-600 dark:to-blue-700 px-6 py-4">
                            <div className="flex items-center">
                                <svg className="w-8 h-8 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Editar Mini Exame do Estado Mental</h3>
                                    <p className="text-sm text-sky-100">MEEM - Folha de Pontuação</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 text-gray-900 dark:text-zinc-100">
                            <form onSubmit={handleSubmit} encType="multipart/form-data">
                                {/* Dados básicos */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-sky-500 to-blue-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Dados Básicos</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Nome do Paciente *</label>
                                            <input type="text" value={data.nome_completo} onChange={(e) => setData('nome_completo', e.target.value.toUpperCase())} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 uppercase" required />
                                            {errors.nome_completo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.nome_completo}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">RG ou CPF *</label>
                                            <input type="text" value={data.rg_ou_cpf} onChange={(e) => setData('rg_ou_cpf', e.target.value.toUpperCase())} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 uppercase" required />
                                            {errors.rg_ou_cpf && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.rg_ou_cpf}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Data de Nascimento *</label>
                                            <BirthDateSelectInput value={data.data_nascimento} onChange={(value) => setData('data_nascimento', value)} required={true} />
                                            {idadeCalculada !== null && (<div className="text-sm text-gray-600 dark:text-zinc-400 mt-1">Idade: {idadeCalculada}</div>)}
                                            {errors.data_nascimento && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.data_nascimento}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Sexo *</label>
                                            <select value={data.sexo} onChange={(e) => setData('sexo', e.target.value)} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" required>
                                                <option value="">Selecione...</option>
                                                <option value="Masculino">Masculino</option>
                                                <option value="Feminino">Feminino</option>
                                            </select>
                                            {errors.sexo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.sexo}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Data do Exame *</label>
                                            <input type="date" value={data.data_exame} onChange={(e) => setData('data_exame', e.target.value)} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" required />
                                            {errors.data_exame && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.data_exame}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Clínica</label>
                                            <input type="text" value={data.clinica} onChange={(e) => setData('clinica', e.target.value.toUpperCase())} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 uppercase" />
                                            {errors.clinica && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.clinica}</div>}
                                        </div>


                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Escolaridade</label>
                                            <input type="text" value={data.escolaridade} onChange={(e) => setData('escolaridade', e.target.value)} placeholder="Ex: 4 anos" className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" />
                                            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Ex: levou 10 anos para concluir a 4ª série, considera-se escolaridade de 4 anos.</p>
                                            {errors.escolaridade && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.escolaridade}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Instruções de Aplicação */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-sky-500 to-blue-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Instruções de Aplicação em Tempo Real</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {APPLICATION_INSTRUCTIONS.map((item) => (
                                            <InstructionCard key={item.title} title={item.title} text={item.text} />
                                        ))}
                                    </div>
                                </div>

                                {/* Folha de Pontuação */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                    <div className="flex items-center mb-6">
                                        <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Folha de Pontuação</h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                                        <ScoreField label="Orientação Temporal" field="pontuacao_orientacao_temporal" max={5} help="Ano, estação, mês, dia do mês, dia da semana (1pt cada)" value={data.pontuacao_orientacao_temporal} onChange={setData} errors={errors} />
                                        <ScoreField label="Orientação Espacial" field="pontuacao_orientacao_espacial" max={5} help="Estado, cidade, bairro, local, andar/setor (1pt cada)" value={data.pontuacao_orientacao_espacial} onChange={setData} errors={errors} />
                                        <ScoreField label="Registro" field="pontuacao_registro" max={3} help="Repetição imediata de 3 palavras (1pt cada)" value={data.pontuacao_registro} onChange={setData} errors={errors} />
                                        <ScoreField label="Atenção e Cálculo" field="pontuacao_atencao_calculo" max={5} help="Subtração seriada de 7 ou soletrar MUNDO ao contrário" value={data.pontuacao_atencao_calculo} onChange={setData} errors={errors} />
                                        <ScoreField label="Evocação" field="pontuacao_evocacao" max={3} help="Recordação das 3 palavras sem pistas (1pt cada)" value={data.pontuacao_evocacao} onChange={setData} errors={errors} />
                                        <ScoreField label="Linguagem" field="pontuacao_linguagem" max={8} help="Nomeação (2), repetição (1), comando (3), leitura (1), escrita (1)" value={data.pontuacao_linguagem} onChange={setData} errors={errors} />
                                        <ScoreField label="Cópia do Desenho" field="pontuacao_desenho" max={1} help="Cópia dos dois pentágonos que se interceptam" value={data.pontuacao_desenho} onChange={setData} errors={errors} drawing={{ title: 'Cópia do Desenho', value: data.desenho_copia, onChange: (signature) => setData('desenho_copia', signature) }} />
                                    </div>

                                    {/* Resultado da avaliação */}
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-500">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-4">Resultado da Avaliação</h4>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-xl p-6 mb-6">
                                            <div className="text-center sm:text-left">
                                                <p className="text-sm font-semibold text-sky-700 dark:text-sky-300 uppercase tracking-wide mb-1">Pontuação Total</p>
                                                <p className="text-4xl font-bold text-sky-700 dark:text-sky-300">
                                                    {data.pontuacao_total || 0}<span className="text-lg font-medium text-sky-600 dark:text-sky-400"> / 30</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Identificação do avaliador */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-base font-semibold text-gray-800 dark:text-zinc-200 mb-1">Nome do Avaliador</label>
                                                <input type="text" value={data.nome_avaliador} onChange={(e) => setData('nome_avaliador', e.target.value)} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-lg shadow-sm text-base py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" />
                                                {errors.nome_avaliador && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.nome_avaliador}</div>}
                                            </div>

                                            <div>
                                                <label className="block text-base font-semibold text-gray-800 dark:text-zinc-200 mb-1">CID</label>
                                                <input type="text" value={data.cid} onChange={(e) => setData('cid', e.target.value)} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-lg shadow-sm text-base py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" />
                                                {errors.cid && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.cid}</div>}
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <label className="block text-base font-semibold text-gray-800 dark:text-zinc-200 mb-1">Comentário</label>
                                            <textarea value={data.comentario} onChange={(e) => setData('comentario', e.target.value)} rows={3} className="w-full border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-lg shadow-sm text-base py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" />
                                            {errors.comentario && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.comentario}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Arquivos */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-sky-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Arquivos</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Pedido Médico</label>
                                            {questionnaire.pedido_medico && (
                                                <div className="mb-2 text-sm text-gray-600 dark:text-zinc-400">Arquivo atual: mantido salvo se nenhum novo for selecionado.</div>
                                            )}
                                            <AnexosUploader type="mini-exame-mental" id={questionnaire.id} files={data.anexos} onFilesChange={(f) => setData('anexos', f)} existing={questionnaire.attachments || []} />
                                            {errors.pedido_medico && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.pedido_medico}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Assinatura do Avaliador</label>
                                            <SignaturePad initialSignature={questionnaire.assinatura_paciente} onSignatureChange={(signature) => setData('assinatura_paciente', signature)} className="w-full" />
                                            {errors.assinatura_paciente && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.assinatura_paciente}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Botões */}
                                <div className="flex justify-end space-x-3">
                                    <button type="button" onClick={() => window.history.back()} className="px-6 py-2 bg-gray-500 dark:bg-zinc-500 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-zinc-600 transition-colors duration-200">Cancelar</button>
                                    <button type="submit" disabled={processing} className="px-6 py-2 bg-gradient-to-r from-sky-500 to-blue-600 dark:from-sky-600 dark:to-blue-700 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 dark:hover:from-sky-700 dark:hover:to-blue-800 transition-colors duration-200 disabled:opacity-50">{processing ? 'Salvando...' : 'Salvar Alterações'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
