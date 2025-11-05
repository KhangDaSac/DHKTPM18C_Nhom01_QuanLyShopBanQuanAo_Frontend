// src/utils/format.utils.ts
/**
 * Format utilities
 */

export const formatCurrency = (amount: number, currency: string = 'VND'): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

export const formatPrice = (price: number): string => {
    return `${price.toLocaleString('vi-VN')} đ`;
};

export const formatDate = (date: string | Date, format: string = 'DD/MM/YYYY'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year.toString())
    .replace('HH', String(d.getHours()).padStart(2, '0'))
    .replace('mm', String(d.getMinutes()).padStart(2, '0'));
};

export const formatPhoneNumber = (phone: string): string => {
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
};

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};