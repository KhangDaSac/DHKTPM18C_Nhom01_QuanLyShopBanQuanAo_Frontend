import React from 'react';
import { Layout, Menu, Button, Avatar, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { DASHBOARD_SIDEBAR_LINKS, DASHBOARD_SIDEBAR_BOTTOM_LINKS } from '../../navigation';
import './style.css';

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
    collapsed: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleMenuClick = (path: string) => {
        if (path === '/logout') {
            // Handle logout logic
            localStorage.removeItem('token');
            navigate('/login');
        } else {
            navigate(path);
        }
    };

    const topMenuItems = DASHBOARD_SIDEBAR_LINKS.map(link => ({
        key: link.key,
        icon: link.icon,
        label: link.label,
        onClick: () => handleMenuClick(link.path),
    }));

    const bottomMenuItems = DASHBOARD_SIDEBAR_BOTTOM_LINKS.map(link => ({
        key: link.key,
        icon: link.icon,
        label: link.label,
        onClick: () => handleMenuClick(link.path),
        danger: link.key === 'logout',
    }));

    const getSelectedKey = () => {
        const path = location.pathname;
        // Chỉ highlight menu item khi đang ở đúng trang đó
        if (path === '/dashboard') return 'dashboard';
        if (path === '/dashboard/products') return 'products';
        if (path === '/dashboard/categories') return 'categories';
        if (path === '/dashboard/orders') return 'orders';
        if (path === '/dashboard/promotions') return 'promotions';
        if (path === '/dashboard/permissions') return 'permissions';
        if (path === '/dashboard/settings') return 'settings';
        // Không trả về gì khi không ở trang nào cụ thể
        return '';
    };

    return (
        <div className="modamint-sidebar bg-primary">
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={240}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 1000,
                    background: 'linear-gradient(135deg, #ff6347 0%, #ff7f50 100%)',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
                }}
            >
                {/* Logo Section */}
                <div style={{
                    height: 64,
                    padding: collapsed ? '16px 8px' : '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                    flexDirection: collapsed ? 'column' : 'row',
                    gap: collapsed ? '8px' : '0',
                }}>
                    {collapsed ? (
                        // Logo khi collapsed - chỉ hiển thị avatar và button toggle theo chiều dọc
                        <>
                            <Avatar
                                size={24}
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}
                            >
                                MM
                            </Avatar>
                            <Button
                                type="text"
                                icon={<MenuUnfoldOutlined />}
                                onClick={toggleSidebar}
                                size="small"
                                style={{
                                    fontSize: '14px',
                                    width: 24,
                                    height: 24,
                                    color: 'white',
                                    padding: 0,
                                    minWidth: 'auto',
                                }}
                            />
                        </>
                    ) : (
                        // Logo khi expanded - hiển thị đầy đủ
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Avatar
                                    size={32}
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    MM
                                </Avatar>
                                <Text strong style={{ color: 'white', fontSize: '16px' }}>
                                    ModaMint
                                </Text>
                            </div>
                            <Button
                                type="text"
                                icon={<MenuFoldOutlined />}
                                onClick={toggleSidebar}
                                style={{
                                    fontSize: '16px',
                                    width: 32,
                                    height: 32,
                                    color: 'white',
                                }}
                            />
                        </>
                    )}
                </div>

                {/* Top Menu */}
                <div style={{ flex: 1, paddingTop: '16px' }}>
                    <Menu
                        mode="inline"
                        selectedKeys={[getSelectedKey()]}
                        items={topMenuItems}
                        style={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: 'white'
                        }}
                    />
                </div>

                {/* Bottom Menu */}
                <div style={{ marginTop: 'auto', paddingBottom: '16px' }}>
                    <Menu
                        mode="inline"
                        selectedKeys={[getSelectedKey()]}
                        items={bottomMenuItems}
                        style={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: 'white'
                        }}
                    />
                </div>
            </Sider>
        </div>
    );
};

export default Sidebar;
