import FlashMessage from '@/Components/FlashMessage';
import ShellIcon from '@/Components/AdminShell/ShellIcon';
import loginCover from '@/Assets/dashboard/login-cover.svg';
import styles from '@/Components/AdminShell/AdminShell.module.css';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import EmailInput from '@/Components/Auth/EmailInput';
import PasswordInput from '@/Components/Auth/PasswordInput';
import { Head, useForm } from '@inertiajs/react';
import { getDescriptiveErrorMessage, getAuthErrorMessage } from '@/Utils/errorMessages';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({ email: '', password: '', remember: false });
    const submit = event => { event.preventDefault(); post(route('login'), { onFinish: () => reset('password') }); };
    return <main className="flex min-h-[100svh] flex-col bg-white lg:min-h-screen lg:bg-[#f6f8fb] text-slate-800 dark:bg-zinc-900 dark:text-zinc-100 lg:grid lg:grid-cols-[1.1fr_1fr]">
        <Head title="Entrar" />
        <FlashMessage />
        <section aria-label="Sistema de questionários médicos" className="relative isolate flex shrink-0 flex-col justify-between overflow-hidden px-6 pb-5 pt-7 text-slate-900 dark:text-zinc-100 sm:px-10 lg:min-h-screen lg:bg-[#102549] lg:p-12 lg:text-white xl:p-16">
            <div className="absolute inset-0 -z-10 hidden lg:block"><img src={loginCover} width="960" height="1200" alt="" className={styles.heroImage + ' h-full w-full object-cover object-center'} /><div className="absolute inset-0 bg-gradient-to-t from-[#0b1b36] via-[#102549]/30 to-[#102549]/75" /></div>
            <a href="/" className="inline-flex w-fit items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 lg:focus-visible:ring-white"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 lg:bg-white/15 lg:text-white"><ShellIcon name="record" /></span><span className="text-lg font-semibold tracking-tight">Questionários<span className="hidden text-xs font-normal tracking-normal text-blue-100 lg:block">Sistema de gestão médica</span></span></a>
            <div className="hidden max-w-lg lg:mb-10 lg:mt-60 lg:block"><h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl xl:text-5xl">O cuidado começa com uma boa avaliação.</h2><p className="mt-4 hidden max-w-sm text-sm leading-7 text-blue-100 lg:block">Uma visão organizada de seus pacientes, questionários e avaliações. Mais clareza para a sua rotina clínica.</p><div className="mt-7 hidden items-center gap-3 border-t border-white/20 pt-5 text-xs text-blue-100 lg:flex"><ShellIcon name="patients" className="h-4 w-4" />Pacientes e avaliações em um só lugar</div></div>
        </section>
        <section aria-labelledby="login-title" className="flex min-w-0 flex-1 flex-col justify-center px-6 pb-10 pt-8 sm:px-10 lg:py-12 lg:px-14 xl:px-24">
            <div className={styles.loginEnter + ' mx-auto w-full max-w-sm'}>
                <span aria-hidden="true" className="mb-6 hidden h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 lg:inline-flex"><ShellIcon name="user" className="h-6 w-6" /></span>
                <h1 id="login-title" className="text-[28px] font-semibold tracking-tight text-slate-900 lg:text-3xl dark:text-zinc-100">Bem-vindo de volta.</h1>
                <p className="mb-8 mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-400"><span className="lg:hidden">Entre com seu e-mail e senha.</span><span className="hidden lg:inline">Acesse sua plataforma para continuar o acompanhamento dos pacientes.</span></p>
                {status && <div role="status" className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{status}</div>}
                {getAuthErrorMessage(errors) && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{getAuthErrorMessage(errors)}</div>}
                <form onSubmit={submit} className="space-y-5" noValidate>
                    <div><InputLabel htmlFor="email" value="E-mail" className="mb-2" /><EmailInput id="email" name="email" value={data.email} autoComplete="username" className="text-base lg:text-sm" isFocused={typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches} hasError={!!errors.email} onChange={event => setData('email', event.target.value)} placeholder="seu@email.com" aria-describedby={errors.email ? 'email-error' : undefined} /><InputError id="email-error" message={getDescriptiveErrorMessage('email', errors.email)} className="mt-2" /></div>
                    <div><InputLabel htmlFor="password" value="Senha" className="mb-2" /><PasswordInput id="password" name="password" value={data.password} autoComplete="current-password" className="text-base lg:text-sm" hasError={!!errors.password} onChange={event => setData('password', event.target.value)} placeholder="Sua senha" aria-describedby={errors.password ? 'password-error' : undefined} /><InputError id="password-error" message={getDescriptiveErrorMessage('password', errors.password)} className="mt-2" /></div>
                    <button type="submit" disabled={processing} className="group flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-60">{processing ? 'Entrando…' : 'Entrar na plataforma'}<ShellIcon name={processing ? 'refresh' : 'chevron'} className={'h-4 w-4 ' + (processing ? 'animate-spin motion-reduce:animate-none' : 'transition-transform group-hover:translate-x-1 motion-reduce:transform-none')} /></button>
                </form>
                <p className="mt-8 pt-2 text-center lg:border-t lg:border-slate-200 lg:pt-6 text-xs leading-6 text-slate-500 dark:border-zinc-700 dark:text-zinc-400">Precisa de ajuda? <a className="font-medium text-blue-700 underline-offset-4 hover:underline dark:text-blue-400" href="mailto:sistemasbrasiltech@gmail.com">Fale com o suporte</a></p>
            </div>
        </section>
    </main>;
}
