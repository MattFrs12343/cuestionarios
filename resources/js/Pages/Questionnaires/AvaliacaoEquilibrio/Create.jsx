import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import AnexosUploader from '@/Components/AnexosUploader';
import { useState, useEffect } from 'react';
import SignaturePad from '@/Components/SignaturePad';
import BirthDateSelectInput from '@/Components/BirthDateSelectInput';
import { compressImage, formatFileSize, getCompressionRatio } from '@/Utils/imageCompression';

const BERG_ITEMS = [
    { field: 'berg_sentado_para_pe', label: '1. Sentado para de pé', help: 'Consegue levantar sem ajuda das mãos?' },
    { field: 'berg_permanecer_pe_sem_apoio', label: '2. Permanecer de pé sem apoio', help: 'Fica estável por 2 minutos em pé?' },
    { field: 'berg_sentado_sem_apoio', label: '3. Sentado sem apoio dorsal', help: 'Mantém a posição com braços cruzados por 2 min?' },
    { field: 'berg_pe_para_sentado', label: '4. De pé para sentado', help: 'Senta-se de forma controlada ou despenca?' },
    { field: 'berg_transferencias', label: '5. Transferências entre cadeiras', help: 'Move-se com segurança entre duas superfícies?' },
    { field: 'berg_pe_olhos_fechados', label: '6. De pé com olhos fechados', help: 'Consegue manter por 10 segundos sem oscilar?' },
    { field: 'berg_pe_pes_juntos', label: '7. De pé com pés juntos', help: 'Mantém os pés unidos por 1 minuto?' },
    { field: 'berg_alcance_anterior', label: '8. Alcance anterior com braço', help: 'Estende o braço para frente > 25 cm sem mover pés?' },
    { field: 'berg_pegar_objeto_chao', label: '9. Pegar objeto do chão', help: 'Recolhe um objeto à sua frente com segurança?' },
    { field: 'berg_olhar_para_tras', label: '10. Olhar para trás (ombros)', help: 'Gira o tronco para olhar atrás dos ombros?' },
    { field: 'berg_girar_360', label: '11. Girar 360 graus', help: 'Dá uma volta completa em menos de 4 segundos?' },
    { field: 'berg_tocar_degrau', label: '12. Tocar degrau alternadamente', help: 'Faz 8 toques rápidos com os pés em um degrau?' },
    { field: 'berg_posicao_tandem', label: '13. Posição de Tândem', help: 'Coloca um pé imediatamente à frente do outro por 30s?' },
    { field: 'berg_apoio_monopodal', label: '14. Apoio Monopodal', help: 'Mantém-se em uma só perna por mais de 10 segundos?' },
];

const BergField = ({ item, value, onChange, errors }) => (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{item.help}</p>
        <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value}
            onChange={(e) => {
                let digits = e.target.value.replace(/[^0-9]/g, '');
                if (digits !== '' && parseInt(digits, 10) > 4) digits = '4';
                onChange(item.field, digits);
            }}
            className="w-24 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200"
        />
        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(0-4)</span>
        {errors[item.field] && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors[item.field]}</div>}
    </div>
);

