import { useState, useRef, useEffect } from 'react';

export default function ImageZoomModal({ isOpen, onClose, imageSrc, imageAlt = 'Imagem' }) {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    // Reset zoom y posición cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            setZoom(1);
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen]);

    // Cerrar con ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.5, 5));
    };

    const handleZoomOut = () => {
        setZoom(prev => {
            const newZoom = Math.max(prev - 0.5, 0.5);
            if (newZoom <= 1) {
                setPosition({ x: 0, y: 0 });
            }
            return newZoom;
        });
    };

    const handleReset = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e) => {
        if (zoom > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && zoom > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e) => {
        if (zoom > 1 && e.touches.length === 1) {
            setIsDragging(true);
            setDragStart({ 
                x: e.touches[0].clientX - position.x, 
                y: e.touches[0].clientY - position.y 
            });
        }
    };

    const handleTouchMove = (e) => {
        if (isDragging && zoom > 1 && e.touches.length === 1) {
            setPosition({
                x: e.touches[0].clientX - dragStart.x,
                y: e.touches[0].clientY - dragStart.y
            });
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const handleWheel = (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            handleZoomIn();
        } else {
            handleZoomOut();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={onClose}
        >
            {/* Controles superiores */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-2 bg-black/50 rounded-lg p-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
                        className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                        title="Diminuir zoom"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                        </svg>
                    </button>
                    <span className="text-white font-medium px-2 min-w-[60px] text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
                        className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                        title="Aumentar zoom"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleReset(); }}
                        className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors ml-2"
                        title="Resetar zoom"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
                
                <button
                    onClick={onClose}
                    className="p-2 text-white bg-black/50 hover:bg-white/20 rounded-lg transition-colors"
                    title="Fechar"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Contenedor de imagen */}
            <div 
                ref={containerRef}
                className="w-full h-full flex items-center justify-center overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
                style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
                <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="max-w-none select-none"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                        maxHeight: zoom === 1 ? '90vh' : 'none',
                        maxWidth: zoom === 1 ? '90vw' : 'none',
                    }}
                    draggable={false}
                />
            </div>

            {/* Instrucciones */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-sm px-4 py-2 rounded-lg">
                Use a roda do mouse ou os botões para zoom • Arraste para mover quando ampliado
            </div>
        </div>
    );
}