// src/utils/constants.ts
/**
 * App Constants
 */

export const APP_NAME = 'ModaMint';
export const APP_VERSION = '1.0.0';

export const STORAGE_KEYS = {
    AUTH_DATA: 'authData',
    CART_DATA: 'cartData',
    THEME: 'theme',
} as const;

export const API_TIME_OUT = 10000; // 10 seconds

export const DATE_FORMATS = {
    DISPLAY: 'DD/MM/YYYY',
    DATABASE: 'YYYY-MM-DD',
    DATETIME: 'DD/MM/YYYY HH:mm',
} as const;

export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZES: [10, 20, 50, 100],
} as const;

export const FILE_MAX_SIZE = {
    IMAGE: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
} as const;

export const ALLOWED_FILE_TYPES = {
    IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    DOCUMENT: ['application/pdf', 'application/msword'],
} as const;