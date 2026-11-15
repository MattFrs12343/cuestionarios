// Opt-in presentation for questionnaire pages only. No global CSS or app-wide button changes.
const base = 'inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50';
const primary = 'bg-blue-700 text-white hover:bg-blue-800 focus-visible:outline-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700';
const neutral = 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-gray-500 dark:border-zinc-500 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600';
const exportColor = 'bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:outline-emerald-600 dark:bg-emerald-700 dark:hover:bg-emerald-600';
const deleteColor = 'bg-red-700 text-white hover:bg-red-800 focus-visible:outline-red-600 dark:bg-red-700 dark:hover:bg-red-600';
const viewColor = 'bg-slate-700 text-white hover:bg-slate-800 focus-visible:outline-slate-600 dark:bg-zinc-600 dark:hover:bg-zinc-500';
const icon = 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50';

export const QUESTIONNAIRE_ACTIONS = {
    primary: `${base} ${primary}`,
    neutral: `${base} ${neutral}`,
    export: `${base} ${exportColor}`,
    delete: `${base} ${deleteColor}`,
    view: `${base} ${viewColor}`,
    iconPrimary: `${icon} ${primary}`,
    iconExport: `${icon} ${exportColor}`,
    iconDelete: `${icon} ${deleteColor}`,
    iconView: `${icon} ${viewColor}`,
};

// Hues match config/questionnaires.php. Each module keeps its identity across pages.
const blue = { header: 'bg-blue-700 text-white dark:bg-blue-800', accent: 'bg-blue-600', caption: 'text-blue-100' };
const purple = { header: 'bg-purple-700 text-white dark:bg-purple-800', accent: 'bg-purple-600', caption: 'text-purple-100' };
const green = { header: 'bg-green-700 text-white dark:bg-green-800', accent: 'bg-green-600', caption: 'text-green-100' };
const orange = { header: 'bg-orange-700 text-white dark:bg-orange-800', accent: 'bg-orange-600', caption: 'text-orange-100' };
const teal = { header: 'bg-teal-700 text-white dark:bg-teal-800', accent: 'bg-teal-600', caption: 'text-teal-100' };
const yellow = { header: 'bg-amber-700 text-white dark:bg-amber-800', accent: 'bg-amber-600', caption: 'text-amber-100' };
const red = { header: 'bg-red-700 text-white dark:bg-red-800', accent: 'bg-red-600', caption: 'text-red-100' };
const violet = { header: 'bg-violet-700 text-white dark:bg-violet-800', accent: 'bg-violet-600', caption: 'text-violet-100' };
const indigo = { header: 'bg-indigo-700 text-white dark:bg-indigo-800', accent: 'bg-indigo-600', caption: 'text-indigo-100' };
const cyan = { header: 'bg-cyan-700 text-white dark:bg-cyan-800', accent: 'bg-cyan-600', caption: 'text-cyan-100' };
export const QUESTIONNAIRE_THEMES = {
    electroencefalograma: blue,
    electroneuromiografia: purple,
    potencial: green,
    electroneuromiografia_facial: orange,
    rastreio_cognitivo: teal,
    equilibrio: yellow,
    mini_exame_mental: blue,
    estesiometria: red,
    tdah_infantil: violet,
    tdah_adulto: indigo,
    dinamometro: violet,
    dinamometria_mmii: cyan,
    epley: teal,
    barre: teal,
    finger_tapping: teal,
    mingazzini: teal,
    raimiste: teal,
    wartenberg: teal,
};

export function QuestionnairePrimaryButton({ type = 'submit', className = '', ...props }) {
    return <button type={type} {...props} className={`${QUESTIONNAIRE_ACTIONS.primary} ${className}`} />;
}
export function QuestionnaireSecondaryButton({ type = 'button', className = '', ...props }) {
    return <button type={type} {...props} className={`${QUESTIONNAIRE_ACTIONS.neutral} ${className}`} />;
}
