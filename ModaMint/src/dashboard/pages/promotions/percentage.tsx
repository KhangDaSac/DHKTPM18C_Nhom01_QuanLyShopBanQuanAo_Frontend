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

const PercentagePromotions: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [viewingPromotion, setViewingPromotion] = useState<Promotion | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Filter: chỉ hiển thị loại percentage
    const filteredPromotions = promotions.filter(p => p.type === 'percentage');

    // Statistics
    const totalPromotions = filteredPromotions.length;
    const activePromotions = filteredPromotions.filter(p => p.isActive).length;
    const expiredPromotions = filteredPromotions.filter(p => dayjs(p.endDate).isBefore(dayjs())).length;
    const totalUsage = filteredPromotions.reduce((sum, p) => sum + p.usageCount, 0);

    const isExpired = (endDate: string) => {
        return dayjs(endDate).isBefore(dayjs());
    };

    const getValueDisplay = (promotion: Promotion) => {
        return `${promotion.value}%`;
    };

    // Load data từ API hoặc mock data
    const loadPromotions = () => {
        setLoading(true);
        // TODO: Load from API
        // Mock data for percentage promotions
        const mockData: Promotion[] = [
            {
                id: 1,
                name: 'Giảm 20% cho đơn hàng',
                code: 'SALE20',
                description: 'Giảm 20% cho mọi đơn hàng',
                type: 'percentage',
                value: 20,
                minimumOrderValue: 100000,
                maximumDiscountAmount: 500000,
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                usageLimit: 1000,
                usageCount: 456,
                userLimit: 1,
                isActive: true,
                isPublic: true,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
            },
        ];
        setPromotions(mockData);
        setLoading(false);
    };

    useEffect(() => {
        loadPromotions();
    }, []);

    const handleAdd = () => {
        setEditingPromotion(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record: Promotion) => {
        setEditingPromotion(record);
        form.setFieldsValue({
            ...record,
            dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
        });
        setIsModalVisible(true);
    };

    const handleView = (record: Promotion) => {
        setViewingPromotion(record);
        setIsViewModalVisible(true);
    };

    const handleDelete = (id: number) => {
        setPromotions(promotions.filter(p => p.id !== id));
        message.success('Đã xóa khuyến mãi thành công');
    };

    const handleSubmit = async (values: any) => {
        const newPromotion: Promotion = {
            ...values,
            startDate: values.dateRange[0].format('YYYY-MM-DD'),
            endDate: values.dateRange[1].format('YYYY-MM-DD'),
            type: 'percentage',
            id: editingPromotion?.id || Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        if (editingPromotion) {
            setPromotions(promotions.map(p => p.id === editingPromotion.id ? newPromotion : p));
            message.success('Cập nhật khuyến mãi thành công');
        } else {
            setPromotions([...promotions, newPromotion]);
            message.success('Tạo khuyến mãi thành công');
        }

        setIsModalVisible(false);
        form.resetFields();
    };

    const tableColumns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            align: 'center' as const,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Tên Khuyến Mãi',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            align: 'left' as const,
        },
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
            width: 120,
            align: 'center' as const,
            render: (code: string) => <Tag color="blue">{code}</Tag>,
        },
        {
            title: 'Giảm Giá',
            key: 'value',
            width: 120,
            align: 'center' as const,
            render: (record: Promotion) => (
                <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                    {getValueDisplay(record)}
                </Text>
            ),
        },
        {
            title: 'Đơn Tối Thiểu',
            key: 'minimumOrderValue',
            width: 150,
            align: 'center' as const,
            render: (record: Promotion) => record.minimumOrderValue 
                ? `${record.minimumOrderValue.toLocaleString()}đ` 
                : 'Không có',
        },
        {
            title: 'Giảm Tối Đa',
            key: 'maximumDiscountAmount',
            width: 150,
            align: 'center' as const,
            render: (record: Promotion) => record.maximumDiscountAmount 
                ? `${record.maximumDiscountAmount.toLocaleString()}đ` 
                : 'Không giới hạn',
        },
        {
            title: 'Thời Gian',
            key: 'period',
            width: 250,
            align: 'center' as const,
            render: (record: Promotion) => (
                <Space direction="vertical" size={0}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        <CalendarOutlined /> {dayjs(record.startDate).format('DD/MM/YYYY')}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        → {dayjs(record.endDate).format('DD/MM/YYYY')}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Sử Dụng',
            key: 'usage',
            width: 150,
            align: 'center' as const,
            render: (record: Promotion) => (
                <Space direction="vertical" size={0} style={{ width: '100%' }}>
                    <Text strong>{record.usageCount}/{record.usageLimit || '∞'}</Text>
                    <Progress 
                        percent={record.usageLimit 
                            ? Math.round((record.usageCount / record.usageLimit) * 100) 
                            : 0} 
                        size="small" 
                    />
                </Space>
            ),
        },
        {
            title: 'Trạng Thái',
            key: 'status',
            width: 150,
            align: 'center' as const,
            render: (record: Promotion) => (
                <Space direction="vertical" size={4}>
                    <Tag color={isExpired(record.endDate) ? 'default' : record.isActive ? 'success' : 'error'}>
                        {isExpired(record.endDate) ? 'Hết hạn' : record.isActive ? 'Hoạt động' : 'Tắt'}
                    </Tag>
                    <Tag color={record.isPublic ? 'blue' : 'orange'}>
                        {record.isPublic ? 'Công khai' : 'Mã khuyến mãi'}
                    </Tag>
                </Space>
            ),
        },
        {
            title: 'Thao Tác',
            key: 'action',
            width: 150,
            align: 'center' as const,
            fixed: 'right' as const,
            render: (record: Promotion) => (
                <Space>
                    <Button 
                        icon={<EyeOutlined />} 
                        size="small" 
                        onClick={() => handleView(record)}
                    />
                    <Button 
                        icon={<EditOutlined />} 
                        size="small" 
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Xóa khuyến mãi"
                        description="Bạn có chắc muốn xóa khuyến mãi này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="promotions-page" style={{ padding: '72px', background: '#f0f2f5', minHeight: '100vh' }}>
            {/* Header */}
            <Card style={{ marginBottom: '20px', marginTop: '0px' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                }}>
                    <Space>
                        <PercentageOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                        <Title level={2} style={{ margin: 0 }}>Khuyến Mãi Theo %</Title>
                    </Space>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm Khuyến Mãi
                    </Button>
                </div>
            </Card>

            {/* Statistics */}
            <div style={{ marginBottom: '20px' }}>
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Tổng Khuyến Mãi"
                                value={totalPromotions}
                                prefix={<GiftOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Đang Hoạt Động"
                                value={activePromotions}
                                prefix={<FireOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Hết Hạn"
                                value={expiredPromotions}
                                prefix={<CalendarOutlined />}
                                valueStyle={{ color: '#ff4d4f' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Tổng Sử Dụng"
                                value={totalUsage}
                                prefix={<ShoppingCartOutlined />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Table */}
            <Card>
                <Table
                    columns={tableColumns}
                    dataSource={filteredPromotions}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1200 }}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={editingPromotion ? 'Sửa Khuyến Mãi' : 'Thêm Khuyến Mãi Theo %'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="name" label="Tên Khuyến Mãi" rules={[{ required: true }]}>
                        <Input placeholder="Nhập tên khuyến mãi" />
                    </Form.Item>
                    <Form.Item name="code" label="Mã Khuyến Mãi" rules={[{ required: true }]}>
                        <Input placeholder="Nhập mã khuyến mãi" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô Tả">
                        <TextArea rows={3} placeholder="Nhập mô tả" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="value" label="Giảm Giá (%)" rules={[{ required: true }]}>
                                <InputNumber min={1} max={100} style={{ width: '100%' }} placeholder="%" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="maximumDiscountAmount" label="Giảm Tối Đa (đ)">
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="minimumOrderValue" label="Đơn Tối Thiểu (đ)">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="dateRange" label="Thời Gian" rules={[{ required: true }]}>
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="usageLimit" label="Giới Hạn Sử Dụng">
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="∞" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="userLimit" label="Giới Hạn User">
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="1" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="isActive" label="Hoạt Động" valuePropName="checked" initialValue={true}>
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="isPublic" label="Công Khai" valuePropName="checked" initialValue={true}>
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingPromotion ? 'Cập Nhật' : 'Tạo Mới'}
                            </Button>
                            <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Modal */}
            <Modal
                title="Chi Tiết Khuyến Mãi"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={null}
                width={700}
            >
                {viewingPromotion && (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div>
                            <Text strong>Tên:</Text> {viewingPromotion.name}
                        </div>
                        <div>
                            <Text strong>Mã:</Text> <Tag>{viewingPromotion.code}</Tag>
                        </div>
                        <div>
                            <Text strong>Giảm Giá:</Text> <Text strong style={{ color: '#1890ff' }}>{getValueDisplay(viewingPromotion)}</Text>
                        </div>
                        <div>
                            <Text strong>Mô Tả:</Text> {viewingPromotion.description}
                        </div>
                        <div>
                            <Text strong>Thời Gian:</Text> {dayjs(viewingPromotion.startDate).format('DD/MM/YYYY')} - {dayjs(viewingPromotion.endDate).format('DD/MM/YYYY')}
                        </div>
                    </Space>
                )}
            </Modal>
        </div>
    );
};

export default PercentagePromotions;

