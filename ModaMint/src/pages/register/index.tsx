import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './style.css';
import { FaFacebook, FaGoogle } from 'react-icons/fa';
import { AiOutlineMail } from 'react-icons/ai';
import { userService } from "../../services/user/index"
import type { UserRegistrationRequest } from '../../services/authentication';
import { toast } from 'react-toastify';



export default function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [registerMethod, setRegisterMethod] = useState<'email' | 'facebook' | 'google'>('email');
    const [isLoading, setIsLoading] = useState(false);
    const [showAdvancedFields, setShowAdvancedFields] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (password !== confirmPassword) {
            toast.error('Mật khẩu không khớp!');
            return;
        }

        if (password.length < 8) {
            toast.error('Mật khẩu phải có ít nhất 8 ký tự!');
            return;
        }

        if (!firstName.trim() || !lastName.trim()) {
            toast.error('Vui lòng nhập đầy đủ họ và tên!');
            return;
        }

        // Tự động tạo username nếu không nhập
        let finalUsername = username.trim();
        if (!finalUsername) {
            // Tạo username từ email, loại bỏ ký tự đặc biệt
            finalUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        }

        if (finalUsername.length < 3) {
            // Nếu vẫn ngắn hơn 3 ký tự, thêm số ngẫu nhiên
            finalUsername += Math.floor(Math.random() * 1000);
        }

        if (finalUsername.length < 3) {
            toast.error('Không thể tạo tên đăng nhập hợp lệ từ email này. Vui lòng nhập tên đăng nhập thủ công!');
            return;
        }

        // Tạo dữ liệu theo format UserRegistrationRequest
        const registrationData: UserRegistrationRequest = {
            username: finalUsername,
            email,
            password,
            phone,
            firstName,
            lastName,
            dob // Format: yyyy-MM-dd
        };

        try {
            setIsLoading(true);
            console.log('Registration attempt with:', registrationData);



            // Gọi API đăng ký
            const result = await userService.createUser(registrationData);

            if (result.success) {
                toast.success(result.message || 'Đăng ký thành công! Chào mừng bạn đến với ModaMint!');
                // Chuyển hướng đến trang đăng nhập sau 2 giây
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                toast.error(result.message || 'Có lỗi xảy ra trong quá trình đăng ký!');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFacebookRegister = () => {
        setRegisterMethod('facebook');
        console.log('Facebook registration initiated');
        // Here you would implement Facebook OAuth registration
        // window.location.href = 'https://www.facebook.com/v13.0/dialog/oauth?...'
    };

    const handleGoogleRegister = () => {
        setRegisterMethod('google');
        console.log('Google registration initiated');
        // Here you would implement Google OAuth registration
        // window.location.href = 'https://accounts.google.com/oauth/authorize?...'
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-header">
                    <h1>Đăng ký tài khoản</h1>
                    <p>Tạo tài khoản để mua sắm dễ dàng hơn</p>
                </div>

                {/* Tabs */}
                <div className="register-options">
                    <div
                        className={`register-option ${registerMethod === 'email' ? 'active' : ''}`}
                        onClick={() => setRegisterMethod('email')}
                    >
                        <AiOutlineMail className="register-option-icon" />
                        <span>Email</span>
                    </div>
                    <div
                        className={`register-option ${registerMethod === 'facebook' ? 'active' : ''}`}
                        onClick={() => setRegisterMethod('facebook')}
                    >
                        <FaFacebook className="register-option-icon" />
                        <span>Facebook</span>
                    </div>
                    <div
                        className={`register-option ${registerMethod === 'google' ? 'active' : ''}`}
                        onClick={() => setRegisterMethod('google')}
                    >
                        <FaGoogle className="register-option-icon" />
                        <span>Google</span>
                    </div>
                </div>

                {registerMethod === 'email' ? (
                    <form className="register-form" onSubmit={handleSubmit}>
                        {/* Basic Required Fields */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">Họ *</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Nhập họ của bạn"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName">Tên *</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Nhập tên của bạn"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Nhập email của bạn"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">Mật khẩu *</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu (ít nhất 8 ký tự)"
                                    minLength={8}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Xác nhận lại mật khẩu"
                                    minLength={8}
                                    required
                                />
                            </div>
                        </div>

                        {/* Advanced Fields Toggle */}
                        <div className="advanced-fields-toggle">
                            <button
                                type="button"
                                onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                                className="toggle-button"
                            >
                                {showAdvancedFields ? '▼ Ẩn thông tin bổ sung' : '▶ Thêm thông tin (tùy chọn)'}
                            </button>
                        </div>

                        {/* Advanced Optional Fields */}
                        {showAdvancedFields && (
                            <div className="advanced-fields">
                                <div className="form-group">
                                    <label htmlFor="username">Tên đăng nhập</label>
                                    <input
                                        type="text"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Để trống sẽ tự động tạo từ email"
                                        minLength={3}
                                    />
                                    <small className="field-hint">Nếu để trống, tên đăng nhập sẽ được tạo từ email của bạn</small>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="phone">Số điện thoại</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="dob">Ngày sinh</label>
                                        <input
                                            type="date"
                                            id="dob"
                                            value={dob}
                                            onChange={(e) => setDob(e.target.value)}
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="terms-agreement">
                            <input
                                type="checkbox"
                                id="agreeTerms"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                required
                            />
                            <label htmlFor="agreeTerms">
                                Tôi đồng ý với{' '}
                                <Link to="/dieu-khoan" className="terms-link">
                                    Điều khoản sử dụng
                                </Link>{' '}
                                và{' '}
                                <Link to="/chinh-sach" className="terms-link">
                                    Chính sách bảo mật
                                </Link>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="register-button"
                            disabled={!agreeTerms || isLoading}
                        >
                            {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>
                    </form>
                ) : registerMethod === 'facebook' ? (
                    <div className="social-register-container">
                        <div className="social-register-info">
                            <FaFacebook className="social-register-icon facebook-color" />
                            <h3>Đăng ký với Facebook</h3>
                            <p>Bạn sẽ được chuyển đến trang Facebook để đăng ký an toàn.</p>
                        </div>
                        <button
                            onClick={handleFacebookRegister}
                            className="social-register-button facebook-button"
                        >
                            <FaFacebook className="social-icon" />
                            Tiếp tục với Facebook
                        </button>
                    </div>
                ) : (
                    <div className="social-register-container">
                        <div className="social-register-info">
                            <FaGoogle className="social-register-icon google-color" />
                            <h3>Đăng ký với Google</h3>
                            <p>Bạn sẽ được chuyển đến trang Google để đăng ký an toàn.</p>
                        </div>
                        <button
                            onClick={handleGoogleRegister}
                            className="social-register-button google-button"
                        >
                            <FaGoogle className="social-icon" />
                            Tiếp tục với Google
                        </button>
                    </div>
                )}

                <div className="register-footer">
                    <p>
                        Bạn đã có tài khoản?{' '}
                        <Link to="/login" className="login-link">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}