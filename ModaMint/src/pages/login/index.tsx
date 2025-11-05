import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './style.module.css';
import { FaFacebook, FaGoogle } from 'react-icons/fa';
import { AiOutlineMail } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { authenticationService } from '@/services/authentication';
import { useAuth } from '@/contexts/authContext';
import { getRolesFromToken } from '@/utils/apiAuthUtils';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loginMethod, setLoginMethod] = useState<'username' | 'facebook' | 'google'>('username');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Lấy trang trước đó từ state (nếu có) - không dùng nữa vì redirect theo role
    const from = (location.state as any)?.from?.pathname;

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

                    // Lấy roles từ token để redirect đúng trang
                    const roles = getRolesFromToken(result.data.accessToken);
                    const isAdmin = roles.includes('ADMIN');
                    
                    // Redirect dựa trên role
                    setTimeout(() => {
                        if (isAdmin) {
                            // Admin → Dashboard
                            navigate('/dashboard', { replace: true });
                        } else {
                            // User → Trang chủ hoặc trang trước đó (nếu không phải dashboard)
                            const redirectPath = from && !from.includes('/dashboard') ? from : '/';
                            navigate(redirectPath, { replace: true });
                        }
                    }, 1500);
                }
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
        
        // Lấy thông tin từ client_secret file
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const redirectUri = encodeURIComponent('http://localhost:5173/auth/google');
        
        // Tạo URL OAuth2 để gọi Google authorization
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?` +
            `client_id=${clientId}&` +
            `redirect_uri=${redirectUri}&` +
            `response_type=code&` +
            `scope=email profile openid&` +
            `access_type=offline&` +
            `prompt=select_account`;
        
        // Redirect đến Google để hiển thị màn hình chọn account
        window.location.href = googleAuthUrl;
    };
    return (
        <div className={styles.login}>
            <div className={styles.login__container}>
                <div className={styles.login__header}>
                    <h1 className={styles.login__title}>Đăng nhập</h1>
                    <p className={styles.login__subtitle}>Vui lòng đăng nhập để tiếp tục</p>
                </div>

                <div className={styles.login__options}>
                    <div
                        className={`${styles.login__option} ${loginMethod === 'username' ? styles['login__option--active'] : ''}`}
                        onClick={() => setLoginMethod('username')}
                    >
                        <AiOutlineMail className={styles['login__option-icon']} />
                        <span>Username</span>
                    </div>
                    <div
                        className={`${styles.login__option} ${loginMethod === 'facebook' ? styles['login__option--active'] : ''}`}
                        onClick={() => setLoginMethod('facebook')}
                    >
                        <FaFacebook className={styles['login__option-icon']} />
                        <span>Facebook</span>
                    </div>
                    <div
                        className={`${styles.login__option} ${loginMethod === 'google' ? styles['login__option--active'] : ''}`}
                        onClick={() => setLoginMethod('google')}
                    >
                        <FaGoogle className={styles['login__option-icon']} />
                        <span>Google</span>
                    </div>
                </div>

                {loginMethod === 'username' && (
                    <form className={styles.login__form} onSubmit={handleSubmit}>
                        <div className={styles['login__form-group']}>
                            <label htmlFor="username" className={styles.login__label}>Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nhập username của bạn"
                                disabled={isLoading}
                                required
                                className={styles.login__input}
                            />
                        </div>
                        <div className={styles['login__form-group']}>
                            <label htmlFor="password" className={styles.login__label}>Mật khẩu</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu của bạn"
                                disabled={isLoading}
                                required
                                className={styles.login__input}
                            />
                        </div>
                        <div className={styles['login__form-options']}>
                            <div className={styles.login__remember}>
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={isLoading}
                                    className={styles.login__checkbox}
                                />
                                <label htmlFor="rememberMe">Ghi nhớ đăng nhập</label>
                            </div>
                            <Link to="/quen-mat-khau" className={styles['login__forgot-link']}>
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <button
                            type="submit"
                            className={styles.login__button}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập với Username'}
                        </button>
                    </form>
                )}

                {loginMethod === 'facebook' && (
                    <div className={styles['login__facebook-container']}>
                        <p className={styles['login__facebook-info']}>
                            Bạn sẽ được chuyển đến trang Facebook để đăng nhập an toàn.
                        </p>
                        <button
                            onClick={handleFacebookLogin}
                            className={styles['login__facebook-button']}
                        >
                            <FaFacebook className={styles['login__facebook-icon']} />
                            Đăng nhập với Facebook
                        </button>
                    </div>
                )}

                {loginMethod === 'google' && (
                    <div className={styles['login__google-container']}>
                        <p className={styles['login__google-info']}>
                            Bạn sẽ được chuyển đến trang Google để đăng nhập an toàn.
                        </p>
                        <button
                            onClick={handleGoogleLogin}
                            className={styles['login__google-button']}
                        >
                            <FaGoogle className={styles['login__google-icon']} />
                            Đăng nhập với Google
                        </button>
                    </div>
                )}

                <div className={styles.login__footer}>
                    <p>
                        Bạn chưa có tài khoản?{' '}
                        <Link to="/register" className={styles['login__register-link']}>
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
