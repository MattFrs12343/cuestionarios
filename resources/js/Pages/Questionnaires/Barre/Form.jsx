import { QUESTIONNAIRE_ACTIONS as QA, QUESTIONNAIRE_THEMES as QT } from '@/Components/Questionnaires/presentation';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import BirthDateSelectInput from '@/Components/BirthDateSelectInput';
import SignaturePad from '@/Components/SignaturePad';
import AnexosUploader from '@/Components/AnexosUploader';
import useDraftAutosave from '@/Hooks/useDraftAutosave';
import DraftRestoreBanner from '@/Components/DraftRestoreBanner';
import { upperAll } from '@/Utils/uppercase';
import { Instructions, ALTERACOES } from './Content';

const inputClass = "w-full rounded-md border-gray-300 bg-white text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-zinc-500 dark:bg-zinc-600 dark:text-zinc-100";
const dateValue = value => value ? value.slice(0, 10) : '';
const localToday = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; };

function Field({ name, label, errors, children }) {
    return <div><label htmlFor={name} className="mb-2 block text-sm font-medium">{label}</label>{children}{errors[name] && <p id={`${name}-error`} role="alert" className="mt-1 text-sm text-red-700 dark:text-red-300">{errors[name]}</p>}</div>;
}
function Section({ id, title, children }) {
    return <section id={id} className="scroll-mt-24 border-b border-gray-200 py-6 last:border-0 dark:border-zinc-600"><h3 className="mb-5 text-xl text-gray-900 dark:text-zinc-100 font-semibold">{title}</h3>{children}</section>;
}

