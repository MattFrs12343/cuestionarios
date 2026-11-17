export default function ShellIcon({ name, className = 'h-5 w-5', ...props }) {
    const paths = {
        menu: 'M4 6h16M4 12h16M4 18h16',
        patients: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m20 0v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        history: 'M3 12a9 9 0 109-9 9.7 9.7 0 00-6.7 2.7L3 8m0-5v5h5m4 0v4l3 2',
        search: 'm21 21-5-5m2-6a8 8 0 11-16 0 8 8 0 0116 0z',
        close: 'm6 6 12 12M6 18 18 6',
        chevron: 'm9 5 7 7-7 7',
        down: 'm6 9 6 6 6-6',
        plus: 'M12 5v14M5 12h14',
        record: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 3h6v4H9V3zm0 9h6m-6 4h6',
        settings: 'M12 8a4 4 0 100 8 4 4 0 000-8zm-9 4 2-1 .5-2-1-2 2-2 2 1 2-.5L12 3l1 2 2 .5 2-1 2 2-1 2 .5 2 2 1-2 1-.5 2 1 2-2 2-2-1-2 .5-1 2-1-2-2-.5-2 1-2-2 1-2L5 13l-2-1z',
        refresh: 'M20 7v5h-5M4 17v-5h5m-4-3a7 7 0 0112-4l3 3M4 16l3 3a7 7 0 0012-4',
        logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14 5-5-5-5m5 5H9',
        user: 'M20 21v-2a7 7 0 00-14 0v2m11-14a4 4 0 11-8 0 4 4 0 018 0z',
    };
    return <svg {...props} aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name] || paths.record} /></svg>;
}
