import { useRef, useEffect, useState, useCallback } from 'react';

export default function SignaturePad({ onSignatureChange, initialSignature = null, className = "" }) {
    const canvasRef = useRef(null);
    const modalCanvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);
    const [currentSignature, setCurrentSignature] = useState(initialSignature);
    const [isMobile, setIsMobile] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Detectar si es dispositivo móvil
    useEffect(() => {
        const checkMobile = () => {
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                || window.innerWidth < 768;
            setIsMobile(isMobileDevice);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Configuración inicial del canvas principal (desktop)
    useEffect(() => {
        if (isMobile) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Configurar canvas
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Configurar estilo de linha
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Carregar assinatura inicial se existir
        if (initialSignature) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                setIsEmpty(false);
                setCurrentSignature(initialSignature);
                onSignatureChange(initialSignature);
            };
            img.src = initialSignature;
        }
    }, [initialSignature, isMobile]);

    // Configuración del canvas del modal
    useEffect(() => {
        if (!isModalOpen || !modalCanvasRef.current) return;

        const canvas = modalCanvasRef.current;
        const ctx = canvas.getContext('2d');

        // Configurar tamaño del canvas para llenar el contenedor
        const container = canvas.parentElement;
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;

        // Configurar estilo
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3; // Línea más gruesa para mejor visibilidad
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Fondo blanco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

    }, [isModalOpen]);

    // Event listeners táctiles para canvas principal (desktop)
    useEffect(() => {
        if (isMobile) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        const handleTouchStart = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            setIsDrawing(true);
            setIsEmpty(false);

            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(x, y);
        };

        const handleTouchMove = (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            ctx.lineTo(x, y);
            ctx.stroke();
        };

        const handleTouchEnd = (e) => {
            e.preventDefault();
            setIsDrawing(false);

            const dataURL = canvas.toDataURL('image/png');
            setCurrentSignature(dataURL);
            onSignatureChange(dataURL);
        };

        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

        return () => {
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isMobile, onSignatureChange]);

    // Event listeners táctiles para modal canvas
    useEffect(() => {
        if (!isModalOpen || !modalCanvasRef.current) return;

        const canvas = modalCanvasRef.current;
        const ctx = canvas.getContext('2d');
        let drawing = false;

        const handleTouchStart = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            drawing = true;

            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(x, y);
        };

        const handleTouchMove = (e) => {
            if (!drawing) return;
            e.preventDefault();
            e.stopPropagation();

            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            ctx.lineTo(x, y);
            ctx.stroke();
        };

        const handleTouchEnd = (e) => {
            e.preventDefault();
            e.stopPropagation();
            drawing = false;
        };

        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

        return () => {
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isModalOpen]);

    // Funciones para dibujo en desktop
    const startDrawing = (e) => {
        if (isMobile) return;

        setIsDrawing(true);
        setIsEmpty(false);
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawing || isMobile) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing || isMobile) return;
        setIsDrawing(false);

        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL('image/png');
        setCurrentSignature(dataURL);
        onSignatureChange(dataURL);
    };

    const clearSignature = () => {
        if (isMobile) {
            setIsEmpty(true);
            setCurrentSignature(null);
            onSignatureChange(null);
        } else {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setIsEmpty(true);
            setCurrentSignature(null);
            onSignatureChange(null);
        }
    };

    const clearModalCanvas = () => {
        if (!modalCanvasRef.current) return;
        const canvas = modalCanvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const confirmModalSignature = () => {
        if (!modalCanvasRef.current) return;

        const canvas = modalCanvasRef.current;
        const dataURL = canvas.toDataURL('image/png');

        setCurrentSignature(dataURL);
        setIsEmpty(false);
        onSignatureChange(dataURL);
        setIsModalOpen(false);
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Renderizado para mobile con modal
    if (isMobile) {
        return (
            <div className={`signature-pad ${className}`}>
                {/* Área de preview / botón para abrir modal */}
                <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 transition-colors duration-200 cursor-pointer"
                    onClick={openModal}
                >
                    {currentSignature ? (
                        <div className="relative">
                            <img
                                src={currentSignature}
                                alt="Assinatura"
                                className="w-full h-32 object-contain bg-white rounded border border-gray-200 dark:border-gray-600"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded opacity-0 hover:opacity-100 active:opacity-100 transition-opacity">
                                <span className="text-white font-medium text-sm bg-black/50 px-3 py-1 rounded-full">
                                    Tocar para editar
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span className="text-sm font-medium">Tocar para assinar</span>
                            <span className="text-xs mt-1 text-gray-400 dark:text-gray-500">Abrirá em tela cheia</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-2">
                    <button
                        type="button"
                        onClick={clearSignature}
                        disabled={isEmpty}
                        className="px-3 py-1 text-sm bg-red-500 dark:bg-red-600 text-white rounded hover:bg-red-600 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Limpar
                    </button>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {isEmpty ? 'Toque acima para assinar' : 'Assinatura capturada ✓'}
                    </span>
                </div>

                {/* Modal Fullscreen */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[9999] bg-black/90 flex flex-col">
                        {/* Header del modal */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                            <h3 className="text-lg font-bold flex items-center">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Assinatura do Paciente
                            </h3>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Instrucciones */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/30 px-4 py-2 text-center">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                👆 Use o dedo para desenhar sua assinatura abaixo
                            </p>
                        </div>

                        {/* Área del canvas */}
                        <div className="flex-1 p-4 bg-gray-100 dark:bg-gray-800">
                            <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-300">
                                <canvas
                                    ref={modalCanvasRef}
                                    className="w-full h-full cursor-crosshair touch-none"
                                    style={{ touchAction: 'none' }}
                                />
                            </div>
                        </div>

                        {/* Footer con botones */}
                        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={clearModalCanvas}
                                    className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Limpar
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmModalSignature}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors flex items-center justify-center shadow-lg"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Renderizado para desktop (sin cambios significativos)
    return (
        <div className={`signature-pad ${className}`}>
            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 transition-colors duration-200">
                <canvas
                    ref={canvasRef}
                    className="w-full h-40 cursor-crosshair touch-none dark:invert"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                />
            </div>
            <div className="flex justify-between items-center mt-2">
                <button
                    type="button"
                    onClick={clearSignature}
                    className="px-3 py-1 text-sm bg-red-500 dark:bg-red-600 text-white rounded hover:bg-red-600 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-600 transition-colors duration-200"
                >
                    Limpar
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {isEmpty ? 'Desenhe sua assinatura acima' : 'Assinatura capturada'}
                </span>
            </div>
        </div>
    );
}
