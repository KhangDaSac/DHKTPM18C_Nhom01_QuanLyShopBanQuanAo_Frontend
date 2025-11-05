import React from 'react';
import { Layout, Menu, Button, Avatar, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { DASHBOARD_SIDEBAR_LINKS, DASHBOARD_SIDEBAR_BOTTOM_LINKS } from '../../navigation';
import { useAuth } from '../../../contexts/authContext';
import { toast } from 'react-toastify';
import styles from './style.module.css';

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
    collapsed: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [openSubmenus, setOpenSubmenus] = React.useState<string[]>([]);

    // Tự động đóng/mở submenu promotions dựa trên URL
    React.useEffect(() => {
        if (location.pathname.startsWith('/dashboard/promotions')) {
            if (!openSubmenus.includes('promotions')) {
                setOpenSubmenus(['promotions']);
            }
        } else {
            if (openSubmenus.includes('promotions')) {
                setOpenSubmenus([]);
            }
        }
    }, [location.pathname]);

    const handleMenuClick = async (path: string) => {
        if (path === '/logout') {
            try {
                await logout();
                // Redirect được xử lý trong logout() của authContext
            } catch (error) {
                console.error('Logout error:', error);
                toast.error('Có lỗi xảy ra khi đăng xuất!');
            }
        } else {
            navigate(path);
        }
    };

    const topMenuItems = DASHBOARD_SIDEBAR_LINKS.map(link => {
        if (link.children && link.children.length > 0) {
            return {
                key: link.key,
                icon: link.icon,
                label: link.label,
                children: link.children.map(child => ({
                    key: child.key,
                    icon: child.icon,
                    label: child.label,
                    onClick: () => handleMenuClick(child.path),
                })),
            };
        }
        return {
            key: link.key,
            icon: link.icon,
            label: link.label,
            onClick: () => handleMenuClick(link.path),
        };
    });

    const bottomMenuItems = DASHBOARD_SIDEBAR_BOTTOM_LINKS.map(link => ({
        key: link.key,
        icon: link.icon,
        label: link.label,
        onClick: () => handleMenuClick(link.path),
        danger: link.key === 'logout',
    }));

    const getSelectedKey = () => {
        const path = location.pathname;
        
        // Kiểm tra chính xác path trước
        if (path === '/dashboard') return ['dashboard'];
        if (path.startsWith('/dashboard/products') && !path.includes('/products/')) return ['products'];
        if (path.startsWith('/dashboard/categories')) return ['categories'];
        if (path.startsWith('/dashboard/orders')) return ['orders'];
        
        // Kiểm tra promotions submenu trước khi kiểm tra promotions chung
        if (path === '/dashboard/promotions/percentage' || path.startsWith('/dashboard/promotions/percentage')) {
            return ['promotions-percentage'];
        }
        if (path === '/dashboard/promotions/fixed' || path.startsWith('/dashboard/promotions/fixed')) {
            return ['promotions-fixed'];
        }
        if (path === '/dashboard/promotions' || path.startsWith('/dashboard/promotions')) {
            return ['promotions'];
        }
        
        if (path.startsWith('/dashboard/roles')) return ['roles'];
        if (path.startsWith('/dashboard/stores')) return ['stores'];
        if (path.startsWith('/dashboard/settings')) return ['settings'];
        if (path.startsWith('/dashboard/profile')) return ['profile'];
        if (path.startsWith('/dashboard/customers')) return ['customers'];
        
        return [];
    };

    return (
        <>
            <style>
                {`
                    .sidebar-menu .ant-menu-item {
                        color: rgba(255, 255, 255, 0.85) !important;
                        transition: background-color 0.15s ease !important;
                        border-radius: 6px !important;
                        margin: 2px 8px !important;
                    }
                    
                    .sidebar-menu .ant-menu-item:hover {
                        color: #ffffff !important;
                        background-color: rgba(255, 255, 255, 0.1) !important;
                    }
                    
                    .sidebar-menu .ant-menu-item-selected {
                        color: #ffffff !important;
                        background-color: rgba(255, 255, 255, 0.2) !important;
                        font-weight: 600 !important;
                    }
                    
                    .sidebar-menu .ant-menu-item-selected::after {
                        border-right: 3px solid #ffffff !important;
                    }
                    
                    .sidebar-menu .ant-menu-item-icon {
                        color: rgba(255, 255, 255, 0.85) !important;
                    }
                    
                    .sidebar-menu .ant-menu-item-selected .ant-menu-item-icon {
                        color: #ffffff !important;
                    }
                    
                    .sidebar-menu .ant-menu-item-danger {
                        color: rgba(255, 255, 255, 0.85) !important;
                    }
                    
                    .sidebar-menu .ant-menu-item-danger:hover {
                        color: #ff4d4f !important;
                        background-color: rgba(255, 77, 79, 0.1) !important;
                    }

                    .sidebar-menu .ant-menu-submenu-title {
                        color: rgba(255, 255, 255, 0.85) !important;
                        transition: all 0.2s ease !important;
                        border-radius: 6px !important;
                        margin: 2px 8px !important;
                    }

                    .sidebar-menu .ant-menu-submenu-title:hover {
                        color: #ffffff !important;
                        background: linear-gradient(90deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05)) !important;
                    }

                    .sidebar-menu .ant-menu-submenu-open > .ant-menu-submenu-title {
                        color: #ffffff !important;
                        background: linear-gradient(90deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1)) !important;
                    }

                    .sidebar-menu .ant-menu-sub {
                        background: rgba(255, 255, 255, 0.08) !important;
                        border-radius: 8px !important;
                        margin: 4px 8px !important;
                        padding: 4px 0 !important;
                    }

                    .sidebar-menu .ant-menu-sub .ant-menu-item {
                        color: rgba(255, 255, 255, 0.75) !important;
                        margin: 0px 4px 2px 4px !important;
                        padding-left: 40px !important;
                        border-radius: 6px !important;
                        transition: all 0.2s ease !important;
                        background: transparent !important;
                    }

                    .sidebar-menu .ant-menu-sub .ant-menu-item:hover {
                        color: #ffffff !important;
                        background: rgba(255, 255, 255, 0.2) !important;
                    }

                    .sidebar-menu .ant-menu-sub .ant-menu-item-selected {
                        color: #ffffff !important;
                        background: rgba(255, 255, 255, 0.3) !important;
                        font-weight: 600 !important;
                        border-left: 3px solid #ffffff !important;
                    }

                    .sidebar-menu .ant-menu-sub .ant-menu-item-icon {
                        color: rgba(255, 255, 255, 0.75) !important;
                    }

                    .sidebar-menu .ant-menu-sub .ant-menu-item-selected .ant-menu-item-icon {
                        color: #ffffff !important;
                    }
                `}
            </style>
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
                    background: 'linear-gradient(135deg, #ff6347 0%, #ff7f50 100%)',
                }}
            >
            {/* Logo Section */}
            <div style={{
                height: '64px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
                {collapsed ? (
                    <>
                        <Avatar size={24} style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                            MM
                        </Avatar>
                        <Button
                            type="text"
                            icon={<MenuUnfoldOutlined />}
                            onClick={toggleSidebar}
                            size="small"
                            style={{ color: 'white' }}
                        />
                    </>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Avatar size={32} style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
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
                            style={{ color: 'white' }}
                        />
                    </>
                )}
            </div>

            {/* Top Menu */}
            <div style={{ flex: 1, paddingTop: '16px' }}>
                <Menu
                    mode="inline"
                    selectedKeys={getSelectedKey()}
                    openKeys={openSubmenus}
                    onOpenChange={(keys) => setOpenSubmenus(keys)}
                    items={topMenuItems}
                    className="sidebar-menu"
                    style={{
                        background: 'transparent',
                        border: 'none',
                    }}
                    theme="dark"
                />
            </div>

            {/* Bottom Menu */}
            <div style={{ marginTop: 'auto', paddingBottom: '16px' }}>
                <Menu
                    mode="inline"
                    selectedKeys={getSelectedKey()}
                    items={bottomMenuItems}
                    className="sidebar-menu"
                    style={{
                        background: 'transparent',
                        border: 'none',
                    }}
                    theme="dark"
                />
            </div>
        </Sider>
        </>
    );
};

export default Sidebar;
