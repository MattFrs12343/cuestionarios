import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AnexosUploader from '@/Components/AnexosUploader';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { formatDateShort } from '@/Utils/dateFormatter';
import ImageZoomModal from '@/Components/ImageZoomModal';

const PointsSummary = ({ title, points, sideLabels, sideFields }) => (
    <div className="overflow-x-auto">
        <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h4>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ponto</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Sentiu?</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{sideLabels[0]}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{sideLabels[1]}</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {(points || []).map((row) => (
                    <tr key={row.ponto}>
                        <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">{row.ponto}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{row.sentiu ? 'Sim' : 'Não'}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{row[sideFields[0]] || '-'}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{row[sideFields[1]] || '-'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const PRE_EXAM_QUESTIONS = [
    { field: 'dormencia_formigamento', label: 'Dormência, formigamento ou queimação nas mãos/pés' },
    { field: 'dificuldade_sentir_objetos', label: 'Dificuldade para sentir objetos com as mãos' },
    { field: 'feridas_sem_dor', label: 'Feridas nos pés sem sentir dor' },
    { field: 'diagnostico_diabetes_hanseniase', label: 'Diagnóstico de diabetes, hanseníase ou doença neurológica' },
    { field: 'cirurgia_fratura_recente', label: 'Cirurgia ou fratura recente nas regiões avaliadas' },
    { field: 'medicamentos_sistema_nervoso', label: 'Uso de medicamentos que afetam o sistema nervoso' },
];

export default function Show({ auth, questionnaire, can }) {
    const [zoomPaciente, setZoomPaciente] = useState(false);

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
                        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">Visualizar Questionário</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Estesiometria - Avaliação Sensitiva</p>
                    </div>
                </div>
            }
        >
            <Head title="Visualizar Questionário - Estesiometria" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <div className="bg-gradient-to-r from-red-500 to-rose-600 dark:from-red-600 dark:to-rose-700 px-6 py-6">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{questionnaire.nome_completo}</h3>
                                    <p className="text-sm text-red-100 mt-1">Idade: {questionnaire.idade}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={route('questionnaires.estesiometria.index')} className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg shadow-md transition-all duration-200">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                        Voltar
                                    </Link>
                                    {can.edit && (
                                        <Link href={route('questionnaires.estesiometria.edit', questionnaire.id)} className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-100 text-red-600 font-semibold rounded-lg shadow-md transition-all duration-200">
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
                                    <div><dt className="text-gray-500 dark:text-gray-400">Sexo</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.sexo}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Clínica</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.clinica || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Data do Exame</dt><dd className="text-gray-900 dark:text-gray-100">{formatDateShort(questionnaire.data_exame)}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Profissional</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.nome_avaliador || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">CRM/RG</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.crm_rg || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Diagnóstico</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.diagnostico || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Equipe</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.team?.name}</dd></div>
                                </dl>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Questionário Pré-Exame</h4>
                                <ul className="space-y-1 text-sm">
                                    {PRE_EXAM_QUESTIONS.map((q) => (
                                        <li key={q.field} className="flex justify-between border-b border-gray-100 dark:border-gray-700 py-1">
                                            <span className="text-gray-700 dark:text-gray-300">{q.label}</span>
                                            <span className={`font-semibold ${questionnaire[q.field] ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>{questionnaire[q.field] ? 'Sim' : 'Não'}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm space-y-6">
                                <PointsSummary title="Avaliação dos Pés" points={questionnaire.pontos_pes} sideLabels={['Cor Pé Direito', 'Cor Pé Esquerdo']} sideFields={['cor_direito', 'cor_esquerdo']} />
                                <PointsSummary title="Avaliação das Mãos" points={questionnaire.pontos_maos} sideLabels={['Cor Mão Direita', 'Cor Mão Esquerda']} sideFields={['cor_direita', 'cor_esquerda']} />
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Resultado e Classificação</h4>
                                <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div><dt className="text-gray-500 dark:text-gray-400">Pés — % Acerto D / E</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.pes_percent_acerto_d ?? '-'} / {questionnaire.pes_percent_acerto_e ?? '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Pés — Classificação</dt><dd className="text-gray-900 dark:text-gray-100 font-semibold">{questionnaire.pes_classificacao || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Mãos — % Acerto D / E</dt><dd className="text-gray-900 dark:text-gray-100">{questionnaire.maos_percent_acerto_d ?? '-'} / {questionnaire.maos_percent_acerto_e ?? '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-gray-400">Mãos — Classificação</dt><dd className="text-gray-900 dark:text-gray-100 font-semibold">{questionnaire.maos_classificacao || '-'}</dd></div>
                                </dl>
                                {questionnaire.comentario && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                        <dt className="text-sm text-gray-500 dark:text-gray-400">Observações Clínicas</dt>
                                        <dd className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{questionnaire.comentario}</dd>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Assinatura</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <dt className="text-sm text-gray-500 dark:text-gray-400 mb-2">Assinatura do Paciente</dt>
                                        {questionnaire.assinatura_paciente ? (
                                            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white cursor-pointer" onClick={() => setZoomPaciente(true)}>
                                                <img src={questionnaire.assinatura_paciente} alt="Assinatura do Paciente" className="w-full h-auto p-4" />
                                            </div>
                                        ) : (<div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center text-sm text-gray-500 dark:text-gray-400">Sem assinatura</div>)}
                                    </div>
                                </div>
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
                        <AnexosUploader type="estesiometria" id={questionnaire.id} existing={questionnaire.attachments || []} readOnly={true} />
                    </div>
                </div>
            </div>

            <ImageZoomModal isOpen={zoomPaciente} onClose={() => setZoomPaciente(false)} imageSrc={questionnaire.assinatura_paciente} imageAlt="Assinatura do Paciente" />
        </AuthenticatedLayout>
    );
}
