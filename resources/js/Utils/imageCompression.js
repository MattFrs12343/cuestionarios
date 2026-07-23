/**
 * Utilidad para comprimir imágenes en el frontend
 * Reduce el tamaño de las imágenes manteniendo calidad aceptable
 */

/**
 * Comprime una imagen File/Blob
 * @param {File|Blob} file - Archivo de imagen a comprimir
 * @param {Object} options - Opciones de compresión
 * @param {number} options.maxWidth - Ancho máximo (default: 1920)
 * @param {number} options.maxHeight - Alto máximo (default: 1080)
 * @param {number} options.quality - Calidad JPEG (0.1-1.0, default: 0.8)
 * @param {string} options.outputFormat - Formato de salida ('image/jpeg', 'image/webp', default: 'image/jpeg')
 * @returns {Promise<File>} - Archivo comprimido
 */
export function compressImage(file, options = {}) {
    return new Promise((resolve, reject) => {
        const {
            maxWidth = 1920,
            maxHeight = 1080,
            quality = 0.8,
            outputFormat = 'image/jpeg'
        } = options;

        // Verificar si es una imagen
        if (!file.type.startsWith('image/')) {
            reject(new Error('El archivo debe ser una imagen'));
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calcular nuevas dimensiones manteniendo proporción
            let { width, height } = img;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            // Configurar canvas
            canvas.width = width;
            canvas.height = height;

            // Dibujar imagen redimensionada
            ctx.drawImage(img, 0, 0, width, height);

            // Convertir a blob comprimido
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Error al comprimir la imagen'));
                        return;
                    }

                    // Crear nuevo File con el mismo nombre pero comprimido
                    const compressedFile = new File(
                        [blob], 
                        file.name.replace(/\.[^/.]+$/, '') + getExtensionForFormat(outputFormat),
                        {
                            type: outputFormat,
                            lastModified: Date.now()
                        }
                    );

                    resolve(compressedFile);
                },
                outputFormat,
                quality
            );
        };

        img.onerror = () => {
            reject(new Error('Error al cargar la imagen'));
        };

        // Cargar imagen
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Comprime múltiples imágenes
 * @param {FileList|File[]} files - Lista de archivos
 * @param {Object} options - Opciones de compresión
 * @returns {Promise<File[]>} - Array de archivos comprimidos
 */
export function compressImages(files, options = {}) {
    const fileArray = Array.from(files);
    const compressionPromises = fileArray.map(file => compressImage(file, options));
    return Promise.all(compressionPromises);
}

/**
 * Obtiene la extensión de archivo para un formato MIME
 * @param {string} format - Formato MIME
 * @returns {string} - Extensión con punto
 */
function getExtensionForFormat(format) {
    switch (format) {
        case 'image/jpeg':
            return '.jpg';
        case 'image/webp':
            return '.webp';
        case 'image/png':
            return '.png';
        default:
            return '.jpg';
    }
}

/**
 * Calcula el porcentaje de compresión logrado
 * @param {number} originalSize - Tamaño original en bytes
 * @param {number} compressedSize - Tamaño comprimido en bytes
 * @returns {number} - Porcentaje de reducción
 */
export function getCompressionRatio(originalSize, compressedSize) {
    return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}

/**
 * Formatea el tamaño de archivo en formato legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} - Tamaño formateado (ej: "1.5 MB")
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}