import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AnexosUploader from '@/Components/AnexosUploader';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { formatDateShort } from '@/Utils/dateFormatter';
import ImageZoomModal from '@/Components/ImageZoomModal';

export default function Show({ auth, questionnaire, can }) {
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isPedidoMedicoModalOpen, setIsPedidoMedicoModalOpen] = useState(false);

    const ScoreDisplay = ({ label, value, max }) => (
        <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 font-semibold">{value ?? '-'} / {max}</dd>
        </div>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">Visualizar Questionário</h2>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Rastreio Cognitivo (MoCA)</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Visualizar Questionário - Rastreio Cognitivo" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 dark:from-teal-600 dark:to-cyan-700 px-6 py-6">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div className="flex items-center">
                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{questionnaire.nome_completo}</h3>
                                        <p className="text-sm text-teal-100 mt-1">RG/CPF: {questionnaire.rg_ou_cpf}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={route('questionnaires.rastreio-cognitivo.index')} className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Voltar
                                    </Link>
                                    {can.edit && (
                                        <Link href={route('questionnaires.rastreio-cognitivo.edit', questionnaire.id)} className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-100 text-teal-600 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Editar
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* Dados básicos */}
                            <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <div className="flex items-center mb-4">
                                    <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-cyan-600 rounded-full mr-3"></div>
                                    <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">Dados Básicos</h4>
                                </div>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome do Paciente</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.nome_completo}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">RG ou CPF</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.rg_ou_cpf}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Data de Nascimento</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDateShort(questionnaire.data_nascimento)} ({questionnaire.idade})</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sexo</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.sexo}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Clínica</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.clinica || 'Não informado'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Data do Exame</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDateShort(questionnaire.data_exame)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Equipe</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.team?.name}</dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Pontuação */}
                            <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <div className="flex items-center mb-4">
                                    <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full mr-3"></div>
                                    <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">Folha de Pontuação Rápida</h4>
                                </div>
                                <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <ScoreDisplay label="Visoespacial / Executiva" value={questionnaire.pontuacao_visoespacial} max={5} />
                                    <ScoreDisplay label="Nomeação" value={questionnaire.pontuacao_nomeacao} max={3} />
                                    <ScoreDisplay label="Atenção" value={questionnaire.pontuacao_atencao} max={6} />
                                    <ScoreDisplay label="Linguagem" value={questionnaire.pontuacao_linguagem} max={3} />
                                    <ScoreDisplay label="Abstração" value={questionnaire.pontuacao_abstracao} max={2} />
                                    <ScoreDisplay label="Evocação Tardia" value={questionnaire.pontuacao_evocacao_tardia} max={5} />
                                    <ScoreDisplay label="Orientação" value={questionnaire.pontuacao_orientacao} max={6} />
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ajuste de Escolaridade</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 font-semibold">{questionnaire.ajuste_escolaridade ? '+1 pt' : '—'}</dd>
                                    </div>
                                </dl>
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Pontuação Total</dt>
                                        <dd className="mt-1 text-2xl font-bold text-teal-600 dark:text-teal-400">{questionnaire.pontuacao_total ?? '-'} / 30</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome do Avaliador</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.nome_avaliador || 'Não informado'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">CID</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.cid || 'Não informado'}</dd>
                                    </div>
                                </div>
                                {questionnaire.comentario && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Comentário</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{questionnaire.comentario}</dd>
                                    </div>
                                )}
                            </div>

                            {/* Arquivos */}
                            <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <div className="flex items-center mb-4">
                                    <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-teal-600 rounded-full mr-3"></div>
                                    <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">Arquivos</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Pedido Médico</dt>
                                        {questionnaire.pedido_medico ? (
                                            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden cursor-pointer hover:border-teal-500 dark:hover:border-teal-400 transition-colors duration-200" onClick={() => setIsPedidoMedicoModalOpen(true)}>
                                                <img src={`/storage/${questionnaire.pedido_medico}`} alt="Pedido Médico" className="w-full h-auto" />
                                                <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 text-center">
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">Clique para ampliar</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Nenhum arquivo anexado</p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Assinatura do Avaliador</dt>
                                        {questionnaire.assinatura_paciente ? (
                                            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white cursor-pointer hover:border-teal-500 dark:hover:border-teal-400 transition-colors duration-200" onClick={() => setIsImageModalOpen(true)}>
                                                <img src={questionnaire.assinatura_paciente} alt="Assinatura do Avaliador" className="w-full h-auto p-4" />
                                                <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 text-center">
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">Clique para ampliar</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-white">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Sem assinatura</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Informações de Auditoria */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Criado por:</span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-400">{questionnaire.creator?.name || 'N/A'}</span>
                                        <br />
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Data de criação:</span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-400">{new Date(questionnaire.created_at).toLocaleString('pt-BR')}</span>
                                    </div>
                                    {questionnaire.updated_by && (
                                        <div>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Última modificação:</span>
                                            <span className="ml-2 text-gray-600 dark:text-gray-400">{questionnaire.last_modified_by}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ImageZoomModal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} imageSrc={questionnaire.assinatura_paciente} imageAlt="Assinatura do Avaliador" />
            <ImageZoomModal isOpen={isPedidoMedicoModalOpen} onClose={() => setIsPedidoMedicoModalOpen(false)} imageSrc={`/storage/${questionnaire.pedido_medico}`} imageAlt="Pedido Médico" />
        <div className="mt-6 bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6">
                        <AnexosUploader type="rastreio-cognitivo" id={questionnaire.id} existing={questionnaire.attachments || []} readOnly={true} />
                    </div>
                </AuthenticatedLayout>
    );
}
