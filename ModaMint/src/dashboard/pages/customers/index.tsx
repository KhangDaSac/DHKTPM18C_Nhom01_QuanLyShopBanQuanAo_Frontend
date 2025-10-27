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
    Avatar,
    Spin
} from 'antd';
import './style.css';
import {
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    DownloadOutlined,
    UserOutlined,
    TeamOutlined,
    CrownOutlined,
    MailOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import '../../components/common-styles.css';
import { customerService } from '../../../services/customer';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Interface cho Customer
interface Customer {
    id: number;
    userId?: string; // userId từ backend
    username?: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    district?: string;
    ward?: string;
    gender?: 'male' | 'female' | 'other';
    dateOfBirth?: string;
    status: 'active' | 'inactive' | 'blocked';
    customerType: 'regular' | 'vip' | 'premium';
    totalOrders: number;
    totalSpent: number;
    lastOrderDate?: string;
    createdAt?: string;
    notes?: string;
    avatar?: string;
    firstName?: string;
    lastName?: string;
}

// Data sẽ được load từ API
const cities = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Nha Trang', 'Huế', 'Quy Nhon'];

const Customers: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Inject CSS để fix table spacing
    useEffect(() => {
        const styleId = 'custom-table-fix';
        let existingStyle = document.getElementById(styleId);

        if (existingStyle) {
            existingStyle.remove();
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .custom-customers-table .ant-table-thead {
                position: sticky !important;
                top: 0 !important;
                z-index: 2 !important;
            }
            
            .custom-customers-table .ant-table-tbody {
                margin-top: 0 !important;
                padding-top: 0 !important;
            }
            
            .custom-customers-table .ant-table-thead > tr > th {
                vertical-align: middle !important;
                text-align: center !important;
                font-weight: 600 !important;
                padding: 8px 16px !important;
                border-bottom: 1px solid #f0f0f0 !important;
                background-color: #fafafa !important;
                height: 40px !important;
                margin: 0 !important;
                border-top: none !important;
            }
            
            .custom-customers-table .ant-table-tbody > tr > td {
                vertical-align: middle !important;
                padding: 8px 16px !important;
                height: 60px !important;
                border-bottom: 1px solid #f0f0f0 !important;
                margin: 0 !important;
                border-top: none !important;
            }
            
            .custom-customers-table .ant-table-container {
                border: none !important;
            }
            
            .custom-customers-table .ant-table {
                border-collapse: collapse !important;
                border-spacing: 0 !important;
            }
            
            .custom-customers-table .ant-table-thead > tr > th.ant-table-selection-column {
                padding: 8px !important;
                width: 50px !important;
                text-align: center !important;
                background-color: #fafafa !important;
            }
            
            .custom-customers-table .ant-table-tbody > tr > td.ant-table-selection-column {
                padding: 8px !important;
                width: 50px !important;
                text-align: center !important;
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

    // Load customers từ API
    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        setLoading(true);
        try {
            console.log('🔄 Đang gọi API getAllCustomers...');
            const result = await customerService.getAllCustomers();
            console.log('📦 Kết quả từ API:', result);
            
            if (result.success && result.data) {
                console.log('✅ Dữ liệu customers:', result.data);
                // Chuyển đổi customer response sang customer format cho display
                const customersData: Customer[] = result.data
                    .filter(customer => customer && customer.user) // Lọc các customer có user data
                    .map((customer, index) => {
                        const user = customer.user!; // Safe vì đã filter
                        const primaryAddress = customer.addresses && customer.addresses.length > 0 
                            ? customer.addresses[0] 
                            : null;
                        const orders = customer.orders || [];
                        const totalSpent = orders.reduce((sum, order) => sum + (parseFloat(order.id.toString()) || 0), 0);
                        
                    return {
                        id: index + 1,
                        userId: customer.userId, // Lưu userId từ backend
                        username: user.username || '',
                        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Chưa có tên',
                        email: user.email || '',
                        phone: user.phone || '',
                        address: primaryAddress?.addressDetail || 'Chưa cập nhật',
                        city: primaryAddress?.city || 'Chưa cập nhật',
                        district: 'Chưa cập nhật',
                        ward: primaryAddress?.ward || 'Chưa cập nhật',
                        gender: 'other' as const,
                        dateOfBirth: user.dob || '',
                        status: 'active' as const,
                        customerType: 'regular' as const,
                        totalOrders: orders.length,
                        totalSpent: totalSpent,
                        createdAt: new Date().toISOString().split('T')[0],
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        avatar: user.image || ''
                    };
                    });
                console.log('👥 Customers data mapped:', customersData);
                console.log('👥 Total customers:', customersData.length);
                setCustomers(customersData);
            } else {
                console.error('❌ Lỗi:', result.message);
                toast.error(result.message || 'Không thể tải danh sách khách hàng');
            }
        } catch (err) {
            console.error('❌ Exception:', err);
            toast.error('Lỗi kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    // States cho filtering
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterCustomerType, setFilterCustomerType] = useState<string>('all');

    // Filtered customers
    const filteredCustomers = customers.filter(customer => {
        if (filterStatus !== 'all' && customer.status !== filterStatus) return false;
        if (filterCustomerType !== 'all' && customer.customerType !== filterCustomerType) return false;
        return true;
    });

    // Statistics
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const vipCustomers = customers.filter(c => c.customerType === 'vip' || c.customerType === 'premium').length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            align: 'center' as const,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            width: 250,
            render: (record: Customer) => (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 0',
                    minHeight: '60px'
                }}>
                    <Avatar
                        src={record.avatar}
                        icon={<UserOutlined />}
                        size={40}
                        style={{ flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontWeight: 'bold',
                            marginBottom: '4px',
                            lineHeight: '1.2',
                            fontSize: '14px'
                        }}>
                            {record.name}
                            {record.customerType === 'vip' &&
                                <CrownOutlined style={{ color: '#faad14', marginLeft: '6px' }} />
                            }
                            {record.customerType === 'premium' &&
                                <CrownOutlined style={{ color: '#722ed1', marginLeft: '6px' }} />
                            }
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: '#666',
                            lineHeight: '1.3',
                            marginBottom: '2px'
                        }}>
                            <MailOutlined style={{ marginRight: '4px' }} />
                            {record.email}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: '#666',
                            lineHeight: '1.3'
                        }}>
                            <PhoneOutlined style={{ marginRight: '4px' }} />
                            {record.phone}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Địa chỉ',
            key: 'address',
            width: 200,
            render: (record: Customer) => (
                <div style={{
                    padding: '8px 0',
                    minHeight: '60px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        fontWeight: 'bold',
                        marginBottom: '4px',
                        fontSize: '14px',
                        lineHeight: '1.2'
                    }}>
                        {record.city}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: '#666',
                        marginBottom: '2px',
                        lineHeight: '1.3'
                    }}>
                        {record.district}, {record.ward}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: '#999',
                        lineHeight: '1.3',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {record.address}
                    </div>
                </div>
            ),
        },
        {
            title: 'Loại KH',
            dataIndex: 'customerType',
            key: 'customerType',
            width: 100,
            align: 'center' as const,
            render: (type: string) => {
                const config = {
                    regular: { color: 'default', text: 'Thường' },
                    vip: { color: 'gold', text: 'VIP' },
                    premium: { color: 'purple', text: 'Premium' }
                };
                const { color, text } = config[type as keyof typeof config];
                return (
                    <div style={{
                        padding: '8px 0',
                        minHeight: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Tag color={color}>{text}</Tag>
                    </div>
                );
            },
        },
        {
            title: 'Đơn hàng',
            dataIndex: 'totalOrders',
            key: 'totalOrders',
            width: 100,
            align: 'center' as const,
            sorter: (a: Customer, b: Customer) => a.totalOrders - b.totalOrders,
            render: (orders: number) => (
                <div style={{
                    padding: '8px 0',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <span style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '14px' }}>{orders}</span>
                </div>
            ),
        },
        {
            title: 'Tổng chi tiêu',
            dataIndex: 'totalSpent',
            key: 'totalSpent',
            width: 120,
            align: 'right' as const,
            sorter: (a: Customer, b: Customer) => a.totalSpent - b.totalSpent,
            render: (amount: number) => (
                <div style={{
                    padding: '8px 0',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end'
                }}>
                    <span style={{
                        fontWeight: 'bold',
                        color: '#52c41a',
                        fontSize: '14px'
                    }}>
                        {amount.toLocaleString()}đ
                    </span>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            align: 'center' as const,
            render: (status: string, record: Customer) => {
                const handleToggleStatus = () => {
                    let newStatus: 'active' | 'inactive' | 'blocked';
                    if (status === 'active') newStatus = 'inactive';
                    else if (status === 'inactive') newStatus = 'active';
                    else newStatus = 'active'; // unblock

                    setCustomers(customers.map(c =>
                        c.id === record.id ? { ...c, status: newStatus } : c
                    ));
                    message.success(`Đã cập nhật trạng thái khách hàng`);
                };

                const getText = () => {
                    switch (status) {
                        case 'active': return 'Hoạt động';
                        case 'inactive': return 'Không hoạt động';
                        case 'blocked': return 'Bị khóa';
                        default: return status;
                    }
                };

                return (
                    <div className="status-button-container">
                        <Button
                            size="small"
                            onClick={handleToggleStatus}
                            className={`status-button ${status}`}
                        >
                            {getText()}
                        </Button>
                    </div>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            align: 'center' as const,
            render: (record: Customer) => (
                <div style={{
                    padding: '8px 0',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
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
                        <Popconfirm
                            title="Bạn có chắc muốn xóa khách hàng này?"
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

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        form.setFieldsValue({
            ...customer,
            dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth : undefined
        });
        setIsModalVisible(true);
    };

    const handleView = (customer: Customer) => {
        setViewingCustomer(customer);
        setIsViewModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            setLoading(true);
            // Tìm customer theo id
            const customerToDelete = customers.find(c => c.id === id);
            
            if (!customerToDelete) {
                toast.error('Không tìm thấy khách hàng');
                return;
            }

            // Gọi API xóa customer (sử dụng userId từ backend)
            const userIdToDelete = customerToDelete.userId;
            console.log('🗑️ Attempting to delete customer with userId:', userIdToDelete);
            
            if (!userIdToDelete) {
                toast.error('Không có userId để xóa');
                return;
            }
            
            const result = await customerService.deleteCustomer(userIdToDelete);
            console.log('🗑️ Delete result:', result);
            
            if (result.success) {
                setCustomers(customers.filter(c => c.id !== id));
                console.log('✅ Showing success message');
                toast.success(result.message || 'Đã xóa khách hàng thành công');
            } else {
                console.log('❌ Showing error message');
                toast.error(result.message || 'Xóa khách hàng thất bại');
            }
        } catch (err) {
            console.error('❌ Delete customer error:', err);
            toast.error('Lỗi khi xóa khách hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (values: any) => {
        setLoading(true);
        try {
            const customerData: Customer = {
                ...values,
                id: editingCustomer ? editingCustomer.id : Date.now(),
                totalOrders: editingCustomer?.totalOrders || 0,
                totalSpent: editingCustomer?.totalSpent || 0,
                lastOrderDate: editingCustomer?.lastOrderDate,
                createdAt: editingCustomer?.createdAt || new Date().toISOString().split('T')[0],
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : undefined
            };

            if (editingCustomer) {
                setCustomers(customers.map(c => c.id === editingCustomer.id ? customerData : c));
                message.success('Đã cập nhật khách hàng thành công');
            } else {
                setCustomers([...customers, customerData]);
                message.success('Đã thêm khách hàng thành công');
            }

            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    // Export Excel
    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(customers.map(customer => ({
            'ID': customer.id,
            'Tên khách hàng': customer.name,
            'Email': customer.email,
            'Số điện thoại': customer.phone,
            'Địa chỉ': customer.address,
            'Thành phố': customer.city,
            'Quận/Huyện': customer.district,
            'Phường/Xã': customer.ward,
            'Giới tính': customer.gender === 'male' ? 'Nam' : customer.gender === 'female' ? 'Nữ' : 'Khác',
            'Ngày sinh': customer.dateOfBirth || '',
            'Trạng thái': customer.status === 'active' ? 'Hoạt động' : customer.status === 'inactive' ? 'Không hoạt động' : 'Bị khóa',
            'Loại khách hàng': customer.customerType === 'regular' ? 'Thường' : customer.customerType === 'vip' ? 'VIP' : 'Premium',
            'Tổng đơn hàng': customer.totalOrders,
            'Tổng chi tiêu': customer.totalSpent,
            'Đơn hàng cuối': customer.lastOrderDate || '',
            'Ngày tạo': customer.createdAt,
            'Ghi chú': customer.notes || ''
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Khách hàng');
        XLSX.writeFile(workbook, `khach-hang-${new Date().toISOString().split('T')[0]}.xlsx`);
        message.success('Đã xuất file Excel thành công!');
    };

    return (
        <div>
            <Title level={2} className="text-primary" style={{ marginBottom: '24px' }}>
                Quản lý Khách hàng
            </Title>

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng khách hàng"
                            value={totalCustomers}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đang hoạt động"
                            value={activeCustomers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="VIP & Premium"
                            value={vipCustomers}
                            prefix={<CrownOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={totalRevenue}
                            prefix="₫"
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
                                placeholder="Tìm kiếm khách hàng..."
                                style={{ width: 300 }}
                                allowClear
                            />
                            <Select
                                placeholder="Trạng thái"
                                style={{ width: 150 }}
                                value={filterStatus === 'all' ? undefined : filterStatus}
                                onChange={(value) => setFilterStatus(value || 'all')}
                                allowClear
                            >
                                <Option value="active">Hoạt động</Option>
                                <Option value="inactive">Không hoạt động</Option>
                                <Option value="blocked">Bị khóa</Option>
                            </Select>
                            <Select
                                placeholder="Loại khách hàng"
                                style={{ width: 150 }}
                                value={filterCustomerType === 'all' ? undefined : filterCustomerType}
                                onChange={(value) => setFilterCustomerType(value || 'all')}
                                allowClear
                            >
                                <Option value="regular">Thường</Option>
                                <Option value="vip">VIP</Option>
                                <Option value="premium">Premium</Option>
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
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Bulk Actions */}
            {selectedRowKeys.length > 0 && (
                <Card style={{ marginBottom: '16px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Text strong>Đã chọn {selectedRowKeys.length} khách hàng</Text>
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

            {/* Customers Table */}
            <Card>
                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={filteredCustomers}
                        rowKey="id"
                        size="small"
                        className="custom-customers-table"
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
                        showTotal: (total) => `Tổng ${total} khách hàng`,
                    }}
                    scroll={{ x: 1200 }}
                    />
                </Spin>
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
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
                                label="Tên khách hàng"
                                rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
                            >
                                <Input placeholder="Nhập tên khách hàng" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email' },
                                    { type: 'email', message: 'Email không hợp lệ' }
                                ]}
                            >
                                <Input placeholder="Nhập email" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="phone"
                                label="Số điện thoại"
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                            >
                                <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="gender" label="Giới tính">
                                <Select placeholder="Chọn giới tính">
                                    <Option value="male">Nam</Option>
                                    <Option value="female">Nữ</Option>
                                    <Option value="other">Khác</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="city" label="Thành phố">
                                <Select placeholder="Chọn thành phố">
                                    {cities.map(city => (
                                        <Option key={city} value={city}>{city}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="district" label="Quận/Huyện">
                                <Input placeholder="Nhập quận/huyện" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="ward" label="Phường/Xã">
                                <Input placeholder="Nhập phường/xã" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="address" label="Địa chỉ chi tiết">
                        <Input placeholder="Nhập địa chỉ chi tiết" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="customerType" label="Loại khách hàng">
                                <Select placeholder="Chọn loại khách hàng">
                                    <Option value="regular">Thường</Option>
                                    <Option value="vip">VIP</Option>
                                    <Option value="premium">Premium</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="status" label="Trạng thái">
                                <Select placeholder="Chọn trạng thái">
                                    <Option value="active">Hoạt động</Option>
                                    <Option value="inactive">Không hoạt động</Option>
                                    <Option value="blocked">Bị khóa</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="notes" label="Ghi chú">
                        <TextArea rows={3} placeholder="Nhập ghi chú về khách hàng" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Customer Modal */}
            <Modal
                title="Thông tin khách hàng"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={null}
                width={800}
            >
                {viewingCustomer && (
                    <div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                    <Avatar
                                        src={viewingCustomer.avatar}
                                        icon={<UserOutlined />}
                                        size={120}
                                    />
                                    <Title level={4} style={{ marginTop: '12px', marginBottom: '4px' }}>
                                        {viewingCustomer.name}
                                        {viewingCustomer.customerType === 'vip' &&
                                            <CrownOutlined style={{ color: '#faad14', marginLeft: '8px' }} />
                                        }
                                        {viewingCustomer.customerType === 'premium' &&
                                            <CrownOutlined style={{ color: '#722ed1', marginLeft: '8px' }} />
                                        }
                                    </Title>
                                    <Tag color={
                                        viewingCustomer.customerType === 'vip' ? 'gold' :
                                            viewingCustomer.customerType === 'premium' ? 'purple' : 'default'
                                    }>
                                        {viewingCustomer.customerType === 'vip' ? 'VIP' :
                                            viewingCustomer.customerType === 'premium' ? 'Premium' : 'Thường'}
                                    </Tag>
                                </div>
                            </Col>
                            <Col span={16}>
                                <p><strong>Email:</strong> {viewingCustomer.email}</p>
                                <p><strong>Số điện thoại:</strong> {viewingCustomer.phone}</p>
                                <p><strong>Giới tính:</strong> {
                                    viewingCustomer.gender === 'male' ? 'Nam' :
                                        viewingCustomer.gender === 'female' ? 'Nữ' : 'Khác'
                                }</p>
                                <p><strong>Ngày sinh:</strong> {viewingCustomer.dateOfBirth || 'Chưa cập nhật'}</p>
                                <p><strong>Địa chỉ:</strong><br />
                                    {viewingCustomer.address}<br />
                                    {viewingCustomer.ward}, {viewingCustomer.district}<br />
                                    {viewingCustomer.city}
                                </p>
                                <p><strong>Trạng thái:</strong>
                                    <Tag color={
                                        viewingCustomer.status === 'active' ? 'green' :
                                            viewingCustomer.status === 'inactive' ? 'default' : 'red'
                                    }>
                                        {viewingCustomer.status === 'active' ? 'Hoạt động' :
                                            viewingCustomer.status === 'inactive' ? 'Không hoạt động' : 'Bị khóa'}
                                    </Tag>
                                </p>
                            </Col>
                        </Row>

                        <Row gutter={16} style={{ marginTop: '24px' }}>
                            <Col span={8}>
                                <Card size="small">
                                    <Statistic
                                        title="Tổng đơn hàng"
                                        value={viewingCustomer.totalOrders}
                                        valueStyle={{ color: '#1890ff' }}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card size="small">
                                    <Statistic
                                        title="Tổng chi tiêu"
                                        value={viewingCustomer.totalSpent}
                                        formatter={(value) => `${Number(value).toLocaleString()}đ`}
                                        valueStyle={{ color: '#52c41a' }}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card size="small">
                                    <Statistic
                                        title="Đơn hàng cuối"
                                        value={viewingCustomer.lastOrderDate || 'Chưa có'}
                                        valueStyle={{ color: '#faad14' }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {viewingCustomer.notes && (
                            <div style={{ marginTop: '24px' }}>
                                <Title level={5}>Ghi chú:</Title>
                                <p>{viewingCustomer.notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Customers;