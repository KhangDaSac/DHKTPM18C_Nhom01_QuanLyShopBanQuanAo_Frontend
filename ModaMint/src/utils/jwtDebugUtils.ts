/**
 * JWT Token Debug Utility
 * Utility để debug và kiểm tra JWT token
 */

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

        const payload = parts[1];
        const paddedPayload = payload.padEnd(payload.length + (4 - payload.length % 4) % 4, '=');
        const decodedPayload = atob(paddedPayload);
        const parsedPayload = JSON.parse(decodedPayload);

        const currentTime = Math.floor(Date.now() / 1000);
        const isExpired = parsedPayload.exp ? parsedPayload.exp < currentTime : true;

        // Extract roles
        let roles: string[] = [];
        if (parsedPayload.scope && typeof parsedPayload.scope === 'string') {
            roles = parsedPayload.scope.split(' ').filter((role: string) => role.trim() !== '');
        } else if (parsedPayload.roles && Array.isArray(parsedPayload.roles)) {
            roles = parsedPayload.roles;
        } else if (parsedPayload.authorities && Array.isArray(parsedPayload.authorities)) {
            roles = parsedPayload.authorities;
        } else if (parsedPayload.scp && Array.isArray(parsedPayload.scp)) {
            roles = parsedPayload.scp;
        }

        return {
            isValid: true,
            isExpired,
            payload: parsedPayload,
            roles,
            userInfo: {
                id: parsedPayload.sub,
                username: parsedPayload.username || parsedPayload.preferred_username,
                email: parsedPayload.email
            },
            expirationDate: parsedPayload.exp ? new Date(parsedPayload.exp * 1000) : undefined,
            issuedAt: parsedPayload.iat ? new Date(parsedPayload.iat * 1000) : undefined
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
