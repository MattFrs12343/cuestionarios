import { QUESTIONNAIRE_ACTIONS as QA, QUESTIONNAIRE_THEMES as QT } from '@/Components/Questionnaires/presentation';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import BirthDateSelectInput from '@/Components/BirthDateSelectInput';
import SignaturePad from '@/Components/SignaturePad';
import AnexosUploader from '@/Components/AnexosUploader';
import useDraftAutosave from '@/Hooks/useDraftAutosave';
import DraftRestoreBanner from '@/Components/DraftRestoreBanner';
import { upperAll } from '@/Utils/uppercase';
import { ManeuverInstructions, ManeuverFields, flattenFields } from './Fields';

const inputClass = "w-full rounded-md border-gray-300 bg-white text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-zinc-500 dark:bg-zinc-600 dark:text-zinc-100";
const dateValue = value => value ? value.slice(0, 10) : '';
const localToday = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; };

function Field({ name, label, errors, children }) {
    return <div><label htmlFor={name} className="mb-2 block text-sm font-medium">{label}</label>{children}{errors[name] && <p id={`${name}-error`} role="alert" className="mt-1 text-sm text-red-700 dark:text-red-300">{errors[name]}</p>}</div>;
}
function Section({ id, title, children }) {
    return <section id={id} className="scroll-mt-24 border-b border-gray-200 py-6 last:border-0 dark:border-zinc-600"><h3 className="mb-5 text-xl text-gray-900 dark:text-zinc-100 font-semibold">{title}</h3>{children}</section>;
}

