import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

// Component để bảo vệ routes yêu cầu đăng nhập
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Chưa đăng nhập -> chuyển đến login (không show toast để tránh trùng lặp với logout toast)
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

// Component để bảo vệ routes không cho phép đã đăng nhập (login, register)
export const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        // Đã đăng nhập -> chuyển về trang chủ (không hiện toast để tránh trùng lặp)
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};