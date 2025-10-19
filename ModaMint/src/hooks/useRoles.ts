import { useAuth } from '../contexts/authContext';
import { ROLES } from '../utils/apiAuthUtils';

/**
 * Custom hook để kiểm tra roles và permissions
 * Hệ thống chỉ có 2 roles: ADMIN và USER
 */
export const useRoles = () => {
    const { roles, hasRole, hasAnyRole, hasAllRoles } = useAuth();

    return {
        // Các roles hiện tại của user
        userRoles: roles,

        // Kiểm tra role cụ thể
        hasRole,
        hasAnyRole,
        hasAllRoles,

        // Helper functions cho 2 roles
        isAdmin: () => hasRole(ROLES.ADMIN),
        isUser: () => hasRole(ROLES.USER),

        // Kiểm tra đã authenticated (có USER hoặc ADMIN)
        isAuthenticated: () => hasAnyRole([ROLES.USER, ROLES.ADMIN]),

        // Kiểm tra roles custom
        canAccess: (requiredRoles: string[], requireAll = false) => {
            return requireAll ? hasAllRoles(requiredRoles) : hasAnyRole(requiredRoles);
        }
    };
};

/**
 * Custom hook để kiểm tra permissions cho các tính năng cụ thể
 * Chỉ có 2 roles: ADMIN và USER
 */
export const usePermissions = () => {
    const { hasRole, hasAnyRole } = useAuth();

    return {
        // Dashboard - Chỉ ADMIN
        canAccessDashboard: () => hasRole(ROLES.ADMIN),

        // Admin features - Chỉ ADMIN
        canManageProducts: () => hasRole(ROLES.ADMIN),
        canManageCategories: () => hasRole(ROLES.ADMIN),
        canManageOrders: () => hasRole(ROLES.ADMIN),
        canManageUsers: () => hasRole(ROLES.ADMIN),
        canManagePromotions: () => hasRole(ROLES.ADMIN),
        canManageStores: () => hasRole(ROLES.ADMIN),
        canViewAnalytics: () => hasRole(ROLES.ADMIN),
        canManageSettings: () => hasRole(ROLES.ADMIN),

        // User features - USER hoặc ADMIN (đã authenticated)
        canEditProfile: () => hasAnyRole([ROLES.USER, ROLES.ADMIN]),
        canViewOrders: () => hasAnyRole([ROLES.USER, ROLES.ADMIN]),
        canPlaceOrder: () => hasAnyRole([ROLES.USER, ROLES.ADMIN]),

        // Custom permission check
        checkPermission: (permission: string) => {
            return hasRole(permission);
        }
    };
};