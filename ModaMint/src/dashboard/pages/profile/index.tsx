import React, { useState, useEffect } from 'react';
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
    Descriptions,
    Spin
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
    SafetyCertificateOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { authenticationService, type UserResponse } from '../../../services/authentication';
import { userService } from '../../../services/user';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ProfileData {
    id?: string;
    username: string;
    email: string;
    fullName: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatar?: string;
    dob?: string;
    createdDate?: string;
}

const AdminProfile: React.FC = () => {
    const [form] = Form.useForm();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>();

    // Load thông tin user khi component mount
    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            setPageLoading(true);
            const result = await authenticationService.getCurrentUser();

            if (result.success && result.data) {
                const user = result.data;
                const profile: ProfileData = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: `${user.firstName} ${user.lastName}`.trim(),
                    phone: user.phone || '',
                    dob: user.dob,
                    avatar: user.image,
                    createdDate: user.createdDate
                };
                setProfileData(profile);
                setAvatarUrl(user.image);
            } else {
                toast.error(result.message || 'Không thể tải thông tin người dùng');
            }
        } catch (error) {
            console.error('Load profile error:', error);
            toast.error('Có lỗi xảy ra khi tải thông tin');
        } finally {
            setPageLoading(false);
        }
    };

    const handleEdit = () => {
        if (!profileData) return;
        setEditing(true);
        form.setFieldsValue({
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            phone: profileData.phone,
            dob: profileData.dob ? dayjs(profileData.dob) : undefined,
            email: profileData.email
        });
    };

    const handleSave = async (values: any) => {
        if (!profileData || !profileData.id) {
            toast.error('Không tìm thấy thông tin người dùng');
            return;
        }

        try {
            setLoading(true);

            // Chuẩn bị data để update
            const updateData = {
                firstName: values.firstName,
                lastName: values.lastName,
                phone: values.phone,
                dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : undefined,
            };

            console.log('Updating user with ID:', profileData.id, 'Data:', updateData);

            const result = await userService.updateUser(profileData.id, updateData);

            if (result.success) {
                toast.success(result.message || 'Cập nhật thông tin thành công!');
                // Reload lại thông tin user
                await loadUserProfile();
                setEditing(false);
            } else {
                toast.error(result.message || 'Cập nhật thông tin thất bại');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Có lỗi xảy ra khi cập nhật!');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditing(false);
        form.resetFields();
    };

    const handleAvatarChange = (info: any) => {
        // TODO: Implement Cloudinary upload
        if (info.file.status === 'done' || info.file.status === 'uploading') {
            const url = info.file.response?.url || URL.createObjectURL(info.file.originFileObj);
            setAvatarUrl(url);
        }
    };

    const beforeUpload = (file: File) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            toast.error('Chỉ có thể upload file ảnh!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            toast.error('Ảnh phải nhỏ hơn 2MB!');
        }
        return isImage && isLt2M;
    };

    // Hiển thị loading khi đang tải dữ liệu
    if (pageLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} tip="Đang tải thông tin..." />
            </div>
        );
    }

    // Hiển thị lỗi nếu không load được data
    if (!profileData) {
        return (
            <Card>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Text type="danger">Không thể tải thông tin người dùng</Text>
                    <br />
                    <Button type="primary" onClick={loadUserProfile} style={{ marginTop: '16px' }}>
                        Thử lại
                    </Button>
                </div>
            </Card>
        );
    }

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
                                <div className="profile-stat-value">{profileData.phone || 'Chưa cập nhật'}</div>
                            </div>
                            <div className="profile-stat-item">
                                <div className="profile-stat-label">
                                    <CalendarOutlined /> Ngày sinh
                                </div>
                                <div className="profile-stat-value">
                                    {profileData.dob ? dayjs(profileData.dob).format('DD/MM/YYYY') : 'Chưa cập nhật'}
                                </div>
                            </div>
                            <div className="profile-stat-item">
                                <div className="profile-stat-label">
                                    <CalendarOutlined /> Thành viên từ
                                </div>
                                <div className="profile-stat-value">
                                    {profileData.createdDate ? dayjs(profileData.createdDate).format('DD/MM/YYYY') : 'N/A'}
                                </div>
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
                                        rules={[
                                            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                                        ]}
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
                                        name="dob"
                                        label="Ngày sinh"
                                    >
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            placeholder="Chọn ngày sinh"
                                            size="large"
                                            format="DD/MM/YYYY"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="email"
                                label="Email"
                                tooltip="Email không thể thay đổi"
                            >
                                <Input
                                    prefix={<MailOutlined />}
                                    disabled
                                    style={{ background: '#f5f5f5' }}
                                    size="large"
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