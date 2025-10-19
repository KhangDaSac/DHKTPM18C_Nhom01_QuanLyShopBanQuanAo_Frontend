import { useState } from 'react';
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
    Statistic
} from 'antd';
import {
    ShoppingCartOutlined,
    EyeOutlined,
    ReloadOutlined,
    LeftOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface Order {
    id: string;
    orderNumber: string;
    date: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total: number;
    items: number;
    products: Array<{
        name: string;
        quantity: number;
        price: number;
        image: string;
    }>;
}

export default function ProfileOrders() {
    const navigate = useNavigate();

    // Mock data cho đơn hàng
    const [orders] = useState<Order[]>([
        {
            id: '1',
            orderNumber: 'DH001',
            date: '2024-01-15',
            status: 'delivered',
            total: 1299000,
            items: 3,
            products: [
                { name: 'Áo thun cotton', quantity: 2, price: 299000, image: '/placeholder.jpg' },
                { name: 'Quần jean slim', quantity: 1, price: 599000, image: '/placeholder.jpg' }
            ]
        },
        {
            id: '2',
            orderNumber: 'DH002',
            date: '2024-01-20',
            status: 'shipped',
            total: 599000,
            items: 2,
            products: [
                { name: 'Giày sneaker', quantity: 1, price: 599000, image: '/placeholder.jpg' }
            ]
        },
        {
            id: '3',
            orderNumber: 'DH003',
            date: '2024-01-25',
            status: 'processing',
            total: 299000,
            items: 1,
            products: [
                { name: 'Áo khoác bomber', quantity: 1, price: 299000, image: '/placeholder.jpg' }
            ]
        },
        {
            id: '4',
            orderNumber: 'DH004',
            date: '2024-01-28',
            status: 'pending',
            total: 899000,
            items: 2,
            products: [
                { name: 'Váy maxi', quantity: 1, price: 699000, image: '/placeholder.jpg' },
                { name: 'Túi xách', quantity: 1, price: 200000, image: '/placeholder.jpg' }
            ]
        }
    ]);

    const orderColumns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const statusConfig = {
                    pending: { color: 'orange', text: 'Chờ xử lý' },
                    processing: { color: 'blue', text: 'Đang xử lý' },
                    shipped: { color: 'cyan', text: 'Đã gửi hàng' },
                    delivered: { color: 'green', text: 'Đã giao' },
                    cancelled: { color: 'red', text: 'Đã hủy' }
                };
                const config = statusConfig[status as keyof typeof statusConfig];
                return <Tag color={config.color}>{config.text}</Tag>;
            }
        },
        {
            title: 'Số lượng',
            dataIndex: 'items',
            key: 'items',
            render: (items: number) => `${items} sản phẩm`
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            key: 'total',
            render: (total: number) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(total)
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (record: Order) => (
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
                    {record.status === 'pending' && (
                        <Button 
                            type="link" 
                            size="small"
                            danger
                        >
                            Hủy đơn
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    // Statistics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

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

            {/* Statistics */}
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
            </Row>

            {/* Orders Table */}
            <Card
                title="Danh sách đơn hàng"
                extra={
                    <Button icon={<ReloadOutlined />}>
                        Làm mới
                    </Button>
                }
            >
                <Table
                    columns={orderColumns}
                    dataSource={orders}
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
            </Card>
        </div>
    );
}
