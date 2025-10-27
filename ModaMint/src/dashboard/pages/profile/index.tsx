import React, { useState } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Upload,
    Avatar,
    Row,
    Col,
    Space,
    Typography,
    Divider,
    Select,
    DatePicker,
    Switch,
    message
} from 'antd';
import {
    UserOutlined,
    EditOutlined,
    SaveOutlined,
    CameraOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ProfileData {
    username: string;
    email: string;
    fullName: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatar?: string;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: string;
    address: string;
    city: string;
    district: string;
    ward: string;
    bio?: string;
    language: string;
    theme: 'light' | 'dark';
}

const AdminProfile: React.FC = () => {
    const [form] = Form.useForm();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Mock data - sẽ được load từ API
    const [profileData] = useState<ProfileData>({
        username: 'admin',
        email: 'admin@modamint.com',
        fullName: 'Admin ModaMint',
        firstName: 'Admin',
        lastName: 'ModaMint',
        phone: '0123456789',
        gender: 'other',
        dateOfBirth: '1990-01-01',
        address: '123 Đường ABC',
        city: 'TP. Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường 1',
        bio: 'Quản trị viên hệ thống ModaMint',
        language: 'vi',
        theme: 'light'
    });

    const handleEdit = () => {
        setEditing(true);
        form.setFieldsValue({
            ...profileData,
            dateOfBirth: dayjs(profileData.dateOfBirth)
        });
    };

    const handleSave = async (values: any) => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // TODO: Gọi API để update profile
            message.success('Cập nhật thông tin thành công!');
            setEditing(false);
        } catch (error) {
            message.error('Có lỗi xảy ra khi cập nhật!');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditing(false);
        form.resetFields();
    };

    return (
        <div style={{ padding: '72px', background: '#f0f2f5', minHeight: '100vh' }}>
            {/* Header */}
            <Card style={{ marginBottom: '20px' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                }}>
                    <Space>
                        <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                        <Title level={2} style={{ margin: 0 }}>Thông tin cá nhân</Title>
                    </Space>
                    <Space>
                        {!editing ? (
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={handleEdit}
                            >
                                Chỉnh sửa
                            </Button>
                        ) : (
                            <Space>
                                <Button onClick={handleCancel}>
                                    Hủy
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={() => form.submit()}
                                    loading={loading}
                                >
                                    Lưu thay đổi
                                </Button>
                            </Space>
                        )}
                    </Space>
                </div>
            </Card>

            {/* Profile Content */}
            <Row gutter={24}>
                <Col xs={24} lg={8}>
                    {/* Avatar Card */}
                    <Card>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <Upload
                                name="avatar"
                                listType="picture-circle"
                                showUploadList={false}
                                disabled={!editing}
                                accept="image/*"
                            >
                                {profileData.avatar ? (
                                    <Avatar size={120} src={profileData.avatar} />
                                ) : (
                                    <Avatar size={120} icon={<UserOutlined />} />
                                )}
                            </Upload>
                            {editing && (
                                <div style={{ marginTop: '16px' }}>
                                    <Button
                                        icon={<CameraOutlined />}
                                        size="small"
                                    >
                                        Thay đổi ảnh
                                    </Button>
                                </div>
                            )}
                        </div>
                        <Divider />
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Row justify="space-between">
                                <Text strong>Vai trò:</Text>
                                <Text>Administrator</Text>
                            </Row>
                            <Row justify="space-between">
                                <Text strong>Trạng thái:</Text>
                                <Text style={{ color: '#52c41a' }}>Đang hoạt động</Text>
                            </Row>
                            <Row justify="space-between">
                                <Text strong>Thành viên từ:</Text>
                                <Text>01/01/2024</Text>
                            </Row>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    {/* Personal Information */}
                    <Card title="Thông tin cá nhân" style={{ marginBottom: '16px' }}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSave}
                            disabled={!editing}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="firstName"
                                        label="Họ"
                                    >
                                        <Input placeholder="Nhập họ" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="lastName"
                                        label="Tên"
                                    >
                                        <Input placeholder="Nhập tên" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="phone"
                                label="Số điện thoại"
                            >
                                <Input
                                    prefix={<PhoneOutlined />}
                                    placeholder="Nhập số điện thoại"
                                />
                            </Form.Item>

                            <Form.Item
                                name="dateOfBirth"
                                label="Ngày sinh"
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    placeholder="Chọn ngày sinh"
                                />
                            </Form.Item>

                            <Form.Item
                                name="gender"
                                label="Giới tính"
                            >
                                <Select placeholder="Chọn giới tính">
                                    <Option value="male">Nam</Option>
                                    <Option value="female">Nữ</Option>
                                    <Option value="other">Khác</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="bio"
                                label="Giới thiệu"
                            >
                                <TextArea
                                    rows={4}
                                    placeholder="Viết một vài dòng giới thiệu về bản thân"
                                />
                            </Form.Item>

                            {editing && (
                                <Form.Item>
                                    <Space>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            icon={<SaveOutlined />}
                                            loading={loading}
                                        >
                                            Lưu thay đổi
                                        </Button>
                                        <Button onClick={handleCancel}>
                                            Hủy
                                        </Button>
                                    </Space>
                                </Form.Item>
                            )}
                        </Form>
                    </Card>

                    {/* Contact Information */}
                    <Card title="Thông tin liên hệ">
                        <Form layout="vertical" disabled={!editing}>
                            <Form.Item
                                name="email"
                                label="Email"
                            >
                                <Input
                                    prefix={<MailOutlined />}
                                    disabled
                                    style={{ background: '#f5f5f5' }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="address"
                                label="Địa chỉ"
                            >
                                <Input
                                    prefix={<EnvironmentOutlined />}
                                    placeholder="Nhập địa chỉ"
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="ward"
                                        label="Phường/Xã"
                                    >
                                        <Input placeholder="Phường/Xã" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="district"
                                        label="Quận/Huyện"
                                    >
                                        <Input placeholder="Quận/Huyện" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="city"
                                        label="Tỉnh/Thành phố"
                                    >
                                        <Input placeholder="Tỉnh/Thành phố" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Card>

                    {/* Settings */}
                    <Card title="Cài đặt" style={{ marginTop: '16px' }}>
                        <Form layout="vertical" disabled={!editing}>
                            <Form.Item
                                name="language"
                                label="Ngôn ngữ"
                            >
                                <Select placeholder="Chọn ngôn ngữ">
                                    <Option value="vi">Tiếng Việt</Option>
                                    <Option value="en">English</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="theme"
                                label="Giao diện"
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren="Dark"
                                    unCheckedChildren="Light"
                                />
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminProfile;

