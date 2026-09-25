import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AnexosUploader from '@/Components/AnexosUploader';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { formatDateShort } from '@/Utils/dateFormatter';
import ImageZoomModal from '@/Components/ImageZoomModal';

const PARTE_A_PERGUNTAS = [
    'Comete erros por falta de atenção em projetos chatos ou difíceis',
    'Dificuldade para manter a atenção em trabalho chato ou repetitivo',
    'Dificuldade para se concentrar no que as pessoas dizem',
    'Deixa um projeto pela metade depois de já ter feito as partes mais difíceis',
    'Dificuldade de fazer um trabalho que exige organização',
    'Evita ou adia o início de tarefas que exigem muita concentração',
    'Coloca as coisas fora do lugar ou tem dificuldade de encontrá-las',
    'Se distrai com atividades ou barulho ao redor',
    'Dificuldade para lembrar de compromissos ou obrigações',
];

const PARTE_B_PERGUNTAS = [
    'Fica se mexendo na cadeira quando precisa ficar sentado(a) por muito tempo',
    'Se levanta da cadeira em situações onde deveria ficar sentado(a)',
    'Se sente inquieto(a) ou agitado(a)',
    'Dificuldade para sossegar e relaxar no tempo livre',
    'Se sente ativo(a) demais, "com um motor ligado"',
    'Fala demais em situações sociais',
    'Termina as frases das pessoas antes delas',
    'Dificuldade para esperar sua vez',
    'Interrompe os outros quando estão ocupados',
];

const RespostasList = ({ title, perguntas, respostas }) => (
    <div>
        <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h4>
        <ul className="space-y-1 text-sm">
            {perguntas.map((p, idx) => (
                <li key={idx} className="flex justify-between border-b border-gray-100 dark:border-gray-700 py-1">
                    <span className="text-gray-700 dark:text-gray-300">{idx + 1}. {p}</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex-shrink-0 ml-3">{(respostas && respostas[idx]) ?? '-'}</span>
                </li>
            ))}
        </ul>
    </div>
);

export default function Show({ auth, questionnaire, can }) {
    const [zoomSignature, setZoomSignature] = useState(false);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">Visualizar Questionário</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">TDAH Adulto - ASRS-18</p>
                    </div>
                </div>
            }
        >
            <Head title="Visualizar Questionário - TDAH Adulto" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 px-6 py-6">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{questionnaire.nome_completo}</h3>
                                    <p className="text-sm text-indigo-100 mt-1">Idade: {questionnaire.idade}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={route('questionnaires.tdah-adulto.index')} className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg shadow-md transition-all duration-200">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                        Voltar
                                    </Link>
                                    {can.edit && (
                                        <Link href={route('questionnaires.tdah-adulto.edit', questionnaire.id)} className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-100 text-indigo-600 font-semibold rounded-lg shadow-md transition-all duration-200">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            Editar
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 text-gray-900 dark:text-gray-100 space-y-8">
                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Dados Básicos</h4>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><dt className="text-gray-500 dark:text-gray-400">Data de Nascimento</dt><dd className="text-gray-900 dark:text-gray-100">{formatDateShort(questionnaire.data_nascimento)}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">RG</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.rg || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Sexo</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.sexo}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Peso / Altura</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.peso ?? '-'} kg / {questionnaire.altura ?? '-'} cm</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Clínica</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.clinica || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Data do Exame</dt><dd className="text-gray-900 dark:text-gray-100">{formatDateShort(questionnaire.data_exame)}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Solicitante</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.solicitante || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Equipe</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.team?.name}</dd></div>
                                </dl>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm space-y-6">
                                <RespostasList title="Parte A" perguntas={PARTE_A_PERGUNTAS} respostas={questionnaire.parte_a_respostas} />
                                <RespostasList title="Parte B" perguntas={PARTE_B_PERGUNTAS} respostas={questionnaire.parte_b_respostas} />
                                <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                                    <div>
                                        <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-1">Parte A — Total</p>
                                        <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{questionnaire.parte_a_total ?? '-'} / 36</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-1">Parte B — Total</p>
                                        <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{questionnaire.parte_b_total ?? '-'} / 36</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><dt className="text-gray-500 dark:text-gray-400">CID</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.cid || '-'}</dd></div>
                                </dl>
                                {questionnaire.comentario && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                        <dt className="text-sm text-gray-500 dark:text-gray-400">OBS</dt>
                                        <dd className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{questionnaire.comentario}</dd>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Assinatura do Paciente/Acompanhante</h4>
                                {questionnaire.assinatura_paciente ? (
                                    <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white cursor-pointer max-w-md" onClick={() => setZoomSignature(true)}>
                                        <img src={questionnaire.assinatura_paciente} alt="Assinatura" className="w-full h-auto p-4" />
                                    </div>
                                ) : (<div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center text-sm text-gray-500 dark:text-gray-400 max-w-md">Sem assinatura</div>)}
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600 text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Criado por:</span>
                                <span className="ml-2 text-gray-600 dark:text-gray-400">{questionnaire.creator?.name || 'N/A'}</span>
                                {questionnaire.updated_by && (
                                    <>
                                        <br />
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Última modificação:</span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-400">{questionnaire.last_modified_by}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6">
                        <AnexosUploader type="tdah-adulto" id={questionnaire.id} existing={questionnaire.attachments || []} readOnly={true} />
                    </div>
                </div>
            </div>

            <ImageZoomModal isOpen={zoomSignature} onClose={() => setZoomSignature(false)} imageSrc={questionnaire.assinatura_paciente} imageAlt="Assinatura" />
        </AuthenticatedLayout>
    );
}
