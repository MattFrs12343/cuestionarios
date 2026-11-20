const fs=require('fs');
const dir='resources/js/Pages/Questionnaires/MotorManeuvers/';
const p=dir+'definitions.js';
let s=fs.readFileSync(p,'utf8');
const cut=s.indexOf('  "mingazzini":');
let head=s.slice(0,cut).replace(/          \{\s+"key": "mao_avaliada",[\s\S]*?\n          \},\r?\n/,'');
head=head.replace(/"type": "checks",\s+"label": "Lado observado \(marque ambos se bilateral\)",\s+"options": \[[\s\S]*?\n                \]/g,'"type": "hand-side",\n                "label": "Mão observada"');
fs.writeFileSync(p,head+s.slice(cut));
const f=dir+'Fields.jsx';s=fs.readFileSync(f,'utf8');
s=s.replace("field.type === 'checks' ? [] : ''","['checks', 'hand-side'].includes(field.type) ? [] : ''");
s=s.replace('function Field({ field, data, setData, errors }) {','function Field({ field, data, setData, errors, parentKey }) {');
s=s.replace("    if (field.type === 'interruption-times')",`    if (field.type === 'hand-side') return (
        <fieldset disabled={data[parentKey] === false}>
            <legend className="text-sm font-medium">{field.label}</legend>
            <div className="flex flex-wrap gap-x-5">
                {[
                    ['Mão direita', ['Direita']],
                    ['Mão esquerda', ['Esquerda']],
                    ['Bilateral', ['Direita', 'Esquerda']],
                ].map(([label, hands]) => (
                    <label key={label} className="inline-flex min-h-11 items-center gap-2">
                        <input type="radio" name={field.key} checked={value?.length === hands.length && hands.every(hand => value.includes(hand))} onChange={() => setData(previous => ({ ...previous, [parentKey]: true, [field.key]: hands }))} className="text-blue-700 focus:ring-blue-600" />
                        {label}
                    </label>
                ))}
            </div>
            <Errors name={field.key} errors={errors} />
        </fieldset>
    );
    if (field.type === 'interruption-times')`);
const line=s.split('\n').find(x=>x.includes("field.children.filter(child => !child.displaySeparately)"));
if(!line)throw Error('children');
s=s.replace(line,`        {field.children?.filter(child => !child.displaySeparately && (child.type === 'hand-side' || value === true)).map(child => (
            <Field key={child.key} field={child} data={data} setData={setData} errors={errors} parentKey={field.key} />
        ))}`);
s=s.replace("    if (field.type === 'checks' && value?.length)", "    if (field.type === 'hand-side' && value?.length) display = value.length === 2 ? 'Bilateral' : value[0] === 'Direita' ? 'Mão direita' : 'Mão esquerda';\n    if (field.type === 'checks' && value?.length)");
fs.writeFileSync(f,s);
const form=dir+'Form.jsx';s=fs.readFileSync(form,'utf8').replace("field.type === 'checks' ? [] : ''","['checks', 'hand-side'].includes(field.type) ? [] : ''");fs.writeFileSync(form,s);
