import React, { useState } from 'react';
import {
    Row,
    Col,
    Card,
    Statistic,
    Table,
    Tag,
    Space,
    Button,
    Typography,
    Progress,
    Avatar,
    Divider,
    Image,
    Tabs
} from 'antd';
import {
    ShoppingCartOutlined,
    DollarOutlined,
    UserOutlined,
    RiseOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    StarFilled
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface Product {
    key: string;
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    sold: number;
    rating: number;
    status: 'active' | 'inactive' | 'out_of_stock';
    image: string;
}

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // Mock data for products with real images
    const products: Product[] = [
        {
            key: '1',
            id: 'P001',
            name: 'Áo thun cotton nam trắng',
            category: 'Áo thun',
            price: 299000,
            stock: 150,
            sold: 89,
            rating: 4.8,
            status: 'active',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop'
        },
        {
            key: '2',
            id: 'P002',
            name: 'Quần jean nữ skinny xanh',
            category: 'Quần jean',
            price: 599000,
            stock: 75,
            sold: 156,
            rating: 4.6,
            status: 'active',
            image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=100&h=100&fit=crop'
        },
        {
            key: '3',
            id: 'P003',
            name: 'Váy maxi họa tiết hoa',
            category: 'Váy',
            price: 450000,
            stock: 0,
            sold: 234,
            rating: 4.9,
            status: 'out_of_stock',
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&h=100&fit=crop'
        },
        {
            key: '4',
            id: 'P004',
            name: 'Giày sneaker trắng Nike',
            category: 'Giày',
            price: 899000,
            stock: 45,
            sold: 67,
            rating: 4.7,
            status: 'active',
            image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop'
        },
        {
            key: '5',
            id: 'P005',
            name: 'Túi xách da thật nâu',
            category: 'Túi xách',
            price: 1299000,
            stock: 23,
            sold: 34,
            rating: 4.5,
            status: 'active',
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop'
        },
        {
            key: '6',
            id: 'P006',
            name: 'Áo sơ mi trắng công sở',
            category: 'Áo sơ mi',
            price: 399000,
            stock: 120,
            sold: 145,
            rating: 4.6,
            status: 'active',
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&h=100&fit=crop'
        },
        {
            key: '7',
            id: 'P007',
            name: 'Giày cao gót đen',
            category: 'Giày',
            price: 750000,
            stock: 35,
            sold: 78,
            rating: 4.4,
            status: 'active',
            image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=100&h=100&fit=crop'
        },
        {
            key: '8',
            id: 'P008',
            name: 'Áo khoác hoodie xám',
            category: 'Áo khoác',
            price: 599000,
            stock: 90,
            sold: 123,
            rating: 4.7,
            status: 'active',
            image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100&h=100&fit=crop'
        },
        {
            key: '9',
            id: 'P009',
            name: 'Quần short kaki',
            category: 'Quần short',
            price: 349000,
            stock: 65,
            sold: 89,
            rating: 4.3,
            status: 'active',
            image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=100&h=100&fit=crop'
        },
        {
            key: '10',
            id: 'P010',
            name: 'Đầm công sở đỏ',
            category: 'Đầm',
            price: 699000,
            stock: 42,
            sold: 156,
            rating: 4.8,
            status: 'active',
            image: 'https://images.unsplash.com/photo-1566479179817-6fe4e9eafdc7?w=100&h=100&fit=crop'
        }
    ];

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Product) => (
                <Space>
                    <Image
                        width={48}
                        height={48}
                        src={record.image}
                        style={{ borderRadius: '6px', objectFit: 'cover' }}
                        preview={{
                            mask: 'Xem ảnh'
                        }}
                    />
                    <div>
                        <div style={{ fontWeight: 500 }}>{text}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            ID: {record.id}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => (
                <Tag color="blue">{category}</Tag>
            ),
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => (
                <Text strong>
                    {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(price)}
                </Text>
            ),
        },
        {
            title: 'Tồn kho',
            dataIndex: 'stock',
            key: 'stock',
            render: (stock: number) => (
                <span style={{
                    color: stock > 50 ? '#52c41a' : stock > 0 ? '#faad14' : '#ff4d4f'
                }}>
                    {stock}
                </span>
            ),
        },
        {
            title: 'Đã bán',
            dataIndex: 'sold',
            key: 'sold',
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating: number) => (
                <Space>
                    <StarFilled style={{ color: '#faad14' }} />
                    <span>{rating}</span>
                </Space>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const statusConfig = {
                    active: { color: 'green', text: 'Hoạt động' },
                    inactive: { color: 'red', text: 'Tạm dừng' },
                    out_of_stock: { color: 'orange', text: 'Hết hàng' },
                };
                const config = statusConfig[status as keyof typeof statusConfig];
                return <Tag color={config.color}>{config.text}</Tag>;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: () => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        size="small"
                        title="Xem chi tiết"
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        title="Chỉnh sửa"
                    />
                    <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                        title="Xóa"
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Title level={2} style={{ marginBottom: '24px' }}>
                Tổng quan Dashboard
            </Title>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={125000000}
                            precision={0}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarOutlined />}
                            suffix="₫"
                            formatter={(value) =>
                                new Intl.NumberFormat('vi-VN').format(Number(value))
                            }
                        />
                        <Progress
                            percent={78}
                            size="small"
                            showInfo={false}
                            strokeColor="#3f8600"
                            style={{ marginTop: '8px' }}
                        />
                        <Text type="success" style={{ fontSize: '12px' }}>
                            +12% so với tháng trước
                        </Text>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đơn hàng"
                            value={1567}
                            valueStyle={{ color: '#1677ff' }}
                            prefix={<ShoppingCartOutlined />}
                        />
                        <Progress
                            percent={65}
                            size="small"
                            showInfo={false}
                            strokeColor="#1677ff"
                            style={{ marginTop: '8px' }}
                        />
                        <Text style={{ color: '#1677ff', fontSize: '12px' }}>
                            +8% so với tháng trước
                        </Text>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Khách hàng"
                            value={2456}
                            valueStyle={{ color: '#722ed1' }}
                            prefix={<UserOutlined />}
                        />
                        <Progress
                            percent={92}
                            size="small"
                            showInfo={false}
                            strokeColor="#722ed1"
                            style={{ marginTop: '8px' }}
                        />
                        <Text style={{ color: '#722ed1', fontSize: '12px' }}>
                            +15% so với tháng trước
                        </Text>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tăng trưởng"
                            value={28.5}
                            precision={1}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<RiseOutlined />}
                            suffix="%"
                        />
                        <Progress
                            percent={85}
                            size="small"
                            showInfo={false}
                            strokeColor="#cf1322"
                            style={{ marginTop: '8px' }}
                        />
                        <Text type="danger" style={{ fontSize: '12px' }}>
                            +5.2% so với tháng trước
                        </Text>
                    </Card>
                </Col>
            </Row>

            {/* Products Table */}
            <Card
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Sản phẩm phổ biến</span>
                        <Button type="primary">
                            Xem tất cả
                        </Button>
                    </div>
                }
                style={{ marginBottom: '24px' }}
            >
                <Table
                    columns={columns}
                    dataSource={products}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} sản phẩm`,
                    }}
                    scroll={{ x: 800 }}
                />
            </Card>

            {/* Quick Actions */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card title="Hoạt động gần đây" size="small">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Đơn hàng #DH001 đã được xử lý</Text>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    5 phút trước
                                </Text>
                            </div>
                            <Divider style={{ margin: '8px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Sản phẩm "Áo thun cotton" được thêm vào</Text>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    1 giờ trước
                                </Text>
                            </div>
                            <Divider style={{ margin: '8px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Khách hàng mới đăng ký</Text>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    2 giờ trước
                                </Text>
                            </div>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card title="Thống kê nhanh" size="small">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic
                                    title="Sản phẩm"
                                    value={145}
                                    valueStyle={{ fontSize: '20px' }}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Danh mục"
                                    value={12}
                                    valueStyle={{ fontSize: '20px' }}
                                />
                            </Col>
                            <Col span={12} style={{ marginTop: '16px' }}>
                                <Statistic
                                    title="Đang hết hàng"
                                    value={8}
                                    valueStyle={{ fontSize: '20px', color: '#cf1322' }}
                                />
                            </Col>
                            <Col span={12} style={{ marginTop: '16px' }}>
                                <Statistic
                                    title="Chờ duyệt"
                                    value={3}
                                    valueStyle={{ fontSize: '20px', color: '#faad14' }}
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;