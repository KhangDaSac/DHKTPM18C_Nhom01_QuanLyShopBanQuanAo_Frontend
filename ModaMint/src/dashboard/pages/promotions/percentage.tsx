import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, InputNumber, message, Card, Row, Col, Statistic, Typography, Popconfirm, DatePicker, Switch, Descriptions, Badge, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PercentageOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, GiftOutlined, CalendarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { percentagePromotionService, type PercentagePromotion } from '../../../services/promotion';
import './style.css';
import '../../components/common-styles.css';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const PercentagePromotions: React.FC = () => {
    const [percentagePromotions, setPercentagePromotions] = useState<PercentagePromotion[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<PercentagePromotion | null>(null);
    const [viewingPromotion, setViewingPromotion] = useState<PercentagePromotion | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadPromotions();
    }, []);

    const loadPromotions = async () => {
        setLoading(true);
        try {
            const data = await percentagePromotionService.getAll();
            setPercentagePromotions(data);
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

    const handleEdit = (record: PercentagePromotion) => {
        setEditingPromotion(record);
        form.setFieldsValue({
            name: record.name,
            code: record.code,
            discountPercent: record.discountPercent,
            minOrderValue: record.minOrderValue,
            startAt: [dayjs(record.startAt), dayjs(record.endAt)],
            quantity: record.quantity,
            isActive: record.isActive,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await percentagePromotionService.delete(id);
            message.success('Xóa khuyến mãi thành công');
            loadPromotions();
        } catch (error: any) {
            message.error('Không thể xóa khuyến mãi: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
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

            if (editingPromotion?.id) {
                await percentagePromotionService.update(editingPromotion.id, promotionData);
                message.success('Cập nhật khuyến mãi thành công');
            } else {
                await percentagePromotionService.create(promotionData);
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

    const handleView = (record: PercentagePromotion) => {
        setViewingPromotion(record);
        setIsViewModalVisible(true);
    };

    // Statistics
    const stats = {
        total: percentagePromotions.length,
        active: percentagePromotions.filter(p => p.isActive).length,
        expired: percentagePromotions.filter(p => dayjs(p.endAt).isBefore(dayjs())).length,
    };

    // Table columns
    const columns: ColumnsType<PercentagePromotion> = [
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
                        onClick={() => handleView(record)}
                    >
                        Xem
                    </Button>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc chắn muốn xóa khuyến mãi này?"
                        onConfirm={() => record.id && handleDelete(record.id)}
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
        <div style={{ margin: 0, padding: 0 }}>
            <style>{`
                .ant-table-measure-row {
                    display: none !important;
                    height: 0 !important;
                    visibility: hidden !important;
                }
                * {
                    margin-top: 0 !important;
                }
                .ant-card {
                    margin-top: 0 !important;
                    margin-bottom: 16px !important;
                }
                .ant-card-body {
                    padding: 16px !important;
                }
                .ant-table {
                    margin-top: 0 !important;
                }
                .ant-table-container {
                    margin-top: 0 !important;
                }
                .ant-table-thead > tr > th {
                    padding: 8px 16px !important;
                }
                .ant-typography {
                    margin-top: 0 !important;
                }
                .ant-row {
                    margin-top: 0 !important;
                }
                .ant-col {
                    margin-top: 0 !important;
                }
                .ant-statistic {
                    margin-top: 0 !important;
                }
                .ant-statistic-title {
                    margin-top: 0 !important;
                }
            `}</style>

            <Title level={2} className="text-primary" style={{ marginBottom: '16px', marginTop: 0 }}>
                <PercentageOutlined /> Quản lý khuyến mãi theo phần trăm
            </Title>

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
                        <Space wrap>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleCreate}
                                size="large"
                            >
                                Thêm khuyến mãi
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={loadPromotions}
                                loading={loading}
                            >
                                Làm mới
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={percentagePromotions}
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
                        showTotal: (total) => `Tổng ${total} khuyến mãi`,
                        pageSizeOptions: ['5', '10', '20', '50'],
                    }}
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={editingPromotion ? 'Sửa khuyến mãi phần trăm' : 'Thêm khuyến mãi phần trăm'}
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                width={600}
                okText="Lưu"
                cancelText="Hủy"
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

            {/* View Modal */}
            <Modal
                title="Chi tiết khuyến mãi phần trăm"
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
                            <Tag color="blue">{viewingPromotion.code}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Phần trăm giảm giá">
                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                                <PercentageOutlined /> {viewingPromotion.discountPercent}%
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
        </div>
    );
};

export default PercentagePromotions;
