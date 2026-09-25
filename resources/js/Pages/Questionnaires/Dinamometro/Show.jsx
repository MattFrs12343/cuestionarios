import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AnexosUploader from '@/Components/AnexosUploader';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { formatDateShort } from '@/Utils/dateFormatter';
import ImageZoomModal from '@/Components/ImageZoomModal';

const CONTEXTO_LABELS = {
    neurologico: 'Neurológico',
    ortopedico: 'Ortopédico',
    geriatrico: 'Geriátrico',
    pediatrico: 'Pediátrico',
};

const BoolField = ({ label, value }) => (
    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 py-1 text-sm">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className={`font-semibold ${value ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500 dark:text-gray-400'}`}>{value ? 'Sim' : 'Não'}</span>
    </div>
);

export default function Show({ auth, questionnaire, can }) {
    const [zoomSignature, setZoomSignature] = useState(false);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5a6 6 0 1112 0V14m-12-2.5V9a1.5 1.5 0 013 0v1.5m0 0V9a1.5 1.5 0 013 0v1.5m0 0V9a1.5 1.5 0 013 0v3.5M7 14v3a4 4 0 004 4h1a4 4 0 004-4v-3" /></svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">Visualizar Questionário</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Dinamômetro - Força de Preensão Manual</p>
                    </div>
                </div>
            }
        >
            <Head title="Visualizar Questionário - Dinamômetro" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <div className="bg-gradient-to-r from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 px-6 py-6">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{questionnaire.nome_completo}</h3>
                                    <p className="text-sm text-violet-100 mt-1">Idade: {questionnaire.idade}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={route('questionnaires.dinamometro.index')} className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg shadow-md transition-all duration-200">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                        Voltar
                                    </Link>
                                    {can.edit && (
                                        <Link href={route('questionnaires.dinamometro.edit', questionnaire.id)} className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-100 text-violet-600 font-semibold rounded-lg shadow-md transition-all duration-200">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            Editar
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 text-gray-900 dark:text-gray-100 space-y-8">
                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Identificação</h4>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><dt className="text-gray-500 dark:text-gray-400">Data de Nascimento</dt><dd className="text-gray-900 dark:text-gray-100">{formatDateShort(questionnaire.data_nascimento)}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Sexo</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.sexo}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Peso / Altura</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.peso ?? '-'} kg / {questionnaire.altura ?? '-'} cm</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Dominância</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.dominancia || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Profissão</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.profissao || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Diagnóstico Principal</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.diagnostico_principal || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Clínica</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.clinica || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Data do Exame</dt><dd className="text-gray-900 dark:text-gray-100">{formatDateShort(questionnaire.data_exame)}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Equipe</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.team?.name}</dd></div>
                                    <div className="md:col-span-2"><dt className="text-gray-500 dark:text-gray-400">Contextos Clínicos</dt><dd className="text-gray-900 dark:text-gray-100">{(questionnaire.contextos_clinicos || []).map(c => CONTEXTO_LABELS[c] || c).join(', ') || '-'}</dd></div>
                                </dl>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Histórico Clínico</h4>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                                    <div><dt className="text-gray-500 dark:text-gray-400">Doenças Crônicas</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.doencas_cronicas || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Dor Atual (0-10)</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.dor_atual ?? '-'}</dd></div>
                                </dl>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <BoolField label="Fisioterapia recente" value={questionnaire.fisioterapia_recente} />
                                    <BoolField label="Lesão prévia/atual" value={questionnaire.lesao_previa_atual} />
                                    <BoolField label="Dor piora com força" value={questionnaire.dor_piora_com_forca} />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Padronização e Resultados</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Mão Dominante (kgf)</p>
                                        <p className="text-gray-700 dark:text-gray-300">1ª: {questionnaire.mao_dominante_t1 ?? '-'} · 2ª: {questionnaire.mao_dominante_t2 ?? '-'} · 3ª: {questionnaire.mao_dominante_t3 ?? '-'}</p>
                                        <p className="text-violet-600 dark:text-violet-400 font-bold">Média: {questionnaire.mao_dominante_media ?? '-'}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Mão Não Dominante (kgf)</p>
                                        <p className="text-gray-700 dark:text-gray-300">1ª: {questionnaire.mao_nao_dominante_t1 ?? '-'} · 2ª: {questionnaire.mao_nao_dominante_t2 ?? '-'} · 3ª: {questionnaire.mao_nao_dominante_t3 ?? '-'}</p>
                                        <p className="text-violet-600 dark:text-violet-400 font-bold">Média: {questionnaire.mao_nao_dominante_media ?? '-'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Interpretação e Conduta</h4>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><dt className="text-gray-500 dark:text-gray-400">Classificação</dt><dd className="text-gray-900 dark:text-gray-100 font-semibold">{questionnaire.classificacao || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Assimetria %</dt><dd className="text-gray-900 dark:text-gray-100 font-semibold">{questionnaire.assimetria_percentual ?? '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Profissional</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.nome_avaliador || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">CREFITO/CRM</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.crefito_crm || '-'}</dd></div>
                                </dl>
                                {questionnaire.conclusao && (<div className="mt-4"><dt className="text-sm text-gray-500 dark:text-gray-400">Conclusão</dt><dd className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{questionnaire.conclusao}</dd></div>)}
                                {questionnaire.conduta && (<div className="mt-4"><dt className="text-sm text-gray-500 dark:text-gray-400">Conduta</dt><dd className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{questionnaire.conduta}</dd></div>)}
                                {questionnaire.comentario && (<div className="mt-4"><dt className="text-sm text-gray-500 dark:text-gray-400">Comentário</dt><dd className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{questionnaire.comentario}</dd></div>)}
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Assinatura do Paciente</h4>
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
                        <AnexosUploader type="dinamometro" id={questionnaire.id} existing={questionnaire.attachments || []} readOnly={true} />
                    </div>
                </div>
            </div>

            <ImageZoomModal isOpen={zoomSignature} onClose={() => setZoomSignature(false)} imageSrc={questionnaire.assinatura_paciente} imageAlt="Assinatura" />
        </AuthenticatedLayout>
    );
}
