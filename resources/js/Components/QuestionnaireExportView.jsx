import { formatDateShort } from '@/Utils/dateFormatter';

export default function QuestionnaireExportView({ questionnaire, type = 'electroencefalograma' }) {
    const InfoRow = ({ label, value }) => (
        <div className="mb-1">
            <span className="text-xs font-semibold text-gray-700">{label}</span>
            <div className="text-xs text-gray-900">{value}</div>
        </div>
    );

    const BooleanRow = ({ label, value, conditionalValue = null }) => (
        <div className="mb-1">
            <span className="text-xs font-semibold text-gray-700">{label}</span>
            <div className="text-xs text-gray-900">
                {value ? 'Sim' : 'Não'}
                {value && conditionalValue && (
                    <span className="ml-1 text-gray-700">({conditionalValue})</span>
                )}
            </div>
        </div>
    );

    if (type === 'electroencefalograma') {
        return (
            <div className="bg-white" style={{ width: '210mm', height: '297mm', padding: '10mm', fontFamily: 'Arial, sans-serif', fontSize: '11px' }}>
                {/* Header */}
                <div className="bg-blue-600 text-white px-3 py-2 mb-3" style={{ borderRadius: '3px' }}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-sm font-bold mb-0" style={{ lineHeight: '1.2' }}>Sistema de Questionários - EEG</h1>
                            <p className="text-xs mb-0" style={{ lineHeight: '1.2' }}>Eletroencefalograma</p>
                        </div>
                        <div className="text-right" style={{ fontSize: '9px', lineHeight: '1.3' }}>
                            <div>Data de Exportação: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                            <div>Paciente: {questionnaire.nome_completo}</div>
                        </div>
                    </div>
                </div>

                {/* Informações do Paciente */}
                <div className="mb-2">
                    <h2 className="text-xs font-bold bg-gray-200 px-2 py-1 mb-2" style={{ borderRadius: '3px', lineHeight: '1.2' }}>Informações do Paciente</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-0 px-2">
                        <InfoRow label="Nome Completo" value={questionnaire.nome_completo} />
                        <InfoRow label="Data do Exame" value={formatDateShort(questionnaire.data_exame)} />
                        <InfoRow label="RG ou CPF" value={questionnaire.rg_ou_cpf} />
                        <InfoRow label="Clínica" value={questionnaire.clinica} />
                        <InfoRow label="Data de Nascimento" value={formatDateShort(questionnaire.data_nascimento)} />
                        <InfoRow label="Equipe" value={questionnaire.team.name} />
                        <InfoRow label="Idade" value={questionnaire.idade} />
                        <InfoRow label="Tipo de Exame" value={questionnaire.tipo_exame || 'FOTO'} />
                        <InfoRow label="Sexo" value={questionnaire.sexo} />
                        <InfoRow label="Momento do Exame" value={questionnaire.momento_exame} />
                    </div>
                </div>

                {/* Histórico Médico */}
                <div className="mb-2">
                    <h2 className="text-xs font-bold bg-gray-200 px-2 py-1 mb-2" style={{ borderRadius: '3px', lineHeight: '1.2' }}>Histórico Médico</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-0 px-2">
                        <BooleanRow label="Teve COVID-19?" value={questionnaire.teve_covid} />
                        <BooleanRow label="Teve desmaio?" value={questionnaire.teve_desmaio} />
                        <BooleanRow 
                            label="Já teve AVC?" 
                            value={questionnaire.ja_teve_avc}
                            conditionalValue={questionnaire.quando_teve_avc}
                        />
                        <BooleanRow 
                            label="Já teve convulsão?" 
                            value={questionnaire.ja_teve_convulsao}
                            conditionalValue={questionnaire.quando_teve_convulsao}
                        />
                        <BooleanRow label="Já bateu a cabeça?" value={questionnaire.ja_bateu_cabeca} />
                        <BooleanRow label="Tem dor de cabeça?" value={questionnaire.tem_dor_cabeca} />
                    </div>
                </div>

                {/* Condições Médicas */}
                <div className="mb-2">
                    <h2 className="text-xs font-bold bg-gray-200 px-2 py-1 mb-2" style={{ borderRadius: '3px', lineHeight: '1.2' }}>Condições Médicas</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-0 px-2">
                        <BooleanRow label="Tem depressão?" value={questionnaire.tem_depressao} />
                        <BooleanRow label="Tem ansiedade?" value={questionnaire.tem_ansiedade} />
                        <BooleanRow label="Tem insônia?" value={questionnaire.tem_insonia} />
                        <BooleanRow label="Tem esquecimento?" value={questionnaire.tem_esquecimento} />
                        <BooleanRow label="Tem Alzheimer?" value={questionnaire.tem_alzheimer} />
                        <BooleanRow label="Tem Parkinson?" value={questionnaire.tem_parkinson} />
                    </div>
                </div>

                {/* Condições Crônicas */}
                <div className="mb-2">
                    <h2 className="text-xs font-bold bg-gray-200 px-2 py-1 mb-2" style={{ borderRadius: '3px', lineHeight: '1.2' }}>Condições Crônicas</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-0 px-2">
                        <BooleanRow 
                            label="Tem hipertensão?" 
                            value={questionnaire.hipertensao}
                            conditionalValue={questionnaire.hipertensao_faz_uso}
                        />
                        <BooleanRow 
                            label="Tem diabetes?" 
                            value={questionnaire.diabetes}
                            conditionalValue={questionnaire.diabetes_faz_uso}
                        />
                    </div>
                </div>

                {/* Condições Comportamentais */}
                <div className="mb-2">
                    <h2 className="text-xs font-bold bg-gray-200 px-2 py-1 mb-2" style={{ borderRadius: '3px', lineHeight: '1.2' }}>Condições Comportamentais</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-0 px-2">
                        <BooleanRow label="Dificuldade de aprendizado?" value={questionnaire.tem_dificuldade_aprendizado} />
                        <BooleanRow label="É hiperativo?" value={questionnaire.hiperativo} />
                        <BooleanRow label="É agressivo?" value={questionnaire.agressivo} />
                        <BooleanRow label="Tem autismo?" value={questionnaire.autismo} />
                        <BooleanRow label="Tem dificuldade para dormir?" value={questionnaire.tem_dificuldade_dormir} />
                    </div>
                </div>

                {/* Informações Profissionais */}
                <div className="mb-2">
                    <h2 className="text-xs font-bold bg-gray-200 px-2 py-1 mb-2" style={{ borderRadius: '3px', lineHeight: '1.2' }}>Informações Profissionais</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-0 px-2">
                        <InfoRow label="Profissional que fez o Pedido" value={questionnaire.nome_profissional_pedido} />
                        <InfoRow label="Técnico/Médico do Exame" value={questionnaire.nome_tecnico_medico_exame} />
                    </div>
                </div>

                {/* Comentários */}
                {questionnaire.comentario && (
                    <div className="mb-2">
                        <h2 className="text-xs font-bold bg-gray-200 px-2 py-1 mb-2" style={{ borderRadius: '3px', lineHeight: '1.2' }}>Comentários</h2>
                        <div className="px-2">
                            <div className="text-xs font-semibold text-gray-700 mb-0">Comentários</div>
                            <div className="text-xs text-gray-900 whitespace-pre-wrap" style={{ lineHeight: '1.3' }}>{questionnaire.comentario}</div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-2 pt-2 text-center" style={{ borderTop: '1px solid #d1d5db', position: 'absolute', bottom: '10mm', left: '10mm', right: '10mm' }}>
                    <p className="text-xs text-gray-600 mb-0" style={{ lineHeight: '1.2' }}>
                        Criado em: {new Date(questionnaire.created_at).toLocaleDateString('pt-BR')} {new Date(questionnaire.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-600 mb-0" style={{ lineHeight: '1.2' }}>Por: {questionnaire.creator?.name || 'Sistema'}</p>
                </div>
            </div>
        );
    }

    // Potencial Evocado
    if (type === 'potencial') {
        return (
            <div className="bg-white" style={{ width: '210mm', height: '297mm', padding: '6mm 8mm 8mm 8mm', fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>
                {/* Header */}
                <div className="bg-purple-600 text-white px-3 py-1 mb-1.5" style={{ borderRadius: '3px' }}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-sm font-bold mb-0" style={{ lineHeight: '1.2' }}>Sistema de Questionários - Potencial Evocado</h1>
                            <p className="text-xs mb-0" style={{ lineHeight: '1.2' }}>Potencial Evocado Auditivo e Visual</p>
                        </div>
                        <div className="text-right" style={{ fontSize: '9px', lineHeight: '1.2' }}>
                            <div>Data: {new Date().toLocaleDateString('pt-BR')}</div>
                            <div>Paciente: {questionnaire.nome}</div>
                        </div>
                    </div>
                </div>

                {/* Dados Básicos */}
                <div className="mb-1.5">
                    <h2 className="text-xs font-bold bg-gray-200 px-2 py-0.5 mb-1" style={{ borderRadius: '3px', lineHeight: '1.2' }}>Dados Básicos</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-0 px-2">
                        <InfoRow label="Nome" value={questionnaire.nome} />
                        <InfoRow label="RG ou CPF" value={questionnaire.rg} />
                        <InfoRow label="Data de Nascimento" value={formatDateShort(questionnaire.data_nascimento)} />
                        <InfoRow label="Idade" value={questionnaire.idade} />
                        <InfoRow label="Peso" value={questionnaire.peso} />
                        <InfoRow label="Altura" value={questionnaire.altura} />
                        <InfoRow label="Data do Exame" value={formatDateShort(questionnaire.data_exame)} />
                        <InfoRow label="Sexo" value={questionnaire.sexo} />
                        <InfoRow label="Solicitante" value={questionnaire.solicitante} />
                        <InfoRow label="Clínica" value={questionnaire.clinica} />
                    </div>
                </div>

                {/* Potencial Evocado Auditivo */}
                <div className="mb-1.5">
                    <h2 className="text-xs font-bold bg-gray-200 px-2 py-0.5 mb-1" style={{ borderRadius: '3px', lineHeight: '1.2' }}>Potencial Evocado Auditivo</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-0 px-2">
                        <BooleanRow label="Tem zumbido no ouvido?" value={questionnaire.tem_zumbido_ouvido} />
                        <BooleanRow label="Passou com fonoaudiólogo?" value={questionnaire.passou_fonoaudiologo} conditionalValue={questionnaire.fonoaudiologo_motivo} />
                        <BooleanRow label="Passou com otorrino?" value={questionnaire.passou_otorrino} conditionalValue={questionnaire.otorrino_motivo} />
                        <BooleanRow label="Passa com neurologista?" value={questionnaire.passa_neurologista} conditionalValue={questionnaire.neurologista_motivo} />
                        <BooleanRow label="Passa com neuropediatra?" value={questionnaire.passa_neuropediatra} conditionalValue={questionnaire.neuropediatra_motivo} />
                        <BooleanRow label="Passa com psiquiatra?" value={questionnaire.passa_psiquiatra} conditionalValue={questionnaire.psiquiatra_motivo} />
                        <BooleanRow label="Tem retardo mental?" value={questionnaire.tem_retardo_mental} conditionalValue={questionnaire.retardo_mental_grau} />
                        <BooleanRow label="Tem paralisia cerebral?" value={questionnaire.tem_paralisia_cerebral} />
                        <BooleanRow label="Síndrome de Down?" value={questionnaire.sindrome_down} />
                        <BooleanRow label="Autismo?" value={questionnaire.autismo} />
                        <BooleanRow label="Cefaléa ou Enxaqueca?" value={questionnaire.cefaleia_enxaqueca} />
                        <BooleanRow label="Crise Convulsiva?" value={questionnaire.crise_convulsiva} />
                        <BooleanRow label="Desmaios?" value={questionnaire.desmaios} />
                        <BooleanRow label="Dificuldade na fala?" value={questionnaire.dificuldade_fala} />
                        <BooleanRow label="Déficit de atenção?" value={questionnaire.deficit_atencao} />
                        <BooleanRow label="Dificuldade de aprendizado?" value={questionnaire.dificuldade_aprendizado} />
                        <BooleanRow label="Familiar com perda auditiva?" value={questionnaire.familiar_perda_auditiva} conditionalValue={questionnaire.familiar_perda_auditiva_quem} />
                        <BooleanRow label="Teste da orelhinha alterado?" value={questionnaire.teste_orelhinha_alterado} />
                        <InfoRow label="Meses de gestação" value={questionnaire.gestacao_meses || 'N/A'} />
                        <BooleanRow label="Teve perda da audição?" value={questionnaire.teve_perda_audicao} conditionalValue={questionnaire.perda_audicao_ouvido} />
                        <BooleanRow label="Teve infecção de ouvido?" value={questionnaire.teve_infeccao_ouvido} />
                        <BooleanRow label="Teve trauma de ouvido?" value={questionnaire.teve_trauma_ouvido} />
                        <BooleanRow label="Tem labirintite ou tontura?" value={questionnaire.tem_labirintite_tontura_auditivo} />
                    </div>
                </div>

                {/* Potencial Evocado Visual */}
                <div className="mb-1.5">
                    <h2 className="text-xs font-bold bg-gray-200 px-2 py-0.5 mb-1" style={{ borderRadius: '3px', lineHeight: '1.2' }}>Potencial Evocado Visual</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-0 px-2">
                        <BooleanRow label="Já teve AVC?" value={questionnaire.teve_avc} conditionalValue={questionnaire.avc_quando} />
                        <BooleanRow label="Dificuldade para olhar fixo?" value={questionnaire.dificuldade_olhar_fixo} />
                        <BooleanRow label="Tem diplopia (visão dupla)?" value={questionnaire.tem_diplopia} />
                        <BooleanRow label="Passou com oftalmologista?" value={questionnaire.passou_oftalmologista} conditionalValue={questionnaire.oftalmologista_motivo} />
                        <BooleanRow label="Tem patologia no olho?" value={questionnaire.tem_patologia_olho} conditionalValue={questionnaire.patologia_olho_detalhes} />
                        <BooleanRow label="Usa óculos?" value={questionnaire.usa_oculos} conditionalValue={questionnaire.grau_oculos} />
                        <BooleanRow label="Cefaléia?" value={questionnaire.cefaleia_visual} />
                        <BooleanRow label="Tem enxaqueca?" value={questionnaire.tem_enxaqueca_visual} />
                        <BooleanRow label="Se incomoda com claridade?" value={questionnaire.incomoda_claridade} />
                        <BooleanRow label="Vê pontinhos coloridos?" value={questionnaire.ve_pontinhos_coloridos} />
                        <BooleanRow label="Tem alucinações visuais?" value={questionnaire.tem_alucinacoes_visuais} />
                        <BooleanRow label="Tem labirintite ou tontura?" value={questionnaire.tem_labirintite_tontura_visual} />
                    </div>
                </div>

                {/* Condições Gerais */}
                <div className="mb-1.5">
                    <h2 className="text-xs font-bold bg-gray-200 px-2 py-0.5 mb-1" style={{ borderRadius: '3px', lineHeight: '1.2' }}>Condições Gerais</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-0 px-2">
                        <BooleanRow label="Tem hipertensão arterial?" value={questionnaire.tem_hipertensao_auditivo || questionnaire.tem_hipertensao_visual} />
                        <BooleanRow label="Tem diabetes?" value={questionnaire.tem_diabetes_auditivo || questionnaire.tem_diabetes_visual} />
                    </div>
                </div>

                {/* Observações */}
                {questionnaire.observacoes && (
                    <div className="mb-1.5">
                        <h2 className="text-xs font-bold bg-gray-200 px-2 py-0.5 mb-1" style={{ borderRadius: '3px', lineHeight: '1.2' }}>Observações</h2>
                        <div className="px-2">
                            <div className="text-xs text-gray-900 whitespace-pre-wrap" style={{ lineHeight: '1.3' }}>{questionnaire.observacoes}</div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-1 pt-1 text-center" style={{ borderTop: '1px solid #d1d5db', position: 'absolute', bottom: '8mm', left: '8mm', right: '8mm' }}>
                    <p className="text-xs text-gray-600 mb-0" style={{ lineHeight: '1.2' }}>
                        Criado em: {new Date(questionnaire.created_at).toLocaleDateString('pt-BR')} {new Date(questionnaire.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-600 mb-0" style={{ lineHeight: '1.2' }}>Por: {questionnaire.creator?.name || 'Sistema'}</p>
                </div>
            </div>
        );
    }

    // Electroneuromiografia
    if (type === 'electroneuromiografia') {
        return (
            <div className="bg-white" style={{ width: '210mm', height: '297mm', padding: '7mm', fontFamily: 'Arial, sans-serif', fontSize: '9px' }}>
                {/* Header */}
                <div className="bg-indigo-600 text-white px-2 py-1 mb-2" style={{ borderRadius: '3px' }}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-xs font-bold mb-0" style={{ lineHeight: '1.2' }}>Sistema de Questionários - ENMG</h1>
                            <p style={{ fontSize: '8px', marginBottom: 0, lineHeight: '1.2' }}>Eletroneuromiografia</p>
                        </div>
                        <div className="text-right" style={{ fontSize: '8px', lineHeight: '1.2' }}>
                            <div>Data: {new Date().toLocaleDateString('pt-BR')}</div>
                            <div>Paciente: {questionnaire.nome}</div>
                        </div>
                    </div>
                </div>

                {/* Dados Básicos */}
                <div className="mb-1">
                    <h2 className="text-xs font-bold bg-gray-200 px-2 py-0.5 mb-1" style={{ borderRadius: '2px', lineHeight: '1.2' }}>Dados Básicos</h2>
                    <div className="grid grid-cols-3 gap-x-3 gap-y-0 px-2">
                        <InfoRow label="Nome" value={questionnaire.nome} />
                        <InfoRow label="RG" value={questionnaire.rg} />
                        <InfoRow label="Sexo" value={questionnaire.sexo} />
                        <InfoRow label="Data Nasc." value={formatDateShort(questionnaire.data_nascimento)} />
                        <InfoRow label="Idade" value={questionnaire.idade} />
                        <InfoRow label="Data Exame" value={formatDateShort(questionnaire.data_exame)} />
                        <InfoRow label="Peso" value={questionnaire.peso || 'N/A'} />
                        <InfoRow label="Altura" value={questionnaire.altura || 'N/A'} />
                        <InfoRow label="Solicitante" value={questionnaire.solicitante} />
                        <InfoRow label="Clínica" value={questionnaire.clinica} />
                        <InfoRow label="Equipe" value={questionnaire.team?.name} />
                        <InfoRow label="Tipos Exame" value={questionnaire.tipos_exame?.join(', ') || 'N/A'} />
                    </div>
                </div>

                {/* Informação Adicional */}
                <div className="mb-1">
                    <h2 className="text-xs font-bold bg-gray-200 px-2 py-0.5 mb-1" style={{ borderRadius: '2px', lineHeight: '1.2' }}>Informações Clínicas</h2>
                    <div className="grid grid-cols-3 gap-x-3 gap-y-0 px-2">
                        <BooleanRow label="Primeira vez exame" value={questionnaire.primeira_vez_exame} />
                        <BooleanRow label="Diabético" value={questionnaire.diabetico} />
                        <BooleanRow label="Diabético tratamento" value={questionnaire.diabetico_tratamento} />
                        <BooleanRow label="Tomando medicamentos" value={questionnaire.tomando_medicamentos} conditionalValue={questionnaire.medicamentos_detalhes} />
                        <BooleanRow label="Teve COVID" value={questionnaire.teve_covid} />
                        <BooleanRow label="Teve AVC" value={questionnaire.teve_avc} conditionalValue={questionnaire.avc_tipo && questionnaire.avc_quando ? `${questionnaire.avc_tipo} - ${questionnaire.avc_quando}` : questionnaire.avc_tipo || questionnaire.avc_quando} />
                        <BooleanRow label="Dor coluna" value={questionnaire.dor_coluna} conditionalValue={questionnaire.areas_coluna?.join(', ')} />
                        <BooleanRow label="Trabalha" value={questionnaire.trabalha} conditionalValue={questionnaire.tipo_trabalho} />
                        <BooleanRow label="Teve fraturas" value={questionnaire.teve_fraturas} conditionalValue={questionnaire.fraturas_regiao} />
                        <BooleanRow label="Quimioterapia" value={questionnaire.faz_quimioterapia} />
                        <BooleanRow label="Radioterapia" value={questionnaire.faz_radioterapia} />
                        <BooleanRow label="Hemodiálise" value={questionnaire.faz_hemodialise} />
                        <BooleanRow label="Marcapasso" value={questionnaire.tem_marcapasso} />
                        <BooleanRow label="Processo infeccioso" value={questionnaire.processo_infeccioso} conditionalValue={questionnaire.processo_infeccioso_detalhes} />
                        <BooleanRow label="Consome álcool" value={questionnaire.consome_alcool} conditionalValue={questionnaire.alcool_frequencia} />
                        <BooleanRow label="Usa drogas" value={questionnaire.usa_drogas} conditionalValue={questionnaire.drogas_quais} />
                    </div>
                </div>

                {/* Membros Superiores */}
                <div className="mb-1">
                    <h2 className="text-xs font-bold bg-gray-200 px-2 py-0.5 mb-1" style={{ borderRadius: '2px', lineHeight: '1.2' }}>Membros Superiores</h2>
                    <div className="grid grid-cols-4 gap-x-2 gap-y-0 px-2">
                        <BooleanRow label="Dor braços" value={questionnaire.ms_dor_bracos} />
                        <BooleanRow label="Dor ombros" value={questionnaire.ms_dor_comeca_ombros} />
                        <BooleanRow label="Dor mãos" value={questionnaire.ms_dor_maos} />
                        <BooleanRow label="Dor mais de" value={questionnaire.ms_dor_mais_de ? true : false} conditionalValue={questionnaire.ms_dor_mais_de} />
                        <BooleanRow label="Formig. braços" value={questionnaire.ms_formigamento_bracos} />
                        <BooleanRow label="Formig. ombros" value={questionnaire.ms_formigamento_comeca_ombros} />
                        <BooleanRow label="Formig. mãos" value={questionnaire.ms_formigamento_maos} />
                        <BooleanRow label="Dormência braços" value={questionnaire.ms_dormencia_bracos} />
                        <BooleanRow label="Dorm. ombros" value={questionnaire.ms_dormencia_comeca_ombros} />
                        <BooleanRow label="Dorm. mãos" value={questionnaire.ms_dormencia_maos} />
                        <BooleanRow label="Tremores braços" value={questionnaire.ms_tremores_bracos} />
                        <BooleanRow label="Tremores mãos" value={questionnaire.ms_tremores_maos} />
                        <BooleanRow label="Polegar treme" value={questionnaire.ms_polegar_treme} />
                        <BooleanRow label="Fraqueza braços" value={questionnaire.ms_fraqueza_bracos} />
                        <BooleanRow label="Fraqueza mãos" value={questionnaire.ms_fraqueza_maos} />
                        <BooleanRow label="Fadiga falar" value={questionnaire.ms_fadiga_falar} />
                        <BooleanRow label="Perda peso" value={questionnaire.ms_perda_peso} />
                        <BooleanRow label="Queimação" value={questionnaire.ms_queimacao} />
                        <BooleanRow label="Cãibra" value={questionnaire.ms_caibra} />
                        <BooleanRow label="Membro afetado" value={questionnaire.ms_membro_mais_afetado ? true : false} conditionalValue={questionnaire.ms_membro_mais_afetado} />
                    </div>
                </div>

                {/* Membros Inferiores */}
                <div className="mb-1">
                    <h2 className="text-xs font-bold bg-gray-200 px-2 py-0.5 mb-1" style={{ borderRadius: '2px', lineHeight: '1.2' }}>Membros Inferiores</h2>
                    <div className="grid grid-cols-4 gap-x-2 gap-y-0 px-2">
                        <BooleanRow label="Dor pernas" value={questionnaire.mi_dor_pernas} />
                        <BooleanRow label="Dor bacia" value={questionnaire.mi_dor_comeca_bacia} />
                        <BooleanRow label="Dor ciático" value={questionnaire.mi_dor_ciatico} />
                        <BooleanRow label="Dor pés" value={questionnaire.mi_dor_pes} />
                        <BooleanRow label="Formig. pernas" value={questionnaire.mi_formigamento_pernas} />
                        <BooleanRow label="Formig. bacia" value={questionnaire.mi_formigamento_comeca_bacia} />
                        <BooleanRow label="Formig. pés" value={questionnaire.mi_formigamento_pes} />
                        <BooleanRow label="Dormência pernas" value={questionnaire.mi_dormencia_pernas} />
                        <BooleanRow label="Dorm. bacia" value={questionnaire.mi_dormencia_comeca_bacia} />
                        <BooleanRow label="Dorm. pés" value={questionnaire.mi_dormencia_pes} />
                        <BooleanRow label="Tremores pernas" value={questionnaire.mi_tremores_pernas} />
                        <BooleanRow label="Tremores pés" value={questionnaire.mi_tremores_pes} />
                        <BooleanRow label="Fraqueza pernas" value={questionnaire.mi_fraqueza_pernas} />
                        <BooleanRow label="Fraqueza pés" value={questionnaire.mi_fraqueza_pes} />
                        <BooleanRow label="Fraq. ascendente" value={questionnaire.mi_fraqueza_ascendente} />
                        <BooleanRow label="Fadiga falar" value={questionnaire.mi_fadiga_falar} />
                        <BooleanRow label="Perda peso" value={questionnaire.mi_perda_peso} />
                        <BooleanRow label="Queimação" value={questionnaire.mi_queimacao} />
                        <BooleanRow label="Cãibra" value={questionnaire.mi_caibra} />
                        <BooleanRow label="Membro afetado" value={questionnaire.mi_membro_mais_afetado ? true : false} conditionalValue={questionnaire.mi_membro_mais_afetado} />
                    </div>
                </div>

                {/* Especialistas */}
                <div className="mb-1">
                    <h2 className="text-xs font-bold bg-gray-200 px-2 py-0.5 mb-1" style={{ borderRadius: '2px', lineHeight: '1.2' }}>Especialistas Consultados</h2>
                    <div className="grid grid-cols-3 gap-x-3 gap-y-0 px-2">
                        <BooleanRow label="Reumatologista" value={questionnaire.consultou_reumatologista} conditionalValue={questionnaire.reumatologista_motivo} />
                        <BooleanRow label="Neurologista" value={questionnaire.consultou_neurologista} conditionalValue={questionnaire.neurologista_motivo} />
                        <BooleanRow label="Neurocirurgião" value={questionnaire.consultou_neurocirurgiao} conditionalValue={questionnaire.neurocirurgiao_motivo} />
                        <BooleanRow label="Dermatologista" value={questionnaire.consultou_dermatologista} conditionalValue={questionnaire.dermatologista_motivo} />
                        <BooleanRow label="Geriatra" value={questionnaire.consultou_geriatra} conditionalValue={questionnaire.geriatra_motivo} />
                        <BooleanRow label="Ortopedista" value={questionnaire.consultou_ortopedista} conditionalValue={questionnaire.ortopedista_motivo} />
                    </div>
                </div>

                {/* Observações */}
                {questionnaire.observacoes && (
                    <div className="mb-1">
                        <h2 className="text-xs font-bold bg-gray-200 px-2 py-0.5 mb-1" style={{ borderRadius: '2px', lineHeight: '1.2' }}>Observações</h2>
                        <div className="px-2">
                            <div style={{ fontSize: '8px', lineHeight: '1.3' }} className="text-gray-900 whitespace-pre-wrap">{questionnaire.observacoes}</div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-1 pt-1 text-center" style={{ borderTop: '1px solid #d1d5db', position: 'absolute', bottom: '7mm', left: '7mm', right: '7mm' }}>
                    <p className="mb-0" style={{ fontSize: '8px', lineHeight: '1.2', color: '#6b7280' }}>
                        Criado em: {new Date(questionnaire.created_at).toLocaleDateString('pt-BR')} • Por: {questionnaire.creator?.name || 'Sistema'}
                    </p>
                </div>
            </div>
        );
    }

    // Eletroneuromiografia Facial
    if (type === 'eletroneuromiografia-facial') {
        return (
            <div className="bg-white" style={{ width: '210mm', height: '297mm', padding: '10mm', fontFamily: 'Arial, sans-serif', fontSize: '11px' }}>
                {/* Header */}
                <div className="bg-orange-600 text-white px-3 py-2 mb-3" style={{ borderRadius: '3px' }}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-sm font-bold mb-0" style={{ lineHeight: '1.2' }}>Sistema de Questionários - ENMG Facial</h1>
                            <p className="text-xs mb-0" style={{ lineHeight: '1.2' }}>Eletroneuromiografia Facial</p>
                        </div>
                        <div className="text-right" style={{ fontSize: '9px', lineHeight: '1.3' }}>
                            <div>Data de Exportação: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                            <div>Paciente: {questionnaire.nome}</div>
                        </div>
                    </div>
                </div>

                {/* Dados Básicos */}
                <div className="mb-2">
                    <h2 className="text-xs font-bold bg-gray-200 px-2 py-1 mb-2" style={{ borderRadius: '3px', lineHeight: '1.2' }}>Dados Básicos</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-0 px-2">
                        <InfoRow label="Nome" value={questionnaire.nome} />
                        <InfoRow label="RG" value={questionnaire.rg} />
                        <InfoRow label="Data de Nascimento" value={formatDateShort(questionnaire.data_nascimento)} />
                        <InfoRow label="Idade" value={questionnaire.idade_calculada} />
                        <InfoRow label="Sexo" value={questionnaire.sexo} />
                        <InfoRow label="Data do Exame" value={formatDateShort(questionnaire.data_exame)} />
                        <InfoRow label="Solicitante" value={questionnaire.solicitante} />
                        <InfoRow label="Clínica" value={questionnaire.clinica} />
                        <InfoRow label="Equipe" value={questionnaire.team?.name} />
                    </div>
                </div>

                {/* Questionário Facial */}
                <div className="mb-2">
                    <h2 className="text-xs font-bold bg-gray-200 px-2 py-1 mb-2" style={{ borderRadius: '3px', lineHeight: '1.2' }}>Questionário de Eletroneuromiografia Facial</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-0 px-2">
                        <BooleanRow label="Tem dor na testa?" value={questionnaire.tem_dor_testa} />
                        <BooleanRow label="Dor nos olhos?" value={questionnaire.tem_dor_olhos} conditionalValue={questionnaire.dor_olhos_lado} />
                        <BooleanRow label="Dor na mandíbula?" value={questionnaire.tem_dor_mandibula} />
                        <BooleanRow label="Dor nos dentes (água gelada)?" value={questionnaire.tem_dor_dentes_agua_gelada} />
                        <BooleanRow label="Espasmos na face?" value={questionnaire.tem_espasmos_face} conditionalValue={questionnaire.espasmos_face_parte} />
                        <BooleanRow label="Aplicou Botox?" value={questionnaire.aplicou_botox} conditionalValue={questionnaire.botox_parte_face} />
                        <BooleanRow label="Implante dentário?" value={questionnaire.tem_implante_dentario} />
                        <BooleanRow label="Dores após implante?" value={questionnaire.tem_dores_apos_implante} />
                        <BooleanRow label="Teve paralisia facial?" value={questionnaire.teve_paralisia_facial} conditionalValue={questionnaire.paralisia_facial_vezes ? `${questionnaire.paralisia_facial_vezes} vezes` : null} />
                        <BooleanRow label="Parte da face paralisada?" value={questionnaire.tem_parte_face_paralisada} conditionalValue={questionnaire.parte_face_paralisada_qual} />
                        <BooleanRow label="Tem enxaqueca?" value={questionnaire.tem_enxaqueca} />
                        <BooleanRow label="Consegue sorrir normalmente?" value={questionnaire.consegue_sorrir_normalmente} />
                        <BooleanRow label="Pode comer normalmente?" value={questionnaire.pode_comer_normalmente} />
                        <BooleanRow label="Pode assoviar?" value={questionnaire.pode_assoviar} />
                        <BooleanRow label="Consegue encher bexiga?" value={questionnaire.consegue_encher_bexiga} />
                        <BooleanRow label="Infecção de ouvido repetida?" value={questionnaire.tem_infeccao_ouvido_repetidamente} />
                        <BooleanRow label="Diabético(a)?" value={questionnaire.diabetico} />
                        <BooleanRow label="Toma medicamento?" value={questionnaire.toma_medicamento} conditionalValue={questionnaire.medicamentos} />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-2 pt-2 text-center" style={{ borderTop: '1px solid #d1d5db', position: 'absolute', bottom: '10mm', left: '10mm', right: '10mm' }}>
                    <p className="text-xs text-gray-600 mb-0" style={{ lineHeight: '1.2' }}>
                        Criado em: {new Date(questionnaire.created_at).toLocaleDateString('pt-BR')} {new Date(questionnaire.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-600 mb-0" style={{ lineHeight: '1.2' }}>Por: {questionnaire.creator?.name || 'Sistema'}</p>
                </div>
            </div>
        );
    }

    return null;
}