import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import QuestionnaireTypeIcon from '@/Components/QuestionnaireTypeIcon';

// Gradiente propio de cada tipo, alineado con la identidad visual que ya tiene
// cada formulário (ex.: Dinamômetro é violeta, Estesiometria é vermelho, etc.).
const GRADIENTS = {
    blue: { gradient: 'from-blue-500 to-blue-600', darkGradient: 'dark:from-blue-600 dark:to-blue-700' },
    purple: { gradient: 'from-purple-500 to-indigo-600', darkGradient: 'dark:from-purple-600 dark:to-indigo-700' },
    green: { gradient: 'from-green-500 to-emerald-600', darkGradient: 'dark:from-green-600 dark:to-emerald-700' },
    orange: { gradient: 'from-orange-500 to-red-600', darkGradient: 'dark:from-orange-600 dark:to-red-700' },
    teal: { gradient: 'from-teal-500 to-cyan-600', darkGradient: 'dark:from-teal-600 dark:to-cyan-700' },
    yellow: { gradient: 'from-yellow-500 to-amber-600', darkGradient: 'dark:from-yellow-600 dark:to-amber-700' },
    red: { gradient: 'from-red-500 to-rose-600', darkGradient: 'dark:from-red-600 dark:to-rose-700' },
    pink: { gradient: 'from-pink-500 to-fuchsia-600', darkGradient: 'dark:from-pink-600 dark:to-fuchsia-700' },
    indigo: { gradient: 'from-indigo-500 to-blue-600', darkGradient: 'dark:from-indigo-600 dark:to-blue-700' },
    violet: { gradient: 'from-violet-500 to-purple-600', darkGradient: 'dark:from-violet-600 dark:to-purple-700' },
};

// Agrupamento por especialidade — ajuda a escanear a tela rapidamente
// mesmo com muitos tipos de questionário disponíveis.
const CATEGORIES = [
    { title: 'Exames Neurofisiológicos', icons: ['electroencefalograma', 'electroneuromiografia', 'eletroneuromiografia_facial', 'potencial'] },
    { title: 'Avaliações Físicas e Cognitivas', icons: ['equilibrio', 'rastreio_cognitivo', 'estesiometria', 'dinamometro'] },
    { title: 'TDAH', icons: ['tdah_infantil', 'tdah_adulto'] },
];

function getColorName(bgClass) {
    const match = /bg-([a-z]+)-\d+/.exec(bgClass || '');
    return match ? match[1] : 'blue';
}

function groupModules(modules) {
    const remaining = new Set(modules.map((m) => m.icon));
    const groups = CATEGORIES.map((cat) => ({
        title: cat.title,
        items: modules.filter((m) => cat.icons.includes(m.icon)),
    })).filter((g) => g.items.length > 0);

    groups.forEach((g) => g.items.forEach((i) => remaining.delete(i.icon)));

    const rest = modules.filter((m) => remaining.has(m.icon));
    if (rest.length > 0) groups.push({ title: 'Outros', items: rest });

    return groups;
}

const ModuleCard = ({ type }) => {
    const colors = GRADIENTS[getColorName(type.color)] || GRADIENTS.blue;
    return (
        <Link
            href={type.href}
            className={`flex items-center gap-3 bg-gradient-to-br ${colors.gradient} ${colors.darkGradient} rounded-lg shadow-md hover:shadow-lg p-4 text-white transition-all duration-150 hover:-translate-y-0.5 group`}
        >
            <div className="bg-white/20 rounded-lg p-2.5 flex-shrink-0">
                <QuestionnaireTypeIcon type={type.icon} className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
                <h4 className="text-base font-bold text-white truncate">{type.name}</h4>
                <p className="text-white/85 text-xs truncate">{type.description}</p>
            </div>
            <svg className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </Link>
    );
};

export default function QuestionnairesIndex({ auth, modules = [], userRole, isAdmin }) {
    const groups = groupModules(modules);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            Questionários
                        </h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Gestão de Questionários Médicos
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Questionários" />

            <div className="py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    {modules.length > 0 ? (
                        <>
                            {groups.map((group) => (
                                <div key={group.title}>
                                    <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                                        {group.title}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                        {group.items.map((type) => (
                                            <ModuleCard key={type.href} type={type} />
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <details className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    Como funciona a gestão por equipes?
                                </summary>
                                <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 space-y-1.5">
                                    <p>Os questionários estão organizados por equipes de trabalho — você só vê e gerencia os das equipes às quais pertence.</p>
                                    <p>Cada tipo tem campos e validações próprias, de acordo com o procedimento. O acesso a cada módulo é controlado por permissões.</p>
                                </div>
                            </details>
                        </>
                    ) : (
                        /* Estado sin módulos */
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                            <div className="p-6 sm:p-12 text-center">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                    <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                                    {isAdmin ? 'Nenhum módulo configurado' : 'Sem acesso a módulos'}
                                </h3>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto">
                                    {isAdmin
                                        ? 'Como administrador, você tem acesso a todos os módulos, mas não há módulos configurados no sistema.'
                                        : 'Você não tem acesso a nenhum módulo de questionários. Entre em contato com um administrador para solicitar acesso.'
                                    }
                                </p>
                                {!isAdmin && (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-lg inline-block">
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            Seu papel atual: <span className="font-medium text-gray-900 dark:text-gray-100">{userRole || 'Sem papel asignado'}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
