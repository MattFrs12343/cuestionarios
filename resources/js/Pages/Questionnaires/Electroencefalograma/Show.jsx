import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { formatDateShort } from '@/Utils/dateFormatter';
import ImageZoomModal from '@/Components/ImageZoomModal';
import QuestionnaireExportView from '@/Components/QuestionnaireExportView';
import html2canvas from 'html2canvas';

export default function Show({ auth, questionnaire, can }) {
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const exportRef = useRef(null);

    const handleExportToJPG = async () => {
        setIsExporting(true);
        
        try {
            // Crear un contenedor temporal para renderizar la vista de exportación
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '0';
            document.body.appendChild(tempContainer);
            
            // Renderizar la vista de exportación en el contenedor temporal
            const { createRoot } = await import('react-dom/client');
            const root = createRoot(tempContainer);
            
            await new Promise((resolve) => {
                root.render(
                    <QuestionnaireExportView questionnaire={questionnaire} type="electroencefalograma" />
                );
                // Esperar a que se renderice completamente
                setTimeout(resolve, 1000);
            });
            
            // A4 en pixels a 96 DPI: 210mm x 297mm = 794px x 1123px
            const canvas = await html2canvas(tempContainer.firstChild, {
                scale: 2,
                useCORS: false,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: 794,  // 210mm en pixels
                height: 1123, // 297mm en pixels
                windowWidth: 794,
                ignoreElements: (element) => {
                    // Ignorar cualquier imagen que pueda causar problemas
                    return element.tagName === 'IMG' && element.src.includes('storage');
                }
            });
            
            // Convertir a JPG y descargar
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    const fileName = `questionario_eeg_${questionnaire.nome_completo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.jpg`;
                    link.href = url;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }
                
                // Limpiar
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
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
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
                                Eletroencefalograma
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Visualizar Questionário - EEG" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        {/* Header do Questionário */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 px-6 py-6">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div className="flex items-center">
                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{questionnaire.nome_completo}</h3>
                                        <p className="text-sm text-indigo-100 mt-1">RG/CPF: {questionnaire.rg_ou_cpf}</p>
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
                                        href={route('questionnaires.electroencefalograma.index')}
                                        className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Voltar
                                    </Link>
                                    {can.edit && (
                                        <Link
                                            href={route('questionnaires.electroencefalograma.edit', questionnaire.id)}
                                            className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-100 text-indigo-600 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
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
                                    <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full mr-3"></div>
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
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.nome_completo}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Data de Nascimento</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {formatDateShort(questionnaire.data_nascimento)} ({questionnaire.idade})
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sexo</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.sexo}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">RG ou CPF</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.rg_ou_cpf}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Equipe</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.team.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo de Exame</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.tipo_exame || 'Não informado'}</dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Profissionais */}
                            <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <div className="flex items-center mb-4">
                                    <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-600 rounded-full mr-3"></div>
                                    <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">Profissionais</h4>
                                </div>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome do Profissional que fez o Pedido</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.nome_profissional_pedido}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome do Técnico ou Médico que fez o Exame</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.nome_tecnico_medico_exame}</dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Histórico médico */}
                            <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <div className="flex items-center mb-4">
                                    <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-pink-600 rounded-full mr-3"></div>
                                    <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">Histórico Médico</h4>
                                </div>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <BooleanDisplay label="Teve COVID" value={questionnaire.teve_covid} />
                                    
                                    <BooleanDisplay label="Teve Desmaio" value={questionnaire.teve_desmaio} />
                                    
                                    <BooleanDisplay 
                                        label="Já teve AVC" 
                                        value={questionnaire.ja_teve_avc} 
                                        conditionalValue={questionnaire.quando_teve_avc}
                                    />
                                    <BooleanDisplay 
                                        label="Já teve convulsão" 
                                        value={questionnaire.ja_teve_convulsao}
                                        conditionalValue={questionnaire.quando_teve_convulsao}
                                    />
                                    <BooleanDisplay label="Já bateu a cabeça" value={questionnaire.ja_bateu_cabeca} />
                                    <BooleanDisplay label="Tem dor de cabeça" value={questionnaire.tem_dor_cabeca} />
                                    <BooleanDisplay label="Tem depressão" value={questionnaire.tem_depressao} />
                                    <BooleanDisplay label="Tem ansiedade" value={questionnaire.tem_ansiedade} />
                                    <BooleanDisplay label="Tem insônia" value={questionnaire.tem_insonia} />
                                    <BooleanDisplay label="Tem esquecimento" value={questionnaire.tem_esquecimento} />
                                    <BooleanDisplay label="Tem Alzheimer" value={questionnaire.tem_alzheimer} />
                                    <BooleanDisplay label="Tem Parkinson" value={questionnaire.tem_parkinson} />
                                    <BooleanDisplay 
                                        label="Hipertensão" 
                                        value={questionnaire.hipertensao}
                                        conditionalValue={questionnaire.hipertensao_faz_uso}
                                    />
                                    <BooleanDisplay 
                                        label="Diabetes" 
                                        value={questionnaire.diabetes}
                                        conditionalValue={questionnaire.diabetes_faz_uso}
                                    />
                                    <BooleanDisplay label="Tem dificuldade de aprendizado" value={questionnaire.tem_dificuldade_aprendizado} />
                                    <BooleanDisplay label="Hiperativo" value={questionnaire.hiperativo} />
                                    <BooleanDisplay label="Agressivo" value={questionnaire.agressivo} />
                                    <BooleanDisplay label="Autismo" value={questionnaire.autismo} />
                                    <BooleanDisplay label="Tem dificuldade para dormir" value={questionnaire.tem_dificuldade_dormir} />
                                </dl>
                            </div>

                            {/* Momento do exame */}
                            <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <div className="flex items-center mb-4">
                                    <div className="w-1 h-8 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full mr-3"></div>
                                    <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">Momento do Exame</h4>
                                </div>
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Como o paciente ficou durante o exame?</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.momento_exame}</dd>
                                    </div>
                                    {questionnaire.comentario && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Comentários</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{questionnaire.comentario}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>

                            {/* Arquivos */}
                            {(questionnaire.pedido_medico || questionnaire.assinatura_paciente) && (
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-teal-600 rounded-full mr-3"></div>
                                        <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">Arquivos</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {questionnaire.pedido_medico && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Pedido Médico</dt>
                                                <dd className="relative group">
                                                    <img 
                                                        src={`/storage/${questionnaire.pedido_medico}`}
                                                        alt="Pedido Médico"
                                                        className="max-w-full h-auto border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-gray-900/50 cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => setIsImageModalOpen(true)}
                                                    />
                                                    <button
                                                        onClick={() => setIsImageModalOpen(true)}
                                                        className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                        title="Ampliar imagem"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                                        </svg>
                                                    </button>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                                        Clique na imagem para ampliar
                                                    </p>
                                                </dd>
                                            </div>
                                        )}
                                        {questionnaire.assinatura_paciente && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Assinatura do Paciente</dt>
                                                <dd>
                                                    <img 
                                                        src={questionnaire.assinatura_paciente}
                                                        alt="Assinatura do Paciente"
                                                        className="max-w-full h-auto border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-gray-900/50"
                                                    />
                                                </dd>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Modal de zoom para pedido médico */}
                            {questionnaire.pedido_medico && (
                                <ImageZoomModal
                                    isOpen={isImageModalOpen}
                                    onClose={() => setIsImageModalOpen(false)}
                                    imageSrc={`/storage/${questionnaire.pedido_medico}`}
                                    imageAlt="Pedido Médico"
                                />
                            )}

                            {/* Informação de última modificação */}
                            <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors duration-200">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">{questionnaire.last_modified_by}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
