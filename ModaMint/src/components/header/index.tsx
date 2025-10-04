import type { GetProps, Input } from 'antd';
import Search from 'antd/es/input/Search'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import "./style.css"
import { AiOutlineLeft, AiOutlineRight, AiOutlineSearch, AiOutlineHeart, AiOutlineUser, AiOutlineShoppingCart, AiFillCaretDown } from "react-icons/ai";


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
            <div className='header'>
                <div className='header__topbar'>
                    <div className='container'>
                        <button
                            className='btn-outline rounded-3xl bg-white text-orange-400 text-xs cursor-pointer'
                            onClick={showPreviousAnnouncement}
                        >
                            <AiOutlineLeft />
                        </button>
                        <div className="announcement-container">
                            <p className={`text-white text-2xl ${slideDirection === 'left'
                                ? 'slide-left'
                                : slideDirection === 'right'
                                    ? 'slide-right'
                                    : 'slide-active'}`}>
                                {announcements[currentAnnouncementIndex]}
                            </p>
                        </div>
                        <button
                            className='btn-outline rounded-3xl bg-white text-orange-400 text-xs cursor-pointer'
                            onClick={showNextAnnouncement}
                        >
                            <AiOutlineRight />
                        </button>
                    </div>
                </div>
                <div className='header__middle'>
                    <div className="container">
                        <div className="logo-container">
                            <Link to="/">
                                <img src="../../../public/header/logo.webp" alt="ND Style" className='header-logo' />
                            </Link>
                        </div>
                        <div className='search-container'>
                            <div className='search-box'>
                                <input type="text"
                                    className='search-input'
                                    placeholder='Tìm kiếm...'
                                />
                                <button className='search-button'>
                                    <AiOutlineSearch />
                                </button>
                            </div>
                        </div>
                        <div className='header-actions'>
                            <div className='action-item'>
                                <AiOutlineHeart className='action-icon' />
                                <span className='action-text'>Yêu thích</span>
                            </div>
                            <div className='action-item has-account-submenu'>
                                <AiOutlineUser className='action-icon' />
                                <span className='action-text'>Tài khoản</span>
                                <div className="account-submenu">
                                    <ul>
                                        <li><Link to="/dang-nhap">Đăng nhập</Link></li>
                                        <li><Link to="/dang-ky">Đăng ký</Link></li>
                                    </ul>
                                </div>
                            </div>
                            <div className='action-item'>
                                <div className='cart-icon-wrapper'>
                                    <AiOutlineShoppingCart className='action-icon' />
                                    <span className='cart-count'>1</span>
                                </div>
                                <span className='action-text'>Giỏ hàng</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='header__menu'>
                    <div className="container">
                        <ul className='menu-list'>
                            <li className='menu-item active'><Link to="/">Trang chủ</Link></li>
                            <li className='menu-item has-submenu'>
                                <Link to="/nam">Nam <AiFillCaretDown className="menu-arrow" /></Link>
                                <div className="submenu">
                                    <div className="submenu-column">
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
                            <li className='menu-item has-submenu'>
                                <Link to="/nu">Nữ <AiFillCaretDown className="menu-arrow" /></Link>
                                <div className="submenu">
                                    <div className="submenu-column">
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
                            <li className='menu-item'><Link to="/news">Tin tức</Link></li>
                            <li className='menu-item'><Link to="/contact">Liên hệ</Link></li>
                            <li className='menu-item'><Link to="/stores">Hệ thống cửa hàng</Link></li>
                            <li className='menu-item'><Link to="/kiem-tra-don-hang">Kiểm tra đơn hàng</Link></li>
                            <li className='menu-item'><Link to="/chi-tiet-san-pham">Chi tiết sản phẩm</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}
