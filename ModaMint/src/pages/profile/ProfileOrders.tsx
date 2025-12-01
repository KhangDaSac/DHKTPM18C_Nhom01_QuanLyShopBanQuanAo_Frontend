import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/authContext';
import { orderService, type OrderResponse } from '@/services/order';
import styles from './style.module.css';

export default function ProfileOrders() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

    // Fetch orders từ API
    const fetchOrders = async () => {
        if (!user?.id) {
            alert('Vui lòng đăng nhập để xem đơn hàng');
            return;
        }

        setLoading(true);
        try {
            const result = await orderService.getOrdersByCustomerId(user.id);
            if (result.success && result.data) {
                setOrders(result.data);
                console.log('Orders loaded:', result.data.length);
            } else {
                alert(result.message || 'Không thể tải danh sách đơn hàng');
            }
        } catch (error) {
            alert('Lỗi khi tải đơn hàng');
            console.error('Fetch orders error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load orders khi component mount
    useEffect(() => {
        fetchOrders();
    }, [user?.id]);

    // Update current time mỗi giây để cập nhật đếm ngược
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Tính thời gian hết hạn (createAt + 15 phút)
    const calculateExpiryTime = (createAt: string) => {
        const createTime = new Date(createAt).getTime();
        return createTime + 15 * 60 * 1000;
    };

    // Tính thời gian còn lại
    const calculateTimeRemaining = (createAt: string) => {
        const expiryTime = calculateExpiryTime(createAt);
        const remaining = expiryTime - currentTime;

        if (remaining <= 0) return null;

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        return { minutes, seconds, total: remaining };
    };

    // Kiểm tra order có thể thanh toán không
    const canPayOrder = (order: OrderResponse) => {
        if (order.orderStatus !== 'PENDING') return false;
        if (order.paymentMethod !== 'BANK_TRANSFER') return false;

        const timeRemaining = calculateTimeRemaining(order.createAt);
        return timeRemaining !== null;
    };

    // Xử lý tiếp tục thanh toán
    const handleContinuePayment = async (order: OrderResponse) => {
        try {
            const result = await orderService.retryPayment(order.id);

            if (result.success && result.data) {
                window.open(result.data.paymentUrl, '_blank');
                alert('Đã tạo liên kết thanh toán mới');
            } else {
                alert(result.message || 'Không thể tạo liên kết thanh toán');
                fetchOrders();
            }
        } catch (error) {
            alert('Lỗi khi tạo liên kết thanh toán');
            console.error('Retry payment error:', error);
        }
    };

    const getStatusConfig = (status: string) => {
        const config: Record<string, { color: string; text: string }> = {
            PENDING: { color: '#FF9800', text: 'Chờ thanh toán' },
            PREPARING: { color: '#2196F3', text: 'Đang chuẩn bị' },
            ARRIVED_AT_LOCATION: { color: '#00BCD4', text: 'Đã đến khu vực' },
            SHIPPED: { color: '#2196F3', text: 'Đang giao' },
            DELIVERED: { color: '#4CAF50', text: 'Đã giao' },
            CANCELLED: { color: '#F44336', text: 'Đã hủy' },
            RETURNED: { color: '#FF5722', text: 'Đã trả hàng' }
        };
        return config[status] || { color: '#999', text: status };
    };

    const getPaymentMethodText = (method: string) => {
        const methods: Record<string, string> = {
            CASH_ON_DELIVERY: 'COD',
            BANK_TRANSFER: 'VNPay',
            E_WALLET: 'Ví điện tử'
        };
        return methods[method] || method;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const statusFilters = [
        { key: 'ALL', label: 'Tất cả' },
        { key: 'PENDING', label: 'Chờ thanh toán' },
        { key: 'PREPARING', label: 'Đang chuẩn bị' },
        { key: 'SHIPPED', label: 'Đang giao' },
        { key: 'DELIVERED', label: 'Đã giao' },
        { key: 'CANCELLED', label: 'Đã hủy' }
    ];

    // Filter orders based on selected status
    const filteredOrders = selectedStatus === 'ALL'
        ? orders
        : orders.filter(o => o.orderStatus === selectedStatus);

    if (loading) {
        return (
            <div className={styles.profile}>
                <div className={styles.profile__loading}>Đang tải đơn hàng...</div>
            </div>
        );
    }

    return (
        <div className={styles.profile__wrapper}>
            {/* Header */}
            <div className={styles.profile__header}>
                <button
                    onClick={() => navigate('/profile')}
                    className={styles.profile__back_btn}
                >
                    ← Quay lại
                </button>
                <h1 className={styles.profile__title}>Đơn hàng</h1>

            </div>

            {/* Status Filter */}
            <div className={styles.profile__filters}>
                {statusFilters.map(filter => {
                    const count = filter.key === 'ALL'
                        ? orders.length
                        : orders.filter(o => o.orderStatus === filter.key).length;

                    return (
                        <button
                            key={filter.key}
                            onClick={() => setSelectedStatus(filter.key)}
                            className={`${styles.profile__filter_btn} ${selectedStatus === filter.key ? styles.profile__filter_btn__active : ''}`}
                        >
                            {filter.label} ({count})
                        </button>
                    );
                })}
                                <button
                    onClick={fetchOrders}
                    className={styles.profile__refresh_btn}
                >
                    ↻
                </button>
            </div>

            {/* Orders Table */}
            <div className={styles.profile__orders_container}>
                {filteredOrders.length === 0 ? (
                    <div className={styles.profile__empty}>
                        <p>Chưa có đơn hàng nào</p>
                    </div>
                ) : (
                    <table className={styles.profile__table}>
                        <thead>
                            <tr>
                                <th>Mã đơn hàng</th>
                                <th>Ngày đặt</th>
                                <th>Trạng thái</th>
                                <th>Phương thức</th>
                                <th>Tổng tiền</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => {
                                const statusConfig = getStatusConfig(order.orderStatus);
                                const timeRemaining = calculateTimeRemaining(order.createAt);

                                return (
                                    <tr key={order.id}>
                                        <td>
                                            <strong>{order.orderCode}</strong>
                                        </td>
                                        <td>{formatDate(order.createAt)}</td>
                                        <td>
                                            <span
                                                className={styles.profile__status_badge}
                                                style={{ backgroundColor: statusConfig.color }}
                                            >
                                                {statusConfig.text}
                                            </span>
                                        </td>
                                        <td>{getPaymentMethodText(order.paymentMethod)}</td>
                                        <td>{formatCurrency(order.subTotal)}</td>
                                        <td>
                                            <div className={styles.profile__actions}>
                                                <button
                                                    onClick={() => navigate(`/order-detail/${order.id}`)}
                                                    className={styles.profile__action_btn}
                                                >
                                                    Chi tiết
                                                </button>
                                                {canPayOrder(order) && (
                                                    <button
                                                        onClick={() => handleContinuePayment(order)}
                                                        className={`${styles.profile__action_btn} ${styles.profile__action_btn__primary}`}
                                                    >
                                                        {(() => {
                                                            const timeRemaining = calculateTimeRemaining(order.createAt);
                                                            return timeRemaining
                                                                ? `Tiếp tục thanh toán (${timeRemaining.minutes}:${String(timeRemaining.seconds).padStart(2, '0')})`
                                                                : 'Hết hạn thanh toán';
                                                        })()}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
