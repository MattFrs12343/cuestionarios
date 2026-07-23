import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import FlashMessage from '@/Components/FlashMessage';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, EyeIcon, PencilIcon, TrashIcon, CalendarIcon, UserIcon, BuildingOfficeIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, questionnaires, teams, currentTeam, filters, can }) {
    const { t } = useTranslation();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [questionnaireToDelete, setQuestionnaireToDelete] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [searchFilters, setSearchFilters] = useState({
        search: filters.search || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        clinica: filters.clinica || '',
        team_id: filters.team_id || '',
        sort: filters.sort || 'created_at',
        direction: filters.direction || 'desc'
    });

    const handleSearch = () => {
        router.get(route('questionnaires.potencial.index'), searchFilters, {
            preserveState: true,
            replace: true
        });
    };

    const handleSort = (field) => {
        const newDirection = searchFilters.sort === field && searchFilters.direction === 'asc' ? 'desc' : 'asc';
        setSearchFilters(prev => ({ ...prev, sort: field, direction: newDirection }));
        router.get(route('questionnaires.potencial.index'), {
            ...searchFilters,
            sort: field,
            direction: newDirection
        }, {
            preserveState: true,
            replace: true
        });
    };

    const confirmDelete = (questionnaire) => {
        setQuestionnaireToDelete(questionnaire);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        if (questionnaireToDelete) {
            router.delete(route('questionnaires.potencial.destroy', questionnaireToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setQuestionnaireToDelete(null);
                }
            });
        }
    };

    const getSortIcon = (field) => {
        if (searchFilters.sort !== field) return '↕️';
        return searchFilters.direction === 'asc' ? '↑' : '↓';
    };

    const hasActiveFilters = searchFilters.search || searchFilters.date_from || searchFilters.date_to || searchFilters.clinica || searchFilters.team_id;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        {t('Questionários de Potencial Evocado')}
                    </h2>
                    {can.create && (
                        <Link href={route('questionnaires.potencial.create')}>
                            <PrimaryButton>
                                {t('Novo Questionário')}
                            </PrimaryButton>
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Questionários de Potencial Evocado" />

            <div className="py-6 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FlashMessage />
                    
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-2xl">
                        {/* Header con búsqueda rápida */}
                        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                {/* Búsqueda rápida */}
                                <div className="flex-1 max-w-md">
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <TextInput
                                            type="text"
                                            value={searchFilters.search}
                                            onChange={(e) => setSearchFilters(prev => ({ ...prev, search: e.target.value }))}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            placeholder={t('Buscar por nombre o RG...')}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900"
                                        />
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`relative inline-flex items-center px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                                            hasActiveFilters
                                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-300 dark:border-indigo-700'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        <FunnelIcon className="h-5 w-5 mr-2" />
                                        <span className="hidden sm:inline">{t('Filtros')}</span>
                                        {hasActiveFilters && (
                                            <span className="absolute -top-1 -right-1 h-5 w-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                                                {[searchFilters.search, searchFilters.date_from, searchFilters.date_to, searchFilters.clinica, searchFilters.team_id].filter(Boolean).length}
                                            </span>
                                        )}
                                    </button>
                                    
                                    <PrimaryButton onClick={handleSearch} className="shadow-lg hover:shadow-xl transition-shadow">
                                        <MagnifyingGlassIcon className="h-5 w-5 sm:mr-2" />
                                        <span className="hidden sm:inline">{t('Buscar')}</span>
                                    </PrimaryButton>
                                </div>
                            </div>

                            {/* Panel de filtros expandible */}
                            {showFilters && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top duration-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                {t('Data de')}
                                            </label>
                                            <TextInput
                                                type="date"
                                                value={searchFilters.date_from}
                                                onChange={(e) => setSearchFilters(prev => ({ ...prev, date_from: e.target.value }))}
                                                className="w-full"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                {t('Data até')}
                                            </label>
                                            <TextInput
                                                type="date"
                                                value={searchFilters.date_to}
                                                onChange={(e) => setSearchFilters(prev => ({ ...prev, date_to: e.target.value }))}
                                                className="w-full"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                {t('Clínica')}
                                            </label>
                                            <TextInput
                                                type="text"
                                                value={searchFilters.clinica}
                                                onChange={(e) => setSearchFilters(prev => ({ ...prev, clinica: e.target.value }))}
                                                placeholder={t('Nome da clínica...')}
                                                className="w-full"
                                            />
                                        </div>
                                        
                                        {teams.length > 1 && (
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                    {t('Equipe')}
                                                </label>
                                                <select
                                                    value={searchFilters.team_id}
                                                    onChange={(e) => setSearchFilters(prev => ({ ...prev, team_id: e.target.value }))}
                                                    className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-lg shadow-sm"
                                                >
                                                    <option value="">{t('Todas as equipes')}</option>
                                                    {teams.map(team => (
                                                        <option key={team.id} value={team.id}>
                                                            {team.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {hasActiveFilters && (
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={() => {
                                                    setSearchFilters({
                                                        search: '',
                                                        date_from: '',
                                                        date_to: '',
                                                        clinica: '',
                                                        team_id: '',
                                                        sort: 'created_at',
                                                        direction: 'desc'
                                                    });
                                                    router.get(route('questionnaires.potencial.index'));
                                                }}
                                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                                            >
                                                <XMarkIcon className="h-4 w-4 mr-1" />
                                                {t('Limpar filtros')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Vista de tabla para desktop */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th 
                                            className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={() => handleSort('nome')}
                                        >
                                            <div className="flex items-center gap-2">
                                                {t('Nome')} 
                                                <span className="text-base">{getSortIcon('nome')}</span>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t('Idade')}
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t('RG')}
                                        </th>
                                        <th 
                                            className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={() => handleSort('data_exame')}
                                        >
                                            <div className="flex items-center gap-2">
                                                {t('Data do Exame')} 
                                                <span className="text-base">{getSortIcon('data_exame')}</span>
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={() => handleSort('clinica')}
                                        >
                                            <div className="flex items-center gap-2">
                                                {t('Clínica')} 
                                                <span className="text-base">{getSortIcon('clinica')}</span>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t('Equipe')}
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t('Ações')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {questionnaires.data.map((questionnaire) => (
                                        <tr key={questionnaire.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                                                        <UserIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {questionnaire.nome}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                {questionnaire.idade}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-mono">
                                                {questionnaire.rg}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center">
                                                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                                    {new Date(questionnaire.data_exame).toLocaleDateString('pt-BR')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center">
                                                    <BuildingOfficeIcon className="h-4 w-4 mr-2 text-gray-400" />
                                                    {questionnaire.clinica}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center">
                                                    <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                                                    {questionnaire.team?.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={route('questionnaires.potencial.show', questionnaire.id)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </Link>
                                                    {can.edit && (
                                                        <Link
                                                            href={route('questionnaires.potencial.edit', questionnaire.id)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </Link>
                                                    )}
                                                    {can.delete && (
                                                        <button
                                                            onClick={() => confirmDelete(questionnaire)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Vista de tarjetas para móvil y tablet */}
                        <div className="lg:hidden p-4 space-y-4">
                            {questionnaires.data.map((questionnaire) => (
                                <div 
                                    key={questionnaire.id} 
                                    className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                                >
                                    {/* Header de la tarjeta */}
                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0 h-12 w-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/30">
                                                    <UserIcon className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">
                                                        {questionnaire.nome}
                                                    </h3>
                                                    <p className="text-sm text-indigo-100">
                                                        {questionnaire.idade} {t('anos')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contenido de la tarjeta */}
                                    <div className="p-4 space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    {t('RG')}
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono">
                                                    {questionnaire.rg}
                                                </p>
                                            </div>
                                            
                                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                                    {t('Data do Exame')}
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {new Date(questionnaire.data_exame).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                                                <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                                                {t('Clínica')}
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {questionnaire.clinica}
                                            </p>
                                        </div>

                                        {questionnaire.team?.name && (
                                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                                                    <UserGroupIcon className="h-3 w-3 mr-1" />
                                                    {t('Equipe')}
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {questionnaire.team.name}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer con acciones */}
                                    <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex gap-2">
                                            <Link
                                                href={route('questionnaires.potencial.show', questionnaire.id)}
                                                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                                            >
                                                <EyeIcon className="h-4 w-4 mr-2" />
                                                {t('Ver')}
                                            </Link>
                                            {can.edit && (
                                                <Link
                                                    href={route('questionnaires.potencial.edit', questionnaire.id)}
                                                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors shadow-sm"
                                                >
                                                    <PencilIcon className="h-4 w-4 mr-2" />
                                                    {t('Editar')}
                                                </Link>
                                            )}
                                            {can.delete && (
                                                <button
                                                    onClick={() => confirmDelete(questionnaire)}
                                                    className="inline-flex items-center justify-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mensaje cuando no hay resultados */}
                        {questionnaires.data.length === 0 && (
                            <div className="p-12 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                                    <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                    {t('Nenhum questionário encontrado')}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {t('Tente ajustar os filtros de busca')}
                                </p>
                            </div>
                        )}

                        {/* Paginación mejorada */}
                        {questionnaires.links && questionnaires.data.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-900/50 px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
                                        <span className="font-medium">{questionnaires.from}</span>
                                        {' '}-{' '}
                                        <span className="font-medium">{questionnaires.to}</span>
                                        {' '}{t('de')}{' '}
                                        <span className="font-medium">{questionnaires.total}</span>
                                        {' '}{t('resultados')}
                                    </div>
                                    <div className="flex justify-center sm:justify-end gap-1 flex-wrap">
                                        {questionnaires.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                                    link.active
                                                        ? 'bg-indigo-600 text-white shadow-lg scale-105'
                                                        : link.url
                                                        ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 hover:shadow-md'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de confirmação de exclusão */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {t('Confirmar Exclusão')}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {t('Tem certeza que deseja excluir este questionário? Esta ação não pode ser desfeita.')}
                    </p>
                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}>
                            {t('Cancelar')}
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete}>
                            {t('Excluir')}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
