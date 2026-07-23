import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect, useCallback, memo } from 'react';
import SignaturePad from '@/Components/SignaturePad';
import BirthDateSelectInput from '@/Components/BirthDateSelectInput';
import { compressImage, formatFileSize, getCompressionRatio } from '@/Utils/imageCompression';

// Componente BooleanField fuera del componente principal para evitar recreación
const BooleanField = memo(({ label, field, value, onBooleanChange, conditionalFields = [], data, onDataChange, errors }) => {
    const handleRadioClick = (newValue) => {
        onBooleanChange(field, newValue);
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
                        checked={value === true}
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
                        checked={value === false}
                        onChange={() => {}}
                        className="mr-2 pointer-events-none text-indigo-600 dark:text-indigo-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                    />
                    NÃO
                </label>
            </div>
            {errors[field] && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors[field]}</div>}
            
            {value && conditionalFields.map((condField, index) => (
                <div key={index} className="mt-2">
                    <input
                        type={condField.type || 'text'}
                        value={data[condField.name] || ''}
                        onChange={(e) => onDataChange(condField.name, e.target.value)}
                        placeholder={condField.placeholder}
                        className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200"
                    />
                    {errors[condField.name] && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors[condField.name]}</div>}
                </div>
            ))}
        </div>
    );
});

BooleanField.displayName = 'BooleanField';

