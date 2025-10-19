import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { toast } from 'react-toastify';

// Interface cho ProtectedRoute props
interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: string[]; // Roles cần thiết để truy cập
    requireAnyRole?: boolean; // true: cần ít nhất 1 role, false: cần tất cả roles (default: true)
}

// Component để bảo vệ routes yêu cầu đăng nhập và roles
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRoles = [],
    requireAnyRole = true
}) => {
    const { isAuthenticated, hasAnyRole, hasAllRoles } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Chưa đăng nhập -> chuyển đến login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Kiểm tra roles nếu được yêu cầu
    if (requiredRoles.length > 0) {
        const hasPermission = requireAnyRole
            ? hasAnyRole(requiredRoles)
            : hasAllRoles(requiredRoles);

        if (!hasPermission) {
            // Không có quyền truy cập -> hiển thị thông báo và chuyển về trang chủ
            toast.error('Bạn không có quyền truy cập vào trang này!');
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};

// Component để bảo vệ routes không cho phép đã đăng nhập (login, register)
export const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        // Đã đăng nhập -> chuyển về trang chủ
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

// Component để bảo vệ routes chỉ cho ADMIN
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <ProtectedRoute requiredRoles={['ADMIN']} requireAnyRole={true}>
            {children}
        </ProtectedRoute>
    );
};

// Component để bảo vệ routes cho Dashboard - chỉ ADMIN
export const DashboardRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <ProtectedRoute requiredRoles={['ADMIN']} requireAnyRole={true}>
            {children}
        </ProtectedRoute>
    );
};

// Component để bảo vệ routes chỉ cho user đã xác thực (không cần role cụ thể)
export const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <ProtectedRoute>
            {children}
        </ProtectedRoute>
    );
};