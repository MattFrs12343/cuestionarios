import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import BirthDateSelectInput from '@/Components/BirthDateSelectInput';
import SignaturePad from '@/Components/SignaturePad';

export default function Create({ auth, teams, retardoMentalGraus }) {
    const { t } = useTranslation();
    const [signatureData, setSignatureData] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        // Datos básicos
        nome: '',
        data_nascimento: '',
        peso: '',
        altura: '',
        data_exame: '',
        rg: '',
        sexo: 'Feminino',
        solicitante: '',
        clinica: '',
        team_id: teams.length === 1 ? teams[0].id : '',
        
        // Potencial Evocado Auditivo
        tem_zumbido_ouvido: false,
        passou_fonoaudiologo: false,
        fonoaudiologo_motivo: '',
        passou_otorrino: false,
        otorrino_motivo: '',
        passa_neurologista: false,
        neurologista_motivo: '',
        passa_neuropediatra: false,
        neuropediatra_motivo: '',
        passa_psiquiatra: false,
        psiquiatra_motivo: '',
        tem_retardo_mental: false,
        retardo_mental_grau: '',
        tem_paralisia_cerebral: false,
        sindrome_down: false,
        autismo: false,
        cefaleia_enxaqueca: false,
        crise_convulsiva: false,
        desmaios: false,
        dificuldade_fala: false,
        deficit_atencao: false,
        dificuldade_aprendizado: false,
        familiar_perda_auditiva: false,
        familiar_perda_auditiva_quem: '',
        teste_orelhinha_alterado: false,
        gestacao_meses: '',
        teve_perda_audicao: false,
        perda_audicao_ouvido: '',
        teve_infeccao_ouvido: false,
        teve_trauma_ouvido: false,
        tem_labirintite_tontura_auditivo: false,
        tem_hipertensao_auditivo: false,
        tem_diabetes_auditivo: false,
        
        // Potencial Evocado Visual
        teve_avc: false,
        avc_quando: '',
        dificuldade_olhar_fixo: false,
        tem_diplopia: false,
        passou_oftalmologista: false,
        oftalmologista_motivo: '',
        tem_patologia_olho: false,
        patologia_olho_detalhes: '',
        usa_oculos: false,
        grau_oculos: '',
        cefaleia_visual: false,
        tem_enxaqueca_visual: false,
        incomoda_claridade: false,
        ve_pontinhos_coloridos: false,
        tem_alucinacoes_visuais: false,
        tem_labirintite_tontura_visual: false,
        tem_hipertensao_visual: false,
        tem_diabetes_visual: false,
        
        // Observaciones
        observacoes: '',
        
        // Archivos
        assinatura_paciente: '',
        pedido_medico: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Preparar los datos para envío
        const submitData = { ...data };
        
        // Manejar la firma digital
        if (signatureData) {
            submitData.assinatura_paciente = signatureData;
        }
        
        // Si hay archivo, usar FormData
        if (data.pedido_medico) {
            const formData = new FormData();
            
            // Agregar todos los campos del formulario
            Object.keys(submitData).forEach(key => {
                if (key === 'pedido_medico') {
                    formData.append(key, data[key]);
                } else if (submitData[key] !== null && submitData[key] !== undefined) {
                    let value = submitData[key];
                    // Converter booleanos para strings para FormData
                    if (typeof value === 'boolean') {
                        value = value ? '1' : '0';
                    }
                    formData.append(key, value);
                }
            });

            post(route('questionnaires.potencial.store'), {
                data: formData,
                forceFormData: true,
            });
        } else {
            // Sin archivo, enviar como objeto normal
            post(route('questionnaires.potencial.store'), {
                data: submitData,
            });
        }
    };

    const handleBirthDateChange = (date) => {
        setData('data_nascimento', date);
    };

    const handleFileChange = (e) => {
        setData('pedido_medico', e.target.files[0]);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {t('Novo Questionário de Potencial Evocado')}
                </h2>
            }
        >
            <Head title="Novo Questionário de Potencial Evocado" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Dados Básicos */}
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                    {t('Dados Básicos')}
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="nome" value={t('Nome')} />
                                        <TextInput
                                            id="nome"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.nome}
                                            onChange={(e) => setData('nome', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.nome} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="rg" value={t('RG ou CPF')} />
                                        <TextInput
                                            id="rg"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.rg}
                                            onChange={(e) => setData('rg', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.rg} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel value={t('Data de Nascimento')} />
                                        <BirthDateSelectInput
                                            value={data.data_nascimento}
                                            onChange={handleBirthDateChange}
                                            className="mt-1"
                                        />
                                        <InputError message={errors.data_nascimento} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="data_exame" value={t('Data do Exame')} />
                                        <TextInput
                                            id="data_exame"
                                            type="date"
                                            className="mt-1 block w-full"
                                            value={data.data_exame}
                                            onChange={(e) => setData('data_exame', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.data_exame} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="peso" value={t('Peso')} />
                                        <TextInput
                                            id="peso"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.peso}
                                            onChange={(e) => setData('peso', e.target.value)}
                                            placeholder="Ex: 70kg"
                                        />
                                        <InputError message={errors.peso} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="altura" value={t('Altura')} />
                                        <TextInput
                                            id="altura"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.altura}
                                            onChange={(e) => setData('altura', e.target.value)}
                                            placeholder="Ex: 1.70m"
                                        />
                                        <InputError message={errors.altura} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="sexo" value={t('Sexo')} />
                                        <select
                                            id="sexo"
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                            value={data.sexo}
                                            onChange={(e) => setData('sexo', e.target.value)}
                                            required
                                        >
                                            <option value="Feminino">{t('Feminino')}</option>
                                            <option value="Masculino">{t('Masculino')}</option>
                                        </select>
                                        <InputError message={errors.sexo} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="solicitante" value={t('Solicitante')} />
                                        <TextInput
                                            id="solicitante"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.solicitante}
                                            onChange={(e) => setData('solicitante', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.solicitante} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="clinica" value={t('Clínica')} />
                                        <TextInput
                                            id="clinica"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.clinica}
                                            onChange={(e) => setData('clinica', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.clinica} className="mt-2" />
                                    </div>

                                    {teams.length > 1 && (
                                        <div>
                                            <InputLabel htmlFor="team_id" value={t('Equipe')} />
                                            <select
                                                id="team_id"
                                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                                value={data.team_id}
                                                onChange={(e) => setData('team_id', e.target.value)}
                                                required
                                            >
                                                <option value="">{t('Selecione uma equipe')}</option>
                                                {teams.map(team => (
                                                    <option key={team.id} value={team.id}>
                                                        {team.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.team_id} className="mt-2" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Potencial Evocado Auditivo */}
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                    {t('Questionário de Potencial Evocado Auditivo')}
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="tem_zumbido_ouvido"
                                            checked={data.tem_zumbido_ouvido}
                                            onChange={(e) => setData('tem_zumbido_ouvido', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="tem_zumbido_ouvido" value={t('Tem zumbido no ouvido?')} className="cursor-pointer" />
                                    </div>

                                    <div>
                                        <div className="flex items-start gap-3 mb-2">
                                            <Checkbox
                                                id="passou_fonoaudiologo"
                                                checked={data.passou_fonoaudiologo}
                                                onChange={(e) => setData('passou_fonoaudiologo', e.target.checked)}
                                                className="mt-1"
                                            />
                                            <InputLabel htmlFor="passou_fonoaudiologo" value={t('Alguma vez já passou com fonoaudiólogo?')} className="cursor-pointer" />
                                        </div>
                                        {data.passou_fonoaudiologo && (
                                            <div className="ml-7">
                                                <TextInput
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.fonoaudiologo_motivo}
                                                    onChange={(e) => setData('fonoaudiologo_motivo', e.target.value)}
                                                    placeholder="Por quê?"
                                                />
                                            </div>
                                        )}
                                        <InputError message={errors.fonoaudiologo_motivo} className="mt-2 ml-7" />
                                    </div>

                                    <div>
                                        <div className="flex items-start gap-3 mb-2">
                                            <Checkbox
                                                id="passou_otorrino"
                                                checked={data.passou_otorrino}
                                                onChange={(e) => setData('passou_otorrino', e.target.checked)}
                                                className="mt-1"
                                            />
                                            <InputLabel htmlFor="passou_otorrino" value={t('Alguma já passou com otorrino?')} className="cursor-pointer" />
                                        </div>
                                        {data.passou_otorrino && (
                                            <div className="ml-7">
                                                <TextInput
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.otorrino_motivo}
                                                    onChange={(e) => setData('otorrino_motivo', e.target.value)}
                                                    placeholder="Por quê?"
                                                />
                                            </div>
                                        )}
                                        <InputError message={errors.otorrino_motivo} className="mt-2 ml-7" />
                                    </div>

                                    <div>
                                        <div className="flex items-start gap-3 mb-2">
                                            <Checkbox
                                                id="passa_neurologista"
                                                checked={data.passa_neurologista}
                                                onChange={(e) => setData('passa_neurologista', e.target.checked)}
                                                className="mt-1"
                                            />
                                            <InputLabel htmlFor="passa_neurologista" value={t('Passa com neurologista?')} className="cursor-pointer" />
                                        </div>
                                        {data.passa_neurologista && (
                                            <div className="ml-7">
                                                <TextInput
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.neurologista_motivo}
                                                    onChange={(e) => setData('neurologista_motivo', e.target.value)}
                                                    placeholder="Por quê?"
                                                />
                                            </div>
                                        )}
                                        <InputError message={errors.neurologista_motivo} className="mt-2 ml-7" />
                                    </div>

                                    <div>
                                        <div className="flex items-start gap-3 mb-2">
                                            <Checkbox
                                                id="passa_neuropediatra"
                                                checked={data.passa_neuropediatra}
                                                onChange={(e) => setData('passa_neuropediatra', e.target.checked)}
                                                className="mt-1"
                                            />
                                            <InputLabel htmlFor="passa_neuropediatra" value={t('Passa com neuropediatra?')} className="cursor-pointer" />
                                        </div>
                                        {data.passa_neuropediatra && (
                                            <div className="ml-7">
                                                <TextInput
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.neuropediatra_motivo}
                                                    onChange={(e) => setData('neuropediatra_motivo', e.target.value)}
                                                    placeholder="Por quê?"
                                                />
                                            </div>
                                        )}
                                        <InputError message={errors.neuropediatra_motivo} className="mt-2 ml-7" />
                                    </div>

                                    <div>
                                        <div className="flex items-start gap-3 mb-2">
                                            <Checkbox
                                                id="passa_psiquiatra"
                                                checked={data.passa_psiquiatra}
                                                onChange={(e) => setData('passa_psiquiatra', e.target.checked)}
                                                className="mt-1"
                                            />
                                            <InputLabel htmlFor="passa_psiquiatra" value={t('Passa com psiquiatra?')} className="cursor-pointer" />
                                        </div>
                                        {data.passa_psiquiatra && (
                                            <div className="ml-7">
                                                <TextInput
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.psiquiatra_motivo}
                                                    onChange={(e) => setData('psiquiatra_motivo', e.target.value)}
                                                    placeholder="Por quê?"
                                                />
                                            </div>
                                        )}
                                        <InputError message={errors.psiquiatra_motivo} className="mt-2 ml-7" />
                                    </div>

                                    <div>
                                        <div className="flex items-start gap-3 mb-2">
                                            <Checkbox
                                                id="tem_retardo_mental"
                                                checked={data.tem_retardo_mental}
                                                onChange={(e) => setData('tem_retardo_mental', e.target.checked)}
                                                className="mt-1"
                                            />
                                            <InputLabel htmlFor="tem_retardo_mental" value={t('Tem diagnóstico de Retardo Mental?')} className="cursor-pointer" />
                                        </div>
                                        {data.tem_retardo_mental && (
                                            <div className="ml-7">
                                                <select
                                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                                    value={data.retardo_mental_grau}
                                                    onChange={(e) => setData('retardo_mental_grau', e.target.value)}
                                                >
                                                    <option value="">{t('Selecione o grau')}</option>
                                                    {retardoMentalGraus.map(grau => (
                                                        <option key={grau} value={grau}>{grau}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="tem_paralisia_cerebral"
                                            checked={data.tem_paralisia_cerebral}
                                            onChange={(e) => setData('tem_paralisia_cerebral', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="tem_paralisia_cerebral" value={t('Tem paralisia cerebral?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="sindrome_down"
                                            checked={data.sindrome_down}
                                            onChange={(e) => setData('sindrome_down', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="sindrome_down" value={t('Síndrome de Down?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="autismo"
                                            checked={data.autismo}
                                            onChange={(e) => setData('autismo', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="autismo" value={t('Autismo?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="cefaleia_enxaqueca"
                                            checked={data.cefaleia_enxaqueca}
                                            onChange={(e) => setData('cefaleia_enxaqueca', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="cefaleia_enxaqueca" value={t('Cefaléa ou Enxaqueca?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="crise_convulsiva"
                                            checked={data.crise_convulsiva}
                                            onChange={(e) => setData('crise_convulsiva', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="crise_convulsiva" value={t('Crise Convulsiva?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="desmaios"
                                            checked={data.desmaios}
                                            onChange={(e) => setData('desmaios', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="desmaios" value={t('Desmaios?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="dificuldade_fala"
                                            checked={data.dificuldade_fala}
                                            onChange={(e) => setData('dificuldade_fala', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="dificuldade_fala" value={t('Dificuldade na fala?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="deficit_atencao"
                                            checked={data.deficit_atencao}
                                            onChange={(e) => setData('deficit_atencao', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="deficit_atencao" value={t('Déficit de atenção?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="dificuldade_aprendizado"
                                            checked={data.dificuldade_aprendizado}
                                            onChange={(e) => setData('dificuldade_aprendizado', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="dificuldade_aprendizado" value={t('Dificuldade de aprendizado?')} className="cursor-pointer" />
                                    </div>

                                    <div>
                                        <div className="flex items-start gap-3 mb-2">
                                            <Checkbox
                                                id="familiar_perda_auditiva"
                                                checked={data.familiar_perda_auditiva}
                                                onChange={(e) => setData('familiar_perda_auditiva', e.target.checked)}
                                                className="mt-1"
                                            />
                                            <InputLabel htmlFor="familiar_perda_auditiva" value={t('Algum familiar tem perda auditiva?')} className="cursor-pointer" />
                                        </div>
                                        {data.familiar_perda_auditiva && (
                                            <div className="ml-7">
                                                <TextInput
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.familiar_perda_auditiva_quem}
                                                    onChange={(e) => setData('familiar_perda_auditiva_quem', e.target.value)}
                                                    placeholder="Quem?"
                                                />
                                            </div>
                                        )}
                                        <InputError message={errors.familiar_perda_auditiva_quem} className="mt-2 ml-7" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="teste_orelhinha_alterado"
                                            checked={data.teste_orelhinha_alterado}
                                            onChange={(e) => setData('teste_orelhinha_alterado', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="teste_orelhinha_alterado" value={t('Se criança, fez o teste da orelhinha? Deu alterado?')} className="cursor-pointer" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="gestacao_meses" value={t('Se criança, quantos meses foi a gestação?')} />
                                        <TextInput
                                            id="gestacao_meses"
                                            type="number"
                                            min="1"
                                            max="12"
                                            className="mt-1 block w-full"
                                            value={data.gestacao_meses}
                                            onChange={(e) => setData('gestacao_meses', e.target.value)}
                                        />
                                        <InputError message={errors.gestacao_meses} className="mt-2" />
                                    </div>

                                    <div>
                                        <div className="flex items-start gap-3 mb-2">
                                            <Checkbox
                                                id="teve_perda_audicao"
                                                checked={data.teve_perda_audicao}
                                                onChange={(e) => setData('teve_perda_audicao', e.target.checked)}
                                                className="mt-1"
                                            />
                                            <InputLabel htmlFor="teve_perda_audicao" value={t('Teve perda da audição?')} className="cursor-pointer" />
                                        </div>
                                        {data.teve_perda_audicao && (
                                            <div className="ml-7">
                                                <TextInput
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.perda_audicao_ouvido}
                                                    onChange={(e) => setData('perda_audicao_ouvido', e.target.value)}
                                                    placeholder="Se sim, de qual ouvido?"
                                                />
                                            </div>
                                        )}
                                        <InputError message={errors.perda_audicao_ouvido} className="mt-2 ml-7" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="teve_infeccao_ouvido"
                                            checked={data.teve_infeccao_ouvido}
                                            onChange={(e) => setData('teve_infeccao_ouvido', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="teve_infeccao_ouvido" value={t('Já teve infecção de ouvido?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="teve_trauma_ouvido"
                                            checked={data.teve_trauma_ouvido}
                                            onChange={(e) => setData('teve_trauma_ouvido', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="teve_trauma_ouvido" value={t('Alguma vez já teve trauma de ouvido?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="tem_labirintite_tontura_auditivo"
                                            checked={data.tem_labirintite_tontura_auditivo}
                                            onChange={(e) => setData('tem_labirintite_tontura_auditivo', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="tem_labirintite_tontura_auditivo" value={t('Tem labirintites ou Tontura?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="tem_hipertensao_auditivo"
                                            checked={data.tem_hipertensao_auditivo}
                                            onChange={(e) => setData('tem_hipertensao_auditivo', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="tem_hipertensao_auditivo" value={t('Tem Hipertensão Arterial?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="tem_diabetes_auditivo"
                                            checked={data.tem_diabetes_auditivo}
                                            onChange={(e) => setData('tem_diabetes_auditivo', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="tem_diabetes_auditivo" value={t('Tem Diabetes?')} className="cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            {/* Potencial Evocado Visual */}
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                    {t('Questionário de Potencial Evocado Visual')}
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-start gap-3 mb-2">
                                            <Checkbox
                                                id="teve_avc"
                                                checked={data.teve_avc}
                                                onChange={(e) => setData('teve_avc', e.target.checked)}
                                                className="mt-1"
                                            />
                                            <InputLabel htmlFor="teve_avc" value={t('Já teve AVC? Quando?')} className="cursor-pointer" />
                                        </div>
                                        {data.teve_avc && (
                                            <div className="ml-7">
                                                <TextInput
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.avc_quando}
                                                    onChange={(e) => setData('avc_quando', e.target.value)}
                                                    placeholder="Quando teve AVC?"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="dificuldade_olhar_fixo"
                                            checked={data.dificuldade_olhar_fixo}
                                            onChange={(e) => setData('dificuldade_olhar_fixo', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="dificuldade_olhar_fixo" value={t('Tem dificuldade para olhar fixo, nos objetos?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="tem_diplopia"
                                            checked={data.tem_diplopia}
                                            onChange={(e) => setData('tem_diplopia', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="tem_diplopia" value={t('Tem diplopia (visão dupla)?')} className="cursor-pointer" />
                                    </div>

                                    <div>
                                        <div className="flex items-start gap-3 mb-2">
                                            <Checkbox
                                                id="passou_oftalmologista"
                                                checked={data.passou_oftalmologista}
                                                onChange={(e) => setData('passou_oftalmologista', e.target.checked)}
                                                className="mt-1"
                                            />
                                            <InputLabel htmlFor="passou_oftalmologista" value={t('Passou com oftalmologista?')} className="cursor-pointer" />
                                        </div>
                                        {data.passou_oftalmologista && (
                                            <div className="ml-7">
                                                <TextInput
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.oftalmologista_motivo}
                                                    onChange={(e) => setData('oftalmologista_motivo', e.target.value)}
                                                    placeholder="Por quê?"
                                                />
                                            </div>
                                        )}
                                        <InputError message={errors.oftalmologista_motivo} className="mt-2 ml-7" />
                                    </div>

                                    <div>
                                        <div className="flex items-start gap-3 mb-2">
                                            <Checkbox
                                                id="tem_patologia_olho"
                                                checked={data.tem_patologia_olho}
                                                onChange={(e) => setData('tem_patologia_olho', e.target.checked)}
                                                className="mt-1"
                                            />
                                            <InputLabel htmlFor="tem_patologia_olho" value={t('Tem alguma patologia (doença) no olho?')} className="cursor-pointer" />
                                        </div>
                                        {data.tem_patologia_olho && (
                                            <div className="ml-7">
                                                <TextInput
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.patologia_olho_detalhes}
                                                    onChange={(e) => setData('patologia_olho_detalhes', e.target.value)}
                                                    placeholder="Qual patologia?"
                                                />
                                            </div>
                                        )}
                                        <InputError message={errors.patologia_olho_detalhes} className="mt-2 ml-7" />
                                    </div>

                                    <div>
                                        <div className="flex items-start gap-3 mb-2">
                                            <Checkbox
                                                id="usa_oculos"
                                                checked={data.usa_oculos}
                                                onChange={(e) => setData('usa_oculos', e.target.checked)}
                                                className="mt-1"
                                            />
                                            <InputLabel htmlFor="usa_oculos" value={t('Usa óculos?')} className="cursor-pointer" />
                                        </div>
                                        {data.usa_oculos && (
                                            <div className="ml-7">
                                                <TextInput
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.grau_oculos}
                                                    onChange={(e) => setData('grau_oculos', e.target.value)}
                                                    placeholder="Qual grau de cada olho?"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="cefaleia_visual"
                                            checked={data.cefaleia_visual}
                                            onChange={(e) => setData('cefaleia_visual', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="cefaleia_visual" value={t('Cefaléia?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="tem_enxaqueca_visual"
                                            checked={data.tem_enxaqueca_visual}
                                            onChange={(e) => setData('tem_enxaqueca_visual', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="tem_enxaqueca_visual" value={t('Tem enxaqueca?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="incomoda_claridade"
                                            checked={data.incomoda_claridade}
                                            onChange={(e) => setData('incomoda_claridade', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="incomoda_claridade" value={t('Se incomoda com a claridade da luz?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="ve_pontinhos_coloridos"
                                            checked={data.ve_pontinhos_coloridos}
                                            onChange={(e) => setData('ve_pontinhos_coloridos', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="ve_pontinhos_coloridos" value={t('Alguma vez, você olhou pontinhos pretos ou coloridos?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="tem_alucinacoes_visuais"
                                            checked={data.tem_alucinacoes_visuais}
                                            onChange={(e) => setData('tem_alucinacoes_visuais', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="tem_alucinacoes_visuais" value={t('Alguma vez, tem alucinações visuais (ver vulto)?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="tem_labirintite_tontura_visual"
                                            checked={data.tem_labirintite_tontura_visual}
                                            onChange={(e) => setData('tem_labirintite_tontura_visual', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="tem_labirintite_tontura_visual" value={t('Tem labirintites ou Tontura?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="tem_hipertensao_visual"
                                            checked={data.tem_hipertensao_visual}
                                            onChange={(e) => setData('tem_hipertensao_visual', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="tem_hipertensao_visual" value={t('Tem Hipertensão Arterial?')} className="cursor-pointer" />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="tem_diabetes_visual"
                                            checked={data.tem_diabetes_visual}
                                            onChange={(e) => setData('tem_diabetes_visual', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <InputLabel htmlFor="tem_diabetes_visual" value={t('Tem Diabetes?')} className="cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            {/* Observações */}
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                    {t('Observações')}
                                </h3>
                                
                                <div>
                                    <InputLabel htmlFor="observacoes" value={t('Observações')} />
                                    <textarea
                                        id="observacoes"
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        rows="4"
                                        value={data.observacoes}
                                        onChange={(e) => setData('observacoes', e.target.value)}
                                    />
                                    <InputError message={errors.observacoes} className="mt-2" />
                                </div>
                            </div>

                            {/* Assinatura e Pedido Médico */}
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                    {t('Assinatura e Documentos')}
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <InputLabel value={t('Assinatura do Paciente')} />
                                        <SignaturePad
                                            onSignatureChange={setSignatureData}
                                            className="mt-1"
                                        />
                                        <InputError message={errors.assinatura_paciente} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="pedido_medico" value={t('Pedido Médico (Imagem)')} />
                                        <input
                                            id="pedido_medico"
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={handleFileChange}
                                            className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300"
                                        />
                                        <InputError message={errors.pedido_medico} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Botões */}
                            <div className="flex items-center justify-end space-x-4">
                                <SecondaryButton
                                    type="button"
                                    onClick={() => window.history.back()}
                                >
                                    {t('Cancelar')}
                                </SecondaryButton>
                                
                                <PrimaryButton disabled={processing}>
                                    {processing ? t('Salvando...') : t('Salvar Questionário')}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}