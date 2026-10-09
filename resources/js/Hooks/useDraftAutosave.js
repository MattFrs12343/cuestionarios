import { useCallback, useEffect, useRef, useState } from "react";
import { usePage } from "@inertiajs/react";

const TTL_MS = 30 * 24 * 60 * 60 * 1000;

function isFileLike(v) {
    return v instanceof File || v instanceof Blob;
}

function buildSerializable(data, extra = null) {
    const filesMeta = { anexos: 0, pedido_medico: false };

    const clean = (val) => {
        if (val === null || val === undefined) return val;
        if (isFileLike(val)) return undefined;
        if (Array.isArray(val)) {
            return val.map((x) => clean(x)).filter((x) => x !== undefined);
        }
        if (typeof val === "object") {
            const out = {};
            Object.keys(val).forEach((k) => {
                const c = clean(val[k]);
                if (c !== undefined) out[k] = c;
            });
            return out;
        }
        return val;
    };

    const cleanedData = clean(data) || {};

    if (data) {
        if (Array.isArray(data.anexos)) {
            filesMeta.anexos = data.anexos.filter((f) => isFileLike(f)).length;
        }
        if (isFileLike(data.pedido_medico)) {
            filesMeta.pedido_medico = true;
        }
    }

    const payload = {
        v: 1,
        savedAt: new Date().toISOString(),
        serverUpdatedAt: null,
        filesMeta,
        data: cleanedData,
    };

    if (extra && typeof extra === "object") {
        const cleanedExtra = clean(extra);
        if (cleanedExtra && Object.keys(cleanedExtra).length > 0) {
            payload.extra = cleanedExtra;
        }
    }

    return payload;
}

function removeDraft(key) {
    if (!key || typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(key);
    } catch {}
}

function readDraft(key) {
    if (!key || typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.v !== 1 || !parsed.savedAt) {
            removeDraft(key);
            return null;
        }
        const savedAt = new Date(parsed.savedAt).getTime();
        if (Number.isNaN(savedAt) || Date.now() - savedAt > TTL_MS) {
            removeDraft(key);
            return null;
        }
        return parsed;
    } catch {
        removeDraft(key);
        return null;
    }
}

function writeDraft(key, payload) {
    if (!key || typeof window === "undefined") return;
    try {
        window.localStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {
        console.warn("No se pudo guardar el borrador local:", e);
    }
}

function isEqual(a, b) {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return false;
    }
}

export default function useDraftAutosave({
    key,
    data,
    extra = null,
    enabled = true,
    version = null,
    debounceMs = 800,
}) {
    const page = usePage();
    const user = page.props?.auth?.user;
    const currentTeam = page.props?.currentTeam;
    const timerRef = useRef(null);
    const initialDataRef = useRef(null);
    const pendingRef = useRef(null);
    const [pendingDraft, setPendingDraft] = useState(null);

    const userId = user?.id ?? "anon";
    const teamId = currentTeam?.id ?? "noteam";

    const draftKey = key
        ? `draft:${userId}:${teamId}:${key.type}:${key.mode}:${key.id ?? "new"}`
        : null;

    const hadFiles = pendingDraft?.filesMeta
        ? pendingDraft.filesMeta.anexos > 0 || pendingDraft.filesMeta.pedido_medico
        : false;

    const serverNewer = pendingDraft && version
        ? pendingDraft.serverUpdatedAt !== null &&
          pendingDraft.serverUpdatedAt !== undefined &&
          String(pendingDraft.serverUpdatedAt) !== String(version)
        : false;

    const lastSavedAt = pendingDraft?.savedAt || null;

    useEffect(() => {
        if (data && initialDataRef.current === null) {
            initialDataRef.current = data;
        }
    }, [data]);

    useEffect(() => {
        if (!draftKey) return;
        const d = readDraft(draftKey);
        if (d) {
            if (version !== undefined && version !== null) {
                d.serverUpdatedAt = d.serverUpdatedAt ?? version;
            }
            setPendingDraft(d);
            pendingRef.current = d;
        } else {
            setPendingDraft(null);
            pendingRef.current = null;
        }
    }, [draftKey, version]);

    const flush = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (!draftKey || !enabled || !data) return;
        const initial = initialDataRef.current || {};
        if (isEqual(data, initial) && !extra) return;
        const payload = buildSerializable(data, extra);
        if (version !== undefined && version !== null) {
            payload.serverUpdatedAt = String(version);
        } else if (pendingRef.current?.serverUpdatedAt) {
            payload.serverUpdatedAt = pendingRef.current.serverUpdatedAt;
        }
        writeDraft(draftKey, payload);
        pendingRef.current = payload;
    }, [draftKey, enabled, data, extra, version]);

    useEffect(() => {
        if (!draftKey || !enabled || !data) return;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(flush, debounceMs);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [draftKey, enabled, data, extra, debounceMs, flush]);

    const flushRef = useRef(flush);

    useEffect(() => {
        flushRef.current = flush;
    }, [flush]);

    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === "hidden") flushRef.current();
        };
        const handlePageHide = () => flushRef.current();
        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("pagehide", handlePageHide);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("pagehide", handlePageHide);
        };
    }, []);

    const restoreDraft = useCallback(() => {
        if (!pendingDraft) return null;
        const d = pendingDraft.data || {};
        setPendingDraft(null);
        pendingRef.current = null;
        removeDraft(draftKey);
        return d;
    }, [pendingDraft, draftKey]);

    const discardDraft = useCallback(() => {
        removeDraft(draftKey);
        pendingRef.current = null;
        setPendingDraft(null);
    }, [draftKey]);

    const clear = useCallback(() => {
        removeDraft(draftKey);
        pendingRef.current = null;
        setPendingDraft(null);
    }, [draftKey]);

    return {
        pendingDraft,
        restoreDraft,
        discardDraft,
        clear,
        lastSavedAt,
        hadFiles,
        serverNewer,
        draftKey,
    };
}