import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { formatDateShort } from '@/Utils/dateFormatter';

export default function Show({ auth, questionnaire, can }) {

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
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Visualizar Questionário</h2>}
        >
            <Head title="Visualizar Questionário" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm dark:shadow-gray-900/50 sm:rounded-lg transition-colors duration-200">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* Header com ações */}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Questionário - {questionnaire.nome_completo}</h3>
                                <div className="flex space-x-2">
                                    <Link
                                        href={route('questionnaires.index')}
                                        className="bg-gray-500 dark:bg-gray-600 hover:bg-gray-700 dark:hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        Voltar
                                    </Link>
                                    {can.edit && (
                                        <Link
                                            href={route('questionnaires.edit', questionnaire.id)}
                                            className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                        >
                                            Editar
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Informação de última modificação */}
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors duration-200">
                                <p className="text-sm text-gray-600 dark:text-gray-400">{questionnaire.last_modified_by}</p>
                            </div>

                            {/* Dados básicos */}
                            <div className="mb-8">
                                <h4 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Dados Básicos</h4>
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
                                </dl>
                            </div>

                            {/* Histórico médico */}
                            <div className="mb-8">
                                <h4 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Histórico Médico</h4>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <BooleanDisplay label="Teve COVID" value={questionnaire.teve_covid} />
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

                            {/* Profissionais */}
                            <div className="mb-8">
                                <h4 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Profissionais</h4>
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

                            {/* Momento do exame */}
                            <div className="mb-8">
                                <h4 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Momento do Exame</h4>
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
                                <div className="mb-8">
                                    <h4 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Arquivos</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {questionnaire.pedido_medico && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Pedido Médico</dt>
                                                <dd>
                                                    <img 
                                                        src={`/storage/${questionnaire.pedido_medico}`}
                                                        alt="Pedido Médico"
                                                        className="max-w-full h-auto border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm"
                                                    />
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
                                                        className="max-w-full h-auto border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm"
                                                    />
                                                </dd>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