export default function Form({ auth, questionnaire = null, pedidoMedicoUrl, assinaturaPacienteUrl, sections = [] }) {
    const editing = !!questionnaire;
    const q = questionnaire || {};
    const { data, setData, post, processing, errors, transform } = useForm({
        nome_completo: q.nome_completo || '', rg_ou_cpf: q.rg_ou_cpf || '',
        data_nascimento: dateValue(q.data_nascimento), sexo: q.sexo || '',
        clinica: q.clinica || '', data_exame: dateValue(q.data_exame) || localToday(),
        sustenta_60_segundos: q.sustenta_60_segundos ?? '',
        queda_progressiva: q.queda_progressiva ?? '', queda_lados: q.queda_lados || [],
        tremor_oscilacao: q.tremor_oscilacao ?? '', tremor_lados: q.tremor_lados || [],
        assimetria: q.assimetria ?? '', assimetria_lado: q.assimetria_lado || '',
        interrupcao: q.interrupcao ?? '', interrupcao_lados: q.interrupcao_lados || [],
        tempo_direito_segundos: q.tempo_direito_segundos ?? '', tempo_esquerdo_segundos: q.tempo_esquerdo_segundos ?? '',
        alteracoes: q.alteracoes || [], nome_avaliador: q.nome_avaliador || '',
        cid: q.cid || '', comentario: q.comentario || '',
        assinatura_paciente: null, assinatura_paciente_remove: false, pedido_medico: null, anexos: [],
    });
    const draft = useDraftAutosave({
        key: { type: 'barre', mode: editing ? 'edit' : 'create', id: q.id },
        data, version: q.updated_at || null, enabled: !processing,
    });
    const submit = e => {
        e.preventDefault();
        transform(values => ({ ...upperAll(values), ...(editing ? { _method: 'put' } : {}) }));
        post(route(`questionnaires.barre.${editing ? 'update' : 'store'}`, editing ? q.id : undefined), { forceFormData: true, onSuccess: () => draft.clear() });
    };
    const textInput = (name, label, type = 'text', required = false) => <Field name={name} label={label} errors={errors}>
        <input id={name} type={type} required={required} maxLength={type === 'text' ? 255 : undefined} value={data[name]} onChange={e => setData(name, type === 'text' ? e.target.value.toUpperCase() : e.target.value)} className={inputClass} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} />
    </Field>;
    const yesNo = (name, label) => <fieldset className="space-y-3"><legend className="font-medium">{label} *</legend><div className="flex flex-wrap gap-5">
        {[[true, 'Sim'], [false, 'Não']].map(([value, caption]) => <label key={caption} className="inline-flex min-h-11 items-center gap-2"><input type="radio" name={name} checked={data[name] === value} required onChange={() => {
            setData(previous => ({ ...previous, [name]: value,
                ...(name === 'queda_progressiva' && !value ? { queda_lados: [] } : {}),
                ...(name === 'tremor_oscilacao' && !value ? { tremor_lados: [] } : {}),
                ...(name === 'assimetria' && !value ? { assimetria_lado: '' } : {}),
                ...(name === 'interrupcao' && !value ? { interrupcao_lados: [], tempo_direito_segundos: '', tempo_esquerdo_segundos: '' } : {}),
                ...(name !== 'sustenta_60_segundos' && value || name === 'sustenta_60_segundos' && !value ? { alteracoes: previous.alteracoes.filter(option => option !== 'sem_alteracoes') } : {}),
            }));
        }} className="text-blue-700 focus:ring-blue-600" />{caption}</label>)}
    </div>{errors[name] && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{errors[name]}</p>}</fieldset>;
    const sides = name => <fieldset className="mt-3"><legend className="text-sm">Lado observado (marque ambos se bilateral)</legend><div className="flex flex-wrap gap-5">{['Direita', 'Esquerda'].map(side => <label key={side} className="inline-flex min-h-11 items-center gap-2"><input type="checkbox" checked={data[name].includes(side)} onChange={e => setData(name, e.target.checked ? [...data[name], side] : data[name].filter(v => v !== side))} className="rounded text-blue-700 focus:ring-blue-600" />{side}</label>)}</div>{Object.entries(errors).filter(([key]) => key === name || key.startsWith(`${name}.`)).map(([key, message]) => <p key={key} role="alert" className="text-sm text-red-700 dark:text-red-300">{message}</p>)}</fieldset>;
    const toggleAlteration = (key, checked) => {
        setData(previous => ({
            ...previous,
            alteracoes: checked
                ? key === 'sem_alteracoes' ? [key] : [...previous.alteracoes.filter(option => option !== 'sem_alteracoes'), key]
                : previous.alteracoes.filter(option => option !== key),
        }));
    };
    return <AuthenticatedLayout user={auth.user} header={<h2 className="text-gray-800 dark:text-zinc-200 text-xl font-semibold">{editing ? 'Editar' : 'Novo questionário'} — Teste de Barré</h2>}>
        <Head title={`${editing ? 'Editar' : 'Novo'} — Teste de Barré`} />
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <Link href={route('questionnaires.barre.index')} className={QA.neutral + ' mb-5'}>Voltar aos questionários</Link>
            <nav aria-label="Seções do questionário" className="mb-5 flex flex-wrap gap-2">{sections.map(section => <a key={section.id} href={`#${section.id}`} className="inline-flex min-h-11 items-center rounded-md border border-gray-300 px-3 text-sm text-gray-800 hover:bg-gray-100 dark:text-zinc-100 dark:hover:bg-zinc-700">{section.label}</a>)}</nav>
            <DraftRestoreBanner draft={draft} onRestore={restored => setData(previous => ({ ...previous, ...restored, pedido_medico: null, anexos: [] }))} />
            <form onSubmit={submit} encType="multipart/form-data" className="rounded-xl bg-white px-5 pb-6 text-gray-900 shadow-sm sm:px-8 dark:bg-zinc-700 dark:text-zinc-100">
                <div className={QT.barre.header + " -mx-5 rounded-t-xl px-5 py-5 sm:-mx-8 sm:px-8"}><h1 className="text-2xl font-bold">Teste de Barré</h1><p className="mt-2 text-sm">Avaliação neurológica dos membros inferiores e registro da resposta à manobra. Campos com * são obrigatórios.</p></div>
                {Object.keys(errors).length > 0 && <div role="alert" className="mt-5 rounded-md border border-red-300 p-4 text-red-800 dark:text-red-200">Revise os campos indicados antes de salvar.<ul className="mt-2 list-disc pl-5">{[...new Set(Object.values(errors))].map(message => <li key={message}>{message}</li>)}</ul></div>}
                <Section id="dados" title="Dados Básicos"><div className="grid gap-5 sm:grid-cols-2">
                    {textInput('nome_completo', 'Nome do paciente *', 'text', true)}{textInput('rg_ou_cpf', 'RG ou CPF *', 'text', true)}
                    <Field name="data_nascimento" label="Data de nascimento *" errors={errors}><BirthDateSelectInput value={data.data_nascimento} onChange={value => setData('data_nascimento', value)} required /></Field>
                    <Field name="sexo" label="Sexo *" errors={errors}><select id="sexo" value={data.sexo} required onChange={e => setData('sexo', e.target.value)} className={inputClass}><option value="">Selecione...</option><option>Masculino</option><option>Feminino</option></select></Field>
                    {textInput('data_exame', 'Data do exame *', 'date', true)}{textInput('clinica', 'Clínica')}
                </div></Section>
                <Section id="instrucoes" title="Instruções de Aplicação"><Instructions /></Section>
                <Section id="avaliacao" title="Avaliação dos Membros Inferiores"><div className="space-y-7">
                    <div>{yesNo('sustenta_60_segundos', '1. O paciente consegue permanecer em decúbito ventral, mantendo ambos os joelhos flexionados aproximadamente a 90°, com as pernas elevadas durante 60 segundos?')}</div>
                    <div>{yesNo('queda_progressiva', '2. Durante a execução da manobra, observa-se queda progressiva de uma ou ambas as pernas?')}{data.queda_progressiva === true && sides('queda_lados')}</div>
                    <div>{yesNo('tremor_oscilacao', '3. O paciente apresenta tremor, oscilação ou dificuldade para manter as pernas elevadas?')}{data.tremor_oscilacao === true && sides('tremor_lados')}</div>
                    <div>{yesNo('assimetria', '4. Observa-se assimetria da força muscular ou da capacidade de sustentação entre os membros inferiores?')}{data.assimetria === true && <div className="mt-3"><Field name="assimetria_lado" label="Maior comprometimento" errors={errors}><select id="assimetria_lado" value={data.assimetria_lado} onChange={e => setData('assimetria_lado', e.target.value)} className={inputClass}><option value="">Selecione...</option><option value="Direita">À direita</option><option value="Esquerda">À esquerda</option></select></Field></div>}</div>
                    <div className="space-y-5">
                        {yesNo('interrupcao', '5. Durante a manobra, o paciente apresentou queda de uma ou ambas as pernas, perda da posição ou incapacidade de completar o tempo solicitado?')}
                        <fieldset disabled={data.interrupcao === false}>
                            <legend className="font-semibold">Membro inferior afetado</legend>
                            <div className="flex flex-wrap gap-x-5">
                                {[
                                    ['Membro inferior direito', ['Direita']],
                                    ['Membro inferior esquerdo', ['Esquerda']],
                                    ['Bilateral', ['Direita', 'Esquerda']],
                                ].map(([label, limbs]) => (
                                    <label key={label} className="inline-flex min-h-11 items-center gap-2">
                                        <input type="radio" name="interrupcao_lados" checked={data.interrupcao_lados.length === limbs.length && limbs.every(limb => data.interrupcao_lados.includes(limb))} onChange={() => setData(previous => ({ ...previous, interrupcao: true, interrupcao_lados: limbs, alteracoes: previous.alteracoes.filter(option => option !== 'sem_alteracoes') }))} />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                        <fieldset disabled={data.interrupcao === false}>
                            <legend className="mb-3 font-semibold">Tempo até a queda ou interrupção</legend>
                            <div className="grid gap-5 sm:grid-cols-2">
                                {[
                                    ['tempo_direito_segundos', 'Membro inferior direito'],
                                    ['tempo_esquerdo_segundos', 'Membro inferior esquerdo'],
                                ].map(([name, label]) => (
                                    <Field key={name} name={name} label={label} errors={errors}>
                                        <div className="flex items-center gap-2">
                                            <input id={name} type="number" min="0" max="3600" step="1" value={data[name]} aria-describedby={name + '-unit'} onChange={e => {
                                                const value = e.target.value;
                                                setData(previous => ({ ...previous, [name]: value, interrupcao: true, alteracoes: previous.alteracoes.filter(option => option !== 'sem_alteracoes') }));
                                            }} className={inputClass} />
                                            <span id={name + '-unit'} className="text-sm">segundos</span>
                                        </div>
                                    </Field>
                                ))}
                            </div>
                        </fieldset>
                    </div>
                    <fieldset>
                        <legend className="mb-3 font-semibold">Tipo de alteração observada</legend>
                        <div className="space-y-2">
                            {[
                                ['Queda progressiva da perna (D-E)', 'queda_progressiva'],
                                ['Queda súbita da perna (D-E)', 'queda_subita'],
                                ['Perda gradual da flexão do joelho (D-E)', 'perda_flexao'],
                            ].map(([label, prefix]) => (
                                <fieldset key={prefix}>
                                    <legend className="text-sm font-medium">{label}</legend>
                                    <div className="flex flex-wrap gap-x-6">
                                        {[
                                            ['direita', 'D (direito)'],
                                            ['esquerda', 'E (esquerdo)'],
                                        ].map(([side, caption]) => (
                                            <label key={side} className="inline-flex min-h-11 items-center gap-2">
                                                <input type="checkbox" checked={data.alteracoes.includes(prefix + '_' + side)} onChange={e => toggleAlteration(prefix + '_' + side, e.target.checked)} className="rounded text-blue-700 focus:ring-blue-600" />
                                                {caption}
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                            ))}
                            {ALTERACOES.slice(6).map(([key, label]) => (
                                <label key={key} className="flex min-h-11 items-center gap-3">
                                    <input type="checkbox" checked={data.alteracoes.includes(key)} disabled={key === 'sem_alteracoes' && (data.queda_progressiva === true || data.tremor_oscilacao === true || data.assimetria === true || data.interrupcao === true || data.sustenta_60_segundos === false)} onChange={e => toggleAlteration(key, e.target.checked)} className="rounded text-blue-700 focus:ring-blue-600 disabled:opacity-50" />
                                    <span className="text-sm">{label}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                    <div className="grid gap-5 sm:grid-cols-2">{textInput('nome_avaliador', 'Nome do avaliador')}{textInput('cid', 'CID')}</div>
                    <Field name="comentario" label="Comentários e observações do avaliador" errors={errors}><textarea id="comentario" rows={4} value={data.comentario} onChange={e => setData('comentario', e.target.value.toUpperCase())} className={inputClass} /></Field>
                </div></Section>
                <Section id="arquivos" title="Arquivos e Assinatura"><div className="space-y-6">
                    <Field name="pedido_medico" label="Pedido médico (imagem, até 10 MB)" errors={errors}>
                        {q.pedido_medico && <p className="mb-2 text-sm">Pedido atual preservado se nenhum novo arquivo for escolhido. {pedidoMedicoUrl && <a href={pedidoMedicoUrl} target="_blank" rel="noreferrer" className="underline">Visualizar pedido</a>}</p>}
                        <input id="pedido_medico" type="file" accept="image/*" onChange={e => setData('pedido_medico', e.target.files[0] || null)} className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-3" />
                    </Field>
                    <AnexosUploader type="barre" id={q.id} files={data.anexos} onFilesChange={files => setData('anexos', files)} existing={q.attachments || []} />
                    <div><p className="mb-2 text-sm font-medium">Assinatura do avaliador</p><SignaturePad title="Assinatura do Avaliador" initialSignature={assinaturaPacienteUrl} onSignatureChange={file => setData(previous => ({ ...previous, assinatura_paciente: file, assinatura_paciente_remove: !file }))} /></div>
                </div></Section>
                <div className="mt-6 flex flex-wrap justify-end items-center gap-3"><Link href={route('questionnaires.barre.index')} className={QA.neutral}>Cancelar</Link><button type="submit" disabled={processing} className={QA.primary}>{processing ? 'Salvando...' : editing ? 'Salvar alterações' : 'Salvar questionário'}</button></div>
            </form>
        </div>
    </AuthenticatedLayout>;
}
