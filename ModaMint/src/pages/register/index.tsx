import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './style.css';
import { FaFacebook } from 'react-icons/fa';
import { AiOutlineMail } from 'react-icons/ai';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [registerMethod, setRegisterMethod] = useState<'email' | 'facebook'>('email');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (password !== confirmPassword) {
            alert('Mật khẩu không khớp!');
            return;
        }

        // Here you would handle registration logic, e.g.:
        console.log('Registration attempt with:', { registerMethod, name, email, password, agreeTerms });
        // You could add API calls for registration here
    };

    const handleFacebookRegister = () => {
        setRegisterMethod('facebook');
        console.log('Facebook registration initiated');
        // Here you would implement Facebook OAuth registration
        // window.location.href = 'https://www.facebook.com/v13.0/dialog/oauth?...'
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-header">
                    <h1>Đăng ký tài khoản</h1>
                    <p>Tạo tài khoản để mua sắm dễ dàng hơn</p>
                </div>

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
                </div>

                {registerMethod === 'email' ? (
                    <form className="register-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Họ và tên</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nhập họ và tên của bạn"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
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
                            <label htmlFor="password">Mật khẩu</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu của bạn"
                                minLength={6}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Xác nhận lại mật khẩu"
                                minLength={6}
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

                        <button type="submit" className="register-button" disabled={!agreeTerms}>
                            Đăng ký
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
