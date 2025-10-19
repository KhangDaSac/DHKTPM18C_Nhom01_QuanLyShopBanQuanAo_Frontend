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
    Divider,
    Image,
    Tabs,
    Spin,
    Alert
} from 'antd';
import {
    DollarOutlined,
    UserOutlined,
    RiseOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    StarFilled,
    ShoppingOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useProducts } from '../hooks/useProducts';

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
    const { products: apiProducts, loading: apiLoading, error: apiError, refetch } = useProducts();
    const [localProducts, setLocalProducts] = useState<Product[]>([]);
    // Reset tab to overview when component mounts or route changes
    useEffect(() => {
        setActiveTab('overview');
    }, [location.pathname]);

    const handleTabChange = (key: string) => {
        setActiveTab(key);
    };

    

    // Kết hợp dữ liệu từ API và mock data
    const allProducts = [
        ...apiProducts.map(apiProduct => ({
            key: `api_${apiProduct.id}`,
            id: String(apiProduct.id), // Convert number to string
            name: apiProduct.name,
            category: apiProduct.categoryName || 'API Product',
            price: apiProduct.price,
            stock: 100, // Mock stock cho API products
            sold: Math.floor(Math.random() * 50), // Mock sold
            rating: 4.0 + Math.random(), // Mock rating
            status: apiProduct.active ? 'active' as const : 'inactive' as const,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop'
        })),
        ...localProducts
    ];

    // Statistics từ dữ liệu thực tế
    const totalProducts = allProducts.length;
    const activeProducts = allProducts.filter(p => p.status === 'active').length;
    const totalValue = allProducts.reduce((sum, p) => sum + p.price, 0);

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
                                    title="Tổng sản phẩm"
                                    value={totalProducts}
                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<ShoppingOutlined />}
                                />
                                <Text type="success" style={{ fontSize: '12px' }}>
                                    {activeProducts} sản phẩm hoạt động
                                </Text>
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <Card hoverable>
                                <Statistic
                                    title="Sản phẩm hoạt động"
                                    value={activeProducts}
                                    valueStyle={{ color: '#1677ff' }}
                                    prefix={<UserOutlined />}
                                />
                                <Text style={{ color: '#1677ff', fontSize: '12px' }}>
                                    {totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0}% tổng sản phẩm
                                </Text>
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <Card hoverable>
                                <Statistic
                                    title="Tổng giá trị kho"
                                    value={totalValue}
                                    precision={0}
                                    valueStyle={{ color: '#722ed1' }}
                                    prefix={<DollarOutlined />}
                                    suffix="₫"
                                    formatter={(value) =>
                                        new Intl.NumberFormat('vi-VN').format(Number(value))
                                    }
                                />
                                <Text style={{ color: '#722ed1', fontSize: '12px' }}>
                                    Giá trị trung bình: {totalProducts > 0 ? new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(totalValue / totalProducts) : '0₫'}
                                </Text>
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <Card hoverable>
                                <Statistic
                                    title="Tỷ lệ hoạt động"
                                    value={totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0}
                                    precision={1}
                                    valueStyle={{ color: '#cf1322' }}
                                    prefix={<RiseOutlined />}
                                    suffix="%"
                                />
                                <Text style={{ color: '#cf1322', fontSize: '12px' }}>
                                    {totalProducts - activeProducts} sản phẩm ngừng hoạt động
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
                            dataSource={allProducts.slice(0, 5)}
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
                                            value={totalProducts}
                                            valueStyle={{ fontSize: '20px', color: '#1677ff' }}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="Danh mục"
                                            value={new Set(allProducts.map(p => p.category)).size}
                                            valueStyle={{ fontSize: '20px', color: '#722ed1' }}
                                        />
                                    </Col>
                                    <Col span={12} style={{ marginTop: '16px' }}>
                                        <Statistic
                                            title="Hết hàng"
                                            value={allProducts.filter(p => p.stock === 0).length}
                                            valueStyle={{ fontSize: '20px', color: '#cf1322' }}
                                        />
                                    </Col>
                                    <Col span={12} style={{ marginTop: '16px' }}>
                                        <Statistic
                                            title="Hoạt động"
                                            value={activeProducts}
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
                    title={`Danh sách tất cả sản phẩm (${allProducts.length} sản phẩm)`}
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
                        dataSource={allProducts}
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
                <Button 
                    type="default" 
                    icon={<ReloadOutlined />} 
                    onClick={refetch}
                    loading={apiLoading}
                    style={{ marginLeft: '16px' }}
                >
                    Làm mới API
                </Button>
            </Title>

            {/* API Error Alert */}
            {apiError && (
                <Alert
                    message="Lỗi tải dữ liệu từ API"
                    description={apiError}
                    type="error"
                    showIcon
                    closable
                    style={{ marginBottom: '16px' }}
                />
            )}

            {/* Loading Spinner */}
            {apiLoading && (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px' }}>
                        <Text>Đang tải dữ liệu từ API...</Text>
                    </div>
                </div>
            )}

            {/* Dashboard Content */}
            {!apiLoading && (
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    items={tabItems}
                    size="large"
                    tabBarStyle={{ marginBottom: '24px' }}
                    tabBarGutter={32}
                />
            )}

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