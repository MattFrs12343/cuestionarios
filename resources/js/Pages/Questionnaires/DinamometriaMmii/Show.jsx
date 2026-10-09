import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AnexosUploader from '@/Components/AnexosUploader';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { formatDateShort } from '@/Utils/dateFormatter';
import ImageZoomModal from '@/Components/ImageZoomModal';

const BoolField = ({ label, value }) => (
    <div className="flex justify-between border-b border-gray-100 dark:border-zinc-600 py-1 text-sm">
        <span className="text-gray-700 dark:text-zinc-300">{label}</span>
        <span className={`font-semibold ${value ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-500 dark:text-zinc-400'}`}>{value ? 'Sim' : 'Não'}</span>
    </div>
);

const ListField = ({ label, values }) => (
    <div>
        <dt className="text-gray-500 dark:text-zinc-400 text-sm">{label}</dt>
        <dd className="text-gray-900 dark:text-zinc-100 text-sm">{(values && values.length > 0) ? values.join(', ') : '-'}</dd>
    </div>
);

export default function Show({ auth, questionnaire, can }) {
    const [zoomSignature, setZoomSignature] = useState(false);

    const mrc = questionnaire.forca_mrc || [];
    const din = questionnaire.dinamometria || [];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4h3l1 5-2 2 1 4-3 5H6l2-5-1-4 2-2-1-5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 9h4m0 0l-2-2m2 2l-2 2" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-zinc-200 leading-tight">Visualizar Questionário</h2>
                        <p className="text-xs text-gray-600 dark:text-zinc-400">Dinamometria de Membros Inferiores</p>
                    </div>
                </div>
            }
        >
            <Head title="Visualizar Questionário - Dinamometria MMII" />

            <div className="py-8">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-zinc-700 overflow-hidden shadow-xl dark:shadow-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-600 transition-colors duration-200">
                        <div className="bg-gradient-to-r from-cyan-500 to-sky-600 dark:from-cyan-600 dark:to-sky-700 px-6 py-6">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{questionnaire.nome_completo}</h3>
                                    <p className="text-sm text-cyan-100 mt-1">Idade: {questionnaire.idade}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={route('questionnaires.dinamometria-mmii.index')} className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg shadow-md transition-all duration-200">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                        Voltar
                                    </Link>
                                    {can.edit && (
                                        <Link href={route('questionnaires.dinamometria-mmii.edit', questionnaire.id)} className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-100 text-cyan-600 font-semibold rounded-lg shadow-md transition-all duration-200">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            Editar
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 text-gray-900 dark:text-zinc-100 space-y-8">
                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-zinc-200 mb-4">Identificação</h4>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><dt className="text-gray-500 dark:text-zinc-400">Data de Nascimento</dt><dd className="text-gray-900 dark:text-zinc-100">{formatDateShort(questionnaire.data_nascimento)}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-zinc-400">Sexo</dt><dd className="text-gray-900 dark:text-zinc-100">{questionnaire.sexo}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-zinc-400">Peso / Altura</dt><dd className="text-gray-900 dark:text-zinc-100">{questionnaire.peso ?? '-'} kg / {questionnaire.altura ?? '-'} cm</dd></div>
                                    <div><dt className="text-gray-500 dark:text-zinc-400">Dominância</dt><dd className="text-gray-900 dark:text-zinc-100">{questionnaire.dominancia || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-zinc-400">Profissão</dt><dd className="text-gray-900 dark:text-zinc-100">{questionnaire.profissao || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-zinc-400">Clínica</dt><dd className="text-gray-900 dark:text-zinc-100">{questionnaire.clinica || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-zinc-400">Data do Exame</dt><dd className="text-gray-900 dark:text-zinc-100">{formatDateShort(questionnaire.data_exame)}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-zinc-400">Equipe</dt><dd className="text-gray-900 dark:text-zinc-100">{questionnaire.team?.name}</dd></div>
                                    {questionnaire.indicacao_clinica && (<div className="md:col-span-2"><dt className="text-gray-500 dark:text-zinc-400">Indicação Clínica</dt><dd className="text-gray-900 dark:text-zinc-100 whitespace-pre-wrap">{questionnaire.indicacao_clinica}</dd></div>)}
                                </dl>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-zinc-200 mb-4">Anamnese (Resumo)</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                    <BoolField label="Fraqueza muscular" value={questionnaire.fraqueza_muscular} />
                                    <BoolField label="Dor nos membros inferiores" value={questionnaire.dor_membros} />
                                    <BoolField label="Fadiga muscular" value={questionnaire.fadiga_muscular} />
                                    <BoolField label="Parestesias" value={questionnaire.parestesias} />
                                    <BoolField label="Câimbras" value={questionnaire.caimbras} />
                                    <BoolField label="Tremores" value={questionnaire.tremores} />
                                    <BoolField label="Rigidez muscular" value={questionnaire.rigidez_muscular} />
                                    <BoolField label="Alteração de equilíbrio" value={questionnaire.alteracao_equilibrio} />
                                    <BoolField label="Quedas (últimos 6 meses)" value={questionnaire.quedas_6meses} />
                                </div>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><dt className="text-gray-500 dark:text-zinc-400">Dispositivo auxiliar</dt><dd className="text-gray-900 dark:text-zinc-100">{questionnaire.dispositivo_auxiliar || '-'}</dd></div>
                                    <ListField label="Dificuldade para" values={questionnaire.dificuldade_atividades} />
                                </dl>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-zinc-200 mb-4">Antecedentes Clínicos e Segurança</h4>
                                <dl className="grid grid-cols-1 gap-4 text-sm">
                                    <ListField label="Antecedentes clínicos" values={questionnaire.antecedentes_clinicos} />
                                    <ListField label="Condições de segurança assinaladas" values={questionnaire.seguranca_teste} />
                                </dl>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-zinc-200 mb-4">Força Muscular — Escala MRC (0–5)</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                    <div><dt className="text-gray-500 dark:text-zinc-400">Tônus MID</dt><dd className="text-gray-900 dark:text-zinc-100">{questionnaire.tono_mid || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-zinc-400">Tônus MIE</dt><dd className="text-gray-900 dark:text-zinc-100">{questionnaire.tono_mie || '-'}</dd></div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm text-center border border-gray-200 dark:border-zinc-500">
                                        <thead>
                                            <tr className="bg-gray-100 dark:bg-zinc-600">
                                                <th className="px-3 py-2 border border-gray-200 dark:border-zinc-500 text-left">Movimento</th>
                                                <th className="px-3 py-2 border border-gray-200 dark:border-zinc-500">Direito</th>
                                                <th className="px-3 py-2 border border-gray-200 dark:border-zinc-500">Esquerdo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mrc.map((row, i) => (
                                                <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-zinc-700' : 'bg-gray-50 dark:bg-zinc-600/40'}>
                                                    <td className="px-3 py-1.5 border border-gray-200 dark:border-zinc-500 text-left">{row.movimento}</td>
                                                    <td className="px-3 py-1.5 border border-gray-200 dark:border-zinc-500">{row.direito ?? '-'}/5</td>
                                                    <td className="px-3 py-1.5 border border-gray-200 dark:border-zinc-500">{row.esquerdo ?? '-'}/5</td>
                                                </tr>
                                            ))}
                                            {mrc.length === 0 && (<tr><td colSpan="3" className="px-3 py-2 border border-gray-200 dark:border-zinc-500">Sem dados registrados</td></tr>)}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-zinc-200 mb-4">Registro da Dinamometria ({questionnaire.unidade || 'kgf'})</h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-xs text-center border border-gray-200 dark:border-zinc-500">
                                        <thead>
                                            <tr className="bg-gray-100 dark:bg-zinc-600">
                                                <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500 text-left">Movimento</th>
                                                <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500">Melh. D</th>
                                                <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500">Méd. D</th>
                                                <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500">Melh. E</th>
                                                <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500">Méd. E</th>
                                                <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500">Assim. %</th>
                                                <th className="px-2 py-2 border border-gray-200 dark:border-zinc-500">Menor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {din.map((row, i) => (
                                                <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-zinc-700' : 'bg-gray-50 dark:bg-zinc-600/40'}>
                                                    <td className="px-2 py-1.5 border border-gray-200 dark:border-zinc-500 text-left whitespace-nowrap">{row.movimento}</td>
                                                    <td className="px-2 py-1.5 border border-gray-200 dark:border-zinc-500">{row.d_melhor || '-'}</td>
                                                    <td className="px-2 py-1.5 border border-gray-200 dark:border-zinc-500">{row.d_media || '-'}</td>
                                                    <td className="px-2 py-1.5 border border-gray-200 dark:border-zinc-500">{row.e_melhor || '-'}</td>
                                                    <td className="px-2 py-1.5 border border-gray-200 dark:border-zinc-500">{row.e_media || '-'}</td>
                                                    <td className="px-2 py-1.5 border border-gray-200 dark:border-zinc-500 font-semibold">{row.assimetria_pct || '-'}</td>
                                                    <td className="px-2 py-1.5 border border-gray-200 dark:border-zinc-500 font-semibold">{row.menor || '-'}</td>
                                                </tr>
                                            ))}
                                            {din.length === 0 && (<tr><td colSpan="7" className="px-3 py-2 border border-gray-200 dark:border-zinc-500">Sem dados registrados</td></tr>)}
                                        </tbody>
                                    </table>
                                </div>
                                <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4">
                                    <div><dt className="text-gray-500 dark:text-zinc-400">Valor utilizado</dt><dd className="text-gray-900 dark:text-zinc-100">{questionnaire.valor_analise || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-zinc-400">Tempo de sustentação</dt><dd className="text-gray-900 dark:text-zinc-100">{questionnaire.tempo_sustentacao_segundos ?? '-'} s</dd></div>
                                    <div><dt className="text-gray-500 dark:text-zinc-400">Assimetria global</dt><dd className="text-gray-900 dark:text-zinc-100 font-semibold">{questionnaire.assimetria_global_pct ?? '-'}%</dd></div>
                                </dl>
                                <ListField label="Intercorrências durante o teste" values={questionnaire.intercorrencias_teste} />
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-zinc-200 mb-4">Impressão Funcional e Conclusão</h4>
                                <ListField label="Impressão funcional" values={questionnaire.impressao_funcional} />
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                                    <div><dt className="text-gray-500 dark:text-zinc-400">Maior assimetria</dt><dd className="text-gray-900 dark:text-zinc-100 font-semibold">{questionnaire.maior_assimetria_pct ?? '-'}% ({questionnaire.maior_assimetria_movimento || '-'})</dd></div>
                                    <div><dt className="text-gray-500 dark:text-zinc-400">Menor força — lado</dt><dd className="text-gray-900 dark:text-zinc-100">{questionnaire.menor_forca_lado || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-zinc-400">Examinador</dt><dd className="text-gray-900 dark:text-zinc-100">{questionnaire.examinador || '-'}</dd></div>
                                    <div><dt className="text-gray-500 dark:text-zinc-400">CRM/Registro</dt><dd className="text-gray-900 dark:text-zinc-100">{questionnaire.crm_registro || '-'}</dd></div>
                                </dl>
                                {questionnaire.modelo_conclusao && (<div className="mt-4"><dt className="text-sm text-gray-500 dark:text-zinc-400">Classificação</dt><dd className="text-sm text-gray-900 dark:text-zinc-100 font-semibold">{questionnaire.modelo_conclusao}</dd></div>)}
                                {questionnaire.conclusao_final && (<div className="mt-4"><dt className="text-sm text-gray-500 dark:text-zinc-400">Conclusão Final</dt><dd className="text-sm text-gray-900 dark:text-zinc-100 whitespace-pre-wrap">{questionnaire.conclusao_final}</dd></div>)}
                                {questionnaire.comentario && (<div className="mt-4"><dt className="text-sm text-gray-500 dark:text-zinc-400">Comentário</dt><dd className="text-sm text-gray-900 dark:text-zinc-100 whitespace-pre-wrap">{questionnaire.comentario}</dd></div>)}
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-zinc-600 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-500 shadow-sm">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-zinc-200 mb-4">Assinatura do Paciente</h4>
                                {questionnaire.assinatura_paciente ? (
                                    <div className="border-2 border-gray-300 dark:border-zinc-500 rounded-lg overflow-hidden bg-white cursor-pointer max-w-md" onClick={() => setZoomSignature(true)}>
                                        <img src={questionnaire.assinatura_paciente} alt="Assinatura" className="w-full h-auto p-4" />
                                    </div>
                                ) : (<div className="border-2 border-dashed border-gray-300 dark:border-zinc-500 rounded-lg p-6 text-center text-sm text-gray-500 dark:text-zinc-400 max-w-md">Sem assinatura</div>)}
                            </div>

                            <div className="bg-gray-50 dark:bg-zinc-600/50 rounded-lg p-4 border border-gray-200 dark:border-zinc-500 text-sm">
                                <span className="font-medium text-gray-700 dark:text-zinc-300">Criado por:</span>
                                <span className="ml-2 text-gray-600 dark:text-zinc-400">{questionnaire.creator?.name || 'N/A'}</span>
                                {questionnaire.updated_by && (
                                    <>
                                        <br />
                                        <span className="font-medium text-gray-700 dark:text-zinc-300">Última modificação:</span>
                                        <span className="ml-2 text-gray-600 dark:text-zinc-400">{questionnaire.last_modified_by}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-white dark:bg-zinc-700 shadow-sm sm:rounded-lg p-6">
                        <AnexosUploader type="dinamometria-mmii" id={questionnaire.id} existing={questionnaire.attachments || []} readOnly={true} />
                    </div>
                </div>
            </div>

            <ImageZoomModal isOpen={zoomSignature} onClose={() => setZoomSignature(false)} imageSrc={questionnaire.assinatura_paciente} imageAlt="Assinatura" />
        </AuthenticatedLayout>
    );
}
