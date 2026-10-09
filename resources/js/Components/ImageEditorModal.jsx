import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Cropper from 'react-easy-crop';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = imageSrc;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('No se pudo obtener el contexto del canvas'));
                return;
            }

            const maxSize = Math.max(image.width, image.height);
            const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));
            canvas.width = safeArea;
            canvas.height = safeArea;

            ctx.translate(safeArea / 2, safeArea / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.translate(-safeArea / 2, -safeArea / 2);

            ctx.drawImage(
                image,
                safeArea / 2 - image.width / 2,
                safeArea / 2 - image.height / 2
            );

            const data = ctx.getImageData(0, 0, safeArea, safeArea);
            canvas.width = pixelCrop.width;
            canvas.height = pixelCrop.height;

            ctx.putImageData(
                data,
                Math.round(0 - safeArea / 2 + image.width / 2 - pixelCrop.x),
                Math.round(0 - safeArea / 2 + image.height / 2 - pixelCrop.y)
            );

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Error al generar la imagen recortada'));
                        return;
                    }
                    resolve(blob);
                },
                'image/jpeg',
                0.9
            );
        };
        image.onerror = (err) => reject(err);
    });
}

export default function ImageEditorModal({
    isOpen,
    imageSrc,
    onClose,
    onApply,
    onSkip,
    aspect = null,
}) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [loading, setLoading] = useState(false);
    const closeBtnRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setRotation(0);
            setCroppedAreaPixels(null);
            setLoading(false);
        }
    }, [isOpen]);

    const onCropComplete = useCallback((_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleRotate = useCallback(() => {
        setRotation((prev) => (prev + 90) % 360);
    }, []);

    const handleReset = useCallback(() => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
    }, []);

    const handleApply = useCallback(async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        setLoading(true);
        try {
            const blob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
            const file = new File([blob], 'imagen_editada.jpg', {
                type: 'image/jpeg',
                lastModified: Date.now(),
            });
            onApply(file);
        } catch (error) {
            console.error('Error al recortar imagen:', error);
            onSkip();
        } finally {
            setLoading(false);
        }
    }, [imageSrc, croppedAreaPixels, rotation, onApply, onSkip]);

    const handleSkip = useCallback(() => {
        onSkip();
    }, [onSkip]);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, handleClose]);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[9999]" onClose={handleClose} initialFocus={closeBtnRef}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-90" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full h-[95vh] max-w-5xl transform overflow-hidden rounded-xl bg-zinc-900 text-white shadow-2xl transition-all flex flex-col">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
                                    <Dialog.Title className="text-base sm:text-lg font-semibold">
                                        Editar imagen (opcional)
                                    </Dialog.Title>
                                    <button
                                        ref={closeBtnRef}
                                        type="button"
                                        onClick={handleClose}
                                        className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                                        aria-label="Cerrar"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1 relative bg-black">
                                    {imageSrc && (
                                        <Cropper
                                            image={imageSrc}
                                            crop={crop}
                                            zoom={zoom}
                                            rotation={rotation}
                                            aspect={aspect}
                                            onCropChange={setCrop}
                                            onZoomChange={setZoom}
                                            onRotationChange={setRotation}
                                            onCropComplete={onCropComplete}
                                            restrictPosition={true}
                                            showGrid={true}
                                        />
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-zinc-700 bg-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleRotate}
                                            className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                                        >
                                            <ArrowPathIcon className="w-4 h-4" />
                                            Rotar 90°
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="px-3 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                                        >
                                            Restablecer
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleSkip}
                                            disabled={loading}
                                            className="px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            Usar sin editar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            disabled={loading}
                                            className="px-4 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleApply}
                                            disabled={loading || !croppedAreaPixels}
                                            className="px-4 py-2 text-sm bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Aplicando...' : 'Aplicar recorte'}
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
