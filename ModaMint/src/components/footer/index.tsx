import { Link } from 'react-router-dom';
import styles from './style.module.css';
import { FaTiktok, FaInstagram, FaFacebookF, FaYoutube, FaTwitter } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footer__wrapper}>
                <div className={styles.footer__branding}>
                    <div className={styles['footer__branding-inner']}>
                        <div className={styles['footer__branding-left']}>
                            <div className={styles['footer__logo-container']}>
                                <img src="/header/logoFooter.webp" alt="ND Style" className={styles.footer__logo} />
                            </div>
                        </div>

                        <div className={styles['footer__branding-right']}>
                            <h3>KẾT NỐI</h3>
                            <div className={styles['footer__social-icons']}>
                                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
                                    <FaTiktok className={styles['footer__social-icon']} />
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                                    <FaInstagram className={styles['footer__social-icon']} />
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                                    <FaFacebookF className={styles['footer__social-icon']} />
                                </a>
                                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                                    <FaYoutube className={styles['footer__social-icon']} />
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                                    <FaTwitter className={styles['footer__social-icon']} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.footer__info}>
                    <div className={styles.footer__col}>
                        <h3>CÔNG TY ND THEME</h3>
                        <p>Số ĐKKD 0135792468 cấp ngày 30/05/2023 tại Sở Kế hoạch Đầu tư TP. Hà Nội</p>
                        <p><strong>Địa chỉ:</strong> 266 Đội Cấn, Ba Đình, Hà Nội</p>
                        <p><strong>Email:</strong> support@sapo.vn</p>
                        <p><strong>Hotline:</strong> 1900 6750</p>
                    </div>

                    <div className={styles.footer__col}>
                        <h3>VỀ CHÚNG TÔI</h3>
                        <ul className={styles.footer__links}>
                            <li><Link to="/gioi-thieu">Giới thiệu</Link></li>
                            <li><Link to="/lien-he">Liên hệ</Link></li>
                            <li><Link to="/tin-tuc">Tin tức</Link></li>
                            <li><Link to="/he-thong-cua-hang">Hệ thống cửa hàng</Link></li>
                            <li><Link to="/san-pham">Sản phẩm</Link></li>
                        </ul>
                    </div>

                    <div className={styles.footer__col}>
                        <h3>DỊCH VỤ KHÁCH HÀNG</h3>
                        <ul className={styles.footer__links}>
                            <li><Link to="/kiem-tra-don-hang">Kiểm tra đơn hàng</Link></li>
                            <li><Link to="/chinh-sach-van-chuyen">Chính sách vận chuyển</Link></li>
                            <li><Link to="/chinh-sach-doi-tra">Chính sách đổi trả</Link></li>
                            <li><Link to="/bao-mat-khach-hang">Bảo mật khách hàng</Link></li>
                            <li><Link to="/dang-ky-tai-khoan">Đăng ký tài khoản</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className={styles.footer__bottom}>
                <div className={styles.footer__copyright}>
                    <p>© Bản quyền thuộc về ND Theme | Cung cấp bởi Sapo</p>
                </div>
            </div>
        </footer>
    )
}