
import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from "./style.module.css"
import { AiOutlineLeft, AiOutlineRight, AiOutlineSearch, AiOutlineHeart, AiOutlineUser, AiOutlineShoppingCart, AiFillCaretDown } from "react-icons/ai";

import { useAuth } from '../../contexts/authContext';
// ...existing code...

export default function Header() {
    const announcements = [
        "CHÀO ĐÓN BỘ SƯU TẬP ĐÔNG 2025",
        "PHÁI ĐẸP ĐỂ YÊU",
        "VẠN DEAL CƯNG CHIỀU",
        "ĐỒ MẶC CẢ NHÀ",
        "ÊM ÁI CẢ NGÀY"
    ];
    const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const getDisplayName = () => {
        if (user) {
            if (user.firstName && user.lastName) {
                return `${user.firstName} ${user.lastName}`;
            }
            return user.username;
        }
        return null;
    };
    const displayName = getDisplayName();

    const showPreviousAnnouncement = () => {
        if (isTransitioning) return;
        setSlideDirection('left');
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentAnnouncementIndex((prevIndex) =>
                prevIndex === 0 ? announcements.length - 1 : prevIndex - 1
            );
            setTimeout(() => {
                setIsTransitioning(false);
                setSlideDirection(null);
            }, 10);
        }, 300);
    };

    const showNextAnnouncement = () => {
        if (isTransitioning) return;
        setSlideDirection('right');
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentAnnouncementIndex((prevIndex) =>
                (prevIndex + 1) % announcements.length
            );
            setTimeout(() => {
                setIsTransitioning(false);
                setSlideDirection(null);
            }, 10);
        }, 300);
    };

    // No auto-rotation needed

    return (
        <>
            <div className={styles.header}>
                <div className={styles.header__topbar}>
                    <div className={styles.header__container}>
                        <button
                            className={`${styles['header__btn-outline']} rounded-3xl bg-white text-orange-400 text-xs cursor-pointer`}
                            onClick={showPreviousAnnouncement}
                        >
                            <AiOutlineLeft />
                        </button>
                        <div className={styles['header__announcement-container']}>
                            <p className={`text-white text-2xl ${styles[slideDirection === 'left'
                                ? 'header__slide-left'
                                : slideDirection === 'right'
                                    ? 'header__slide-right'
                                    : 'header__slide-active']}`}>
                                {announcements[currentAnnouncementIndex]}
                            </p>
                        </div>
                        <button
                            className={`${styles['header__btn-outline']} rounded-3xl bg-white text-orange-400 text-xs cursor-pointer`}
                            onClick={showNextAnnouncement}
                        >
                            <AiOutlineRight />
                        </button>
                    </div>
                </div>
                <div className={styles.header__middle}>
                    <div className={styles.header__container}>
                        <div className={styles['header__logo-container']}>
                            <Link to="/">
                                <img src="/header/logo.webp" alt="ND Style" className={styles.header__logo} />
                            </Link>
                        </div>
                        <div className={styles['header__search-container']}>
                            <div className={styles['header__search-box']}>
                                <input type="text"
                                    className={styles['header__search-input']}
                                    placeholder='Tìm kiếm...'
                                />
                                <button className={styles['header__search-button']}>
                                    <AiOutlineSearch />
                                </button>
                            </div>
                        </div>
                        <div className={styles.header__actions}>
                            <div className={styles.header__action}>
                                <AiOutlineHeart className={styles['header__action-icon']} />
                                <span className={styles['header__action-text']}>Yêu thích</span>
                            </div>
                            <div className={`${styles.header__action} ${styles['header__action--account']}`}>
                                <AiOutlineUser className={styles['header__action-icon']} />
                                <span className={styles['header__action-text']}>
                                    {isAuthenticated && displayName ? displayName : 'Tài khoản'}
                                </span>
                                <div className={styles['header__account-submenu']}>
                                    <ul>
                                        {isAuthenticated ? (
                                            <>
                                                <li><Link to="/profile">Thông tin cá nhân</Link></li>
                                                <li><button onClick={logout} className={styles['header__logout-button']}>Đăng xuất</button></li>
                                            </>
                                        ) : (
                                            <>
                                                <li><Link to="/login">Đăng nhập</Link></li>
                                                <li><Link to="/register">Đăng ký</Link></li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>
                            <div className={styles.header__action}>
                                <div className={styles['header__cart-wrapper']}>
                                    <AiOutlineShoppingCart className={styles['header__action-icon']} />
                                    <span className={styles['header__cart-count']}>1</span>
                                </div>
                                <span className={styles['header__action-text']}>Giỏ hàng</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.header__menu}>
                    <div className={styles.header__container}>
                        <ul className={styles.header__nav}>
                            <li className={`${styles.header__item} ${styles['header__item--active']}`}><Link to="/">Trang chủ</Link></li>
                            <li className={`${styles.header__item} ${styles['header__item--dropdown']}`}>
                                <Link to="/nam">Nam <AiFillCaretDown className={styles['header__menu-arrow']} /></Link>
                                <div className={styles.header__submenu}>
                                    <div className={styles['header__submenu-column']}>
                                        <h3>Danh mục</h3>
                                        <ul>
                                            <li><Link to="/nam/ao">Áo</Link></li>
                                            <li><Link to="/nam/quan">Quần</Link></li>
                                            <li><Link to="/nam/giay">Giày</Link></li>
                                            <li><Link to="/nam/phu-kien">Phụ kiện</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </li>
                            <li className={`${styles.header__item} ${styles['header__item--dropdown']}`}>
                                <Link to="/nu">Nữ <AiFillCaretDown className={styles['header__menu-arrow']} /></Link>
                                <div className={styles.header__submenu}>
                                    <div className={styles['header__submenu-column']}>
                                        <h3>Danh mục</h3>
                                        <ul>
                                            <li><Link to="/nu/ao">Áo</Link></li>
                                            <li><Link to="/nu/quan">Quần</Link></li>
                                            <li><Link to="/nu/vay">Váy</Link></li>
                                            <li><Link to="/nu/giay">Giày</Link></li>
                                            <li><Link to="/nu/phu-kien">Phụ kiện</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </li>
                            <li className={styles.header__item}><Link to="/news">Tin tức</Link></li>
                            <li className={styles.header__item}><Link to="/contact">Liên hệ</Link></li>
                            <li className={styles.header__item}><Link to="/stores">Hệ thống cửa hàng</Link></li>
                            <li className={styles.header__item}><Link to="/kiem-tra-don-hang">Kiểm tra đơn hàng</Link></li>
                            <li className={styles.header__item}><Link to="/detail/1">Chi tiết sản phẩm</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}
