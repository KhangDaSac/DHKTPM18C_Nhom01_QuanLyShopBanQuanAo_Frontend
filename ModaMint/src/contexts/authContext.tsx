import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authenticationService } from "../services/authentication";
import type { UserResponse } from "../services/authentication";
import { toast } from 'react-toastify';

// Định nghĩa interface cho AuthContext
interface AuthContextType {
    accessToken: string | null;
    refreshToken: string | null;
    user: UserResponse | null;
    isAuthenticated: boolean;
    login: (authData: { accessToken: string; refreshToken?: string }, userData?: UserResponse) => void;
    logout: () => void;
    updateUser: (userData: UserResponse) => void;
    refreshUser: () => Promise<void>;
}

// Định nghĩa interface cho AuthProvider props
interface AuthProviderProps {
    children: ReactNode;
}

// 1. Tạo Context với type đúng
const AuthContext = createContext<AuthContextType | null>(null);

// 2. Custom hook để dễ sử dụng với type checking
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// 3. Provider với TypeScript
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string | null>(() => {
        // Lấy token từ authData trong localStorage
        const authDataStr = localStorage.getItem("authData");
        if (authDataStr) {
            try {
                const authData = JSON.parse(authDataStr);
                return authData.accessToken || null;
            } catch {
                return null;
            }
        }
        return null;
    });

    const [refreshToken, setRefreshToken] = useState<string | null>(() => {
        // Lấy refresh token từ authData trong localStorage
        const authDataStr = localStorage.getItem("authData");
        if (authDataStr) {
            try {
                const authData = JSON.parse(authDataStr);
                return authData.refreshToken || null;
            } catch {
                return null;
            }
        }
        return null;
    });

    const [user, setUser] = useState<UserResponse | null>(() => {
        // Lấy user data từ authData trong localStorage
        const authDataStr = localStorage.getItem("authData");
        if (authDataStr) {
            try {
                const authData = JSON.parse(authDataStr);
                return authData.user || null;
            } catch {
                return null;
            }
        }
        return null;
    });

    const isAuthenticated = Boolean(accessToken);

    // Hàm refresh user data từ server
    const refreshUser = async () => {
        if (accessToken) {
            const result = await authenticationService.getCurrentUser();
            if (result.success && result.data) {
                setUser(result.data);
                // Cập nhật localStorage
                const authDataStr = localStorage.getItem("authData");
                if (authDataStr) {
                    try {
                        const authData = JSON.parse(authDataStr);
                        authData.user = result.data;
                        localStorage.setItem("authData", JSON.stringify(authData));
                    } catch (error) {
                        console.error('Error updating authData:', error);
                    }
                }
            } else {
                // Nếu không lấy được user data, có thể token đã hết hạn
                if (result.message?.includes('hết hạn')) {
                    logout();
                }
            }
        }
    };

    // Hàm login - lưu token và user data
    const login = (authData: { accessToken: string; refreshToken?: string }, userData?: UserResponse) => {
        setAccessToken(authData.accessToken);
        if (authData.refreshToken) {
            setRefreshToken(authData.refreshToken);
        }
        if (userData) {
            setUser(userData);
        }

        // Lưu vào localStorage
        const dataToSave = {
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            user: userData || user
        };
        localStorage.setItem("authData", JSON.stringify(dataToSave));
    };    // Hàm logout - xóa tất cả data
    const logout = async () => {
        try {
            await authenticationService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setAccessToken(null);
            setUser(null);
            setRefreshToken(null);
            localStorage.removeItem("authData");
            localStorage.removeItem("accessToken"); // Remove old token if exists
            toast.success('Đăng xuất thành công!');
        }
    };

    // Hàm update user data
    const updateUser = (userData: UserResponse) => {
        setUser(userData);

        // Cập nhật localStorage
        const authDataStr = localStorage.getItem("authData");
        if (authDataStr) {
            try {
                const authData = JSON.parse(authDataStr);
                authData.user = userData;
                localStorage.setItem("authData", JSON.stringify(authData));
            } catch (error) {
                console.error('Update user error:', error);
            }
        }
    };

    // Auto refresh user data khi component mount và có token
    useEffect(() => {
        if (accessToken && !user) {
            refreshUser();
        }
    }, [accessToken]);

    // Auto refresh token khi sắp hết hạn
    useEffect(() => {
        if (!accessToken || !refreshToken) return;

        const checkAndRefreshToken = async () => {
            if (authenticationService.isTokenExpiringSoon()) {
                try {
                    const result = await authenticationService.refreshAccessToken(refreshToken);
                    if (result.success && result.data) {
                        // Cập nhật token mới
                        login({
                            accessToken: result.data.accessToken,
                            refreshToken: result.data.refreshToken || refreshToken
                        }, user || undefined);
                        console.log('Token refreshed successfully');
                    } else {
                        // Refresh thất bại, đăng xuất
                        logout();
                    }
                } catch (error) {
                    console.error('Auto refresh token failed:', error);
                    logout();
                }
            }
        };

        // Check mỗi 5 phút
        const interval = setInterval(checkAndRefreshToken, 5 * 60 * 1000);

        // Check ngay khi component mount
        checkAndRefreshToken();

        return () => clearInterval(interval);
    }, [accessToken, refreshToken, user]);

    // Context value
    const contextValue: AuthContextType = {
        accessToken,
        refreshToken,
        user,
        isAuthenticated,
        login,
        logout,
        updateUser,
        refreshUser
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
