import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { compressImage } from '@/Utils/imageCompression';

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
    const inputRef = useRef(null);
    const [previews, setPreviews] = useState([]);
    const [busy, setBusy] = useState(false);

    // Genera y limpia las URLs de vista previa de los archivos nuevos.
    useEffect(() => {
        const urls = files.map((f) => URL.createObjectURL(f));
        setPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [files]);

    const total = existing.length + files.length;
    const remaining = Math.max(0, max - total);

    const handleSelect = async (e) => {
        const selected = Array.from(e.target.files || []);
        if (inputRef.current) inputRef.current.value = '';
        if (selected.length === 0 || remaining === 0) return;

        setBusy(true);
        try {
            const toAdd = selected.slice(0, remaining);
            const compressed = await Promise.all(
                toAdd.map((f) =>
                    compressImage(f).catch(() => f) // si falla la compresión, usa el original
                )
            );
            onFilesChange([...files, ...compressed]);
        } finally {
            setBusy(false);
        }
    };

    const removeNew = (index) => {
        onFilesChange(files.filter((_, i) => i !== index));
    };

    const deleteExisting = (attachmentId) => {
        router.delete(route('attachments.destroy', attachmentId), { preserveScroll: true });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                <span className="text-xs text-gray-500 dark:text-gray-400">{total} / {max}</span>
            </div>

            {(existing.length > 0 || previews.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-3">
                    {existing.map((a) => (
                        <div key={`e-${a.id}`} className="relative">
                            <a href={a.url} target="_blank" rel="noreferrer">
                                <img
                                    src={a.url}
                                    alt={a.original_name || 'anexo'}
                                    className="h-24 w-full object-cover rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm"
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
                            <span className="absolute bottom-1 left-1 bg-indigo-600 text-white text-[10px] px-1 rounded">nova</span>
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
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={busy}
                        onChange={handleSelect}
                        className="w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300 disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {busy
                            ? 'Processando imagens...'
                            : `Pode escolher da câmera, galeria ou arquivos. Faltam ${remaining}.`}
                    </p>
                </>
            )}

            {!readOnly && remaining === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Máximo de {max} imagens atingido.</p>
            )}

            {readOnly && existing.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma imagem.</p>
            )}
        </div>
    );
}
