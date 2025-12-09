import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from "./Header.module.css"
import { AiOutlineLeft, AiOutlineRight, AiOutlineSearch, AiOutlineHeart, AiOutlineUser, AiOutlineShoppingCart, AiFillCaretDown } from "react-icons/ai";

import { useAuth } from '@/contexts/authContext';
import { useCart } from '@/hooks/useCart';
import { cartService } from '@/services/cart';
import { productService } from '@/services/product';
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
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const debounceRef = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [modalStyle, setModalStyle] = useState<React.CSSProperties | undefined>(undefined);

    // compute modal position from input bounding rect
    const updateModalPosition = () => {
        const el = inputRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const style: React.CSSProperties = {
            position: 'fixed',
            top: r.bottom + 8,
            left: r.left,
            width: r.width,
            zIndex: 10000,
        };
        setModalStyle(style);
    };

    useEffect(() => {
        if (!showSearchModal) return;
        updateModalPosition();
        const onResize = () => updateModalPosition();
        window.addEventListener('resize', onResize);
        window.addEventListener('scroll', onResize, true);
        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('scroll', onResize, true);
        };
    }, [showSearchModal]);
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

    // Autocomplete: fetch suggestions when user types (debounced)
    useEffect(() => {
        const q = searchQuery.trim();
        console.debug('Header: searchQuery changed ->', q);

        if (debounceRef.current) {
            window.clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }

        // Trigger suggestions from 1 character so user sees modal while typing
        if (q.length >= 1) {
            // show modal immediately (loading state) so suggestions appear while debounce runs
            setShowSearchModal(true);
            setSearchResults([]);
            debounceRef.current = window.setTimeout(async () => {
                try {
                    setSearchLoading(true);
                    const res = await productService.searchProductsByName(q);
                    console.debug('Header: autocomplete response', res);
                    if (res.success && res.data) {
                        setSearchResults(res.data.slice(0, 8));
                    } else {
                        setSearchResults([]);
                    }
                } catch (err) {
                    console.error('Autocomplete search error:', err);
                    setSearchResults([]);
                } finally {
                    setSearchLoading(false);
                }
            }, 250);
        } else {
            setShowSearchModal(false);
            setSearchResults([]);
        }

        return () => {
            if (debounceRef.current) {
                window.clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
        };
    }, [searchQuery]);

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
                                <input ref={inputRef} type="text"
                                    className={styles['header__search-input']}
                                    placeholder='Tìm kiếm...'
                                    value={searchQuery}
                                    onChange={(e) => { console.debug('Header input onChange:', e.target.value); setSearchQuery(e.target.value); }}
                                    onFocus={() => { console.debug('Header input onFocus'); setShowSearchModal(true); updateModalPosition(); }}
                                    onBlur={() => { console.debug('Header input onBlur'); setTimeout(() => setShowSearchModal(false), 200); }}
                                    onKeyDown={(e) => { console.debug('Header input onKeyDown:', e.key); }}
                                    onKeyUp={(e) => { console.debug('Header input onKeyUp:', e.key); }}
                                    onInput={(e: any) => { console.debug('Header input onInput:', e.target.value); }}
                                />
                                {/* debug badge removed */}
                                <button type="submit" className={styles['header__search-button']}>
                                    <AiOutlineSearch />
                                </button>
                            </form>
                            {showSearchModal && (
                                <div className={styles['header__search-modal']} role="list" style={modalStyle}>
                                    {searchLoading ? (
                                        <div className={styles['header__search-modal-loading']}>Đang tìm...</div>
                                    ) : searchResults.length === 0 ? (
                                        <div className={styles['header__search-modal-empty']}>Không có kết quả</div>
                                    ) : (
                                        <ul className={styles['header__search-modal-list']}>
                                            {searchResults.slice(0, 5).map((p: any) => {
                                                const img = (p.images && p.images.length > 0) ? p.images[0] : (p.image || '/default-product.png');

                                                // Prefer variant pricing when available
                                                const variant = (p.productVariants && p.productVariants.length > 0) ? p.productVariants[0] : undefined;
                                                const rawOriginal = variant?.originalPrice ?? variant?.price ?? p.originalPrice ?? p.price ?? p.listPrice ?? null;
                                                const rawCurrent = variant?.price ?? variant?.currentPrice ?? p.currentPrice ?? p.price ?? p.listPrice ?? null;

                                                const toNumber = (v: any) => {
                                                    if (v == null) return null;
                                                    const n = Number(String(v).replace(/[^0-9.-]+/g, ''));
                                                    return Number.isFinite(n) ? n : null;
                                                };

                                                const original = toNumber(rawOriginal);
                                                const current = toNumber(rawCurrent) ?? original;

                                                // Prefer explicit discount fields if provided (variant or product level)
                                                const rawExplicitDiscount = variant?.discountPercent ?? variant?.discount ?? p.discountPercent ?? p.discount ?? null;
                                                const parseDiscount = (d: any) => {
                                                    if (d == null) return null;
                                                    const n = Number(String(d).replace(/[^0-9.-]+/g, ''));
                                                    if (!Number.isFinite(n)) return null;
                                                    // if discount expressed as fraction (0.2) assume fraction and convert to percent
                                                    if (n > 0 && n <= 1) return Math.round(n * 100);
                                                    return Math.round(n);
                                                };

                                                let discount = parseDiscount(rawExplicitDiscount);
                                                if (discount == null && original && current && original > current) {
                                                    discount = Math.round((1 - current / original) * 100);
                                                }

                                                const displayPrice = (value: number | null) => value != null ? `${value.toLocaleString('vi-VN')}đ` : '';

                                                return (
                                                    <li key={p.id} className={styles['header__search-modal-item']} onMouseDown={() => { navigate(`/detail/${p.id}`); setShowSearchModal(false); }}>
                                                        <img src={img} alt={p.name} className={styles['header__search-modal-item-img']} />
                                                        <div className={styles['header__search-modal-item-body']}>
                                                            <div className={styles['header__search-modal-item-name']}>{p.name}</div>
                                                            {p.description && <div className={styles['header__search-modal-item-desc']}>{String(p.description).slice(0, 80)}</div>}
                                                            <div className={styles['header__search-modal-item-price-row']}>
                                                                <div className={styles['header__search-modal-item-price']}>{displayPrice(current)}</div>
                                                                {discount ? (
                                                                    <div className={styles['header__search-modal-item-discount']}>-{discount}%</div>
                                                                ) : (original && original !== current) ? (
                                                                    <div className={styles['header__search-modal-item-original']}>{displayPrice(original)}</div>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            )}
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
