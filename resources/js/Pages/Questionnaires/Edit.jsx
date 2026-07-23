import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import SignaturePad from '@/Components/SignaturePad';

export default function Edit({ auth, questionnaire, teams, momentoExameOptions }) {
    // Função para formatar datas no formato YYYY-MM-DD
    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    const { data, setData, put, processing, errors } = useForm({
        clinica: questionnaire.clinica || '',
        data_exame: formatDateForInput(questionnaire.data_exame) || '',
        nome_completo: questionnaire.nome_completo || '',
        data_nascimento: formatDateForInput(questionnaire.data_nascimento) || '',
        sexo: questionnaire.sexo || '',
        rg_ou_cpf: questionnaire.rg_ou_cpf || '',
        team_id: questionnaire.team_id || '',
        teve_covid: questionnaire.teve_covid === true,
        ja_teve_avc: questionnaire.ja_teve_avc === true,
        quando_teve_avc: questionnaire.quando_teve_avc || '',
        ja_teve_convulsao: questionnaire.ja_teve_convulsao === true,
        quando_teve_convulsao: questionnaire.quando_teve_convulsao || '',
        ja_bateu_cabeca: questionnaire.ja_bateu_cabeca === true,
        tem_dor_cabeca: questionnaire.tem_dor_cabeca === true,
        tem_depressao: questionnaire.tem_depressao === true,
        tem_ansiedade: questionnaire.tem_ansiedade === true,
        tem_insonia: questionnaire.tem_insonia === true,
        tem_esquecimento: questionnaire.tem_esquecimento === true,
        tem_alzheimer: questionnaire.tem_alzheimer === true,
        tem_parkinson: questionnaire.tem_parkinson === true,
        hipertensao: questionnaire.hipertensao === true,
        hipertensao_faz_uso: questionnaire.hipertensao_faz_uso || '',
        diabetes: questionnaire.diabetes === true,
        diabetes_faz_uso: questionnaire.diabetes_faz_uso || '',
        tem_dificuldade_aprendizado: questionnaire.tem_dificuldade_aprendizado === true,
        hiperativo: questionnaire.hiperativo === true,
        agressivo: questionnaire.agressivo === true,
        autismo: questionnaire.autismo === true,
        tem_dificuldade_dormir: questionnaire.tem_dificuldade_dormir === true,
        nome_profissional_pedido: questionnaire.nome_profissional_pedido || '',
        nome_tecnico_medico_exame: questionnaire.nome_tecnico_medico_exame || '',
        momento_exame: questionnaire.momento_exame || '',
        comentario: questionnaire.comentario || '',
        assinatura_paciente: questionnaire.assinatura_paciente || null,
        pedido_medico: null,
    });

    const [idade, setIdade] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [pedidoMedicoPreview, setPedidoMedicoPreview] = useState(null);

    useEffect(() => {
        setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
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
        
        console.log('HandleSubmit - data.pedido_medico:', data.pedido_medico);
        console.log('HandleSubmit - pedidoMedicoPreview:', pedidoMedicoPreview);
        
        // Se houver um arquivo, usar POST com _method para simular PUT
        if (data.pedido_medico) {
            console.log('Using FormData approach - file detected');
            const formData = new FormData();
            
            // Adicionar todos os campos ao FormData
            Object.keys(data).forEach(key => {
                if (data[key] !== null && data[key] !== undefined) {
                    let value = data[key];
                    // Converter booleanos para strings para FormData
                    if (typeof value === 'boolean') {
                        value = value ? '1' : '0';
                    }
                    console.log(`Adding to FormData: ${key} =`, value);
                    formData.append(key, value);
                }
            });
            
            // Adicionar _method para simular PUT
            formData.append('_method', 'PUT');
            
            console.log('Sending FormData to server');
            console.log('Route URL:', route('questionnaires.update', questionnaire.id));
            router.post(route('questionnaires.update', questionnaire.id), formData, {
                forceFormData: true,
                onSuccess: () => {
                    console.log('Request successful');
                },
                onError: (errors) => {
                    console.log('Request errors:', errors);
                },
                onFinish: () => {
                    console.log('Request finished');
                }
            });
        } else {
            console.log('Using regular PUT approach - no file detected');
            put(route('questionnaires.update', questionnaire.id));
        }
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
                            className="mr-2 pointer-events-none"
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
                            className="mr-2 pointer-events-none"
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
                            className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm transition-colors duration-200"
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
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Editar Questionário</h2>}
        >
            <Head title="Editar Questionário" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm dark:shadow-gray-900/50 sm:rounded-lg transition-colors duration-200">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <form onSubmit={handleSubmit} encType="multipart/form-data">
                                {/* Dados básicos */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Dados Básicos</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Clínica *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.clinica}
                                                onChange={(e) => setData('clinica', e.target.value)}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm transition-colors duration-200"
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
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm transition-colors duration-200"
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
                                                onChange={(e) => setData('nome_completo', e.target.value)}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm transition-colors duration-200"
                                                required
                                            />
                                            {errors.nome_completo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.nome_completo}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Data de Nascimento *
                                            </label>
                                            <input
                                                type="date"
                                                value={data.data_nascimento}
                                                onChange={(e) => setData('data_nascimento', e.target.value)}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm transition-colors duration-200"
                                                required
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
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm transition-colors duration-200"
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
                                                onChange={(e) => setData('rg_ou_cpf', e.target.value)}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm transition-colors duration-200"
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
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm transition-colors duration-200"
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
                                    </div>
                                </div>

                                {/* Histórico médico */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Histórico Médico</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <BooleanField label="Teve COVID" field="teve_covid" />
                                        <BooleanField label="Já teve AVC" field="ja_teve_avc" conditionalField="quando_teve_avc" />
                                        <BooleanField label="Já teve convulsão" field="ja_teve_convulsao" conditionalField="quando_teve_convulsao" />
                                        <BooleanField label="Já bateu a cabeça" field="ja_bateu_cabeca" />
                                        <BooleanField label="Tem dor de cabeça" field="tem_dor_cabeca" />
                                        <BooleanField label="Tem depressão" field="tem_depressao" />
                                        <BooleanField label="Tem ansiedade" field="tem_ansiedade" />
                                        <BooleanField label="Tem insônia" field="tem_insonia" />
                                        <BooleanField label="Tem esquecimento" field="tem_esquecimento" />
                                        <BooleanField label="Tem Alzheimer" field="tem_alzheimer" />
                                        <BooleanField label="Tem Parkinson" field="tem_parkinson" />
                                        <BooleanField label="Hipertensão" field="hipertensao" conditionalField="hipertensao_faz_uso" />
                                        <BooleanField label="Diabetes" field="diabetes" conditionalField="diabetes_faz_uso" />
                                        <BooleanField label="Tem dificuldade de aprendizado" field="tem_dificuldade_aprendizado" />
                                        <BooleanField label="Hiperativo" field="hiperativo" />
                                        <BooleanField label="Agressivo" field="agressivo" />
                                        <BooleanField label="Autismo" field="autismo" />
                                        <BooleanField label="Tem dificuldade para dormir" field="tem_dificuldade_dormir" />
                                    </div>
                                </div>

                                {/* Profissionais */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Profissionais</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Nome do Profissional que fez o Pedido *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nome_profissional_pedido}
                                                onChange={(e) => setData('nome_profissional_pedido', e.target.value)}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm transition-colors duration-200"
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
                                                onChange={(e) => setData('nome_tecnico_medico_exame', e.target.value)}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm transition-colors duration-200"
                                                required
                                            />
                                            {errors.nome_tecnico_medico_exame && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.nome_tecnico_medico_exame}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Momento do exame */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Momento do Exame</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Como o paciente ficou durante o exame? *
                                        </label>
                                        <select
                                            value={data.momento_exame}
                                            onChange={(e) => setData('momento_exame', e.target.value)}
                                            className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm transition-colors duration-200"
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
                                            className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm transition-colors duration-200"
                                            placeholder="Observações adicionais..."
                                        />
                                        {errors.comentario && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.comentario}</div>}
                                    </div>
                                </div>

                                {/* Arquivos */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Arquivos</h3>
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
                                                            className="max-w-full h-auto max-h-64 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                // Aqui você pode implementar lógica para excluir o arquivo atual se necessário
                                                                // Por enquanto apenas mostramos o botão para consistência visual
                                                            }}
                                                            className="absolute top-2 right-2 bg-gray-500 dark:bg-gray-600 hover:bg-gray-700 dark:hover:bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors duration-200"
                                                            title="Arquivo atual"
                                                        >
                                                            ℹ
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <input
                                                id="pedido_medico_input"
                                                type="file"
                                                accept="image/*"
                                                capture={isMobile ? "environment" : undefined}
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    setData('pedido_medico', file);
                                                    
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (e) => {
                                                            setPedidoMedicoPreview(e.target.result);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    } else {
                                                        setPedidoMedicoPreview(null);
                                                    }
                                                }}
                                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm transition-colors duration-200"
                                            />
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Selecione um novo arquivo para substituir o atual</p>
                                            {errors.pedido_medico && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.pedido_medico}</div>}
                                            
                                            {/* Pré-visualização da nova imagem */}
                                            {pedidoMedicoPreview && (
                                                <div className="mt-3">
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nova imagem selecionada:</p>
                                                    <div className="relative">
                                                        <img 
                                                            src={pedidoMedicoPreview}
                                                            alt="Pré-visualização do novo pedido médico"
                                                            className="max-w-full h-auto max-h-64 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setPedidoMedicoPreview(null);
                                                                setData('pedido_medico', null);
                                                                // Limpar o input file específico
                                                                const fileInput = document.getElementById('pedido_medico_input');
                                                                if (fileInput) fileInput.value = '';
                                                            }}
                                                            className="absolute top-2 right-2 bg-red-500 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors duration-200"
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
                                                Assinatura do Paciente
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
                                    <button
                                        type="button"
                                        onClick={() => window.history.back()}
                                        className="bg-gray-500 dark:bg-gray-600 hover:bg-gray-700 dark:hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors duration-200"
                                    >
                                        {processing ? 'Salvando...' : 'Atualizar'}
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
