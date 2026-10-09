
export default function DraftRestoreBanner({ draft, onRestore, onDiscard }) {
    if (!draft || !draft.pendingDraft) return null;

    const savedAt = draft.pendingDraft.savedAt
        ? new Date(draft.pendingDraft.savedAt).toLocaleString('pt-BR')
        : '';

    const hasFiles = draft.hadFiles;
    const serverNewer = draft.serverNewer;

    return (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="font-semibold">Rascunho encontrado</p>
                    <p className="mt-1 text-xs sm:text-sm opacity-90">
                        {savedAt && `Salvo em ${savedAt}. `}
                        {hasFiles && 'Arquivos/anexos não serão restaurados - será necessário anexá-los novamente.'}
                        {serverNewer && 'O servidor tem uma versão mais recente deste registro.'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            const restored = draft.restoreDraft();
                            if (restored && onRestore) onRestore(restored);
                        }}
                        className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-700 sm:text-sm"
                    >
                        Continuar de onde parei
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            draft.discardDraft();
                            if (onDiscard) onDiscard();
                        }}
                        className="inline-flex items-center justify-center rounded-lg bg-white/80 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-white sm:text-sm dark:bg-zinc-700 dark:text-amber-100 dark:hover:bg-zinc-600"
                    >
                        Descartar
                    </button>
                </div>
            </div>
        </div>
    );
}
