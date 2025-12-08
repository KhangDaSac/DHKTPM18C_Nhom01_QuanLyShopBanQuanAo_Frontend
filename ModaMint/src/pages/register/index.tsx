import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './style.module.css';
import '../checkout/validation.css';
import { FaEye, FaEyeSlash, FaFileAlt } from 'react-icons/fa';
import { userService } from "@/services/user/index"
import type { CreateUserRequest } from '@/services/user';
import { toast } from 'react-toastify';
import { authenticationService } from "@/services/authentication";
import { useAuth } from "@/contexts/authContext";



export default function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showAdvancedFields, setShowAdvancedFields] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    // Validation errors
    const [errors, setErrors] = useState<{
        username?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        phone?: string;
        firstName?: string;
        lastName?: string;
    }>({});

    // Validation functions
    const validateUsername = (username: string): string | undefined => {
        if (!username) return undefined; // Optional field
        if (username.length < 3) return 'Tên đăng nhập phải có ít nhất 3 ký tự';
        if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới';
        return undefined;
    };

    const validateEmail = (email: string): string | undefined => {
        if (!email) return 'Email là bắt buộc';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Email không hợp lệ';
        return undefined;
    };

    const validatePassword = (password: string): string | undefined => {
        if (!password) return 'Mật khẩu là bắt buộc';
        if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
        return undefined;
    };

    const validateConfirmPassword = (confirmPass: string): string | undefined => {
        if (!confirmPass) return 'Vui lòng xác nhận mật khẩu';
        if (confirmPass !== password) return 'Mật khẩu không khớp';
        return undefined;
    };

    const validatePhone = (phone: string): string | undefined => {
        if (!phone) return undefined; // Optional field
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phone)) return 'Số điện thoại không hợp lệ';
        return undefined;
    };

    const validateFirstName = (name: string): string | undefined => {
        if (!name.trim()) return 'Họ là bắt buộc';
        return undefined;
    };

    const validateLastName = (name: string): string | undefined => {
        if (!name.trim()) return 'Tên là bắt buộc';
        return undefined;
    };

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
            phone: phone || undefined, // Only send if not empty
            firstName,
            lastName,
            dob: dob || undefined, // Only send if not empty
            image: undefined // Will be set later via profile update
        };

        try {
            setIsLoading(true);
            console.log('🚀 Registration attempt with:', registrationData);
            console.log('🌐 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:8080/api');

            // Gọi API đăng ký
            const result = await userService.createUser(registrationData);

            console.log('📡 API Response:', result);

            if (result.success) {
                toast.success(result.message || 'Đăng ký thành công! Đang đăng nhập...');

                // Tự động đăng nhập sau khi đăng ký thành công
                try {
                    const loginResult = await authenticationService.authenticate({
                        username: email, // Backend sử dụng email để login
                        password: password
                    });

                    if (loginResult.success && loginResult.data) {
                        // Lưu thông tin đăng nhập vào context
                        login(loginResult.data);

                        toast.success('Đăng nhập thành công! Chào mừng bạn đến với ModaMint!');

                        // Chuyển hướng đến trang chủ sau 1 giây
                        setTimeout(() => {
                            navigate('/');
                        }, 1000);
                    } else {
                        // Nếu auto login thất bại, chuyển đến trang login
                        toast.info('Vui lòng đăng nhập để tiếp tục');
                        setTimeout(() => {
                            navigate('/login');
                        }, 1500);
                    }
                } catch (loginError) {
                    console.error('❌ Auto login failed:', loginError);
                    toast.info('Đăng ký thành công! Vui lòng đăng nhập');
                    setTimeout(() => {
                        navigate('/login');
                    }, 1500);
                }
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

    return (
        <div className={styles["register__page"]}>
            <div className={styles["register__container"]}>
                <div className={styles["register__header"]}>
                    <h1 className={styles["register__title"]}>Đăng ký</h1>
                    <p className={styles["register__subtitle"]}>Tham gia ModaMint để nhận nhiều ưu đãi hấp dẫn!</p>
                </div>

                <form className={styles["register__form"]} onSubmit={handleSubmit}>
                    {/* Basic Required Fields */}
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="firstName">Họ *</label>
                            <input
                                type="text"
                                id="firstName"
                                value={firstName}
                                onChange={(e) => {
                                    setFirstName(e.target.value);
                                    if (errors.firstName) {
                                        setErrors(prev => ({ ...prev, firstName: undefined }));
                                    }
                                }}
                                onBlur={() => {
                                    const error = validateFirstName(firstName);
                                    setErrors(prev => ({ ...prev, firstName: error }));
                                }}
                                className={errors.firstName ? 'input-error' : ''}
                                placeholder="Nhập họ của bạn"
                                required
                            />
                            {errors.firstName && (
                                <div className="error-message">{errors.firstName}</div>
                            )}
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="lastName">Tên *</label>
                            <input
                                type="text"
                                id="lastName"
                                value={lastName}
                                onChange={(e) => {
                                    setLastName(e.target.value);
                                    if (errors.lastName) {
                                        setErrors(prev => ({ ...prev, lastName: undefined }));
                                    }
                                }}
                                onBlur={() => {
                                    const error = validateLastName(lastName);
                                    setErrors(prev => ({ ...prev, lastName: error }));
                                }}
                                className={errors.lastName ? 'input-error' : ''}
                                placeholder="Nhập tên của bạn"
                                required
                            />
                            {errors.lastName && (
                                <div className="error-message">{errors.lastName}</div>
                            )}
                        </div>
                    </div>
                    <div className={styles.formGroup}>
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
                    <div className={styles.formGroup}>
                        <label htmlFor="password">Mật khẩu *</label>
                        <div className={styles.passwordInputWrapper}>
                            <input
                                type={showPassword ? "text" : "password"}
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
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.password && (
                            <div className="error-message">{errors.password}</div>
                        )}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
                        <div className={styles.passwordInputWrapper}>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
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
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <div className="error-message">{errors.confirmPassword}</div>
                        )}
                    </div>
                    {/* Advanced Fields Toggle & Terms Button */}
                    <div className={styles.actionButtons}>
                        <button
                            type="button"
                            onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                            className={styles.toggleButton}
                        >
                            {showAdvancedFields ? '▼ Ẩn thông tin bổ sung' : '▶ Thêm thông tin (tùy chọn)'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            className={styles.termsButton}
                        >
                            <FaFileAlt /> Điều khoản sử dụng
                        </button>
                    </div>
                    {/* Advanced Optional Fields */}
                    {showAdvancedFields && (
                        <div className={styles.advancedFields}>
                            <div className={styles.formGroup}>
                                <label htmlFor="username">Tên đăng nhập</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        if (errors.username) {
                                            setErrors(prev => ({ ...prev, username: undefined }));
                                        }
                                    }}
                                    onBlur={() => {
                                        const error = validateUsername(username);
                                        setErrors(prev => ({ ...prev, username: error }));
                                    }}
                                    className={errors.username ? 'input-error' : ''}
                                    placeholder="Để trống sẽ tự động tạo từ email"
                                    minLength={3}
                                />
                                {errors.username && (
                                    <div className="error-message">{errors.username}</div>
                                )}
                                {!errors.username && (
                                    <small className="field-hint">Nếu để trống, tên đăng nhập sẽ được tạo từ email của bạn</small>
                                )}
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
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
                                <div className={styles.formGroup}>
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
                            Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật
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

                <div className={styles["register__footer"]}>
                    <p>
                        Bạn đã có tài khoản?{' '}
                        <Link to="/login" className={styles["register__register-link"]}>
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>

            {/* Terms Modal */}
            {showTermsModal && (
                <div className={styles.modalOverlay} onClick={() => setShowTermsModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Điều khoản sử dụng</h2>
                            <button
                                className={styles.modalClose}
                                onClick={() => setShowTermsModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <h3>1. Giới thiệu</h3>
                            <p>Chào mừng bạn đến với ModaMint! Bằng việc sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản sử dụng sau đây.</p>

                            <h3>2. Tài khoản người dùng</h3>
                            <p>• Bạn phải cung cấp thông tin chính xác và đầy đủ khi đăng ký tài khoản.</p>
                            <p>• Bạn chịu trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình.</p>
                            <p>• Không được chia sẻ tài khoản cho người khác sử dụng.</p>

                            <h3>3. Quyền và trách nhiệm</h3>
                            <p>• ModaMint có quyền từ chối hoặc hủy bỏ đơn hàng nếu phát hiện gian lận.</p>
                            <p>• Người dùng không được sử dụng dịch vụ cho mục đích phi pháp.</p>
                            <p>• Mọi tranh chấp sẽ được giải quyết theo pháp luật Việt Nam.</p>

                            <h3>4. Chính sách hoàn trả</h3>
                            <p>• Sản phẩm có thể được đổi trả trong vòng 7 ngày kể từ ngày nhận hàng.</p>
                            <p>• Sản phẩm phải còn nguyên vẹn, chưa qua sử dụng và còn đầy đủ tem mác.</p>

                            <h3>5. Bảo mật thông tin</h3>
                            <p>• Chúng tôi cam kết bảo mật thông tin cá nhân của bạn.</p>
                            <p>• Thông tin sẽ chỉ được sử dụng cho mục đích cung cấp dịch vụ.</p>

                            <h3>6. Thay đổi điều khoản</h3>
                            <p>ModaMint có quyền cập nhật điều khoản sử dụng bất cứ lúc nào. Chúng tôi sẽ thông báo cho người dùng về các thay đổi quan trọng.</p>

                            <div className={styles.modalFooter}>
                                <p><strong>Cập nhật lần cuối:</strong> 08/12/2025</p>
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.modalCloseButton}
                                onClick={() => setShowTermsModal(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

}
