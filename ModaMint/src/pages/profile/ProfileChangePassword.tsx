import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Form,
    Input,
    Button,
    Space,
    Typography,
    message
} from 'antd';
import {
    LockOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    LeftOutlined
} from '@ant-design/icons';

const { Title } = Typography;

export default function ProfileChangePassword() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handlePasswordChange = async () => {
        setLoading(true);
        try {
            const values = await form.validateFields();
            
            // Mock password change
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            message.success('Đổi mật khẩu thành công!');
            form.resetFields();
        } catch (error) {
            message.error('Đổi mật khẩu thất bại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <Button 
                    icon={<LeftOutlined />} 
                    onClick={() => navigate('/profile')}
                    style={{ marginBottom: '16px' }}
                >
                    Quay lại
                </Button>
                <Title level={2}>Đổi mật khẩu</Title>
            </div>

            {/* Password Change Form */}
            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handlePasswordChange}
                >
                    <Form.Item
                        label="Mật khẩu hiện tại"
                        name="currentPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu hiện tại"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                            { 
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
                                message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số!' 
                            }
                        ]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu mới"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined />}
                            placeholder="Nhập lại mật khẩu mới"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Đổi mật khẩu
                            </Button>
                            <Button onClick={() => navigate('/profile')}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            {/* Security Tips */}
            <Card title="Mẹo bảo mật" style={{ marginTop: '24px' }}>
                <ul style={{ paddingLeft: '20px' }}>
                    <li>Mật khẩu nên có ít nhất 8 ký tự</li>
                    <li>Sử dụng kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                    <li>Không sử dụng thông tin cá nhân trong mật khẩu</li>
                    <li>Không chia sẻ mật khẩu với người khác</li>
                    <li>Thay đổi mật khẩu định kỳ</li>
                </ul>
            </Card>
        </div>
    );
}
