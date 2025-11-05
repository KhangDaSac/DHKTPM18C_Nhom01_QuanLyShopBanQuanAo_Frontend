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
    message,
    Badge,
    Tag,
    Descriptions
} from 'antd';
import {
    UserOutlined,
    EditOutlined,
    SaveOutlined,
    CameraOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    CrownOutlined,
    CheckCircleOutlined,
    SafetyCertificateOutlined
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
    const [profileData, setProfileData] = useState<ProfileData>({
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


    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(profileData.avatar);

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
            
            // Update profile data
            setProfileData({
                ...profileData,
                ...values,
                dateOfBirth: values.dateOfBirth ? dayjs(values.dateOfBirth).format('YYYY-MM-DD') : profileData.dateOfBirth,
                avatar: avatarUrl
            });
            
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
        setAvatarUrl(profileData.avatar);
    };

    const handleAvatarChange = (info: any) => {
        if (info.file.status === 'done' || info.file.status === 'uploading') {
            // Get the uploaded image URL
            const url = info.file.response?.url || URL.createObjectURL(info.file.originFileObj);
            setAvatarUrl(url);
        }
    };

    const beforeUpload = (file: File) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Chỉ có thể upload file ảnh!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Ảnh phải nhỏ hơn 2MB!');
        }
        return isImage && isLt2M;
    };

    return (
        <div>
            <style>{`
                /* Profile specific styles */
                .profile-avatar-container {
                    position: relative;
                    display: inline-block;
                    margin-bottom: 24px;
                }
                .profile-avatar-wrapper {
                    position: relative;
                    display: inline-block;
                }
                .profile-avatar-wrapper:hover .profile-avatar-overlay {
                    opacity: 1;
                }
                .profile-avatar-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    cursor: pointer;
                }
                .profile-avatar-overlay .anticon {
                    font-size: 32px;
                    color: white;
                }
                .ant-upload-picture-card-wrapper {
                    display: inline-block;
                }
                .profile-info-card {
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                    transition: box-shadow 0.3s ease;
                }
                .profile-info-card:hover {
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                }
                .profile-section-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .profile-stat-item {
                    padding: 12px 0;
                    border-bottom: 1px solid #f0f0f0;
                }
                .profile-stat-item:last-child {
                    border-bottom: none;
                }
                .profile-stat-label {
                    font-size: 13px;
                    color: #8c8c8c;
                    margin-bottom: 4px;
                }
                .profile-stat-value {
                    font-size: 15px;
                    font-weight: 500;
                    color: #262626;
                }
            `}</style>
            
            <Title level={2} className="text-primary" style={{ marginBottom: '16px', marginTop: 0 }}>
                Thông tin cá nhân
            </Title>
            
            {/* Profile Content */}
            <Row gutter={24}>
                <Col xs={24} lg={8}>
                    {/* Avatar Card */}
                    <Card className="profile-info-card" style={{ marginBottom: '24px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div className="profile-avatar-container">
                                <Upload
                                    name="avatar"
                                    listType="picture-circle"
                                    showUploadList={false}
                                    beforeUpload={beforeUpload}
                                    onChange={handleAvatarChange}
                                    disabled={!editing}
                                >
                                    <div className="profile-avatar-wrapper">
                                        <Badge
                                            count={<CrownOutlined style={{ color: '#faad14', fontSize: '20px' }} />}
                                            offset={[-10, 80]}
                                        >
                                            <Avatar 
                                                size={120} 
                                                src={avatarUrl}
                                                icon={<UserOutlined />}
                                                style={{ 
                                                    border: '4px solid #fff',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                }}
                                            />
                                        </Badge>
                                        {editing && (
                                            <div className="profile-avatar-overlay">
                                                <CameraOutlined />
                                            </div>
                                        )}
                                    </div>
                                </Upload>
                            </div>
                            <Title level={4} style={{ marginBottom: '8px', marginTop: '16px' }}>
                                {profileData.fullName}
                            </Title>
                            <Tag 
                                icon={<SafetyCertificateOutlined />} 
                                color="gold" 
                                style={{ marginBottom: '20px', padding: '4px 12px', fontSize: '13px' }}
                            >
                                Administrator
                            </Tag>
                            <Badge 
                                status="success" 
                                text={<span style={{ fontSize: '14px', color: '#52c41a' }}>Đang hoạt động</span>} 
                                style={{ marginBottom: '16px' }}
                            />
                        </div>
                        
                        <Divider style={{ margin: '24px 0' }} />
                        
                        <div>
                            <div className="profile-stat-item">
                                <div className="profile-stat-label">
                                    <MailOutlined /> Email
                                </div>
                                <div className="profile-stat-value">{profileData.email}</div>
                            </div>
                            <div className="profile-stat-item">
                                <div className="profile-stat-label">
                                    <PhoneOutlined /> Số điện thoại
                                </div>
                                <div className="profile-stat-value">{profileData.phone}</div>
                            </div>
                            <div className="profile-stat-item">
                                <div className="profile-stat-label">
                                    <EnvironmentOutlined /> Địa chỉ
                                </div>
                                <div className="profile-stat-value">
                                    {profileData.ward}, {profileData.district}, {profileData.city}
                                </div>
                            </div>
                            <div className="profile-stat-item">
                                <div className="profile-stat-label">
                                    <CalendarOutlined /> Thành viên từ
                                </div>
                                <div className="profile-stat-value">01/01/2024</div>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    {/* Personal Information */}
                    <Card 
                        className="profile-info-card" 
                        title={<div className="profile-section-title"><UserOutlined /> Thông tin cá nhân</div>}
                        extra={
                            !editing ? (
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={handleEdit}
                                    size="large"
                                >
                                    Chỉnh sửa
                                </Button>
                            ) : (
                                <Space>
                                    <Button onClick={handleCancel} size="large">
                                        Hủy
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<SaveOutlined />}
                                        onClick={() => form.submit()}
                                        loading={loading}
                                        size="large"
                                    >
                                        Lưu thay đổi
                                    </Button>
                                </Space>
                            )
                        }
                        style={{ marginBottom: '24px' }}
                    >
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
                                        <Input placeholder="Nhập họ" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="lastName"
                                        label="Tên"
                                    >
                                        <Input placeholder="Nhập tên" size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="phone"
                                        label="Số điện thoại"
                                    >
                                        <Input
                                            prefix={<PhoneOutlined />}
                                            placeholder="Nhập số điện thoại"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="dateOfBirth"
                                        label="Ngày sinh"
                                    >
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            placeholder="Chọn ngày sinh"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="gender"
                                label="Giới tính"
                            >
                                <Select placeholder="Chọn giới tính" size="large">
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
                                    showCount
                                    maxLength={200}
                                />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email"
                            >
                                <Input
                                    prefix={<MailOutlined />}
                                    disabled
                                    style={{ background: '#f5f5f5' }}
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                name="address"
                                label="Địa chỉ chi tiết"
                            >
                                <Input
                                    prefix={<EnvironmentOutlined />}
                                    placeholder="Nhập địa chỉ"
                                    size="large"
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="ward"
                                        label="Phường/Xã"
                                    >
                                        <Input placeholder="Phường/Xã" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="district"
                                        label="Quận/Huyện"
                                    >
                                        <Input placeholder="Quận/Huyện" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="city"
                                        label="Tỉnh/Thành phố"
                                    >
                                        <Input placeholder="Tỉnh/Thành phố" size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="language"
                                label="Ngôn ngữ"
                            >
                                <Select placeholder="Chọn ngôn ngữ" size="large">
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

