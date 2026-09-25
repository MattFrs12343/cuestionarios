import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AnexosUploader from '@/Components/AnexosUploader';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { formatDateShort } from '@/Utils/dateFormatter';
import ImageZoomModal from '@/Components/ImageZoomModal';

const PARTE_1_PERGUNTAS = [
    'A criança costuma errar atividades porque não presta atenção nos detalhes?',
    'Tem dificuldade para manter a atenção em tarefas, brincadeiras ou outras atividades?',
    'Parece não escutar quando alguém fala diretamente com ela?',
    'Começa uma tarefa, mas não consegue terminar ou não segue as instruções até o fim?',
    'Tem dificuldade para organizar os materiais ou a rotina?',
    'Evita ou reclama quando precisa fazer atividades que exigem pensar ou se concentrar por muito tempo?',
    'Perde ou esquece onde colocou objetos importantes?',
    'Se distrai facilmente com barulhos, pessoas ou qualquer coisa ao redor?',
    'Esquece compromissos, recados ou tarefas do dia a dia?',
];

const PARTE_2_PERGUNTAS = [
    'Mexe muito as mãos, os pés ou fica inquieta quando está sentada?',
    'Levanta da cadeira quando deveria permanecer sentada?',
    'Corre, sobe em móveis ou se movimenta demais em momentos em que deveria ficar calma?',
    'Tem dificuldade para brincar ou fazer atividades tranquilas?',
    'Parece estar sempre agitada, "ligada no máximo"?',
    'Fala mais do que o esperado?',
    'Responde antes da pergunta terminar ou interrompe a resposta dos outros?',
    'Tem dificuldade para esperar sua vez em filas, jogos ou conversas?',
    'Costuma interromper conversas, brincadeiras ou se intrometer nas atividades dos outros?',
];

const RespostasList = ({ title, perguntas, respostas }) => (
    <div>
        <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h4>
        <ul className="space-y-1 text-sm">
            {perguntas.map((p, idx) => (
                <li key={idx} className="flex justify-between border-b border-gray-100 dark:border-gray-700 py-1">
                    <span className="text-gray-700 dark:text-gray-300">{idx + 1}. {p}</span>
                    <span className="font-semibold text-pink-600 dark:text-pink-400 flex-shrink-0 ml-3">{(respostas && respostas[idx]) ?? '-'}</span>
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
                    <div className="p-2 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">Visualizar Questionário</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">TDAH Infantil - SNAP-IV</p>
                    </div>
                </div>
            }
        >
            <Head title="Visualizar Questionário - TDAH Infantil" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <div className="bg-gradient-to-r from-pink-500 to-fuchsia-600 dark:from-pink-600 dark:to-fuchsia-700 px-6 py-6">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{questionnaire.nome_completo}</h3>
                                    <p className="text-sm text-pink-100 mt-1">Idade: {questionnaire.idade}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={route('questionnaires.tdah-infantil.index')} className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg shadow-md transition-all duration-200">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                        Voltar
                                    </Link>
                                    {can.edit && (
                                        <Link href={route('questionnaires.tdah-infantil.edit', questionnaire.id)} className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-100 text-pink-600 font-semibold rounded-lg shadow-md transition-all duration-200">
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
                                    <div><dt className="text-gray-500 dark:text-gray-400">RG/CPF</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.rg_ou_cpf || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Sexo</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.sexo}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Peso / Altura</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.peso ?? '-'} kg / {questionnaire.altura ?? '-'} cm</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Clínica</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.clinica || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Data do Exame</dt><dd className="text-gray-900 dark:text-gray-100">{formatDateShort(questionnaire.data_exame)}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Solicitante</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.solicitante || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Equipe</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.team?.name}</dd></div>
                                </dl>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm space-y-6">
                                <RespostasList title="Parte I — Desatenção" perguntas={PARTE_1_PERGUNTAS} respostas={questionnaire.parte_1_respostas} />
                                <RespostasList title="Parte II — Hiperatividade/Impulsividade" perguntas={PARTE_2_PERGUNTAS} respostas={questionnaire.parte_2_respostas} />
                                <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                                    <div>
                                        <p className="text-sm font-semibold text-pink-700 dark:text-pink-300 uppercase tracking-wide mb-1">Parte I — Total</p>
                                        <p className="text-2xl font-bold text-pink-700 dark:text-pink-300">{questionnaire.parte_1_total ?? '-'} / 36</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-pink-700 dark:text-pink-300 uppercase tracking-wide mb-1">Parte II — Total</p>
                                        <p className="text-2xl font-bold text-pink-700 dark:text-pink-300">{questionnaire.parte_2_total ?? '-'} / 36</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><dt className="text-gray-500 dark:text-gray-400">CID</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.cid || '-'}</dd></div>
                                </dl>
                                {questionnaire.comentario && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                        <dt className="text-sm text-gray-500 dark:text-gray-400">Comentário</dt>
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
                        <AnexosUploader type="tdah-infantil" id={questionnaire.id} existing={questionnaire.attachments || []} readOnly={true} />
                    </div>
                </div>
            </div>

            <ImageZoomModal isOpen={zoomSignature} onClose={() => setZoomSignature(false)} imageSrc={questionnaire.assinatura_paciente} imageAlt="Assinatura" />
        </AuthenticatedLayout>
    );
}
