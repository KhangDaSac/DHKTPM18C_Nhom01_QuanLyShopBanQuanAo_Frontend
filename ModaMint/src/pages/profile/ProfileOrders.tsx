import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Table,
    Button,
    Space,
    Typography,
    Tag,
    Empty,
    Row,
    Col,
    Statistic,
    Spin,
    message
} from 'antd';
import {
    ShoppingCartOutlined,
    EyeOutlined,
    ReloadOutlined,
    LeftOutlined,
    CreditCardOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '@/contexts/authContext';
import { orderService, type OrderResponse } from '@/services/order';

const { Title, Text } = Typography;

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
            message.error('Vui lòng đăng nhập để xem đơn hàng');
            return;
        }

        setLoading(true);
        try {
            const result = await orderService.getOrdersByCustomerId(user.id);
            if (result.success && result.data) {
                setOrders(result.data);

                // DEBUG: Log orders để kiểm tra
                console.log('=== ORDERS FETCHED ===');
                console.log('Total orders:', result.data.length);
                console.log('ALL ORDERS:', result.data.map(o => ({
                    id: o.id,
                    orderCode: o.orderCode,
                    status: o.orderStatus,
                    paymentMethod: o.paymentMethod,
                    createAt: o.createAt
                })));

                const pendingOrders = result.data.filter(o => o.orderStatus === 'PENDING' && o.paymentMethod === 'BANK_TRANSFER');
                console.log('PENDING VNPAY orders:', pendingOrders.length);
                if (pendingOrders.length > 0) {
                    const firstOrder = pendingOrders[0];
                    console.log('First PENDING order createAt:', firstOrder.createAt);
                    console.log('Parsed as Date:', new Date(firstOrder.createAt));
                    console.log('Current time:', new Date());
                    const elapsed = Math.floor((Date.now() - new Date(firstOrder.createAt).getTime()) / 60000);
                    console.log('Minutes elapsed:', elapsed);
                    console.log('Should show button?', elapsed < 15);
                }
                console.log('=====================');
            } else {
                message.error(result.message || 'Không thể tải danh sách đơn hàng');
            }
        } catch (error) {
            message.error('Lỗi khi tải đơn hàng');
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
        // Backend trả về LocalDateTime theo timezone server (GMT+7)
        // Parse như local time (không thêm 'Z' để tránh parse như UTC)
        const createTime = new Date(createAt).getTime();

        // DEBUG: Log để kiểm tra
        console.log('=== DEBUG TIMEZONE ===');
        console.log('createAt from backend:', createAt);
        console.log('createTime parsed:', new Date(createTime));
        console.log('Current time:', new Date());
        console.log('Minutes elapsed:', Math.floor((Date.now() - createTime) / 60000));
        console.log('=====================');

        return createTime + 15 * 60 * 1000; // +15 phút
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
                // Mở payment URL trong tab mới
                window.open(result.data.paymentUrl, '_blank');
                message.success('Da tao lien ket thanh toan moi');
            } else {
                message.error(result.message || 'Khong the tao lien ket thanh toan');
                // Refresh danh sách sau khi lỗi để cập nhật trạng thái
                fetchOrders();
            }
        } catch (error) {
            message.error('Loi khi tao lien ket thanh toan');
            console.error('Retry payment error:', error);
        }
    };

    const orderColumns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderCode',
            key: 'orderCode',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createAt',
            key: 'createAt',
            render: (date: string) => new Date(date).toLocaleString('vi-VN')
        },
        {
            title: 'Trạng thái',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
            render: (status: OrderResponse['orderStatus']) => {
                const statusConfig = {
                    PENDING: { color: 'orange', text: 'Chờ thanh toán' },
                    PREPARING: { color: 'blue', text: 'Đang chuẩn bị' },
                    ARRIVED_AT_LOCATION: { color: 'cyan', text: 'Đã đến khu vực' },
                    SHIPPED: { color: 'geekblue', text: 'Đang giao' },
                    DELIVERED: { color: 'green', text: 'Đã giao' },
                    CANCELLED: { color: 'red', text: 'Đã hủy' },
                    RETURNED: { color: 'volcano', text: 'Đã trả hàng' }
                };
                const config = statusConfig[status] || { color: 'default', text: status || 'Không xác định' };
                return <Tag color={config.color}>{config.text}</Tag>;
            }
        },
        {
            title: 'Phương thức',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method: string) => {
                const methodConfig = {
                    CASH_ON_DELIVERY: { color: 'default', text: 'COD' },
                    BANK_TRANSFER: { color: 'blue', text: 'VNPAY' }
                };
                const config = methodConfig[method as keyof typeof methodConfig] || { color: 'default', text: method || 'N/A' };
                return <Tag color={config.color}>{config.text}</Tag>;
            }
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'subTotal',
            key: 'subTotal',
            render: (total: number) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(total)
        },
        {
            title: 'Thời gian còn lại',
            key: 'timeRemaining',
            render: (record: OrderResponse) => {
                if (record.orderStatus !== 'PENDING' || record.paymentMethod !== 'BANK_TRANSFER') {
                    return '-';
                }

                const timeRemaining = calculateTimeRemaining(record.createAt);
                if (!timeRemaining) {
                    return <Text type="danger">Hết hạn</Text>;
                }

                return (
                    <Space>
                        <ClockCircleOutlined style={{ color: '#faad14' }} />
                        <Text type="warning">
                            {timeRemaining.minutes}:{String(timeRemaining.seconds).padStart(2, '0')}
                        </Text>
                    </Space>
                );
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (record: OrderResponse) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            // Navigate to order detail
                            console.log('View order:', record.id);
                        }}
                    >
                        Xem chi tiết
                    </Button>
                    {canPayOrder(record) && (
                        <Button
                            type="primary"
                            size="small"
                            icon={<CreditCardOutlined />}
                            onClick={() => handleContinuePayment(record)}
                        >
                            Tiếp tục thanh toán
                        </Button>
                    )}
                    {record.orderStatus === 'PENDING' && !canPayOrder(record) && (
                        <Button
                            type="link"
                            size="small"
                            danger
                        >
                            Đã hết hạn
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    // Filter orders based on selected status
    const filteredOrders = selectedStatus === 'ALL'
        ? orders
        : orders.filter(o => o.orderStatus === selectedStatus);

    // Statistics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.orderStatus === 'DELIVERED').length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'PENDING' || o.orderStatus === 'PREPARING').length;
    const totalSpent = orders
        .filter(o => o.orderStatus !== 'CANCELLED')
        .reduce((sum, o) => sum + (o.subTotal || 0), 0);

    // Status filter buttons configuration
    const statusFilters = [
        { key: 'ALL', label: 'Tất cả', color: 'default' },
        { key: 'PENDING', label: 'Chờ thanh toán', color: 'orange' },
        { key: 'PREPARING', label: 'Đang chuẩn bị', color: 'blue' },
        { key: 'ARRIVED_AT_LOCATION', label: 'Đã đến khu vực', color: 'cyan' },
        { key: 'SHIPPED', label: 'Đang giao', color: 'geekblue' },
        { key: 'DELIVERED', label: 'Đã giao', color: 'green' },
        { key: 'CANCELLED', label: 'Đã hủy', color: 'red' },
        { key: 'RETURNED', label: 'Đã trả hàng', color: 'volcano' }
    ];

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <Button
                    icon={<LeftOutlined />}
                    onClick={() => navigate('/profile')}
                    style={{ marginBottom: '16px' }}
                >
                    Quay lại
                </Button>
                <Title level={2}>Đơn hàng của bạn</Title>
            </div>

            {/* Statistics
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Tổng đơn hàng"
                            value={totalOrders}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Đã hoàn thành"
                            value={completedOrders}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Đang xử lý"
                            value={pendingOrders}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Tổng chi tiêu"
                            value={totalSpent}
                            precision={0}
                            valueStyle={{ color: '#722ed1' }}
                            suffix="₫"
                            formatter={(value) =>
                                new Intl.NumberFormat('vi-VN').format(Number(value))
                            }
                        />
                    </Card>
                </Col>
            </Row> */}

            {/* Status Filter Buttons */}
            <Card style={{ marginBottom: '16px' }}>
                <div style={{ marginBottom: '8px' }}>
                    <Text strong>Lọc theo trạng thái:</Text>
                </div>
                <Space wrap>
                    {statusFilters.map(filter => {
                        const count = filter.key === 'ALL'
                            ? orders.length
                            : orders.filter(o => o.orderStatus === filter.key).length;

                        return (
                            <Button
                                key={filter.key}
                                type={selectedStatus === filter.key ? 'primary' : 'default'}
                                onClick={() => setSelectedStatus(filter.key)}
                                style={{
                                    borderColor: selectedStatus === filter.key ? undefined : filter.color,
                                    color: selectedStatus === filter.key ? undefined : filter.color
                                }}
                            >
                                {filter.label} ({count})
                            </Button>
                        );
                    })}
                </Space>
            </Card>

            {/* Orders Table */}
            <Card
                title="Danh sách đơn hàng"
                extra={
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchOrders}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                }
            >
                <Spin spinning={loading}>
                    <Table
                        columns={orderColumns}
                        dataSource={filteredOrders}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} đơn hàng`,
                        }}
                        locale={{
                            emptyText: (
                                <Empty
                                    description="Chưa có đơn hàng nào"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            )
                        }}
                    />
                </Spin>
            </Card>
        </div>
    );
}
