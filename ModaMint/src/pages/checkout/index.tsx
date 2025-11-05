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

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Load cart from backend instead of context
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
    
    // New address input state - mặc định ẩn form nhập địa chỉ mới
    const [showAddressInput, setShowAddressInput] = useState(false);
    
    // Vietnam address state
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
    const [selectedWard, setSelectedWard] = useState<number | null>(null);
    const [addressDetail, setAddressDetail] = useState('');
    
    // Promotion code input state
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [applyingPromo, setApplyingPromo] = useState(false);

    // Calculate totals from backend cart
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

    // Apply promo code by code string
    const applyPromoCode = async () => {
        if (!promoCodeInput.trim()) {
            toast.warning('Vui lòng nhập mã giảm giá');
            return;
        }
        
        setApplyingPromo(true);
        try {
            // Find promo in available list
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
            console.log('Loading provinces...');
            const provincesData = await vietnamAddressService.getProvinces();
            console.log('Provinces loaded:', provincesData.length);
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
            console.error('❌ No user.id found:', user);
            toast.error('Không tìm thấy thông tin người dùng');
            return;
        }

        setLoadingData(true);
        console.log('🔍 Loading checkout data for user:', user.id, user.username);
        
        try {
            // Load cart from backend with customerId
            console.log('📦 Calling cartService.getCart() with customerId:', user.id);
            const cartResult = await cartService.getCart(user.id);
            console.log('📦 Cart API response:', cartResult);
            
            if (cartResult.success && cartResult.data) {
                console.log('✅ Cart data:', cartResult.data);
                console.log('✅ Cart items:', cartResult.data.items);
                setCart(cartResult.data);
            } else {
                console.error('❌ Cart API failed:', cartResult.message);
                setCart(null);
                toast.error('Không thể tải giỏ hàng: ' + (cartResult.message || 'Unknown error'));
            }

            // Load addresses
            console.log('📍 Loading addresses for customerId:', user.id);
            const addressesData = await getCustomerAddresses(user.id);
            console.log('📍 Addresses loaded:', addressesData);
            setAddresses(addressesData);
            if (addressesData.length > 0) {
                setSelectedAddressId(addressesData[0].id);
                setShowAddressInput(false); // Có địa chỉ thì mặc định không hiện form nhập mới
            } else {
                console.warn('⚠️ No addresses found for user');
                setShowAddressInput(true); // Không có địa chỉ thì tự động hiện form nhập mới
            }

            // Load available promotions
            console.log('🎟️ Loading promotions for customerId:', user.id);
            const promotionsData = await getAvailablePromotions(user.id);
            console.log('🎟️ Promotions loaded:', promotionsData);
            setPromotions(promotionsData);

            // Set phone from user
            if (user.phone) {
                setPhone(user.phone);
                console.log('📞 Phone set from user:', user.phone);
            }
        } catch (error) {
            console.error('❌ Error loading checkout data:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            toast.error('Không thể tải thông tin thanh toán: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setLoadingData(false);
            console.log('✅ loadCheckoutData finished');
        }
    };

    const handleCheckout = async () => {
        console.log('🛒 Starting checkout process...');
        console.log('📋 Current state:', {
            selectedAddressId,
            showAddressInput,
            selectedProvince,
            selectedDistrict,
            selectedWard,
            addressDetail,
            phone,
            userId: user?.id
        });

        // Validate phone first
        if (!phone || phone.trim().length === 0) {
            toast.error('Vui lòng nhập số điện thoại');
            return;
        }

        // Validate address
        if (!selectedAddressId && !showAddressInput) {
            toast.error('Vui lòng chọn địa chỉ giao hàng hoặc nhập địa chỉ mới');
            return;
        }
        
        // If entering new address, validate all fields
        if (showAddressInput) {
            if (!selectedProvince) {
                toast.error('Vui lòng chọn Tỉnh/Thành phố');
                return;
            }
            if (!selectedDistrict) {
                toast.error('Vui lòng chọn Quận/Huyện');
                return;
            }
            if (!selectedWard) {
                toast.error('Vui lòng chọn Phường/Xã');
                return;
            }
            if (!addressDetail || addressDetail.trim().length === 0) {
                toast.error('Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường)');
                return;
            }
        }

        if (!user?.id) {
            toast.error('Vui lòng đăng nhập để tiếp tục');
            navigate('/login');
            return;
        }

        setLoading(true);
        console.log('✅ Validation passed, processing checkout...');

        try {
            let addressIdToUse = selectedAddressId;

            // If user is entering new address, create it first
            if (showAddressInput && selectedProvince && selectedDistrict && selectedWard) {
                console.log('📝 Creating new address...');
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

                console.log('📍 New address request:', newAddressRequest);
                
                const createdAddress = await createAddress(newAddressRequest);
                addressIdToUse = createdAddress.id;
                console.log('✅ Address created with ID:', addressIdToUse);
            }

            if (!addressIdToUse) {
                toast.error('Không thể tạo địa chỉ giao hàng');
                setLoading(false);
                return;
            }

            const request: CheckoutRequest = {
                customerId: user.id,
                shippingAddressId: addressIdToUse,
                paymentMethod,
                phone: phone.trim(),
                note: note.trim(),
            };

            // Add promotion codes if selected
            if (selectedPromotion) {
                if (selectedPromotion.type === 'PERCENTAGE') {
                    request.percentagePromotionCode = selectedPromotion.code;
                } else {
                    request.amountPromotionCode = selectedPromotion.code;
                }
                console.log('🎟️ Applied promotion:', selectedPromotion.code);
            }

            console.log('📤 Sending checkout request:', request);
            const response = await processCheckout(request);
            console.log('✅ Checkout response:', response);
            
            toast.success('Đặt hàng thành công!');
            
            // Clear cart after successful checkout
            console.log('🧹 Clearing cart...');
            await cartService.clearCart();
            
            // Navigate to order success page
            console.log('🎉 Navigating to order success page...');
            navigate(`/order-success/${response.orderId}`, {
                state: { orderData: response }
            });
        } catch (error: any) {
            console.error('❌ Checkout error:', error);
            console.error('Error details:', {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status
            });
            
            const errorMessage = error?.response?.data?.message 
                || error?.response?.data?.error
                || error?.message 
                || 'Đặt hàng thất bại. Vui lòng thử lại!';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (loadingData) {
        return (
            <div className={styles['checkout-page']}>
                <div className={styles['checkout-card']}>
                    <p style={{ textAlign: 'center', padding: '40px' }}>Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (!cart || !cartItems || cartItems.length === 0) {
        return (
            <div className={styles['checkout-page']}>
                <div className={styles['checkout-card']}>
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
                        <button 
                            onClick={() => navigate('/products')}
                            className="bg-orange-500 text-white px-6 py-2 rounded"
                        >
                            Tiếp tục mua sắm
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['checkout-page']}>
            <div className={styles['breadcrumb']}>
                Trang chủ &nbsp;&gt;&nbsp;
                <span className={styles['current']}> Đơn hàng</span>
            </div>
            <div className={styles['checkout-card']}>
                <header className={styles['checkout-header']}>
                    <h1 className={styles['checkout-title']}>Thông tin đơn hàng</h1>
                </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Contact Info, Shipping Address & Payment */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Contact Info - FIRST */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Thông tin liên hệ</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 font-medium">Họ và tên *</label>
                                <input
                                    type="text"
                                    value={user?.username || ''}
                                    disabled
                                    className="w-full border rounded px-3 py-2 bg-gray-100"
                                    placeholder="Tên khách hàng"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">Số điện thoại *</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="Nhập số điện thoại"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">Ghi chú</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    rows={3}
                                    placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Shipping Address - SECOND */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Địa chỉ giao hàng</h2>
                        
                        {/* Existing addresses */}
                        {addresses.length > 0 && (
                            <div className="space-y-3 mb-4">
                                {addresses.map(addr => (
                                    <label key={addr.id} className="flex items-start p-3 border rounded cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="address"
                                            value={addr.id}
                                            checked={selectedAddressId === addr.id && !showAddressInput}
                                            onChange={() => {
                                                setSelectedAddressId(addr.id);
                                                setShowAddressInput(false);
                                            }}
                                            className="mt-1 mr-3"
                                        />
                                        <div>
                                            <p className="font-medium">{addr.fullAddress}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                        
                        {/* New address option */}
                        <div className="space-y-3">
                            <label className="flex items-start p-3 border rounded cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="address"
                                    checked={showAddressInput}
                                    onChange={() => {
                                        setShowAddressInput(true);
                                        setSelectedAddressId(null);
                                    }}
                                    className="mt-1 mr-3"
                                />
                                <span className="font-medium">Nhập địa chỉ mới</span>
                            </label>
                            
                            {showAddressInput && (
                                <div className="pl-8 space-y-3">
                                    {/* Province */}
                                    <div>
                                        <label htmlFor="province-select" className="block mb-2 text-sm font-medium">Tỉnh/Thành phố *</label>
                                        <select
                                            id="province-select"
                                            value={selectedProvince || ''}
                                            onChange={(e) => handleProvinceChange(Number(e.target.value))}
                                            className="w-full border rounded px-3 py-2"
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

                                    {/* District */}
                                    <div>
                                        <label htmlFor="district-select" className="block mb-2 text-sm font-medium">Quận/Huyện *</label>
                                        <select
                                            id="district-select"
                                            value={selectedDistrict || ''}
                                            onChange={(e) => handleDistrictChange(Number(e.target.value))}
                                            className="w-full border rounded px-3 py-2"
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

                                    {/* Ward */}
                                    <div>
                                        <label htmlFor="ward-select" className="block mb-2 text-sm font-medium">Phường/Xã *</label>
                                        <select
                                            id="ward-select"
                                            value={selectedWard || ''}
                                            onChange={(e) => handleWardChange(Number(e.target.value))}
                                            className="w-full border rounded px-3 py-2"
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

                                    {/* Address Detail */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Địa chỉ chi tiết *</label>
                                        <input
                                            type="text"
                                            value={addressDetail}
                                            onChange={(e) => setAddressDetail(e.target.value)}
                                            className="w-full border rounded px-3 py-2"
                                            placeholder="Số nhà, tên đường..."
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {addresses.length === 0 && !showAddressInput && (
                            <p className="text-gray-500 text-sm mt-2">Chưa có địa chỉ đã lưu. Vui lòng nhập địa chỉ giao hàng.</p>
                        )}
                    </div>

                    {/* Payment Method - THIRD */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
                        <div className="space-y-3">
                            <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="CASH_ON_DELIVERY"
                                    checked={paymentMethod === 'CASH_ON_DELIVERY'}
                                    onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                                    className="mr-3"
                                />
                                <span>Thanh toán khi nhận hàng (COD)</span>
                            </label>
                            <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="BANK_TRANSFER"
                                    checked={paymentMethod === 'BANK_TRANSFER'}
                                    onChange={() => setPaymentMethod('BANK_TRANSFER')}
                                    className="mr-3"
                                />
                                <span>Chuyển khoản ngân hàng</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Column - Order Summary with Promotions */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow sticky top-4">
                        <h2 className="text-xl font-semibold mb-4">Đơn hàng ({cartItems.length} sản phẩm)</h2>
                        
                        {/* Order Items */}
                        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                            {cartItems.map((item) => {
                                const itemImage = item.image || '/placeholder.png';
                                const itemName = item.productName || 'Sản phẩm';
                                const itemPrice = item.unitPrice || 0;
                                const itemQty = item.quantity || 0;
                                const itemTotal = item.totalPrice || (itemPrice * itemQty);
                                const itemId = item.itemId || item.variantId || item.productId || Math.random();
                                
                                return (
                                    <div key={itemId} className="flex gap-3 text-sm border-b pb-3">
                                        <img 
                                            src={itemImage} 
                                            alt={itemName}
                                            className="w-16 h-16 object-cover rounded"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/placeholder.png';
                                            }}
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">{itemName}</p>
                                            <p className="text-gray-600 text-xs">
                                                {formatCurrency(itemPrice)} x {itemQty}
                                            </p>
                                        </div>
                                        <p className="font-medium text-orange-600">{formatCurrency(itemTotal)}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Promotions Section - Under product list */}
                        <div className="border-t pt-4 mb-4">
                            <h3 className="font-semibold mb-3">Mã giảm giá</h3>
                            
                            {/* Input promotion code */}
                            <div className="mb-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoCodeInput}
                                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                                        className="flex-1 border rounded px-3 py-2 text-sm"
                                        placeholder="Nhập mã giảm giá"
                                        disabled={selectedPromotion !== null}
                                    />
                                    {selectedPromotion ? (
                                        <button
                                            onClick={removePromoCode}
                                            className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
                                        >
                                            Bỏ
                                        </button>
                                    ) : (
                                        <button
                                            onClick={applyPromoCode}
                                            disabled={applyingPromo || !promoCodeInput.trim()}
                                            className="bg-orange-500 text-white px-3 py-2 rounded hover:bg-orange-600 disabled:bg-gray-300 text-sm whitespace-nowrap"
                                        >
                                            {applyingPromo ? 'Đang áp dụng...' : 'Áp dụng'}
                                        </button>
                                    )}
                                </div>
                                
                                {/* Show applied promo */}
                                {selectedPromotion && (
                                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                        <p className="text-xs font-medium text-green-700">✓ {selectedPromotion.name}</p>
                                        <p className="text-xs text-orange-500 font-semibold">
                                            Giảm {selectedPromotion.type === 'PERCENTAGE' 
                                                ? `${selectedPromotion.discountPercent}%` 
                                                : `${formatCurrency(selectedPromotion.discountAmount || 0)}`}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Available promotions list */}
                            {promotions.length > 0 && !selectedPromotion && (
                                <div>
                                    <p className="text-xs font-medium text-gray-700 mb-2">Chọn mã có sẵn:</p>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {promotions.map(promo => (
                                            <div 
                                                key={promo.id} 
                                                className="p-2 border rounded hover:bg-gray-50 cursor-pointer"
                                                onClick={() => {
                                                    setSelectedPromotion(promo);
                                                    toast.success(`Áp dụng mã "${promo.code}" thành công!`);
                                                }}
                                            >
                                                <p className="font-medium text-xs">{promo.name}</p>
                                                <p className="text-xs text-orange-500 font-semibold">
                                                    Mã: {promo.code} - Giảm {promo.type === 'PERCENTAGE' 
                                                        ? `${promo.discountPercent}%` 
                                                        : `${formatCurrency(promo.discountAmount || 0)}`}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Price Summary */}
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tạm tính ({cartItems.length} sản phẩm):</span>
                                <span className="font-medium">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Phí vận chuyển:</span>
                                <span className="font-medium">{formatCurrency(shippingFee)}</span>
                            </div>
                            {selectedPromotion && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Giảm giá ({selectedPromotion.code}):</span>
                                    <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t pt-3 mt-2">
                                <span>Tổng cộng:</span>
                                <span className="text-orange-500 text-xl">{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>

                        {/* Validation warnings */}
                        {!phone && (
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded mt-4 text-sm">
                                ⚠️ Vui lòng nhập số điện thoại
                            </div>
                        )}
                        {!selectedAddressId && !showAddressInput && (
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded mt-4 text-sm">
                                ⚠️ Vui lòng chọn hoặc nhập địa chỉ giao hàng
                            </div>
                        )}
                        {showAddressInput && (!selectedProvince || !selectedDistrict || !selectedWard || !addressDetail.trim()) && (
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded mt-4 text-sm">
                                ⚠️ Vui lòng điền đầy đủ thông tin địa chỉ
                            </div>
                        )}

                        <button
                            onClick={handleCheckout}
                            disabled={
                                loading || 
                                !phone ||
                                (!selectedAddressId && !showAddressInput) || 
                                (showAddressInput && (!selectedProvince || !selectedDistrict || !selectedWard || !addressDetail.trim()))
                            }
                            className="w-full bg-orange-500 text-white py-3 rounded-lg mt-6 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg transition-colors shadow-md hover:shadow-lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý đơn hàng...
                                </span>
                            ) : (
                                ' Đặt hàng ngay'
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
