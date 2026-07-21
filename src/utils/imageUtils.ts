/**
 * Utilidades para manejo de imágenes de productos
 * Soporta múltiples formatos: JPG, JPEG, PNG, GIF, WEBP, SVG, BMP, ICO
 */

export interface ImageData {
    base64: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
}

// Clave para almacenar imágenes en localStorage
const IMAGES_STORAGE_KEY = 'productImages';

/**
 * Rechaza rutas sin nombre de archivo real (p. ej. ../assets/toWEBP/.webp cuando falta el código de barras).
 */
export function hasValidImageFilename(path: string): boolean {
    const trimmed = path.trim();
    if (!trimmed) return false;
    const lower = trimmed.toLowerCase();
    if (lower.startsWith('data:image/')) return true;
    if (lower.startsWith('http://') || lower.startsWith('https://')) return true;
    const withoutQuery = trimmed.split('?')[0];
    const parts = withoutQuery.split('/').filter(Boolean);
    const last = parts[parts.length - 1] ?? '';
    if (!last) return false;
    if (/^\.[a-z0-9]{2,5}$/i.test(last)) return false;
    return true;
}

/**
 * Formatos de imagen permitidos
 */
export const ALLOWED_IMAGE_FORMATS = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/x-icon'
];

/**
 * Extensiones de archivo permitidas
 */
export const ALLOWED_EXTENSIONS = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.svg',
    '.bmp',
    '.ico'
];

/**
 * Tamaño máximo de archivo (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Valida si un archivo es una imagen válida
 */
export function isValidImageFile(file: File): { valid: boolean; error?: string } {
    // Validar tipo MIME
    if (!ALLOWED_IMAGE_FORMATS.includes(file.type)) {
        return {
            valid: false,
            error: `Formato no permitido. Formatos soportados: ${ALLOWED_EXTENSIONS.join(', ').toUpperCase()}`
        };
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        };
    }

    return { valid: true };
}

/**
 * Convierte un archivo a base64
 */
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Error al leer el archivo'));
            }
        };
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsDataURL(file);
    });
}

/**
 * Guarda una imagen asociada a un producto
 */
export function saveProductImage(productId: string | number, imageData: ImageData): void {
    try {
        const images = getAllProductImages();
        images[String(productId)] = {
            ...imageData,
            uploadedAt: new Date().toISOString()
        };
        localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(images));
    } catch (error) {
        console.error('Error al guardar imagen:', error);
        throw new Error('No se pudo guardar la imagen');
    }
}

/**
 * Obtiene la imagen de un producto
 */
export function getProductImage(productId: string | number): ImageData | null {
    try {
        const images = getAllProductImages();
        return images[String(productId)] || null;
    } catch (error) {
        console.error('Error al obtener imagen:', error);
        return null;
    }
}

/**
 * Obtiene todas las imágenes de productos
 */
export function getAllProductImages(): Record<string, ImageData> {
    try {
        const stored = localStorage.getItem(IMAGES_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error('Error al obtener imágenes:', error);
        return {};
    }
}

/**
 * Elimina la imagen de un producto
 */
export function removeProductImage(productId: string | number): void {
    try {
        const images = getAllProductImages();
        delete images[String(productId)];
        localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(images));
    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        throw new Error('No se pudo eliminar la imagen');
    }
}

/**
 * Obtiene la URL de imagen para un producto (prioriza imágenes cargadas, luego la del JSON)
 */
export function getProductImageUrl(productId: string | number, defaultImage?: string): string {
    // Primero intentar obtener imagen cargada
    const uploadedImage = getProductImage(productId);
    if (uploadedImage?.base64) {
        return uploadedImage.base64;
    }

    // Si no hay imagen cargada, usar la del JSON
    if (defaultImage && hasValidImageFilename(defaultImage)) {
        // Normalizar ruta relativa
        if (defaultImage.startsWith('../')) {
            return defaultImage.replace('../', '/');
        }
        if (!defaultImage.startsWith('/') && !defaultImage.startsWith('http')) {
            return '/' + defaultImage;
        }
        return defaultImage;
    }

    // Imagen por defecto (placeholder)
    return 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'140\'%3E%3Crect width=\'120\' height=\'140\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23999\' font-size=\'12\'%3ESin imagen%3C/text%3E%3C/svg%3E';
}

/**
 * Redimensiona una imagen manteniendo calidad alta
 * @param file - Archivo de imagen original
 * @param maxWidth - Ancho máximo (default 800)
 * @param maxHeight - Alto máximo (default 800)
 * @param quality - Calidad JPEG/WebP (0.85 = 85%)
 * @returns Promise con base64 de imagen redimensionada
 */
export function resizeImage(
    file: File,
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.85
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            let { width, height } = img;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('No se pudo crear contexto Canvas'));
                return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            const base64 = canvas.toDataURL(outputType, quality);
            resolve(base64);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Error al cargar imagen para redimensionar'));
        };

        img.src = url;
    });
}

/**
 * Valida si una URL es una imagen válida
 */
export function isValidImageUrl(url: string): boolean {
    if (!url) return false;
    
    const lowerUrl = url.toLowerCase();
    
    // Base64
    if (lowerUrl.startsWith('data:image/')) return true;
    
    // URL completa
    if (lowerUrl.startsWith('http://') || lowerUrl.startsWith('https://')) return true;
    
    // Verificar extensión
    return ALLOWED_EXTENSIONS.some(ext => lowerUrl.includes(ext));
}

