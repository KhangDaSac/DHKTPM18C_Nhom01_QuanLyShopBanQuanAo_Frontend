import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './style.css';
import { FaFacebook } from 'react-icons/fa';
import { AiOutlineMail } from 'react-icons/ai';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loginMethod, setLoginMethod] = useState<'email' | 'facebook'>('email');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would handle login logic, e.g.:
        console.log('Login attempt with:', { loginMethod, email, password, rememberMe });
        // You could add API calls for authentication here
    };

    const handleFacebookLogin = () => {
        setLoginMethod('facebook');
        console.log('Facebook login initiated');
        // Here you would implement Facebook OAuth login
        // window.location.href = 'https://www.facebook.com/v13.0/dialog/oauth?...'
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <h1>Đăng nhập</h1>
                    <p>Vui lòng đăng nhập để tiếp tục</p>
                </div>

                <div className="login-options">
                    <div
                        className={`login-option ${loginMethod === 'email' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('email')}
                    >
                        <AiOutlineMail className="login-option-icon" />
                        <span>Email</span>
                    </div>
                    <div
                        className={`login-option ${loginMethod === 'facebook' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('facebook')}
                    >
                        <FaFacebook className="login-option-icon" />
                        <span>Facebook</span>
                    </div>
                </div>

                {loginMethod === 'email' ? (
                    <form className="login-form" onSubmit={handleSubmit}>
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
                                required
                            />
                        </div>

                        <div className="form-options">
                            <div className="remember-me">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label htmlFor="rememberMe">Ghi nhớ đăng nhập</label>
                            </div>
                            <Link to="/quen-mat-khau" className="forgot-password">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <button type="submit" className="login-button">
                            Đăng nhập với Email
                        </button>
                    </form>
                ) : (
                    <div className="facebook-login-container">
                        <p className="facebook-login-info">
                            Bạn sẽ được chuyển đến trang Facebook để đăng nhập an toàn.
                        </p>
                        <button
                            onClick={handleFacebookLogin}
                            className="facebook-login-button"
                        >
                            <FaFacebook className="facebook-icon" />
                            Đăng nhập với Facebook
                        </button>
                    </div>
                )}

                <div className="login-footer">
                    <p>
                        Bạn chưa có tài khoản?{' '}
                        <Link to="/register" className="register-link">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
