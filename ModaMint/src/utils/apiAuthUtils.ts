/**
 * Auth & JWT Utilities - Complete JWT and Auth management
 */

// ==================== JWT INTERFACES & TYPES ====================
export interface JwtPayload {
    sub: string;
    iat: number;
    exp: number;
    scope?: string;
    username?: string;
    email?: string;
    roles?: string[];
    [key: string]: any;
}

export interface TokenDebugInfo {
    isValid: boolean;
    isExpired: boolean;
    payload: any;
    roles: string[];
    userInfo: {
        id?: string;
        username?: string;
        email?: string;
    };
    expirationDate?: Date;
    issuedAt?: Date;
}

// ==================== JWT DECODING ====================
/**
 * Decode JWT token (không verify signature)
 */
function decodeJWT(token: string): JwtPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = parts[1];
        const paddedPayload = payload.padEnd(payload.length + (4 - payload.length % 4) % 4, '=');
        const decodedPayload = atob(paddedPayload);
        
        return JSON.parse(decodedPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

/**
 * Lấy roles từ JWT token
 */
export function getRolesFromToken(token: string): string[] {
    const payload = decodeJWT(token);
    if (!payload) return [];

    if (payload.scope && typeof payload.scope === 'string') {
        return payload.scope.split(' ').filter(role => role.trim() !== '');
    }
    if (payload.roles && Array.isArray(payload.roles)) return payload.roles;
    if (payload.authorities && Array.isArray(payload.authorities)) return payload.authorities;
    if (payload.scp && Array.isArray(payload.scp)) return payload.scp;

    return [];
}

/**
 * Kiểm tra token có hết hạn không
 */
export function isTokenExpired(token: string): boolean {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
}

/**
 * Lấy thông tin user từ JWT token
 */
export function getUserInfoFromToken(token: string): {
    id?: string;
    username?: string;
    email?: string;
    roles: string[];
} | null {
    const payload = decodeJWT(token);
    if (!payload) return null;

    return {
        id: payload.sub,
        username: payload.username || payload.preferred_username,
        email: payload.email,
        roles: getRolesFromToken(token)
    };
}

// ==================== DEBUG UTILITIES ====================
/**
 * Debug JWT token và trả về thông tin chi tiết
 */
export function debugJWTToken(token: string): TokenDebugInfo {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return {
                isValid: false,
                isExpired: true,
                payload: null,
                roles: [],
                userInfo: {}
            };
        }

        const payload = decodeJWT(token);
        if (!payload) {
            return {
                isValid: false,
                isExpired: true,
                payload: null,
                roles: [],
                userInfo: {}
            };
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp ? payload.exp < currentTime : true;

        return {
            isValid: true,
            isExpired,
            payload,
            roles: getRolesFromToken(token),
            userInfo: {
                id: payload.sub,
                username: payload.username || payload.preferred_username,
                email: payload.email
            },
            expirationDate: payload.exp ? new Date(payload.exp * 1000) : undefined,
            issuedAt: payload.iat ? new Date(payload.iat * 1000) : undefined
        };
    } catch (error) {
        console.error('Error debugging JWT token:', error);
        return {
            isValid: false,
            isExpired: true,
            payload: null,
            roles: [],
            userInfo: {}
        };
    }
}

/**
 * Log JWT token info to console for debugging
 */
export function logJWTTokenInfo(token: string): void {
    const debugInfo = debugJWTToken(token);
    
    console.group('🔍 JWT Token Debug Info');
    console.log('✅ Valid:', debugInfo.isValid);
    console.log('⏰ Expired:', debugInfo.isExpired);
    console.log('👤 User Info:', debugInfo.userInfo);
    console.log('🔑 Roles:', debugInfo.roles);
    console.log('📅 Expiration:', debugInfo.expirationDate);
    console.log('📅 Issued At:', debugInfo.issuedAt);
    console.log('📄 Full Payload:', debugInfo.payload);
    console.groupEnd();
}

// ==================== ROLE CHECKING ====================
/**
 * Lấy roles từ localStorage (decode JWT mỗi lần gọi)
 */
export function getCurrentRoles(): string[] {
    const authDataStr = localStorage.getItem('authData');
    if (!authDataStr) return [];

    try {
        const authData = JSON.parse(authDataStr);
        if (authData.accessToken) {
            return getRolesFromToken(authData.accessToken);
        }
    } catch (error) {
        console.error('Error getting current roles:', error);
    }

    return [];
}

/**
 * Kiểm tra có role cụ thể
 */
export function checkRole(requiredRole: string): boolean {
    return getCurrentRoles().includes(requiredRole);
}

/**
 * Kiểm tra có ít nhất một trong các roles
 */
export function checkAnyRole(requiredRoles: readonly string[]): boolean {
    const roles = getCurrentRoles();
    return requiredRoles.some(role => roles.includes(role));
}

/**
 * Kiểm tra có tất cả các roles
 */
export function checkAllRoles(requiredRoles: readonly string[]): boolean {
    const roles = getCurrentRoles();
    return requiredRoles.every(role => roles.includes(role));
}

/**
 * Check if user has ADMIN role from token
 */
export function hasAdminRoleFromToken(token: string): boolean {
    const debugInfo = debugJWTToken(token);
    return debugInfo.roles.includes('ADMIN');
}

/**
 * Get all available roles from token
 */
export function getAllRolesFromToken(token: string): string[] {
    const debugInfo = debugJWTToken(token);
    return debugInfo.roles;
}

// ==================== API HELPERS ====================
/**
 * Decorator function để bọc API call với role checking
 */
export async function withRoleCheck<T>(
    requiredRoles: readonly string[],
    apiCall: () => Promise<T>,
    errorMessage?: string
): Promise<T> {
    if (!checkAnyRole(requiredRoles)) {
        throw new Error(
            errorMessage || 
            `Bạn không có quyền thực hiện hành động này. Yêu cầu: ${[...requiredRoles].join(', ')}`
        );
    }
    return apiCall();
}

/**
 * Kiểm tra quyền trước khi thực hiện action
 */
export function canPerformAction(requiredRoles: readonly string[]): boolean {
    return checkAnyRole(requiredRoles);
}

// ==================== CONSTANTS ====================
/**
 * Roles constants (chỉ có 2 roles: ADMIN và USER)
 */
export const ROLES = {
    ADMIN: 'ADMIN',
    USER: 'USER',
} as const;

/**
 * Permission groups
 */
export const PERMISSION_GROUPS = {
    ADMIN: ['ADMIN'],
    USER: ['USER', 'ADMIN'],
} as const;

/**
 * API Permissions checker
 */
export const API_PERMISSIONS = {
    accessDashboard: () => checkRole(ROLES.ADMIN),
    getMyInfo: () => checkAnyRole(PERMISSION_GROUPS.USER),
    updateMyProfile: () => checkAnyRole(PERMISSION_GROUPS.USER),
    manageProducts: () => checkRole(ROLES.ADMIN),
    manageCategories: () => checkRole(ROLES.ADMIN),
    manageOrders: () => checkRole(ROLES.ADMIN),
    manageUsers: () => checkRole(ROLES.ADMIN),
    managePromotions: () => checkRole(ROLES.ADMIN),
    manageStores: () => checkRole(ROLES.ADMIN),
    viewAnalytics: () => checkRole(ROLES.ADMIN),
    systemSettings: () => checkRole(ROLES.ADMIN),
} as const;