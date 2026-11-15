import { formatDateShort } from '@/Utils/dateFormatter';

export const ALTERACOES = [
    ['queda_progressiva_direita', 'Queda progressiva da perna direita'],
    ['queda_progressiva_esquerda', 'Queda progressiva da perna esquerda'],
    ['queda_subita_direita', 'Queda súbita da perna direita'],
    ['queda_subita_esquerda', 'Queda súbita da perna esquerda'],
    ['perda_flexao_direita', 'Perda gradual da flexão do joelho direito'],
    ['perda_flexao_esquerda', 'Perda gradual da flexão do joelho esquerdo'],
    ['tremor_oscilacao', 'Tremor ou oscilação'],
    ['fadiga', 'Fadiga muscular'],
    ['dor', 'Dor durante a sustentação'],
    ['incapacidade', 'Incapacidade de manter a posição'],
    ['sem_alteracoes', 'Completou o tempo solicitado sem alterações'],
];

const STEPS = [
    ['Posicionar o paciente', 'O paciente permanece em decúbito ventral (de barriga para baixo).'],
    ['Flexionar os joelhos', 'Manter os joelhos flexionados aproximadamente a 90°.'],
    ['Observar a sustentação', 'Manter as pernas elevadas durante 30 a 60 segundos.'],
];
export function Instructions() {
    return <div className="text-sm leading-7 text-gray-600 dark:text-zinc-300">
        <p className="max-w-prose">Avaliar a força muscular e identificar paresias discretas, especialmente relacionadas ao comprometimento da via corticoespinal.</p>
        <div className="mb-2 mt-7 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"><h4 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Sequência de aplicação</h4><span className="text-xs text-gray-500 dark:text-zinc-400">Membros inferiores · MMII</span></div>
        <ol className="divide-y divide-gray-100 dark:divide-zinc-600">{STEPS.map(([title, text], index) => <li key={title} className="flex gap-4 py-4 sm:gap-5"><span aria-hidden="true" className="w-5 shrink-0 pt-0.5 text-sm font-medium tabular-nums text-teal-700 dark:text-teal-300">{index + 1}.</span><div className="min-w-0"><h5 className="font-semibold text-gray-900 dark:text-zinc-100">{title}</h5><p className="mt-1 max-w-prose">{text}</p></div></li>)}</ol>
        <p className="mt-5 max-w-prose">Avaliação neurológica da força muscular, da capacidade de sustentação e da presença de paresia nos membros inferiores.</p>
    </div>;
}
const yesNo = value => value === true || value === 1 ? 'Sim' : value === false || value === 0 ? 'Não' : 'Não informado';
const withSides = (value, sides) => yesNo(value) + (value && sides?.length ? ` — ${sides.join(', ')}` : '');
export function Results({ questionnaire: q, compact = false }) {
    const rows = [
        ['Sustenta as pernas elevadas por 60 segundos', yesNo(q.sustenta_60_segundos)],
        ['Queda progressiva de uma ou ambas as pernas', withSides(q.queda_progressiva, q.queda_lados)],
        ['Tremor, oscilação ou dificuldade para manter as pernas elevadas', withSides(q.tremor_oscilacao, q.tremor_lados)],
        ['Assimetria da força ou da capacidade de sustentação', yesNo(q.assimetria) + (q.assimetria && q.assimetria_lado ? ` — maior comprometimento: ${q.assimetria_lado}` : '')],
        ['Queda, perda da posição ou incapacidade de completar o tempo solicitado', withSides(q.interrupcao, q.interrupcao_lados)],
        ['Tempo até a queda ou interrupção — membro inferior direito', q.interrupcao && q.tempo_direito_segundos != null ? `${q.tempo_direito_segundos} segundos` : q.interrupcao ? 'Não informado' : 'Não se aplica'],
        ['Tempo até a queda ou interrupção — membro inferior esquerdo', q.interrupcao && q.tempo_esquerdo_segundos != null ? `${q.tempo_esquerdo_segundos} segundos` : q.interrupcao ? 'Não informado' : 'Não se aplica'],
    ];
    return <div className={compact ? 'space-y-2 text-xs' : 'space-y-5'}><dl className={compact ? 'space-y-2' : 'space-y-4'}>{rows.map(([label, value]) => <div key={label}><dt className="font-semibold">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words">{value}</dd></div>)}</dl><div><h4 className="font-semibold">Tipo de alteração observada</h4>{q.alteracoes?.length ? <ul className="mt-1 list-disc space-y-1 pl-5">{ALTERACOES.filter(([key]) => q.alteracoes.includes(key)).map(([key, label]) => <li key={key}>{label}</li>)}</ul> : <p className="mt-1">Não informado</p>}</div></div>;
}

export function PatientDetails({ questionnaire: q }) {
    return <dl className="grid grid-cols-2 gap-4">{[
        ['Nome', q.nome_completo], ['RG ou CPF', q.rg_ou_cpf],
        ['Nascimento', formatDateShort(q.data_nascimento)], ['Idade', q.idade],
        ['Sexo', q.sexo], ['Data do exame', formatDateShort(q.data_exame)],
        ['Clínica', q.clinica], ['Equipe', q.team?.name],
        ['Avaliador', q.nome_avaliador], ['CID', q.cid],
    ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="font-semibold">{label}</dt><dd className="mt-1 break-words">{value || 'Não informado'}</dd></div>)}</dl>;
}
