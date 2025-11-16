import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { cartService } from '@/services/cart';
import type { CartDto } from '@/services/cart';
import {
    getAvailablePromotions,
    processCheckout,
    getCustomerAddresses,
    createAddress,
    type CreateAddressRequest
} from '../../services/checkout';
import type { PromotionSummary, AddressResponse, CheckoutRequest } from '../../services/checkout';
import { toast } from 'react-toastify';
import { vietnamAddressService } from '@/services/address/vietnamAddress';
import type { Province, District, Ward } from '@/services/address/vietnamAddress';
import styles from './style.module.css';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [cart, setCart] = useState<CartDto | null>(null);
    const [addresses, setAddresses] = useState<AddressResponse[]>([]);
    const [promotions, setPromotions] = useState<PromotionSummary[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [selectedPromotion, setSelectedPromotion] = useState<PromotionSummary | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'BANK_TRANSFER' | 'E_WALLET'>('CASH_ON_DELIVERY');
    const [phone, setPhone] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [showAddressInput, setShowAddressInput] = useState(false);

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
    const [selectedWard, setSelectedWard] = useState<number | null>(null);
    const [addressDetail, setAddressDetail] = useState('');

    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [applyingPromo, setApplyingPromo] = useState(false);

    const cartItems = cart?.items || [];
    const subtotal = cart?.subtotal || cartItems.reduce((sum, item) => {
        const price = item.unitPrice || 0;
        const qty = item.quantity || 0;
        return sum + (price * qty);
    }, 0);
    const shippingFee = cart?.shipping || 30000;
    const discountAmount = selectedPromotion
        ? (selectedPromotion.type === 'PERCENTAGE'
            ? (subtotal * (selectedPromotion.discountPercent || 0) / 100)
            : (selectedPromotion.discountAmount || 0))
        : 0;
    const totalAmount = subtotal + shippingFee - discountAmount;

    const applyPromoCode = async () => {
        if (!promoCodeInput.trim()) {
            toast.warning('Vui lòng nhập mã giảm giá');
            return;
        }
        setApplyingPromo(true);
        try {
            const promo = promotions.find(p => p.code.toUpperCase() === promoCodeInput.toUpperCase());
            if (promo) {
                setSelectedPromotion(promo);
                toast.success(`Áp dụng mã giảm giá "${promo.code}" thành công!`);
                setPromoCodeInput('');
            } else {
                toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn');
            }
        } catch (error) {
            toast.error('Có lỗi khi áp dụng mã giảm giá');
        } finally {
            setApplyingPromo(false);
        }
    };

    const removePromoCode = () => {
        setSelectedPromotion(null);
        setPromoCodeInput('');
        toast.info('Đã bỏ mã giảm giá');
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadCheckoutData();
        loadProvinces();
    }, [user]);

    const loadProvinces = async () => {
        try {
            const provincesData = await vietnamAddressService.getProvinces();
            setProvinces(provincesData);
        } catch (error) {
            console.error('Error loading provinces:', error);
        }
    };

    const handleProvinceChange = async (provinceCode: number) => {
        setSelectedProvince(provinceCode);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);
        const districtsData = await vietnamAddressService.getDistricts(provinceCode);
        setDistricts(districtsData);
    };

    const handleDistrictChange = async (districtCode: number) => {
        setSelectedDistrict(districtCode);
        setSelectedWard(null);
        setWards([]);
        const wardsData = await vietnamAddressService.getWards(districtCode);
        setWards(wardsData);
    };

    const handleWardChange = (wardCode: number) => {
        setSelectedWard(wardCode);
    };

    const loadCheckoutData = async () => {
        if (!user?.id) {
            toast.error('Không tìm thấy thông tin người dùng');
            return;
        }
        setLoadingData(true);
        try {
            const cartResult = await cartService.getCart(user.id);
            if (cartResult.success && cartResult.data) {
                setCart(cartResult.data);
            } else {
                setCart(null);
                toast.error('Không thể tải giỏ hàng');
            }

            const addressesData = await getCustomerAddresses(user.id);
            setAddresses(addressesData);
            if (addressesData.length > 0) {
                setSelectedAddressId(addressesData[0].id);
                setShowAddressInput(false);
            } else {
                setShowAddressInput(true);
            }

            const promotionsData = await getAvailablePromotions(user.id);
            setPromotions(promotionsData);

            if (user.phone) setPhone(user.phone);
        } catch (error) {
            toast.error('Không thể tải thông tin thanh toán');
        } finally {
            setLoadingData(false);
        }
    };

    const handleVNPayPayment = async (orderId: number, amount: number) => {
        try {
            const { data } = await axios.post(`${API_URL}/payment/create-payment`, {
                amount,
                orderInfo: `Thanh toan don hang ${orderId}`
            });
            if (data.paymentUrl) {
                await cartService.clearCart();
                const storageKey = `orderData_${orderId}`;
                const storedData = localStorage.getItem(storageKey);
                if (!storedData) {
                    toast.error('Có lỗi xảy ra, vui lòng thử lại');
                    setLoading(false);
                    return;
                }
                window.location.href = data.paymentUrl;
            } else {
                toast.error('Không tạo được link thanh toán VNPay');
                setLoading(false);
            }
        } catch (err) {
            toast.error('Lỗi khi tạo thanh toán VNPay');
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (!phone.trim()) {
            toast.error('Vui lòng nhập số điện thoại');
            return;
        }
        if (!selectedAddressId && !showAddressInput) {
            toast.error('Vui lòng chọn địa chỉ giao hàng hoặc nhập địa chỉ mới');
            return;
        }
        if (showAddressInput) {
            if (!selectedProvince || !selectedDistrict || !selectedWard || !addressDetail.trim()) {
                toast.error('Vui lòng điền đầy đủ thông tin địa chỉ');
                return;
            }
        }
        if (!user?.id) {
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            let addressIdToUse = selectedAddressId;

            if (showAddressInput && selectedProvince && selectedDistrict && selectedWard) {
                const province = provinces.find(p => p.code === selectedProvince);
                const district = districts.find(d => d.code === selectedDistrict);
                const ward = wards.find(w => w.code === selectedWard);

                const newAddressRequest: CreateAddressRequest = {
                    customerId: user.id,
                    city: province?.name || '',
                    district: district?.name || '',
                    ward: ward?.name || '',
                    addressDetail: addressDetail.trim()
                };
                const createdAddress = await createAddress(newAddressRequest);
                addressIdToUse = createdAddress.id;
            }

            if (!addressIdToUse) {
                toast.error('Không thể tạo địa chỉ giao hàng');
                return;
            }

            const request: CheckoutRequest = {
                customerId: user.id,
                shippingAddressId: addressIdToUse,
                paymentMethod,
                phone: phone.trim(),
                note: note.trim(),
            };

            if (selectedPromotion) {
                request.percentagePromotionCode = selectedPromotion.type === 'PERCENTAGE' ? selectedPromotion.code : undefined;
                request.amountPromotionCode = selectedPromotion.type !== 'PERCENTAGE' ? selectedPromotion.code : undefined;
            }

            const response = await processCheckout(request);
            toast.success('Tạo đơn hàng thành công!');

            // Lưu vào localStorage
            localStorage.setItem(`orderData_${response.orderId}`, JSON.stringify(response));

            if (paymentMethod === 'BANK_TRANSFER') {
                await handleVNPayPayment(response.orderId, totalAmount);
            } else {
                await cartService.clearCart();
                navigate(`/order-success/${response.orderId}`, { state: { orderData: response } });
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Đặt hàng thất bại';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loadingData) {
        return (
            <div className={styles.checkout_page}>
                <div className={styles.checkout_card}>
                    <p className={styles.loading_text}>Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (!cart || cartItems.length === 0) {
        return (
            <div className={styles.checkout_page}>
                <div className={styles.checkout_card}>
                    <div className={styles.empty_cart_container}>
                        <h2 className={styles.empty_cart_title}>Giỏ hàng trống</h2>
                        <button onClick={() => navigate('/products')} className={styles.continue_shopping_btn}>
                            Tiếp tục mua sắm
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.checkout_page}>
            <div className={styles.breadcrumb}>
                Trang chủ &nbsp;&gt;&nbsp;
                <span className={styles.breadcrumb_current}> Đơn hàng</span>
            </div>
            <div className={styles.checkout_card}>
                <header className={styles.checkout_header}>
                    <h1 className={styles.checkout_title}>Thông tin đơn hàng</h1>
                </header>

                <div className={styles.grid_container}>
                    {/* Left Column */}
                    <div className={styles.left_column}>
                        {/* Contact Info */}
                        <div className={styles.section_card}>
                            <h2 className={styles.section_title}>Thông tin liên hệ</h2>
                            <div className={styles.form_group}>
                                <div>
                                    <label className={styles.label}>Họ và tên *</label>
                                    <input
                                        type="text"
                                        value={user?.username || ''}
                                        disabled
                                        className={styles.input_disabled}
                                        placeholder="Tên khách hàng"
                                    />
                                </div>
                                <div>
                                    <label className={styles.label}>Số điện thoại *</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className={styles.input}
                                        placeholder="Nhập số điện thoại"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={styles.label}>Ghi chú</label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className={styles.textarea}
                                        rows={3}
                                        placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className={styles.section_card}>
                            <h2 className={styles.section_title}>Địa chỉ giao hàng</h2>

                            {addresses.length > 0 && (
                                <div className={styles.address_list}>
                                    {addresses.map(addr => (
                                        <label
                                            key={addr.id}
                                            className={`${styles.address_item} ${selectedAddressId === addr.id ? styles.address_selected : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="address"
                                                checked={selectedAddressId === addr.id}
                                                onChange={() => {
                                                    setSelectedAddressId(addr.id);
                                                    setShowAddressInput(false);
                                                }}
                                                className={styles.radio_input}
                                            />
                                            <div>
                                                <p className={styles.address_detail}>{addr.addressDetail}</p>
                                                <p className={styles.address_full}>
                                                    {addr.ward}, {addr.district}, {addr.city}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => setShowAddressInput(!showAddressInput)}
                                className={styles.toggle_address_btn}
                            >
                                {showAddressInput ? 'Hủy nhập địa chỉ mới' : 'Thêm địa chỉ giao hàng mới'}
                            </button>

                            {showAddressInput && (
                                <div className={styles.new_address_grid}>
                                    <div>
                                        <label className={styles.label_small}>Tỉnh/Thành phố *</label>
                                        <select
                                            value={selectedProvince || ''}
                                            onChange={(e) => handleProvinceChange(Number(e.target.value))}
                                            className={styles.select}
                                            required
                                        >
                                            <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                            {provinces.map(province => (
                                                <option key={province.code} value={province.code}>
                                                    {province.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={styles.label_small}>Quận/Huyện *</label>
                                        <select
                                            value={selectedDistrict || ''}
                                            onChange={(e) => handleDistrictChange(Number(e.target.value))}
                                            className={styles.select}
                                            disabled={!selectedProvince}
                                            required
                                        >
                                            <option value="">-- Chọn Quận/Huyện --</option>
                                            {districts.map(district => (
                                                <option key={district.code} value={district.code}>
                                                    {district.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={styles.label_small}>Phường/Xã *</label>
                                        <select
                                            value={selectedWard || ''}
                                            onChange={(e) => handleWardChange(Number(e.target.value))}
                                            className={styles.select}
                                            disabled={!selectedDistrict}
                                            required
                                        >
                                            <option value="">-- Chọn Phường/Xã --</option>
                                            {wards.map(ward => (
                                                <option key={ward.code} value={ward.code}>
                                                    {ward.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={styles.label_small}>Địa chỉ chi tiết *</label>
                                        <input
                                            type="text"
                                            value={addressDetail}
                                            onChange={(e) => setAddressDetail(e.target.value)}
                                            className={styles.input}
                                            placeholder="Số nhà, tên đường..."
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {addresses.length === 0 && !showAddressInput && (
                                <p className={styles.no_address_hint}>Chưa có địa chỉ đã lưu. Vui lòng nhập địa chỉ giao hàng.</p>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className={styles.section_card}>
                            <h2 className={styles.section_title}>Phương thức thanh toán</h2>
                            <div className={styles.payment_options}>
                                <label className={styles.payment_item}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="CASH_ON_DELIVERY"
                                        checked={paymentMethod === 'CASH_ON_DELIVERY'}
                                        onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                                        className={styles.radio_input}
                                    />
                                    <span>Thanh toán khi nhận hàng (COD)</span>
                                </label>
                                <label className={styles.payment_item}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="BANK_TRANSFER"
                                        checked={paymentMethod === 'BANK_TRANSFER'}
                                        onChange={() => setPaymentMethod('BANK_TRANSFER')}
                                        className={styles.radio_input}
                                    />
                                    <span>Chuyển khoản ngân hàng (VNPay)</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className={styles.right_column}>
                        <div className={styles.summary_card}>
                            <h2 className={styles.section_title}>Đơn hàng ({cartItems.length} sản phẩm)</h2>

                            <div className={styles.product_list}>
                                {cartItems.map((item) => {
                                    // Backend may return different field names: prefer imageUrl > image, price > unitPrice
                                    const itemImage = (item as any).imageUrl || item.image || '/placeholder.png';
                                    const itemName = item.productName || (item as any).productName || 'Sản phẩm';
                                    const itemPrice = (item.unitPrice ?? (item as any).price) ?? 0;
                                    const itemQty = item.quantity || 0;
                                    const itemTotal = (item.totalPrice ?? (item as any).totalPrice) ?? (itemPrice * itemQty);
                                    const itemId = item.itemId || item.id || item.variantId || item.productId || Math.random();

                                    return (
                                        <div key={itemId} className={styles.product_item}>
                                            <img
                                                src={itemImage}
                                                alt={itemName}
                                                className={styles.product_image}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/placeholder.png';
                                                }}
                                            />
                                            <div className={styles.product_info}>
                                                <p className={styles.product_name}>{itemName}</p>
                                                <p className={styles.product_price_qty}>
                                                    {formatCurrency(itemPrice)} x {itemQty}
                                                </p>
                                            </div>
                                            <p className={styles.product_total}>{formatCurrency(itemTotal)}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Promotions */}
                            <div className={styles.promotion_section}>
                                <h3 className={styles.promotion_title}>Mã giảm giá</h3>

                                <div className={styles.promo_input_group}>
                                    <input
                                        type="text"
                                        value={promoCodeInput}
                                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                                        className={styles.promo_input}
                                        placeholder="Nhập mã giảm giá"
                                        disabled={selectedPromotion !== null}
                                    />
                                    {selectedPromotion ? (
                                        <button onClick={removePromoCode} className={styles.promo_remove_btn}>
                                            Bỏ
                                        </button>
                                    ) : (
                                        <button
                                            onClick={applyPromoCode}
                                            disabled={applyingPromo || !promoCodeInput.trim()}
                                            className={styles.promo_apply_btn}
                                        >
                                            {applyingPromo ? 'Đang áp dụng...' : 'Áp dụng'}
                                        </button>
                                    )}
                                </div>

                                {selectedPromotion && (
                                    <div className={styles.promo_applied}>
                                        <p className={styles.promo_applied_name}>✓ {selectedPromotion.name}</p>
                                        <p className={styles.promo_discount}>
                                            Giảm {selectedPromotion.type === 'PERCENTAGE'
                                                ? `${selectedPromotion.discountPercent}%`
                                                : `${formatCurrency(selectedPromotion.discountAmount || 0)}`}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {promotions.length > 0 && !selectedPromotion && (
                                <div className={styles.available_promos}>
                                    <p className={styles.available_promos_label}>Chọn mã có sẵn:</p>
                                    <div className={styles.promo_list}>
                                        {promotions.map(promo => (
                                            <div
                                                key={promo.id}
                                                className={styles.promo_item}
                                                onClick={() => {
                                                    setSelectedPromotion(promo);
                                                    toast.success(`Áp dụng mã "${promo.code}" thành công!`);
                                                }}
                                            >
                                                <p className={styles.promo_name}>{promo.name}</p>
                                                <p className={styles.promo_code}>
                                                    Mã: {promo.code} - Giảm {promo.type === 'PERCENTAGE'
                                                        ? `${promo.discountPercent}%`
                                                        : `${formatCurrency(promo.discountAmount || 0)}`}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Price Summary */}
                            <div className={styles.price_summary}>
                                <div className={styles.price_row}>
                                    <span className={styles.price_label}>Tạm tính ({cartItems.length} sản phẩm):</span>
                                    <span className={styles.price_value}>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className={styles.price_row}>
                                    <span className={styles.price_label}>Phí vận chuyển:</span>
                                    <span className={styles.price_value}>{formatCurrency(shippingFee)}</span>
                                </div>
                                {selectedPromotion && (
                                    <div className={styles.price_row_discount}>
                                        <span>Giảm giá ({selectedPromotion.code}):</span>
                                        <span>-{formatCurrency(discountAmount)}</span>
                                    </div>
                                )}
                                <div className={styles.total_row}>
                                    <span>Tổng cộng:</span>
                                    <span className={styles.total_amount}>{formatCurrency(totalAmount)}</span>
                                </div>
                            </div>

                            {/* Warnings */}
                            {!phone && <div className={styles.warning_box}>Vui lòng nhập số điện thoại</div>}
                            {!selectedAddressId && !showAddressInput && <div className={styles.warning_box}>Vui lòng chọn hoặc nhập địa chỉ giao hàng</div>}
                            {showAddressInput && (!selectedProvince || !selectedDistrict || !selectedWard || !addressDetail.trim()) && (
                                <div className={styles.warning_box}>Vui lòng điền đầy đủ thông tin địa chỉ</div>
                            )}

                            <button
                                onClick={handleCheckout}
                                disabled={
                                    loading ||
                                    !phone ||
                                    (!selectedAddressId && !showAddressInput) ||
                                    (showAddressInput && (!selectedProvince || !selectedDistrict || !selectedWard || !addressDetail.trim()))
                                }
                                className={styles.checkout_button}
                            >
                                {loading ? (
                                    <span className={styles.loading_button}>
                                        <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className={styles.spinner_circle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className={styles.spinner_path} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý đơn hàng...
                                    </span>
                                ) : (
                                    'Đặt hàng ngay'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;