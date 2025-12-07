import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './style.module.css';
import '../checkout/validation.css';
import { FaFacebook, FaGoogle } from 'react-icons/fa';
import { AiOutlineMail } from 'react-icons/ai';
import { userService } from "@/services/user/index"
import type { CreateUserRequest } from '@/services/user';
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
    
    // Validation errors
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        confirmPassword?: string;
        phone?: string;
        firstName?: string;
        lastName?: string;
    }>({});

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

        // Tạo dữ liệu theo format CreateUserRequest
        const registrationData: CreateUserRequest = {
            username: finalUsername,
            email,
            password,
            phone,
            firstName,
            lastName,
            dob, // Format: yyyy-MM-dd
            roles: [] // Backend expects this field
        };

        try {
            setIsLoading(true);
            console.log('🚀 Registration attempt with:', registrationData);
            console.log('🌐 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:8080/api');

            // Gọi API đăng ký
            const result = await userService.createUser(registrationData);
            
            console.log('📡 API Response:', result);

            if (result.success) {
                toast.success(result.message || 'Đăng ký thành công! Chào mừng bạn đến với ModaMint!');
                // Chuyển hướng đến trang đăng nhập sau 2 giây
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                console.error('❌ Registration failed:', result.message);
                toast.error(result.message || 'Có lỗi xảy ra trong quá trình đăng ký!');
            }
        } catch (error) {
            console.error('💥 Registration error:', error);
            
            // Kiểm tra loại lỗi
            if (error instanceof Error) {
                if (error.message.includes('Network Error')) {
                    toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!');
                } else if (error.message.includes('timeout')) {
                    toast.error('Yêu cầu quá thời gian. Vui lòng thử lại!');
                } else {
                    toast.error(`Lỗi: ${error.message}`);
                }
            } else {
                toast.error('Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại!');
            }
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
        <div className={styles["register__page"]}>
            <div className={styles["register__container"]}>
                <div className={styles["register__header"]}>
                    <h1 className={styles["register__title"]}>Đăng ký</h1>
                    <p className={styles["register__subtitle"]}>Tham gia ModaMint để nhận nhiều ưu đãi hấp dẫn!</p>
                </div>
                <div className={styles["register__options"]}>
                    <div
                        className={`${styles["register__option"]} ${registerMethod === 'email' ? 'active' : ''}`}
                        onClick={() => setRegisterMethod('email')}
                    >
                        <AiOutlineMail className={styles["register__option-icon"]} />
                        <span>Email</span>
                    </div>
                    <div
                        className={`${styles["register__option"]} ${registerMethod === 'facebook' ? 'active' : ''}`}
                        onClick={() => setRegisterMethod('facebook')}
                    >
                        <FaFacebook className={styles["register__option-icon"]} />
                        <span>Facebook</span>
                    </div>
                    <div
                        className={`${styles["register__option"]} ${registerMethod === 'google' ? 'active' : ''}`}
                        onClick={() => setRegisterMethod('google')}
                    >
                        <FaGoogle className={styles["register__option-icon"]} />
                        <span>Google</span>
                    </div>
                </div>

                {registerMethod === 'email' && (
                    <form className={styles["register__form"]} onSubmit={handleSubmit}>
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
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) {
                                        setErrors(prev => ({ ...prev, email: undefined }));
                                    }
                                }}
                                onBlur={() => {
                                    const error = validateEmail(email);
                                    setErrors(prev => ({ ...prev, email: error }));
                                }}
                                className={errors.email ? 'input-error' : ''}
                                placeholder="Nhập email của bạn"
                                required
                            />
                            {errors.email && (
                                <div className="error-message">{errors.email}</div>
                            )}
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">Mật khẩu *</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) {
                                            setErrors(prev => ({ ...prev, password: undefined }));
                                        }
                                    }}
                                    onBlur={() => {
                                        const error = validatePassword(password);
                                        setErrors(prev => ({ ...prev, password: error }));
                                    }}
                                    className={errors.password ? 'input-error' : ''}
                                    placeholder="Nhập mật khẩu (ít nhất 8 ký tự)"
                                    minLength={8}
                                    required
                                />
                                {errors.password && (
                                    <div className="error-message">{errors.password}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (errors.confirmPassword) {
                                            setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                                        }
                                    }}
                                    onBlur={() => {
                                        const error = validateConfirmPassword(confirmPassword);
                                        setErrors(prev => ({ ...prev, confirmPassword: error }));
                                    }}
                                    className={errors.confirmPassword ? 'input-error' : ''}
                                    placeholder="Xác nhận lại mật khẩu"
                                    minLength={8}
                                    required
                                />
                                {errors.confirmPassword && (
                                    <div className="error-message">{errors.confirmPassword}</div>
                                )}
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
                                            onChange={(e) => {
                                                setPhone(e.target.value);
                                                if (errors.phone) {
                                                    setErrors(prev => ({ ...prev, phone: undefined }));
                                                }
                                            }}
                                            onBlur={() => {
                                                const error = validatePhone(phone);
                                                setErrors(prev => ({ ...prev, phone: error }));
                                            }}
                                            className={errors.phone ? 'input-error' : ''}
                                            placeholder="Nhập số điện thoại"
                                        />
                                        {errors.phone && (
                                            <div className="error-message">{errors.phone}</div>
                                        )}
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
                            className={styles["register__button"]}
                            disabled={!agreeTerms || isLoading}
                        >
                            {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>
                    </form>
                )}

                {registerMethod === 'facebook' && (
                    <div className={styles["register__facebook-container"]}>
                        <p className={styles["register__facebook-info"]}>
                            Bạn sẽ được chuyển đến trang Facebook để đăng ký an toàn.
                        </p>
                        <button
                            onClick={handleFacebookRegister}
                            className={styles["register__facebook-button"]}
                        >
                            <FaFacebook className={styles["register__facebook-icon"]} />
                            Đăng ký với Facebook
                        </button>
                    </div>
                )}

                {registerMethod === 'google' && (
                    <div className={styles["register__google-container"]}>
                        <p className={styles["register__google-info"]}>
                            Bạn sẽ được chuyển đến trang Google để đăng ký an toàn.
                        </p>
                        <button
                            onClick={handleGoogleRegister}
                            className={styles["register__google-button"]}
                        >
                            <FaGoogle className={styles["register__google-icon"]} />
                            Đăng ký với Google
                        </button>
                    </div>
                )}

                <div className={styles["register__footer"]}>
                    <p>
                        Bạn đã có tài khoản?{' '}
                        <Link to="/login" className={styles["register__register-link"]}>
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );

}
