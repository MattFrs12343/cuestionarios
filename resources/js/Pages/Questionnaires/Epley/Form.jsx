import { QUESTIONNAIRE_ACTIONS as QA, QUESTIONNAIRE_THEMES as QT } from '@/Components/Questionnaires/presentation';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import BirthDateSelectInput from '@/Components/BirthDateSelectInput';
import SignaturePad from '@/Components/SignaturePad';
import AnexosUploader from '@/Components/AnexosUploader';
import useDraftAutosave from '@/Hooks/useDraftAutosave';
import DraftRestoreBanner from '@/Components/DraftRestoreBanner';
import { upperAll } from '@/Utils/uppercase';
import { Instructions, interpretation } from './Content';

const inputClass = "w-full rounded-md border-gray-300 bg-white text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-zinc-500 dark:bg-zinc-600 dark:text-zinc-100";
const dateValue = value => value ? value.slice(0, 10) : '';
const localToday = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; };

function Field({ name, label, errors, children }) {
    return <div><label htmlFor={name} className="mb-2 block text-sm font-medium">{label}</label>{children}{errors[name] && <p id={`${name}-error`} role="alert" className="mt-1 text-sm text-red-700 dark:text-red-300">{errors[name]}</p>}</div>;
}
function Section({ id, title, children }) {
    return <section id={id} className="border-b border-gray-200 py-6 last:border-0 dark:border-zinc-600"><h3 className="mb-5 text-xl text-gray-900 dark:text-zinc-100 font-semibold">{title}</h3>{children}</section>;
}

