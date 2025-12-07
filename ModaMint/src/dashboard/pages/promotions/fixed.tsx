import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, InputNumber, message, Card, Row, Col, Statistic, Typography, Popconfirm, DatePicker, Select, Descriptions, Badge, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, DollarOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, GiftOutlined, CalendarOutlined, DownloadOutlined, ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { amountPromotionService, type AmountPromotion } from '../../../services/promotion';
import * as XLSX from 'xlsx';
import './style.css';
import '../../components/common-styles.css';
import LoadingSpinner from '../../components/LoadingSpinner';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const FixedPromotions: React.FC = () => {
    const [amountPromotions, setAmountPromotions] = useState<AmountPromotion[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<AmountPromotion | null>(null);
    const [viewingPromotion, setViewingPromotion] = useState<AmountPromotion | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'not-started' | 'expired'>('all');
    const [form] = Form.useForm();

    useEffect(() => {
        loadPromotions();
    }, [filterStatus]);

    const loadPromotions = async () => {
        setLoading(true);
        try {
            let data: AmountPromotion[];
            if (filterStatus === 'active') {
                data = await amountPromotionService.getActive();
            } else if (filterStatus === 'not-started') {
                data = await amountPromotionService.getNotStarted();
            } else if (filterStatus === 'expired') {
                data = await amountPromotionService.getExpired();
            } else {
                data = await amountPromotionService.getAll();
            }
            setAmountPromotions(data);
        } catch (error: any) {
            message.error('Không thể tải danh sách khuyến mãi: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPromotion(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record: AmountPromotion) => {
        setEditingPromotion(record);
        form.setFieldsValue({
            name: record.name,
            code: record.code,
            discountAmount: record.discountAmount,
            minOrderValue: record.minOrderValue,
            startAt: [dayjs(record.startAt), dayjs(record.endAt)],
            quantity: record.quantity,
            isActive: record.isActive,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await amountPromotionService.delete(id);
            message.success('Xóa khuyến mãi thành công');
            loadPromotions();
        } catch (error: any) {
            message.error('Không thể xóa khuyến mãi: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleExportExcel = () => {
        const data = amountPromotions.map((item, index) => ({
            STT: index + 1,
            ID: item.id,
            'Mã khuyến mãi': item.code,
            'Tên': item.name,
            'Số tiền giảm': item.discountAmount,
            'Giá trị đơn tối thiểu': item.minOrderValue,
            'Ngày bắt đầu': dayjs(item.startAt).format('DD/MM/YYYY HH:mm'),
            'Ngày kết thúc': dayjs(item.endAt).format('DD/MM/YYYY HH:mm'),
            'Số lượng': item.quantity,
            'Trạng thái': item.isActive ? 'Hoạt động' : 'Tạm dừng',
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Khuyến mãi');

        // Auto-width columns
        const maxWidth = 20;
        const colWidths = Object.keys(data[0] || {}).map(key => ({
            wch: Math.min(Math.max(key.length, (data[0] as any)[key]?.toString().length || 0), maxWidth)
        }));
        ws['!cols'] = colWidths;

        XLSX.writeFile(wb, `KhuyenMai_GiaCoDinh_${new Date().toISOString().split('T')[0]}.xlsx`);
        message.success('Xuất Excel thành công!');
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
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

            if (editingPromotion?.id) {
                await amountPromotionService.update(editingPromotion.id, promotionData);
                message.success('Cập nhật khuyến mãi thành công');
            } else {
                await amountPromotionService.create(promotionData);
                message.success('Tạo khuyến mãi thành công');
            }

            setIsModalVisible(false);
            form.resetFields();
            loadPromotions();
        } catch (error: any) {
            if (error.errorFields) {
                message.error('Vui lòng điền đầy đủ thông tin');
            } else {
                message.error('Không thể lưu khuyến mãi: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleView = (record: AmountPromotion) => {
        setViewingPromotion(record);
        setIsViewModalVisible(true);
    };

    // Statistics
    const stats = {
        total: amountPromotions.length,
        active: amountPromotions.filter(p => p.isActive).length,
        expired: amountPromotions.filter(p => dayjs(p.endAt).isBefore(dayjs())).length,
    };

    // Table columns
    const columns: ColumnsType<AmountPromotion> = [
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
            render: (_, record) => {
                const now = dayjs();
                const end = dayjs(record.endAt);
                const isExpired = end.isBefore(now);
                const daysUntilExpiration = end.diff(now, 'day');
                const isExpiringSoon = daysUntilExpiration >= 0 && daysUntilExpiration <= 7;

                return (
                    <div className="promotion-period">
                        <div>{dayjs(record.startAt).format('DD/MM/YYYY HH:mm')}</div>
                        <div style={{ color: isExpired ? '#ff4d4f' : isExpiringSoon ? '#faad14' : '#1890ff' }}>
                            → {dayjs(record.endAt).format('DD/MM/YYYY HH:mm')}
                        </div>
                        {isExpired && (
                            <Tag color="error" style={{ marginTop: 4 }}>
                                <CloseCircleOutlined /> Đã hết hạn
                            </Tag>
                        )}
                        {!isExpired && isExpiringSoon && (
                            <Tag color="warning" style={{ marginTop: 4 }}>
                                <ClockCircleOutlined /> Còn {daysUntilExpiration} ngày
                            </Tag>
                        )}
                    </div>
                );
            },
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
                const daysUntilExpiration = end.diff(now, 'day');
                const isExpiringSoon = daysUntilExpiration >= 0 && daysUntilExpiration <= 7;

                if (!isActive) {
                    return <Badge status="default" text="Tạm dừng" />;
                }
                if (isExpired) {
                    return <Badge status="error" text="Đã hết hạn" />;
                }
                if (notStarted) {
                    return <Badge status="processing" text="Chưa bắt đầu" />;
                }
                if (isExpiringSoon) {
                    return <Badge status="warning" text="Sắp hết hạn" />;
                }
                return <Badge status="success" text="Đang hoạt động" />;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            align: 'center' as const,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                        title="Xem chi tiết"
                        size="small"
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        title="Chỉnh sửa"
                        size="small"
                    />
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc chắn muốn xóa khuyến mãi này?"
                        onConfirm={() => record.id && handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} title="Xóa" size="small" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ margin: 0, padding: 0 }}>
            <style>{`
                .ant-table-measure-row {
                    display: none !important;
                    height: 0 !important;
                    visibility: hidden !important;
                }
                .ant-table-tbody > tr > td {
                    height: 70px !important;
                    vertical-align: middle !important;
                    padding: 8px 16px !important;
                }
                .ant-table-tbody > tr {
                    height: 70px !important;
                }
                .ant-table-tbody > tr:first-child > td {
                    padding-top: 8px !important;
                }
                .ant-table-thead > tr > th {
                    padding: 8px 16px !important;
                }
                .ant-table {
                    margin-top: 0 !important;
                }
                .ant-card-body {
                    padding: 16px !important;
                }
            `}</style>

            <Title level={2} className="text-primary" style={{ marginBottom: '16px', marginTop: 0 }}>
                <DollarOutlined /> Quản lý khuyến mãi giá cố định
            </Title>

            {/* Loading State */}
            {loading && (
                <LoadingSpinner size="large" tip="Đang tải dữ liệu khuyến mãi..." />
            )}

            {/* Content */}
            {!loading && (
                <>
                    {/* Statistics Cards */}
                    <Row gutter={16} style={{ marginBottom: '16px', marginTop: 0 }}>
                        <Col xs={24} sm={12} lg={8}>
                            <Card>
                                <Statistic
                                    title="Tổng số khuyến mãi"
                                    value={stats.total}
                                    prefix={<GiftOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                            <Card>
                                <Statistic
                                    title="Đang hoạt động"
                                    value={stats.active}
                                    prefix={<CheckCircleOutlined />}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                            <Card>
                                <Statistic
                                    title="Đã hết hạn"
                                    value={stats.expired}
                                    prefix={<CloseCircleOutlined />}
                                    valueStyle={{ color: '#ff4d4f' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Action Bar */}
                    <Card style={{ marginBottom: '16px', marginTop: 0 }}>
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Space>
                                    <Select
                                        value={filterStatus}
                                        onChange={(value) => setFilterStatus(value)}
                                        style={{ width: 180 }}
                                    >
                                        <Option value="all">Tất cả</Option>
                                        <Option value="active">Đang hoạt động</Option>
                                        <Option value="not-started">Chưa bắt đầu</Option>
                                        <Option value="expired">Đã hết hạn</Option>
                                    </Select>
                                </Space>
                            </Col>
                            <Col>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleCreate}
                                    >
                                        Thêm khuyến mãi
                                    </Button>
                                    <Button
                                        type="default"
                                        icon={<ReloadOutlined />}
                                        onClick={loadPromotions}
                                        loading={loading}
                                    >
                                        Làm mới khuyến mãi
                                    </Button>
                                    <Button
                                        type="default"
                                        icon={<DownloadOutlined />}
                                        onClick={handleExportExcel}
                                    >
                                        Xuất Excel
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </Card>

                    {/* Table */}
                    <Card>
                        <Table
                            columns={columns}
                            dataSource={amountPromotions}
                            loading={loading}
                            rowKey="id"
                            locale={{
                                emptyText: (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={
                                            <span style={{ color: '#999' }}>
                                                Chưa có khuyến mãi nào. Nhấn <strong>"Thêm khuyến mãi"</strong> để tạo mới.
                                            </span>
                                        }
                                    />
                                )
                            }}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} của ${total} khuyến mãi`,
                                pageSizeOptions: ['5', '10', '20', '50'],
                            }}
                        />
                    </Card>

                    {/* Add/Edit Modal */}
                    <Modal
                        title={editingPromotion ? 'Sửa khuyến mãi giá cố định' : 'Thêm khuyến mãi giá cố định'}
                        open={isModalVisible}
                        onOk={handleSubmit}
                        onCancel={() => {
                            setIsModalVisible(false);
                            form.resetFields();
                        }}
                        width={600}
                        footer={[
                            <Button key="cancel" onClick={() => {
                                setIsModalVisible(false);
                                form.resetFields();
                            }}>
                                Hủy
                            </Button>,
                            <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
                                {editingPromotion ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        ]}
                    >
                        <Form
                            form={form}
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
                                <Input placeholder="Nhập mã khuyến mãi (VD: SALE5000)" />
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
                            >
                                <Select placeholder="Chọn trạng thái">
                                    <Option value={true}>Hoạt động</Option>
                                    <Option value={false}>Tạm dừng</Option>
                                </Select>
                            </Form.Item>
                        </Form>
                    </Modal>

                    {/* View Modal */}
                    <Modal
                        title="Chi tiết khuyến mãi giá cố định"
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
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Mã khuyến mãi">
                                    <Tag color="green">{viewingPromotion.code}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số tiền giảm">
                                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                                        <DollarOutlined /> {viewingPromotion.discountAmount.toLocaleString('vi-VN')} đ
                                    </span>
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
                </>
            )}
        </div>
    );
};

export default FixedPromotions;
