import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import FlashMessage from '@/Components/FlashMessage';
import SaveConfirmation from '@/Components/SaveConfirmation';
import ThemeToggle from '@/Components/ThemeToggle';
import TeamSelectionModal from '@/Components/TeamSelectionModal';
import TeamWelcomeToast from '@/Components/TeamWelcomeToast';
import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from '@/Hooks/useTranslation';
import QuestionnaireTypeIcon from '@/Components/QuestionnaireTypeIcon';

export default function AuthenticatedLayout({ header, children, hideNav = false }) {
    const page = usePage();
    const user = page.props.auth.user;
    const currentTeam = page.props.currentTeam;
    const switchableTeams = page.props.switchableTeams || [];
    const needsTeamSelection = page.props.needsTeamSelection || false;
    const showTeamWelcome = page.props.showTeamWelcome || false;
    const accessibleModules = page.props.accessibleModules || [];
    const canOpenModule = (moduleName) => accessibleModules.includes(moduleName);
    const { t } = useTranslation();

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [showTeamSwitcher, setShowTeamSwitcher] = useState(false);
    const canSwitchTeams = switchableTeams.length > 1;

    const handleTeamSwitch = (e) => {
        const teamId = e.target.value;
        if (teamId && String(teamId) !== String(currentTeam?.id)) {
            router.post(route('teams.switch', teamId), {}, { preserveScroll: true });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-zinc-800 transition-colors duration-200">
            <TeamSelectionModal show={needsTeamSelection} teams={switchableTeams} />
            <TeamSelectionModal
                show={showTeamSwitcher}
                teams={switchableTeams}
                closeable
                onClose={() => setShowTeamSwitcher(false)}
            />
            <FlashMessage />
            <SaveConfirmation />
            <TeamWelcomeToast show={showTeamWelcome} team={currentTeam} />
            {!hideNav && (
            <nav className="bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md shadow-xl border-b border-gray-200/50 dark:border-zinc-600/50 transition-all duration-300 sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-18 justify-between items-center">
                        <div className="flex items-center">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="flex items-center hover:scale-105 transition-all duration-200 group">
                                    <ApplicationLogo />
                                </Link>
                            </div>

                            <div className="hidden space-x-2 sm:-my-px sm:ms-12 sm:flex items-center">
                                <Link
                                    href={route('questionnaires.index')}
                                    className={`inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 border-0 ${
                                        route().current('questionnaires.*')
                                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                                            : 'text-gray-700 dark:text-zinc-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20 hover:text-purple-600 dark:hover:text-purple-400'
                                    }`}
                                >
                                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="leading-none">{t('navigation.questionnaires')}</span>
                                </Link>
                                <Link
                                    href={route('history.index')}
                                    className={`inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 border-0 ${
                                        route().current('history.*')
                                            ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-lg shadow-sky-500/25'
                                            : 'text-gray-700 dark:text-zinc-300 hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50 dark:hover:from-sky-900/20 dark:hover:to-cyan-900/20 hover:text-sky-600 dark:hover:text-sky-400'
                                    }`}
                                >
                                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="leading-none">{t('navigation.history')}</span>
                                </Link>
{(user.roles?.some(role => role.name === 'administrador') || user.is_super_admin) && (
                                    <Link
                                        href={route('admin.dashboard')}
                                        className={`inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 border-0 ${
                                            route().current('admin.*')
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                                                : 'text-gray-700 dark:text-zinc-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 hover:text-emerald-600 dark:hover:text-emerald-400'
                                        }`}
                                    >
                                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="leading-none">{t('navigation.admin')}</span>
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center gap-4">
                            {/* Equipe atual */}
                            {currentTeam && (
                                switchableTeams.length > 1 ? (
                                    <select
                                        value={currentTeam.id}
                                        onChange={handleTeamSwitch}
                                        title="Equipe atual"
                                        className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-600 border border-gray-200 dark:border-zinc-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
                                    >
                                        {switchableTeams.map((team) => (
                                            <option key={team.id} value={team.id}>{team.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="hidden md:inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-600/50 rounded-lg">
                                        {currentTeam.name}
                                    </span>
                                )
                            )}

                            {/* Theme Toggle */}
                            <ThemeToggle />
                            
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-zinc-600 dark:to-zinc-500 hover:from-gray-100 hover:to-gray-200 dark:hover:from-zinc-500 dark:hover:to-zinc-500 rounded-xl text-sm font-medium text-gray-700 dark:text-zinc-300 transition-all duration-300 border border-gray-200/50 dark:border-zinc-500/50 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm"
                                        >
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                                                <span className="text-sm font-bold text-white">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="hidden md:block">{user.name}</span>
                                            <svg
                                                className="ml-2 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content className="w-64 rounded-2xl shadow-2xl bg-white/95 dark:bg-zinc-700/95 backdrop-blur-md ring-1 ring-black ring-opacity-5 dark:ring-zinc-600 border border-gray-200/50 dark:border-zinc-600/50">
                                        <div className="py-2">
                                            <Dropdown.Link
                                                href={route('profile.edit')}
                                                className="flex items-center px-5 py-3 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 rounded-xl mx-2"
                                            >
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                                                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <span className="font-medium">{t('navigation.profile')}</span>
                                            </Dropdown.Link>
                                            {canSwitchTeams && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowTeamSwitcher(true)}
                                                    className="flex items-center w-full px-5 py-3 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 rounded-xl mx-2"
                                                >
                                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center mr-3">
                                                        <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-5.87M9 20H4v-2a4 4 0 013-5.87m6-1a4 4 0 10-4-4 4 4 0 004 4zm6 3.13a4 4 0 000-7.75M5 12.13a4 4 0 010-7.75" />
                                                        </svg>
                                                    </div>
                                                    <span className="font-medium">Trocar equipe</span>
                                                </button>
                                            )}
                                            <Dropdown.Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="flex items-center px-5 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 transition-all duration-300 rounded-xl mx-2"
                                            >
                                                <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 rounded-lg flex items-center justify-center mr-3">
                                                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                </div>
                                                <span className="font-medium">{t('auth.logout')}</span>
                                            </Dropdown.Link>
                                        </div>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center gap-3 sm:hidden">
                            {/* Theme Toggle Mobile */}
                            <ThemeToggle />
                            
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-xl p-2.5 text-gray-400 dark:text-zinc-400 transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-zinc-600 dark:hover:to-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 focus:bg-gray-100 dark:focus:bg-zinc-600 focus:text-gray-500 dark:focus:text-zinc-400 focus:outline-none shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border-t border-gray-200/50 dark:border-zinc-600/50'
                    }
                >
                    <div className="space-y-2 pb-4 pt-3 px-4">
                        <ResponsiveNavLink
                            href={route('questionnaires.index')}
                            active={route().current('questionnaires.index')}
                        >
                            <span className="inline-flex items-center gap-2">
                                <QuestionnaireTypeIcon type="default" className="w-4 h-4" />
                                {t('questionnaires.list')}
                            </span>
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('history.index')}
                            active={route().current('history.*')}
                        >
                            <span className="inline-flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {t('navigation.history')}
                            </span>
                        </ResponsiveNavLink>
                        {canOpenModule('electroencefalograma') && (
                            <ResponsiveNavLink
                                href={route('questionnaires.electroencefalograma.index')}
                                active={route().current('questionnaires.electroencefalograma.*')}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <QuestionnaireTypeIcon type="electroencefalograma" className="w-4 h-4" />
                                    Eletroencefalograma
                                </span>
                            </ResponsiveNavLink>
                        )}
                        {canOpenModule('electroneuromiografia') && (
                            <ResponsiveNavLink
                                href={route('questionnaires.electroneuromiografia.index')}
                                active={route().current('questionnaires.electroneuromiografia.*')}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <QuestionnaireTypeIcon type="electroneuromiografia" className="w-4 h-4" />
                                    Electroneuromiografia
                                </span>
                            </ResponsiveNavLink>
                        )}
                        {(user.roles?.some(role => role.name === 'administrador') || user.is_super_admin) && (
                            <ResponsiveNavLink
                                href={route('admin.dashboard')}
                                active={route().current('admin.*')}
                            >
                                {t('navigation.admin')}
                            </ResponsiveNavLink>
                        )}
                    </div>

                    <div className="border-t border-gray-200/50 dark:border-zinc-600/50 pb-4 pt-4 mx-4">
                        <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-zinc-700 dark:to-zinc-600 rounded-xl">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                                    <span className="text-sm font-bold text-white">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                                        {user.name}
                                    </div>
                                    <div className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                {t('navigation.profile')}
                            </ResponsiveNavLink>
                            {canSwitchTeams && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowingNavigationDropdown(false);
                                        setShowTeamSwitcher(true);
                                    }}
                                    className="flex w-full items-start border-l-4 border-transparent py-2 pe-4 ps-3 text-base font-medium text-gray-600 dark:text-zinc-400 transition duration-150 ease-in-out hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800 focus:outline-none dark:hover:border-zinc-500 dark:hover:bg-zinc-600 dark:hover:text-zinc-200 dark:focus:border-zinc-500 dark:focus:bg-zinc-600 dark:focus:text-zinc-200"
                                >
                                    Trocar equipe
                                </button>
                            )}
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                {t('auth.logout')}
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>
            )}

            {header && (
                <header className="bg-gradient-to-r from-white to-gray-50 dark:from-zinc-700 dark:to-zinc-800 shadow-lg border-b border-gray-200/50 dark:border-zinc-600/50 transition-all duration-300">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>

            <footer className="border-t border-gray-200/50 dark:border-zinc-600/50 py-4">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                        &copy; {new Date().getFullYear()} Cuestionários. Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}
