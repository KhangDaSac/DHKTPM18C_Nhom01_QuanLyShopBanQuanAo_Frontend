import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Divider, Button, Space } from 'antd';
import ThemeDropdown from '../../components/theme-dropdown';
import { forceThemeNuclear } from '../../utils/themeUtils';

const { Title, Text } = Typography;

const Settings: React.FC = () => {
    const [currentTheme, setCurrentTheme] = useState('modamint');

    useEffect(() => {
        const theme = localStorage.getItem('dashboard-theme') || 'modamint';
        setCurrentTheme(theme);
    }, []);

    const testTheme = (themeName: string) => {
        console.log('🚀 NUCLEAR Switching to theme:', themeName);
        forceThemeNuclear(themeName);
        setCurrentTheme(themeName);
    };

    return (
        <div>
            <Title level={2} className="text-primary" style={{ marginBottom: '24px' }}>
                Cài đặt (Theme: {currentTheme})
            </Title>

            <Row gutter={[16, 16]}>
                {/* Giao diện */}
                <Col xs={24} lg={12}>
                    <Card title="Giao diện" bordered={false}>
                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>Theme màu sắc</Text>
                            <div style={{ marginTop: '8px' }}>
                                <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '12px' }}>
                                    Test theme switching (check console for logs):
                                </Text>
                                <Space wrap>
                                    <Button onClick={() => testTheme('light')} type={currentTheme === 'light' ? 'primary' : 'default'}>Light (Purple)</Button>
                                    <Button onClick={() => testTheme('dark')} type={currentTheme === 'dark' ? 'primary' : 'default'}>Dark (Dark Purple)</Button>
                                    <Button onClick={() => testTheme('cupcake')} type={currentTheme === 'cupcake' ? 'primary' : 'default'}>Cupcake (Teal)</Button>
                                    <Button onClick={() => testTheme('modamint')} type={currentTheme === 'modamint' ? 'primary' : 'default'}>ModaMint (Orange)</Button>
                                </Space>
                                <div style={{ marginTop: '12px' }}>
                                    <Button onClick={() => {
                                        // Extreme force test
                                        const title = document.querySelector('.text-primary') as HTMLElement;
                                        if (title) {
                                            // Remove all existing styles and classes
                                            title.removeAttribute('style');
                                            title.style.cssText = 'color: #00ff00 !important; font-weight: bold;';
                                            console.log('FORCED GREEN color applied');
                                        }
                                    }}>FORCE GREEN</Button>

                                    <Button onClick={() => {
                                        // Test Light theme force
                                        const title = document.querySelector('.text-primary') as HTMLElement;
                                        if (title) {
                                            title.style.cssText = 'color: #570df8 !important; font-weight: bold;';
                                            console.log('FORCED LIGHT PURPLE applied');
                                        }
                                    }} style={{ marginLeft: '8px' }}>FORCE LIGHT PURPLE</Button>
                                </div>
                                <div style={{ marginTop: '12px' }}>
                                    <ThemeDropdown />
                                </div>
                            </div>
                        </div>

                        <Divider />

                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>Ngôn ngữ</Text>
                            <div style={{ marginTop: '8px' }}>
                                <Text type="secondary" style={{ fontSize: '14px' }}>
                                    Tiếng Việt (mặc định)
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Tài khoản */}
                <Col xs={24} lg={12}>
                    <Card title="Tài khoản" bordered={false}>
                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>Thông tin cá nhân</Text>
                            <div style={{ marginTop: '8px' }}>
                                <Text type="secondary" style={{ fontSize: '14px' }}>
                                    Admin User - Quản trị viên
                                </Text>
                            </div>
                        </div>

                        <Divider />

                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>Bảo mật</Text>
                            <div style={{ marginTop: '8px' }}>
                                <Text type="secondary" style={{ fontSize: '14px' }}>
                                    Đổi mật khẩu, xác thực 2 yếu tố
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Thông báo */}
                <Col xs={24} lg={12}>
                    <Card title="Thông báo" bordered={false}>
                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>Email thông báo</Text>
                            <div style={{ marginTop: '8px' }}>
                                <Text type="secondary" style={{ fontSize: '14px' }}>
                                    Nhận thông báo về đơn hàng mới, sản phẩm hết hàng
                                </Text>
                            </div>
                        </div>

                        <Divider />

                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>Push notifications</Text>
                            <div style={{ marginTop: '8px' }}>
                                <Text type="secondary" style={{ fontSize: '14px' }}>
                                    Thông báo trên trình duyệt
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Hệ thống */}
                <Col xs={24} lg={12}>
                    <Card title="Hệ thống" bordered={false}>
                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>Sao lưu dữ liệu</Text>
                            <div style={{ marginTop: '8px' }}>
                                <Text type="secondary" style={{ fontSize: '14px' }}>
                                    Tự động sao lưu hàng ngày lúc 2:00 AM
                                </Text>
                            </div>
                        </div>

                        <Divider />

                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>Phiên bản</Text>
                            <div style={{ marginTop: '8px' }}>
                                <Text type="secondary" style={{ fontSize: '14px' }}>
                                    ModaMint Dashboard v1.0.0
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Settings;