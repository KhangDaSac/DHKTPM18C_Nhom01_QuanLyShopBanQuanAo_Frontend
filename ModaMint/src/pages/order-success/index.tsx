import React from 'react';
import { useState,useEffect } from 'react';
import { useLocation, useNavigate, useParams} from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiPhone, FiMapPin, FiCreditCard, FiDollarSign, FiShoppingBag, FiHome, FiList, FiInfo } from 'react-icons/fi';
import styles from './style-simple.module.css';
import apiClient from '../../api/client';

const OrderSuccessPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [orderData, setOrderData] = useState(location.state?.orderData || null); // Ưu tiên state nếu có
    const [loading, setLoading] = useState(!orderData); // Nếu không có state, set loading true
    const [error, setError] = useState(null);

    // Fetch order nếu không có từ state. (khi redirect VNPay mất state) Khoa
    useEffect(() => {
    if (!orderData && orderId) {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                
                // 1. ƯU TIÊN ĐỌC TỪ LOCALSTORAGE 
                const key = `orderData_${orderId}`;
                const stored = localStorage.getItem(key);
                
                if (stored) {
                    console.log('✅ Found CheckoutResponse in localStorage');
                    const parsed = JSON.parse(stored);
                    console.log('📦 CheckoutResponse data:', parsed);
                    console.log('📦 Order items:', parsed.orderItems);
                    
                    // Set dữ liệu vào state
                    setOrderData(parsed);
                    setLoading(false);
                    
                    setTimeout(() => {
                        localStorage.removeItem(key);
                        console.log(' Đã xóa dữ liệu khỏi localStorage sau khi load xong');
                    }, 1000);
                    
                    return; 
                }
                
                // 2. Fallback: Fetch từ backend (nếu không có localStorage)
                console.log('⚠️ No localStorage, fetching from backend:', orderId);
                const response = await apiClient.get(`/orders/${orderId}`);
                const data = response.data?.result ?? response.data;
                
                console.log('📡 Backend response:', data);
                setOrderData(data);
                
            } catch (err) {
                console.error('❌ Error loading order:', err);
                setError(err as any);
                
                // Last resort: Thử localStorage lần nữa
                try {
                    const key2 = `orderData_${orderId}`;
                    const stored2 = localStorage.getItem(key2);
                    if (stored2) {
                        console.log('💾 Found backup in localStorage');
                        setOrderData(JSON.parse(stored2));
                        localStorage.removeItem(key2);
                    }
                } catch (e) {
                    console.warn('Warning reading orderData fallback:', e);
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchOrder();
    }
}, [orderId, orderData]);

    // Debug: Log order data
    React.useEffect(() => {
        console.log('📦 Order Success Page - Order Data:', orderData);
        if (orderData) {
            console.log('💰 PRICING INFO:');
            console.log('   Subtotal (tạm tính):', orderData.subtotal);
            console.log('   Shipping Fee:', orderData.shippingFee);
            console.log('   Discount Amount:', orderData.discountAmount);
            console.log('   Total Amount (cuối cùng):', orderData.totalAmount);
            console.log('   Applied Promotion:', orderData.appliedPromotion);
        }
        if (orderData?.orderItems) {
            console.log('📦 Order Items:', orderData.orderItems);
            orderData.orderItems.forEach((item: any, index: number) => {
                console.log(`Item ${index}:`, {
                    productName: item.productName,
                    price: item.price,
                    unitPrice: item.unitPrice,
                    quantity: item.quantity,
                    totalPrice: item.totalPrice,
                    imageUrl: item.imageUrl,
                    productImage: item.productImage
                });
            });
        }
    }, [orderData]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getPaymentMethodText = (method: string) => {
        switch(method) {
            case 'CASH_ON_DELIVERY':
                return 'Thanh toán khi nhận hàng (COD)';
            case 'BANK_TRANSFER':
                return 'Chuyển khoản ngân hàng';
            case 'E_WALLET':
                return 'Ví điện tử';
            default:
                return method;
        }
    };

    if (loading) {
        return (
            <div className={styles['success-page']}>
                <div className={styles['success-card']}>
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                        <h2>Đang tải thông tin đơn hàng...</h2>
                        <p style={{ color: '#666', marginTop: '8px' }}>Vui lòng chờ trong giây lát</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !orderData) {
        return (
            <div className={styles['success-page']}>
                <div className={styles['success-card']}>
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px', color: '#ff4d4f' }}>⚠️</div>
                        <h2>Không tìm thấy thông tin đơn hàng</h2>
                        <p style={{ color: '#666', marginTop: '8px', marginBottom: '24px' }}>
                            Đơn hàng đã được tạo thành công nhưng không thể hiển thị chi tiết
                        </p>
                        <div className={styles['actions']}>
                            <button
                                onClick={() => navigate('/products')}
                                className={styles['btn-primary']}
                            >
                                <FiShoppingBag /> Tiếp tục mua sắm
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className={styles['btn-outline']}
                            >
                                <FiHome /> Về trang chủ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['success-page']}>
            <div className={styles['breadcrumb']}>
                Trang chủ &nbsp;&gt;&nbsp;
                <span className={styles['current']}> Đặt hàng thành công</span>
            </div>

            <div className={styles['success-card']}>
                {/* Success Icon */}
                <div className={styles['success-icon-wrapper']}>
                    <FiCheckCircle className={styles['success-icon']} />
                </div>

                <h1 className={styles['success-title']}>Đặt hàng thành công!</h1>
                <p className={styles['success-subtitle']}>
                    Cảm ơn bạn đã tin tưởng và mua sắm tại <strong>ModaMint</strong>
                </p>

                {/* Guest Notice */}
                {orderData && orderData.customerId && orderData.customerId.startsWith('guest_') && (
                    <div style={{ 
                        margin: '20px auto', 
                        padding: '16px', 
                        backgroundColor: '#e6f7ff', 
                        borderRadius: '8px', 
                        border: '1px solid #91d5ff',
                        maxWidth: '600px'
                    }}>
                        <p style={{ margin: 0, fontSize: '14px', color: '#0050b3', textAlign: 'center' }}>
                            💡 Bạn đã đặt hàng với tư cách khách vãng lai. Vui lòng lưu lại mã đơn hàng để tra cứu.
                            <br />
                            Thông tin đơn hàng đã được gửi đến email: <strong>{orderData.customerEmail}</strong>
                        </p>
                    </div>
                )}

                {/* Order Summary */}
                {orderData && (
                    <div className={styles['order-summary']}>
                        <div className={styles['order-header']}>
                            <h2>Thông tin đơn hàng</h2>
                        </div>

                        <div className={styles['order-details']}>
                            <div className={styles['detail-row']}>
                                <span className={styles['detail-label']}>
                                    <FiPackage className={styles['icon']} />
                                    Mã đơn hàng
                                </span>
                                <span className={styles['detail-value'] + ' ' + styles['highlight']}>
                                    {orderData.orderCode || `#${orderId}`}
                                </span>
                            </div>

                            <div className={styles['detail-row']}>
                                <span className={styles['detail-label']}>
                                    <FiPhone className={styles['icon']} />
                                    Số điện thoại
                                </span>
                                <span className={styles['detail-value']}>
                                    {orderData.customerPhone}
                                </span>
                            </div>

                            <div className={styles['detail-row']}>
                                <span className={styles['detail-label']}>
                                    <FiMapPin className={styles['icon']} />
                                    Địa chỉ giao hàng
                                </span>
                                <span className={styles['detail-value'] + ' ' + styles['address']}>
                                    {orderData.shippingAddress?.fullAddress || 
                                     `${orderData.shippingAddress?.addressDetail || ''}, ${orderData.shippingAddress?.ward || ''}, ${orderData.shippingAddress?.district || ''}, ${orderData.shippingAddress?.city || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',') || 
                                     'Không có thông tin'}
                                </span>
                            </div>

                            <div className={styles['detail-row']}>
                                <span className={styles['detail-label']}>
                                    <FiCreditCard className={styles['icon']} />
                                    Phương thức thanh toán
                                </span>
                                <span className={styles['detail-value']}>
                                    {getPaymentMethodText(orderData.paymentMethod)}
                                </span>
                            </div>

                            <div className={styles['divider']}></div>

                            {/* Price breakdown */}
                            {(orderData.subtotal || orderData.shippingFee || orderData.discountAmount) && (
                                <>
                                    {orderData.subtotal && (
                                        <div className={styles['detail-row']}>
                                            <span className={styles['detail-label']}>Tạm tính</span>
                                            <span className={styles['detail-value']}>
                                                {formatCurrency(orderData.subtotal)}
                                            </span>
                                        </div>
                                    )}
                                    {orderData.shippingFee && (
                                        <div className={styles['detail-row']}>
                                            <span className={styles['detail-label']}>Phí vận chuyển</span>
                                            <span className={styles['detail-value']}>
                                                {formatCurrency(orderData.shippingFee)}
                                            </span>
                                        </div>
                                    )}
                                    {orderData.discountAmount > 0 && (
                                        <div className={styles['detail-row']}>
                                            <span className={styles['detail-label']}>Giảm giá</span>
                                            <span className={styles['detail-value']} style={{ color: '#52c41a' }}>
                                                -{formatCurrency(orderData.discountAmount)}
                                            </span>
                                        </div>
                                    )}
                                    <div className={styles['divider']}></div>
                                </>
                            )}

                            <div className={styles['detail-row'] + ' ' + styles['total']}>
                                <span className={styles['detail-label']}>
                                    <FiDollarSign className={styles['icon']} />
                                    Tổng thanh toán
                                </span>
                                <span className={styles['detail-value'] + ' ' + styles['total-amount']}>
                                    {formatCurrency(orderData.totalAmount)}
                                </span>
                            </div>
                        </div>

                        {/* Order Items */}
                        {orderData.orderItems && orderData.orderItems.length > 0 ? (
                            <div className={styles['order-items']}>
                                <h3>Sản phẩm đã đặt ({orderData.orderItems.length})</h3>
                                <div className={styles['items-list']}>
                                    {orderData.orderItems.map((item: any, index: number) => {
                                        const itemImage = item.imageUrl || item.productImage || item.image || '/placeholder.jpg';
                                        const itemPrice = item.price || item.unitPrice || 0;
                                        const itemQty = item.quantity || 1;
                                        const itemTotal = itemPrice * itemQty;
                                        
                                        return (
                                            <div key={index} className={styles['item']}>
                                                <img 
                                                    src={itemImage} 
                                                    alt={item.productName || 'Sản phẩm'} 
                                                    className={styles['item-image']}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/placeholder.jpg';
                                                    }}
                                                />
                                                <div className={styles['item-info']}>
                                                    <h4 className={styles['item-name']}>{item.productName || 'Sản phẩm'}</h4>
                                                    {(item.color || item.size) && (
                                                        <p className={styles['item-variant']}>
                                                            {item.color && `Màu: ${item.color}`}
                                                            {item.color && item.size && ' / '}
                                                            {item.size && `Size: ${item.size}`}
                                                        </p>
                                                    )}
                                                    <p className={styles['item-quantity']}>
                                                        Số lượng: {itemQty}
                                                    </p>
                                                </div>
                                                <div className={styles['item-price']}>
                                                    {formatCurrency(itemTotal)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '24px', color: '#999' }}>
                                <p>Không có thông tin chi tiết sản phẩm</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className={styles['actions']}>
                    {orderData.customerId && !orderData.customerId.startsWith('guest_') && (
                        <button
                            onClick={() => navigate('/profile/order')}
                            className={styles['btn-primary']}
                        >
                            <FiList /> Xem đơn hàng của tôi
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/products')}
                        className={styles['btn-secondary']}
                    >
                        <FiShoppingBag /> Tiếp tục mua sắm
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className={styles['btn-outline']}
                    >
                        <FiHome /> Về trang chủ
                    </button>
                </div>

                {/* Info Box */}
                <div className={styles['info-box']}>
                    <FiInfo className={styles['info-icon']} />
                    <div className={styles['info-content']}>
                        <h4>Lưu ý giao hàng</h4>
                        <ul>
                            <li>Đơn hàng sẽ được xử lý trong vòng 24h</li>
                            <li>Thời gian giao hàng dự kiến: 3-5 ngày làm việc</li>
                            <li>Vui lòng kiểm tra hàng trước khi thanh toán</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
