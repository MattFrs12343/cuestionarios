import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { compressImage } from '@/Utils/imageCompression';
import ImageEditorModal from '@/Components/ImageEditorModal';

/**
 * Campo de "Escoger archivo" que permite hasta `max` imágenes.
 * En el celular el selector nativo ofrece cámara o galería; en la computadora, archivos.
 *
 * Props:
 *  - type:         slug del tipo de cuestionario (para borrar anexos ya guardados)
 *  - id:           id del cuestionario (null en creación)
 *  - files:        File[] pendientes de enviar (normalmente data.anexos)
 *  - onFilesChange:(File[]) => void   sincroniza con el formulario (setData('anexos', ...))
 *  - existing:     anexos ya guardados [{ id, url, original_name }] (en edición)
 *  - max:          máximo total permitido (default 5)
 *  - readOnly:     si true, solo muestra la galería (para la pantalla de detalle)
 *  - label:        etiqueta del campo
 */
export default function AnexosUploader({
    type,
    id = null,
    files = [],
    onFilesChange = () => {},
    existing = [],
    max = 5,
    readOnly = false,
    label = 'Imagens (máx. 5)',
}) {
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    const [previews, setPreviews] = useState([]);
    const [busy, setBusy] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editingUrl, setEditingUrl] = useState(null);
    const [editingFile, setEditingFile] = useState(null);
    const [editIndex, setEditIndex] = useState(-1);

    // Genera y limpia las URLs de vista previa de los archivos nuevos.
    useEffect(() => {
        const urls = files.map((f) => URL.createObjectURL(f));
        setPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [files]);

    const total = existing.length + files.length;
    const remaining = Math.max(0, max - total);

    const openEditorForFile = (file, index = -1) => {
        const url = URL.createObjectURL(file);
        setEditingFile(file);
        setEditingUrl(url);
        setEditIndex(index);
        setIsEditing(true);
    };

    const queueRef = useRef([]);

    const advanceQueue = () => {
        if (queueRef.current.length === 0) return false;
        const next = queueRef.current.shift();
        openEditorForFile(next, -1);
        return true;
    };

    const handleSelect = (e) => {
        const selected = Array.from(e.target.files || []);
        if (cameraInputRef.current) cameraInputRef.current.value = '';
        if (galleryInputRef.current) galleryInputRef.current.value = '';
        if (selected.length === 0 || remaining === 0) return;

        const toAdd = selected.slice(0, remaining);

        if (toAdd.length === 1) {
            queueRef.current = [];
            openEditorForFile(toAdd[0], -1);
            return;
        }

        // Varias imágenes: se editan una por una, en cola.
        queueRef.current = toAdd.slice(1);
        openEditorForFile(toAdd[0], -1);
    };

    const handleEditorApply = async (croppedFile) => {
        if (editingUrl) URL.revokeObjectURL(editingUrl);
        setIsEditing(false);
        setEditingUrl(null);
        setEditingFile(null);

        setBusy(true);
        try {
            const compressed = await compressImage(croppedFile).catch(() => croppedFile);
            if (editIndex >= 0) {
                const updated = [...files];
                updated[editIndex] = compressed;
                onFilesChange(updated);
                setEditIndex(-1);
                return;
            }
            onFilesChange([...files, compressed]);
            if (advanceQueue()) return;
        } finally {
            setBusy(false);
        }
    };

    const handleEditorSkip = async () => {
        if (editingUrl) URL.revokeObjectURL(editingUrl);
        setIsEditing(false);
        setEditingUrl(null);

        if (editIndex >= 0) {
            setEditIndex(-1);
            return;
        }

        if (editingFile) {
            setBusy(true);
            try {
                const compressed = await compressImage(editingFile).catch(() => editingFile);
                onFilesChange([...files, compressed]);
            } finally {
                setBusy(false);
                setEditingFile(null);
            }
            advanceQueue();
        } else {
            setEditingFile(null);
        }
    };

    const handleEditorClose = () => {
        if (editingUrl) URL.revokeObjectURL(editingUrl);
        queueRef.current = [];
        setIsEditing(false);
        setEditingUrl(null);
        setEditingFile(null);
        setEditIndex(-1);
    };

    const removeNew = (index) => {
        onFilesChange(files.filter((_, i) => i !== index));
    };

    const editNew = (index) => {
        if (files[index]) {
            openEditorForFile(files[index], index);
        }
    };

    const deleteExisting = (attachmentId) => {
        router.delete(route('attachments.destroy', attachmentId), { preserveScroll: true });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">{label}</label>
                <span className="text-xs text-gray-500 dark:text-zinc-400">{total} / {max}</span>
            </div>

            {(existing.length > 0 || previews.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-3">
                    {existing.map((a) => (
                        <div key={`e-${a.id}`} className="relative">
                            <a href={a.url} target="_blank" rel="noreferrer">
                                <img
                                    src={a.url}
                                    alt={a.original_name || 'anexo'}
                                    className="h-24 w-full object-cover rounded-lg border border-gray-300 dark:border-zinc-500 shadow-sm"
                                />
                            </a>
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => deleteExisting(a.id)}
                                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow"
                                    title="Excluir imagem"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                    {!readOnly && previews.map((url, i) => (
                        <div key={`n-${i}`} className="relative">
                            <img
                                src={url}
                                alt={`nova ${i + 1}`}
                                className="h-24 w-full object-cover rounded-lg border border-indigo-300 dark:border-indigo-600 shadow-sm"
                            />
                            <span className="absolute bottom-1 left-1 bg-indigo-600 text-white text-[10px] px-1 rounded">
                                nova
                            </span>
                            <button
                                type="button"
                                onClick={() => editNew(i)}
                                className="absolute bottom-1 right-1 bg-sky-600 hover:bg-sky-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow"
                                title="Editar imagem"
                            >
                                ✎
                            </button>
                            <button
                                type="button"
                                onClick={() => removeNew(i)}
                                className="absolute top-1 right-1 bg-red-500 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow"
                                title="Remover"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {!readOnly && remaining > 0 && (
                <>
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleSelect}
                        className="hidden"
                    />
                    <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleSelect}
                        className="hidden"
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => cameraInputRef.current?.click()}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            Tomar foto
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => galleryInputRef.current?.click()}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800 disabled:opacity-50 transition-colors border border-indigo-200 dark:border-indigo-700"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            Elegir de galería/archivos
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2">
                        {busy
                            ? 'Processando imagens...'
                            : `Faltam ${remaining}. Puedes editar cada imagen opcionalmente antes de enviar.`}
                    </p>
                </>
            )}

            {!readOnly && remaining === 0 && (
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                    Máximo de {max} imagens atingido.
                </p>
            )}

            {readOnly && existing.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-zinc-400">Nenhuma imagem.</p>
            )}

            <ImageEditorModal
                isOpen={isEditing}
                imageSrc={editingUrl}
                onClose={handleEditorClose}
                onApply={handleEditorApply}
                onSkip={handleEditorSkip}
            />
        </div>
    );
}
