import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Convert string or Date to Date object
 */
function toDate(date: Date | string): Date | null {
    if (!date) return null;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return isNaN(dateObj.getTime()) ? null : dateObj;
}

/**
 * Format date as relative time (e.g., "hace 2 días")
 */
export function formatRelative(date: Date | string): string {
    const dateObj = toDate(date);
    if (!dateObj) {
        return 'Fecha no disponible';
    }
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: es })
}

/**
 * Format date as long format (e.g., "15 de enero de 2024")
 */
export function formatDate(date: Date | string): string {
    const dateObj = toDate(date);
    if (!dateObj) {
        return 'Fecha no disponible';
    }
    return format(dateObj, "d 'de' MMMM 'de' yyyy", { locale: es })
}

/**
 * Format date with time (e.g., "15/01/2024 14:30")
 */
export function formatDateTime(date: Date | string): string {
    const dateObj = toDate(date);
    if (!dateObj) {
        return 'Fecha no disponible';
    }
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: es })
}

/**
 * Format date as short format (e.g., "15/01/2024")
 */
export function formatShortDate(date: Date | string): string {
    const dateObj = toDate(date);
    if (!dateObj) {
        return 'Fecha no disponible';
    }
    return format(dateObj, 'dd/MM/yyyy', { locale: es })
}
