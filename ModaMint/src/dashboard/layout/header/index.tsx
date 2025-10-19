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
import { useAuth } from '../../../contexts/authContext';
import { toast } from 'react-toastify';

const { Header: AntHeader } = Layout;
const { Search } = Input;
const { Text } = Typography;

interface HeaderProps {
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarCollapsed }) => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
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

    // Hàm xử lý đăng xuất
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Có lỗi xảy ra khi đăng xuất!');
        }
    };

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin cá nhân',
            onClick: () => navigate('/profile')
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
            onClick: handleLogout
        }
    ];

    const notificationContent = (
        <div style={{ width: '300px', maxHeight: '400px', overflow: 'auto' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                <Text strong>Thông báo</Text>
            </div>
            <List
                dataSource={notifications}
                renderItem={(item) => (
                    <List.Item style={{ padding: '12px 16px' }}>
                        <List.Item.Meta
                            avatar={
                                <Avatar
                                    size="small"
                                    style={{
                                        backgroundColor: item.type === 'warning' ? '#faad14' : 
                                                       item.type === 'review' ? '#52c41a' : '#1890ff'
                                    }}
                                    icon={<MailOutlined />}
                                />
                            }
                            title={<Text style={{ fontSize: '14px' }}>{item.title}</Text>}
                            description={
                                <div>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {item.message}
                                    </Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: '11px' }}>
                                        {item.time}
                                    </Text>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
        </div>
    );

    return (
        <>
            <style>
                {`
                    .dashboard-header {
                        padding: 0 24px;
                        background: #ffffff;
                        border-bottom: 1px solid #f0f0f0;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        position: fixed;
                        top: 0;
                        right: 0;
                        z-index: 1000;
                        transition: left 0.2s ease;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                    }
                    
                    .header-search {
                        flex: 1;
                        max-width: 400px;
                    }
                    
                    .header-actions {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                    }
                    
                    .header-button {
                        transition: background-color 0.15s ease;
                        border-radius: 6px;
                    }
                    
                    .header-button:hover {
                        background-color: rgba(0, 0, 0, 0.06);
                    }
                    
                    .header-user-menu {
                        transition: background-color 0.15s ease;
                        border-radius: 6px;
                        padding: 4px 8px;
                    }
                    
                    .header-user-menu:hover {
                        background-color: rgba(24, 144, 255, 0.1);
                    }
                `}
            </style>
            <AntHeader
                className="dashboard-header"
                style={{
                    left: sidebarCollapsed ? '80px' : '240px',
                }}
            >
            {/* Search Bar */}
            <div className="header-search">
                <Search
                    placeholder="Tìm kiếm sản phẩm, đơn hàng..."
                    allowClear
                    style={{ width: '100%' }}
                />
            </div>

            {/* Right Side Actions */}
            <div className="header-actions">
                {/* Notifications */}
                <Popover
                    content={notificationContent}
                    title={null}
                    trigger="click"
                    open={notificationVisible}
                    onOpenChange={setNotificationVisible}
                    placement="bottomRight"
                >
                    <Badge count={notifications.length} size="small">
                        <Button
                            type="text"
                            icon={<BellOutlined />}
                            className="header-button"
                            style={{ fontSize: '16px' }}
                        />
                    </Badge>
                </Popover>

                {/* User Menu */}
                <Dropdown
                    menu={{ items: userMenuItems }}
                    placement="bottomRight"
                    trigger={['click']}
                >
                    <Space className="header-user-menu" style={{ cursor: 'pointer' }}>
                        <Avatar
                            size="small"
                            icon={<UserOutlined />}
                            style={{ backgroundColor: '#1890ff' }}
                        />
                        <Text strong>{user?.username || 'Admin'}</Text>
                    </Space>
                </Dropdown>
            </div>
        </AntHeader>
        </>
    );
};

export default Header;