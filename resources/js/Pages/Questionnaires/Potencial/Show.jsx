import React, { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ImageZoomModal from '@/Components/ImageZoomModal';
import QuestionnaireExportView from '@/Components/QuestionnaireExportView';
import html2canvas from 'html2canvas';

export default function Show({ auth, questionnaire, can }) {
    const { t } = useTranslation();
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [showMedicalRequestModal, setShowMedicalRequestModal] = useState(false);
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
                    <QuestionnaireExportView questionnaire={questionnaire} type="potencial" />
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
                    const fileName = `questionario_potencial_${questionnaire.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.jpg`;
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

    const formatBoolean = (value) => {
        return value ? t('Sim') : t('Não');
    };

    const InfoSection = ({ title, children }) => (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                {title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children}
            </div>
        </div>
    );

    const InfoItem = ({ label, value, fullWidth = false }) => (
        <div className={fullWidth ? "col-span-2" : ""}>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {label}
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {value || '-'}
            </dd>
        </div>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        {t('Questionário de Potencial Evocado')} - {questionnaire.nome}
                    </h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleExportToJPG}
                            disabled={isExporting}
                            className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Exportar questionário como imagem JPG"
                        >
                            {isExporting ? (
                                <>
                                    <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('Exportando...')}
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    {t('Exportar JPG')}
                                </>
                            )}
                        </button>
                        {can.edit && (
                            <Link href={route('questionnaires.potencial.edit', questionnaire.id)}>
                                <PrimaryButton>
                                    {t('Editar')}
                                </PrimaryButton>
                            </Link>
                        )}
                        <Link href={route('questionnaires.potencial.index')}>
                            <SecondaryButton>
                                {t('Voltar')}
                            </SecondaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Questionário - ${questionnaire.nome}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 space-y-6">
                            {/* Dados Básicos */}
                            <InfoSection title={t('Dados Básicos')}>
                                <InfoItem label={t('Nome')} value={questionnaire.nome} />
                                <InfoItem label={t('RG ou CPF')} value={questionnaire.rg} />
                                <InfoItem label={t('Data de Nascimento')} value={new Date(questionnaire.data_nascimento).toLocaleDateString('pt-BR')} />
                                <InfoItem label={t('Idade')} value={questionnaire.idade} />
                                <InfoItem label={t('Peso')} value={questionnaire.peso} />
                                <InfoItem label={t('Altura')} value={questionnaire.altura} />
                                <InfoItem label={t('Data do Exame')} value={new Date(questionnaire.data_exame).toLocaleDateString('pt-BR')} />
                                <InfoItem label={t('Sexo')} value={questionnaire.sexo} />
                                <InfoItem label={t('Solicitante')} value={questionnaire.solicitante} />
                                <InfoItem label={t('Clínica')} value={questionnaire.clinica} />
                                <InfoItem label={t('Equipe')} value={questionnaire.team?.name} />
                            </InfoSection>

                            {/* Potencial Evocado Auditivo */}
                            <InfoSection title={t('Questionário de Potencial Evocado Auditivo')}>
                                <InfoItem label={t('Tem zumbido no ouvido?')} value={formatBoolean(questionnaire.tem_zumbido_ouvido)} />
                                <InfoItem 
                                    label={t('Passou com fonoaudiólogo?')} 
                                    value={questionnaire.passou_fonoaudiologo ? 
                                        `${t('Sim')} ${questionnaire.fonoaudiologo_motivo ? `(${questionnaire.fonoaudiologo_motivo})` : ''}` : 
                                        t('Não')
                                    } 
                                />
                                <InfoItem 
                                    label={t('Passou com otorrino?')} 
                                    value={questionnaire.passou_otorrino ? 
                                        `${t('Sim')} ${questionnaire.otorrino_motivo ? `(${questionnaire.otorrino_motivo})` : ''}` : 
                                        t('Não')
                                    } 
                                />
                                <InfoItem 
                                    label={t('Passa com neurologista?')} 
                                    value={questionnaire.passa_neurologista ? 
                                        `${t('Sim')} ${questionnaire.neurologista_motivo ? `(${questionnaire.neurologista_motivo})` : ''}` : 
                                        t('Não')
                                    } 
                                />
                                <InfoItem 
                                    label={t('Passa com neuropediatra?')} 
                                    value={questionnaire.passa_neuropediatra ? 
                                        `${t('Sim')} ${questionnaire.neuropediatra_motivo ? `(${questionnaire.neuropediatra_motivo})` : ''}` : 
                                        t('Não')
                                    } 
                                />
                                <InfoItem 
                                    label={t('Passa com psiquiatra?')} 
                                    value={questionnaire.passa_psiquiatra ? 
                                        `${t('Sim')} ${questionnaire.psiquiatra_motivo ? `(${questionnaire.psiquiatra_motivo})` : ''}` : 
                                        t('Não')
                                    } 
                                />
                                <InfoItem 
                                    label={t('Tem retardo mental?')} 
                                    value={questionnaire.tem_retardo_mental ? 
                                        `${t('Sim')} ${questionnaire.retardo_mental_grau ? `(${questionnaire.retardo_mental_grau})` : ''}` : 
                                        t('Não')
                                    } 
                                />
                                <InfoItem label={t('Tem paralisia cerebral?')} value={formatBoolean(questionnaire.tem_paralisia_cerebral)} />
                                <InfoItem label={t('Síndrome de Down?')} value={formatBoolean(questionnaire.sindrome_down)} />
                                <InfoItem label={t('Autismo?')} value={formatBoolean(questionnaire.autismo)} />
                                <InfoItem label={t('Cefaléa ou Enxaqueca?')} value={formatBoolean(questionnaire.cefaleia_enxaqueca)} />
                                <InfoItem label={t('Crise Convulsiva?')} value={formatBoolean(questionnaire.crise_convulsiva)} />
                                <InfoItem label={t('Desmaios?')} value={formatBoolean(questionnaire.desmaios)} />
                                <InfoItem label={t('Dificuldade na fala?')} value={formatBoolean(questionnaire.dificuldade_fala)} />
                                <InfoItem label={t('Déficit de atenção?')} value={formatBoolean(questionnaire.deficit_atencao)} />
                                <InfoItem label={t('Dificuldade de aprendizado?')} value={formatBoolean(questionnaire.dificuldade_aprendizado)} />
                                <InfoItem 
                                    label={t('Familiar com perda auditiva?')} 
                                    value={questionnaire.familiar_perda_auditiva ? 
                                        `${t('Sim')} ${questionnaire.familiar_perda_auditiva_quem ? `(${questionnaire.familiar_perda_auditiva_quem})` : ''}` : 
                                        t('Não')
                                    } 
                                />
                                <InfoItem label={t('Teste da orelhinha alterado?')} value={formatBoolean(questionnaire.teste_orelhinha_alterado)} />
                                <InfoItem label={t('Meses de gestação')} value={questionnaire.gestacao_meses} />
                                <InfoItem 
                                    label={t('Teve perda da audição?')} 
                                    value={questionnaire.teve_perda_audicao ? 
                                        `${t('Sim')} ${questionnaire.perda_audicao_ouvido ? `(${questionnaire.perda_audicao_ouvido})` : ''}` : 
                                        t('Não')
                                    } 
                                />
                                <InfoItem label={t('Teve infecção de ouvido?')} value={formatBoolean(questionnaire.teve_infeccao_ouvido)} />
                                <InfoItem label={t('Teve trauma de ouvido?')} value={formatBoolean(questionnaire.teve_trauma_ouvido)} />
                                <InfoItem label={t('Tem labirintite ou tontura?')} value={formatBoolean(questionnaire.tem_labirintite_tontura_auditivo)} />
                                <InfoItem label={t('Tem hipertensão arterial?')} value={formatBoolean(questionnaire.tem_hipertensao_auditivo)} />
                                <InfoItem label={t('Tem diabetes?')} value={formatBoolean(questionnaire.tem_diabetes_auditivo)} />
                            </InfoSection>

                            {/* Potencial Evocado Visual */}
                            <InfoSection title={t('Questionário de Potencial Evocado Visual')}>
                                <InfoItem 
                                    label={t('Já teve AVC?')} 
                                    value={questionnaire.teve_avc ? 
                                        `${t('Sim')} ${questionnaire.avc_quando ? `(${questionnaire.avc_quando})` : ''}` : 
                                        t('Não')
                                    } 
                                />
                                <InfoItem label={t('Dificuldade para olhar fixo?')} value={formatBoolean(questionnaire.dificuldade_olhar_fixo)} />
                                <InfoItem label={t('Tem diplopia (visão dupla)?')} value={formatBoolean(questionnaire.tem_diplopia)} />
                                <InfoItem 
                                    label={t('Passou com oftalmologista?')} 
                                    value={questionnaire.passou_oftalmologista ? 
                                        `${t('Sim')} ${questionnaire.oftalmologista_motivo ? `(${questionnaire.oftalmologista_motivo})` : ''}` : 
                                        t('Não')
                                    } 
                                />
                                <InfoItem 
                                    label={t('Tem patologia no olho?')} 
                                    value={questionnaire.tem_patologia_olho ? 
                                        `${t('Sim')} ${questionnaire.patologia_olho_detalhes ? `(${questionnaire.patologia_olho_detalhes})` : ''}` : 
                                        t('Não')
                                    } 
                                />
                                <InfoItem 
                                    label={t('Usa óculos?')} 
                                    value={questionnaire.usa_oculos ? 
                                        `${t('Sim')} ${questionnaire.grau_oculos ? `(${questionnaire.grau_oculos})` : ''}` : 
                                        t('Não')
                                    } 
                                />
                                <InfoItem label={t('Cefaléia?')} value={formatBoolean(questionnaire.cefaleia_visual)} />
                                <InfoItem label={t('Tem enxaqueca?')} value={formatBoolean(questionnaire.tem_enxaqueca_visual)} />
                                <InfoItem label={t('Se incomoda com claridade?')} value={formatBoolean(questionnaire.incomoda_claridade)} />
                                <InfoItem label={t('Vê pontinhos coloridos?')} value={formatBoolean(questionnaire.ve_pontinhos_coloridos)} />
                                <InfoItem label={t('Tem alucinações visuais?')} value={formatBoolean(questionnaire.tem_alucinacoes_visuais)} />
                                <InfoItem label={t('Tem labirintite ou tontura?')} value={formatBoolean(questionnaire.tem_labirintite_tontura_visual)} />
                                <InfoItem label={t('Tem hipertensão arterial?')} value={formatBoolean(questionnaire.tem_hipertensao_visual)} />
                                <InfoItem label={t('Tem diabetes?')} value={formatBoolean(questionnaire.tem_diabetes_visual)} />
                            </InfoSection>

                            {/* Observações */}
                            {questionnaire.observacoes && (
                                <InfoSection title={t('Observações')}>
                                    <InfoItem 
                                        label={t('Observações')} 
                                        value={questionnaire.observacoes} 
                                        fullWidth={true}
                                    />
                                </InfoSection>
                            )}

                            {/* Assinatura e Documentos */}
                            <InfoSection title={t('Assinatura e Documentos')}>
                                <div className="col-span-2 space-y-4">
                                    {questionnaire.assinatura_paciente && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                {t('Assinatura do Paciente')}
                                            </dt>
                                            <dd>
                                                <button
                                                    onClick={() => setShowSignatureModal(true)}
                                                    className="inline-block border border-gray-300 dark:border-gray-600 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <img
                                                        src={questionnaire.assinatura_paciente}
                                                        alt={t('Assinatura do Paciente')}
                                                        className="h-20 w-auto"
                                                    />
                                                </button>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {t('Clique para ampliar')}
                                                </p>
                                            </dd>
                                        </div>
                                    )}

                                    {questionnaire.pedido_medico && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                {t('Pedido Médico')}
                                            </dt>
                                            <dd>
                                                <button
                                                    onClick={() => setShowMedicalRequestModal(true)}
                                                    className="inline-block border border-gray-300 dark:border-gray-600 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <img
                                                        src={`/storage/${questionnaire.pedido_medico}`}
                                                        alt={t('Pedido Médico')}
                                                        className="h-20 w-auto"
                                                    />
                                                </button>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {t('Clique para ampliar')}
                                                </p>
                                            </dd>
                                        </div>
                                    )}
                                </div>
                            </InfoSection>

                            {/* Informações de Auditoria */}
                            <InfoSection title={t('Informações do Sistema')}>
                                <InfoItem label={t('Criado por')} value={questionnaire.creator?.name} />
                                <InfoItem label={t('Data de criação')} value={new Date(questionnaire.created_at).toLocaleString('pt-BR')} />
                                <InfoItem label={t('Última modificação')} value={questionnaire.last_modified_by} />
                                <InfoItem label={t('Equipe')} value={questionnaire.team?.name} />
                            </InfoSection>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para ampliar assinatura */}
            <ImageZoomModal
                show={showSignatureModal}
                onClose={() => setShowSignatureModal(false)}
                imageUrl={questionnaire.assinatura_paciente}
                title={t('Assinatura do Paciente')}
            />

            {/* Modal para ampliar pedido médico */}
            <ImageZoomModal
                show={showMedicalRequestModal}
                onClose={() => setShowMedicalRequestModal(false)}
                imageUrl={questionnaire.pedido_medico ? `/storage/${questionnaire.pedido_medico}` : ''}
                title={t('Pedido Médico')}
            />
        </AuthenticatedLayout>
    );
}