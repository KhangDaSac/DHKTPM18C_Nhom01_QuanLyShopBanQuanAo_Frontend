import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './style.css';
import { FaFacebook, FaGoogle } from 'react-icons/fa';
import { AiOutlineMail } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { authenticationService } from '../../services/authentication';
import { useAuth } from '../../contexts/authContext';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loginMethod, setLoginMethod] = useState<'username' | 'facebook' | 'google'>('username');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Lấy trang trước đó từ state (nếu có)
    const from = (location.state as any)?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!username.trim()) {
            toast.error('Vui lòng nhập tên đăng nhập!');
            return;
        }

        if (!password.trim()) {
            toast.error('Vui lòng nhập mật khẩu!');
            return;
        }

        if (password.length < 8) {
            toast.error('Mật khẩu phải có ít nhất 8 ký tự!');
            return;
        }

        setIsLoading(true);

        try {
            const result = await authenticationService.authenticate({
                username: username.trim(),
                password: password
            });

            if (result.success && result.data) {
                toast.success('Đăng nhập thành công!');

                console.log('Login result:', result.data);

                // Sử dụng AuthContext để lưu token
                if (result.data.accessToken) {
                    let userData = null;

                    // Lấy thông tin user trước khi lưu vào context
                    try {
                        // Tạm thời lưu token vào localStorage để có thể gọi API
                        const tempAuthData = {
                            accessToken: result.data.accessToken,
                            refreshToken: result.data.refreshToken
                        };
                        localStorage.setItem("authData", JSON.stringify(tempAuthData));

                        const userResult = await authenticationService.getCurrentUser();

                        if (userResult.success && userResult.data) {
                            userData = userResult.data;
                        } else {
                            // Tạo user data cơ bản từ thông tin có sẵn nếu API không hoạt động
                            userData = {
                                id: 'temp-id',
                                username: username, // Từ form đăng nhập
                                email: '',
                                firstName: '',
                                lastName: '',
                                phone: '',
                                dob: ''
                            };
                        }
                    } catch (error) {
                        console.error('Error getting user data:', error);
                        // Tạo user data cơ bản khi có lỗi
                        userData = {
                            id: 'temp-id',
                            username: username,
                            email: '',
                            firstName: '',
                            lastName: '',
                            phone: '',
                            dob: ''
                        };
                    }

                    // Chỉ gọi login() MỘT LẦN duy nhất với đầy đủ thông tin
                    login({
                        accessToken: result.data.accessToken,
                        refreshToken: result.data.refreshToken
                    }, userData);
                }                // Chuyển hướng về trang trước đó hoặc trang chủ sau 1.5 giây
                setTimeout(() => {
                    navigate(from, { replace: true });
                }, 1500);
            } else {
                toast.error(result.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Có lỗi xảy ra trong quá trình đăng nhập!');
        } finally {
            setIsLoading(false);
        }

    };

    const handleFacebookLogin = () => {
        setLoginMethod('facebook');

        toast.info('Chức năng đăng nhập Facebook đang được phát triển!');
        // TODO: Implement Facebook OAuth login
        // window.location.href = 'https://www.facebook.com/v13.0/dialog/oauth?...'
    };

    const handleGoogleLogin = () => {
        setLoginMethod('google');
        toast.info('Chức năng đăng nhập Google đang được phát triển!');
        // TODO: Implement Google OAuth login
        // window.location.href = 'https://accounts.google.com/oauth/authorize?...'
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
                        className={`login-option ${loginMethod === 'username' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('username')}
                    >
                        <AiOutlineMail className="login-option-icon" />
                        <span>Username</span>
                    </div>
                    <div
                        className={`login-option ${loginMethod === 'facebook' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('facebook')}
                    >
                        <FaFacebook className="login-option-icon" />
                        <span>Facebook</span>
                    </div>
                    <div
                        className={`login-option ${loginMethod === 'google' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('google')}
                    >
                        <FaGoogle className="login-option-icon" />
                        <span>Google</span>
                    </div>
                </div>

                {loginMethod === 'username' && (
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nhập username của bạn"
                                disabled={isLoading}
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
                                disabled={isLoading}
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
                                    disabled={isLoading}
                                />
                                <label htmlFor="rememberMe">Ghi nhớ đăng nhập</label>
                            </div>
                            <Link to="/quen-mat-khau" className="forgot-password">
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <button
                            type="submit"
                            className="login-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập với Username'}
                        </button>
                    </form>
                )}

                {loginMethod === 'facebook' && (
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

                {loginMethod === 'google' && (
                    <div className="google-login-container">
                        <p className="google-login-info">
                            Bạn sẽ được chuyển đến trang Google để đăng nhập an toàn.
                        </p>
                        <button
                            onClick={handleGoogleLogin}
                            className="google-login-button"
                        >
                            <FaGoogle className="google-icon" />
                            Đăng nhập với Google
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
