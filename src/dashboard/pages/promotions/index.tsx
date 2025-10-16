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
    DatePicker,
    InputNumber,
    Switch,
    Progress
} from 'antd';
import {
    GiftOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    PercentageOutlined,
    DollarOutlined,
    CalendarOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    FireOutlined,
    DownloadOutlined,
    CopyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import './style.css';
import '../../components/common-styles.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// Interface cho Promotion
interface Promotion {
    id: number;
    name: string;
    code: string;
    description: string;
    type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
    value: number; // % hoặc số tiền
    minimumOrderValue?: number;
    maximumDiscountAmount?: number;
    buyQuantity?: number; // Cho buy X get Y
    getQuantity?: number; // Cho buy X get Y
    applicableProducts?: string[]; // ID sản phẩm áp dụng
    applicableCategories?: string[]; // Danh mục áp dụng
    startDate: string;
    endDate: string;
    usageLimit?: number; // Giới hạn số lần sử dụng
    usageCount: number; // Số lần đã sử dụng
    userLimit?: number; // Giới hạn số lần 1 user có thể dùng
    isActive: boolean;
    isPublic: boolean; // Hiển thị công khai hay cần mã
    createdAt: string;
    updatedAt: string;
}

// Mock data cho promotions
const initialPromotions: Promotion[] = [
    {
        id: 1,
        name: 'Giảm giá mùa hè',
        code: 'SUMMER2024',
        description: 'Giảm 20% cho tất cả sản phẩm thời trang mùa hè',
        type: 'percentage',
        value: 20,
        minimumOrderValue: 500000,
        maximumDiscountAmount: 200000,
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        usageLimit: 1000,
        usageCount: 245,
        userLimit: 1,
        isActive: true,
        isPublic: true,
        createdAt: '2024-05-15',
        updatedAt: '2024-06-01'
    },
    {
        id: 2,
        name: 'Miễn phí vận chuyển',
        code: 'FREESHIP',
        description: 'Miễn phí vận chuyển cho đơn hàng từ 300k',
        type: 'free_shipping',
        value: 0,
        minimumOrderValue: 300000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        usageCount: 1250,
        isActive: true,
        isPublic: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
    {
        id: 3,
        name: 'Mua 2 tặng 1',
        code: 'BUY2GET1',
        description: 'Mua 2 áo thun bất kỳ tặng 1 áo thun cùng loại',
        type: 'buy_x_get_y',
        value: 0,
        buyQuantity: 2,
        getQuantity: 1,
        applicableCategories: ['Áo Nam', 'Áo Nữ'],
        startDate: '2024-07-01',
        endDate: '2024-07-31',
        usageLimit: 500,
        usageCount: 89,
        userLimit: 2,
        isActive: true,
        isPublic: false,
        createdAt: '2024-06-20',
        updatedAt: '2024-07-01'
    },
    {
        id: 4,
        name: 'Giảm 100k đơn đầu tiên',
        code: 'NEWBIE100',
        description: 'Giảm 100,000đ cho khách hàng mới, đơn hàng đầu tiên',
        type: 'fixed_amount',
        value: 100000,
        minimumOrderValue: 500000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        usageCount: 156,
        userLimit: 1,
        isActive: true,
        isPublic: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
    {
        id: 5,
        name: 'Flash Sale cuối tuần',
        code: 'WEEKEND50',
        description: 'Giảm 50% tối đa 500k cho các sản phẩm sale cuối tuần',
        type: 'percentage',
        value: 50,
        minimumOrderValue: 200000,
        maximumDiscountAmount: 500000,
        startDate: '2024-12-07',
        endDate: '2024-12-08',
        usageLimit: 200,
        usageCount: 67,
        userLimit: 1,
        isActive: false,
        isPublic: true,
        createdAt: '2024-12-01',
        updatedAt: '2024-12-07'
    }
];

const Promotions: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [viewingPromotion, setViewingPromotion] = useState<Promotion | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // States cho filtering
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Inject CSS để fix table spacing
    useEffect(() => {
        const styleId = 'custom-promotions-table-fix';
        let existingStyle = document.getElementById(styleId);

        if (existingStyle) {
            existingStyle.remove();
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .custom-promotions-table .ant-table-thead > tr > th {
                vertical-align: middle !important;
                text-align: center !important;
                font-weight: 600 !important;
                padding: 8px 16px !important;
                border-bottom: 1px solid #f0f0f0 !important;
                background-color: #fafafa !important;
                height: 40px !important;
            }
            
            .custom-promotions-table .ant-table-tbody > tr > td {
                vertical-align: middle !important;
                padding: 8px 16px !important;
                height: 60px !important;
                border-bottom: 1px solid #f0f0f0 !important;
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

    // Filtered promotions
    const filteredPromotions = promotions.filter(promotion => {
        if (filterType !== 'all' && promotion.type !== filterType) return false;
        if (filterStatus === 'active' && !promotion.isActive) return false;
        if (filterStatus === 'inactive' && promotion.isActive) return false;
        if (filterStatus === 'expired') {
            const today = dayjs().format('YYYY-MM-DD');
            if (dayjs(promotion.endDate).isAfter(dayjs(today))) return false;
        }
        return true;
    });

    // Statistics
    const totalPromotions = promotions.length;
    const activePromotions = promotions.filter(p => p.isActive).length;
    const expiredPromotions = promotions.filter(p => dayjs(p.endDate).isBefore(dayjs())).length;
    const totalUsage = promotions.reduce((sum, p) => sum + p.usageCount, 0);

    // Get promotion type config
    const getTypeConfig = (type: string) => {
        const configs = {
            percentage: { color: 'blue', text: 'Giảm theo %', icon: <PercentageOutlined /> },
            fixed_amount: { color: 'green', text: 'Giảm cố định', icon: <DollarOutlined /> },
            buy_x_get_y: { color: 'purple', text: 'Mua X tặng Y', icon: <GiftOutlined /> },
            free_shipping: { color: 'orange', text: 'Miễn phí ship', icon: <ShoppingCartOutlined /> }
        };
        return configs[type as keyof typeof configs] || { color: 'default', text: type, icon: null };
    };

    // Check if promotion is expired
    const isExpired = (endDate: string) => {
        return dayjs(endDate).isBefore(dayjs());
    };

    // Get promotion value display
    const getValueDisplay = (promotion: Promotion) => {
        switch (promotion.type) {
            case 'percentage':
                return `${promotion.value}%`;
            case 'fixed_amount':
                return `${promotion.value.toLocaleString()}đ`;
            case 'buy_x_get_y':
                return `Mua ${promotion.buyQuantity} tặng ${promotion.getQuantity}`;
            case 'free_shipping':
                return 'Miễn phí vận chuyển';
            default:
                return promotion.value;
        }
    };

    // Table columns
    const columns = [
        {
            title: 'Tên khuyến mãi',
            key: 'promotion',
            width: 250,
            render: (record: Promotion) => (
                <div className="table-cell-container left">
                    <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            {record.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
                            Mã: <Text code>{record.code}</Text>
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                            {record.description}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            width: 130,
            align: 'center' as const,
            render: (type: string) => {
                const config = getTypeConfig(type);
                return (
                    <div className="table-cell-container">
                        <Tag color={config.color} icon={config.icon}>
                            {config.text}
                        </Tag>
                    </div>
                );
            },
        },
        {
            title: 'Giá trị',
            key: 'value',
            width: 120,
            align: 'center' as const,
            render: (record: Promotion) => (
                <div className="table-cell-container">
                    <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                        {getValueDisplay(record)}
                    </span>
                </div>
            ),
        },
        {
            title: 'Thời gian',
            key: 'period',
            width: 140,
            align: 'center' as const,
            render: (record: Promotion) => (
                <div className="table-cell-container">
                    <div>
                        <div style={{ fontSize: '12px' }}>
                            {dayjs(record.startDate).format('DD/MM/YYYY')}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>đến</div>
                        <div style={{
                            fontSize: '12px',
                            color: isExpired(record.endDate) ? '#ff4d4f' : '#666'
                        }}>
                            {dayjs(record.endDate).format('DD/MM/YYYY')}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Sử dụng',
            key: 'usage',
            width: 120,
            align: 'center' as const,
            render: (record: Promotion) => (
                <div className="table-cell-container">
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                            {record.usageCount.toLocaleString()}
                        </div>
                        {record.usageLimit && (
                            <div>
                                <Progress
                                    percent={Math.round((record.usageCount / record.usageLimit) * 100)}
                                    size="small"
                                    showInfo={false}
                                />
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    /{record.usageLimit.toLocaleString()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            align: 'center' as const,
            render: (record: Promotion) => {
                const expired = isExpired(record.endDate);
                const limitReached = record.usageLimit && record.usageCount >= record.usageLimit;

                let status, color;
                if (expired) {
                    status = 'Hết hạn';
                    color = 'red';
                } else if (limitReached) {
                    status = 'Hết lượt';
                    color = 'orange';
                } else if (record.isActive) {
                    status = 'Hoạt động';
                    color = 'green';
                } else {
                    status = 'Tạm dừng';
                    color = 'default';
                }

                return (
                    <div className="table-cell-container">
                        <Tag color={color}>{status}</Tag>
                        {!record.isPublic && (
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                Riêng tư
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            align: 'center' as const,
            render: (record: Promotion) => (
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
                            icon={<CopyOutlined />}
                            onClick={() => handleCopy(record)}
                            title="Sao chép"
                        />
                        <Popconfirm
                            title="Bạn có chắc muốn xóa khuyến mãi này?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                title="Xóa"
                            />
                        </Popconfirm>
                    </Space>
                </div>
            ),
        },
    ];

    const handleAdd = () => {
        setEditingPromotion(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (promotion: Promotion) => {
        setEditingPromotion(promotion);
        form.setFieldsValue({
            ...promotion,
            dateRange: [dayjs(promotion.startDate), dayjs(promotion.endDate)],
            applicableProducts: promotion.applicableProducts || [],
            applicableCategories: promotion.applicableCategories || []
        });
        setIsModalVisible(true);
    };

    const handleView = (promotion: Promotion) => {
        setViewingPromotion(promotion);
        setIsViewModalVisible(true);
    };

    const handleDelete = (id: number) => {
        setPromotions(promotions.filter(p => p.id !== id));
        message.success('Đã xóa khuyến mãi thành công!');
    };

    const handleCopy = (promotion: Promotion) => {
        const newPromotion: Promotion = {
            ...promotion,
            id: Math.max(...promotions.map(p => p.id)) + 1,
            name: `${promotion.name} (Copy)`,
            code: `${promotion.code}_COPY_${Date.now().toString().slice(-4)}`,
            usageCount: 0,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };
        setPromotions([...promotions, newPromotion]);
        message.success('Đã sao chép khuyến mãi!');
    };

    const handleSave = async (values: any) => {
        setLoading(true);
        try {
            const promotionData: Promotion = {
                id: editingPromotion?.id || Math.max(...promotions.map(p => p.id)) + 1,
                name: values.name,
                code: values.code.toUpperCase(),
                description: values.description || '',
                type: values.type,
                value: values.value || 0,
                minimumOrderValue: values.minimumOrderValue,
                maximumDiscountAmount: values.maximumDiscountAmount,
                buyQuantity: values.buyQuantity,
                getQuantity: values.getQuantity,
                applicableProducts: values.applicableProducts,
                applicableCategories: values.applicableCategories,
                startDate: values.dateRange[0].format('YYYY-MM-DD'),
                endDate: values.dateRange[1].format('YYYY-MM-DD'),
                usageLimit: values.usageLimit,
                usageCount: editingPromotion?.usageCount || 0,
                userLimit: values.userLimit,
                isActive: values.isActive ?? true,
                isPublic: values.isPublic ?? true,
                createdAt: editingPromotion?.createdAt || new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0]
            };

            if (editingPromotion) {
                setPromotions(promotions.map(p => p.id === editingPromotion.id ? promotionData : p));
                message.success('Đã cập nhật khuyến mãi thành công!');
            } else {
                setPromotions([...promotions, promotionData]);
                message.success('Đã thêm khuyến mãi thành công!');
            }

            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };



    // Export Excel
    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(promotions.map(promotion => ({
            'ID': promotion.id,
            'Tên khuyến mãi': promotion.name,
            'Mã khuyến mãi': promotion.code,
            'Mô tả': promotion.description,
            'Loại': getTypeConfig(promotion.type).text,
            'Giá trị': getValueDisplay(promotion),
            'Đơn tối thiểu': promotion.minimumOrderValue || '',
            'Giảm tối đa': promotion.maximumDiscountAmount || '',
            'Ngày bắt đầu': promotion.startDate,
            'Ngày kết thúc': promotion.endDate,
            'Giới hạn sử dụng': promotion.usageLimit || '',
            'Đã sử dụng': promotion.usageCount,
            'Giới hạn/user': promotion.userLimit || '',
            'Trạng thái': promotion.isActive ? 'Hoạt động' : 'Tạm dừng',
            'Công khai': promotion.isPublic ? 'Có' : 'Không',
            'Ngày tạo': promotion.createdAt
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Khuyến mãi');
        XLSX.writeFile(workbook, `khuyen-mai-${new Date().toISOString().split('T')[0]}.xlsx`);
        message.success('Đã xuất file Excel thành công!');
    };

    return (
        <div>
            <Title level={2} className="text-primary" style={{ marginBottom: '24px' }}>
                Quản lý Khuyến mãi
            </Title>

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng khuyến mãi"
                            value={totalPromotions}
                            prefix={<GiftOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đang hoạt động"
                            value={activePromotions}
                            prefix={<FireOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đã hết hạn"
                            value={expiredPromotions}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Lượt sử dụng"
                            value={totalUsage}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                            formatter={(value) => `${Number(value).toLocaleString()}`}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Action Bar */}
            <Card style={{ marginBottom: '16px' }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space wrap>
                            <Input.Search
                                placeholder="Tìm kiếm khuyến mãi..."
                                style={{ width: 300 }}
                                allowClear
                            />
                            <Select
                                placeholder="Loại khuyến mãi"
                                style={{ width: 150 }}
                                value={filterType === 'all' ? undefined : filterType}
                                onChange={(value) => setFilterType(value || 'all')}
                                allowClear
                            >
                                <Option value="percentage">Giảm theo %</Option>
                                <Option value="fixed_amount">Giảm cố định</Option>
                                <Option value="buy_x_get_y">Mua X tặng Y</Option>
                                <Option value="free_shipping">Miễn phí ship</Option>
                            </Select>
                            <Select
                                placeholder="Trạng thái"
                                style={{ width: 120 }}
                                value={filterStatus === 'all' ? undefined : filterStatus}
                                onChange={(value) => setFilterStatus(value || 'all')}
                                allowClear
                            >
                                <Option value="active">Hoạt động</Option>
                                <Option value="inactive">Tạm dừng</Option>
                                <Option value="expired">Hết hạn</Option>
                            </Select>
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                type="default"
                                icon={<DownloadOutlined />}
                                onClick={handleExportExcel}
                            >
                                Xuất Excel
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAdd}
                                className="btn-primary"
                            >
                                Thêm khuyến mãi
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Bulk Actions */}
            {selectedRowKeys.length > 0 && (
                <Card style={{ marginBottom: '16px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Text strong>Đã chọn {selectedRowKeys.length} khuyến mãi</Text>
                        </Col>
                        <Col>
                            <Space>
                                <Button onClick={() => setSelectedRowKeys([])}>
                                    Bỏ chọn
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            )}

            {/* Promotions Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredPromotions}
                    rowKey="id"
                    size="small"
                    className="custom-promotions-table"
                    rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                        columnWidth: 50,
                        fixed: true,
                    }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} khuyến mãi`,
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={editingPromotion ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
                open={isModalVisible}
                onOk={() => form.submit()}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={loading}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên khuyến mãi"
                                rules={[{ required: true, message: 'Vui lòng nhập tên khuyến mãi!' }]}
                            >
                                <Input placeholder="Nhập tên khuyến mãi" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="code"
                                label="Mã khuyến mãi"
                                rules={[{ required: true, message: 'Vui lòng nhập mã khuyến mãi!' }]}
                            >
                                <Input placeholder="Nhập mã khuyến mãi" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <TextArea rows={2} placeholder="Nhập mô tả khuyến mãi" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="type"
                                label="Loại khuyến mãi"
                                rules={[{ required: true, message: 'Vui lòng chọn loại khuyến mãi!' }]}
                            >
                                <Select placeholder="Chọn loại khuyến mãi">
                                    <Option value="percentage">Giảm theo phần trăm (%)</Option>
                                    <Option value="fixed_amount">Giảm số tiền cố định</Option>
                                    <Option value="buy_x_get_y">Mua X tặng Y</Option>
                                    <Option value="free_shipping">Miễn phí vận chuyển</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                noStyle
                                shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
                            >
                                {({ getFieldValue }) => {
                                    const type = getFieldValue('type');
                                    if (type === 'buy_x_get_y') {
                                        return (
                                            <Row gutter={8}>
                                                <Col span={12}>
                                                    <Form.Item
                                                        name="buyQuantity"
                                                        label="Mua (SL)"
                                                        rules={[{ required: true, message: 'Nhập số lượng mua!' }]}
                                                    >
                                                        <InputNumber min={1} placeholder="2" style={{ width: '100%' }} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item
                                                        name="getQuantity"
                                                        label="Tặng (SL)"
                                                        rules={[{ required: true, message: 'Nhập số lượng tặng!' }]}
                                                    >
                                                        <InputNumber min={1} placeholder="1" style={{ width: '100%' }} />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        );
                                    } else if (type !== 'free_shipping') {
                                        return (
                                            <Form.Item
                                                name="value"
                                                label={type === 'percentage' ? 'Giá trị (%)' : 'Giá trị (VNĐ)'}
                                                rules={[{ required: true, message: 'Vui lòng nhập giá trị!' }]}
                                            >
                                                <InputNumber
                                                    min={0}
                                                    max={type === 'percentage' ? 100 : undefined}
                                                    placeholder={type === 'percentage' ? '20' : '100000'}
                                                    style={{ width: '100%' }}
                                                    formatter={type === 'percentage' ? undefined : (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                />
                                            </Form.Item>
                                        );
                                    }
                                    return null;
                                }}
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="minimumOrderValue"
                                label="Giá trị đơn hàng tối thiểu"
                            >
                                <InputNumber
                                    min={0}
                                    placeholder="500000"
                                    style={{ width: '100%' }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="maximumDiscountAmount"
                                label="Giảm giá tối đa"
                            >
                                <InputNumber
                                    min={0}
                                    placeholder="200000"
                                    style={{ width: '100%' }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="dateRange"
                        label="Thời gian áp dụng"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian áp dụng!' }]}
                    >
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="usageLimit"
                                label="Giới hạn số lần sử dụng"
                            >
                                <InputNumber min={1} placeholder="1000" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="userLimit"
                                label="Giới hạn/khách hàng"
                            >
                                <InputNumber min={1} placeholder="1" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="isActive"
                                label="Trạng thái"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="isPublic"
                                label="Hiển thị công khai"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="Công khai" unCheckedChildren="Riêng tư" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* View Modal */}
            <Modal
                title="Chi tiết khuyến mãi"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={600}
            >
                {viewingPromotion && (
                    <div>
                        <Row gutter={16}>
                            <Col span={24}>
                                <div style={{ marginBottom: '16px' }}>
                                    <Text strong style={{ fontSize: '16px' }}>{viewingPromotion.name}</Text>
                                    <br />
                                    <Text code style={{ fontSize: '14px' }}>{viewingPromotion.code}</Text>
                                </div>
                            </Col>
                        </Row>

                        <Row gutter={16} style={{ marginBottom: '16px' }}>
                            <Col span={12}>
                                <Text strong>Loại khuyến mãi:</Text>
                                <br />
                                <Tag color={getTypeConfig(viewingPromotion.type).color} icon={getTypeConfig(viewingPromotion.type).icon}>
                                    {getTypeConfig(viewingPromotion.type).text}
                                </Tag>
                            </Col>
                            <Col span={12}>
                                <Text strong>Giá trị:</Text>
                                <br />
                                <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                                    {getValueDisplay(viewingPromotion)}
                                </Text>
                            </Col>
                        </Row>

                        <Row gutter={16} style={{ marginBottom: '16px' }}>
                            <Col span={12}>
                                <Text strong>Thời gian:</Text>
                                <br />
                                <Text>{dayjs(viewingPromotion.startDate).format('DD/MM/YYYY')} - {dayjs(viewingPromotion.endDate).format('DD/MM/YYYY')}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Trạng thái:</Text>
                                <br />
                                <Tag color={viewingPromotion.isActive ? 'green' : 'red'}>
                                    {viewingPromotion.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                </Tag>
                                {!viewingPromotion.isPublic && <Tag color="orange">Riêng tư</Tag>}
                            </Col>
                        </Row>

                        {viewingPromotion.minimumOrderValue && (
                            <Row gutter={16} style={{ marginBottom: '16px' }}>
                                <Col span={12}>
                                    <Text strong>Đơn hàng tối thiểu:</Text>
                                    <br />
                                    <Text>{viewingPromotion.minimumOrderValue.toLocaleString()}đ</Text>
                                </Col>
                                {viewingPromotion.maximumDiscountAmount && (
                                    <Col span={12}>
                                        <Text strong>Giảm tối đa:</Text>
                                        <br />
                                        <Text>{viewingPromotion.maximumDiscountAmount.toLocaleString()}đ</Text>
                                    </Col>
                                )}
                            </Row>
                        )}

                        <Row gutter={16} style={{ marginBottom: '16px' }}>
                            <Col span={12}>
                                <Text strong>Đã sử dụng:</Text>
                                <br />
                                <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                    {viewingPromotion.usageCount.toLocaleString()}
                                    {viewingPromotion.usageLimit && ` / ${viewingPromotion.usageLimit.toLocaleString()}`}
                                </Text>
                                {viewingPromotion.usageLimit && (
                                    <Progress
                                        percent={Math.round((viewingPromotion.usageCount / viewingPromotion.usageLimit) * 100)}
                                        size="small"
                                        style={{ marginTop: '4px' }}
                                    />
                                )}
                            </Col>
                            {viewingPromotion.userLimit && (
                                <Col span={12}>
                                    <Text strong>Giới hạn/khách:</Text>
                                    <br />
                                    <Text>{viewingPromotion.userLimit} lần</Text>
                                </Col>
                            )}
                        </Row>

                        {viewingPromotion.description && (
                            <div style={{ marginTop: '16px' }}>
                                <Text strong>Mô tả:</Text>
                                <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                                    {viewingPromotion.description}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Promotions;