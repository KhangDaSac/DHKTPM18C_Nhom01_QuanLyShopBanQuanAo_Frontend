import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Table,
    Button,
    Space,
    Typography,
    Modal,
    Form,
    Input,
    Row,
    Col,
    Tag,
    Popconfirm,
    Empty,
    message
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    LeftOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Address {
    id: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
    isDefault: boolean;
}

export default function ProfileAddress() {
    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    // Mock data cho địa chỉ
    const [addresses, setAddresses] = useState<Address[]>([
        {
            id: '1',
            name: 'Nguyễn Văn A',
            phone: '0123456789',
            address: '123 Đường ABC',
            city: 'Hồ Chí Minh',
            district: 'Quận 1',
            ward: 'Phường Bến Nghé',
            isDefault: true
        },
        {
            id: '2',
            name: 'Nguyễn Văn A',
            phone: '0123456789',
            address: '456 Đường XYZ',
            city: 'Hà Nội',
            district: 'Quận Ba Đình',
            ward: 'Phường Phúc Xá',
            isDefault: false
        }
    ]);

    const handleAddressSubmit = async (values: any) => {
        try {
            if (editingAddress) {
                // Update existing address
                setAddresses(addresses.map(addr => 
                    addr.id === editingAddress.id 
                        ? { ...addr, ...values }
                        : addr
                ));
                message.success('Cập nhật địa chỉ thành công!');
            } else {
                // Add new address
                const newAddress: Address = {
                    id: Date.now().toString(),
                    ...values,
                    isDefault: addresses.length === 0
                };
                setAddresses([...addresses, newAddress]);
                message.success('Thêm địa chỉ thành công!');
            }
            setAddressModalVisible(false);
            setEditingAddress(null);
            form.resetFields();
        } catch (error) {
            message.error('Thao tác thất bại!');
        }
    };

    const handleDeleteAddress = (id: string) => {
        setAddresses(addresses.filter(addr => addr.id !== id));
        message.success('Xóa địa chỉ thành công!');
    };

    const handleSetDefaultAddress = (id: string) => {
        setAddresses(addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === id
        })));
        message.success('Đặt địa chỉ mặc định thành công!');
    };

    const columns = [
        {
            title: 'Tên người nhận',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Address) => (
                <Space>
                    <Text strong>{text}</Text>
                    {record.isDefault && <Tag color="green">Mặc định</Tag>}
                </Space>
            )
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone: string) => (
                <Space>
                    <PhoneOutlined />
                    {phone}
                </Space>
            )
        },
        {
            title: 'Địa chỉ',
            key: 'address',
            render: (record: Address) => (
                <Text>
                    {record.address}, {record.ward}, {record.district}, {record.city}
                </Text>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (record: Address) => (
                <Space>
                    <Button 
                        type="link" 
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingAddress(record);
                            form.setFieldsValue(record);
                            setAddressModalVisible(true);
                        }}
                    >
                        Sửa
                    </Button>
                    {!record.isDefault && (
                        <Button 
                            type="link" 
                            size="small"
                            onClick={() => handleSetDefaultAddress(record.id)}
                        >
                            Đặt mặc định
                        </Button>
                    )}
                    <Popconfirm
                        title="Xóa địa chỉ"
                        description="Bạn có chắc chắn muốn xóa địa chỉ này?"
                        onConfirm={() => handleDeleteAddress(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button 
                            type="link" 
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <Button 
                    icon={<LeftOutlined />} 
                    onClick={() => navigate('/profile')}
                    style={{ marginBottom: '16px' }}
                >
                    Quay lại
                </Button>
                <Title level={2}>Quản lý địa chỉ</Title>
            </div>

            {/* Address Management */}
            <Card
                title="Danh sách địa chỉ"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingAddress(null);
                            form.resetFields();
                            setAddressModalVisible(true);
                        }}
                    >
                        Thêm địa chỉ
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={addresses}
                    rowKey="id"
                    pagination={false}
                    locale={{
                        emptyText: (
                            <Empty
                                description="Chưa có địa chỉ nào"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )
                    }}
                />
            </Card>

            {/* Address Modal */}
            <Modal
                title={editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                open={addressModalVisible}
                onCancel={() => {
                    setAddressModalVisible(false);
                    setEditingAddress(null);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddressSubmit}
                >
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Tên người nhận"
                                name="name"
                                rules={[{ required: true, message: 'Vui lòng nhập tên người nhận!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Số điện thoại"
                                name="phone"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        label="Địa chỉ chi tiết"
                        name="address"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                    >
                        <TextArea rows={3} />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                label="Tỉnh/Thành phố"
                                name="city"
                                rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                label="Quận/Huyện"
                                name="district"
                                rules={[{ required: true, message: 'Vui lòng chọn quận/huyện!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                label="Phường/Xã"
                                name="ward"
                                rules={[{ required: true, message: 'Vui lòng chọn phường/xã!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingAddress ? 'Cập nhật' : 'Thêm địa chỉ'}
                            </Button>
                            <Button onClick={() => {
                                setAddressModalVisible(false);
                                setEditingAddress(null);
                                form.resetFields();
                            }}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