export default function Create({ auth, teams }) {
    const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const { data, setData, post, processing, errors } = useForm({
        nome: '',
        data_nascimento: '',
        idade: '',
        peso: '',
        altura: '',
        data_exame: getCurrentDate(),
        rg: '',
        solicitante: '',
        clinica: '',
        sexo: '',
        team_id: '',
        tem_dor_testa: false,
        tem_dor_olhos: false,
        dor_olhos_lado: '',
        tem_dor_mandibula: false,
        tem_dor_dentes_agua_gelada: false,
        tem_espasmos_face: false,
        espasmos_face_parte: '',
        aplicou_botox: false,
        botox_parte_face: '',
        tem_implante_dentario: false,
        tem_dores_apos_implante: false,
        teve_paralisia_facial: false,
        paralisia_facial_vezes: '',
        tem_parte_face_paralisada: false,
        parte_face_paralisada_qual: '',
        tem_enxaqueca: false,
        consegue_sorrir_normalmente: false,
        pode_comer_normalmente: false,
        pode_assoviar: false,
        consegue_encher_bexiga: false,
        tem_infeccao_ouvido_repetidamente: false,
        diabetico: false,
        toma_medicamento: false,
        medicamentos: '',
        assinatura_paciente: null,
        pedido_medico: null,
    });

    const [idadeCalculada, setIdadeCalculada] = useState(null);
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [pedidoMedicoPreview, setPedidoMedicoPreview] = useState(null);
    const [imageCompressionInfo, setImageCompressionInfo] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);

    useEffect(() => {
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
                setIdadeCalculada(months + (months === 1 ? ' mês' : ' meses'));
            } else {
                setIdadeCalculada(finalAge + (finalAge === 1 ? ' ano' : ' anos'));
            }
        } else {
            setIdadeCalculada(null);
        }
    }, [data.data_nascimento]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Calcular idade antes de enviar
        if (data.data_nascimento && data.data_exame) {
            const birthDate = new Date(data.data_nascimento);
            const examDate = new Date(data.data_exame);
            
            let age = examDate.getFullYear() - birthDate.getFullYear();
            const monthDiff = examDate.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && examDate.getDate() < birthDate.getDate())) {
                age--;
            }
            
            // Si es menor de 1 año, calcular meses
            if (age < 1) {
                let months = (examDate.getFullYear() - birthDate.getFullYear()) * 12;
                months -= birthDate.getMonth();
                months += examDate.getMonth();
                if (examDate.getDate() < birthDate.getDate()) {
                    months--;
                }
                setData('idade', months < 1 ? 0 : months);
            } else {
                setData('idade', age);
            }
        }
        
        post(route('questionnaires.eletroneuromiografia-facial.store'));
    };

    const handleBooleanChange = useCallback((field, value) => {
        setData(prevData => {
            const newData = { ...prevData, [field]: value };
            
            if (!value) {
                if (field === 'tem_dor_olhos') newData.dor_olhos_lado = '';
                if (field === 'tem_espasmos_face') newData.espasmos_face_parte = '';
                if (field === 'aplicou_botox') newData.botox_parte_face = '';
                if (field === 'teve_paralisia_facial') newData.paralisia_facial_vezes = '';
                if (field === 'tem_parte_face_paralisada') newData.parte_face_paralisada_qual = '';
                if (field === 'toma_medicamento') newData.medicamentos = '';
            }
            
            return newData;
        });
    }, [setData]);

    const handleDataChange = useCallback((field, value) => {
        setData(field, value);
    }, [setData]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                                Novo Questionário
                            </h2>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Eletroneuromiografia Facial
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Novo Questionário - Eletroneuromiografia Facial" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 px-6 py-4">
                            <div className="flex items-center">
                                <svg className="w-8 h-8 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Formulário de Registro</h3>
                                    <p className="text-sm text-orange-100">Preencha as informações do paciente</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <form onSubmit={handleSubmit} encType="multipart/form-data">
                                {/* Dados básicos */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dados Básicos</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
                                            <input type="text" value={data.nome} onChange={(e) => setData('nome', e.target.value.toUpperCase())} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 uppercase" required />
                                            {errors.nome && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.nome}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Nascimento *</label>
                                            <BirthDateSelectInput value={data.data_nascimento} onChange={(value) => setData('data_nascimento', value)} required={true} />
                                            {idadeCalculada !== null && (<div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Idade: {idadeCalculada}</div>)}
                                            {errors.data_nascimento && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.data_nascimento}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Peso (kg)</label>
                                            <input type="number" step="0.01" value={data.peso} onChange={(e) => setData('peso', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" />
                                            {errors.peso && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.peso}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Altura (m)</label>
                                            <input type="number" step="0.01" value={data.altura} onChange={(e) => setData('altura', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" />
                                            {errors.altura && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.altura}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data do Exame *</label>
                                            <input type="date" value={data.data_exame} onChange={(e) => setData('data_exame', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" required />
                                            {errors.data_exame && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.data_exame}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RG *</label>
                                            <input type="text" value={data.rg} onChange={(e) => setData('rg', e.target.value.toUpperCase())} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 uppercase" required />
                                            {errors.rg && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.rg}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sexo *</label>
                                            <select value={data.sexo} onChange={(e) => setData('sexo', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" required>
                                                <option value="">Selecione...</option>
                                                <option value="Masculino">Masculino</option>
                                                <option value="Feminino">Feminino</option>
                                            </select>
                                            {errors.sexo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.sexo}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Solicitante *</label>
                                            <input type="text" value={data.solicitante} onChange={(e) => setData('solicitante', e.target.value.toUpperCase())} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 uppercase" required />
                                            {errors.solicitante && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.solicitante}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Clínica *</label>
                                            <input type="text" value={data.clinica} onChange={(e) => setData('clinica', e.target.value.toUpperCase())} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 uppercase" required />
                                            {errors.clinica && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.clinica}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Equipe *</label>
                                            <select value={data.team_id} onChange={(e) => setData('team_id', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" required>
                                                <option value="">Selecione uma equipe...</option>
                                                {teams.map((team) => (<option key={team.id} value={team.id}>{team.name}</option>))}
                                            </select>
                                            {errors.team_id && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.team_id}</div>}
                                        </div>
                                    </div>
                                </div>
                                {/* Questionário */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-pink-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Questionário de Eletroneuromiografia Facial</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <BooleanField label="Tem dor na testa?" field="tem_dor_testa" value={data.tem_dor_testa} onBooleanChange={handleBooleanChange} data={data} onDataChange={handleDataChange} errors={errors} />
                                        <BooleanField label="Está com dor nos olhos? (Direito ou esquerdo)" field="tem_dor_olhos" value={data.tem_dor_olhos} onBooleanChange={handleBooleanChange} conditionalFields={[{name: 'dor_olhos_lado', placeholder: 'Direito ou esquerdo?'}]} data={data} onDataChange={handleDataChange} errors={errors} />
                                        <BooleanField label="Está com dor na mandíbula?" field="tem_dor_mandibula" value={data.tem_dor_mandibula} onBooleanChange={handleBooleanChange} data={data} onDataChange={handleDataChange} errors={errors} />
                                        <BooleanField label="Quando toma água gelada, tem dor nos dentes?" field="tem_dor_dentes_agua_gelada" value={data.tem_dor_dentes_agua_gelada} onBooleanChange={handleBooleanChange} data={data} onDataChange={handleDataChange} errors={errors} />
                                        <BooleanField label="Tem espasmos na face? Qual parte?" field="tem_espasmos_face" value={data.tem_espasmos_face} onBooleanChange={handleBooleanChange} conditionalFields={[{name: 'espasmos_face_parte', placeholder: 'Qual parte?'}]} data={data} onDataChange={handleDataChange} errors={errors} />
                                        <BooleanField label="Alguma vez aplicou Botox?" field="aplicou_botox" value={data.aplicou_botox} onBooleanChange={handleBooleanChange} conditionalFields={[{name: 'botox_parte_face', placeholder: 'Em qual parte da face foi aplicado o Botox?'}]} data={data} onDataChange={handleDataChange} errors={errors} />
                                        <BooleanField label="Tem implante dentário?" field="tem_implante_dentario" value={data.tem_implante_dentario} onBooleanChange={handleBooleanChange} data={data} onDataChange={handleDataChange} errors={errors} />
                                        <BooleanField label="Depois que colocou o implante, apresentou dores de dente ou da face?" field="tem_dores_apos_implante" value={data.tem_dores_apos_implante} onBooleanChange={handleBooleanChange} data={data} onDataChange={handleDataChange} errors={errors} />
                                        <BooleanField label="Já teve paralisia facial?" field="teve_paralisia_facial" value={data.teve_paralisia_facial} onBooleanChange={handleBooleanChange} conditionalFields={[{name: 'paralisia_facial_vezes', type: 'number', placeholder: 'Quantas vezes teve paralisia facial?'}]} data={data} onDataChange={handleDataChange} errors={errors} />
                                        <BooleanField label="Tem alguma parte da face que está paralisada?" field="tem_parte_face_paralisada" value={data.tem_parte_face_paralisada} onBooleanChange={handleBooleanChange} conditionalFields={[{name: 'parte_face_paralisada_qual', placeholder: 'Qual?'}]} data={data} onDataChange={handleDataChange} errors={errors} />
                                        <BooleanField label="Tem enxaqueca?" field="tem_enxaqueca" value={data.tem_enxaqueca} onBooleanChange={handleBooleanChange} data={data} onDataChange={handleDataChange} errors={errors} />
                                        <BooleanField label="Consegue sorrir normalmente?" field="consegue_sorrir_normalmente" value={data.consegue_sorrir_normalmente} onBooleanChange={handleBooleanChange} data={data} onDataChange={handleDataChange} errors={errors} />
                                        <BooleanField label="Pode comer normalmente?" field="pode_comer_normalmente" value={data.pode_comer_normalmente} onBooleanChange={handleBooleanChange} data={data} onDataChange={handleDataChange} errors={errors} />
                                        <BooleanField label="Pode assoviar?" field="pode_assoviar" value={data.pode_assoviar} onBooleanChange={handleBooleanChange} data={data} onDataChange={handleDataChange} errors={errors} />
                                        <BooleanField label="Consegue encher uma bexiga?" field="consegue_encher_bexiga" value={data.consegue_encher_bexiga} onBooleanChange={handleBooleanChange} data={data} onDataChange={handleDataChange} errors={errors} />
                                        <BooleanField label="Tem infecção de ouvido repetidamente?" field="tem_infeccao_ouvido_repetidamente" value={data.tem_infeccao_ouvido_repetidamente} onBooleanChange={handleBooleanChange} data={data} onDataChange={handleDataChange} errors={errors} />
                                        <BooleanField label="Diabético (a)" field="diabetico" value={data.diabetico} onBooleanChange={handleBooleanChange} data={data} onDataChange={handleDataChange} errors={errors} />
                                        <BooleanField label="Toma algum tipo de medicamento?" field="toma_medicamento" value={data.toma_medicamento} onBooleanChange={handleBooleanChange} conditionalFields={[{name: 'medicamentos', placeholder: 'Quais?'}]} data={data} onDataChange={handleDataChange} errors={errors} />
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
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pedido Médico</label>
                                            <input type="file" accept="image/*" capture={isMobileDevice ? "environment" : undefined} onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) {
                                                    setData('pedido_medico', null);
                                                    setPedidoMedicoPreview(null);
                                                    setImageCompressionInfo(null);
                                                    return;
                                                }
                                                try {
                                                    setIsCompressing(true);
                                                    const compressedFile = await compressImage(file, {maxWidth: 1920, maxHeight: 1080, quality: 0.8, outputFormat: 'image/jpeg'});
                                                    const compressionRatio = getCompressionRatio(file.size, compressedFile.size);
                                                    setImageCompressionInfo({originalSize: formatFileSize(file.size), compressedSize: formatFileSize(compressedFile.size), compressionRatio: compressionRatio});
                                                    setData('pedido_medico', compressedFile);
                                                    const reader = new FileReader();
                                                    reader.onload = (e) => {setPedidoMedicoPreview(e.target.result);};
                                                    reader.readAsDataURL(compressedFile);
                                                } catch (error) {
                                                    console.error('Error al comprimir imagen:', error);
                                                    setData('pedido_medico', file);
                                                    setImageCompressionInfo(null);
                                                    const reader = new FileReader();
                                                    reader.onload = (e) => {setPedidoMedicoPreview(e.target.result);};
                                                    reader.readAsDataURL(file);
                                                } finally {
                                                    setIsCompressing(false);
                                                }
                                            }} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" />
                                            {errors.pedido_medico && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.pedido_medico}</div>}
                                            {isCompressing && (<div className="mt-2 text-sm text-blue-600 dark:text-blue-400">🔄 Comprimindo imagen...</div>)}
                                            {imageCompressionInfo && (<div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm"><div className="text-green-800 dark:text-green-300">✅ Imagen comprimida exitosamente</div><div className="text-green-700 dark:text-green-400 mt-1">Tamaño original: {imageCompressionInfo.originalSize} → Comprimido: {imageCompressionInfo.compressedSize} ({imageCompressionInfo.compressionRatio}% reducción)</div></div>)}
                                            {pedidoMedicoPreview && (<div className="mt-3"><p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pré-visualização:</p><div className="relative"><img src={pedidoMedicoPreview} alt="Pré-visualização do pedido médico" className="max-w-full h-auto max-h-64 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-gray-900/50" /><button type="button" onClick={() => {setPedidoMedicoPreview(null); setData('pedido_medico', null); setImageCompressionInfo(null); const fileInput = document.querySelector('input[type="file"][accept="image/*"]'); if (fileInput) fileInput.value = '';}} className="absolute top-2 right-2 bg-red-500 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors duration-200" title="Excluir imagem">×</button></div></div>)}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assinatura do Paciente</label>
                                            <SignaturePad onSignatureChange={(signature) => setData('assinatura_paciente', signature)} className="w-full" />
                                            {errors.assinatura_paciente && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.assinatura_paciente}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Botões */}
                                <div className="flex justify-end space-x-3">
                                    <button type="button" onClick={() => window.history.back()} className="px-6 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200">Cancelar</button>
                                    <button type="submit" disabled={processing} className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 text-white rounded-lg hover:from-orange-600 hover:to-red-700 dark:hover:from-orange-700 dark:hover:to-red-800 transition-colors duration-200 disabled:opacity-50">{processing ? 'Salvando...' : 'Salvar Questionário'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
