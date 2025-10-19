import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { authenticationService } from '../../services/authentication';
import {
    Card,
    Form,
    Input,
    Button,
    Space,
    Typography,
    Row,
    Col,
    Avatar,
    message,
    Upload,
    Spin
} from 'antd';
import {
    UserOutlined,
    EditOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    LockOutlined,
    ShoppingCartOutlined,
    CameraOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function ProfileMain() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [userData, setUserData] = useState<any>(null);
    const navigate = useNavigate();

    // Sử dụng AuthContext
    const { isAuthenticated, updateUser } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        
        fetchUserData();
    }, [isAuthenticated, navigate]);

    const fetchUserData = async () => {
        try {
            // Debug: Kiểm tra token
            const authDataStr = localStorage.getItem("authData");
            console.log('🔍 Auth data:', authDataStr);
            
            if (!authDataStr) {
                message.error('Chưa đăng nhập');
                navigate('/login');
                return;
            }

            const result = await authenticationService.getCurrentUser();
            console.log('📦 API Response:', result);
            
            if (result.success && result.data) {
                setUserData(result.data);
                form.setFieldsValue(result.data);
                setAvatarUrl(result.data.image || '');
            } else {
                message.error(result.message || 'Không thể tải thông tin người dùng');
                // Nếu lỗi 403, có thể token hết hạn
                if (result.message?.includes('403') || result.message?.includes('Forbidden')) {
                    message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
                    navigate('/login');
                }
            }
        } catch (error) {
            console.error('💥 Fetch Error:', error);
            message.error('Lỗi khi tải thông tin người dùng');
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (userData) {
                const values = form.getFieldsValue();
                const updatedUserData = { 
                    ...userData, 
                    ...values,
                    image: avatarUrl
                };
                
                // Cập nhật lên server
                const updateResult = await authenticationService.updateUserProfile(updatedUserData);
                
                if (updateResult.success && updateResult.data) {
                    setUserData(updateResult.data);
                    updateUser(updateResult.data);
                    message.success('Cập nhật thông tin thành công!');
                    setIsEditing(false);
                } else {
                    message.error(updateResult.message || 'Cập nhật thông tin thất bại!');
                }
            }
        } catch (error) {
            message.error('Cập nhật thông tin thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (userData) {
            form.setFieldsValue(userData);
            setAvatarUrl(userData.image || '');
        }
    };

    const handleAvatarChange = async (info: any) => {
        if (info.file.status === 'uploading') {
            message.loading('Đang upload hình ảnh...', 0);
            return;
        }

        if (info.file.status === 'done') {
            try {
                // Upload lên Cloudinary
                const uploadResult = await authenticationService.uploadImage(info.file.originFileObj);
                
                if (uploadResult.success && uploadResult.imageUrl) {
                    setAvatarUrl(uploadResult.imageUrl);
                    
                    // Cập nhật hình ảnh lên server
                    if (userData) {
                        const updateResult = await authenticationService.updateUserProfile({
                            ...userData,
                            image: uploadResult.imageUrl
                        });
                        
                        if (updateResult.success && updateResult.data) {
                            setUserData(updateResult.data);
                            updateUser(updateResult.data);
                            message.success('Cập nhật ảnh đại diện thành công!');
                        } else {
                            message.error(updateResult.message || 'Lỗi khi cập nhật thông tin');
                        }
                    }
                } else {
                    message.error(uploadResult.message || 'Lỗi khi upload hình ảnh');
                }
            } catch (error) {
                console.error('Upload error:', error);
                message.error('Lỗi khi upload hình ảnh');
            }
        }

        if (info.file.status === 'error') {
            message.error('Lỗi khi upload hình ảnh');
        }
    };

    const uploadProps = {
        name: 'avatar',
        showUploadList: false,
        beforeUpload: (file: any) => {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
                message.error('Chỉ được upload file JPG/PNG!');
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('Ảnh phải nhỏ hơn 2MB!');
            }
            return isJpgOrPng && isLt2M;
        },
        onChange: handleAvatarChange,
    };

    if (!userData) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>
                    <Text>Đang tải thông tin người dùng...</Text>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Avatar Section */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar 
                        size={120} 
                        src={avatarUrl}
                        icon={<UserOutlined />}
                        style={{ border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                    />
                    {isEditing && (
                        <Upload {...uploadProps}>
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<CameraOutlined />}
                                style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    right: '0',
                                    width: '36px',
                                    height: '36px'
                                }}
                            />
                        </Upload>
                    )}
                </div>
                <div style={{ marginTop: '16px' }}>
                    <Title level={3} style={{ margin: 0 }}>
                        {userData.firstName} {userData.lastName}
                    </Title>
                    <Text type="secondary">{userData.email}</Text>
                </div>
            </div>

            {/* Personal Information Form */}
            <Card 
                title="Thông tin cá nhân" 
                extra={
                    !isEditing ? (
                        <Button 
                            type="primary" 
                            icon={<EditOutlined />}
                            onClick={() => setIsEditing(true)}
                        >
                            Chỉnh sửa
                        </Button>
                    ) : (
                        <Space>
                            <Button onClick={handleCancel}>
                                Hủy
                            </Button>
                            <Button type="primary" onClick={handleSubmit} loading={loading}>
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
                    initialValues={userData}
                    disabled={!isEditing}
                >
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Tên đăng nhập"
                                name="username"
                            >
                                <Input 
                                    placeholder="Tên đăng nhập" 
                                    disabled={true}
                                    prefix={<UserOutlined />}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="Nhập email của bạn" />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Họ"
                                name="firstName"
                                rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
                            >
                                <Input placeholder="Nhập họ của bạn" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Tên"
                                name="lastName"
                                rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                            >
                                <Input placeholder="Nhập tên của bạn" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Số điện thoại"
                                name="phone"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                                ]}
                            >
                                <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Ngày sinh"
                                name="dob"
                            >
                                <Input prefix={<CalendarOutlined />} placeholder="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            {/* Quick Actions */}
            <Card title="Thao tác nhanh">
                <Row gutter={16}>
                    <Col xs={24} sm={8}>
                        <Button 
                            block 
                            icon={<EnvironmentOutlined />}
                            onClick={() => navigate('/profile/address')}
                            size="large"
                        >
                            Quản lý địa chỉ
                        </Button>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Button 
                            block 
                            icon={<ShoppingCartOutlined />}
                            onClick={() => navigate('/profile/order')}
                            size="large"
                        >
                            Xem đơn hàng
                        </Button>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Button 
                            block 
                            icon={<LockOutlined />}
                            onClick={() => navigate('/profile/changepassword')}
                            size="large"
                        >
                            Đổi mật khẩu
                        </Button>
                    </Col>
                </Row>
            </Card>
        </div>
    );
}