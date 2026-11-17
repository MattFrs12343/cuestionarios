import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import ShellIcon from './ShellIcon';

export default function GlobalPatientSearch({ teamId }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [active, setActive] = useState(-1);
    const wrapper = useRef(null);
    useEffect(() => { setQuery(''); setResults([]); setOpen(false); }, [teamId]);
    useEffect(() => {
        const controller = new AbortController();
        if (query.trim().length < 2) { setResults([]); setLoading(false); return () => controller.abort(); }
        const timer = setTimeout(async () => {
            setLoading(true); setError(false);
            try { const response = await axios.get(route('search'), { params: { q: query.trim() }, signal: controller.signal }); setResults(response.data.results || []); setActive(-1); }
            catch (failure) { if (!controller.signal.aborted) { setResults([]); setError(true); } }
            finally { if (!controller.signal.aborted) setLoading(false); }
        }, 300);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [query, teamId]);
    useEffect(() => {
        const close = event => { if (!wrapper.current?.contains(event.target)) setOpen(false); };
        document.addEventListener('pointerdown', close); return () => document.removeEventListener('pointerdown', close);
    }, []);
    const choose = result => { setOpen(false); setQuery(''); router.visit(result.url); };
    return <div ref={wrapper} className="relative hidden w-full max-w-sm md:block">
        <div className="pointer-events-none absolute left-3 top-2.5 text-gray-400"><ShellIcon name="search" className="h-4 w-4" /></div>
        <input role="combobox" aria-label="Busca global de pacientes" aria-expanded={open && query.trim().length >= 2} aria-controls="global-patient-results" aria-autocomplete="list" value={query} onFocus={() => setOpen(true)} onChange={event => { setQuery(event.target.value); setOpen(true); }} onKeyDown={event => {
            if (event.key === 'Escape') setOpen(false);
            if (event.key === 'ArrowDown') { event.preventDefault(); setActive(index => Math.min(index + 1, results.length - 1)); }
            if (event.key === 'ArrowUp') { event.preventDefault(); setActive(index => Math.max(index - 1, 0)); }
            if (event.key === 'Enter' && results[active]) { event.preventDefault(); choose(results[active]); }
        }} placeholder="Buscar paciente nos questionários..." className="h-10 w-full rounded border-gray-200 bg-gray-50 pl-9 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100" />
        {open && query.trim().length >= 2 && <div id="global-patient-results" role="listbox" aria-label="Resultados da busca" className="absolute left-0 right-0 top-12 z-50 max-h-96 overflow-y-auto rounded border border-gray-200 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-800">
            {loading ? <p className="p-4 text-sm text-gray-500">Buscando...</p> : error ? <p role="alert" className="p-4 text-sm text-red-600">Não foi possível buscar. Tente novamente.</p> : results.length ? results.map((result, index) => <button key={`${result.url}-${index}`} type="button" role="option" aria-selected={index === active} onClick={() => choose(result)} className={`block w-full border-b border-gray-100 px-4 py-3 text-left last:border-0 dark:border-zinc-700 ${index === active ? 'bg-blue-50 dark:bg-zinc-700' : 'hover:bg-gray-50 dark:hover:bg-zinc-700'}`}><span className="block truncate text-sm font-semibold text-gray-800 dark:text-zinc-100">{result.nome}</span><span className="mt-1 block text-xs text-gray-500 dark:text-zinc-400">{result.tipo} · {result.data_exame}</span></button>) : <p className="p-4 text-sm text-gray-500">Nenhum questionário encontrado.</p>}
        </div>}
    </div>;
}
