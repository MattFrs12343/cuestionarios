import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import SignaturePad from '@/Components/SignaturePad';
import BirthDateSelectInput from '@/Components/BirthDateSelectInput';
import { compressImage, formatFileSize, getCompressionRatio } from '@/Utils/imageCompression';

export default function Create({ auth, teams, momentoExameOptions, tipoExameOptions }) {
    // Obter data atual no formato YYYY-MM-DD
    const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const { data, setData, post, processing, errors } = useForm({
        clinica: '',
        data_exame: getCurrentDate(),
        nome_completo: '',
        data_nascimento: '',
        sexo: '',
        rg_ou_cpf: '',
        team_id: '',
        tipo_exame: '',
        teve_covid: false,
        teve_desmaio: false,
        ja_teve_avc: false,
        quando_teve_avc: '',
        ja_teve_convulsao: false,
        quando_teve_convulsao: '',
        ja_bateu_cabeca: false,
        tem_dor_cabeca: false,
        tem_depressao: false,
        tem_ansiedade: false,
        tem_insonia: false,
        tem_esquecimento: false,
        tem_alzheimer: false,
        tem_parkinson: false,
        hipertensao: false,
        hipertensao_faz_uso: '',
        diabetes: false,
        diabetes_faz_uso: '',
        tem_dificuldade_aprendizado: false,
        hiperativo: false,
        agressivo: false,
        autismo: false,
        tem_dificuldade_dormir: false,
        nome_profissional_pedido: '',
        nome_tecnico_medico_exame: '',
        momento_exame: '',
        comentario: '',
        assinatura_paciente: null,
        pedido_medico: null,
    });

    const [idade, setIdade] = useState(null);
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [pedidoMedicoPreview, setPedidoMedicoPreview] = useState(null);
    const [imageCompressionInfo, setImageCompressionInfo] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);

    useEffect(() => {
        // Detectar solo dispositivos móviles (no tablets) para la cámara
        setIsMobileDevice(/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }, []);

    useEffect(() => {
        if (data.data_nascimento) {
            const birthDate = new Date(data.data_nascimento);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            let finalAge = age;
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                finalAge = age - 1;
            }
            
            if (finalAge < 1) {
                // Calcular meses
                let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
                months -= birthDate.getMonth();
                months += today.getMonth();
                if (today.getDate() < birthDate.getDate()) {
                    months--;
                }
                setIdade(months + (months === 1 ? ' mês' : ' meses'));
            } else {
                setIdade(finalAge + (finalAge === 1 ? ' ano' : ' anos'));
            }
        } else {
            setIdade(null);
        }
    }, [data.data_nascimento]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('questionnaires.electroencefalograma.store'));
    };

    const handleBooleanChange = (field, value) => {
        setData(field, value);
        
        // Limpar campos condicionais quando se marca como false
        if (!value) {
            if (field === 'ja_teve_avc') setData('quando_teve_avc', '');
            if (field === 'ja_teve_convulsao') setData('quando_teve_convulsao', '');
            if (field === 'hipertensao') setData('hipertensao_faz_uso', '');
            if (field === 'diabetes') setData('diabetes_faz_uso', '');
        }
    };

    const BooleanField = ({ label, field, conditionalField = null }) => {
        const getPlaceholder = () => {
            if (conditionalField === 'hipertensao_faz_uso' || conditionalField === 'diabetes_faz_uso') {
                return 'Que medicamento usa?';
            }
            return `Quando ${label.toLowerCase()}?`;
        };

        const handleRadioClick = (value) => {
            handleBooleanChange(field, value);
        };

        return (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
                <div className="flex space-x-4">
                    <label className="flex items-center cursor-pointer text-gray-900 dark:text-gray-100" onClick={() => handleRadioClick(true)}>
                        <input
                            type="radio"
                            name={`${field}_radio`}
                            value="true"
                            checked={data[field] === true}
                            onChange={() => {}}
                            className="mr-2 pointer-events-none text-indigo-600 dark:text-indigo-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                        />
                        SIM
                    </label>
                    <label className="flex items-center cursor-pointer text-gray-900 dark:text-gray-100" onClick={() => handleRadioClick(false)}>
                        <input
                            type="radio"
                            name={`${field}_radio`}
                            value="false"
                            checked={data[field] === false}
                            onChange={() => {}}
                            className="mr-2 pointer-events-none text-indigo-600 dark:text-indigo-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                        />
                        NÃO
                    </label>
                </div>
                {errors[field] && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors[field]}</div>}
                
                {conditionalField && data[field] && (
                    <div className="mt-2">
                        <input
                            type="text"
                            value={data[conditionalField]}
                            onChange={(e) => setData(conditionalField, e.target.value)}
                            placeholder={getPlaceholder()}
                            className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200"
                        />
                        {errors[conditionalField] && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors[conditionalField]}</div>}
                    </div>
                )}
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                                Novo Questionário
                            </h2>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Eletroencefalograma
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Novo Questionário - EEG" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        {/* Header do Formulário */}
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 px-6 py-4">
                            <div className="flex items-center">
                                <svg className="w-8 h-8 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Formulário de Registro</h3>
                                    <p className="text-sm text-purple-100">Preencha as informações do paciente</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <form onSubmit={handleSubmit} encType="multipart/form-data">
                                {/* Dados básicos */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dados Básicos</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Clínica *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.clinica}
                                                onChange={(e) => setData('clinica', e.target.value.toUpperCase())}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 uppercase"
                                                required
                                            />
                                            {errors.clinica && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.clinica}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Data do Exame *
                                            </label>
                                            <input
                                                type="date"
                                                value={data.data_exame}
                                                onChange={(e) => setData('data_exame', e.target.value)}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200"
                                                required
                                            />
                                            {errors.data_exame && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.data_exame}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Nome Completo *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nome_completo}
                                                onChange={(e) => setData('nome_completo', e.target.value.toUpperCase())}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 uppercase"
                                                required
                                            />
                                            {errors.nome_completo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.nome_completo}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Data de Nascimento *
                                            </label>
                                            <BirthDateSelectInput
                                                value={data.data_nascimento}
                                                onChange={(value) => setData('data_nascimento', value)}
                                                required={true}
                                            />
                                            {idade !== null && (
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Idade: {idade}</div>
                                            )}
                                            {errors.data_nascimento && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.data_nascimento}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Sexo *
                                            </label>
                                            <select
                                                value={data.sexo}
                                                onChange={(e) => setData('sexo', e.target.value)}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200"
                                                required
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="Masculino">Masculino</option>
                                                <option value="Feminino">Feminino</option>
                                            </select>
                                            {errors.sexo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.sexo}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                RG ou CPF *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.rg_ou_cpf}
                                                onChange={(e) => setData('rg_ou_cpf', e.target.value.toUpperCase())}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 uppercase"
                                                required
                                            />
                                            {errors.rg_ou_cpf && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.rg_ou_cpf}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Equipe *
                                            </label>
                                            <select
                                                value={data.team_id}
                                                onChange={(e) => setData('team_id', e.target.value)}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200"
                                                required
                                            >
                                                <option value="">Selecione uma equipe...</option>
                                                {teams.map((team) => (
                                                    <option key={team.id} value={team.id}>
                                                        {team.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.team_id && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.team_id}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Tipo de Exame *
                                            </label>
                                            <select
                                                value={data.tipo_exame}
                                                onChange={(e) => setData('tipo_exame', e.target.value)}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200"
                                                required
                                            >
                                                <option value="">Selecione o tipo de exame...</option>
                                                {tipoExameOptions.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.tipo_exame && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.tipo_exame}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Histórico médico */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-pink-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Histórico Médico</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <BooleanField label="Teve COVID" field="teve_covid" />
                                        
                                        <BooleanField label="Teve Desmaio" field="teve_desmaio" />
                                        
                                        <BooleanField label="Já teve AVC" field="ja_teve_avc" />
                                        
                                        {data.ja_teve_avc && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Quando teve AVC?
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.quando_teve_avc || ''}
                                                    onChange={(e) => setData('quando_teve_avc', e.target.value)}
                                                    placeholder="Quando teve AVC?"
                                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200"
                                                />
                                                {errors.quando_teve_avc && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.quando_teve_avc}</div>}
                                            </div>
                                        )}

                                        <BooleanField label="Já teve convulsão" field="ja_teve_convulsao" />
                                        
                                        {data.ja_teve_convulsao && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Quando teve convulsão?
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.quando_teve_convulsao || ''}
                                                    onChange={(e) => setData('quando_teve_convulsao', e.target.value)}
                                                    placeholder="Quando teve convulsão?"
                                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200"
                                                />
                                                {errors.quando_teve_convulsao && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.quando_teve_convulsao}</div>}
                                            </div>
                                        )}
                                        <BooleanField label="Já bateu a cabeça" field="ja_bateu_cabeca" />
                                        <BooleanField label="Tem dor de cabeça" field="tem_dor_cabeca" />
                                        <BooleanField label="Tem depressão" field="tem_depressao" />
                                        <BooleanField label="Tem ansiedade" field="tem_ansiedade" />
                                        <BooleanField label="Tem insônia" field="tem_insonia" />
                                        <BooleanField label="Tem esquecimento" field="tem_esquecimento" />
                                        <BooleanField label="Tem Alzheimer" field="tem_alzheimer" />
                                        <BooleanField label="Tem Parkinson" field="tem_parkinson" />
                                        <BooleanField label="Hipertensão" field="hipertensao" />
                                        
                                        {data.hipertensao && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Que medicamento usa para hipertensão?
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.hipertensao_faz_uso || ''}
                                                    onChange={(e) => setData('hipertensao_faz_uso', e.target.value)}
                                                    placeholder="Que medicamento usa?"
                                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200"
                                                />
                                                {errors.hipertensao_faz_uso && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.hipertensao_faz_uso}</div>}
                                            </div>
                                        )}

                                        <BooleanField label="Diabetes" field="diabetes" />
                                        
                                        {data.diabetes && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Que medicamento usa para diabetes?
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.diabetes_faz_uso || ''}
                                                    onChange={(e) => setData('diabetes_faz_uso', e.target.value)}
                                                    placeholder="Que medicamento usa?"
                                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200"
                                                />
                                                {errors.diabetes_faz_uso && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.diabetes_faz_uso}</div>}
                                            </div>
                                        )}
                                        <BooleanField label="Tem dificuldade de aprendizado" field="tem_dificuldade_aprendizado" />
                                        <BooleanField label="Hiperativo" field="hiperativo" />
                                        <BooleanField label="Agressivo" field="agressivo" />
                                        <BooleanField label="Autismo" field="autismo" />
                                        <BooleanField label="Tem dificuldade para dormir" field="tem_dificuldade_dormir" />
                                    </div>
                                </div>

                                {/* Profissionais */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Profissionais</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Nome do Profissional que fez o Pedido *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nome_profissional_pedido}
                                                onChange={(e) => setData('nome_profissional_pedido', e.target.value.toUpperCase())}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 uppercase"
                                                required
                                            />
                                            {errors.nome_profissional_pedido && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.nome_profissional_pedido}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Nome do Técnico ou Médico que fez o Exame *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nome_tecnico_medico_exame}
                                                onChange={(e) => setData('nome_tecnico_medico_exame', e.target.value.toUpperCase())}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 uppercase"
                                                required
                                            />
                                            {errors.nome_tecnico_medico_exame && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.nome_tecnico_medico_exame}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Momento do exame */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Momento do Exame</h3>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Como o paciente ficou durante o exame? *
                                        </label>
                                        <select
                                            value={data.momento_exame}
                                            onChange={(e) => setData('momento_exame', e.target.value)}
                                            className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200"
                                            required
                                        >
                                            <option value="">Selecione...</option>
                                            {momentoExameOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.momento_exame && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.momento_exame}</div>}
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Comentários
                                        </label>
                                        <textarea
                                            value={data.comentario}
                                            onChange={(e) => setData('comentario', e.target.value)}
                                            rows={4}
                                            className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200"
                                            placeholder="Observações adicionais..."
                                        />
                                        {errors.comentario && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.comentario}</div>}
                                    </div>
                                </div>

                                {/* Arquivos */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-teal-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Arquivos</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Pedido Médico
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                capture={isMobileDevice ? "environment" : undefined}
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    
                                                    if (!file) {
                                                        setData('pedido_medico', null);
                                                        setPedidoMedicoPreview(null);
                                                        setImageCompressionInfo(null);
                                                        return;
                                                    }

                                                    try {
                                                        setIsCompressing(true);
                                                        
                                                        // Comprimir imagen
                                                        const compressedFile = await compressImage(file, {
                                                            maxWidth: 1920,
                                                            maxHeight: 1080,
                                                            quality: 0.8,
                                                            outputFormat: 'image/jpeg'
                                                        });

                                                        // Calcular información de compresión
                                                        const compressionRatio = getCompressionRatio(file.size, compressedFile.size);
                                                        setImageCompressionInfo({
                                                            originalSize: formatFileSize(file.size),
                                                            compressedSize: formatFileSize(compressedFile.size),
                                                            compressionRatio: compressionRatio
                                                        });

                                                        // Establecer archivo comprimido
                                                        setData('pedido_medico', compressedFile);
                                                        
                                                        // Crear preview
                                                        const reader = new FileReader();
                                                        reader.onload = (e) => {
                                                            setPedidoMedicoPreview(e.target.result);
                                                        };
                                                        reader.readAsDataURL(compressedFile);
                                                        
                                                    } catch (error) {
                                                        console.error('Error al comprimir imagen:', error);
                                                        // En caso de error, usar archivo original
                                                        setData('pedido_medico', file);
                                                        setImageCompressionInfo(null);
                                                        
                                                        const reader = new FileReader();
                                                        reader.onload = (e) => {
                                                            setPedidoMedicoPreview(e.target.result);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    } finally {
                                                        setIsCompressing(false);
                                                    }
                                                }}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200"
                                            />
                                            {errors.pedido_medico && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.pedido_medico}</div>}
                                            
                                            {/* Indicador de compresión */}
                                            {isCompressing && (
                                                <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                                                    🔄 Comprimiendo imagen...
                                                </div>
                                            )}
                                            
                                            {/* Información de compresión */}
                                            {imageCompressionInfo && (
                                                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm">
                                                    <div className="text-green-800 dark:text-green-300">
                                                        ✅ Imagen comprimida exitosamente
                                                    </div>
                                                    <div className="text-green-700 dark:text-green-400 mt-1">
                                                        Tamaño original: {imageCompressionInfo.originalSize} → 
                                                        Comprimido: {imageCompressionInfo.compressedSize} 
                                                        ({imageCompressionInfo.compressionRatio}% reducción)
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Pré-visualização da imagem */}
                                            {pedidoMedicoPreview && (
                                                <div className="mt-3">
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pré-visualização:</p>
                                                    <div className="relative">
                                                        <img 
                                                            src={pedidoMedicoPreview}
                                                            alt="Pré-visualização do pedido médico"
                                                            className="max-w-full h-auto max-h-64 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-gray-900/50"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setPedidoMedicoPreview(null);
                                                                setData('pedido_medico', null);
                                                                setImageCompressionInfo(null);
                                                                // Limpar o input file
                                                                const fileInput = document.querySelector('input[type="file"][accept="image/*"]');
                                                                if (fileInput) fileInput.value = '';
                                                            }}
                                                            className="absolute top-2 right-2 bg-red-500 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors duration-200"
                                                            title="Excluir imagem"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Assinatura do Paciente
                                            </label>
                                            <SignaturePad
                                                onSignatureChange={(signature) => setData('assinatura_paciente', signature)}
                                                className="w-full"
                                            />
                                            {errors.assinatura_paciente && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.assinatura_paciente}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Botões */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => window.history.back()}
                                        className="inline-flex items-center px-6 py-3 bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 hover:from-green-600 hover:to-emerald-700 dark:hover:from-green-700 dark:hover:to-emerald-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Salvar Questionário
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
