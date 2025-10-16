import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    Input,
    Select,
    message,
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Popconfirm,
    Descriptions,
    Steps,
    Timeline,
    Tabs,
    Divider,
    Badge,
    Avatar,
    DatePicker,
    Progress,
    Tooltip
} from 'antd';
import {
    ShoppingCartOutlined,
    EyeOutlined,
    EditOutlined,
    PrinterOutlined,
    TruckOutlined,
    DollarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
    DownloadOutlined,
    PlusOutlined,
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined,
    MailOutlined,
    FileTextOutlined,
    SyncOutlined,
    ExclamationCircleOutlined,
    SettingOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import './style.css';
import '../../components/common-styles.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;
const { TabPane } = Tabs;

// Interface cho OrderItem
interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    productImage: string;
    sku: string;
    price: number;
    quantity: number;
    subtotal: number;
    variant?: {
        color?: string;
        size?: string;
    };
}

// Interface cho Order
interface Order {
    id: number;
    orderNumber: string;
    customerId: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'returned';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'e_wallet';
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
        ward: string;
        district: string;
        province: string;
    };
    items: OrderItem[];
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    deliveredAt?: string;
    trackingNumber?: string;
}

// Mock data cho orders
const initialOrders: Order[] = [
    {
        id: 1,
        orderNumber: 'ORD001',
        customerId: 1,
        customerName: 'Nguyễn Văn An',
        customerEmail: 'nguyenvanan@email.com',
        customerPhone: '0123456789',
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'bank_transfer',
        shippingAddress: {
            fullName: 'Nguyễn Văn An',
            phone: '0123456789',
            address: '123 Đường ABC',
            ward: 'Phường 1',
            district: 'Quận 1',
            province: 'TP. Hồ Chí Minh'
        },
        items: [
            {
                id: 1,
                productId: 1,
                productName: 'Áo Thun Nam Cổ Tròn Basic',
                productImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100',
                sku: 'ATN001',
                price: 179000,
                quantity: 2,
                subtotal: 358000,
                variant: { color: 'Đen', size: 'L' }
            }
        ],
        subtotal: 358000,
        shippingFee: 30000,
        discount: 0,
        total: 388000,
        notes: 'Giao hàng nhanh',
        createdAt: '2024-12-01',
        updatedAt: '2024-12-05',
        deliveredAt: '2024-12-05',
        trackingNumber: 'TN001234567'
    },
    {
        id: 2,
        orderNumber: 'ORD002',
        customerId: 2,
        customerName: 'Trần Thị Bình',
        customerEmail: 'tranthibinh@email.com',
        customerPhone: '0987654321',
        status: 'shipping',
        paymentStatus: 'paid',
        paymentMethod: 'credit_card',
        shippingAddress: {
            fullName: 'Trần Thị Bình',
            phone: '0987654321',
            address: '456 Đường XYZ',
            ward: 'Phường 2',
            district: 'Quận 3',
            province: 'TP. Hồ Chí Minh'
        },
        items: [
            {
                id: 2,
                productId: 2,
                productName: 'Váy Maxi Hoa Nhí Nữ',
                productImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=100',
                sku: 'VMN002',
                price: 315000,
                quantity: 1,
                subtotal: 315000
            }
        ],
        subtotal: 315000,
        shippingFee: 25000,
        discount: 31500,
        total: 308500,
        notes: '',
        createdAt: '2024-12-02',
        updatedAt: '2024-12-04',
        trackingNumber: 'TN001234568'
    },
    {
        id: 3,
        orderNumber: 'ORD003',
        customerId: 3,
        customerName: 'Lê Minh Cường',
        customerEmail: 'leminhcuong@email.com',
        customerPhone: '0345678912',
        status: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'e_wallet',
        shippingAddress: {
            fullName: 'Lê Minh Cường',
            phone: '0345678912',
            address: '789 Đường DEF',
            ward: 'Phường 5',
            district: 'Quận 7',
            province: 'TP. Hồ Chí Minh'
        },
        items: [
            {
                id: 3,
                productId: 3,
                productName: 'Quần Jeans Slim Fit Nam',
                productImage: 'https://images.unsplash.com/photo-1542272454315-7ad9f6620c3c?w=100',
                sku: 'QJN003',
                price: 450000,
                quantity: 1,
                subtotal: 450000,
                variant: { color: 'Xanh đậm', size: '32' }
            },
            {
                id: 4,
                productId: 1,
                productName: 'Áo Thun Nam Cổ Tròn Basic',
                productImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100',
                sku: 'ATN001',
                price: 179000,
                quantity: 1,
                subtotal: 179000,
                variant: { color: 'Trắng', size: 'M' }
            }
        ],
        subtotal: 629000,
        shippingFee: 30000,
        discount: 0,
        total: 659000,
        createdAt: '2024-12-03',
        updatedAt: '2024-12-03'
    },
    {
        id: 4,
        orderNumber: 'ORD004',
        customerId: 4,
        customerName: 'Phạm Thị Dung',
        customerEmail: 'phamthidung@email.com',
        customerPhone: '0567891234',
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'cash',
        shippingAddress: {
            fullName: 'Phạm Thị Dung',
            phone: '0567891234',
            address: '321 Đường GHI',
            ward: 'Phường 8',
            district: 'Quận 10',
            province: 'TP. Hồ Chí Minh'
        },
        items: [
            {
                id: 5,
                productId: 4,
                productName: 'Áo Blouse Nữ Tay Dài',
                productImage: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=100',
                sku: 'ABN004',
                price: 280000,
                quantity: 2,
                subtotal: 560000
            }
        ],
        subtotal: 560000,
        shippingFee: 25000,
        discount: 56000,
        total: 529000,
        notes: 'Khách hàng VIP',
        createdAt: '2024-12-04',
        updatedAt: '2024-12-04'
    },
    {
        id: 5,
        orderNumber: 'ORD005',
        customerId: 5,
        customerName: 'Hoàng Văn Em',
        customerEmail: 'hoangvanem@email.com',
        customerPhone: '0789123456',
        status: 'cancelled',
        paymentStatus: 'refunded',
        paymentMethod: 'bank_transfer',
        shippingAddress: {
            fullName: 'Hoàng Văn Em',
            phone: '0789123456',
            address: '654 Đường JKL',
            ward: 'Phường 12',
            district: 'Quận Tân Bình',
            province: 'TP. Hồ Chí Minh'
        },
        items: [
            {
                id: 6,
                productId: 5,
                productName: 'Giày Sneaker Nam Trắng',
                productImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100',
                sku: 'GSN005',
                price: 765000,
                quantity: 1,
                subtotal: 765000,
                variant: { color: 'Trắng', size: '42' }
            }
        ],
        subtotal: 765000,
        shippingFee: 35000,
        discount: 0,
        total: 800000,
        notes: 'Khách hàng hủy đơn',
        createdAt: '2024-12-01',
        updatedAt: '2024-12-02'
    }
];

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // States cho filtering
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');
    const [filterPaymentMethod] = useState<string>('all');

    // Inject CSS để fix table spacing
    useEffect(() => {
        const styleId = 'custom-orders-table-fix';
        let existingStyle = document.getElementById(styleId);

        if (existingStyle) {
            existingStyle.remove();
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .custom-orders-table .ant-table-thead > tr > th {
                vertical-align: middle !important;
                text-align: center !important;
                font-weight: 600 !important;
                padding: 8px 16px !important;
                border-bottom: 1px solid #f0f0f0 !important;
                background-color: #fafafa !important;
                height: 40px !important;
            }
            
            .custom-orders-table .ant-table-tbody > tr > td {
                vertical-align: middle !important;
                padding: 8px 16px !important;
                height: 60px !important;
                border-bottom: 1px solid #f0f0f0 !important;
            }
            
            .order-timeline .ant-timeline-item-content {
                min-height: 20px;
            }
        `;

        document.head.appendChild(style);

        return () => {
            const styleToRemove = document.getElementById(styleId);
            if (styleToRemove) {
                styleToRemove.remove();
            }
        };
    }, []);

    // Filtered orders
    const filteredOrders = orders.filter(order => {
        if (filterStatus !== 'all' && order.status !== filterStatus) return false;
        if (filterPaymentStatus !== 'all' && order.paymentStatus !== filterPaymentStatus) return false;
        if (filterPaymentMethod !== 'all' && order.paymentMethod !== filterPaymentMethod) return false;
        return true;
    });

    // Statistics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);

    // Get status color and text
    const getStatusConfig = (status: string) => {
        const configs = {
            pending: { color: 'orange', text: 'Chờ xác nhận' },
            confirmed: { color: 'blue', text: 'Đã xác nhận' },
            processing: { color: 'cyan', text: 'Đang xử lý' },
            shipping: { color: 'purple', text: 'Đang giao' },
            delivered: { color: 'green', text: 'Đã giao' },
            cancelled: { color: 'red', text: 'Đã hủy' },
            returned: { color: 'volcano', text: 'Đã trả' }
        };
        return configs[status as keyof typeof configs] || { color: 'default', text: status };
    };

    const getPaymentStatusConfig = (status: string) => {
        const configs = {
            pending: { color: 'orange', text: 'Chờ thanh toán' },
            paid: { color: 'green', text: 'Đã thanh toán' },
            failed: { color: 'red', text: 'Thất bại' },
            refunded: { color: 'purple', text: 'Đã hoàn tiền' }
        };
        return configs[status as keyof typeof configs] || { color: 'default', text: status };
    };

    const getPaymentMethodText = (method: string) => {
        const methods = {
            cash: 'Tiền mặt',
            bank_transfer: 'Chuyển khoản',
            credit_card: 'Thẻ tín dụng',
            e_wallet: 'Ví điện tử'
        };
        return methods[method as keyof typeof methods] || method;
    };

    // Table columns
    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
            width: 120,
            render: (orderNumber: string, record: Order) => (
                <div className="table-cell-container left">
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                            {orderNumber}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.createdAt}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            width: 200,
            render: (record: Order) => (
                <div className="table-cell-container left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar icon={<UserOutlined />} size="small" />
                        <div>
                            <div style={{ fontWeight: 'bold' }}>
                                {record.customerName}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                {record.customerPhone}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Sản phẩm',
            key: 'items',
            width: 150,
            render: (record: Order) => (
                <div className="table-cell-container">
                    <div>
                        <div style={{ fontWeight: 'bold' }}>
                            {record.items.length} sản phẩm
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.items[0]?.productName}
                            {record.items.length > 1 && `... +${record.items.length - 1}`}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            key: 'total',
            width: 120,
            align: 'center' as const,
            render: (total: number) => (
                <div className="table-cell-container">
                    <span style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '14px' }}>
                        {total.toLocaleString()}đ
                    </span>
                </div>
            ),
        },
        {
            title: 'Trạng thái đơn',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            align: 'center' as const,
            render: (status: string) => {
                const config = getStatusConfig(status);
                return (
                    <div className="table-cell-container">
                        <Tag color={config.color}>{config.text}</Tag>
                    </div>
                );
            },
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            width: 130,
            align: 'center' as const,
            render: (paymentStatus: string, record: Order) => {
                const config = getPaymentStatusConfig(paymentStatus);
                return (
                    <div className="table-cell-container">
                        <div>
                            <Tag color={config.color}>{config.text}</Tag>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                {getPaymentMethodText(record.paymentMethod)}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            align: 'center' as const,
            render: (record: Order) => (
                <div className="table-cell-container">
                    <Space size="small">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                            title="Xem chi tiết"
                        />
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            title="Chỉnh sửa"
                        />
                        <Button
                            type="text"
                            icon={<PrinterOutlined />}
                            onClick={() => handlePrintInvoice(record)}
                            title="In hóa đơn"
                        />
                        {record.status !== 'cancelled' && record.status !== 'delivered' && (
                            <Popconfirm
                                title="Bạn có chắc muốn hủy đơn hàng này?"
                                onConfirm={() => handleCancelOrder(record.id)}
                                okText="Hủy đơn"
                                cancelText="Không"
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<CloseCircleOutlined />}
                                    title="Hủy đơn"
                                />
                            </Popconfirm>
                        )}
                    </Space>
                </div>
            ),
        },
    ];

    const handleView = (order: Order) => {
        setViewingOrder(order);
        setIsViewModalVisible(true);
    };

    const handleEdit = (order: Order) => {
        setEditingOrder(order);
        form.setFieldsValue({
            status: order.status,
            paymentStatus: order.paymentStatus,
            trackingNumber: order.trackingNumber,
            notes: order.notes
        });
        setIsEditModalVisible(true);
    };

    const handleUpdateOrder = async (values: any) => {
        if (!editingOrder) return;

        setLoading(true);
        try {
            const updatedOrder = {
                ...editingOrder,
                ...values,
                updatedAt: new Date().toISOString().split('T')[0],
                deliveredAt: values.status === 'delivered' && editingOrder.status !== 'delivered'
                    ? new Date().toISOString().split('T')[0]
                    : editingOrder.deliveredAt
            };

            setOrders(orders.map(o => o.id === editingOrder.id ? updatedOrder : o));
            message.success('Đã cập nhật đơn hàng thành công!');
            setIsEditModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = (id: number) => {
        setOrders(orders.map(o => o.id === id ? {
            ...o,
            status: 'cancelled' as const,
            paymentStatus: o.paymentStatus === 'paid' ? 'refunded' as const : o.paymentStatus,
            updatedAt: new Date().toISOString().split('T')[0]
        } : o));
        message.success('Đã hủy đơn hàng!');
    };

    const handlePrintInvoice = (order: Order) => {
        // Logic in hóa đơn
        message.info(`Đang in hóa đơn cho đơn hàng ${order.orderNumber}`);
    };

    // Export Excel
    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(orders.map(order => ({
            'Mã đơn hàng': order.orderNumber,
            'Khách hàng': order.customerName,
            'Email': order.customerEmail,
            'Điện thoại': order.customerPhone,
            'Trạng thái đơn': getStatusConfig(order.status).text,
            'Trạng thái thanh toán': getPaymentStatusConfig(order.paymentStatus).text,
            'Phương thức thanh toán': getPaymentMethodText(order.paymentMethod),
            'Số sản phẩm': order.items.length,
            'Tạm tính': order.subtotal,
            'Phí ship': order.shippingFee,
            'Giảm giá': order.discount,
            'Tổng tiền': order.total,
            'Ngày tạo': order.createdAt,
            'Ngày cập nhật': order.updatedAt,
            'Ghi chú': order.notes || ''
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Đơn hàng');
        XLSX.writeFile(workbook, `don-hang-${new Date().toISOString().split('T')[0]}.xlsx`);
        message.success('Đã xuất file Excel thành công!');
    };

    // Render order timeline
    const renderOrderTimeline = (order: Order) => {
        const timelineItems = [
            { status: 'pending', title: 'Chờ xác nhận', icon: <ClockCircleOutlined /> },
            { status: 'confirmed', title: 'Đã xác nhận', icon: <CheckCircleOutlined /> },
            { status: 'processing', title: 'Đang xử lý', icon: <ClockCircleOutlined /> },
            { status: 'shipping', title: 'Đang giao hàng', icon: <TruckOutlined /> },
            { status: 'delivered', title: 'Đã giao hàng', icon: <CheckCircleOutlined /> }
        ];

        const currentIndex = timelineItems.findIndex(item => item.status === order.status);

        return (
            <Steps current={currentIndex} size="small">
                {timelineItems.map((item, index) => (
                    <Step
                        key={item.status}
                        title={item.title}
                        icon={item.icon}
                        status={
                            index < currentIndex ? 'finish' :
                                index === currentIndex ? 'process' : 'wait'
                        }
                    />
                ))}
            </Steps>
        );
    };

    return (
        <div className="orders-container">
            {/* Header Section */}
            <div className="orders-header">
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={1} style={{ margin: 0, color: 'white' }}>
                            <ShoppingCartOutlined style={{ marginRight: '12px' }} />
                            Quản lý Đơn hàng
                        </Title>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
                            Theo dõi và quản lý tất cả đơn hàng của cửa hàng
                        </Text>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    color: 'white'
                                }}
                            >
                                Thêm đơn hàng
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                    color: 'white'
                                }}
                                onClick={() => message.success('Đã làm mới dữ liệu!')}
                            >
                                Làm mới
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </div>

            {/* Statistics Grid */}
            <Row gutter={[16, 16]} className="stats-grid">
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card">
                        <div className="stat-icon">
                            <ShoppingCartOutlined />
                        </div>
                        <Statistic
                            title="Tổng đơn hàng"
                            value={totalOrders}
                            valueStyle={{ color: '#1890ff', fontSize: '32px', fontWeight: 'bold' }}
                        />
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#52c41a' }}>
                            <CheckCircleOutlined /> +12% so với tháng trước
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card">
                        <div className="stat-icon">
                            <ClockCircleOutlined />
                        </div>
                        <Statistic
                            title="Chờ xử lý"
                            value={pendingOrders}
                            valueStyle={{ color: '#faad14', fontSize: '32px', fontWeight: 'bold' }}
                        />
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#faad14' }}>
                            <ExclamationCircleOutlined /> Cần xử lý ngay
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card">
                        <div className="stat-icon">
                            <CheckCircleOutlined />
                        </div>
                        <Statistic
                            title="Hoàn thành"
                            value={deliveredOrders}
                            valueStyle={{ color: '#52c41a', fontSize: '32px', fontWeight: 'bold' }}
                        />
                        <Progress
                            percent={Math.round((deliveredOrders / totalOrders) * 100)}
                            size="small"
                            strokeColor="#52c41a"
                            style={{ marginTop: '8px' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card">
                        <div className="stat-icon">
                            <DollarOutlined />
                        </div>
                        <Statistic
                            title="Doanh thu"
                            value={totalRevenue}
                            suffix="đ"
                            valueStyle={{ color: '#722ed1', fontSize: '32px', fontWeight: 'bold' }}
                            formatter={(value) => `${Number(value).toLocaleString()}`}
                        />
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#722ed1' }}>
                            <TruckOutlined /> Tháng này
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Advanced Filters */}
            <Card className="orders-filters">
                <Row className="filter-row">
                    <Col className="filter-item">
                        <Input
                            placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
                            prefix={<SearchOutlined />}
                            allowClear
                            style={{ borderRadius: '8px' }}
                        />
                    </Col>
                    <Col className="filter-item">
                        <Select
                            placeholder="Trạng thái đơn hàng"
                            style={{ width: '100%', borderRadius: '8px' }}
                            value={filterStatus === 'all' ? undefined : filterStatus}
                            onChange={(value) => setFilterStatus(value || 'all')}
                            allowClear
                            suffixIcon={<FilterOutlined />}
                        >
                            <Option value="pending">
                                <Tag color="orange">Chờ xác nhận</Tag>
                            </Option>
                            <Option value="confirmed">
                                <Tag color="blue">Đã xác nhận</Tag>
                            </Option>
                            <Option value="processing">
                                <Tag color="cyan">Đang xử lý</Tag>
                            </Option>
                            <Option value="shipping">
                                <Tag color="purple">Đang giao</Tag>
                            </Option>
                            <Option value="delivered">
                                <Tag color="green">Đã giao</Tag>
                            </Option>
                            <Option value="cancelled">
                                <Tag color="red">Đã hủy</Tag>
                            </Option>
                            <Option value="returned">
                                <Tag color="magenta">Đã trả</Tag>
                            </Option>
                        </Select>
                    </Col>
                    <Col className="filter-item">
                        <Select
                            placeholder="Trạng thái thanh toán"
                            style={{ width: '100%', borderRadius: '8px' }}
                            value={filterPaymentStatus === 'all' ? undefined : filterPaymentStatus}
                            onChange={(value) => setFilterPaymentStatus(value || 'all')}
                            allowClear
                            suffixIcon={<DollarOutlined />}
                        >
                            <Option value="pending">
                                <Tag color="orange">Chờ thanh toán</Tag>
                            </Option>
                            <Option value="paid">
                                <Tag color="green">Đã thanh toán</Tag>
                            </Option>
                            <Option value="failed">
                                <Tag color="red">Thất bại</Tag>
                            </Option>
                            <Option value="refunded">
                                <Tag color="blue">Đã hoàn tiền</Tag>
                            </Option>
                        </Select>
                    </Col>
                    <Col className="filter-item">
                        <DatePicker.RangePicker
                            placeholder={['Từ ngày', 'Đến ngày']}
                            style={{ width: '100%', borderRadius: '8px' }}
                        />
                    </Col>
                    <Col className="filter-actions">
                        <Space>
                            <Button
                                type="default"
                                icon={<ReloadOutlined />}
                                onClick={() => {
                                    setFilterStatus('all');
                                    setFilterPaymentStatus('all');
                                    message.success('Đã reset bộ lọc!');
                                }}
                            >
                                Reset
                            </Button>
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={handleExportExcel}
                                style={{
                                    background: 'linear-gradient(45deg, #1890ff, #722ed1)',
                                    border: 'none',
                                    borderRadius: '8px'
                                }}
                            >
                                Xuất Excel
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Bulk Actions */}
            {selectedRowKeys.length > 0 && (
                <Card
                    style={{
                        marginBottom: '16px',
                        background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)',
                        border: '1px solid #1890ff',
                        borderRadius: '12px'
                    }}
                >
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Space>
                                <Badge count={selectedRowKeys.length} style={{ backgroundColor: '#1890ff' }}>
                                    <Avatar icon={<ShoppingCartOutlined />} />
                                </Badge>
                                <div>
                                    <Text strong style={{ color: '#1890ff' }}>
                                        Đã chọn {selectedRowKeys.length} đơn hàng
                                    </Text>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                        Chọn thao tác để thực hiện hàng loạt
                                    </div>
                                </div>
                            </Space>
                        </Col>
                        <Col>
                            <Space>
                                <Button
                                    type="default"
                                    icon={<PrinterOutlined />}
                                    onClick={() => message.success('Đang in hóa đơn hàng loạt...')}
                                >
                                    In hóa đơn
                                </Button>
                                <Button
                                    type="default"
                                    icon={<MailOutlined />}
                                    onClick={() => message.success('Đang gửi email thông báo...')}
                                >
                                    Gửi email
                                </Button>
                                <Button
                                    onClick={() => setSelectedRowKeys([])}
                                    style={{ borderRadius: '8px' }}
                                >
                                    Bỏ chọn
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            )}

            {/* Quick Stats Bar */}
            <Card style={{ marginBottom: '16px', background: '#fafafa' }}>
                <Row gutter={16} justify="center">
                    <Col span={4} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                            {filteredOrders.length}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Tổng đơn</div>
                    </Col>
                    <Col span={4} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                            {filteredOrders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}đ
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Tổng giá trị</div>
                    </Col>
                    <Col span={4} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#faad14' }}>
                            {filteredOrders.filter(o => o.status === 'pending').length}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Chờ xử lý</div>
                    </Col>
                    <Col span={4} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#722ed1' }}>
                            {filteredOrders.filter(o => o.status === 'shipping').length}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Đang giao</div>
                    </Col>
                    <Col span={4} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#13c2c2' }}>
                            {Math.round((filteredOrders.filter(o => o.status === 'delivered').length / filteredOrders.length) * 100) || 0}%
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Tỷ lệ hoàn thành</div>
                    </Col>
                </Row>
            </Card>

            {/* Orders Table */}
            <Card className="orders-table">
                <div style={{ marginBottom: '16px' }}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Title level={4} style={{ margin: 0 }}>
                                <FileTextOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                Danh sách đơn hàng
                            </Title>
                        </Col>
                        <Col>
                            <Space>
                                <Tooltip title="Làm mới dữ liệu">
                                    <Button
                                        icon={<SyncOutlined />}
                                        onClick={() => message.success('Đã làm mới!')}
                                    />
                                </Tooltip>
                                <Tooltip title="Cài đặt cột hiển thị">
                                    <Button icon={<SettingOutlined />} />
                                </Tooltip>
                            </Space>
                        </Col>
                    </Row>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredOrders}
                    rowKey="id"
                    size="small"
                    className="custom-orders-table"
                    rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                        columnWidth: 50,
                        fixed: true,
                    }}
                    scroll={{ x: 1200 }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} đơn hàng`,
                        pageSizeOptions: ['10', '20', '50', '100']
                    }}
                />
            </Card>

            {/* View Order Modal */}
            <Modal
                title={`Chi tiết đơn hàng ${viewingOrder?.orderNumber}`}
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={[
                    <Button key="print" icon={<PrinterOutlined />} onClick={() => viewingOrder && handlePrintInvoice(viewingOrder)}>
                        In hóa đơn
                    </Button>,
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={800}
            >
                {viewingOrder && (
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Thông tin chung" key="1">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Descriptions size="small">
                                        <Descriptions.Item label="Mã đơn hàng" span={3}>
                                            <strong>{viewingOrder.orderNumber}</strong>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Ngày tạo" span={3}>
                                            {viewingOrder.createdAt}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Trạng thái" span={3}>
                                            <Tag color={getStatusConfig(viewingOrder.status).color}>
                                                {getStatusConfig(viewingOrder.status).text}
                                            </Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Thanh toán" span={3}>
                                            <Tag color={getPaymentStatusConfig(viewingOrder.paymentStatus).color}>
                                                {getPaymentStatusConfig(viewingOrder.paymentStatus).text}
                                            </Tag>
                                            <br />
                                            <Text type="secondary">
                                                {getPaymentMethodText(viewingOrder.paymentMethod)}
                                            </Text>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                                <Col span={12}>
                                    <Descriptions size="small">
                                        <Descriptions.Item label="Khách hàng" span={3}>
                                            <strong>{viewingOrder.customerName}</strong>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Email" span={3}>
                                            {viewingOrder.customerEmail}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Điện thoại" span={3}>
                                            {viewingOrder.customerPhone}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Mã vận đơn" span={3}>
                                            {viewingOrder.trackingNumber || 'Chưa có'}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                            </Row>

                            <Divider />

                            <div style={{ marginBottom: '16px' }}>
                                <Text strong>Địa chỉ giao hàng:</Text>
                                <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                                    <div><strong>{viewingOrder.shippingAddress.fullName}</strong></div>
                                    <div>{viewingOrder.shippingAddress.phone}</div>
                                    <div>
                                        {viewingOrder.shippingAddress.address}, {viewingOrder.shippingAddress.ward}, {viewingOrder.shippingAddress.district}, {viewingOrder.shippingAddress.province}
                                    </div>
                                </div>
                            </div>

                            {viewingOrder.notes && (
                                <div>
                                    <Text strong>Ghi chú:</Text>
                                    <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                                        {viewingOrder.notes}
                                    </div>
                                </div>
                            )}
                        </TabPane>

                        <TabPane tab="Sản phẩm" key="2">
                            <Table
                                dataSource={viewingOrder.items}
                                pagination={false}
                                size="small"
                                columns={[
                                    {
                                        title: 'Sản phẩm',
                                        key: 'product',
                                        render: (item: OrderItem) => (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <img
                                                    src={item.productImage}
                                                    alt={item.productName}
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>{item.productName}</div>
                                                    <div style={{ fontSize: '12px', color: '#666' }}>SKU: {item.sku}</div>
                                                    {item.variant && (
                                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                                            {item.variant.color && `Màu: ${item.variant.color}`}
                                                            {item.variant.size && ` | Size: ${item.variant.size}`}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        title: 'Giá',
                                        dataIndex: 'price',
                                        align: 'right' as const,
                                        render: (price: number) => `${price.toLocaleString()}đ`,
                                    },
                                    {
                                        title: 'SL',
                                        dataIndex: 'quantity',
                                        align: 'center' as const,
                                    },
                                    {
                                        title: 'Thành tiền',
                                        dataIndex: 'subtotal',
                                        align: 'right' as const,
                                        render: (subtotal: number) => (
                                            <strong>{subtotal.toLocaleString()}đ</strong>
                                        ),
                                    },
                                ]}
                            />

                            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
                                <Row justify="space-between">
                                    <Col>Tạm tính:</Col>
                                    <Col>{viewingOrder.subtotal.toLocaleString()}đ</Col>
                                </Row>
                                <Row justify="space-between">
                                    <Col>Phí vận chuyển:</Col>
                                    <Col>{viewingOrder.shippingFee.toLocaleString()}đ</Col>
                                </Row>
                                <Row justify="space-between">
                                    <Col>Giảm giá:</Col>
                                    <Col>-{viewingOrder.discount.toLocaleString()}đ</Col>
                                </Row>
                                <Divider style={{ margin: '8px 0' }} />
                                <Row justify="space-between" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                    <Col>Tổng cộng:</Col>
                                    <Col style={{ color: '#1890ff' }}>{viewingOrder.total.toLocaleString()}đ</Col>
                                </Row>
                            </div>
                        </TabPane>

                        <TabPane tab="Lịch sử" key="3">
                            <div className="order-timeline">
                                {renderOrderTimeline(viewingOrder)}

                                <div style={{ marginTop: '24px' }}>
                                    <Timeline>
                                        <Timeline.Item color="blue">
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>Đơn hàng được tạo</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>{viewingOrder.createdAt}</div>
                                            </div>
                                        </Timeline.Item>
                                        {viewingOrder.status !== 'pending' && (
                                            <Timeline.Item color="green">
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>Cập nhật trạng thái</div>
                                                    <div style={{ fontSize: '12px', color: '#666' }}>{viewingOrder.updatedAt}</div>
                                                </div>
                                            </Timeline.Item>
                                        )}
                                        {viewingOrder.deliveredAt && (
                                            <Timeline.Item color="green">
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>Đã giao hàng thành công</div>
                                                    <div style={{ fontSize: '12px', color: '#666' }}>{viewingOrder.deliveredAt}</div>
                                                </div>
                                            </Timeline.Item>
                                        )}
                                    </Timeline>
                                </div>
                            </div>
                        </TabPane>
                    </Tabs>
                )}
            </Modal>

            {/* Edit Order Modal */}
            <Modal
                title={`Chỉnh sửa đơn hàng ${editingOrder?.orderNumber}`}
                open={isEditModalVisible}
                onOk={() => form.submit()}
                onCancel={() => setIsEditModalVisible(false)}
                confirmLoading={loading}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateOrder}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Trạng thái đơn hàng"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                            >
                                <Select>
                                    <Option value="pending">Chờ xác nhận</Option>
                                    <Option value="confirmed">Đã xác nhận</Option>
                                    <Option value="processing">Đang xử lý</Option>
                                    <Option value="shipping">Đang giao</Option>
                                    <Option value="delivered">Đã giao</Option>
                                    <Option value="cancelled">Đã hủy</Option>
                                    <Option value="returned">Đã trả</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="paymentStatus"
                                label="Trạng thái thanh toán"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái thanh toán!' }]}
                            >
                                <Select>
                                    <Option value="pending">Chờ thanh toán</Option>
                                    <Option value="paid">Đã thanh toán</Option>
                                    <Option value="failed">Thất bại</Option>
                                    <Option value="refunded">Đã hoàn tiền</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="trackingNumber"
                        label="Mã vận đơn"
                    >
                        <Input placeholder="Nhập mã vận đơn" />
                    </Form.Item>
                    <Form.Item
                        name="notes"
                        label="Ghi chú"
                    >
                        <Input.TextArea rows={3} placeholder="Nhập ghi chú" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Orders;