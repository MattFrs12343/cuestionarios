import { formatDateShort } from '@/Utils/dateFormatter';

export const interpretation = value => ({
    'Sim': 'Resposta favorável: redução ou desaparecimento da vertigem posicional após a manobra.',
    'Melhora parcial': 'Resposta parcial: persistência de vertigem com redução da intensidade.',
    'Não': 'Sem melhora: manutenção dos sintomas, indicando necessidade de reavaliação vestibular.',
}[value] || 'Não informado');

const APPLICATION_STEPS = [
    { title: 'Posição inicial', text: 'O paciente senta-se na maca, com a cabeça girada 45° para a direita.' },
    { title: 'Deitar o paciente', text: 'É deitado de costas, mantendo a cabeça girada e ligeiramente estendida, por aproximadamente 30 a 60 segundos ou até cessar a vertigem.' },
    { title: 'Girar a cabeça', text: 'A cabeça é girada 90° para a esquerda, mantendo a posição por 30 a 60 segundos.' },
    { title: 'Girar o corpo', text: 'O corpo é girado para o lado esquerdo, com o rosto direcionado para baixo, mantendo a posição por 30 a 60 segundos.' },
    { title: 'Retornar à posição sentada', text: 'O paciente retorna lentamente à posição sentada.' },
];

export function Instructions() {
    return <div className="text-sm leading-7 text-gray-600 dark:text-zinc-300">
        <p className="max-w-prose">Tratar a vertigem posicional paroxística benigna (VPPB), especialmente quando relacionada ao canal semicircular posterior, por meio do reposicionamento dos otólitos.</p>
        <div className="mb-2 mt-7 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h4 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Sequência de aplicação</h4>
            <span className="text-xs text-gray-500 dark:text-zinc-400">Exemplo para o canal posterior direito</span>
        </div>
        <ol className="divide-y divide-gray-100 dark:divide-zinc-600">
            {APPLICATION_STEPS.map((step, index) => <li key={step.title} className="flex gap-4 py-4 sm:gap-5">
                <span aria-hidden="true" className="w-5 shrink-0 pt-0.5 text-sm font-medium tabular-nums text-teal-700 dark:text-teal-300">{index + 1}.</span>
                <div className="min-w-0">
                    <h5 className="font-semibold text-gray-900 dark:text-zinc-100">{step.title}</h5>
                    <p className="mt-1 max-w-prose">{step.text}</p>
                </div>
            </li>)}
        </ol>
        <div className="mt-5 rounded-lg bg-gray-50 px-4 py-4 sm:px-5 dark:bg-zinc-800/60">
            <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-zinc-100">Cuidados durante a aplicação</h4>
            <p className="max-w-prose">A execução deve considerar limitações cervicais, vasculares e de mobilidade, com acompanhamento profissional.</p>
        </div>
        <details className="group mt-3 border-b border-gray-100 dark:border-zinc-600">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium text-gray-700 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:text-zinc-200 [&::-webkit-details-marker]:hidden">
                Observações técnicas
                <svg aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" /></svg>
            </summary>
            <div className="max-w-prose space-y-3 pb-5">
                <p>Durante a avaliação da VPPB pode aparecer um movimento involuntário dos olhos chamado nistagmo.</p>
                <p>A manobra de Epley é terapêutica, utilizada para reposicionamento dos otólitos na VPPB do canal posterior. O diagnóstico é geralmente investigado pela manobra de Dix-Hallpike, com avaliação do nistagmo e da vertigem.</p>
                <p>A manobra de Epley não é um teste de força muscular nem de comprometimento de nervos periféricos.</p>
            </div>
        </details>
    </div>;
}
const yesNo = value => value === true || value === 1 ? 'Sim' : value === false || value === 0 ? 'Não' : 'Não informado';
export function Results({ questionnaire: q, compact = false }) {
    const rows = [
        ['Vertigem durante as mudanças de posição', yesNo(q.vertigem) + (q.vertigem && q.vertigem_lados?.length ? ` — ${q.vertigem_lados.join(', ')}` : '')],
        ['Nistagmo durante a manobra', yesNo(q.nistagmo) + (q.nistagmo && q.nistagmo_lados?.length ? ` — ${q.nistagmo_lados.join(', ')}` : '')],
        ['Náuseas, tontura intensa ou desconforto', yesNo(q.desconforto) + (q.desconforto && q.observacoes ? ` — ${q.observacoes}` : '')],
        ['Permanece em cada posição por aproximadamente 30 a 60 segundos', yesNo(q.mantem_posicao)],
        ['Tempo mantido', q.tempo_mantido_segundos != null ? `${q.tempo_mantido_segundos} segundos` : 'Não informado'],
        ['Melhora da vertigem após a manobra', q.melhora_vertigem || 'Não informado'],
    ];
    return <div className={compact ? 'space-y-2 text-xs' : 'space-y-5'}><dl className="space-y-3">{rows.map(([label, value]) => <div key={label}><dt className="font-semibold">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words">{value}</dd></div>)}</dl><p className="mt-4"><strong>Interpretação de referência:</strong> {interpretation(q.melhora_vertigem)}</p></div>;
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
