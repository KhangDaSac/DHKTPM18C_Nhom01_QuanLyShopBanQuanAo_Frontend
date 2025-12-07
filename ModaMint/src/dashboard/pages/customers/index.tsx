import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Badge,
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
    MailOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import '../../components/common-styles.css';
import { customerService } from '../../../services/customer';
import { addressService, type Province, type District, type Ward } from '../../../services/address';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/LoadingSpinner';

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
    addressDetail?: string;
    city?: string;
    district?: string;
    ward?: string;
    gender?: 'male' | 'female' | 'other';
    dateOfBirth?: string;
    status: 'active' | 'blocked' | 'inactive';
    totalOrders: number;
    totalSpent: number;
    lastOrderDate?: string;
    createdAt?: string;
    notes?: string;
    avatar?: string;
    firstName?: string;
    lastName?: string;
}


const Customers: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // State cho địa chỉ
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | undefined>();
    const [selectedDistrictCode, setSelectedDistrictCode] = useState<string | undefined>();
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);

    // Load customers từ API và provinces
    useEffect(() => {
        loadCustomers();
        loadProvinces();
    }, []);

    // Load provinces
    const loadProvinces = async () => {
        setLoadingProvinces(true);
        try {
            const data = await addressService.getProvinces();
            console.log('Loaded provinces:', data);
            if (data && data.length > 0) {
                setProvinces(data);
            } else {
                console.warn('No provinces data received');
                toast.warning('Không thể tải danh sách tỉnh/thành phố từ API. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error('Error loading provinces:', error);
            toast.error('Không thể tải danh sách tỉnh/thành phố. Vui lòng kiểm tra kết nối mạng.');
        } finally {
            setLoadingProvinces(false);
        }
    };

    // Load districts khi chọn province
    const handleProvinceChange = async (provinceName: string) => {
        // Tìm province code từ name
        const province = provinces.find(p => p.name === provinceName);
        if (!province) {
            console.error('Province not found:', provinceName);
            return;
        }

        const provinceCode = province.code;
        setSelectedProvinceCode(provinceCode);
        setSelectedDistrictCode(undefined);
        setDistricts([]);
        setWards([]);
        form.setFieldsValue({ district: undefined, ward: undefined });

        if (provinceCode) {
            setLoadingDistricts(true);
            try {
                const data = await addressService.getDistrictsByProvince(provinceCode);
                setDistricts(data);
            } catch (error) {
                console.error('Error loading districts:', error);
                toast.error('Không thể tải danh sách quận/huyện');
            } finally {
                setLoadingDistricts(false);
            }
        }
    };

    // Load wards khi chọn district
    const handleDistrictChange = async (districtName: string) => {
        // Tìm district code từ name
        const district = districts.find(d => d.name === districtName);
        if (!district) {
            console.error('District not found:', districtName);
            return;
        }

        const districtCode = district.code;
        setSelectedDistrictCode(districtCode);
        setWards([]);
        form.setFieldsValue({ ward: undefined });

        if (districtCode) {
            setLoadingWards(true);
            try {
                const data = await addressService.getWardsByDistrict(districtCode);
                setWards(data);
            } catch (error) {
                console.error('Error loading wards:', error);
                toast.error('Không thể tải danh sách phường/xã');
            } finally {
                setLoadingWards(false);
            }
        }
    };

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const result = await customerService.getAllCustomers();

            if (result.success && result.data) {
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

                        // Lấy customerId - PHẢI là UUID từ backend, không phải username
                        const userId = customer.customerId; // customerId là UUID từ bảng customers
                        console.log('Loading customer - Username:', user.username, 'CustomerId (UUID):', userId);

                        return {
                            id: index + 1,
                            userId: userId, // UUID từ backend (lưu vào userId cho tương thích)
                            username: user.username || '',
                            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Chưa có tên',
                            email: user.email || '',
                            phone: user.phone || '',
                            addressDetail: primaryAddress?.addressDetail || 'Chưa cập nhật',
                            city: primaryAddress?.city || 'Chưa cập nhật',
                            district: 'Chưa cập nhật', // AddressResponse không có district
                            ward: primaryAddress?.ward || 'Chưa cập nhật',
                            gender: 'other' as const, // UserResponse không có gender
                            dateOfBirth: user.dob || '',
                            status: 'active' as const,
                            totalOrders: orders.length,
                            totalSpent: totalSpent,
                            createdAt: new Date().toISOString().split('T')[0],
                            firstName: user.firstName || '',
                            lastName: user.lastName || '',
                            avatar: user.image || ''
                        };
                    });
                setCustomers(customersData);
            } else {
                toast.error(result.message || 'Không thể tải danh sách khách hàng');
            }
        } catch (err) {
            toast.error('Lỗi kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    // States cho filtering
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchText, setSearchText] = useState<string>('');

    // Filtered customers
    const filteredCustomers = customers.filter(customer => {
        // Filter by status
        if (filterStatus !== 'all' && customer.status !== filterStatus) return false;

        // Filter by search text (search in name, email, phone, username)
        if (searchText) {
            const searchLower = searchText.toLowerCase();

            const matchesName = customer.name?.toLowerCase().includes(searchLower);
            const matchesEmail = customer.email?.toLowerCase().includes(searchLower);
            const matchesPhone = customer.phone?.toLowerCase().includes(searchLower);
            const matchesUsername = customer.username?.toLowerCase().includes(searchLower);

            if (!matchesName && !matchesEmail && !matchesPhone && !matchesUsername) return false;
        }

        return true;
    });

    // Statistics
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
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
            title: 'Hình ảnh',
            key: 'avatar',
            width: 100,
            align: 'center' as const,
            render: (record: Customer) => (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '70px',
                    padding: '8px 0'
                }}>
                    <Avatar
                        src={record.avatar}
                        icon={<UserOutlined />}
                        size={45}
                        style={{ border: '1px solid #f0f0f0' }}
                    />
                </div>
            ),
        },
        {
            title: 'Thông tin khách hàng',
            key: 'customer',
            width: 300,
            render: (record: Customer) => (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: '70px',
                    padding: '8px 0'
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '3px', fontSize: '14px', lineHeight: '1.3' }}>
                        {record.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '1px', lineHeight: '1.2' }}>
                        <MailOutlined style={{ marginRight: '4px' }} />
                        {record.email}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.2' }}>
                        <PhoneOutlined style={{ marginRight: '4px' }} />
                        {record.phone}
                    </div>
                </div>
            ),
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            width: 100,
            align: 'center' as const,
            render: (gender: string) => (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '70px',
                    padding: '8px 0'
                }}>
                    <Tag color={gender === 'male' ? 'blue' : gender === 'female' ? 'pink' : 'default'}>
                        {gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác'}
                    </Tag>
                </div>
            ),
        },
        {
            title: 'Địa chỉ',
            key: 'address',
            width: 200,
            render: (record: Customer) => (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: '70px',
                    padding: '8px 0'
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '3px', fontSize: '14px', lineHeight: '1.3' }}>
                        {record.city}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '1px', lineHeight: '1.2' }}>
                        {record.district}, {record.ward}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {record.addressDetail}
                    </div>
                </div>
            ),
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '70px',
                    padding: '8px 0'
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    height: '70px',
                    padding: '8px 0'
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
            render: (status: string) => (
                <Badge
                    status={status === 'active' ? 'success' : 'error'}
                    text={status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                />
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            align: 'center' as const,
            render: (record: Customer) => (
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
            ),
        },
    ];

    const handleEdit = async (customer: Customer) => {
        setEditingCustomer(customer);

        // Reset address dropdowns
        setSelectedProvinceCode(undefined);
        setSelectedDistrictCode(undefined);
        setDistricts([]);
        setWards([]);

        // Load districts và wards nếu có city và district
        if (customer.city && customer.city !== 'Chưa cập nhật') {
            // Tìm province từ name
            const province = provinces.find(p => p.name === customer.city);
            if (province) {
                await handleProvinceChange(customer.city);

                // Load districts và tìm district
                if (customer.district && customer.district !== 'Chưa cập nhật') {
                    setTimeout(async () => {
                        const districtsData = await addressService.getDistrictsByProvince(province.code);
                        setDistricts(districtsData);
                        const district = districtsData.find(d => d.name === customer.district);
                        if (district) {
                            if (customer.district) {
                                await handleDistrictChange(customer.district);
                            }
                        }
                    }, 500);
                }
            }
        }

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

            // Vô hiệu hóa customer (thay vì xóa)
            const userIdToDelete = customerToDelete.userId;
            console.log('Deactivating customer - ID:', id, 'UserId:', userIdToDelete);

            if (!userIdToDelete) {
                toast.error('Không có userId để vô hiệu hóa');
                return;
            }

            const result = await customerService.deactivateCustomer(userIdToDelete);

            if (result.success) {
                // Cập nhật status của customer thành 'inactive'
                setCustomers(customers.map(c =>
                    c.id === id ? { ...c, status: 'inactive' } : c
                ));
                toast.success(result.message || 'Đã vô hiệu hóa khách hàng thành công');
            } else {
                toast.error(result.message || 'Vô hiệu hóa khách hàng thất bại');
            }
        } catch (err) {
            toast.error('Lỗi khi vô hiệu hóa khách hàng');
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
            setSelectedProvinceCode(undefined);
            setSelectedDistrictCode(undefined);
            setDistricts([]);
            setWards([]);
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
            'Thành phố': customer.city,
            'Quận/Huyện': customer.district,
            'Phường/Xã': customer.ward,
            'Giới tính': customer.gender === 'male' ? 'Nam' : customer.gender === 'female' ? 'Nữ' : 'Khác',
            'Ngày sinh': customer.dateOfBirth || '',
            'Trạng thái': customer.status === 'active' ? 'Hoạt động' : 'Bị khóa',
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
                                placeholder="Tìm kiếm theo tên, email, SĐT..."
                                style={{ width: 300 }}
                                allowClear
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onSearch={(value) => setSearchText(value)}
                            />
                            <Select
                                placeholder="Trạng thái"
                                style={{ width: 150 }}
                                value={filterStatus === 'all' ? undefined : filterStatus}
                                onChange={(value) => setFilterStatus(value || 'all')}
                                allowClear
                            >
                                <Option value="active">Hoạt động</Option>
                                <Option value="blocked">Bị khóa</Option>
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
            <Card style={{ marginTop: 0 }}>
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
                    .ant-table-container {
                        margin-top: 0 !important;
                    }
                    .ant-card-body {
                        padding: 16px !important;
                    }
                    .ant-table-thead {
                        margin-top: 0 !important;
                    }
                    .ant-table-thead > tr {
                        margin-top: 0 !important;
                    }
                `}</style>
                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={filteredCustomers}
                        rowKey="id"
                        size="small"
                        rowSelection={{
                            selectedRowKeys,
                            onChange: setSelectedRowKeys,
                            getCheckboxProps: () => ({
                                disabled: false
                            })
                        }}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total) => `Tổng ${total} khách hàng`,
                        }}
                        scroll={{ x: 1200 }}
                        style={{
                            '--ant-table-row-height': '70px'
                        } as React.CSSProperties}
                        components={{
                            body: {
                                row: (props: any) => (
                                    <tr {...props} style={{ height: '70px', verticalAlign: 'middle' }} />
                                )
                            }
                        }}
                    />
                </Spin>
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
                open={isModalVisible}
                onOk={() => form.submit()}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                    setSelectedProvinceCode(undefined);
                    setSelectedDistrictCode(undefined);
                    setDistricts([]);
                    setWards([]);
                }}
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
                            <Form.Item
                                name="city"
                                label="Tỉnh/Thành phố"
                                rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
                            >
                                <Select
                                    placeholder="Chọn tỉnh/thành phố"
                                    loading={loadingProvinces}
                                    onChange={handleProvinceChange}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {provinces.map(province => (
                                        <Option key={province.code} value={province.name}>
                                            {province.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="district"
                                label="Quận/Huyện"
                                rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
                            >
                                <Select
                                    placeholder="Chọn quận/huyện"
                                    loading={loadingDistricts}
                                    disabled={!selectedProvinceCode || districts.length === 0}
                                    onChange={handleDistrictChange}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {districts.map(district => (
                                        <Option key={district.code} value={district.name}>
                                            {district.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="ward"
                                label="Phường/Xã"
                                rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
                            >
                                <Select
                                    placeholder="Chọn phường/xã"
                                    loading={loadingWards}
                                    disabled={!selectedDistrictCode || wards.length === 0}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {wards.map(ward => (
                                        <Option key={ward.code} value={ward.name}>
                                            {ward.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="addressDetail"
                        label="Địa chỉ chi tiết"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
                    >
                        <TextArea rows={3} placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường, ...)" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="status" label="Trạng thái">
                                <Select placeholder="Chọn trạng thái">
                                    <Option value="active">Hoạt động</Option>
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
                                    </Title>
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
                                    {viewingCustomer.addressDetail}<br />
                                    {viewingCustomer.ward}, {viewingCustomer.district}<br />
                                    {viewingCustomer.city}
                                </p>
                                <p><strong>Trạng thái:</strong>
                                    <Tag color={
                                        viewingCustomer.status === 'active' ? 'green' : 'red'
                                    }>
                                        {viewingCustomer.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
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