export default function Form({ auth, questionnaire = null, pedidoMedicoUrl, sections = [], definition }) {
    const editing = !!questionnaire;
    const fields = definition.groups.flatMap(group => flattenFields(group.fields));
    const q = questionnaire || {};
    const { data, setData, post, processing, errors, transform } = useForm({
        nome_completo: q.nome_completo || '', rg_ou_cpf: q.rg_ou_cpf || '',
        data_nascimento: dateValue(q.data_nascimento), sexo: q.sexo || '',
        clinica: q.clinica || '', data_exame: dateValue(q.data_exame) || localToday(),
        ...Object.fromEntries(fields.map(field => [field.key, q[field.key] ?? (field.type === 'checks' ? [] : '')])),
        nome_avaliador: q.nome_avaliador || '',
        cid: q.cid || '', comentario: q.comentario || '',
        assinatura_paciente: q.assinatura_paciente || null, pedido_medico: null, anexos: [],
    });
    const draft = useDraftAutosave({
        key: { type: definition.key, mode: editing ? 'edit' : 'create', id: q.id },
        data, version: q.updated_at || null, enabled: !processing,
    });
    const submit = e => {
        e.preventDefault();
        transform(values => ({ ...upperAll(values), ...(editing ? { _method: 'put' } : {}) }));
        post(route(`questionnaires.${definition.slug}.${editing ? 'update' : 'store'}`, editing ? q.id : undefined), { forceFormData: true, onSuccess: () => draft.clear() });
    };
    const textInput = (name, label, type = 'text', required = false) => <Field name={name} label={label} errors={errors}>
        <input id={name} type={type} required={required} maxLength={type === 'text' ? 255 : undefined} value={data[name]} onChange={e => setData(name, type === 'text' ? e.target.value.toUpperCase() : e.target.value)} className={inputClass} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} />
    </Field>;
    return <AuthenticatedLayout user={auth.user} header={<h2 className="text-gray-800 dark:text-zinc-200 text-xl font-semibold">{editing ? 'Editar' : 'Novo questionário'} — {definition.title}</h2>}>
        <Head title={`${editing ? 'Editar' : 'Novo'} — ${definition.title}`} />
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <Link href={route(`questionnaires.${definition.slug}.index`)} className={QA.neutral + ' mb-5'}>Voltar aos questionários</Link>
            <nav aria-label="Seções do questionário" className="mb-5 flex flex-wrap gap-2">{sections.map(section => <a key={section.id} href={`#${section.id}`} className="inline-flex min-h-11 items-center rounded-md border border-gray-300 px-3 text-sm text-gray-800 hover:bg-gray-100 dark:text-zinc-100 dark:hover:bg-zinc-700">{section.label}</a>)}</nav>
            <DraftRestoreBanner draft={draft} onRestore={restored => setData(previous => ({ ...previous, ...restored, pedido_medico: null, anexos: [] }))} />
            <form onSubmit={submit} encType="multipart/form-data" className="rounded-xl bg-white px-5 pb-6 text-gray-900 shadow-sm sm:px-8 dark:bg-zinc-700 dark:text-zinc-100">
                <div className={QT[definition.key].header + " -mx-5 rounded-t-xl px-5 py-5 sm:-mx-8 sm:px-8"}><h1 className="text-2xl font-bold">{definition.title}</h1><p className="mt-2 text-sm">{definition.description}. Campos com * são obrigatórios.</p></div>
                {Object.keys(errors).length > 0 && <div role="alert" className="mt-5 rounded-md border border-red-300 p-4 text-red-800 dark:text-red-200">Revise os campos indicados antes de salvar.<ul className="mt-2 list-disc pl-5">{[...new Set(Object.values(errors))].map(message => <li key={message}>{message}</li>)}</ul></div>}
                <Section id="dados" title="Dados Básicos"><div className="grid gap-5 sm:grid-cols-2">
                    {textInput('nome_completo', 'Nome do paciente *', 'text', true)}{textInput('rg_ou_cpf', 'RG ou CPF *', 'text', true)}
                    <Field name="data_nascimento" label="Data de nascimento *" errors={errors}><BirthDateSelectInput value={data.data_nascimento} onChange={value => setData('data_nascimento', value)} required /></Field>
                    <Field name="sexo" label="Sexo *" errors={errors}><select id="sexo" value={data.sexo} required onChange={e => setData('sexo', e.target.value)} className={inputClass}><option value="">Selecione...</option><option>Masculino</option><option>Feminino</option></select></Field>
                    {textInput('data_exame', 'Data do exame *', 'date', true)}{textInput('clinica', 'Clínica')}
                </div></Section>
                <Section id="instrucoes" title="Instruções de Aplicação"><ManeuverInstructions definition={definition} /></Section>
                <Section id="avaliacao" title={definition.assessment}><div className="space-y-7">
                    <ManeuverFields definition={definition} data={data} setData={setData} errors={errors} />
                    <div className="grid gap-5 sm:grid-cols-2">{textInput('nome_avaliador', 'Nome do avaliador')}{textInput('cid', 'CID')}</div>
                    <Field name="comentario" label="Comentários e observações do avaliador" errors={errors}><textarea id="comentario" rows={4} value={data.comentario} onChange={e => setData('comentario', e.target.value.toUpperCase())} className={inputClass} /></Field>
                </div></Section>
                <Section id="arquivos" title="Arquivos e Assinatura"><div className="space-y-6">
                    <Field name="pedido_medico" label="Pedido médico (imagem, até 10 MB)" errors={errors}>
                        {q.pedido_medico && <p className="mb-2 text-sm">Pedido atual preservado se nenhum novo arquivo for escolhido. {pedidoMedicoUrl && <a href={pedidoMedicoUrl} target="_blank" rel="noreferrer" className="underline">Visualizar pedido</a>}</p>}
                        <input id="pedido_medico" type="file" accept="image/*" onChange={e => setData('pedido_medico', e.target.files[0] || null)} className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-3" />
                    </Field>
                    <AnexosUploader type={definition.slug} id={q.id} files={data.anexos} onFilesChange={files => setData('anexos', files)} existing={q.attachments || []} />
                    <div><p className="mb-2 text-sm font-medium">Assinatura do avaliador</p><SignaturePad title="Assinatura do Avaliador" initialSignature={data.assinatura_paciente} onSignatureChange={signature => setData('assinatura_paciente', signature)} /></div>
                </div></Section>
                <div className="mt-6 flex flex-wrap justify-end items-center gap-3"><Link href={route(`questionnaires.${definition.slug}.index`)} className={QA.neutral}>Cancelar</Link><button type="submit" disabled={processing} className={QA.primary}>{processing ? 'Salvando...' : editing ? 'Salvar alterações' : 'Salvar questionário'}</button></div>
            </form>
        </div>
    </AuthenticatedLayout>;
}