export default function Create({ auth, teams }) {
    const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const { data, setData, post, processing, errors } = useForm({
        nome_completo: '',
        rg_ou_cpf: '',
        data_nascimento: '',
        sexo: '',
        clinica: '',
        data_exame: getCurrentDate(),
        team_id: '',
        tug_tempo_segundos: '',
        berg_sentado_para_pe: '',
        berg_permanecer_pe_sem_apoio: '',
        berg_sentado_sem_apoio: '',
        berg_pe_para_sentado: '',
        berg_transferencias: '',
        berg_pe_olhos_fechados: '',
        berg_pe_pes_juntos: '',
        berg_alcance_anterior: '',
        berg_pegar_objeto_chao: '',
        berg_olhar_para_tras: '',
        berg_girar_360: '',
        berg_tocar_degrau: '',
        berg_posicao_tandem: '',
        berg_apoio_monopodal: '',
        berg_total: '',
        nome_avaliador: '',
        cid: '',
        comentario: '',
        assinatura_paciente: null,
        pedido_medico: null,
        anexos: [],
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
            setIdadeCalculada(finalAge + (finalAge === 1 ? ' ano' : ' anos'));
        } else {
            setIdadeCalculada(null);
        }
    }, [data.data_nascimento]);

    useEffect(() => {
        const sum = BERG_ITEMS.reduce((acc, item) => acc + (parseInt(data[item.field]) || 0), 0);
        if (String(sum) !== String(data.berg_total)) {
            setData('berg_total', sum);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, BERG_ITEMS.map((item) => data[item.field]));

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('questionnaires.equilibrio.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                                Novo Questionário
                            </h2>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Avaliação do Equilíbrio e Risco de Quedas
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Novo Questionário - Avaliação do Equilíbrio" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 dark:from-yellow-600 dark:to-orange-700 px-6 py-4">
                            <div className="flex items-center">
                                <svg className="w-8 h-8 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Avaliação do Equilíbrio Clínico e Risco de Quedas</h3>
                                    <p className="text-sm text-yellow-100">TUG + Escala de Equilíbrio de Berg</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <form onSubmit={handleSubmit} encType="multipart/form-data">
                                {/* Dados básicos */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dados Básicos</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Paciente *</label>
                                            <input type="text" value={data.nome_completo} onChange={(e) => setData('nome_completo', e.target.value.toUpperCase())} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 uppercase" required />
                                            {errors.nome_completo && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.nome_completo}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RG ou CPF *</label>
                                            <input type="text" value={data.rg_ou_cpf} onChange={(e) => setData('rg_ou_cpf', e.target.value.toUpperCase())} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 uppercase" required />
                                            {errors.rg_ou_cpf && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.rg_ou_cpf}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Nascimento *</label>
                                            <BirthDateSelectInput value={data.data_nascimento} onChange={(value) => setData('data_nascimento', value)} required={true} />
                                            {idadeCalculada !== null && (<div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Idade: {idadeCalculada}</div>)}
                                            {errors.data_nascimento && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.data_nascimento}</div>}
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
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data do Exame *</label>
                                            <input type="date" value={data.data_exame} onChange={(e) => setData('data_exame', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" required />
                                            {errors.data_exame && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.data_exame}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Clínica</label>
                                            <input type="text" value={data.clinica} onChange={(e) => setData('clinica', e.target.value.toUpperCase())} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 uppercase" />
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

                                {/* TUG */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Teste Cronometrado: Timed Up and Go (TUG)</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2"><strong>Materiais básicos obrigatórios:</strong> Cadeira estável com braços, fita de marcação a 3 metros de distância e cronômetro.</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4"><strong>Protocolo de Aplicação:</strong> Paciente inicia sentado com as costas apoiadas. Ao sinal 'Já', levanta-se, caminha em ritmo confortável por 3 metros, contorna a marca, retorna e senta-se novamente.</p>
                                    <div className="max-w-xs">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tempo Registrado (segundos)</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={data.tug_tempo_segundos}
                                            onChange={(e) => {
                                                let v = e.target.value.replace(/[^0-9.]/g, '');
                                                const parts = v.split('.');
                                                if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('');
                                                setData('tug_tempo_segundos', v);
                                            }}
                                            className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200"
                                        />
                                        {errors.tug_tempo_segundos && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.tug_tempo_segundos}</div>}
                                    </div>
                                </div>

                                {/* Escala de Berg */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Escala de Equilíbrio de Berg (BBS)</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {BERG_ITEMS.map((item) => (
                                            <BergField key={item.field} item={item} value={data[item.field]} onChange={setData} errors={errors} />
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 max-w-xs">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pontuação Total (Berg)</label>
                                        <input type="number" value={data.berg_total} readOnly className="w-full border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md shadow-sm font-bold text-lg" />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Máximo: 56 pontos</p>
                                    </div>
                                </div>

                                {/* Avaliação */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full mr-3"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Avaliação</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Avaliador</label>
                                            <input type="text" value={data.nome_avaliador} onChange={(e) => setData('nome_avaliador', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" />
                                            {errors.nome_avaliador && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.nome_avaliador}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CID</label>
                                            <input type="text" value={data.cid} onChange={(e) => setData('cid', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" />
                                            {errors.cid && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.cid}</div>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comentário</label>
                                            <textarea value={data.comentario} onChange={(e) => setData('comentario', e.target.value)} rows={3} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200" />
                                            {errors.comentario && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.comentario}</div>}
                                        </div>
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
                                            <AnexosUploader type="equilibrio" files={data.anexos} onFilesChange={(f) => setData('anexos', f)} />
                                            {errors.pedido_medico && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.pedido_medico}</div>}
                                            {isCompressing && (<div className="mt-2 text-sm text-blue-600 dark:text-blue-400">🔄 Comprimindo imagen...</div>)}
                                            {imageCompressionInfo && (<div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm"><div className="text-green-800 dark:text-green-300">✅ Imagen comprimida exitosamente</div><div className="text-green-700 dark:text-green-400 mt-1">Tamaño original: {imageCompressionInfo.originalSize} → Comprimido: {imageCompressionInfo.compressedSize} ({imageCompressionInfo.compressionRatio}% reducción)</div></div>)}
                                            {pedidoMedicoPreview && (<div className="mt-3"><p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pré-visualização:</p><div className="relative"><img src={pedidoMedicoPreview} alt="Pré-visualização do pedido médico" className="max-w-full h-auto max-h-64 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-gray-900/50" /><button type="button" onClick={() => {setPedidoMedicoPreview(null); setData('pedido_medico', null); setImageCompressionInfo(null); const fileInput = document.querySelector('input[type="file"][accept="image/*"]'); if (fileInput) fileInput.value = '';}} className="absolute top-2 right-2 bg-red-500 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors duration-200" title="Excluir imagem">×</button></div></div>)}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assinatura do Avaliador</label>
                                            <SignaturePad onSignatureChange={(signature) => setData('assinatura_paciente', signature)} className="w-full" />
                                            {errors.assinatura_paciente && <div className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.assinatura_paciente}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Botões */}
                                <div className="flex justify-end space-x-3">
                                    <button type="button" onClick={() => window.history.back()} className="px-6 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200">Cancelar</button>
                                    <button type="submit" disabled={processing} className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 dark:from-yellow-600 dark:to-orange-700 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 dark:hover:from-yellow-700 dark:hover:to-orange-800 transition-colors duration-200 disabled:opacity-50">{processing ? 'Salvando...' : 'Salvar Questionário'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