export default function Form({ auth, questionnaire = null, pedidoMedicoUrl, sections = [] }) {
    const editing = !!questionnaire;
    const q = questionnaire || {};
    const { data, setData, post, processing, errors, transform } = useForm({
        nome_completo: q.nome_completo || '', rg_ou_cpf: q.rg_ou_cpf || '',
        data_nascimento: dateValue(q.data_nascimento), sexo: q.sexo || '',
        clinica: q.clinica || '', data_exame: dateValue(q.data_exame) || localToday(),
        vertigem: q.vertigem ?? '', vertigem_lados: q.vertigem_lados || [],
        nistagmo: q.nistagmo ?? '', nistagmo_lados: q.nistagmo_lados || [],
        desconforto: q.desconforto ?? '', observacoes: q.observacoes || '',
        mantem_posicao: q.mantem_posicao ?? '', tempo_mantido_segundos: q.tempo_mantido_segundos ?? '',
        melhora_vertigem: q.melhora_vertigem || '', nome_avaliador: q.nome_avaliador || '',
        cid: q.cid || '', comentario: q.comentario || '',
        assinatura_paciente: q.assinatura_paciente || null, pedido_medico: null, anexos: [],
    });
    const draft = useDraftAutosave({
        key: { type: 'epley', mode: editing ? 'edit' : 'create', id: q.id },
        data, version: q.updated_at || null, enabled: !processing,
    });
    const submit = e => {
        e.preventDefault();
        transform(values => ({ ...upperAll(values), ...(editing ? { _method: 'put' } : {}) }));
        post(route(`questionnaires.epley.${editing ? 'update' : 'store'}`, editing ? q.id : undefined), { forceFormData: true, onSuccess: () => draft.clear() });
    };
    const textInput = (name, label, type = 'text', required = false) => <Field name={name} label={label} errors={errors}>
        <input id={name} type={type} required={required} maxLength={type === 'text' ? 255 : undefined} value={data[name]} onChange={e => setData(name, type === 'text' ? e.target.value.toUpperCase() : e.target.value)} className={inputClass} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} />
    </Field>;
    const yesNo = (name, label) => <fieldset className="space-y-3"><legend className="font-medium">{label} *</legend><div className="flex flex-wrap gap-5">
        {[[true, 'Sim'], [false, 'Não']].map(([value, caption]) => <label key={caption} className="inline-flex min-h-11 items-center gap-2"><input type="radio" name={name} checked={data[name] === value} required onChange={() => {
            setData(previous => ({ ...previous, [name]: value,
                ...(name === 'vertigem' && !value ? { vertigem_lados: [] } : {}),
                ...(name === 'nistagmo' && !value ? { nistagmo_lados: [] } : {}),
                ...(name === 'desconforto' && !value ? { observacoes: '' } : {}),
            }));
        }} className="text-blue-700 focus:ring-blue-600" />{caption}</label>)}
    </div>{errors[name] && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{errors[name]}</p>}</fieldset>;
    const sides = name => <fieldset className="mt-3"><legend className="text-sm">Lado observado (marque ambos se bilateral)</legend><div className="flex flex-wrap gap-5">{['Direita', 'Esquerda'].map(side => <label key={side} className="inline-flex min-h-11 items-center gap-2"><input type="checkbox" checked={data[name].includes(side)} onChange={e => setData(name, e.target.checked ? [...data[name], side] : data[name].filter(v => v !== side))} className="rounded text-blue-700 focus:ring-blue-600" />{side}</label>)}</div>{Object.entries(errors).filter(([key]) => key === name || key.startsWith(`${name}.`)).map(([key, message]) => <p key={key} role="alert" className="text-sm text-red-700 dark:text-red-300">{message}</p>)}</fieldset>;
    return <AuthenticatedLayout user={auth.user} header={<h2 className="text-gray-800 dark:text-zinc-200 text-xl font-semibold">{editing ? 'Editar' : 'Novo questionário'} — Manobra de Epley</h2>}>
        <Head title={`${editing ? 'Editar' : 'Novo'} — Manobra de Epley`} />
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <Link href={route('questionnaires.epley.index')} className={QA.neutral + ' mb-5'}>Voltar aos questionários</Link>
            <nav aria-label="Seções do questionário" className="mb-5 flex flex-wrap gap-2">{sections.map(section => <a key={section.id} href={`#${section.id}`} className="inline-flex min-h-11 items-center rounded-md border border-gray-300 px-3 text-sm text-gray-800 hover:bg-gray-100 dark:text-zinc-100 dark:hover:bg-zinc-700">{section.label}</a>)}</nav>
            <DraftRestoreBanner draft={draft} onRestore={restored => setData(previous => ({ ...previous, ...restored, pedido_medico: null, anexos: [] }))} />
            <form onSubmit={submit} encType="multipart/form-data" className="rounded-xl bg-white px-5 pb-6 text-gray-900 shadow-sm sm:px-8 dark:bg-zinc-700 dark:text-zinc-100">
                <div className={QT.epley.header + " -mx-5 rounded-t-xl px-5 py-5 sm:-mx-8 sm:px-8"}><h1 className="text-2xl font-bold">Manobra de Epley</h1><p className="mt-2 text-sm">Avaliação vestibular e registro da resposta à manobra. Campos com * são obrigatórios.</p></div>
                {Object.keys(errors).length > 0 && <div role="alert" className="mt-5 rounded-md border border-red-300 p-4 text-red-800 dark:text-red-200">Revise os campos indicados antes de salvar.<ul className="mt-2 list-disc pl-5">{[...new Set(Object.values(errors))].map(message => <li key={message}>{message}</li>)}</ul></div>}
                <Section id="dados" title="Dados Básicos"><div className="grid gap-5 sm:grid-cols-2">
                    {textInput('nome_completo', 'Nome do paciente *', 'text', true)}{textInput('rg_ou_cpf', 'RG ou CPF *', 'text', true)}
                    <Field name="data_nascimento" label="Data de nascimento *" errors={errors}><BirthDateSelectInput value={data.data_nascimento} onChange={value => setData('data_nascimento', value)} required /></Field>
                    <Field name="sexo" label="Sexo *" errors={errors}><select id="sexo" value={data.sexo} required onChange={e => setData('sexo', e.target.value)} className={inputClass}><option value="">Selecione...</option><option>Masculino</option><option>Feminino</option></select></Field>
                    {textInput('data_exame', 'Data do exame *', 'date', true)}{textInput('clinica', 'Clínica')}
                </div></Section>
                <Section id="instrucoes" title="Instruções de Aplicação"><Instructions /></Section>
                <Section id="avaliacao" title="Avaliação Vestibular"><div className="space-y-7">
                    <div>{yesNo('vertigem', '1. O paciente apresenta vertigem ou sensação de que o ambiente está girando durante as mudanças de posição da cabeça?')}{data.vertigem === true && sides('vertigem_lados')}</div>
                    <div>{yesNo('nistagmo', '2. Durante a manobra, apresenta nistagmo (movimentos involuntários dos olhos)?')}{data.nistagmo === true && sides('nistagmo_lados')}</div>
                    <div>{yesNo('desconforto', '3. O paciente apresenta náuseas, tontura intensa ou desconforto durante a mudança de posição?')}{data.desconforto === true && <div className="mt-3"><Field name="observacoes" label="Qual desconforto?" errors={errors}><textarea id="observacoes" maxLength={5000} value={data.observacoes} onChange={e => setData('observacoes', e.target.value.toUpperCase())} className={inputClass} rows={3} /></Field></div>}</div>
                    <div>{yesNo('mantem_posicao', '4. O paciente consegue permanecer em cada posição da manobra durante aproximadamente 30 a 60 segundos, conforme a resposta vestibular?')}<div className="mt-3 max-w-xs"><Field name="tempo_mantido_segundos" label="Tempo mantido (segundos)" errors={errors}><input id="tempo_mantido_segundos" type="number" min="0" max="3600" step="1" value={data.tempo_mantido_segundos} onChange={e => setData('tempo_mantido_segundos', e.target.value)} className={inputClass} /></Field></div></div>
                    <Field name="melhora_vertigem" label="5. Após a realização da manobra, apresenta melhora da vertigem ao movimentar a cabeça? *" errors={errors}><select id="melhora_vertigem" required value={data.melhora_vertigem} onChange={e => setData('melhora_vertigem', e.target.value)} className={inputClass}><option value="">Selecione...</option>{['Sim', 'Não', 'Melhora parcial'].map(value => <option key={value}>{value}</option>)}</select></Field>
                    {data.melhora_vertigem && <p className="rounded-md bg-teal-50 p-4 text-sm text-teal-950 dark:bg-zinc-800 dark:text-teal-200">Referência do questionário: {interpretation(data.melhora_vertigem)}</p>}
                    <div className="grid gap-5 sm:grid-cols-2">{textInput('nome_avaliador', 'Nome do avaliador')}{textInput('cid', 'CID')}</div>
                    <Field name="comentario" label="Comentários e observações do avaliador" errors={errors}><textarea id="comentario" rows={4} value={data.comentario} onChange={e => setData('comentario', e.target.value.toUpperCase())} className={inputClass} /></Field>
                </div></Section>
                <Section id="arquivos" title="Arquivos e Assinatura"><div className="space-y-6">
                    <Field name="pedido_medico" label="Pedido médico (imagem, até 10 MB)" errors={errors}>
                        {q.pedido_medico && <p className="mb-2 text-sm">Pedido atual preservado se nenhum novo arquivo for escolhido. {pedidoMedicoUrl && <a href={pedidoMedicoUrl} target="_blank" rel="noreferrer" className="underline">Visualizar pedido</a>}</p>}
                        <input id="pedido_medico" type="file" accept="image/*" onChange={e => setData('pedido_medico', e.target.files[0] || null)} className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-3" />
                    </Field>
                    <AnexosUploader type="epley" id={q.id} files={data.anexos} onFilesChange={files => setData('anexos', files)} existing={q.attachments || []} />
                    <div><p className="mb-2 text-sm font-medium">Assinatura do avaliador</p><SignaturePad title="Assinatura do Avaliador" initialSignature={data.assinatura_paciente} onSignatureChange={signature => setData('assinatura_paciente', signature)} /></div>
                </div></Section>
                <div className="mt-6 flex flex-wrap justify-end items-center gap-3"><Link href={route('questionnaires.epley.index')} className={QA.neutral}>Cancelar</Link><button type="submit" disabled={processing} className={QA.primary}>{processing ? 'Salvando...' : editing ? 'Salvar alterações' : 'Salvar questionário'}</button></div>
            </form>
        </div>
    </AuthenticatedLayout>;
}
