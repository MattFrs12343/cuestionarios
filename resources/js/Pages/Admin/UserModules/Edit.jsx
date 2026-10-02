import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeftIcon, UserIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import QuestionnaireTypeIcon from '@/Components/QuestionnaireTypeIcon';

export default function Edit({ auth, user, modules, assignedModules, planDefaults = [], effectiveModules = [] }) {
    // Parte del acceso efectivo real (no solo de las filas individuales): si un
    // módulo le llega por el plan de su equipo, el interruptor debe abrirse
    // encendido, o "guardar" sin tocar nada se lo quitaría.
    const { data, setData, put, processing, errors } = useForm({
        modules: Object.keys(modules).reduce((acc, moduleName) => {
            acc[moduleName] = assignedModules[moduleName]?.is_active
                ?? effectiveModules.includes(moduleName);
            return acc;
        }, {})
    });

    const inPlan = (moduleName) => planDefaults.includes(moduleName);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.user-modules.update', user.id));
    };

    const handleModuleToggle = (moduleName) => {
        setData('modules', {
            ...data.modules,
            [moduleName]: !data.modules[moduleName]
        });
    };

    const getRoleBadgeColor = (roleName) => {
        switch (roleName) {
            case 'laudador':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'tecnico':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-300';
        }
    };

    const getModuleIcon = (moduleName) => (
        <QuestionnaireTypeIcon type={moduleName} className="w-6 h-6 text-gray-700 dark:text-zinc-300" />
    );

    const getModuleDescription = (moduleName) => {
        switch (moduleName) {
            case 'electroencefalograma':
                return 'Fornece acesso ao módulo de questionário de EEG';
            case 'electroneuromiografia':
                return 'Fornece acesso ao módulo de questionário de electroneuromiografia';
            case 'rastreio_cognitivo':
                return 'Fornece acesso ao módulo de rastreio cognitivo (MoCA)';
            case 'equilibrio':
                return 'Fornece acesso ao módulo de avaliação do equilíbrio e risco de quedas';
            case 'mini_exame_mental':
                return 'Fornece acesso ao módulo de Mini Exame do Estado Mental (MEEM)';
            default:
                return 'Módulo del sistema';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-zinc-200 leading-tight">
                            Gerenciar Módulos
                        </h2>
                        <p className="text-xs text-gray-600 dark:text-zinc-400">
                            Controle de Acesso aos Módulos
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Gestionar Módulos - ${user.name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Banner */}
                    <div className="mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-xl shadow-lg overflow-hidden">
                        <div className="px-6 py-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                                        <UserIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                                        <p className="text-blue-100 text-sm">{user.email}</p>
                                    </div>
                                </div>
                                <Link
                                    href={route('admin.user-modules.index')}
                                    className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-lg transition-all duration-200"
                                >
                                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                                    Voltar
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-700 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-zinc-100">

                            {/* Formulario de módulos */}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-zinc-100 mb-4">
                                        Módulos de {user.name}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6">
                                        Lo que enciendas aquí es exactamente lo que esta persona va a ver.
                                        Lo que dejes apagado, el cuestionario no le aparece y no puede entrar a él.
                                    </p>

                                    <div className="space-y-4">
                                        {Object.entries(modules).map(([moduleName, moduleDisplayName]) => {
                                            const isAssigned = data.modules[moduleName];
                                            const assignmentInfo = assignedModules[moduleName];
                                            
                                            return (
                                                <div
                                                    key={moduleName}
                                                    className={`border rounded-lg p-4 transition-colors duration-200 ${
                                                        isAssigned
                                                            ? 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                                                            : 'border-gray-300 bg-white dark:border-zinc-500 dark:bg-zinc-700'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <div>
                                                                {getModuleIcon(moduleName)}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h5 className="text-base font-medium text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                                                                    {moduleDisplayName}
                                                                    {inPlan(moduleName) && (
                                                                        <span className="text-xs font-normal px-2 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-zinc-600 dark:text-zinc-400">
                                                                            valor inicial del equipo
                                                                        </span>
                                                                    )}
                                                                </h5>
                                                                <p className="text-sm text-gray-500 dark:text-zinc-400">
                                                                    {getModuleDescription(moduleName)}
                                                                </p>
                                                                {assignmentInfo && (
                                                                    <p className="text-xs text-gray-400 dark:text-zinc-400 mt-1">
                                                                        {assignmentInfo.is_active ? 'Asignado' : 'Desasignado'}
                                                                        {assignmentInfo.assigned_by?.name ? ` por ${assignmentInfo.assigned_by.name}` : ''}
                                                                        {' · '}
                                                                        {new Date(assignmentInfo.created_at).toLocaleDateString()}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleModuleToggle(moduleName)}
                                                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                                                                    isAssigned ? 'bg-green-600' : 'bg-gray-200 dark:bg-zinc-500'
                                                                }`}
                                                            >
                                                                <span
                                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                                        isAssigned ? 'translate-x-5' : 'translate-x-0'
                                                                    }`}
                                                                >
                                                                    {isAssigned ? (
                                                                        <CheckIcon className="h-3 w-3 text-green-600 absolute top-1 left-1" />
                                                                    ) : (
                                                                        <XMarkIcon className="h-3 w-3 text-gray-400 absolute top-1 left-1" />
                                                                    )}
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {errors.modules && (
                                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.modules}
                                        </p>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-zinc-600">
                                    <Link
                                        href={route('admin.user-modules.index')}
                                        className="inline-flex items-center px-6 py-3 bg-gray-500 dark:bg-zinc-500 hover:bg-gray-600 dark:hover:bg-zinc-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 hover:from-blue-600 hover:to-indigo-700 dark:hover:from-blue-700 dark:hover:to-indigo-800 text-white font-semibold rounded-lg disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {processing ? 'Salvando...' : 'Salvar alterações'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}