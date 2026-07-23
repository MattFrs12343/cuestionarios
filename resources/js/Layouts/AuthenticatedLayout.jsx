import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import FlashMessage from '@/Components/FlashMessage';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const { t } = useTranslation();

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            <FlashMessage />
            <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl border-b border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 sticky top-0 z-50">
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
                                    href={route('dashboard')}
                                    className={`inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 border-0 ${
                                        route().current('dashboard')
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:text-blue-600 dark:hover:text-blue-400'
                                    }`}
                                >
                                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15V9a2 2 0 012-2h4a2 2 0 012 2v6" />
                                    </svg>
                                    <span className="leading-none">{t('navigation.dashboard')}</span>
                                </Link>
                                <Link
                                    href={route('questionnaires.index')}
                                    className={`inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 border-0 ${
                                        route().current('questionnaires.*')
                                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20 hover:text-purple-600 dark:hover:text-purple-400'
                                    }`}
                                >
                                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="leading-none">{t('navigation.questionnaires')}</span>
                                </Link>
                                {user.roles && user.roles.some(role => role.name === 'administrador') && (
                                    <Link
                                        href={route('admin.dashboard')}
                                        className={`inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 border-0 ${
                                            route().current('admin.*')
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 hover:text-emerald-600 dark:hover:text-emerald-400'
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
                            {/* Theme Toggle */}
                            <ThemeToggle />
                            
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-500 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-300 border border-gray-200/50 dark:border-gray-600/50 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm"
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

                                    <Dropdown.Content className="w-64 rounded-2xl shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md ring-1 ring-black ring-opacity-5 dark:ring-gray-700 border border-gray-200/50 dark:border-gray-700/50">
                                        <div className="px-5 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                                                    <span className="text-lg font-bold text-white">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="py-2">
                                            <Dropdown.Link
                                                href={route('profile.edit')}
                                                className="flex items-center px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 rounded-xl mx-2"
                                            >
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                                                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <span className="font-medium">{t('navigation.profile')}</span>
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="flex items-center w-full px-5 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 transition-all duration-300 rounded-xl mx-2"
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
                                className="inline-flex items-center justify-center rounded-xl p-2.5 text-gray-400 dark:text-gray-500 transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-gray-600 dark:hover:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700 focus:text-gray-500 dark:focus:text-gray-400 focus:outline-none shadow-lg hover:shadow-xl hover:scale-105"
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
                        ' sm:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50'
                    }
                >
                    <div className="space-y-2 pb-4 pt-3 px-4">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            {t('navigation.dashboard')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('questionnaires.index')}
                            active={route().current('questionnaires.index')}
                        >
                            📋 {t('questionnaires.list')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('questionnaires.electroencefalograma.index')}
                            active={route().current('questionnaires.electroencefalograma.*')}
                        >
                            🧠 Eletroencefalograma
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('questionnaires.electroneuromiografia.index')}
                            active={route().current('questionnaires.electroneuromiografia.*')}
                        >
                            ⚡ Eletroneuromiografia
                        </ResponsiveNavLink>
                        {user.roles && user.roles.some(role => role.name === 'administrador') && (
                            <ResponsiveNavLink
                                href={route('admin.dashboard')}
                                active={route().current('admin.*')}
                            >
                                {t('navigation.admin')}
                            </ResponsiveNavLink>
                        )}
                    </div>

                    <div className="border-t border-gray-200/50 dark:border-gray-700/50 pb-4 pt-4 mx-4">
                        <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                                    <span className="text-sm font-bold text-white">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {user.name}
                                    </div>
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                {t('navigation.profile')}
                            </ResponsiveNavLink>
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

            {header && (
                <header className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 transition-all duration-300">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
