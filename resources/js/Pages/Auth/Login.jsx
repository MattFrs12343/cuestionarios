import { lazy, Suspense, useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import EmailInput from '@/Components/Auth/EmailInput';
import PasswordInput from '@/Components/Auth/PasswordInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { getDescriptiveErrorMessage, getAuthErrorMessage } from '@/Utils/errorMessages';
import { logPerformanceMetrics } from '@/Utils/performanceMonitor';

// Lazy load non-critical components for better initial load time
const InfoPanel = lazy(() => import('@/Components/Auth/InfoPanel'));
const ErrorMessage = lazy(() => import('@/Components/Auth/ErrorMessage'));

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Log performance metrics in development
    useEffect(() => {
        logPerformanceMetrics('Login Page');
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Entrar" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8 animate-fade-in transition-colors duration-200">
                <div className="w-full max-w-[1400px]">
                    {/* Two-column layout container */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl dark:shadow-gray-900/50 overflow-hidden transition-colors duration-200" role="main">
                        <div className="grid md:grid-cols-5 lg:grid-cols-2 min-h-[500px] sm:min-h-[600px] lg:min-h-[650px]">
                            {/* Left Column - Info Panel (hidden on mobile, compact on tablet, full on desktop) */}
                            <Suspense fallback={<div className="hidden md:block md:col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800" />}>
                                <InfoPanel />
                            </Suspense>

                            {/* Right Column - Login Form */}
                            <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 md:col-span-3 lg:col-span-1 animate-slide-up" style={{ animationDelay: '100ms' }}>
                                {/* Mobile Logo (visible only on mobile) */}
                                <div className="md:hidden text-center mb-6 sm:mb-8">
                                    <div
                                        className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-lg"
                                        role="img"
                                        aria-label="Logo do Sistema de Gestão de Questionários Médicos"
                                    >
                                        <svg
                                            className="w-10 h-10 sm:w-12 sm:h-12 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 px-4">
                                        Sistema de Gestão de Questionários Médicos
                                    </h2>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        Plataforma profissional médica
                                    </p>
                                </div>

                                {/* Welcome Header */}
                                <div className="mb-6 sm:mb-8">
                                    <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                        Bem-vindo de volta
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                                        Entre para acessar o Sistema de Gestão de Questionários Médicos
                                    </p>
                                </div>

                                {/* Status Message */}
                                {status && (
                                    <div
                                        className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-xs sm:text-sm font-medium text-green-600 animate-slide-down"
                                        role="status"
                                        aria-live="polite"
                                    >
                                        {status}
                                    </div>
                                )}

                                {/* General Authentication Error */}
                                {getAuthErrorMessage(errors) && (
                                    <div className="mb-4 sm:mb-6" role="alert" aria-live="assertive">
                                        <Suspense fallback={<div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{getAuthErrorMessage(errors)}</div>}>
                                            <ErrorMessage
                                                message={getAuthErrorMessage(errors)}
                                                type="error"
                                            />
                                        </Suspense>
                                    </div>
                                )}

                                {/* Login Form */}
                                <form onSubmit={submit} className="space-y-4 sm:space-y-6" noValidate>
                                    {/* Email Field */}
                                    <div>
                                        <InputLabel
                                            htmlFor="email"
                                            value="E-mail"
                                            className="mb-2 text-gray-700 dark:text-gray-300 font-medium"
                                        />
                                        <EmailInput
                                            id="email"
                                            name="email"
                                            value={data.email}
                                            autoComplete="username"
                                            isFocused={true}
                                            hasError={!!errors.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="seu@email.com"
                                        />
                                        <InputError
                                            message={getDescriptiveErrorMessage('email', errors.email)}
                                            className="mt-2"
                                            id="email-error"
                                        />
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <InputLabel
                                            htmlFor="password"
                                            value="Senha"
                                            className="mb-2 text-gray-700 dark:text-gray-300 font-medium"
                                        />
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            value={data.password}
                                            autoComplete="current-password"
                                            hasError={!!errors.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="••••••••"
                                        />
                                        <InputError
                                            message={getDescriptiveErrorMessage('password', errors.password)}
                                            className="mt-2"
                                            id="password-error"
                                        />
                                    </div>

                                    {/* Remember Me & Forgot Password

                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center cursor-pointer group">
                                            <Checkbox
                                                name="remember"
                                                checked={data.remember}
                                                onChange={(e) =>
                                                    setData('remember', e.target.checked)
                                                }
                                                aria-label="Lembrar-me neste dispositivo"
                                            />
                                            <span className="ms-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
                                                Lembrar-me
                                            </span>
                                        </label>

                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1 transition-all duration-200 hover:bg-blue-50"
                                                aria-label="Recuperar senha esquecida"
                                            >
                                                <svg 
                                                    className="w-4 h-4" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                    aria-hidden="true"
                                                >
                                                    <path 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round" 
                                                        strokeWidth={2} 
                                                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" 
                                                    />
                                                </svg>
                                                Esqueceu sua senha?
                                            </Link>
                                        )}
                                    </div>
                                    */}

                                    {/* Login Button */}
                                    <div>
                                        <PrimaryButton
                                            className="w-full justify-center py-2.5 sm:py-3 text-sm sm:text-base font-semibold bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                                            disabled={processing}
                                            aria-label={processing ? 'Entrando, por favor aguarde' : 'Entrar no sistema'}
                                        >
                                            {processing ? (
                                                <span className="flex items-center">
                                                    <svg
                                                        className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        aria-hidden="true"
                                                    >
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span aria-live="polite">Entrando...</span>
                                                </span>
                                            ) : (
                                                'Entrar'
                                            )}
                                        </PrimaryButton>
                                    </div>
                                </form>

                                {/* Help and Support Section */}
                                <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg transition-colors duration-200">
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <div className="flex-shrink-0">
                                            <svg
                                                className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
                                                Precisa de ajuda?
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                                                Se você está tendo problemas para acessar sua conta, nossa equipe de suporte está disponível para ajudá-lo.
                                            </p>
                                            <div className="space-y-1 sm:space-y-2">
                                                <a
                                                    href="mailto:jmloli88br@gmail.com"
                                                    className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1.5 sm:px-2 py-1 transition-all duration-200 hover:bg-blue-100 break-all"
                                                    aria-label="Enviar e-mail para a equipe de suporte técnico"
                                                >
                                                    <svg
                                                        className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    <span className="truncate">jmloli88br@gmail.com</span>
                                                </a>
                                                <span className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                    Ou escreva para o nosso WhatsApp{' '}
                                                    <a
                                                        href="https://wa.link/5xzure"
                                                        className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded transition-colors duration-200 whitespace-nowrap"
                                                        aria-label="Ligar para o número de suporte técnico"
                                                    >
                                                        +55 (11) 98805-3476
                                                    </a>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer with Copyright */}
                                <footer className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-center space-y-1 sm:space-y-2">
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                            © {new Date().getFullYear()} VictCorp Software Development. Todos os direitos reservados.
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
                                            Versão 1.0.0
                                        </p>
                                    </div>
                                </footer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
