// src/utils/validation.utils.ts
/**
 * Validation utilities
 */

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
        return { valid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Mật khẩu phải có ít nhất 1 chữ hoa' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Mật khẩu phải có ít nhất 1 chữ thường' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Mật khẩu phải có ít nhất 1 số' };
    }
    return { valid: true };
};

export const validateVietnameseName = (name: string): boolean => {
    const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
    return nameRegex.test(name);
};

export const validateUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};