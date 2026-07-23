import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import SignaturePad from '@/Components/SignaturePad';
import BirthDateSelectInput from '@/Components/BirthDateSelectInput';
import { compressImage, formatFileSize, getCompressionRatio } from '@/Utils/imageCompression';

export default function Create({ auth, teams, tiposExameOptions, areasColuna, momentoExameOptions }) {
    // Obter data atual no formato YYYY-MM-DD
    const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const { data, setData, post, processing, errors } = useForm({
        // Datos básicos
        nome: '',
        data_nascimento: '',
        peso: '',
        altura: '',
        data_exame: getCurrentDate(),
        rg: '',
        sexo: '',
        solicitante: '',
        clinica: '',
        team_id: '',
        tipos_exame: [],
        
        // Información adicional
        primeira_vez_exame: false,
        diabetico: false,
        diabetico_tratamento: false,
        tomando_medicamentos: false,
        medicamentos_detalhes: '',
        teve_covid: false,
        teve_avc: false,
        avc_tipo: '',
        avc_quando: '',
        dor_coluna: false,
        areas_coluna: [],
        trabalha: false,
        tipo_trabalho: '',
        teve_fraturas: false,
        fraturas_regiao: '',
        faz_quimioterapia: false,
        faz_radioterapia: false,
        faz_hemodialise: false,
        tem_marcapasso: false,
        processo_infeccioso: false,
        processo_infeccioso_detalhes: '',
        consome_alcool: false,
        alcool_frequencia: '',
        usa_drogas: false,
        drogas_quais: '',
        
        // Membros Superiores
        ms_dor_bracos: false,
        ms_dor_comeca_ombros: false,
        ms_dor_maos: false,
        ms_dor_mais_de: '',
        ms_formigamento_bracos: false,
        ms_formigamento_comeca_ombros: false,
        ms_formigamento_maos: false,
        ms_dormencia_bracos: false,
        ms_dormencia_comeca_ombros: false,
        ms_dormencia_maos: false,
        ms_tremores_bracos: false,
        ms_tremores_maos: false,
        ms_polegar_treme: false,
        ms_fraqueza_bracos: false,
        ms_fraqueza_maos: false,
        ms_fadiga_falar: false,
        ms_perda_peso: false,
        ms_queimacao: false,
        ms_caibra: false,
        ms_membro_mais_afetado: '',
        
        // Membros Inferiores
        mi_dor_pernas: false,
        mi_dor_comeca_bacia: false,
        mi_dor_ciatico: false,
        mi_dor_pes: false,
        mi_formigamento_pernas: false,
        mi_formigamento_comeca_bacia: false,
        mi_formigamento_pes: false,
        mi_dormencia_pernas: false,
        mi_dormencia_comeca_bacia: false,
        mi_dormencia_pes: false,
        mi_tremores_pernas: false,
        mi_tremores_pes: false,
        mi_fraqueza_pernas: false,
        mi_fraqueza_pes: false,
        mi_fraqueza_ascendente: false,
        mi_fadiga_falar: false,
        mi_perda_peso: false,
        mi_queimacao: false,
        mi_caibra: false,
        mi_membro_mais_afetado: '',
        
        // Especialistas
        consultou_reumatologista: false,
        reumatologista_motivo: '',
        consultou_neurologista: false,
        neurologista_motivo: '',
        consultou_neurocirurgiao: false,
        neurocirurgiao_motivo: '',
        consultou_dermatologista: false,
        dermatologista_motivo: '',
        consultou_geriatra: false,
        geriatra_motivo: '',
        consultou_ortopedista: false,
        ortopedista_motivo: '',
        
        // Observaciones
        observacoes: '',
        
        // Archivos
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
        post(route('questionnaires.electroneuromiografia.store'));
    };

    const handleBooleanChange = useCallback((field, value) => {
        setData(field, value);
        
        // Limpar campos condicionais quando se marca como false
        if (!value) {
            if (field === 'teve_avc') {
                setData('avc_tipo', '');
                setData('avc_quando', '');
            }
            if (field === 'trabalha') setData('tipo_trabalho', '');
            if (field === 'teve_fraturas') setData('fraturas_regiao', '');
            if (field === 'processo_infeccioso') setData('processo_infeccioso_detalhes', '');
            if (field === 'consome_alcool') setData('alcool_frequencia', '');
            if (field === 'usa_drogas') setData('drogas_quais', '');
            if (field === 'consultou_reumatologista') setData('reumatologista_motivo', '');
            if (field === 'consultou_neurologista') setData('neurologista_motivo', '');
            if (field === 'consultou_neurocirurgiao') setData('neurocirurgiao_motivo', '');
            if (field === 'consultou_dermatologista') setData('dermatologista_motivo', '');
            if (field === 'consultou_geriatra') setData('geriatra_motivo', '');
            if (field === 'consultou_ortopedista') setData('ortopedista_motivo', '');
        }
    }, [setData]);

    const handleTipoExameChange = useCallback((tipo) => {
        const currentTipos = data.tipos_exame || [];
        if (currentTipos.includes(tipo)) {
            setData('tipos_exame', currentTipos.filter(t => t !== tipo));
        } else {
            setData('tipos_exame', [...currentTipos, tipo]);
        }
    }, [data.tipos_exame, setData]);

    const handleAreaColunaChange = useCallback((area) => {
        const currentAreas = data.areas_coluna || [];
        if (currentAreas.includes(area)) {
            setData('areas_coluna', currentAreas.filter(a => a !== area));
        } else {
            setData('areas_coluna', [...currentAreas, area]);
        }
    }, [data.areas_coluna, setData]);

    const BooleanField = ({ label, field, conditionalField = null, conditionalType = 'text' }) => {
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
                            className="mr-2 pointer-events-none text-purple-600 dark:text-purple-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-purple-500 dark:focus:ring-purple-600"
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
                            className="mr-2 pointer-events-none text-purple-600 dark:text-purple-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-purple-500 dark:focus:ring-purple-600"
                        />
                        NÃO
                    </label>
                </div>
                {errors[field] && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors[field]}</div>}
                
                {conditionalField && data[field] && (
                    <div className="mt-2">
                        {conditionalType === 'select' ? (
                            <select
                                value={data[conditionalField]}
                                onChange={(e) => setData(conditionalField, e.target.value)}
                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                            >
                                <option value="">Selecione o tipo...</option>
                                <option value="Hemorrágico">Hemorrágico</option>
                                <option value="Isquêmico">Isquêmico</option>
                                <option value="Transitório">Transitório</option>
                                <option value="Não Sabe">Não Sabe</option>
                            </select>
                        ) : conditionalType === 'textarea' ? (
                            <textarea
                                value={data[conditionalField]}
                                onChange={(e) => setData(conditionalField, e.target.value)}
                                placeholder="Especifique os medicamentos que está tomando..."
                                rows="3"
                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                            />
                        ) : (
                            <input
                                type="text"
                                value={data[conditionalField]}
                                onChange={(e) => setData(conditionalField, e.target.value)}
                                placeholder="Especifique..."
                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                            />
                        )}
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
                        <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                                Novo Questionário
                            </h2>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Eletroneuromiografia
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Novo Questionário - ENMG" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        {/* Header do Formulário */}
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 px-6 py-4">
                            <div className="flex items-center">
                                <svg className="w-8 h-8 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">Novo Questionário de Eletroneuromiografia</h1>
                                    <p className="text-cyan-100 text-sm mt-1">Preencha todos os campos obrigatórios para criar um novo registro</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <form onSubmit={handleSubmit} encType="multipart/form-data">
                                {/* Dados básicos */}
                                <div className="mb-8 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 rounded-xl p-6 border-l-4 border-cyan-500 dark:border-cyan-400">
                                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center">
                                        <span className="w-8 h-8 bg-cyan-500 dark:bg-cyan-600 rounded-lg flex items-center justify-center mr-3">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </span>
                                        Dados Básicos
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Nome *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nome}
                                                onChange={(e) => setData('nome', e.target.value)}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                                required
                                            />
                                            {errors.nome && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.nome}</div>}
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
                                                Peso
                                            </label>
                                            <input
                                                type="text"
                                                value={data.peso}
                                                onChange={(e) => setData('peso', e.target.value)}
                                                placeholder="Ex: 70kg"
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                            />
                                            {errors.peso && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.peso}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Altura
                                            </label>
                                            <input
                                                type="text"
                                                value={data.altura}
                                                onChange={(e) => setData('altura', e.target.value)}
                                                placeholder="Ex: 1.70m"
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                            />
                                            {errors.altura && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.altura}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Data do Exame *
                                            </label>
                                            <input
                                                type="date"
                                                value={data.data_exame}
                                                onChange={(e) => setData('data_exame', e.target.value)}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                                required
                                            />
                                            {errors.data_exame && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.data_exame}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                RG *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.rg}
                                                onChange={(e) => setData('rg', e.target.value)}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                                required
                                            />
                                            {errors.rg && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.rg}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Sexo *
                                            </label>
                                            <select
                                                value={data.sexo}
                                                onChange={(e) => setData('sexo', e.target.value)}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
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
                                                Solicitante *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.solicitante}
                                                onChange={(e) => setData('solicitante', e.target.value)}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                                required
                                            />
                                            {errors.solicitante && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.solicitante}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Clínica *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.clinica}
                                                onChange={(e) => setData('clinica', e.target.value)}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                                required
                                            />
                                            {errors.clinica && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.clinica}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Equipe *
                                            </label>
                                            <select
                                                value={data.team_id}
                                                onChange={(e) => setData('team_id', e.target.value)}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
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

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Tipos de Exame * (selecione um ou mais)
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {tiposExameOptions.map((tipo) => (
                                                    <label key={tipo} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={data.tipos_exame.includes(tipo)}
                                                            onChange={() => handleTipoExameChange(tipo)}
                                                            className="mr-2 text-purple-600 dark:text-purple-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-purple-500 dark:focus:ring-purple-600"
                                                        />
                                                        <span className="text-sm text-gray-900 dark:text-gray-100">{tipo}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {errors.tipos_exame && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.tipos_exame}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Información adicional */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Informação Adicional</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <BooleanField label="É primeira vez que vai fazer esse exame?" field="primeira_vez_exame" />
                                        <BooleanField label="Diabético(a)" field="diabetico" />
                                        <BooleanField label="Se diabético(a), faz o tratamento?" field="diabetico_tratamento" />
                                        <BooleanField 
                                            label="Está tomando medicamentos (Glifage, Metformina, AAS.)" 
                                            field="tomando_medicamentos" 
                                        />
                                        
                                        {data.tomando_medicamentos && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Especifique os medicamentos que está tomando:
                                                </label>
                                                <textarea
                                                    value={data.medicamentos_detalhes || ''}
                                                    onChange={(e) => setData('medicamentos_detalhes', e.target.value)}
                                                    placeholder="Especifique os medicamentos que está tomando..."
                                                    rows="3"
                                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                                />
                                                {errors.medicamentos_detalhes && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.medicamentos_detalhes}</div>}
                                            </div>
                                        )}
                                        <BooleanField label="Pegou COVID?" field="teve_covid" />
                                        <BooleanField label="Teve AVC?" field="teve_avc" conditionalField="avc_tipo" conditionalType="select" />
                                        
                                        {data.teve_avc && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Quando foi o último AVC?
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.avc_quando}
                                                    onChange={(e) => setData('avc_quando', e.target.value)}
                                                    placeholder="Ex: Janeiro 2023"
                                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                                />
                                                {errors.avc_quando && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.avc_quando}</div>}
                                            </div>
                                        )}

                                        <BooleanField label="Sente dor na coluna?" field="dor_coluna" />
                                        
                                        {data.dor_coluna && (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Que área da coluna? (selecione uma ou mais)
                                                </label>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {areasColuna.map((area) => (
                                                        <label key={area} className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={data.areas_coluna.includes(area)}
                                                                onChange={() => handleAreaColunaChange(area)}
                                                                className="mr-2 text-purple-600 dark:text-purple-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-purple-500 dark:focus:ring-purple-600"
                                                            />
                                                            <span className="text-sm text-gray-900 dark:text-gray-100">{area}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                {errors.areas_coluna && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.areas_coluna}</div>}
                                            </div>
                                        )}

                                        <BooleanField label="Trabalha" field="trabalha" />
                                        
                                        {data.trabalha && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Tipo de trabalho:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.tipo_trabalho || ''}
                                                    onChange={(e) => setData('tipo_trabalho', e.target.value)}
                                                    placeholder="Especifique o tipo de trabalho..."
                                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                                />
                                                {errors.tipo_trabalho && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.tipo_trabalho}</div>}
                                            </div>
                                        )}

                                        <BooleanField label="Teve fraturas?" field="teve_fraturas" />
                                        
                                        {data.teve_fraturas && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Região das fraturas:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.fraturas_regiao || ''}
                                                    onChange={(e) => setData('fraturas_regiao', e.target.value)}
                                                    placeholder="Especifique a região das fraturas..."
                                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                                />
                                                {errors.fraturas_regiao && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.fraturas_regiao}</div>}
                                            </div>
                                        )}
                                        <BooleanField label="Já fez ou faz quimioterapia?" field="faz_quimioterapia" />
                                        <BooleanField label="Já fez ou faz radioterapia?" field="faz_radioterapia" />
                                        <BooleanField label="Já fez ou faz hemodiálise?" field="faz_hemodialise" />
                                        <BooleanField label="Tem Marca-passo?" field="tem_marcapasso" />
                                        <BooleanField label="Recentemente passou por um processo infeccioso?" field="processo_infeccioso" />
                                        
                                        {data.processo_infeccioso && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Detalhes do processo infeccioso:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.processo_infeccioso_detalhes || ''}
                                                    onChange={(e) => setData('processo_infeccioso_detalhes', e.target.value)}
                                                    placeholder="Especifique o processo infeccioso..."
                                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                                />
                                                {errors.processo_infeccioso_detalhes && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.processo_infeccioso_detalhes}</div>}
                                            </div>
                                        )}

                                        <BooleanField label="Consome alguma bebida alcoólica?" field="consome_alcool" />
                                        
                                        {data.consome_alcool && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Frequência do consumo de álcool:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.alcool_frequencia || ''}
                                                    onChange={(e) => setData('alcool_frequencia', e.target.value)}
                                                    placeholder="Ex: Fins de semana, diariamente..."
                                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                                />
                                                {errors.alcool_frequencia && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.alcool_frequencia}</div>}
                                            </div>
                                        )}

                                        <BooleanField label="Experimentou drogas?" field="usa_drogas" />
                                        
                                        {data.usa_drogas && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Quais drogas:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.drogas_quais || ''}
                                                    onChange={(e) => setData('drogas_quais', e.target.value)}
                                                    placeholder="Especifique quais drogas..."
                                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                                />
                                                {errors.drogas_quais && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.drogas_quais}</div>}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Membros Superiores */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Membros Superiores</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <BooleanField label="Sente dor nos braços?" field="ms_dor_bracos" />
                                        <BooleanField label="A dor começa nos ombros?" field="ms_dor_comeca_ombros" />
                                        <BooleanField label="Sente dor nas mãos?" field="ms_dor_maos" />
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">A dor é mais de:</label>
                                            <div className="flex space-x-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="ms_dor_mais_de"
                                                        value="DIA"
                                                        checked={data.ms_dor_mais_de === 'DIA'}
                                                        onChange={(e) => setData('ms_dor_mais_de', e.target.value)}
                                                        className="mr-2 text-purple-600 dark:text-purple-500 focus:ring-purple-500 dark:focus:ring-purple-600"
                                                    />
                                                    <span className="text-sm text-gray-900 dark:text-gray-100">DIA</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="ms_dor_mais_de"
                                                        value="NOITE"
                                                        checked={data.ms_dor_mais_de === 'NOITE'}
                                                        onChange={(e) => setData('ms_dor_mais_de', e.target.value)}
                                                        className="mr-2 text-purple-600 dark:text-purple-500 focus:ring-purple-500 dark:focus:ring-purple-600"
                                                    />
                                                    <span className="text-sm text-gray-900 dark:text-gray-100">NOITE</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="ms_dor_mais_de"
                                                        value="AMBOS"
                                                        checked={data.ms_dor_mais_de === 'AMBOS'}
                                                        onChange={(e) => setData('ms_dor_mais_de', e.target.value)}
                                                        className="mr-2 text-purple-600 dark:text-purple-500 focus:ring-purple-500 dark:focus:ring-purple-600"
                                                    />
                                                    <span className="text-sm text-gray-900 dark:text-gray-100">AMBOS</span>
                                                </label>
                                            </div>
                                            {errors.ms_dor_mais_de && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.ms_dor_mais_de}</div>}
                                        </div>

                                        <BooleanField label="Sente formigamento nos braços?" field="ms_formigamento_bracos" />
                                        <BooleanField label="O formigamento começa nos ombros?" field="ms_formigamento_comeca_ombros" />
                                        <BooleanField label="Sente formigamento nas mãos?" field="ms_formigamento_maos" />
                                        <BooleanField label="Sente dormência nos braços?" field="ms_dormencia_bracos" />
                                        <BooleanField label="A dormência começa nos ombros?" field="ms_dormencia_comeca_ombros" />
                                        <BooleanField label="Sente dormência nas mãos?" field="ms_dormencia_maos" />
                                        <BooleanField label="Tem tremores nos braços?" field="ms_tremores_bracos" />
                                        <BooleanField label="Tem tremores nas mãos?" field="ms_tremores_maos" />
                                        <BooleanField label="O 1º (polegar) dedo treme?" field="ms_polegar_treme" />
                                        <BooleanField label="Sente fraqueza nos braços?" field="ms_fraqueza_bracos" />
                                        <BooleanField label="Sente fraqueza nas mãos?" field="ms_fraqueza_maos" />
                                        <BooleanField label="Sente fadiga ao falar?" field="ms_fadiga_falar" />
                                        <BooleanField label="Perda de peso nestes últimos meses?" field="ms_perda_peso" />
                                        <BooleanField label="Tem sensação de queimação nas mãos, braços?" field="ms_queimacao" />
                                        <BooleanField label="Sente cãibra (braços/mãos)?" field="ms_caibra" />
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Membro mais afetado: *</label>
                                            <div className="flex space-x-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="ms_membro_mais_afetado"
                                                        value="DIREITO"
                                                        checked={data.ms_membro_mais_afetado === 'DIREITO'}
                                                        onChange={(e) => setData('ms_membro_mais_afetado', e.target.value)}
                                                        className="mr-2 text-purple-600 dark:text-purple-500 focus:ring-purple-500 dark:focus:ring-purple-600"
                                                        required
                                                    />
                                                    <span className="text-sm text-gray-900 dark:text-gray-100">DIREITO</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="ms_membro_mais_afetado"
                                                        value="ESQUERDO"
                                                        checked={data.ms_membro_mais_afetado === 'ESQUERDO'}
                                                        onChange={(e) => setData('ms_membro_mais_afetado', e.target.value)}
                                                        className="mr-2 text-purple-600 dark:text-purple-500 focus:ring-purple-500 dark:focus:ring-purple-600"
                                                        required
                                                    />
                                                    <span className="text-sm text-gray-900 dark:text-gray-100">ESQUERDO</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="ms_membro_mais_afetado"
                                                        value="AMBOS"
                                                        checked={data.ms_membro_mais_afetado === 'AMBOS'}
                                                        onChange={(e) => setData('ms_membro_mais_afetado', e.target.value)}
                                                        className="mr-2 text-purple-600 dark:text-purple-500 focus:ring-purple-500 dark:focus:ring-purple-600"
                                                        required
                                                    />
                                                    <span className="text-sm text-gray-900 dark:text-gray-100">AMBOS</span>
                                                </label>
                                            </div>
                                            {errors.ms_membro_mais_afetado && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.ms_membro_mais_afetado}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Membros Inferiores */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Membros Inferiores</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <BooleanField label="Sente dor nas pernas?" field="mi_dor_pernas" />
                                        <BooleanField label="A dor começa na bacia?" field="mi_dor_comeca_bacia" />
                                        <BooleanField label="A dor passa pelas nádegas, coxa se estende até joelho indo até pés (CIÁTICO)?" field="mi_dor_ciatico" />
                                        <BooleanField label="Sente dor nos pés?" field="mi_dor_pes" />
                                        <BooleanField label="Sente formigamento nas pernas?" field="mi_formigamento_pernas" />
                                        <BooleanField label="O formigamento começa na bacia?" field="mi_formigamento_comeca_bacia" />
                                        <BooleanField label="Sente formigamento nos pés?" field="mi_formigamento_pes" />
                                        <BooleanField label="Sente dormência nas pernas?" field="mi_dormencia_pernas" />
                                        <BooleanField label="A dormência começa na bacia?" field="mi_dormencia_comeca_bacia" />
                                        <BooleanField label="Sente dormência nos pés?" field="mi_dormencia_pes" />
                                        <BooleanField label="Tem tremores nas pernas?" field="mi_tremores_pernas" />
                                        <BooleanField label="Tem tremores nos pés?" field="mi_tremores_pes" />
                                        <BooleanField label="Sente fraqueza nas pernas?" field="mi_fraqueza_pernas" />
                                        <BooleanField label="Sente fraqueza nos pés?" field="mi_fraqueza_pes" />
                                        <BooleanField label="A fraqueza é ascendente?" field="mi_fraqueza_ascendente" />
                                        <BooleanField label="Sente fadiga ao falar?" field="mi_fadiga_falar" />
                                        <BooleanField label="Perda de peso nestes últimos meses?" field="mi_perda_peso" />
                                        <BooleanField label="Tem sensação de queimação nos pés, pernas?" field="mi_queimacao" />
                                        <BooleanField label="Sente cãibra (pernas/pés)?" field="mi_caibra" />
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Membro mais afetado: *</label>
                                            <div className="flex space-x-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="mi_membro_mais_afetado"
                                                        value="DIREITO"
                                                        checked={data.mi_membro_mais_afetado === 'DIREITO'}
                                                        onChange={(e) => setData('mi_membro_mais_afetado', e.target.value)}
                                                        className="mr-2 text-purple-600 dark:text-purple-500 focus:ring-purple-500 dark:focus:ring-purple-600"
                                                        required
                                                    />
                                                    <span className="text-sm text-gray-900 dark:text-gray-100">DIREITO</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="mi_membro_mais_afetado"
                                                        value="ESQUERDO"
                                                        checked={data.mi_membro_mais_afetado === 'ESQUERDO'}
                                                        onChange={(e) => setData('mi_membro_mais_afetado', e.target.value)}
                                                        className="mr-2 text-purple-600 dark:text-purple-500 focus:ring-purple-500 dark:focus:ring-purple-600"
                                                        required
                                                    />
                                                    <span className="text-sm text-gray-900 dark:text-gray-100">ESQUERDO</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="mi_membro_mais_afetado"
                                                        value="AMBOS"
                                                        checked={data.mi_membro_mais_afetado === 'AMBOS'}
                                                        onChange={(e) => setData('mi_membro_mais_afetado', e.target.value)}
                                                        className="mr-2 text-purple-600 dark:text-purple-500 focus:ring-purple-500 dark:focus:ring-purple-600"
                                                        required
                                                    />
                                                    <span className="text-sm text-gray-900 dark:text-gray-100">AMBOS</span>
                                                </label>
                                            </div>
                                            {errors.mi_membro_mais_afetado && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.mi_membro_mais_afetado}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Especialistas */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Especialistas</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <BooleanField label="Consultou com REUMATOLOGISTA?" field="consultou_reumatologista" />
                                        
                                        {data.consultou_reumatologista && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Motivo da consulta com reumatologista:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.reumatologista_motivo || ''}
                                                    onChange={(e) => setData('reumatologista_motivo', e.target.value)}
                                                    placeholder="Especifique o motivo..."
                                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                                />
                                                {errors.reumatologista_motivo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.reumatologista_motivo}</div>}
                                            </div>
                                        )}

                                        <BooleanField label="Consultou com NEUROLOGISTA?" field="consultou_neurologista" />
                                        
                                        {data.consultou_neurologista && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Motivo da consulta com neurologista:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.neurologista_motivo || ''}
                                                    onChange={(e) => setData('neurologista_motivo', e.target.value)}
                                                    placeholder="Especifique o motivo..."
                                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                                />
                                                {errors.neurologista_motivo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.neurologista_motivo}</div>}
                                            </div>
                                        )}

                                        <BooleanField label="Consultou com NEUROCIRURGIÃO?" field="consultou_neurocirurgiao" />
                                        
                                        {data.consultou_neurocirurgiao && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Motivo da consulta com neurocirurgião:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.neurocirurgiao_motivo || ''}
                                                    onChange={(e) => setData('neurocirurgiao_motivo', e.target.value)}
                                                    placeholder="Especifique o motivo..."
                                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                                />
                                                {errors.neurocirurgiao_motivo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.neurocirurgiao_motivo}</div>}
                                            </div>
                                        )}

                                        <BooleanField label="Consultou com DERMATOLOGISTA?" field="consultou_dermatologista" />
                                        
                                        {data.consultou_dermatologista && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Motivo da consulta com dermatologista:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.dermatologista_motivo || ''}
                                                    onChange={(e) => setData('dermatologista_motivo', e.target.value)}
                                                    placeholder="Especifique o motivo..."
                                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                                />
                                                {errors.dermatologista_motivo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.dermatologista_motivo}</div>}
                                            </div>
                                        )}

                                        <BooleanField label="Consultou com GERIATRA?" field="consultou_geriatra" />
                                        
                                        {data.consultou_geriatra && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Motivo da consulta com geriatra:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.geriatra_motivo || ''}
                                                    onChange={(e) => setData('geriatra_motivo', e.target.value)}
                                                    placeholder="Especifique o motivo..."
                                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                                />
                                                {errors.geriatra_motivo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.geriatra_motivo}</div>}
                                            </div>
                                        )}

                                        <BooleanField label="Consultou com ORTOPEDISTA?" field="consultou_ortopedista" />
                                        
                                        {data.consultou_ortopedista && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Motivo da consulta com ortopedista:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.ortopedista_motivo || ''}
                                                    onChange={(e) => setData('ortopedista_motivo', e.target.value)}
                                                    placeholder="Especifique o motivo..."
                                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                                />
                                                {errors.ortopedista_motivo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.ortopedista_motivo}</div>}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Observações */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Observações</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Observações Gerais
                                        </label>
                                        <textarea
                                            value={data.observacoes}
                                            onChange={(e) => setData('observacoes', e.target.value)}
                                            rows={4}
                                            className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                            placeholder="Observações adicionais..."
                                        />
                                        {errors.observacoes && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.observacoes}</div>}
                                    </div>
                                </div>

                                {/* Arquivos */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Arquivos</h3>
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

                                                    // Mostrar preview original
                                                    const reader = new FileReader();
                                                    reader.onload = (e) => setPedidoMedicoPreview(e.target.result);
                                                    reader.readAsDataURL(file);

                                                    // Comprimir imagen si es necesario
                                                    try {
                                                        setIsCompressing(true);
                                                        const compressedFile = await compressImage(file, {
                                                            maxSizeMB: 5,
                                                            maxWidthOrHeight: 1920,
                                                            useWebWorker: true
                                                        });

                                                        const compressionRatio = getCompressionRatio(file, compressedFile);
                                                        setImageCompressionInfo({
                                                            originalSize: formatFileSize(file.size),
                                                            compressedSize: formatFileSize(compressedFile.size),
                                                            compressionRatio: compressionRatio
                                                        });

                                                        setData('pedido_medico', compressedFile);
                                                    } catch (error) {
                                                        console.error('Error compressing image:', error);
                                                        setData('pedido_medico', file);
                                                        setImageCompressionInfo(null);
                                                    } finally {
                                                        setIsCompressing(false);
                                                    }
                                                }}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                            />
                                            {errors.pedido_medico && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.pedido_medico}</div>}
                                            
                                            {isCompressing && (
                                                <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                                                    Comprimindo imagem...
                                                </div>
                                            )}
                                            
                                            {imageCompressionInfo && (
                                                <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                                                    Imagem comprimida: {imageCompressionInfo.originalSize} → {imageCompressionInfo.compressedSize} 
                                                    ({imageCompressionInfo.compressionRatio}% de redução)
                                                </div>
                                            )}
                                            
                                            {pedidoMedicoPreview && (
                                                <div className="mt-2">
                                                    <img 
                                                        src={pedidoMedicoPreview} 
                                                        alt="Preview do pedido médico" 
                                                        className="max-w-full h-32 object-cover rounded border"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Assinatura do Paciente ou Acompanhante
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
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => window.history.back()}
                                        className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-600 transition-colors duration-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-purple-500 dark:bg-purple-600 text-white rounded-md hover:bg-purple-600 dark:hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 disabled:opacity-50 transition-colors duration-200"
                                    >
                                        {processing ? 'Salvando...' : 'Salvar Questionário'}
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