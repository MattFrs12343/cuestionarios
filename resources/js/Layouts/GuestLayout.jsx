import FlashMessage from '@/Components/FlashMessage';
import ShellIcon from '@/Components/AdminShell/ShellIcon';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return <main className="flex min-h-screen flex-col items-center justify-center bg-[#e9ecef] px-4 py-10 text-gray-700 dark:bg-zinc-900 dark:text-zinc-200">
        <FlashMessage />
        <Link href="/" className="mb-6 flex items-center gap-3 rounded text-2xl text-[#343a40] focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-100"><span className="flex h-11 w-11 items-center justify-center rounded bg-[#007bff] text-white"><ShellIcon name="record" /></span><span><strong className="font-semibold">Questionários</strong><span className="mt-0.5 block text-xs font-normal text-gray-500 dark:text-zinc-400">Sistema de gestão médica</span></span></Link>
        <div className="w-full max-w-md rounded border border-gray-200 border-t-[3px] border-t-[#007bff] bg-white px-6 py-7 shadow-sm dark:border-zinc-700 dark:border-t-blue-500 dark:bg-zinc-800 sm:px-8">{children}</div>
        <p className="mt-6 text-center text-xs text-gray-500 dark:text-zinc-400">Plataforma de questionários médicos</p>
    </main>;
}
