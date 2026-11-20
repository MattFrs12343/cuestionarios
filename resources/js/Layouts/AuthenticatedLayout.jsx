import { useEffect, useMemo, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import Dropdown from '@/Components/Dropdown';
import FlashMessage from '@/Components/FlashMessage';
import SaveConfirmation from '@/Components/SaveConfirmation';
import ThemeToggle from '@/Components/ThemeToggle';
import TeamSelectionModal from '@/Components/TeamSelectionModal';
import TeamWelcomeToast from '@/Components/TeamWelcomeToast';
import QuestionnaireTypeIcon from '@/Components/QuestionnaireTypeIcon';
import styles from '@/Components/AdminShell/AdminShell.module.css';
import ShellIcon from '@/Components/AdminShell/ShellIcon';
import { questionnaireCatalog } from '@/Components/AdminShell/catalog';

function SidebarContent({ modules, user, currentTeam, isAdmin, canManageRoles, collapsed = false, onNavigate = () => {} }) {
    const page = usePage();
    const pathname = page.url.split('?')[0].split('#')[0];
    const filtered = modules;
    const navClass = active => `flex min-h-11 items-center gap-3 rounded px-3 py-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 ${active ? 'bg-[#007bff] text-white' : 'text-[#c2c7d0] hover:bg-white/10 hover:text-white'}`;
    return <div className="flex h-full flex-col bg-[#343a40] text-white">
        <Link href={route('questionnaires.index')} onClick={onNavigate} className={`flex h-[65px] shrink-0 items-center gap-3 border-b border-white/10 px-5 ${collapsed ? 'justify-center px-2' : ''}`} title="Painel de pacientes">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#343a40]"><ShellIcon name="record" className="h-5 w-5" /></span>
            {!collapsed && <span className="text-xl tracking-tight"><strong className="text-lg font-semibold">Questionários</strong></span>}
        </Link>
        <nav aria-label="Navegação principal" className={`${styles.sidebarScroll} min-h-0 flex-1 overflow-y-auto px-2 pb-5 pt-3`}>
            <Link title="Painel de pacientes" aria-current={pathname === '/questionnaires' ? 'page' : undefined} href={route('questionnaires.index')} onClick={onNavigate} className={navClass(pathname === '/questionnaires')}><ShellIcon name="patients" />{!collapsed && <span>Pacientes</span>}</Link>
            <Link title="Histórico de atividade" href={route('history.index')} onClick={onNavigate} aria-current={pathname === '/historial' ? 'page' : undefined} className={navClass(pathname === '/historial')}><ShellIcon name="history" />{!collapsed && <span>Histórico de atividade</span>}</Link>
            {['Exames neurológicos', 'Avaliações e testes', 'TDAH'].map(group => {
                const items = filtered.filter(module => module.group === group);
                if (!items.length) return null;
                return <div key={group} className="mt-4">{!collapsed && <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#9ba3ab]">{group}</p>}{items.map(module => {
                    const base = `/questionnaires/${module.slug}`;
                    const active = pathname === base || pathname.startsWith(`${base}/`);
                    return <Link key={module.key} href={route(`questionnaires.${module.slug}.index`)} title={module.label} onClick={onNavigate} aria-current={active ? 'page' : undefined} className={navClass(active)}><QuestionnaireTypeIcon type={module.key} className="h-5 w-5 shrink-0" />{!collapsed && <><span className="min-w-0 flex-1 leading-5">{module.label}</span><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${module.color}`} /></>}</Link>;
                })}</div>;
            })}
            {isAdmin && <div className="mt-5 border-t border-white/10 pt-3">{!collapsed && <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#9ba3ab]">Administração</p>}{[
                ['admin.dashboard', 'Administração', 'settings'], ['admin.users.index', 'Usuários', 'user'], ['admin.teams.index', 'Equipes', 'patients'], ['admin.user-modules.index', 'Acesso aos módulos', 'record'], ...(canManageRoles ? [['admin.roles.index', 'Perfis de acesso', 'settings']] : []),
            ].map(([name, label, icon]) => <Link key={name} title={label} href={route(name)} onClick={onNavigate} className={navClass(route().current(name))}><ShellIcon name={icon} />{!collapsed && <span>{label}</span>}</Link>)}</div>}
        </nav>

    </div>;
}

export default function AuthenticatedLayout({ header, children }) {
    const page = usePage();
    const { auth, currentTeam, switchableTeams = [], needsTeamSelection = false, showTeamWelcome = false, accessibleModules = [] } = page.props;
    const user = auth.user;
    const isAdmin = page.props.navigation?.administration === true;
    const canManageRoles = page.props.navigation?.manageRoles === true;
    const modules = useMemo(() => questionnaireCatalog.filter(module => accessibleModules.includes(module.key)), [accessibleModules.join('|')]);
    const [collapsed, setCollapsed] = useState(() => { try { return localStorage.getItem('admin-sidebar-collapsed') === 'true'; } catch { return false; } });
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showTeamSwitcher, setShowTeamSwitcher] = useState(false);
    useEffect(() => { setMobileOpen(false); }, [page.url]);
    const toggleDesktop = () => setCollapsed(previous => { const next = !previous; try { localStorage.setItem('admin-sidebar-collapsed', String(next)); } catch {} return next; });
    const sidebarProps = { modules, user, currentTeam, isAdmin, canManageRoles };
    return <div className="min-h-screen bg-[#f4f6f9] text-gray-800 dark:bg-zinc-900 dark:text-zinc-100">
        <TeamSelectionModal show={needsTeamSelection} teams={switchableTeams} />
        <TeamSelectionModal show={showTeamSwitcher} teams={switchableTeams} closeable onClose={() => setShowTeamSwitcher(false)} />
        <FlashMessage /><SaveConfirmation /><TeamWelcomeToast show={showTeamWelcome} team={currentTeam} />
        <a href="#platform-main" className="sr-only z-[100] rounded bg-white p-3 text-blue-700 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Pular para o conteúdo</a>
        <aside aria-label="Menu lateral" className={`fixed bottom-0 left-0 top-0 z-40 hidden shadow-sm lg:block ${collapsed ? 'w-[76px]' : 'w-[260px]'}`}><SidebarContent {...sidebarProps} collapsed={collapsed} /></aside>
        <Dialog open={mobileOpen} onClose={() => setMobileOpen(false)} className="relative z-[60] lg:hidden"><div className="fixed inset-0 bg-black/50" aria-hidden="true" /><div className="fixed inset-0 flex"><DialogPanel className="relative h-full w-[280px] max-w-[85vw]"><DialogTitle className="sr-only">Menu de navegação</DialogTitle><SidebarContent {...sidebarProps} onNavigate={() => setMobileOpen(false)} /><button type="button" onClick={() => setMobileOpen(false)} aria-label="Fechar menu" className="absolute right-2 top-5 rounded bg-[#343a40] p-1.5 text-white focus-visible:ring-2 focus-visible:ring-blue-400"><ShellIcon name="close" className="h-4 w-4" /></button></DialogPanel></div></Dialog>
        <div className={`flex min-h-screen min-w-0 flex-col transition-[padding] duration-200 motion-reduce:transition-none ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-[260px]'}`}>
            <header className="sticky top-0 z-30 flex h-[65px] shrink-0 items-center justify-between gap-3 border-b border-[#dee2e6] bg-white px-4 dark:border-zinc-700 dark:bg-zinc-800 sm:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-4"><button type="button" className="hidden h-10 w-10 items-center justify-center rounded text-gray-500 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 lg:inline-flex dark:text-zinc-300 dark:hover:bg-zinc-700" aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'} aria-expanded={!collapsed} onClick={toggleDesktop}><ShellIcon name="menu" /></button><button type="button" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden dark:text-zinc-300 dark:hover:bg-zinc-700" aria-label="Abrir menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><ShellIcon name="menu" /></button><Link href={route('questionnaires.index')} className="hidden text-sm text-gray-500 hover:text-blue-600 xl:block dark:text-zinc-300">Painel de pacientes</Link></div>
                <div className="flex shrink-0 items-center gap-2 sm:gap-4">{currentTeam && <button type="button" disabled={switchableTeams.length < 2} onClick={() => setShowTeamSwitcher(true)} className="hidden min-h-10 max-w-48 items-center gap-2 rounded px-2 text-sm text-gray-500 hover:bg-gray-50 disabled:cursor-default md:inline-flex dark:text-zinc-300 dark:hover:bg-zinc-700" title="Equipe atual"><ShellIcon name="patients" className="h-4 w-4 shrink-0" /><span className="truncate">{currentTeam.name}</span>{switchableTeams.length > 1 && <ShellIcon name="down" className="h-3 w-3 shrink-0" />}</button>}<ThemeToggle />
                    <Dropdown><Dropdown.Trigger><button type="button" className="flex min-h-10 items-center gap-2 rounded px-1 text-sm text-gray-600 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-200 dark:hover:bg-zinc-700"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-200">{user.name?.charAt(0).toUpperCase()}</span><span className="hidden max-w-36 truncate sm:inline">{user.name}</span><ShellIcon name="down" className="h-3 w-3" /></button></Dropdown.Trigger><Dropdown.Content><Dropdown.Link href={route('profile.edit')}>Meu perfil</Dropdown.Link>{switchableTeams.length > 1 && <button type="button" onClick={() => setShowTeamSwitcher(true)} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-700">Trocar equipe</button>}<Dropdown.Link href={route('logout')} method="post" as="button">Sair da plataforma</Dropdown.Link></Dropdown.Content></Dropdown>
                </div>
            </header>
            <main id="platform-main" className="min-w-0 flex-1">{header && <div className="border-b border-gray-200 bg-white px-4 py-5 dark:border-zinc-700 dark:bg-zinc-800 sm:px-6"><div className="mx-auto max-w-screen-2xl">{header}</div></div>}{children}</main>
            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#dee2e6] bg-white px-5 py-4 text-xs text-gray-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"><span>© {new Date().getFullYear()} <strong className="font-semibold text-gray-600 dark:text-zinc-200">Questionários</strong>. Todos os direitos reservados.</span><span>Gestão de questionários médicos</span></footer>
        </div>
    </div>;
}
