import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, InputNumber, message, Card, Row, Col, Statistic, Typography, Popconfirm, Tabs, DatePicker, Switch, Descriptions, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PercentageOutlined, DollarOutlined, ReloadOutlined, CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, GiftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { percentagePromotionService, amountPromotionService, type PercentagePromotion, type AmountPromotion } from '../../../services/promotion';
import './style.css';
import '../../components/common-styles.css';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const PromotionsPage: React.FC = () => {
    const [percentagePromotions, setPercentagePromotions] = useState<PercentagePromotion[]>([]);
    const [loadingPercentage, setLoadingPercentage] = useState(false);
    const [amountPromotions, setAmountPromotions] = useState<AmountPromotion[]>([]);
    const [loadingAmount, setLoadingAmount] = useState(false);
    const [isPercentageModalVisible, setIsPercentageModalVisible] = useState(false);
    const [isAmountModalVisible, setIsAmountModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingPercentage, setEditingPercentage] = useState<PercentagePromotion | null>(null);
    const [editingAmount, setEditingAmount] = useState<AmountPromotion | null>(null);
    const [viewingPromotion, setViewingPromotion] = useState<any>(null);
    const [percentageForm] = Form.useForm();
    const [amountForm] = Form.useForm();
    const [activeTab, setActiveTab] = useState('percentage');

    useEffect(() => {
        loadPercentagePromotions();
        loadAmountPromotions();
    }, []);

    // Load functions
    const loadPercentagePromotions = async () => {
        setLoadingPercentage(true);
        try {
            const data = await percentagePromotionService.getAll();
            setPercentagePromotions(data);
        } catch (error: any) {
            message.error('Không thể tải danh sách khuyến mãi phần trăm: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoadingPercentage(false);
        }
    };

    const loadAmountPromotions = async () => {
        setLoadingAmount(true);
        try {
            const data = await amountPromotionService.getAll();
            setAmountPromotions(data);
        } catch (error: any) {
            message.error('Không thể tải danh sách khuyến mãi số tiền: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoadingAmount(false);
        }
    };

    // Percentage Promotion handlers
    const handleCreatePercentage = () => {
        setEditingPercentage(null);
        percentageForm.resetFields();
        setIsPercentageModalVisible(true);
    };

    const handleEditPercentage = (record: PercentagePromotion) => {
        setEditingPercentage(record);
        percentageForm.setFieldsValue({
            name: record.name,
            code: record.code,
            discountPercent: record.discountPercent,
            minOrderValue: record.minOrderValue,
            startAt: [dayjs(record.startAt), dayjs(record.endAt)],
            quantity: record.quantity,
            isActive: record.isActive,
        });
        setIsPercentageModalVisible(true);
    };

    const handleDeletePercentage = async (id: number) => {
        try {
            await percentagePromotionService.delete(id);
            message.success('Xóa khuyến mãi thành công');
            loadPercentagePromotions();
        } catch (error: any) {
            message.error('Không thể xóa khuyến mãi: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleSubmitPercentage = async () => {
        try {
            const values = await percentageForm.validateFields();
            const promotionData = {
                name: values.name,
                code: values.code,
                discountPercent: values.discountPercent,
                minOrderValue: values.minOrderValue,
                startAt: values.startAt[0].format('YYYY-MM-DD HH:mm:ss'),
                endAt: values.startAt[1].format('YYYY-MM-DD HH:mm:ss'),
                quantity: values.quantity,
                isActive: values.isActive ?? true,
            };

            if (editingPercentage?.id) {
                await percentagePromotionService.update(editingPercentage.id, promotionData);
                message.success('Cập nhật khuyến mãi thành công');
            } else {
                await percentagePromotionService.create(promotionData);
                message.success('Tạo khuyến mãi thành công');
            }

            setIsPercentageModalVisible(false);
            percentageForm.resetFields();
            loadPercentagePromotions();
        } catch (error: any) {
            if (error.errorFields) {
                message.error('Vui lòng điền đầy đủ thông tin');
            } else {
                message.error('Không thể lưu khuyến mãi: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    // Amount Promotion handlers
    const handleCreateAmount = () => {
        setEditingAmount(null);
        amountForm.resetFields();
        setIsAmountModalVisible(true);
    };

    const handleEditAmount = (record: AmountPromotion) => {
        setEditingAmount(record);
        amountForm.setFieldsValue({
            name: record.name,
            code: record.code,
            discountAmount: record.discountAmount,
            minOrderValue: record.minOrderValue,
            startAt: [dayjs(record.startAt), dayjs(record.endAt)],
            quantity: record.quantity,
            isActive: record.isActive,
        });
        setIsAmountModalVisible(true);
    };

    const handleDeleteAmount = async (id: number) => {
        try {
            await amountPromotionService.delete(id);
            message.success('Xóa khuyến mãi thành công');
            loadAmountPromotions();
        } catch (error: any) {
            message.error('Không thể xóa khuyến mãi: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleSubmitAmount = async () => {
        try {
            const values = await amountForm.validateFields();
            const promotionData = {
                name: values.name,
                code: values.code,
                discountAmount: values.discountAmount,
                minOrderValue: values.minOrderValue,
                startAt: values.startAt[0].format('YYYY-MM-DD HH:mm:ss'),
                endAt: values.startAt[1].format('YYYY-MM-DD HH:mm:ss'),
                quantity: values.quantity,
                isActive: values.isActive ?? true,
            };

            if (editingAmount?.id) {
                await amountPromotionService.update(editingAmount.id, promotionData);
                message.success('Cập nhật khuyến mãi thành công');
            } else {
                await amountPromotionService.create(promotionData);
                message.success('Tạo khuyến mãi thành công');
            }

            setIsAmountModalVisible(false);
            amountForm.resetFields();
            loadAmountPromotions();
        } catch (error: any) {
            if (error.errorFields) {
                message.error('Vui lòng điền đầy đủ thông tin');
            } else {
                message.error('Không thể lưu khuyến mãi: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    // View promotion
    const handleViewPromotion = (promotion: PercentagePromotion | AmountPromotion) => {
        setViewingPromotion(promotion);
        setIsViewModalVisible(true);
    };

    // Statistics
    const percentageStats = {
        total: percentagePromotions.length,
        active: percentagePromotions.filter(p => p.isActive).length,
        expired: percentagePromotions.filter(p => dayjs(p.endAt).isBefore(dayjs())).length,
    };

    const amountStats = {
        total: amountPromotions.length,
        active: amountPromotions.filter(p => p.isActive).length,
        expired: amountPromotions.filter(p => dayjs(p.endAt).isBefore(dayjs())).length,
    };

    // Table columns for Percentage Promotions
    const percentageColumns: ColumnsType<PercentagePromotion> = [
        {
            title: 'STT',
            key: 'stt',
            width: 60,
            align: 'center',
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Mã khuyến mãi',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Giảm giá',
            key: 'discount',
            render: (_, record) => (
                <span className="promotion-value">
                    <PercentageOutlined /> {record.discountPercent}%
                </span>
            ),
        },
        {
            title: 'Giá trị đơn tối thiểu',
            dataIndex: 'minOrderValue',
            key: 'minOrderValue',
            render: (value: number) => `${value.toLocaleString('vi-VN')} đ`,
        },
        {
            title: 'Thời gian',
            key: 'period',
            render: (_, record) => (
                <div className="promotion-period">
                    <div>{dayjs(record.startAt).format('DD/MM/YYYY HH:mm')}</div>
                    <div>→ {dayjs(record.endAt).format('DD/MM/YYYY HH:mm')}</div>
                </div>
            ),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => {
                const now = dayjs();
                const start = dayjs(record.startAt);
                const end = dayjs(record.endAt);
                const isActive = record.isActive;
                const isExpired = end.isBefore(now);
                const notStarted = start.isAfter(now);

                if (!isActive) {
                    return <Badge status="default" text="Tạm dừng" />;
                }
                if (isExpired) {
                    return <Badge status="error" text="Đã hết hạn" />;
                }
                if (notStarted) {
                    return <Badge status="processing" text="Chưa bắt đầu" />;
                }
                return <Badge status="success" text="Đang hoạt động" />;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewPromotion(record)}
                    >
                        Xem
                    </Button>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditPercentage(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc chắn muốn xóa khuyến mãi này?"
                        onConfirm={() => record.id && handleDeletePercentage(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Table columns for Amount Promotions
    const amountColumns: ColumnsType<AmountPromotion> = [
        {
            title: 'STT',
            key: 'stt',
            width: 60,
            align: 'center',
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Mã khuyến mãi',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <Tag color="green">{text}</Tag>,
        },
        {
            title: 'Giảm giá',
            key: 'discount',
            render: (_, record) => (
                <span className="promotion-value">
                    <DollarOutlined /> {record.discountAmount.toLocaleString('vi-VN')} đ
                </span>
            ),
        },
        {
            title: 'Giá trị đơn tối thiểu',
            dataIndex: 'minOrderValue',
            key: 'minOrderValue',
            render: (value: number) => `${value.toLocaleString('vi-VN')} đ`,
        },
        {
            title: 'Thời gian',
            key: 'period',
            render: (_, record) => (
                <div className="promotion-period">
                    <div>{dayjs(record.startAt).format('DD/MM/YYYY HH:mm')}</div>
                    <div>→ {dayjs(record.endAt).format('DD/MM/YYYY HH:mm')}</div>
                </div>
            ),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => {
                const now = dayjs();
                const start = dayjs(record.startAt);
                const end = dayjs(record.endAt);
                const isActive = record.isActive;
                const isExpired = end.isBefore(now);
                const notStarted = start.isAfter(now);

                if (!isActive) {
                    return <Badge status="default" text="Tạm dừng" />;
                }
                if (isExpired) {
                    return <Badge status="error" text="Đã hết hạn" />;
                }
                if (notStarted) {
                    return <Badge status="processing" text="Chưa bắt đầu" />;
                }
                return <Badge status="success" text="Đang hoạt động" />;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewPromotion(record)}
                    >
                        Xem
                    </Button>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditAmount(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc chắn muốn xóa khuyến mãi này?"
                        onConfirm={() => record.id && handleDeleteAmount(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="promotions-page" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
            <Title level={2} className="text-primary" style={{ marginBottom: '16px', marginTop: 0 }}>
                <GiftOutlined /> Quản lý khuyến mãi
            </Title>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: 'percentage',
                        label: (
                            <span>
                                <PercentageOutlined /> Khuyến mãi phần trăm
                            </span>
                        ),
                        children: (
                            <>
                                {/* Statistics Cards */}
                                <Row gutter={16} style={{ marginBottom: '24px' }}>
                                    <Col xs={24} sm={8}>
                                        <Card>
                                            <Statistic
                                                title="Tổng số khuyến mãi"
                                                value={percentageStats.total}
                                                prefix={<GiftOutlined />}
                                                valueStyle={{ color: '#1890ff' }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Card>
                                            <Statistic
                                                title="Đang hoạt động"
                                                value={percentageStats.active}
                                                prefix={<CheckCircleOutlined />}
                                                valueStyle={{ color: '#52c41a' }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Card>
                                            <Statistic
                                                title="Đã hết hạn"
                                                value={percentageStats.expired}
                                                prefix={<CloseCircleOutlined />}
                                                valueStyle={{ color: '#ff4d4f' }}
                                            />
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Actions */}
                                <div style={{ marginBottom: '16px' }}>
                                    <Space>
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={handleCreatePercentage}
                                        >
                                            Thêm khuyến mãi
                                        </Button>
                                        <Button
                                            icon={<ReloadOutlined />}
                                            onClick={loadPercentagePromotions}
                                            loading={loadingPercentage}
                                        >
                                            Làm mới
                                        </Button>
                                    </Space>
                                </div>

                                {/* Table */}
                                <Table
                                    columns={percentageColumns}
                                    dataSource={percentagePromotions}
                                    loading={loadingPercentage}
                                    rowKey="id"
                                    pagination={{
                                        pageSize: 10,
                                        showSizeChanger: true,
                                        showTotal: (total) => `Tổng ${total} khuyến mãi`,
                                    }}
                                />
                            </>
                        ),
                    },
                    {
                        key: 'amount',
                        label: (
                            <span>
                                <DollarOutlined /> Khuyến mãi số tiền
                            </span>
                        ),
                        children: (
                            <>
                                {/* Statistics Cards */}
                                <Row gutter={16} style={{ marginBottom: '24px' }}>
                                    <Col xs={24} sm={8}>
                                        <Card>
                                            <Statistic
                                                title="Tổng số khuyến mãi"
                                                value={amountStats.total}
                                                prefix={<GiftOutlined />}
                                                valueStyle={{ color: '#1890ff' }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Card>
                                            <Statistic
                                                title="Đang hoạt động"
                                                value={amountStats.active}
                                                prefix={<CheckCircleOutlined />}
                                                valueStyle={{ color: '#52c41a' }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Card>
                                            <Statistic
                                                title="Đã hết hạn"
                                                value={amountStats.expired}
                                                prefix={<CloseCircleOutlined />}
                                                valueStyle={{ color: '#ff4d4f' }}
                                            />
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Actions */}
                                <div style={{ marginBottom: '16px' }}>
                                    <Space>
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={handleCreateAmount}
                                        >
                                            Thêm khuyến mãi
                                        </Button>
                                        <Button
                                            icon={<ReloadOutlined />}
                                            onClick={loadAmountPromotions}
                                            loading={loadingAmount}
                                        >
                                            Làm mới
                                        </Button>
                                    </Space>
                                </div>

                                {/* Table */}
                                <Table
                                    columns={amountColumns}
                                    dataSource={amountPromotions}
                                    loading={loadingAmount}
                                    rowKey="id"
                                    pagination={{
                                        pageSize: 10,
                                        showSizeChanger: true,
                                        showTotal: (total) => `Tổng ${total} khuyến mãi`,
                                    }}
                                />
                            </>
                        ),
                    },
                ]}
            />

            {/* Percentage Promotion Modal */}
            <Modal
                title={editingPercentage ? 'Sửa khuyến mãi phần trăm' : 'Thêm khuyến mãi phần trăm'}
                open={isPercentageModalVisible}
                onOk={handleSubmitPercentage}
                onCancel={() => {
                    setIsPercentageModalVisible(false);
                    percentageForm.resetFields();
                }}
                width={600}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form
                    form={percentageForm}
                    layout="vertical"
                    initialValues={{ isActive: true }}
                >
                    <Form.Item
                        name="name"
                        label="Tên khuyến mãi"
                        rules={[{ required: true, message: 'Vui lòng nhập tên khuyến mãi' }]}
                    >
                        <Input placeholder="Nhập tên khuyến mãi" />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="Mã khuyến mãi"
                        rules={[{ required: true, message: 'Vui lòng nhập mã khuyến mãi' }]}
                    >
                        <Input placeholder="Nhập mã khuyến mãi (VD: WELCOME10)" />
                    </Form.Item>

                    <Form.Item
                        name="discountPercent"
                        label="Phần trăm giảm giá (%)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập phần trăm giảm giá' },
                            { type: 'number', min: 1, max: 100, message: 'Phần trăm phải từ 1 đến 100' },
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Nhập phần trăm giảm giá"
                            min={1}
                            max={100}
                            addonAfter="%"
                        />
                    </Form.Item>

                    <Form.Item
                        name="minOrderValue"
                        label="Giá trị đơn tối thiểu (đ)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập giá trị đơn tối thiểu' },
                            { type: 'number', min: 0, message: 'Giá trị phải lớn hơn 0' },
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Nhập giá trị đơn tối thiểu"
                            min={0}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                        />
                    </Form.Item>

                    <Form.Item
                        name="startAt"
                        label="Thời gian áp dụng"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian áp dụng' }]}
                    >
                        <RangePicker
                            showTime
                            format="DD/MM/YYYY HH:mm"
                            style={{ width: '100%' }}
                            placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                        />
                    </Form.Item>

                    <Form.Item
                        name="quantity"
                        label="Số lượng"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số lượng' },
                            { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' },
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Nhập số lượng"
                            min={1}
                        />
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label="Trạng thái"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Amount Promotion Modal */}
            <Modal
                title={editingAmount ? 'Sửa khuyến mãi số tiền' : 'Thêm khuyến mãi số tiền'}
                open={isAmountModalVisible}
                onOk={handleSubmitAmount}
                onCancel={() => {
                    setIsAmountModalVisible(false);
                    amountForm.resetFields();
                }}
                width={600}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form
                    form={amountForm}
                    layout="vertical"
                    initialValues={{ isActive: true }}
                >
                    <Form.Item
                        name="name"
                        label="Tên khuyến mãi"
                        rules={[{ required: true, message: 'Vui lòng nhập tên khuyến mãi' }]}
                    >
                        <Input placeholder="Nhập tên khuyến mãi" />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="Mã khuyến mãi"
                        rules={[{ required: true, message: 'Vui lòng nhập mã khuyến mãi' }]}
                    >
                        <Input placeholder="Nhập mã khuyến mãi (VD: NEWYEAR100)" />
                    </Form.Item>

                    <Form.Item
                        name="discountAmount"
                        label="Số tiền giảm (đ)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số tiền giảm' },
                            { type: 'number', min: 1, message: 'Số tiền phải lớn hơn 0' },
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Nhập số tiền giảm"
                            min={1}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                        />
                    </Form.Item>

                    <Form.Item
                        name="minOrderValue"
                        label="Giá trị đơn tối thiểu (đ)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập giá trị đơn tối thiểu' },
                            { type: 'number', min: 0, message: 'Giá trị phải lớn hơn 0' },
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Nhập giá trị đơn tối thiểu"
                            min={0}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                        />
                    </Form.Item>

                    <Form.Item
                        name="startAt"
                        label="Thời gian áp dụng"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian áp dụng' }]}
                    >
                        <RangePicker
                            showTime
                            format="DD/MM/YYYY HH:mm"
                            style={{ width: '100%' }}
                            placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                        />
                    </Form.Item>

                    <Form.Item
                        name="quantity"
                        label="Số lượng"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số lượng' },
                            { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' },
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Nhập số lượng"
                            min={1}
                        />
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label="Trạng thái"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Promotion Modal */}
            <Modal
                title="Chi tiết khuyến mãi"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        Đóng
                    </Button>,
                ]}
                width={600}
            >
                {viewingPromotion && (
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Mã khuyến mãi">
                            <Tag color={viewingPromotion.discountPercent ? 'blue' : 'green'}>
                                {viewingPromotion.code}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Loại khuyến mãi">
                            {viewingPromotion.discountPercent ? (
                                <span>
                                    <PercentageOutlined /> Phần trăm: {viewingPromotion.discountPercent}%
                                </span>
                            ) : (
                                <span>
                                    <DollarOutlined /> Số tiền: {viewingPromotion.discountAmount?.toLocaleString('vi-VN')} đ
                                </span>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giá trị đơn tối thiểu">
                            {viewingPromotion.minOrderValue.toLocaleString('vi-VN')} đ
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày bắt đầu">
                            <CalendarOutlined /> {dayjs(viewingPromotion.startAt).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày kết thúc">
                            <CalendarOutlined /> {dayjs(viewingPromotion.endAt).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số lượng">
                            {viewingPromotion.quantity}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            {viewingPromotion.isActive ? (
                                <Badge status="success" text="Hoạt động" />
                            ) : (
                                <Badge status="default" text="Tạm dừng" />
                            )}
                        </Descriptions.Item>
                        {viewingPromotion.createAt && (
                            <Descriptions.Item label="Ngày tạo">
                                {dayjs(viewingPromotion.createAt).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default PromotionsPage;
