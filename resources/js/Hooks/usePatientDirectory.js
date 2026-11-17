import { useEffect, useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { questionnaireCatalog } from '@/Components/AdminShell/catalog';
import { clinicalRecord, groupPatients } from '@/Utils/patients/groupPatients';

export default function usePatientDirectory() {
    const page = usePage();
    const { auth, currentTeam, accessibleModules = [], needsTeamSelection } = page.props;
    const scope = `${auth.user.id}:${currentTeam?.id || ''}:${[...accessibleModules].sort().join(',')}`;
    const [revision, setRevision] = useState(0);
    const [state, setState] = useState({ scope, records: [], loading: true, completed: 0, errors: [], createKeys: [] });
    useEffect(() => {
        const controller = new AbortController();
        const modules = questionnaireCatalog.filter(module => accessibleModules.includes(module.key));
        setState({ scope, records: [], loading: !!currentTeam && !needsTeamSelection && modules.length > 0, completed: 0, errors: [], createKeys: [] });
        if (!currentTeam || needsTeamSelection || !modules.length) return () => controller.abort();
        let next = 0;
        let reloadingVersion = false;
        const update = fn => { if (!controller.signal.aborted) setState(previous => previous.scope === scope ? fn(previous) : previous); };
        const worker = async () => {
            while (next < modules.length && !controller.signal.aborted) {
                const module = modules[next++];
                try {
                    let currentPage = 1;
                    while (!controller.signal.aborted) {
                        const response = await axios.get(route(`questionnaires.${module.slug}.index`), {
                            params: { directory: true, page: currentPage, sort: 'created_at', direction: 'desc' },
                            headers: { 'X-Inertia': 'true', 'X-Inertia-Partial-Component': module.component, 'X-Inertia-Partial-Data': 'questionnaires', ...(page.version ? { 'X-Inertia-Version': page.version } : {}), Accept: 'application/json' },
                            signal: controller.signal,
                        });
                        const pagination = response.data?.props?.questionnaires;
                        if (!Array.isArray(pagination?.data)) throw new Error('Resposta indisponível');
                        const records = pagination.data.map(row => clinicalRecord(row, module));
                        update(previous => ({ ...previous, records: [...previous.records, ...records] }));
                        if (currentPage >= (pagination.last_page || 1)) break;
                        currentPage += 1;
                    }
                } catch (error) {
                    if (!controller.signal.aborted && error.response?.status === 409 && error.response?.headers?.['x-inertia-location']) {
                        if (!reloadingVersion) { reloadingVersion = true; window.location.reload(); }
                        return;
                    }
                    if (!controller.signal.aborted) update(previous => ({ ...previous, errors: [...previous.errors, module.label] }));
                } finally { update(previous => ({ ...previous, completed: previous.completed + 1 })); }
            }
        };
        Promise.all(Array.from({ length: Math.min(3, modules.length) }, worker)).then(() => update(previous => ({ ...previous, loading: false })));
        return () => controller.abort();
    }, [scope, revision, needsTeamSelection, page.version]);
    const records = state.scope === scope ? state.records : [];
    const patients = useMemo(() => groupPatients(records), [records]);
    return { patients, records, loading: state.scope !== scope || state.loading, errors: state.scope === scope ? state.errors : [], reload: () => setRevision(previous => previous + 1), createModules: questionnaireCatalog.filter(module => state.scope === scope && state.createKeys.includes(module.key)), scope };
}
