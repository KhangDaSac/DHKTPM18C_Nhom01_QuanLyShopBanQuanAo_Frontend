import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('overview');

    // Reset tab to overview when component mounts or route changes
    useEffect(() => {
        setActiveTab('overview');
    }, [location.pathname]);

    const handleTabChange = (key: string) => {
        setActiveTab(key);
    };

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
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop'
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
            image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop'
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
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop'
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
            image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop'
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
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop'
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
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=200&fit=crop'
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
            image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&h=200&fit=crop'
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
            image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop'
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
            image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&h=200&fit=crop'
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
            image: 'https://images.unsplash.com/photo-1566479179817-6fe4e9eafdc7?w=200&h=200&fit=crop'
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
                        width={60}
                        height={60}
                        src={record.image}
                        style={{ borderRadius: '8px', objectFit: 'cover' }}
                        preview={{
                            mask: 'Xem ảnh'
                        }}
                    />
                    <div>
                        <div style={{ fontWeight: 500, marginBottom: '4px' }}>{text}</div>
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
                    color: stock > 50 ? '#52c41a' : stock > 0 ? '#faad14' : '#ff4d4f',
                    fontWeight: 500
                }}>
                    {stock}
                </span>
            ),
        },
        {
            title: 'Đã bán',
            dataIndex: 'sold',
            key: 'sold',
            render: (sold: number) => (
                <Text strong style={{ color: '#1677ff' }}>{sold}</Text>
            ),
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating: number) => (
                <Space>
                    <StarFilled style={{ color: '#faad14' }} />
                    <span style={{ fontWeight: 500 }}>{rating}</span>
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
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        title="Xóa"
                    />
                </Space>
            ),
        },
    ];

    const tabItems = [
        {
            key: 'overview',
            label: 'Tổng quan',
            children: (
                <div>
                    {/* Statistics Cards */}
                    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                        <Col xs={24} sm={12} lg={6}>
                            <Card hoverable>
                                <Statistic
                                    title="Doanh thu"
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
                            <Card hoverable>
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
                            <Card hoverable>
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
                            <Card hoverable>
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

                    {/* Popular Products Table */}
                    <Card
                        title="Top 5 sản phẩm phổ biến"
                        style={{ marginBottom: '24px' }}
                        extra={
                            <Button
                                type="primary"
                                onClick={() => setActiveTab('all-products')}
                                className="btn btn-primary"
                            >
                                Xem tất cả
                            </Button>
                        }
                    >
                        <Table
                            columns={columns}
                            dataSource={products.slice(0, 5)}
                            pagination={false}
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
                                    <Divider style={{ margin: '8px 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text>Cập nhật giá sản phẩm "Giày sneaker"</Text>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            3 giờ trước
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
                                            title="Tổng sản phẩm"
                                            value={products.length}
                                            valueStyle={{ fontSize: '20px', color: '#1677ff' }}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="Danh mục"
                                            value={new Set(products.map(p => p.category)).size}
                                            valueStyle={{ fontSize: '20px', color: '#722ed1' }}
                                        />
                                    </Col>
                                    <Col span={12} style={{ marginTop: '16px' }}>
                                        <Statistic
                                            title="Hết hàng"
                                            value={products.filter(p => p.stock === 0).length}
                                            valueStyle={{ fontSize: '20px', color: '#cf1322' }}
                                        />
                                    </Col>
                                    <Col span={12} style={{ marginTop: '16px' }}>
                                        <Statistic
                                            title="Hoạt động"
                                            value={products.filter(p => p.status === 'active').length}
                                            valueStyle={{ fontSize: '20px', color: '#52c41a' }}
                                        />
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </div>
            )
        },
        {
            key: 'all-products',
            label: 'Tất cả sản phẩm',
            children: (
                <Card
                    title={`Danh sách tất cả sản phẩm (${products.length} sản phẩm)`}
                    extra={
                        <Space>
                            <Button type="primary" className="btn btn-primary">
                                Thêm sản phẩm
                            </Button>
                            <Button>Xuất Excel</Button>
                        </Space>
                    }
                >
                    <Table
                        columns={columns}
                        dataSource={products}
                        pagination={{
                            pageSize: 8,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} sản phẩm`,
                        }}
                        scroll={{ x: 800 }}
                        rowClassName={(_, index) =>
                            index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
                        }
                    />
                </Card>
            )
        }
    ];

    return (
        <div>
            <Title level={2} className="text-primary" style={{ marginBottom: '24px' }}>
                Dashboard ModaMint
            </Title>

            <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                items={tabItems}
                size="large"
                tabBarStyle={{ marginBottom: '24px' }}
                tabBarGutter={32}
            />

            <style>
                {`
                    .table-row-light {
                        background-color: #fafafa;
                    }
                    .table-row-dark {
                        background-color: #ffffff;
                    }
                    .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
                        color: hsl(var(--p));
                    }
                    .ant-tabs-ink-bar {
                        background: hsl(var(--p));
                    }
                `}
            </style>
        </div>
    );
};

export default Dashboard;