import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { formatDateShort } from '@/Utils/dateFormatter';
import { useTranslation } from '@/Hooks/useTranslation';

export default function ElectroencefalogramaIndex({
    auth,
    questionnaires = { data: [], links: [] },
    teams = [],
    currentTeam = null,
    filters = {},
    can = {}
}) {
    const { t } = useTranslation();

    // Calcular estadísticas
    const stats = useMemo(() => {
        const data = questionnaires.data || [];
        const today = new Date();
        const thisMonth = data.filter(q => {
            const examDate = new Date(q.data_exame);
            return examDate.getMonth() === today.getMonth() &&
                examDate.getFullYear() === today.getFullYear();
        }).length;

        const uniqueClinics = new Set(data.map(q => q.clinica)).size;

        return {
            total: questionnaires.total || 0,
            thisMonth,
            clinics: uniqueClinics,
            teams: teams.length
        };
    }, [questionnaires, teams]);
    const [search, setSearch] = useState(() => {
        try {
            return (filters && typeof filters.search === 'string') ? filters.search : '';
        } catch (e) {
            return '';
        }
    });
    const [dateFrom, setDateFrom] = useState(() => {
        try {
            return (filters && typeof filters.date_from === 'string') ? filters.date_from : '';
        } catch (e) {
            return '';
        }
    });
    const [dateTo, setDateTo] = useState(() => {
        try {
            return (filters && typeof filters.date_to === 'string') ? filters.date_to : '';
        } catch (e) {
            return '';
        }
    });
    const [selectedTeam, setSelectedTeam] = useState(() => {
        try {
            return (filters && filters.team_id) ? String(filters.team_id) : '';
        } catch (e) {
            return '';
        }
    });
    const [selectedClinica, setSelectedClinica] = useState(() => {
        try {
            return (filters && typeof filters.clinica === 'string') ? filters.clinica : '';
        } catch (e) {
            return '';
        }
    });
    const [sortField, setSortField] = useState(() => {
        try {
            return (filters && typeof filters.sort === 'string') ? filters.sort : '';
        } catch (e) {
            return '';
        }
    });
    const [sortDirection, setSortDirection] = useState(() => {
        try {
            return (filters && typeof filters.direction === 'string') ? filters.direction : 'desc';
        } catch (e) {
            return 'desc';
        }
    });

    const handleSearch = () => {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (selectedTeam) params.team_id = selectedTeam;
        if (selectedClinica.trim()) params.clinica = selectedClinica.trim();
        if (sortField) params.sort = sortField;
        if (sortDirection) params.direction = sortDirection;

        router.get(route('questionnaires.electroencefalograma.index'), params, {
            preserveState: true,
            replace: true
        });
    };

    const clearFilters = () => {
        setSearch('');
        setDateFrom('');
        setDateTo('');
        setSelectedTeam('');
        setSelectedClinica('');
        setSortField('');
        setSortDirection('desc');
        router.get(route('questionnaires.electroencefalograma.index'));
    };

    const handleSort = (field) => {
        let direction = 'asc';

        // Si ya estamos ordenando por este campo, cambiar dirección
        if (sortField === field && sortDirection === 'asc') {
            direction = 'desc';
        }

        setSortField(field);
        setSortDirection(direction);

        // Aplicar ordenamiento inmediatamente
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (selectedTeam) params.team_id = selectedTeam;
        if (selectedClinica.trim()) params.clinica = selectedClinica.trim();
        params.sort = field;
        params.direction = direction;

        router.get(route('questionnaires.electroencefalograma.index'), params, {
            preserveState: true,
            replace: true
        });
    };

    const deleteQuestionnaire = (questionnaire) => {
        if (confirm(t('questionnaires.confirm_delete'))) {
            router.delete(route('questionnaires.electroencefalograma.destroy', questionnaire.id));
        }
    };

    // Componente para cabeceras ordenables
    const SortableHeader = ({ field, children, className = "" }) => {
        const isActive = sortField === field;
        const isAsc = isActive && sortDirection === 'asc';
        const isDesc = isActive && sortDirection === 'desc';

        return (
            <th
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 ${className}`}
                onClick={() => handleSort(field)}
            >
                <div className="flex items-center space-x-1">
                    <span>{children}</span>
                    <div className="flex flex-col">
                        <svg
                            className={`w-3 h-3 ${isAsc ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <svg
                            className={`w-3 h-3 -mt-1 ${isDesc ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </th>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                                Eletroencefalograma
                            </h2>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Gestão de Exames Neurológicos
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('questionnaires.index')}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar
                    </Link>
                </div>
            }
        >
            <Head title="Eletroencefalograma" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Cards de Estatísticas */}
                    {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 dark:from-cyan-600 dark:to-cyan-700 rounded-xl shadow-lg p-5 text-white transform hover:scale-105 transition-transform duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-cyan-100 text-xs font-medium uppercase tracking-wide">Total de Exames</p>
                                    <p className="text-3xl font-bold mt-2">{stats.total}</p>
                                </div>
                                <div className="bg-white/20 rounded-lg p-3">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700 rounded-xl shadow-lg p-5 text-white transform hover:scale-105 transition-transform duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-teal-100 text-xs font-medium uppercase tracking-wide">Este Mês</p>
                                    <p className="text-3xl font-bold mt-2">{stats.thisMonth}</p>
                                </div>
                                <div className="bg-white/20 rounded-lg p-3">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-lg p-5 text-white transform hover:scale-105 transition-transform duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-xs font-medium uppercase tracking-wide">Clínicas</p>
                                    <p className="text-3xl font-bold mt-2">{stats.clinics}</p>
                                </div>
                                <div className="bg-white/20 rounded-lg p-3">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-xl shadow-lg p-5 text-white transform hover:scale-105 transition-transform duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-indigo-100 text-xs font-medium uppercase tracking-wide">Equipes</p>
                                    <p className="text-3xl font-bold mt-2">{stats.teams}</p>
                                </div>
                                <div className="bg-white/20 rounded-lg p-3">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div> */}

                    {/* Contenedor Principal */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl transition-colors duration-200">
                        <div className="p-6">
                            {/* Header com botão criar */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                                        <span className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full mr-3"></span>
                                        Questionários de EEG
                                    </h3>
                                    {currentTeam ? (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-4">
                                            <span className="inline-flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                Equipe: <span className="font-semibold ml-1">{currentTeam.name}</span>
                                            </span>
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-4">
                                            <span className="inline-flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                Mostrando: <span className="font-semibold ml-1">Todas as equipes</span>
                                            </span>
                                        </p>
                                    )}
                                </div>
                                {can.create && (
                                    <Link
                                        href={route('questionnaires.electroencefalograma.create')}
                                        className="inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 hover:from-cyan-600 hover:to-blue-700 dark:hover:from-cyan-700 dark:hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Novo Questionário
                                    </Link>
                                )}
                            </div>

                            {/* Filtros */}
                            <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm transition-colors duration-200">
                                <div className="flex items-center mb-4">
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Filtros de Busca</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                    <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 md:hidden">
                                            Buscar
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Buscar por nome ou RG..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 text-sm transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 md:hidden">
                                            Data Inicial
                                        </label>
                                        <input
                                            type="date"
                                            placeholder="Data inicial"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 text-sm transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 md:hidden">
                                            Data Final
                                        </label>
                                        <input
                                            type="date"
                                            placeholder="Data final"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 text-sm transition-colors"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 md:hidden">
                                            Equipe
                                        </label>
                                        <select
                                            value={selectedTeam}
                                            onChange={(e) => setSelectedTeam(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 text-sm transition-colors"
                                        >
                                            <option value="">Todas as equipes</option>
                                            {teams && teams.map(team => (
                                                <option key={team.id} value={team.id}>{team.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 md:hidden">
                                            Clínica
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Filtrar por clínica..."
                                            value={selectedClinica}
                                            onChange={(e) => setSelectedClinica(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 text-sm transition-colors"
                                        />
                                    </div>
                                    <div className="flex gap-2 sm:col-span-2 md:col-span-1 lg:col-span-1">
                                        <button
                                            onClick={handleSearch}
                                            className="flex-1 px-4 py-2 bg-purple-500 dark:bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-600 dark:hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 transition-colors duration-200"
                                        >
                                            Buscar
                                        </button>
                                        <button
                                            onClick={clearFilters}
                                            className="flex-1 px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-600 transition-colors duration-200"
                                        >
                                            Limpar
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Vista de Cards (Mobile) */}
                            <div className="block md:hidden space-y-4">
                                {questionnaires.data && questionnaires.data.length > 0 ? (
                                    questionnaires.data.map((questionnaire) => (
                                        <div
                                            key={questionnaire.id}
                                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:hover:shadow-gray-900/70 transition-all duration-200"
                                        >
                                            <div className="p-4">
                                                {/* Header do Card */}
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                            {questionnaire.nome_completo}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            {questionnaire.sexo} - {questionnaire.data_nascimento ? formatDateShort(questionnaire.data_nascimento) : 'Não especificada'}
                                                        </p>
                                                    </div>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                                                        {questionnaire.team?.name}
                                                    </span>
                                                </div>

                                                {/* Informações do Card */}
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center text-sm">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Clínica:</span>
                                                        <span className="text-gray-900 dark:text-gray-100">{questionnaire.clinica}</span>
                                                    </div>
                                                    <div className="flex items-center text-sm">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300 w-24">RG:</span>
                                                        <span className="text-gray-900 dark:text-gray-100">{questionnaire.rg_ou_cpf}</span>
                                                    </div>
                                                    <div className="flex items-center text-sm">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300 w-24">Data Exame:</span>
                                                        <span className="text-gray-900 dark:text-gray-100">{formatDateShort(questionnaire.data_exame)}</span>
                                                    </div>
                                                </div>

                                                {/* Ações do Card */}
                                                <div className="flex justify-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                    <Link
                                                        href={route('questionnaires.electroencefalograma.show', questionnaire.id)}
                                                        className="flex items-center justify-center w-10 h-10 bg-indigo-600 dark:bg-indigo-700 text-white rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors duration-200"
                                                        title="Ver questionário"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Link>
                                                    {can.edit && (
                                                        <Link
                                                            href={route('questionnaires.electroencefalograma.edit', questionnaire.id)}
                                                            className="flex items-center justify-center w-10 h-10 bg-purple-600 dark:bg-purple-700 text-white rounded-full hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors duration-200"
                                                            title="Editar questionário"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </Link>
                                                    )}
                                                    {can.delete && (
                                                        <button
                                                            onClick={() => deleteQuestionnaire(questionnaire)}
                                                            className="flex items-center justify-center w-10 h-10 bg-red-600 dark:bg-red-700 text-white rounded-full hover:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200"
                                                            title="Excluir questionário"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        Não há questionários registrados
                                    </div>
                                )}
                            </div>

                            {/* Vista de Tabela (Tablet y Desktop) */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <SortableHeader field="nome">
                                                Paciente
                                            </SortableHeader>
                                            <SortableHeader field="clinica">
                                                Clínica
                                            </SortableHeader>
                                            <SortableHeader field="rg">
                                                RG
                                            </SortableHeader>
                                            <SortableHeader field="data_exame">
                                                Data Exame
                                            </SortableHeader>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Equipe
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {questionnaires.data && questionnaires.data.length > 0 ? (
                                            questionnaires.data.map((questionnaire, index) => (
                                                <tr key={questionnaire.id} className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/10 dark:hover:to-indigo-900/10 transition-all duration-200 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-700/50'}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                    {questionnaire.nome_completo}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {questionnaire.sexo} • {questionnaire.data_nascimento ? formatDateShort(questionnaire.data_nascimento) : 'Não especificada'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                                                            <svg className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                            <span className="font-medium">{questionnaire.clinica}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                                                            {questionnaire.rg_ou_cpf}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                                                            <svg className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="font-medium">{formatDateShort(questionnaire.data_exame)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 shadow-sm">
                                                            <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            </svg>
                                                            {questionnaire.team?.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                href={route('questionnaires.electroencefalograma.show', questionnaire.id)}
                                                                className="inline-flex items-center justify-center w-9 h-9 text-indigo-600 dark:text-indigo-400 hover:text-white bg-indigo-50 dark:bg-indigo-900/20 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-110"
                                                                title="Ver questionário"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </Link>
                                                            {can.edit && (
                                                                <Link
                                                                    href={route('questionnaires.electroencefalograma.edit', questionnaire.id)}
                                                                    className="inline-flex items-center justify-center w-9 h-9 text-blue-600 dark:text-blue-400 hover:text-white bg-blue-50 dark:bg-blue-900/20 hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-110"
                                                                    title="Editar questionário"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </Link>
                                                            )}
                                                            {can.delete && (
                                                                <button
                                                                    onClick={() => deleteQuestionnaire(questionnaire)}
                                                                    className="inline-flex items-center justify-center w-9 h-9 text-red-600 dark:text-red-400 hover:text-white bg-red-50 dark:bg-red-900/20 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-110"
                                                                    title="Excluir questionário"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-16 text-center">
                                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full mb-3">
                                                        <svg className="w-8 h-8 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                                        Nenhum questionário encontrado
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Não há questionários registrados com os filtros atuais.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginação */}
                            {questionnaires.links && questionnaires.links.length > 3 && (
                                <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                        <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 text-center sm:text-left">
                                            <svg className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span>
                                                Mostrando <span className="font-bold text-purple-600 dark:text-purple-400">{questionnaires.from || 0}</span> a <span className="font-bold text-purple-600 dark:text-purple-400">{questionnaires.to || 0}</span> de <span className="font-bold text-purple-600 dark:text-purple-400">{questionnaires.total || 0}</span> resultados
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-1">
                                            {questionnaires.links.map((link, index) => {
                                                if (!link.url) {
                                                    return (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-500 rounded-lg cursor-not-allowed"
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    );
                                                }

                                                // Construir URL con filtros preservados
                                                const handlePaginationClick = (e) => {
                                                    e.preventDefault();
                                                    
                                                    // Extraer la página de la URL del link
                                                    const url = new URL(link.url);
                                                    const page = url.searchParams.get('page');
                                                    
                                                    // Construir parámetros con filtros actuales
                                                    const params = {};
                                                    if (page) params.page = page;
                                                    if (search.trim()) params.search = search.trim();
                                                    if (dateFrom) params.date_from = dateFrom;
                                                    if (dateTo) params.date_to = dateTo;
                                                    if (selectedTeam) params.team_id = selectedTeam;
                                                    if (selectedClinica.trim()) params.clinica = selectedClinica.trim();
                                                    if (sortField) params.sort = sortField;
                                                    if (sortDirection) params.direction = sortDirection;

                                                    router.get(route('questionnaires.electroencefalograma.index'), params, {
                                                        preserveState: true,
                                                        replace: true
                                                    });
                                                };

                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={handlePaginationClick}
                                                        className={`inline-flex items-center px-4 py-2 text-sm font-medium border rounded-lg transition-all duration-200 shadow-sm hover:shadow ${link.active
                                                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 text-white border-purple-500 dark:border-purple-600 shadow-md'
                                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                                                            }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}