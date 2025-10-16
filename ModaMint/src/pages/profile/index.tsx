import React, { useState, useEffect } from 'react';
import type { UserResponse } from '../../services/authentication';
import { useAuth } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import './style.css';

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<UserResponse>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const navigate = useNavigate();

    // Sử dụng AuthContext
    const { isAuthenticated, user, logout, updateUser } = useAuth();

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        setLoading(true);
        setError('');

        // Kiểm tra authentication
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // Nếu có user data từ context, sử dụng luôn
        if (user) {
            setFormData(user);
        }

        setLoading(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: Partial<UserResponse>) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!user) return;

        // Cập nhật thông tin user bằng AuthContext
        const updatedUser = { ...user, ...formData };
        updateUser(updatedUser);
        setSuccessMessage('Cập nhật thông tin thành công!');
        setIsEditing(false);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="profile-loading">Đang tải...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-container">
                <div className="profile-error">Không thể tải thông tin người dùng</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Thông tin cá nhân</h1>
                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Đăng xuất
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <div className="profile-content">
                {!isEditing ? (
                    <div className="profile-info">
                        <div className="info-group">
                            <label>Tên đăng nhập:</label>
                            <span>{user.username}</span>
                        </div>
                        <div className="info-group">
                            <label>Email:</label>
                            <span>{user.email || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="info-group">
                            <label>Họ:</label>
                            <span>{user.firstName || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="info-group">
                            <label>Tên:</label>
                            <span>{user.lastName || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="info-group">
                            <label>Số điện thoại:</label>
                            <span>{user.phone || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="info-group">
                            <label>Ngày sinh:</label>
                            <span>{user.dob || 'Chưa cập nhật'}</span>
                        </div>

                        <button
                            className="edit-btn"
                            onClick={() => setIsEditing(true)}
                        >
                            Chỉnh sửa thông tin
                        </button>
                    </div>
                ) : (
                    <form className="profile-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Tên đăng nhập:</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username || ''}
                                onChange={handleInputChange}
                                disabled
                            />
                        </div>
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Họ:</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Tên:</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại:</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Ngày sinh:</label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob || ''}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="save-btn">
                                Lưu thay đổi
                            </button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData(user || {});
                                }}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}