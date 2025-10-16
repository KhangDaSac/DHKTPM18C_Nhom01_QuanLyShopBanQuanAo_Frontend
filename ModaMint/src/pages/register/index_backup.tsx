import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './style.css';
import { FaFacebook, FaGoogle } from 'react-icons/fa';
import { AiOutlineMail } from 'react-icons/ai';
import { authenticationService } from '../../services/authentication';
import type { UserRegistrationRequest } from '../../services/authentication';

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
            alert('Mật khẩu không khớp!');
            return;
        }

        if (username.length < 3) {
            alert('Tên đăng nhập phải có ít nhất 3 ký tự!');
            return;
        }

        if (password.length < 8) {
            alert('Mật khẩu phải có ít nhất 8 ký tự!');
            return;
        }

        if (!firstName.trim() || !lastName.trim()) {
            alert('Vui lòng nhập đầy đủ họ và tên!');
            return;
        }

        // Tạo dữ liệu theo format UserRegistrationRequest
        const registrationData: UserRegistrationRequest = {
            username,
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
            const result = await authenticationService.register(registrationData);

            if (result.success) {
                alert(result.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
                // Chuyển hướng đến trang đăng nhập
                navigate('/login');
            } else {
                alert(result.message || 'Đăng ký thất bại!');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
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

                    {/* Social Login Buttons */}
                    <div className="social-login-section">
                        <button
                            type="button"
                            onClick={handleFacebookRegister}
                            className="social-login-button facebook-button"
                        >
                            <FaFacebook className="social-icon" />
                            <span>Đăng ký với Facebook</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleGoogleRegister}
                            className="social-login-button google-button"
                        >
                            <FaGoogle className="social-icon" />
                            <span>Đăng ký với Google</span>
                        </button>
                    </div>

                    <div className="divider">
                        <span>hoặc</span>
                    </div>                    {registerMethod === 'email' ? (
                        <form className="register-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="username">Tên đăng nhập *</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Nhập tên đăng nhập (ít nhất 3 ký tự)"
                                    minLength={3}
                                    required
                                />
                            </div>

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

                            <div className="form-group">
                                <label htmlFor="phone">Số điện thoại</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Nhập số điện thoại của bạn"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="dob">Ngày sinh</label>
                                <input
                                    type="date"
                                    id="dob"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    max={new Date().toISOString().split('T')[0]} // Không cho chọn ngày trong tương lai
                                />
                            </div>

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
                    ) : (
                        <div className="facebook-register-container">
                            <p className="facebook-register-info">
                                Bạn sẽ được chuyển đến trang Facebook để đăng ký an toàn.
                            </p>
                            <button
                                onClick={handleFacebookRegister}
                                className="facebook-register-button"
                            >
                                <FaFacebook className="facebook-icon" />
                                Đăng ký với Facebook
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
