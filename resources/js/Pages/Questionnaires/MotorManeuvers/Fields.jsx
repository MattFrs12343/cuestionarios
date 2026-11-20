export const flattenFields = fields => fields.flatMap(field => [field, ...flattenFields(field.children || [])]);
const inputClass = "w-full rounded-md border-gray-300 bg-white text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-zinc-500 dark:bg-zinc-600 dark:text-zinc-100";
const emptyValue = field => ['checks', 'hand-side'].includes(field.type) ? [] : '';

function Errors({ name, errors }) {
    return Object.entries(errors).filter(([key]) => key === name || key.startsWith(`${name}.`)).map(([key, message]) => <p key={key} role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">{message}</p>);
}
function Field({ field, data, setData, errors, parentKey }) {
    const value = data[field.key];
    const changeBoolean = next => setData(previous => ({
        ...previous, [field.key]: next,
        ...(!next ? Object.fromEntries(flattenFields(field.children || []).map(child => [child.key, emptyValue(child)])) : {}),
    }));
    if (['hand-side', 'side-radio'].includes(field.type)) {
        const [right, left] = field.sideLabels || ['Mão direita', 'Mão esquerda'];
        const options = field.options || [[right, ['Direita']], [left, ['Esquerda']], ['Bilateral', ['Direita', 'Esquerda']]].map(([label, hands]) => [hands, label]);
        return (
        <fieldset disabled={data[parentKey] === false}>
            <legend className="text-sm font-medium">{field.label}</legend>
            <div className="flex flex-wrap gap-x-5">
                {options.map(([hands, label]) => (
                    <label key={label} className="inline-flex min-h-11 items-center gap-2">
                        <input type="radio" name={field.key} checked={Array.isArray(hands) ? value?.length === hands.length && hands.every(hand => value.includes(hand)) : value === hands} onChange={() => setData(previous => ({ ...previous, [parentKey]: true, [field.key]: hands }))} className="text-blue-700 focus:ring-blue-600" />
                        {label}
                    </label>
                ))}
            </div>
            <Errors name={field.key} errors={errors} />
        </fieldset>
        );
    }
    if (field.type === 'interruption-times') return (
        <fieldset disabled={Boolean(field.dependsOn) && data[field.dependsOn] === false}>
            <legend className="mb-3 font-semibold">{field.label}</legend>
            <div className="grid gap-5 sm:grid-cols-2">
                {field.inputs.map(input => (
                    <div key={input.key}>
                        <label htmlFor={input.key} className="mb-2 block text-sm font-medium">{input.label}</label>
                        <div className="flex items-center gap-2">
                            <input id={input.key} type="number" min="0" max="3600" step="1" value={data[input.key] ?? ''} aria-describedby={input.key + '-unit'} onChange={event => {
                                const value = event.target.value;
                                if (field.dependsOn) {
                                    setData(previous => ({ ...previous, [field.dependsOn]: true, [input.key]: value }));
                                } else {
                                    setData(input.key, value);
                                }
                            }} className={inputClass} />
                            <span id={input.key + '-unit'} className="text-sm">segundos</span>
                        </div>
                        <Errors name={input.key} errors={errors} />
                    </div>
                ))}
            </div>
        </fieldset>
    );
    if (field.type === 'boolean') return <fieldset className="space-y-3">
        <legend className="font-medium">{field.label} *</legend>
        <div className="flex flex-wrap gap-5">{[[true, 'Sim'], [false, 'Não']].map(([option, label]) => <label key={label} className="inline-flex min-h-11 items-center gap-2"><input type="radio" name={field.key} required checked={value === option} onChange={() => changeBoolean(option)} className="text-blue-700 focus:ring-blue-600" />{label}</label>)}</div>
        <Errors name={field.key} errors={errors} />
        {field.children?.filter(child => !child.displaySeparately && (child.alwaysVisible || ['hand-side', 'side-radio'].includes(child.type) || value === true)).map(child => (
            <Field key={child.key} field={child} data={data} setData={setData} errors={errors} parentKey={field.key} />
        ))}
    </fieldset>;
    if (field.type === 'checks') {
        const selected = value || [];
        const checkbox = (key, label) => (
            <label key={key} className="flex min-h-11 items-center gap-2">
                <input type="checkbox" checked={selected.includes(key)} onChange={event => {
                    const next = event.target.checked
                        ? key === field.exclusive ? [key] : [...selected.filter(item => item !== field.exclusive), key]
                        : selected.filter(item => item !== key);
                    setData(field.key, next);
                }} className="rounded text-blue-700 focus:ring-blue-600" />
                <span className="text-sm">{label}</span>
            </label>
        );
        const groups = field.sideGroups || [];
        const remaining = field.options.filter(([key]) => !groups.some(([prefix]) => key.startsWith(prefix + '_')));
        return (
            <fieldset>
                <legend className="mb-2 font-semibold">{field.label}</legend>
                {groups.map(([prefix, label]) => (
                    <fieldset key={prefix}>
                        <legend className="text-sm font-medium">{label}</legend>
                        <div className="flex flex-wrap gap-x-6">
                            {checkbox(prefix + '_direita', 'D (direito)')}
                            {checkbox(prefix + '_esquerda', 'E (esquerdo)')}
                        </div>
                    </fieldset>
                ))}
                <div className={groups.length ? 'space-y-1' : 'grid gap-x-6 gap-y-1 sm:grid-cols-2'}>
                    {remaining.map(([key, label]) => checkbox(key, label))}
                </div>
                <Errors name={field.key} errors={errors} />
            </fieldset>
        );
    }
    return <div className={field.type === 'number' ? 'max-w-sm' : ''}>
        <label htmlFor={field.key} className="mb-2 block text-sm font-medium">{field.label}</label>
        {field.type === 'select' ? <select id={field.key} value={value ?? ''} onChange={e => setData(field.key, e.target.value)} className={inputClass} aria-invalid={!!errors[field.key]}><option value="">Selecione...</option>{field.options.map(([option, label]) => <option key={option} value={option}>{label}</option>)}</select>
            : field.type === 'text' ? <textarea id={field.key} disabled={field.alwaysVisible && data[parentKey] !== true} value={value ?? ''} maxLength={5000} onChange={e => setData(field.key, e.target.value.toUpperCase())} rows={3} className={inputClass} aria-invalid={!!errors[field.key]} />
                : <input id={field.key} type="number" min="0" max="3600" step="1" value={value ?? ''} onChange={e => setData(field.key, e.target.value)} className={inputClass} aria-invalid={!!errors[field.key]} />}
        <Errors name={field.key} errors={errors} />
    </div>;
}
export function ManeuverFields({ definition, data, setData, errors }) {
    return <div className="space-y-10">{definition.groups.some(group => group.optional) && <p className="text-sm">Selecione MMII, MMSS ou ambos. Responda apenas aos blocos avaliados.</p>}{definition.groups.map(group => {
        const avaliadoKey = group.optional ? `${group.key}_avaliado` : null;
        const avaliado = !avaliadoKey || data[avaliadoKey] !== false;
        return <div key={group.title}>
            {definition.groups.length > 1 && <h4 className="mb-6 border-b border-gray-200 pb-3 text-lg font-semibold dark:border-zinc-600">{group.title}</h4>}
            {avaliadoKey && <label className="mb-5 inline-flex min-h-11 items-center gap-2">
                <input type="checkbox" checked={avaliado} onChange={e => setData(previous => ({
                    ...previous,
                    [avaliadoKey]: e.target.checked,
                    ...(e.target.checked ? {} : Object.fromEntries(flattenFields(group.fields).map(field => [field.key, emptyValue(field)]))),
                }))} className="rounded text-blue-700 focus:ring-blue-600" />
                <span className="text-sm font-medium">Avaliar este bloco</span>
            </label>}
            {avaliado ? <div className="space-y-7">{group.fields.filter(field => !field.reportOnly).map(field => <Field key={field.key} field={field} data={data} setData={setData} errors={errors} />)}</div>
                : <p className="text-sm text-gray-500 dark:text-zinc-400">Bloco não avaliado nesta aplicação.</p>}
        </div>;
    })}</div>;
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
    if (field.type === 'interruption-times') return null;
    const value = q[field.key];
    let display = 'Não informado';
    if (field.type === 'boolean') display = value === true || value === 1 ? 'Sim' : value === false || value === 0 ? 'Não' : 'Não informado';
    if (field.type === 'number' && value != null && value !== '') display = `${value} segundos`;
    if (field.type === 'text' && value) display = value;
    if (['select', 'side-radio'].includes(field.type)) display = field.options.find(([key]) => key === value)?.[1] || 'Não informado';
    if (field.type === 'hand-side' && value?.length) display = value.length === 2 ? 'Bilateral' : (field.sideLabels || ['Mão direita', 'Mão esquerda'])[value[0] === 'Direita' ? 0 : 1];
    if (field.type === 'checks' && value?.length) display = field.options.filter(([key]) => value.includes(key)).map(([, label]) => label).join('; ');
    return <div className="break-inside-avoid"><dt className="font-semibold">{field.label}</dt><dd className="mt-1 whitespace-pre-wrap break-words">{display}</dd>{field.type === 'boolean' && value === true && field.children?.length > 0 && <dd className="mt-2"><dl className="space-y-2 pl-3">{field.children.map(child => <ResultField key={child.key} field={child} questionnaire={q} />)}</dl></dd>}</div>;
}
export function ManeuverResults({ definition, questionnaire, compact = false }) {
    return <div className={compact ? 'space-y-4 text-xs' : 'space-y-8'}>{definition.groups.map(group => {
        const avaliado = !group.optional || questionnaire[group.fields[0].key] != null;
        return <div key={group.title}>
            {definition.groups.length > 1 && <h4 className="mb-3 border-b border-gray-200 pb-2 font-bold">{group.title}</h4>}
            {avaliado ? <dl className={compact ? 'space-y-3' : 'space-y-5'}>{group.fields.map(field => <ResultField key={field.key} field={field} questionnaire={questionnaire} />)}</dl>
                : <p className="text-sm text-gray-500">Bloco não avaliado nesta aplicação.</p>}
        </div>;
    })}</div>;
}
