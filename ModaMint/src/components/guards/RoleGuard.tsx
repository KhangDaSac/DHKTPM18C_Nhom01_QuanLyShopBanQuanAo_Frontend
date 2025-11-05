import React from 'react';
import { useAuth } from '@/contexts/authContext';

/**
 * RoleGuard Component
 * 
 * Component HOC để render conditionally dựa trên roles
 * 
 * @example
 * // Chỉ ADMIN mới thấy
 * <RoleGuard requiredRoles={['ADMIN']}>
 *   <AdminContent />
 * </RoleGuard>
 * 
 * @example
 * // ADMIN hoặc MANAGER
 * <RoleGuard requiredRoles={['ADMIN', 'MANAGER']}>
 *   <ManagerContent />
 * </RoleGuard>
 * 
 * @example
 * // Cần cả ADMIN và SUPER_ADMIN
 * <RoleGuard requiredRoles={['ADMIN', 'SUPER_ADMIN']} requireAll>
 *   <SuperAdminContent />
 * </RoleGuard>
 * 
 * @example
 * // Với fallback
 * <RoleGuard 
 *   requiredRoles={['ADMIN']} 
 *   fallback={<p>Bạn không có quyền xem phần này</p>}
 * >
 *   <AdminContent />
 * </RoleGuard>
 */

interface RoleGuardProps {
    /** Nội dung sẽ render nếu có quyền */
    children: React.ReactNode;
    
    /** Danh sách roles cần thiết */
    requiredRoles?: string[];
    
    /** 
     * true: Cần tất cả roles trong requiredRoles
     * false: Chỉ cần ít nhất 1 role (default)
     */
    requireAll?: boolean;
    
    /** Nội dung hiển thị nếu không có quyền (mặc định: null) */
    fallback?: React.ReactNode;
    
    /** 
     * Nếu true, sẽ render children cho tất cả user authenticated
     * Không quan tâm đến roles (mặc định: false)
     */
    onlyCheckAuth?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
    children,
    requiredRoles = [],
    requireAll = false,
    fallback = null,
    onlyCheckAuth = false
}) => {
    const { isAuthenticated, hasAnyRole, hasAllRoles } = useAuth();

    // Nếu chỉ check authentication
    if (onlyCheckAuth) {
        return isAuthenticated ? <>{children}</> : <>{fallback}</>;
    }

    // Nếu không yêu cầu roles cụ thể, render children
    if (requiredRoles.length === 0) {
        return <>{children}</>;
    }

    // Kiểm tra roles
    const hasPermission = requireAll
        ? hasAllRoles(requiredRoles)
        : hasAnyRole(requiredRoles);

    if (!hasPermission) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

/**
 * AdminOnly Component
 * Shorthand cho admin-only content
 */
export const AdminOnly: React.FC<{
    children: React.ReactNode;
    fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => (
    <RoleGuard requiredRoles={['ADMIN']} fallback={fallback}>
        {children}
    </RoleGuard>
);

/**
 * UserOnly Component
 * Shorthand cho user-only content (USER hoặc ADMIN đã authenticated)
 */
export const UserOnly: React.FC<{
    children: React.ReactNode;
    fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => (
    <RoleGuard 
        requiredRoles={['USER', 'ADMIN']} 
        fallback={fallback}
    >
        {children}
    </RoleGuard>
);

/**
 * AuthenticatedOnly Component
 * Chỉ check authentication, không check roles
 */
export const AuthenticatedOnly: React.FC<{
    children: React.ReactNode;
    fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => (
    <RoleGuard onlyCheckAuth fallback={fallback}>
        {children}
    </RoleGuard>
);

export default RoleGuard;

