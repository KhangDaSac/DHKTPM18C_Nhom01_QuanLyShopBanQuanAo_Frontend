import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/authContext';
import { orderService, type OrderResponse } from '@/services/order';
import { CancelOrderModal } from '@/components/common/CancelOrderModal';
import { toast } from 'react-toastify';
import styles from './style.module.css';

export default function ProfileOrders() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
    const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; order: OrderResponse | null }>({
        isOpen: false,
        order: null
    });

    const fetchOrders = async () => {
        if (!user?.id) {
            toast.error('Vui lòng đăng nhập để xem đơn hàng');
            return;
        }

        setLoading(true);
        try {
            const result = await orderService.getOrdersByCustomerId(user.id);
            if (result.success && result.data) {
                setOrders(result.data);
                console.log('Orders loaded:', result.data.length);
            } else {
                toast.error(result.message || 'Không thể tải danh sách đơn hàng');
            }
        } catch (error) {
            toast.error('Lỗi khi tải đơn hàng');
            console.error('Fetch orders error:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchOrders();
    }, [user?.id]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const calculateExpiryTime = (createAt: string) => {
        const createTime = new Date(createAt).getTime();
        return createTime + 15 * 60 * 1000;
    };

    const calculateTimeRemaining = (createAt: string) => {
        const expiryTime = calculateExpiryTime(createAt);
        const remaining = expiryTime - currentTime;

        if (remaining <= 0) return null;

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        return { minutes, seconds, total: remaining };
    };

    const canPayOrder = (order: OrderResponse) => {
        if (order.orderStatus !== 'PENDING') return false;
        if (order.paymentMethod !== 'BANK_TRANSFER') return false;

        const timeRemaining = calculateTimeRemaining(order.createAt);
        return timeRemaining !== null;
    };

    const handleContinuePayment = async (order: OrderResponse) => {
        try {
            const result = await orderService.retryPayment(order.id);

            if (result.success && result.data) {
                window.open(result.data.paymentUrl, '_blank');
                toast.success('Đã tạo liên kết thanh toán mới');
            } else {
                toast.error(result.message || 'Không thể tạo liên kết thanh toán');
                fetchOrders();
            }
        } catch (error) {
            toast.error('Lỗi khi tạo liên kết thanh toán');
            console.error('Retry payment error:', error);
        }
    };

    const handleCancelOrder = (order: OrderResponse) => {
        setCancelModal({ isOpen: true, order });
    };

    const handleConfirmCancel = async (reason: string) => {
        if (!cancelModal.order) return;

        try {
            const result = await orderService.cancelOrder(
                cancelModal.order.id, 
                user?.id || '', 
                reason
            );
            if (result.success) {
                toast.success('Đã hủy đơn hàng thành công');
                fetchOrders();
            } else {
                toast.error(result.message || 'Không thể hủy đơn hàng');
            }
        } catch (error) {
            toast.error('Lỗi khi hủy đơn hàng');
            console.error('Cancel order error:', error);
        }
    };

    const getStatusConfig = (status: string) => {
        const config: Record<string, { color: string; text: string }> = {
            PENDING: { color: '#FF9800', text: 'Chờ xác nhận' },
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
        { key: 'PENDING', label: 'Chờ xác nhận' },
        { key: 'PREPARING', label: 'Đang chuẩn bị' },
        { key: 'SHIPPED', label: 'Đang giao' },
        { key: 'DELIVERED', label: 'Đã giao' },
        { key: 'CANCELLED', label: 'Đã hủy' }
    ];

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
                                                    onClick={() => navigate(`/profile/order/${order.id}`)}
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
                                                {order.orderStatus === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order)}
                                                        className={`${styles.profile__action_btn} ${styles.profile__action_btn__danger}`}
                                                    >
                                                        Hủy đơn
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

            <CancelOrderModal
                isOpen={cancelModal.isOpen}
                onClose={() => setCancelModal({ isOpen: false, order: null })}
                onConfirm={handleConfirmCancel}
                orderCode={cancelModal.order?.orderCode || ''}
            />
        </div>
    );
}
