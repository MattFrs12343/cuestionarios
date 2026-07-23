import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { formatDateShort } from '@/Utils/dateFormatter';
import { useState, useRef } from 'react';
import QuestionnaireExportView from '@/Components/QuestionnaireExportView';
import html2canvas from 'html2canvas';

export default function Show({ auth, questionnaire, can }) {
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
                    <QuestionnaireExportView questionnaire={questionnaire} type="electroneuromiografia" />
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
                    const fileName = `questionario_enmg_${questionnaire.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.jpg`;
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
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value
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
                                Eletroneuromiografia
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Visualizar Questionário - ENMG" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        {/* Header do Questionário */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-white">{questionnaire.nome}</h1>
                                        <p className="text-indigo-100 text-sm mt-1">Eletroneuromiografia - {formatDateShort(questionnaire.data_exame)}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleExportToJPG}
                                        disabled={isExporting}
                                        className="inline-flex items-center bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Exportar questionário como imagem JPG"
                                    >
                                        {isExporting ? (
                                            <>
                                                <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Exportando...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Exportar JPG
                                            </>
                                        )}
                                    </button>
                                    <Link
                                        href={route('questionnaires.electroneuromiografia.index')}
                                        className="inline-flex items-center bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 backdrop-blur-sm"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Voltar
                                    </Link>
                                    {can.edit && (
                                        <Link
                                            href={route('questionnaires.electroneuromiografia.edit', questionnaire.id)}
                                            className="inline-flex items-center bg-white hover:bg-gray-50 text-indigo-600 dark:text-indigo-700 font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-xl p-6 border-l-4 border-indigo-500 dark:border-indigo-400">
                                <h4 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center">
                                    <span className="w-8 h-8 bg-indigo-500 dark:bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </span>
                                    Dados Básicos
                                </h4>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.nome}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Data de Nascimento</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {formatDateShort(questionnaire.data_nascimento)}
                                            {questionnaire.idade && <span className="ml-2 text-gray-600 dark:text-gray-400">({questionnaire.idade})</span>}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Peso</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.peso || 'Não informado'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Altura</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.altura || 'Não informado'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Data do Exame</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDateShort(questionnaire.data_exame)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">RG</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.rg}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sexo</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.sexo}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Solicitante</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.solicitante}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Clínica</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.clinica}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Equipe</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.team.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipos de Exame</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {questionnaire.tipos_exame && questionnaire.tipos_exame.length > 0
                                                ? questionnaire.tipos_exame.join(', ')
                                                : 'Não informado'}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Informação Adicional */}
                            <div className="mb-8">
                                <h4 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Informação Adicional</h4>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <BooleanDisplay label="É primeira vez que vai fazer esse exame?" value={questionnaire.primeira_vez_exame} />
                                    <BooleanDisplay label="Diabético(a)" value={questionnaire.diabetico} />
                                    <BooleanDisplay label="Se diabético(a), faz o tratamento?" value={questionnaire.diabetico_tratamento} />
                                    <BooleanDisplay label="Está tomando medicamentos (Glifage, Metformina, AAS.)" value={questionnaire.tomando_medicamentos} />
                                    {questionnaire.tomando_medicamentos && questionnaire.medicamentos_detalhes && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Medicamentos que está tomando:
                                            </label>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                                <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                                                    {questionnaire.medicamentos_detalhes}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <BooleanDisplay label="Pegou COVID?" value={questionnaire.teve_covid} />
                                    <BooleanDisplay
                                        label="Teve AVC?"
                                        value={questionnaire.teve_avc}
                                        conditionalValue={questionnaire.avc_tipo && questionnaire.avc_quando ? `${questionnaire.avc_tipo} - ${questionnaire.avc_quando}` : questionnaire.avc_tipo || questionnaire.avc_quando}
                                    />
                                    <BooleanDisplay label="Sente dor na coluna?" value={questionnaire.dor_coluna} />

                                    {questionnaire.dor_coluna && questionnaire.areas_coluna && questionnaire.areas_coluna.length > 0 && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Áreas da coluna afetadas</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.areas_coluna.join(', ')}</dd>
                                        </div>
                                    )}

                                    <BooleanDisplay label="Trabalha" value={questionnaire.trabalha} conditionalValue={questionnaire.tipo_trabalho} />
                                    <BooleanDisplay label="Teve fraturas?" value={questionnaire.teve_fraturas} conditionalValue={questionnaire.fraturas_regiao} />
                                    <BooleanDisplay label="Já fez ou faz quimioterapia?" value={questionnaire.faz_quimioterapia} />
                                    <BooleanDisplay label="Já fez ou faz radioterapia?" value={questionnaire.faz_radioterapia} />
                                    <BooleanDisplay label="Já fez ou faz hemodiálise?" value={questionnaire.faz_hemodialise} />
                                    <BooleanDisplay label="Tem Marca-passo?" value={questionnaire.tem_marcapasso} />
                                    <BooleanDisplay label="Recentemente passou por um processo infeccioso?" value={questionnaire.processo_infeccioso} conditionalValue={questionnaire.processo_infeccioso_detalhes} />
                                    <BooleanDisplay label="Consome alguma bebida alcoólica?" value={questionnaire.consome_alcool} conditionalValue={questionnaire.alcool_frequencia} />
                                    <BooleanDisplay label="Experimentou drogas?" value={questionnaire.usa_drogas} conditionalValue={questionnaire.drogas_quais} />
                                </dl>
                            </div>

                            {/* Membros Superiores */}
                            <div className="mb-8">
                                <h4 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Membros Superiores</h4>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <BooleanDisplay label="Sente dor nos braços?" value={questionnaire.ms_dor_bracos} />
                                    <BooleanDisplay label="A dor começa nos ombros?" value={questionnaire.ms_dor_comeca_ombros} />
                                    <BooleanDisplay label="Sente dor nas mãos?" value={questionnaire.ms_dor_maos} />

                                    {questionnaire.ms_dor_mais_de && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">A dor é mais de</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.ms_dor_mais_de}</dd>
                                        </div>
                                    )}

                                    <BooleanDisplay label="Sente formigamento nos braços?" value={questionnaire.ms_formigamento_bracos} />
                                    <BooleanDisplay label="O formigamento começa nos ombros?" value={questionnaire.ms_formigamento_comeca_ombros} />
                                    <BooleanDisplay label="Sente formigamento nas mãos?" value={questionnaire.ms_formigamento_maos} />
                                    <BooleanDisplay label="Sente dormência nos braços?" value={questionnaire.ms_dormencia_bracos} />
                                    <BooleanDisplay label="A dormência começa nos ombros?" value={questionnaire.ms_dormencia_comeca_ombros} />
                                    <BooleanDisplay label="Sente dormência nas mãos?" value={questionnaire.ms_dormencia_maos} />
                                    <BooleanDisplay label="Tem tremores nos braços?" value={questionnaire.ms_tremores_bracos} />
                                    <BooleanDisplay label="Tem tremores nas mãos?" value={questionnaire.ms_tremores_maos} />
                                    <BooleanDisplay label="O 1º (polegar) dedo treme?" value={questionnaire.ms_polegar_treme} />
                                    <BooleanDisplay label="Sente fraqueza nos braços?" value={questionnaire.ms_fraqueza_bracos} />
                                    <BooleanDisplay label="Sente fraqueza nas mãos?" value={questionnaire.ms_fraqueza_maos} />
                                    <BooleanDisplay label="Sente fadiga ao falar?" value={questionnaire.ms_fadiga_falar} />
                                    <BooleanDisplay label="Perda de peso nestes últimos meses?" value={questionnaire.ms_perda_peso} />
                                    <BooleanDisplay label="Tem sensação de queimação nas mãos, braços?" value={questionnaire.ms_queimacao} />
                                    <BooleanDisplay label="Sente cãibra (braços/mãos)?" value={questionnaire.ms_caibra} />

                                    {questionnaire.ms_membro_mais_afetado && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Membro mais afetado</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.ms_membro_mais_afetado}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>

                            {/* Membros Inferiores */}
                            <div className="mb-8">
                                <h4 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Membros Inferiores</h4>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <BooleanDisplay label="Sente dor nas pernas?" value={questionnaire.mi_dor_pernas} />
                                    <BooleanDisplay label="A dor começa na bacia?" value={questionnaire.mi_dor_comeca_bacia} />
                                    <BooleanDisplay label="A dor passa pelas nádegas, coxa se estende até joelho indo até pés (CIÁTICO)?" value={questionnaire.mi_dor_ciatico} />
                                    <BooleanDisplay label="Sente dor nos pés?" value={questionnaire.mi_dor_pes} />
                                    <BooleanDisplay label="Sente formigamento nas pernas?" value={questionnaire.mi_formigamento_pernas} />
                                    <BooleanDisplay label="O formigamento começa na bacia?" value={questionnaire.mi_formigamento_comeca_bacia} />
                                    <BooleanDisplay label="Sente formigamento nos pés?" value={questionnaire.mi_formigamento_pes} />
                                    <BooleanDisplay label="Sente dormência nas pernas?" value={questionnaire.mi_dormencia_pernas} />
                                    <BooleanDisplay label="A dormência começa na bacia?" value={questionnaire.mi_dormencia_comeca_bacia} />
                                    <BooleanDisplay label="Sente dormência nos pés?" value={questionnaire.mi_dormencia_pes} />
                                    <BooleanDisplay label="Tem tremores nas pernas?" value={questionnaire.mi_tremores_pernas} />
                                    <BooleanDisplay label="Tem tremores nos pés?" value={questionnaire.mi_tremores_pes} />
                                    <BooleanDisplay label="Sente fraqueza nas pernas?" value={questionnaire.mi_fraqueza_pernas} />
                                    <BooleanDisplay label="Sente fraqueza nos pés?" value={questionnaire.mi_fraqueza_pes} />
                                    <BooleanDisplay label="A fraqueza é ascendente?" value={questionnaire.mi_fraqueza_ascendente} />
                                    <BooleanDisplay label="Sente fadiga ao falar?" value={questionnaire.mi_fadiga_falar} />
                                    <BooleanDisplay label="Perda de peso nestes últimos meses?" value={questionnaire.mi_perda_peso} />
                                    <BooleanDisplay label="Tem sensação de queimação nos pés, pernas?" value={questionnaire.mi_queimacao} />
                                    <BooleanDisplay label="Sente cãibra (pernas/pés)?" value={questionnaire.mi_caibra} />

                                    {questionnaire.mi_membro_mais_afetado && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Membro mais afetado</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{questionnaire.mi_membro_mais_afetado}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>

                            {/* Especialistas */}
                            <div className="mb-8">
                                <h4 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Especialistas</h4>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <BooleanDisplay label="Consultou com REUMATOLOGISTA?" value={questionnaire.consultou_reumatologista} conditionalValue={questionnaire.reumatologista_motivo} />
                                    <BooleanDisplay label="Consultou com NEUROLOGISTA?" value={questionnaire.consultou_neurologista} conditionalValue={questionnaire.neurologista_motivo} />
                                    <BooleanDisplay label="Consultou com NEUROCIRURGIÃO?" value={questionnaire.consultou_neurocirurgiao} conditionalValue={questionnaire.neurocirurgiao_motivo} />
                                    <BooleanDisplay label="Consultou com DERMATOLOGISTA?" value={questionnaire.consultou_dermatologista} conditionalValue={questionnaire.dermatologista_motivo} />
                                    <BooleanDisplay label="Consultou com GERIATRA?" value={questionnaire.consultou_geriatra} conditionalValue={questionnaire.geriatra_motivo} />
                                    <BooleanDisplay label="Consultou com ORTOPEDISTA?" value={questionnaire.consultou_ortopedista} conditionalValue={questionnaire.ortopedista_motivo} />
                                </dl>
                            </div>

                            {/* Observações */}
                            {questionnaire.observacoes && (
                                <div className="mb-8">
                                    <h4 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Observações</h4>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{questionnaire.observacoes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Profissionais */}
                            <div className="mb-8">
                                <h4 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Profissionais</h4>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                </dl>
                            </div>

                            {/* Arquivos */}
                            <div className="mb-8">
                                <h4 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Arquivos</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Pedido Médico</dt>
                                        {questionnaire.pedido_medico ? (
                                            <div>
                                                <img
                                                    src={`/storage/${questionnaire.pedido_medico}`}
                                                    alt="Pedido médico"
                                                    className="max-w-full h-48 object-cover rounded border cursor-pointer"
                                                    onClick={() => window.open(`/storage/${questionnaire.pedido_medico}`, '_blank')}
                                                />
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Clique para ampliar</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum arquivo enviado</p>
                                        )}
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Assinatura do Paciente ou Acompanhante</dt>
                                        {questionnaire.assinatura_paciente ? (
                                            <div>
                                                <img
                                                    src={questionnaire.assinatura_paciente}
                                                    alt="Assinatura do paciente"
                                                    className="max-w-full h-32 object-contain border rounded bg-white"
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma assinatura registrada</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Informações de auditoria */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    <p>Criado em: {questionnaire.created_at ? new Date(questionnaire.created_at).toLocaleString('pt-BR') : 'N/A'}</p>
                                    {questionnaire.creator && <p>Criado por: {questionnaire.creator.name}</p>}
                                    {questionnaire.updated_at && questionnaire.updated_at !== questionnaire.created_at && (
                                        <>
                                            <p>Última atualização: {new Date(questionnaire.updated_at).toLocaleString('pt-BR')}</p>
                                            {questionnaire.editor && <p>Atualizado por: {questionnaire.editor.name}</p>}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}