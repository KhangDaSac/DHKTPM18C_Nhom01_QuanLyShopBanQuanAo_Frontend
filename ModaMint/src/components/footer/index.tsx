import { Link } from 'react-router-dom';
import './style.css';
import { FaTiktok, FaInstagram, FaFacebookF, FaYoutube, FaTwitter } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-wrapper">
                <div className="footer__branding">
                    <div className="footer__branding-inner">
                        <div className="footer__left-section">
                            <div className="footer__logo-container">
                                <img src="/header/logoFooter.webp" alt="ND Style" className="footer__logo" />
                            </div>
                        </div>

                        <div className="footer__right-section">
                            <h3>KẾT NỐI</h3>
                            <div className="social-icons">
                                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
                                    <FaTiktok className="social-icon" />
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                                    <FaInstagram className="social-icon" />
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                                    <FaFacebookF className="social-icon" />
                                </a>
                                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                                    <FaYoutube className="social-icon" />
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                                    <FaTwitter className="social-icon" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer__info">
                    <div className="footer__col">
                        <h3>CÔNG TY ND THEME</h3>
                        <p>Số ĐKKD 0135792468 cấp ngày 30/05/2023 tại Sở Kế hoạch Đầu tư TP. Hà Nội</p>
                        <p><strong>Địa chỉ:</strong> 266 Đội Cấn, Ba Đình, Hà Nội</p>
                        <p><strong>Email:</strong> support@sapo.vn</p>
                        <p><strong>Hotline:</strong> 1900 6750</p>
                    </div>

                    <div className="footer__col">
                        <h3>VỀ CHÚNG TÔI</h3>
                        <ul className="footer__links">
                            <li><Link to="/gioi-thieu">Giới thiệu</Link></li>
                            <li><Link to="/lien-he">Liên hệ</Link></li>
                            <li><Link to="/tin-tuc">Tin tức</Link></li>
                            <li><Link to="/he-thong-cua-hang">Hệ thống cửa hàng</Link></li>
                            <li><Link to="/san-pham">Sản phẩm</Link></li>
                        </ul>
                    </div>

                    <div className="footer__col">
                        <h3>DỊCH VỤ KHÁCH HÀNG</h3>
                        <ul className="footer__links">
                            <li><Link to="/kiem-tra-don-hang">Kiểm tra đơn hàng</Link></li>
                            <li><Link to="/chinh-sach-van-chuyen">Chính sách vận chuyển</Link></li>
                            <li><Link to="/chinh-sach-doi-tra">Chính sách đổi trả</Link></li>
                            <li><Link to="/bao-mat-khach-hang">Bảo mật khách hàng</Link></li>
                            <li><Link to="/dang-ky-tai-khoan">Đăng ký tài khoản</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="footer__bottom">
                <div className="footer__copyright">
                    <p>© Bản quyền thuộc về ND Theme | Cung cấp bởi Sapo</p>
                </div>
            </div>
        </footer>
    )
}