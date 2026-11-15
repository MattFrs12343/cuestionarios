export const flattenFields = fields => fields.flatMap(field => [field, ...flattenFields(field.children || [])]);
const inputClass = "w-full rounded-md border-gray-300 bg-white text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-zinc-500 dark:bg-zinc-600 dark:text-zinc-100";
const emptyValue = field => field.type === 'checks' ? [] : '';

function Errors({ name, errors }) {
    return Object.entries(errors).filter(([key]) => key === name || key.startsWith(`${name}.`)).map(([key, message]) => <p key={key} role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">{message}</p>);
}
function Field({ field, data, setData, errors }) {
    const value = data[field.key];
    const changeBoolean = next => setData(previous => ({
        ...previous, [field.key]: next,
        ...(!next ? Object.fromEntries(flattenFields(field.children || []).map(child => [child.key, emptyValue(child)])) : {}),
    }));
    if (field.type === 'boolean') return <fieldset className="space-y-3">
        <legend className="font-medium">{field.label} *</legend>
        <div className="flex flex-wrap gap-5">{[[true, 'Sim'], [false, 'Não']].map(([option, label]) => <label key={label} className="inline-flex min-h-11 items-center gap-2"><input type="radio" name={field.key} required checked={value === option} onChange={() => changeBoolean(option)} className="text-blue-700 focus:ring-blue-600" />{label}</label>)}</div>
        <Errors name={field.key} errors={errors} />
        {value === true && field.children?.length > 0 && <div className="space-y-4 border-l border-gray-200 pl-4 dark:border-zinc-500">{field.children.map(child => <Field key={child.key} field={child} data={data} setData={setData} errors={errors} />)}</div>}
    </fieldset>;
    if (field.type === 'checks') return <fieldset><legend className="mb-2 text-sm font-medium">{field.label}</legend><div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">{field.options.map(([key, label]) => <label key={key} className="flex min-h-11 items-start gap-3 py-2"><input type="checkbox" checked={(value || []).includes(key)} onChange={e => setData(field.key, e.target.checked ? key === field.exclusive ? [key] : [...(value || []).filter(item => item !== field.exclusive), key] : (value || []).filter(item => item !== key))} className="mt-1 rounded text-blue-700 focus:ring-blue-600" /><span className="text-sm leading-6">{label}</span></label>)}</div><Errors name={field.key} errors={errors} /></fieldset>;
    return <div className={field.type === 'number' ? 'max-w-sm' : ''}>
        <label htmlFor={field.key} className="mb-2 block text-sm font-medium">{field.label}</label>
        {field.type === 'select' ? <select id={field.key} value={value ?? ''} onChange={e => setData(field.key, e.target.value)} className={inputClass} aria-invalid={!!errors[field.key]}><option value="">Selecione...</option>{field.options.map(([option, label]) => <option key={option} value={option}>{label}</option>)}</select>
            : field.type === 'text' ? <textarea id={field.key} value={value ?? ''} maxLength={5000} onChange={e => setData(field.key, e.target.value.toUpperCase())} rows={3} className={inputClass} aria-invalid={!!errors[field.key]} />
                : <input id={field.key} type="number" min="0" max="3600" step="1" value={value ?? ''} onChange={e => setData(field.key, e.target.value)} className={inputClass} aria-invalid={!!errors[field.key]} />}
        <Errors name={field.key} errors={errors} />
    </div>;
}
export function ManeuverFields({ definition, data, setData, errors }) {
    return <div className="space-y-10">{definition.groups.map(group => <div key={group.title}>
        {definition.groups.length > 1 && <h4 className="mb-6 border-b border-gray-200 pb-3 text-lg font-semibold dark:border-zinc-600">{group.title}</h4>}
        <div className="space-y-7">{group.fields.map(field => <Field key={field.key} field={field} data={data} setData={setData} errors={errors} />)}</div>
    </div>)}</div>;
}
export function ManeuverInstructions({ definition }) {
    const StepHeading = definition.groups.length > 1 ? 'h5' : 'h4';
    return <div className="space-y-8 text-sm leading-7 text-gray-600 dark:text-zinc-300">{definition.groups.map(group => <div key={group.title}>
        {definition.groups.length > 1 && <h4 className="mb-4 text-lg text-gray-900 dark:text-zinc-100 font-semibold">{group.title}</h4>}
        <p className="max-w-prose">{group.objective}</p>
        <div className="mb-2 mt-6 flex flex-wrap items-baseline justify-between gap-4"><StepHeading className="text-base font-semibold text-gray-900 dark:text-zinc-100">Sequência de aplicação</StepHeading>{definition.groups.length === 1 && <span className="text-xs text-gray-500 dark:text-zinc-400">{group.title}</span>}</div>
        <ol className="divide-y divide-gray-100 dark:divide-zinc-600">{group.steps.map(([title, description], index) => <li key={title} className="flex gap-4 py-4 sm:gap-5"><span aria-hidden="true" className="w-5 shrink-0 pt-0.5 font-medium tabular-nums text-teal-700 dark:text-teal-300">{index + 1}.</span><div className="min-w-0"><p className="font-semibold text-gray-900 dark:text-zinc-100">{title}</p><p className="mt-1 max-w-prose">{description}</p></div></li>)}</ol>
        {group.note && <p className="mt-4 rounded-md bg-amber-50 p-4 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100"><strong>Tempo de referência:</strong> {group.note}</p>}
    </div>)}</div>;
}
function ResultField({ field, questionnaire: q }) {
    const value = q[field.key];
    let display = 'Não informado';
    if (field.type === 'boolean') display = value === true || value === 1 ? 'Sim' : value === false || value === 0 ? 'Não' : 'Não informado';
    if (field.type === 'number' && value != null && value !== '') display = `${value} segundos`;
    if (field.type === 'text' && value) display = value;
    if (field.type === 'select') display = field.options.find(([key]) => key === value)?.[1] || 'Não informado';
    if (field.type === 'checks' && value?.length) display = field.options.filter(([key]) => value.includes(key)).map(([, label]) => label).join('; ');
    return <div className="break-inside-avoid"><dt className="font-semibold">{field.label}</dt><dd className="mt-1 whitespace-pre-wrap break-words">{display}</dd>{field.type === 'boolean' && value === true && field.children?.length > 0 && <dd className="mt-2"><dl className="space-y-2 pl-3">{field.children.map(child => <ResultField key={child.key} field={child} questionnaire={q} />)}</dl></dd>}</div>;
}
export function ManeuverResults({ definition, questionnaire, compact = false }) {
    return <div className={compact ? 'space-y-4 text-xs' : 'space-y-8'}>{definition.groups.map(group => <div key={group.title}>
        {definition.groups.length > 1 && <h4 className="mb-3 border-b border-gray-200 pb-2 font-bold">{group.title}</h4>}
        <dl className={compact ? 'space-y-3' : 'space-y-5'}>{group.fields.map(field => <ResultField key={field.key} field={field} questionnaire={questionnaire} />)}</dl>
    </div>)}</div>;
}
