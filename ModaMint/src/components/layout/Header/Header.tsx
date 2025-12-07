import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from "./Header.module.css"
import { AiOutlineLeft, AiOutlineRight, AiOutlineSearch, AiOutlineHeart, AiOutlineUser, AiOutlineShoppingCart, AiFillCaretDown } from "react-icons/ai";

import { useAuth } from '@/contexts/authContext';
import { useCart } from '@/hooks/useCart';
import { cartService } from '@/services/cart';
import { categoryService, type Category } from '@/services/category';
import { brandService, type BrandResponse } from '@/services/brand';

export default function Header() {
    const navigate = useNavigate();
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
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<BrandResponse[]>([]);
    const { isAuthenticated, user, logout } = useAuth();

    const { getTotalItems, setCartFromBackend } = useCart();

    // Load categories from database
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryService.getAllCategories();
                if (res.code === 1000 && res.result) {
                    const activeCategories = res.result.filter(cat => cat.isActive);
                    setAllCategories(activeCategories);
                    // Filter only active top-level categories (no parentId)
                    const topCategories = activeCategories.filter(cat => !cat.parentId);
                    setCategories(topCategories);
                }
            } catch (error) {
                console.error('Failed to load categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Load brands from database
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await brandService.getActiveBrands();
                if (res.code === 1000 && res.result) {
                    setBrands(res.result);
                }
            } catch (error) {
                console.error('Failed to load brands:', error);
            }
        };
        fetchBrands();
    }, []);

    // Get subcategories for a parent category
    const getSubcategories = (parentId: number): Category[] => {
        return allCategories.filter(cat => cat.parentId === parentId);
    };

    // Refresh cart every 2 seconds to update badge count
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await cartService.getCart();
                if (res.success && res.data) {
                    setCartFromBackend(res.data);
                }
            } catch (error) {
                console.error('Failed to refresh cart:', error);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [setCartFromBackend]);

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
        setSlideDirection("left");
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
        setSlideDirection("right");
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentAnnouncementIndex(
                (prevIndex) => (prevIndex + 1) % announcements.length
            );
            setTimeout(() => {
                setIsTransitioning(false);
                setSlideDirection(null);
            }, 10);
        }, 300);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

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
                            <form onSubmit={handleSearch} className={styles['header__search-box']}>
                                <input type="text"
                                    className={styles['header__search-input']}
                                    placeholder='Tìm kiếm...'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className={styles['header__search-button']}>
                                    <AiOutlineSearch />
                                </button>
                            </form>
                        </div>
                        <div className={styles.header__actions}>
                            <Link to="/favorites" className={`${styles.header__action} ${styles['header__action--link']}`}>
                                <AiOutlineHeart className={styles['header__action-icon']} />
                                <span className={styles['header__action-text']}>Yêu thích</span>
                            </Link>
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
                            <Link to="/carts" className={`${styles.header__action} ${styles['header__action--link']}`}>
                                <div className={styles['header__cart-wrapper']}>
                                    <AiOutlineShoppingCart className={styles['header__action-icon']} />
                                    <span className={styles['header__cart-count']}>{getTotalItems()}</span>
                                </div>
                                <span className={styles['header__action-text']}>Giỏ hàng</span>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className={styles.header__menu}>
                    <div className={styles.header__container}>
                        <ul className={styles.header__nav}>
                            <li className={`${styles.header__item} ${styles['header__item--active']}`}>
                                <Link to="/">Trang chủ</Link>
                            </li>
                            <li className={styles.header__item}>
                                <Link to="/products">Sản Phẩm</Link>
                            </li>
                            {/* Menu Danh mục - Load from database */}
                            <li className={`${styles.header__item} ${styles['header__item--dropdown']}`}>
                                <Link to="/products">
                                    Danh mục <AiFillCaretDown className={styles['header__menu-arrow']} />
                                </Link>
                                <div className={styles.header__submenu}>
                                    {categories.length === 0 ? (
                                        <div className={styles['header__submenu-column']}>
                                            <p className="text-gray-400 text-sm">Đang tải...</p>
                                        </div>
                                    ) : (
                                        categories.map((parentCategory) => {
                                            const subcategories = getSubcategories(parentCategory.id);
                                            return (
                                                <div key={parentCategory.id} className={styles['header__submenu-column']}>
                                                    <h3>
                                                        <Link to={`/products?categoryId=${parentCategory.id}`}>
                                                            {parentCategory.name}
                                                        </Link>
                                                    </h3>
                                                    {subcategories.length > 0 && (
                                                        <ul>
                                                            {subcategories.map((subCategory) => (
                                                                <li key={subCategory.id}>
                                                                    <Link to={`/products?categoryId=${subCategory.id}`}>
                                                                        {subCategory.name}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </li>
                            {/* Menu Thương hiệu - Load from database */}
                            <li className={`${styles.header__item} ${styles['header__item--dropdown']}`}>
                                <Link to="/products">
                                    Thương hiệu <AiFillCaretDown className={styles['header__menu-arrow']} />
                                </Link>
                                <div className={styles.header__submenu}>
                                    {brands.length === 0 ? (
                                        <div className={styles['header__submenu-column']}>
                                            <p className="text-gray-400 text-sm">Đang tải...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Split brands into 3 columns */}
                                            {Array.from({ length: 3 }).map((_, colIndex) => {
                                                const brandsPerColumn = Math.ceil(brands.length / 3);
                                                const startIndex = colIndex * brandsPerColumn;
                                                const endIndex = Math.min(startIndex + brandsPerColumn, brands.length);
                                                const columnBrands = brands.slice(startIndex, endIndex);

                                                return columnBrands.length > 0 ? (
                                                    <div key={colIndex} className={styles['header__submenu-column']}>
                                                        <ul>
                                                            {columnBrands.map((brand) => (
                                                                <li key={brand.id}>
                                                                    <Link to={`/products?brandId=${brand.id}`}>
                                                                        {brand.name}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ) : null;
                                            })}
                                        </>
                                    )}
                                </div>
                            </li>
                            <li className={styles.header__item}>
                                <Link to="/news">Tin tức</Link>
                            </li>
                            <li className={styles.header__item}>
                                <Link to="/contact">Liên hệ</Link>
                            </li>
                            <li className={styles.header__item}>
                                <Link to="/stores">Hệ thống cửa hàng</Link>
                            </li>
                            <li className={styles.header__item}>
                                <Link to="/profile/order">Kiểm tra đơn hàng</Link>
                            </li>
                            <li className={styles.header__item}>
                                <Link to="/detail/1">Chi tiết sản phẩm</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}
