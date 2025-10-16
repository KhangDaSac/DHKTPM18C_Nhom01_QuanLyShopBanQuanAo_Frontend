import React, { useState } from 'react';
import {
    Layout,
    Input,
    Badge,
    Avatar,
    Dropdown,
    Space,
    Button,
    Popover,
    List,
    Typography,
    Divider
} from 'antd';
import {
    SearchOutlined,
    BellOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
    MailOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { Search } = Input;
const { Text } = Typography;

interface HeaderProps {
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarCollapsed }) => {
    const navigate = useNavigate();
    const [notificationVisible, setNotificationVisible] = useState(false);

    // Mock notifications data
    const notifications = [
        {
            id: 1,
            title: 'Đơn hàng mới',
            message: 'Bạn có 3 đơn hàng mới cần xử lý',
            time: '5 phút trước',
            type: 'order'
        },
        {
            id: 2,
            title: 'Sản phẩm hết hàng',
            message: 'Áo thun cotton đã hết hàng',
            time: '1 giờ trước',
            type: 'warning'
        },
        {
            id: 3,
            title: 'Đánh giá mới',
            message: 'Sản phẩm "Quần jean" có đánh giá 5 sao mới',
            time: '2 giờ trước',
            type: 'review'
        }
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin cá nhân',
            onClick: () => navigate('/dashboard/profile')
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Cài đặt',
            onClick: () => navigate('/dashboard/settings')
        },
        {
            type: 'divider' as const
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true,
            onClick: () => {
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    ];

    const notificationContent = (
        <div style={{ width: 320, maxHeight: 400, overflow: 'auto' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                <Text strong>Thông báo</Text>
            </div>
            <List
                dataSource={notifications}
                renderItem={(item) => (
                    <List.Item
                        style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <List.Item.Meta
                            avatar={
                                <Avatar
                                    size="small"
                                    style={{
                                        backgroundColor: item.type === 'order' ? '#52c41a' :
                                            item.type === 'warning' ? '#faad14' : '#1677ff'
                                    }}
                                    icon={<MailOutlined />}
                                />
                            }
                            title={
                                <Text strong style={{ fontSize: '13px' }}>
                                    {item.title}
                                </Text>
                            }
                            description={
                                <div>
                                    <Text style={{ fontSize: '12px', color: '#666' }}>
                                        {item.message}
                                    </Text>
                                    <div>
                                        <Text style={{ fontSize: '11px', color: '#999' }}>
                                            {item.time}
                                        </Text>
                                    </div>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
            <Divider style={{ margin: 0 }} />
            <div style={{ padding: '8px 16px', textAlign: 'center' }}>
                <Button type="link" size="small">
                    Xem tất cả thông báo
                </Button>
            </div>
        </div>
    );

    const onSearch = (value: string) => {
        console.log('Search:', value);
        // Implement search functionality
    };

    return (
        <AntHeader
            style={{
                position: 'fixed',
                top: 0,
                right: 0,
                left: sidebarCollapsed ? 80 : 240,
                zIndex: 999,
                padding: '0 24px',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'left 0.2s',
                height: 64,
            }}
        >
            {/* Search Bar */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', maxWidth: 600 }}>
                <Search
                    placeholder="Tìm kiếm sản phẩm, đơn hàng..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="middle"
                    onSearch={onSearch}
                    style={{ width: '100%', maxWidth: 400 }}
                />
            </div>

            {/* Right Side Actions */}
            <Space size="middle">
                {/* Notifications */}
                <Popover
                    content={notificationContent}
                    title={null}
                    trigger="click"
                    placement="bottomRight"
                    open={notificationVisible}
                    onOpenChange={setNotificationVisible}
                >
                    <Badge count={notifications.length} size="small">
                        <Button
                            type="text"
                            icon={<BellOutlined style={{ fontSize: '18px' }} />}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 40,
                                height: 40,
                            }}
                        />
                    </Badge>
                </Popover>

                {/* User Menu */}
                <Dropdown
                    menu={{ items: userMenuItems }}
                    placement="bottomRight"
                    trigger={['click']}
                >
                    <Space style={{ cursor: 'pointer', padding: '8px' }}>
                        <Avatar
                            size={32}
                            style={{ backgroundColor: '#1677ff' }}
                            icon={<UserOutlined />}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Text strong style={{ fontSize: '13px', lineHeight: 1.2 }}>
                                Admin User
                            </Text>
                            <Text style={{ fontSize: '11px', color: '#666', lineHeight: 1.2 }}>
                                Quản trị viên
                            </Text>
                        </div>
                    </Space>
                </Dropdown>
            </Space>
        </AntHeader>
    );
};

export default Header;
