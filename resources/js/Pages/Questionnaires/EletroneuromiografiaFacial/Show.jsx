import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { formatDateShort } from '@/Utils/dateFormatter';
import ImageZoomModal from '@/Components/ImageZoomModal';
import QuestionnaireExportView from '@/Components/QuestionnaireExportView';
import html2canvas from 'html2canvas';

export default function Show({ auth, questionnaire, can }) {
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isPedidoMedicoModalOpen, setIsPedidoMedicoModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportToJPG = async () => {
        setIsExporting(true);
        
        try {
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '0';
            document.body.appendChild(tempContainer);
            
            const { createRoot } = await import('react-dom/client');
            const root = createRoot(tempContainer);
            
            await new Promise((resolve) => {
                root.render(
                    <QuestionnaireExportView questionnaire={questionnaire} type="eletroneuromiografia-facial" />
                );
                setTimeout(resolve, 1000);
            });
            
            const canvas = await html2canvas(tempContainer.firstChild, {
                scale: 2,
                useCORS: false,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: 794,
                height: 1123,
                windowWidth: 794,
                ignoreElements: (element) => {
                    return element.tagName === 'IMG' && element.src.includes('storage');
                }
            });
            
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    const fileName = `questionario_enmg_facial_${questionnaire.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.jpg`;
                    link.href = url;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }
                
                root.unmount();
                document.body.removeChild(tempContainer);
                setIsExporting(false);
            }, 'image/jpeg', 0.95);
            
        } catch (error) {
            console.error('Error al exportar:', error);
            alert('Erro ao exportar o questionário. Por favor, tente novamente.');
            setIsExporting(false);
        }
    };

    const BooleanDisplay = ({ label, value, conditionalValue = null }) => (
        <div className="mb-4">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="mt-1 flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    value 
                        ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300' 
                        : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                }`}>
                    {value ? 'SIM' : 'NÃO'}
                </span>
                {value && conditionalValue && (
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">({conditionalValue})</span>
                )}
            </dd>
        </div>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                                Visualizar Questionário
                            </h2>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Eletroneuromiografia Facial
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Visualizar Questionário - Eletroneuromiografia Facial" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        {/* Header do Questionário */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 px-6 py-6">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div className="flex items-center">
                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{questionnaire.nome}</h3>
                                        <p className="text-sm text-orange-100 mt-1">RG: {questionnaire.rg}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleExportToJPG}
                                        disabled={isExporting}
                                        className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Exportar questionário como imagem JPG"
                                    >
                                        {isExporting ? (
                                            <>
                                                <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Exportando...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Exportar JPG
                                            </>
                                        )}
                                    </button>
                                    <Link
                                        href={route('questionnaires.eletroneuromiografia-facial.index')}
                                        className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Voltar
                                    </Link>
                                    {can.edit && (
                                        <Link
                                            href={route('questionnaires.eletroneuromiografia-facial.edit', questionnaire.id)}
                                            className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-100 text-orange-600 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                        >
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
                                    <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-600 rounded-full mr-3"></div>
                                    <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">Dados Básicos</h4>
                                </div>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Clínica</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.clinica}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Data do Exame</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDateShort(questionnaire.data_exame)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome Completo</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.nome}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Data de Nascimento</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {formatDateShort(questionnaire.data_nascimento)} ({questionnaire.idade_calculada})
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sexo</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.sexo}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">RG</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.rg}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Peso</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.peso ? `${questionnaire.peso} kg` : 'Não informado'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Altura</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.altura ? `${questionnaire.altura} m` : 'Não informado'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Solicitante</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.solicitante}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Equipe</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.team?.name}</dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Questionário Facial */}
                            <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <div className="flex items-center mb-4">
                                    <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-pink-600 rounded-full mr-3"></div>
                                    <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">Questionário de Eletroneuromiografia Facial</h4>
                                </div>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <BooleanDisplay label="Tem dor na testa?" value={questionnaire.tem_dor_testa} />
                                    <BooleanDisplay label="Está com dor nos olhos?" value={questionnaire.tem_dor_olhos} conditionalValue={questionnaire.dor_olhos_lado} />
                                    <BooleanDisplay label="Está com dor na mandíbula?" value={questionnaire.tem_dor_mandibula} />
                                    <BooleanDisplay label="Quando toma água gelada, tem dor nos dentes?" value={questionnaire.tem_dor_dentes_agua_gelada} />
                                    <BooleanDisplay label="Tem espasmos na face?" value={questionnaire.tem_espasmos_face} conditionalValue={questionnaire.espasmos_face_parte} />
                                    <BooleanDisplay label="Alguma vez aplicou Botox?" value={questionnaire.aplicou_botox} conditionalValue={questionnaire.botox_parte_face} />
                                    <BooleanDisplay label="Tem implante dentário?" value={questionnaire.tem_implante_dentario} />
                                    <BooleanDisplay label="Depois que colocou o implante, apresentou dores?" value={questionnaire.tem_dores_apos_implante} />
                                    <BooleanDisplay label="Já teve paralisia facial?" value={questionnaire.teve_paralisia_facial} conditionalValue={questionnaire.paralisia_facial_vezes ? `${questionnaire.paralisia_facial_vezes} vezes` : null} />
                                    <BooleanDisplay label="Tem alguma parte da face que está paralisada?" value={questionnaire.tem_parte_face_paralisada} conditionalValue={questionnaire.parte_face_paralisada_qual} />
                                    <BooleanDisplay label="Tem enxaqueca?" value={questionnaire.tem_enxaqueca} />
                                    <BooleanDisplay label="Consegue sorrir normalmente?" value={questionnaire.consegue_sorrir_normalmente} />
                                    <BooleanDisplay label="Pode comer normalmente?" value={questionnaire.pode_comer_normalmente} />
                                    <BooleanDisplay label="Pode assoviar?" value={questionnaire.pode_assoviar} />
                                    <BooleanDisplay label="Consegue encher uma bexiga?" value={questionnaire.consegue_encher_bexiga} />
                                    <BooleanDisplay label="Tem infecção de ouvido repetidamente?" value={questionnaire.tem_infeccao_ouvido_repetidamente} />
                                    <BooleanDisplay label="Diabético(a)" value={questionnaire.diabetico} />
                                    <BooleanDisplay label="Toma algum tipo de medicamento?" value={questionnaire.toma_medicamento} conditionalValue={questionnaire.medicamentos} />
                                </dl>
                            </div>
                            {/* Arquivos */}
                            <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <div className="flex items-center mb-4">
                                    <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-teal-600 rounded-full mr-3"></div>
                                    <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">Arquivos</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Pedido Médico */}
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Pedido Médico</dt>
                                        {questionnaire.pedido_medico ? (
                                            <div 
                                                className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden cursor-pointer hover:border-orange-500 dark:hover:border-orange-400 transition-colors duration-200"
                                                onClick={() => setIsPedidoMedicoModalOpen(true)}
                                            >
                                                <img
                                                    src={`/storage/${questionnaire.pedido_medico}`}
                                                    alt="Pedido Médico"
                                                    className="w-full h-auto"
                                                />
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

                                    {/* Assinatura */}
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Assinatura do Paciente</dt>
                                        {questionnaire.assinatura_paciente ? (
                                            <div 
                                                className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white cursor-pointer hover:border-orange-500 dark:hover:border-orange-400 transition-colors duration-200"
                                                onClick={() => setIsImageModalOpen(true)}
                                            >
                                                <img
                                                    src={questionnaire.assinatura_paciente}
                                                    alt="Assinatura do Paciente"
                                                    className="w-full h-auto p-4"
                                                />
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

            {/* Modal para Assinatura */}
            <ImageZoomModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                imageSrc={questionnaire.assinatura_paciente}
                imageAlt="Assinatura do Paciente"
            />

            {/* Modal para Pedido Médico */}
            <ImageZoomModal
                isOpen={isPedidoMedicoModalOpen}
                onClose={() => setIsPedidoMedicoModalOpen(false)}
                imageSrc={`/storage/${questionnaire.pedido_medico}`}
                imageAlt="Pedido Médico"
            />
        </AuthenticatedLayout>
    );
}
