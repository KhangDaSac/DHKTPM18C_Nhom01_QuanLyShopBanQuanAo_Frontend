import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { useCart } from '../../contexts/CartContext';
import { 
    getAvailablePromotions, 
    processCheckout, 
    getCustomerAddresses
} from '../../services/checkout';
import type { PromotionSummary, AddressResponse, CheckoutRequest } from '../../services/checkout';
import { toast } from 'react-toastify';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cart, clearCart } = useCart();

    const [addresses, setAddresses] = useState<AddressResponse[]>([]);
    const [promotions, setPromotions] = useState<PromotionSummary[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [selectedPromotion, setSelectedPromotion] = useState<PromotionSummary | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK_TRANSFER' | 'E_WALLET'>('COD');
    const [phone, setPhone] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const shippingFee = 30000;

    // Calculate totals
    const subtotal = cart?.reduce((sum: number, item) => sum + (item.price * item.qty), 0) || 0;
    const discountAmount = selectedPromotion 
        ? (selectedPromotion.type === 'PERCENTAGE' 
            ? (subtotal * (selectedPromotion.discountPercent || 0) / 100)
            : (selectedPromotion.discountAmount || 0))
        : 0;
    const totalAmount = subtotal + shippingFee - discountAmount;

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        loadCheckoutData();
    }, [user]);

    const loadCheckoutData = async () => {
        if (!user?.id) return;

        try {
            // Load addresses
            const addressesData = await getCustomerAddresses(user.id);
            setAddresses(addressesData);
            if (addressesData.length > 0) {
                setSelectedAddressId(addressesData[0].id);
            }

            // Load available promotions
            const promotionsData = await getAvailablePromotions(user.id);
            setPromotions(promotionsData);

            // Set phone from user
            setPhone(user.phone || '');
        } catch (error) {
            console.error('Error loading checkout data:', error);
            toast.error('Không thể tải thông tin thanh toán');
        }
    };

    const handleCheckout = async () => {
        if (!selectedAddressId) {
            toast.error('Vui lòng chọn địa chỉ giao hàng');
            return;
        }

        if (!phone) {
            toast.error('Vui lòng nhập số điện thoại');
            return;
        }

        if (!user?.id) {
            toast.error('Vui lòng đăng nhập');
            return;
        }

        setLoading(true);

        const request: CheckoutRequest = {
            customerId: user.id,
            shippingAddressId: selectedAddressId,
            paymentMethod,
            phone,
            note,
        };

        if (selectedPromotion) {
            if (selectedPromotion.type === 'PERCENTAGE') {
                request.percentagePromotionCode = selectedPromotion.code;
            } else {
                request.amountPromotionCode = selectedPromotion.code;
            }
        }

        try {
            const response = await processCheckout(request);
            toast.success('Đặt hàng thành công!');
            clearCart(); // Clear cart from context
            
            // Navigate to order success page
            navigate(`/order-success/${response.orderId}`, {
                state: { orderData: response }
            });
        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error(error?.response?.data?.message || 'Đặt hàng thất bại');
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

    if (!cart || cart.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
                    <button 
                        onClick={() => navigate('/products')}
                        className="bg-orange-500 text-white px-6 py-2 rounded"
                    >
                        Tiếp tục mua sắm
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Shipping Info & Payment */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Shipping Address */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Địa chỉ giao hàng</h2>
                        {addresses.length > 0 ? (
                            <div className="space-y-3">
                                {addresses.map(addr => (
                                    <label key={addr.id} className="flex items-start p-3 border rounded cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="address"
                                            value={addr.id}
                                            checked={selectedAddressId === addr.id}
                                            onChange={() => setSelectedAddressId(addr.id)}
                                            className="mt-1 mr-3"
                                        />
                                        <div>
                                            <p className="font-medium">{addr.fullAddress}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Chưa có địa chỉ. Vui lòng thêm địa chỉ giao hàng.</p>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Thông tin liên hệ</h2>
                        <div className="space-y-4">
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

                    {/* Payment Method */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
                        <div className="space-y-3">
                            <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="COD"
                                    checked={paymentMethod === 'COD'}
                                    onChange={() => setPaymentMethod('COD')}
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

                    {/* Promotions */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Mã giảm giá</h2>
                        {promotions.length > 0 ? (
                            <div className="space-y-3">
                                <label className="flex items-start p-3 border rounded cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="promotion"
                                        checked={selectedPromotion === null}
                                        onChange={() => setSelectedPromotion(null)}
                                        className="mt-1 mr-3"
                                    />
                                    <span>Không sử dụng mã giảm giá</span>
                                </label>
                                {promotions.map(promo => (
                                    <label key={promo.id} className="flex items-start p-3 border rounded cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="promotion"
                                            value={promo.id}
                                            checked={selectedPromotion?.id === promo.id}
                                            onChange={() => setSelectedPromotion(promo)}
                                            className="mt-1 mr-3"
                                        />
                                        <div>
                                            <p className="font-medium">{promo.name}</p>
                                            <p className="text-sm text-gray-600">{promo.description}</p>
                                            <p className="text-sm text-orange-500">Mã: {promo.code}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Không có mã giảm giá khả dụng</p>
                        )}
                    </div>
                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow sticky top-4">
                        <h2 className="text-xl font-semibold mb-4">Đơn hàng ({cart.length} sản phẩm)</h2>
                        
                        {/* Order Items */}
                        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                            {cart.map((item) => (
                                <div key={item.id} className="flex gap-3 text-sm">
                                    <img 
                                        src={item.image || '/placeholder.png'} 
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-gray-600">SL: {item.qty}</p>
                                    </div>
                                    <p className="font-medium">{formatCurrency(item.price * item.qty)}</p>
                                </div>
                            ))}
                        </div>

                        {/* Price Summary */}
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between">
                                <span>Tạm tính:</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Phí vận chuyển:</span>
                                <span>{formatCurrency(shippingFee)}</span>
                            </div>
                            {selectedPromotion && (
                                <div className="flex justify-between text-green-600">
                                    <span>Giảm giá:</span>
                                    <span>-{formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                <span>Tổng cộng:</span>
                                <span className="text-orange-500">{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={loading || !selectedAddressId}
                            className="w-full bg-orange-500 text-white py-3 rounded-lg mt-6 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                        >
                            {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
