import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import QuestionnaireTypeIcon from '@/Components/QuestionnaireTypeIcon';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTranslation } from '@/Hooks/useTranslation';
import { formatDateTime } from '@/Utils/dateFormatter';

const RANGES = [
    { key: 'today', label: 'Hoje' },
    { key: 'yesterday', label: 'Ontem' },
    { key: '7d', label: '7 dias' },
    { key: '30d', label: '30 dias' },
    { key: 'month', label: 'Este mês' },
    { key: 'custom', label: 'Personalizado' },
];

export default function Index({ timeline, counts, total, range, dateFrom, dateTo, canViewAll, teamName }) {
    const { t } = useTranslation();
    const [customFrom, setCustomFrom] = useState(dateFrom);
    const [customTo, setCustomTo] = useState(dateTo);

    const applyRange = (key, overrides = {}) => {
        const params = { range: key, ...overrides };
        router.get(route('history.index'), params, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const applyCustom = () => {
        applyRange('custom', { date_from: customFrom, date_to: customTo });
    };

    const rows = timeline.data || [];
    const activeCounts = useMemo(() => counts.filter((c) => c.count > 0), [counts]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100">
                            {t('history.title')}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                            {canViewAll
                                ? t('history.subtitle_team', { team: teamName })
                                : t('history.subtitle_self')}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-3 text-white shadow-lg">
                        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a1 1 0 00-1 1v7a1 1 0 001 1h3a1 1 0 001-1zm1 1h3a1 1 0 001-1v-4a2 2 0 00-2-2h-1a1 1 0 00-1 1v5zm8 0h2a1 1 0 001-1v-8a1 1 0 00-1-1h-1a2 2 0 00-2 2v7a1 1 0 001 1z" />
                        </svg>
                        <div className="leading-tight">
                            <div className="text-2xl font-bold">{total}</div>
                            <div className="text-xs font-medium uppercase tracking-wide opacity-90">
                                {t('history.total_records')}
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={t('history.title')} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {/* Selector de rango */}
                    <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-gray-900/5 dark:bg-zinc-700 dark:ring-zinc-600/50">
                        <div className="flex flex-wrap gap-2">
                            {RANGES.map((r) => (
                                <button
                                    key={r.key}
                                    type="button"
                                    onClick={() => (r.key === 'custom' ? applyRange('custom') : applyRange(r.key))}
                                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                        range === r.key
                                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-500'
                                    }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>

                        {range === 'custom' && (
                            <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-gray-100 pt-4 dark:border-zinc-600">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-zinc-400">
                                        {t('history.from')}
                                    </label>
                                    <input
                                        type="date"
                                        value={customFrom}
                                        onChange={(e) => setCustomFrom(e.target.value)}
                                        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-zinc-500 dark:bg-zinc-600 dark:text-zinc-100"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-zinc-400">
                                        {t('history.to')}
                                    </label>
                                    <input
                                        type="date"
                                        value={customTo}
                                        onChange={(e) => setCustomTo(e.target.value)}
                                        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-zinc-500 dark:bg-zinc-600 dark:text-zinc-100"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={applyCustom}
                                    className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600"
                                >
                                    {t('history.apply')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Contadores por tipo */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {activeCounts.map((c) => (
                            <div
                                key={c.type_key}
                                className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-md ring-1 ring-gray-900/5 dark:bg-zinc-700 dark:ring-zinc-600/50"
                            >
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${c.color}`}>
                                    <QuestionnaireTypeIcon type={c.type_key} className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xl font-bold text-gray-800 dark:text-zinc-100">{c.count}</div>
                                    <div className="truncate text-xs text-gray-500 dark:text-zinc-400" title={c.label}>
                                        {c.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Línea de tiempo */}
                    <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/5 dark:bg-zinc-700 dark:ring-zinc-600/50">
                        {rows.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                <svg className="h-12 w-12 text-gray-300 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-gray-500 dark:text-zinc-400">{t('history.empty')}</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100 dark:divide-zinc-600">
                                {rows.map((row) => (
                                    <li key={`${row.type_key}-${row.questionnaire_id}`}>
                                        <Link
                                            href={row.show_url}
                                            className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-600/50 sm:px-6"
                                        >
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-zinc-600 dark:text-zinc-200">
                                                <QuestionnaireTypeIcon type={row.type_key} className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-x-2">
                                                    <span className="font-semibold text-gray-800 dark:text-zinc-100">
                                                        {row.type_label}
                                                    </span>
                                                    <span className="text-gray-400 dark:text-zinc-500">·</span>
                                                    <span className="truncate text-gray-700 dark:text-zinc-200">
                                                        {row.patient_name}
                                                    </span>
                                                </div>
                                                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-gray-500 dark:text-zinc-400">
                                                    <span className="inline-flex items-center gap-1">
                                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {formatDateTime(row.created_at)}
                                                    </span>
                                                    {canViewAll && (
                                                        <span className="inline-flex items-center gap-1">
                                                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            {row.creator_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <svg className="h-5 w-5 shrink-0 text-gray-300 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Paginación */}
                    {timeline.links && timeline.links.length > 3 && (
                        <div className="flex flex-wrap items-center justify-center gap-1">
                            {timeline.links.map((link, i) => (
                                <Link
                                    key={`${link.label}-${i}`}
                                    href={link.url || '#'}
                                    preserveScroll
                                    className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                                        link.active
                                            ? 'bg-purple-500 font-semibold text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600'
                                    }${!link.url ? ' pointer-events-none opacity-40' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}