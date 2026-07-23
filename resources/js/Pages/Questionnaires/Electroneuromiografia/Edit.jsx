import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import SignaturePad from '@/Components/SignaturePad';
import BirthDateSelectInput from '@/Components/BirthDateSelectInput';
import { compressImage, formatFileSize, getCompressionRatio } from '@/Utils/imageCompression';

export default function Edit({ auth, questionnaire, teams, tiposExameOptions, areasColuna, momentoExameOptions }) {
    // Función para formatar datas no formato YYYY-MM-DD
    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    const { data, setData, put, post, processing, errors } = useForm({
        // Datos básicos
        nome: questionnaire.nome || '',
        data_nascimento: formatDateForInput(questionnaire.data_nascimento) || '',
        peso: questionnaire.peso || '',
        altura: questionnaire.altura || '',
        data_exame: formatDateForInput(questionnaire.data_exame) || '',
        rg: questionnaire.rg || '',
        sexo: questionnaire.sexo || '',
        solicitante: questionnaire.solicitante || '',
        clinica: questionnaire.clinica || '',
        team_id: questionnaire.team_id || '',
        tipos_exame: questionnaire.tipos_exame || [],
        
        // Información adicional
        primeira_vez_exame: questionnaire.primeira_vez_exame === true,
        diabetico: questionnaire.diabetico === true,
        diabetico_tratamento: questionnaire.diabetico_tratamento === true,
        tomando_medicamentos: questionnaire.tomando_medicamentos === true,
        medicamentos_detalhes: questionnaire.medicamentos_detalhes || '',
        teve_covid: questionnaire.teve_covid === true,
        teve_avc: questionnaire.teve_avc === true,
        avc_tipo: questionnaire.avc_tipo || '',
        avc_quando: questionnaire.avc_quando || '',
        dor_coluna: questionnaire.dor_coluna === true,
        areas_coluna: questionnaire.areas_coluna || [],
        trabalha: questionnaire.trabalha === true,
        tipo_trabalho: questionnaire.tipo_trabalho || '',
        teve_fraturas: questionnaire.teve_fraturas === true,
        fraturas_regiao: questionnaire.fraturas_regiao || '',
        faz_quimioterapia: questionnaire.faz_quimioterapia === true,
        faz_radioterapia: questionnaire.faz_radioterapia === true,
        faz_hemodialise: questionnaire.faz_hemodialise === true,
        tem_marcapasso: questionnaire.tem_marcapasso === true,
        processo_infeccioso: questionnaire.processo_infeccioso === true,
        processo_infeccioso_detalhes: questionnaire.processo_infeccioso_detalhes || '',
        consome_alcool: questionnaire.consome_alcool === true,
        alcool_frequencia: questionnaire.alcool_frequencia || '',
        usa_drogas: questionnaire.usa_drogas === true,
        drogas_quais: questionnaire.drogas_quais || '',
        
        // Membros Superiores
        ms_dor_bracos: questionnaire.ms_dor_bracos === true,
        ms_dor_comeca_ombros: questionnaire.ms_dor_comeca_ombros === true,
        ms_dor_maos: questionnaire.ms_dor_maos === true,
        ms_dor_mais_de: questionnaire.ms_dor_mais_de || '',
        ms_formigamento_bracos: questionnaire.ms_formigamento_bracos === true,
        ms_formigamento_comeca_ombros: questionnaire.ms_formigamento_comeca_ombros === true,
        ms_formigamento_maos: questionnaire.ms_formigamento_maos === true,
        ms_dormencia_bracos: questionnaire.ms_dormencia_bracos === true,
        ms_dormencia_comeca_ombros: questionnaire.ms_dormencia_comeca_ombros === true,
        ms_dormencia_maos: questionnaire.ms_dormencia_maos === true,
        ms_tremores_bracos: questionnaire.ms_tremores_bracos === true,
        ms_tremores_maos: questionnaire.ms_tremores_maos === true,
        ms_polegar_treme: questionnaire.ms_polegar_treme === true,
        ms_fraqueza_bracos: questionnaire.ms_fraqueza_bracos === true,
        ms_fraqueza_maos: questionnaire.ms_fraqueza_maos === true,
        ms_fadiga_falar: questionnaire.ms_fadiga_falar === true,
        ms_perda_peso: questionnaire.ms_perda_peso === true,
        ms_queimacao: questionnaire.ms_queimacao === true,
        ms_caibra: questionnaire.ms_caibra === true,
        ms_membro_mais_afetado: questionnaire.ms_membro_mais_afetado || '',   
     
        // Membros Inferiores
        mi_dor_pernas: questionnaire.mi_dor_pernas === true,
        mi_dor_comeca_bacia: questionnaire.mi_dor_comeca_bacia === true,
        mi_dor_ciatico: questionnaire.mi_dor_ciatico === true,
        mi_dor_pes: questionnaire.mi_dor_pes === true,
        mi_formigamento_pernas: questionnaire.mi_formigamento_pernas === true,
        mi_formigamento_comeca_bacia: questionnaire.mi_formigamento_comeca_bacia === true,
        mi_formigamento_pes: questionnaire.mi_formigamento_pes === true,
        mi_dormencia_pernas: questionnaire.mi_dormencia_pernas === true,
        mi_dormencia_comeca_bacia: questionnaire.mi_dormencia_comeca_bacia === true,
        mi_dormencia_pes: questionnaire.mi_dormencia_pes === true,
        mi_tremores_pernas: questionnaire.mi_tremores_pernas === true,
        mi_tremores_pes: questionnaire.mi_tremores_pes === true,
        mi_fraqueza_pernas: questionnaire.mi_fraqueza_pernas === true,
        mi_fraqueza_pes: questionnaire.mi_fraqueza_pes === true,
        mi_fraqueza_ascendente: questionnaire.mi_fraqueza_ascendente === true,
        mi_fadiga_falar: questionnaire.mi_fadiga_falar === true,
        mi_perda_peso: questionnaire.mi_perda_peso === true,
        mi_queimacao: questionnaire.mi_queimacao === true,
        mi_caibra: questionnaire.mi_caibra === true,
        mi_membro_mais_afetado: questionnaire.mi_membro_mais_afetado || '',
        
        // Especialistas
        consultou_reumatologista: questionnaire.consultou_reumatologista === true,
        reumatologista_motivo: questionnaire.reumatologista_motivo || '',
        consultou_neurologista: questionnaire.consultou_neurologista === true,
        neurologista_motivo: questionnaire.neurologista_motivo || '',
        consultou_neurocirurgiao: questionnaire.consultou_neurocirurgiao === true,
        neurocirurgiao_motivo: questionnaire.neurocirurgiao_motivo || '',
        consultou_dermatologista: questionnaire.consultou_dermatologista === true,
        dermatologista_motivo: questionnaire.dermatologista_motivo || '',
        consultou_geriatra: questionnaire.consultou_geriatra === true,
        geriatra_motivo: questionnaire.geriatra_motivo || '',
        consultou_ortopedista: questionnaire.consultou_ortopedista === true,
        ortopedista_motivo: questionnaire.ortopedista_motivo || '',
        
        // Observaciones
        observacoes: questionnaire.observacoes || '',
        
        // Archivos
        assinatura_paciente: questionnaire.assinatura_paciente || null,
        pedido_medico: null,
    });

    const [idade, setIdade] = useState(null);
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [pedidoMedicoPreview, setPedidoMedicoPreview] = useState(null);
    const [imageCompressionInfo, setImageCompressionInfo] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        
        console.log('HandleSubmit - data.pedido_medico:', data.pedido_medico);
        console.log('HandleSubmit - pedidoMedicoPreview:', pedidoMedicoPreview);
        
        // Se houver um arquivo, usar router.post com FormData
        if (data.pedido_medico) {
            console.log('Using FormData approach - file detected');
            setIsSubmitting(true);
            
            const formData = new FormData();
            
            // Adicionar todos os campos do formulário
            Object.keys(data).forEach(key => {
                if (data[key] !== null && data[key] !== undefined) {
                    let value = data[key];
                    // Converter booleanos para strings para FormData
                    if (typeof value === 'boolean') {
                        value = value ? '1' : '0';
                    }
                    // Converter arrays para JSON strings
                    else if (Array.isArray(value)) {
                        value = JSON.stringify(value);
                    }
                    console.log(`Adding to FormData: ${key} =`, value);
                    formData.append(key, value);
                }
            });
            
            // Adicionar _method para simular PUT
            formData.append('_method', 'PUT');
            
            // Usar router.post com FormData
            router.post(route('questionnaires.electroneuromiografia.update', questionnaire.id), formData, {
                forceFormData: true,
                onSuccess: () => {
                    console.log('Form submitted successfully');
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    console.error('Form submission errors:', errors);
                    setIsSubmitting(false);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            });
        } else {
            console.log('Using regular PUT approach - no file');
            put(route('questionnaires.electroneuromiografia.update', questionnaire.id));
        }
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
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                                Editar Questionário
                            </h2>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Eletroneuromiografia
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Editar Questionário - ENMG" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        {/* Header do Formulário */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg className="w-8 h-8 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <div>
                                        <h1 className="text-2xl font-bold text-white">Editar Questionário</h1>
                                        <p className="text-blue-100 text-sm mt-1">Eletroneuromiografia - {questionnaire.nome}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Link
                                        href={route('questionnaires.electroneuromiografia.index')}
                                        className="inline-flex items-center bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 backdrop-blur-sm"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Voltar
                                    </Link>
                                    <Link
                                        href={route('questionnaires.electroneuromiografia.show', questionnaire.id)}
                                        className="inline-flex items-center bg-white hover:bg-gray-50 text-blue-600 dark:text-blue-700 font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Visualizar
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 text-gray-900 dark:text-gray-100">

                            <form onSubmit={handleSubmit} encType="multipart/form-data">
                                {/* Dados básicos */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Dados Básicos</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
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
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Nascimento *</label>
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
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Peso</label>
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
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Altura</label>
                                            <input
                                                type="text"
                                                value={data.altura}
                                                onChange={(e) => setData('altura', e.target.value)}
                                                placeholder="Ex: 1.70m"
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                            />
                                            {errors.altura && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.altura}</div>}
                                        </div>

                                        {/* Resto de campos básicos similares al Create */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data do Exame *</label>
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
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RG *</label>
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
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sexo *</label>
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
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Solicitante *</label>
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
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Clínica *</label>
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
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Equipe *</label>
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
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipos de Exame * (selecione um ou mais)</label>
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

                                {/* Nota: Las demás secciones son similares al Create, por brevedad las resumo */}
                                
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
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quando foi o último AVC?</label>
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
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Que área da coluna?</label>
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
                                            </div>
                                        )}

                                        {/* Resto de campos similares al Create */}
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
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Membro mais afetado:</label>
                                            <div className="flex space-x-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="ms_membro_mais_afetado"
                                                        value="DIREITO"
                                                        checked={data.ms_membro_mais_afetado === 'DIREITO'}
                                                        onChange={(e) => setData('ms_membro_mais_afetado', e.target.value)}
                                                        className="mr-2 text-purple-600 dark:text-purple-500 focus:ring-purple-500 dark:focus:ring-purple-600"
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
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Membro mais afetado:</label>
                                            <div className="flex space-x-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="mi_membro_mais_afetado"
                                                        value="DIREITO"
                                                        checked={data.mi_membro_mais_afetado === 'DIREITO'}
                                                        onChange={(e) => setData('mi_membro_mais_afetado', e.target.value)}
                                                        className="mr-2 text-purple-600 dark:text-purple-500 focus:ring-purple-500 dark:focus:ring-purple-600"
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
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Observações Gerais:
                                        </label>
                                        <textarea
                                            value={data.observacoes || ''}
                                            onChange={(e) => setData('observacoes', e.target.value)}
                                            rows="4"
                                            placeholder="Observações adicionais sobre o paciente..."
                                            className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                        />
                                        {errors.observacoes && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.observacoes}</div>}
                                    </div>
                                </div>

                                {/* Arquivos */}
                                <div className="mb-8 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 rounded-xl p-6 border-l-4 border-green-500 dark:border-green-400">
                                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center">
                                        <span className="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-lg flex items-center justify-center mr-3">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </span>
                                        Arquivos
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Pedido Médico
                                            </label>
                                            {questionnaire.pedido_medico && !pedidoMedicoPreview && (
                                                <div className="mb-2">
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Arquivo atual:</p>
                                                    <div className="relative">
                                                        <img 
                                                            src={`/storage/${questionnaire.pedido_medico}`}
                                                            alt="Pedido Médico Atual"
                                                            className="max-w-full h-auto max-h-64 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-gray-900/50"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                // Aqui você pode implementar um modal para visualizar a imagem em tamanho completo
                                                                window.open(`/storage/${questionnaire.pedido_medico}`, '_blank');
                                                            }}
                                                            className="absolute top-2 right-2 bg-blue-500 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold transition-colors duration-200"
                                                            title="Visualizar em tamanho completo"
                                                        >
                                                            🔍
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <input
                                                id="pedido_medico_input"
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
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 transition-colors duration-200"
                                            />
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Selecione um novo arquivo para substituir o atual</p>
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
                                            
                                            {/* Pré-visualização da nova imagem */}
                                            {pedidoMedicoPreview && (
                                                <div className="mt-3">
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nova imagem:</p>
                                                    <div className="relative">
                                                        <img 
                                                            src={pedidoMedicoPreview}
                                                            alt="Pré-visualização do novo pedido médico"
                                                            className="max-w-full h-auto max-h-64 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-gray-900/50"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setPedidoMedicoPreview(null);
                                                                setData('pedido_medico', null);
                                                                setImageCompressionInfo(null);
                                                                // Limpar o input file específico
                                                                const fileInput = document.getElementById('pedido_medico_input');
                                                                if (fileInput) fileInput.value = '';
                                                            }}
                                                            className="absolute top-2 right-2 bg-red-500 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors duration-200"
                                                            title="Excluir nova imagem"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Assinatura do Paciente ou Acompanhante
                                            </label>
                                            <SignaturePad
                                                onSignatureChange={(signature) => setData('assinatura_paciente', signature)}
                                                initialSignature={questionnaire.assinatura_paciente}
                                                className="w-full"
                                            />
                                            {errors.assinatura_paciente && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.assinatura_paciente}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Botões */}
                                <div className="flex justify-end space-x-4">
                                    <Link
                                        href={route('questionnaires.electroneuromiografia.index')}
                                        className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-600 transition-colors duration-200"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing || isSubmitting}
                                        className="px-4 py-2 bg-purple-500 dark:bg-purple-600 text-white rounded-md hover:bg-purple-600 dark:hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 disabled:opacity-50 transition-colors duration-200"
                                    >
                                        {(processing || isSubmitting) ? 'Salvando...' : 'Salvar Alterações'}
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