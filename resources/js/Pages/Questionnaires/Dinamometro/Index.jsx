import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { formatDateShort } from '@/Utils/dateFormatter';

export default function DinamometroIndex({
    auth,
    questionnaires = { data: [], links: [] },
    teams = [],
    currentTeam = null,
    filters = {},
    can = {}
}) {
    const stats = useMemo(() => {
        const data = questionnaires.data || [];
        const today = new Date();
        const thisMonth = data.filter(q => {
            const examDate = new Date(q.data_exame);
            return examDate.getMonth() === today.getMonth() && examDate.getFullYear() === today.getFullYear();
        }).length;
        return { total: questionnaires.total || 0, thisMonth, teams: teams.length };
    }, [questionnaires, teams]);

    const [search, setSearch] = useState(() => (filters && typeof filters.search === 'string') ? filters.search : '');
    const [dateFrom, setDateFrom] = useState(() => (filters && typeof filters.date_from === 'string') ? filters.date_from : '');
    const [dateTo, setDateTo] = useState(() => (filters && typeof filters.date_to === 'string') ? filters.date_to : '');
    const [clinica, setClinica] = useState(() => (filters && typeof filters.clinica === 'string') ? filters.clinica : '');
    const [selectedTeam, setSelectedTeam] = useState(() => (filters && filters.team_id) ? String(filters.team_id) : '');
    const [sortField, setSortField] = useState(() => (filters && typeof filters.sort === 'string') ? filters.sort : '');
    const [sortDirection, setSortDirection] = useState(() => (filters && typeof filters.direction === 'string') ? filters.direction : 'desc');

    const buildParams = () => {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (clinica.trim()) params.clinica = clinica.trim();
        if (selectedTeam) params.team_id = selectedTeam;
        if (sortField) params.sort = sortField;
        if (sortDirection) params.direction = sortDirection;
        return params;
    };

    const handleSearch = () => {
        router.get(route('questionnaires.dinamometro.index'), buildParams(), { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearch(''); setDateFrom(''); setDateTo(''); setClinica(''); setSelectedTeam(''); setSortField(''); setSortDirection('desc');
        router.get(route('questionnaires.dinamometro.index'));
    };

    const handleSort = (field) => {
        let direction = 'asc';
        if (sortField === field && sortDirection === 'asc') direction = 'desc';
        setSortField(field);
        setSortDirection(direction);
        const params = buildParams();
        params.sort = field;
        params.direction = direction;
        router.get(route('questionnaires.dinamometro.index'), params, { preserveState: true, replace: true });
    };

    const deleteQuestionnaire = (questionnaire) => {
        if (confirm('Tem certeza que deseja excluir este questionário?')) {
            router.delete(route('questionnaires.dinamometro.destroy', questionnaire.id));
        }
    };

    const SortableHeader = ({ field, children }) => {
        const isActive = sortField === field;
        return (
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200" onClick={() => handleSort(field)}>
                <div className="flex items-center space-x-1">
                    <span>{children}</span>
                    <div className="flex flex-col">
                        <svg className={`w-3 h-3 ${isActive && sortDirection === 'asc' ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                        <svg className={`w-3 h-3 -mt-1 ${isActive && sortDirection === 'desc' ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
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
                        <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5a6 6 0 1112 0V14m-12-2.5V9a1.5 1.5 0 013 0v1.5m0 0V9a1.5 1.5 0 013 0v1.5m0 0V9a1.5 1.5 0 013 0v3.5M7 14v3a4 4 0 004 4h1a4 4 0 004-4v-3" /></svg>
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">Dinamômetro</h2>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Força de Preensão Manual</p>
                        </div>
                    </div>
                    <Link href={route('questionnaires.index')} className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Voltar
                    </Link>
                </div>
            }
        >
            <Head title="Dinamômetro" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-violet-500 to-violet-600 dark:from-violet-600 dark:to-violet-700 rounded-xl shadow-lg p-5 text-white transform hover:scale-105 transition-transform duration-200">
                            <p className="text-violet-100 text-xs font-medium uppercase tracking-wide">Total de Exames</p>
                            <p className="text-3xl font-bold mt-2">{stats.total}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl shadow-lg p-5 text-white transform hover:scale-105 transition-transform duration-200">
                            <p className="text-purple-100 text-xs font-medium uppercase tracking-wide">Este Mês</p>
                            <p className="text-3xl font-bold mt-2">{stats.thisMonth}</p>
                        </div>
                        <div className="bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 dark:from-fuchsia-600 dark:to-fuchsia-700 rounded-xl shadow-lg p-5 text-white transform hover:scale-105 transition-transform duration-200">
                            <p className="text-fuchsia-100 text-xs font-medium uppercase tracking-wide">Equipes</p>
                            <p className="text-3xl font-bold mt-2">{stats.teams}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl transition-colors duration-200">
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                                        <span className="w-1 h-8 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full mr-3"></span>
                                        Questionários de Dinamômetro
                                    </h3>
                                    {currentTeam ? (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-4">Equipe: <span className="font-semibold">{currentTeam.name}</span></p>
                                    ) : (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-4">Mostrando: <span className="font-semibold">Todas as equipes</span></p>
                                    )}
                                </div>
                                {can.create && (
                                    <Link href={route('questionnaires.dinamometro.create')} className="inline-flex items-center justify-center bg-gradient-to-r from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 hover:from-violet-600 hover:to-purple-700 dark:hover:from-violet-700 dark:hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        Novo Questionário
                                    </Link>
                                )}
                            </div>

                            <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm transition-colors duration-200">
                                <div className="flex items-center mb-4">
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Filtros de Busca</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                    <input type="text" placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-600 text-sm transition-colors" />
                                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-600 text-sm transition-colors" />
                                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-600 text-sm transition-colors" />
                                    <input type="text" placeholder="Buscar por clínica..." value={clinica} onChange={(e) => setClinica(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-600 text-sm transition-colors" />
                                    <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-600 text-sm transition-colors">
                                        <option value="">Todas as equipes</option>
                                        {teams && teams.map(team => (<option key={team.id} value={team.id}>{team.name}</option>))}
                                    </select>
                                    <div className="flex gap-2">
                                        <button onClick={handleSearch} className="flex-1 px-4 py-2 bg-violet-500 dark:bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-600 dark:hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-600 transition-colors duration-200">Buscar</button>
                                        <button onClick={clearFilters} className="flex-1 px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-600 transition-colors duration-200">Limpar</button>
                                    </div>
                                </div>
                            </div>

                            {/* Vista de Cards (Mobile) */}
                            <div className="block md:hidden space-y-4">
                                {questionnaires.data && questionnaires.data.length > 0 ? (
                                    questionnaires.data.map((questionnaire) => (
                                        <div key={questionnaire.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:hover:shadow-gray-900/70 transition-all duration-200">
                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{questionnaire.nome_completo}</h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{questionnaire.sexo} - {questionnaire.data_nascimento ? formatDateShort(questionnaire.data_nascimento) : 'Não especificada'}</p>
                                                    </div>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200">
                                                        {questionnaire.classificacao || 'Sem classificação'}
                                                    </span>
                                                </div>
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center text-sm"><span className="font-medium text-gray-700 dark:text-gray-300 w-24">Data Exame:</span><span className="text-gray-900 dark:text-gray-100">{formatDateShort(questionnaire.data_exame)}</span></div>
                                                    <div className="flex items-center text-sm"><span className="font-medium text-gray-700 dark:text-gray-300 w-24">Clínica:</span><span className="text-gray-900 dark:text-gray-100">{questionnaire.clinica || '-'}</span></div>
                                                </div>
                                                <div className="flex justify-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                    <Link href={route('questionnaires.dinamometro.show', questionnaire.id)} className="flex items-center justify-center w-10 h-10 bg-indigo-600 dark:bg-indigo-700 text-white rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors duration-200" title="Ver questionário">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </Link>
                                                    {can.edit && (
                                                        <Link href={route('questionnaires.dinamometro.edit', questionnaire.id)} className="flex items-center justify-center w-10 h-10 bg-purple-600 dark:bg-purple-700 text-white rounded-full hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors duration-200" title="Editar questionário">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </Link>
                                                    )}
                                                    {can.delete && (
                                                        <button onClick={() => deleteQuestionnaire(questionnaire)} className="flex items-center justify-center w-10 h-10 bg-red-600 dark:bg-red-700 text-white rounded-full hover:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200" title="Excluir questionário">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">Não há questionários registrados</div>
                                )}
                            </div>

                            {/* Vista de Tabela (Tablet e Desktop) */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <SortableHeader field="nome_completo">Paciente</SortableHeader>
                                            <SortableHeader field="data_exame">Data Exame</SortableHeader>
                                            <SortableHeader field="clinica">Clínica</SortableHeader>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Classificação</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Equipe</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {questionnaires.data && questionnaires.data.length > 0 ? (
                                            questionnaires.data.map((questionnaire, index) => (
                                                <tr key={questionnaire.id} className={`hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:from-violet-900/10 dark:hover:to-purple-900/10 transition-all duration-200 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-850'}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{questionnaire.nome_completo}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{questionnaire.sexo} • {questionnaire.data_nascimento ? formatDateShort(questionnaire.data_nascimento) : 'Não especificada'}</div>
                                                    </td>
                                                    <td className="px-6 py-4"><span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDateShort(questionnaire.data_exame)}</span></td>
                                                    <td className="px-6 py-4"><span className="text-sm text-gray-600 dark:text-gray-300">{questionnaire.clinica || '-'}</span></td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-violet-100 to-purple-200 dark:from-violet-900 dark:to-purple-800 text-violet-800 dark:text-violet-200 border border-violet-200 dark:border-violet-700 shadow-sm">
                                                            {questionnaire.classificacao || 'Sem classificação'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 shadow-sm">
                                                            {questionnaire.team?.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <Link href={route('questionnaires.dinamometro.show', questionnaire.id)} className="inline-flex items-center justify-center w-9 h-9 text-indigo-600 dark:text-indigo-400 hover:text-white bg-indigo-50 dark:bg-indigo-900/20 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-110" title="Ver questionário">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                            </Link>
                                                            {can.edit && (
                                                                <Link href={route('questionnaires.dinamometro.edit', questionnaire.id)} className="inline-flex items-center justify-center w-9 h-9 text-blue-600 dark:text-blue-400 hover:text-white bg-blue-50 dark:bg-blue-900/20 hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-110" title="Editar questionário">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                </Link>
                                                            )}
                                                            {can.delete && (
                                                                <button onClick={() => deleteQuestionnaire(questionnaire)} className="inline-flex items-center justify-center w-9 h-9 text-red-600 dark:text-red-400 hover:text-white bg-red-50 dark:bg-red-900/20 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-110" title="Excluir questionário">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="6" className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">Nenhum questionário encontrado com os filtros atuais.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {questionnaires.links && questionnaires.links.length > 3 && (
                                <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                        <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 text-center sm:text-left">
                                            Mostrando <span className="font-bold text-violet-600 dark:text-violet-400 mx-1">{questionnaires.from || 0}</span> a <span className="font-bold text-violet-600 dark:text-violet-400 mx-1">{questionnaires.to || 0}</span> de <span className="font-bold text-violet-600 dark:text-violet-400 mx-1">{questionnaires.total || 0}</span> resultados
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-1">
                                            {questionnaires.links.map((link, index) => {
                                                if (!link.url) {
                                                    return (<span key={index} className="inline-flex items-center px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-500 rounded-lg cursor-not-allowed" dangerouslySetInnerHTML={{ __html: link.label }} />);
                                                }
                                                const handlePaginationClick = (e) => {
                                                    e.preventDefault();
                                                    const url = new URL(link.url);
                                                    const page = url.searchParams.get('page');
                                                    const params = buildParams();
                                                    if (page) params.page = page;
                                                    router.get(route('questionnaires.dinamometro.index'), params, { preserveState: true, replace: true });
                                                };
                                                return (<button key={index} onClick={handlePaginationClick} className={`inline-flex items-center px-4 py-2 text-sm font-medium border rounded-lg transition-all duration-200 shadow-sm hover:shadow ${link.active ? 'bg-gradient-to-r from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 text-white border-violet-500 dark:border-violet-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-violet-300 dark:hover:border-violet-600'}`} dangerouslySetInnerHTML={{ __html: link.label }} />);
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
