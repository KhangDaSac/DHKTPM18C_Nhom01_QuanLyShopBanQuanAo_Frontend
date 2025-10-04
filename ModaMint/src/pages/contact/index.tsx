import { useState } from 'react';
import './style.css';

interface ContactForm {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

export default function ContactPage() {
    const [formData, setFormData] = useState<ContactForm>({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitStatus('success');
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });

            // Reset success message after 3 seconds
            setTimeout(() => setSubmitStatus(null), 3000);
        }, 1000);
    };

    return (
        <div className="contact-page">
            <div className="contact-header">
                <h1>Liên Hệ Với Chúng Tôi</h1>
                <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
            </div>

            <div className="contact-content">
                {/* Contact Information */}
                <div className="contact-info">
                    <div className="info-section">
                        <h2>Thông Tin Liên Hệ</h2>

                        <div className="info-item">
                            <div className="info-icon">📍</div>
                            <div className="info-details">
                                <h3>Địa chỉ</h3>
                                <p>123 Đường ABC, Quận XYZ<br />Thành phố Hà Nội, Việt Nam</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">📞</div>
                            <div className="info-details">
                                <h3>Điện thoại</h3>
                                <p>Hotline: 1900-xxxx<br />Di động: 0123-456-789</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">✉️</div>
                            <div className="info-details">
                                <h3>Email</h3>
                                <p>info@modamint.com<br />support@modamint.com</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">🕒</div>
                            <div className="info-details">
                                <h3>Giờ làm việc</h3>
                                <p>Thứ 2 - Thứ 6: 8:00 - 18:00<br />Thứ 7 - Chủ nhật: 9:00 - 17:00</p>
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="social-section">
                        <h3>Kết nối với chúng tôi</h3>
                        <div className="social-links">
                            <a href="#" className="social-link facebook">
                                <span className="social-icon">📘</span>
                                Facebook
                            </a>
                            <a href="#" className="social-link instagram">
                                <span className="social-icon">📷</span>
                                Instagram
                            </a>
                            <a href="#" className="social-link twitter">
                                <span className="social-icon">🐦</span>
                                Twitter
                            </a>
                            <a href="#" className="social-link youtube">
                                <span className="social-icon">📺</span>
                                YouTube
                            </a>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="contact-form-section">
                    <h2>Gửi Tin Nhắn Cho Chúng Tôi</h2>

                    {submitStatus === 'success' && (
                        <div className="alert alert-success">
                            ✅ Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                        </div>
                    )}

                    {submitStatus === 'error' && (
                        <div className="alert alert-error">
                            ❌ Có lỗi xảy ra. Vui lòng thử lại sau.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Họ và tên *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Nhập họ và tên của bạn"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Số điện thoại</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                placeholder="Nhập địa chỉ email của bạn"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="subject">Chủ đề *</label>
                            <select
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Chọn chủ đề</option>
                                <option value="general">Thông tin chung</option>
                                <option value="product">Sản phẩm</option>
                                <option value="order">Đơn hàng</option>
                                <option value="support">Hỗ trợ kỹ thuật</option>
                                <option value="complaint">Khiếu nại</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Tin nhắn *</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                required
                                rows={6}
                                placeholder="Nhập nội dung tin nhắn của bạn..."
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner"></span>
                                    Đang gửi...
                                </>
                            ) : (
                                'Gửi tin nhắn'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Map Section */}
            <div className="map-section">
                <h2>Vị Trí Của Chúng Tôi</h2>
                <div className="map-container">
                    <div className="map-placeholder">
                        <div className="map-content">
                            <div className="map-icon">🗺️</div>
                            <p>Bản đồ sẽ được hiển thị tại đây</p>
                            <small>Tích hợp Google Maps hoặc OpenStreetMap</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="faq-section">
                <h2>Câu Hỏi Thường Gặp</h2>
                <div className="faq-list">
                    <div className="faq-item">
                        <h3>🛍️ Làm thế nào để đặt hàng?</h3>
                        <p>Bạn có thể đặt hàng trực tuyến trên website hoặc đến trực tiếp các cửa hàng của chúng tôi.</p>
                    </div>

                    <div className="faq-item">
                        <h3>🚚 Chính sách giao hàng như thế nào?</h3>
                        <p>Chúng tôi giao hàng toàn quốc, miễn phí giao hàng cho đơn hàng từ 500.000đ trở lên.</p>
                    </div>

                    <div className="faq-item">
                        <h3>🔄 Có thể đổi trả hàng không?</h3>
                        <p>Có, bạn có thể đổi trả trong vòng 7 ngày kể từ ngày nhận hàng với điều kiện sản phẩm còn nguyên vẹn.</p>
                    </div>

                    <div className="faq-item">
                        <h3>💳 Những hình thức thanh toán nào được chấp nhận?</h3>
                        <p>Chúng tôi chấp nhận thanh toán bằng tiền mặt, thẻ ngân hàng, ví điện tử và chuyển khoản.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}