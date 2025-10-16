import React from 'react';
import {
    DashboardOutlined,
    ShoppingOutlined,
    AppstoreOutlined,
    ShoppingCartOutlined,
    GiftOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
    TeamOutlined,
    ShopOutlined,
} from '@ant-design/icons';

export interface SidebarLink {
    key: string;
    label: string;
    path: string;
    icon: React.ReactNode;
}

export const DASHBOARD_SIDEBAR_LINKS: SidebarLink[] = [
    {
        key: 'dashboard',
        label: 'Tổng Quan',
        path: '/dashboard',
        icon: <DashboardOutlined />,
    },
    {
        key: 'products',
        label: 'Sản Phẩm',
        path: '/dashboard/products',
        icon: <ShoppingOutlined />,
    },
    {
        key: 'customers',
        label: 'Khách Hàng',
        path: '/dashboard/customers',
        icon: <TeamOutlined />,
    },
    {
        key: 'categories',
        label: 'Danh Mục Sản Phẩm',
        path: '/dashboard/categories',
        icon: <AppstoreOutlined />,
    },
    {
        key: 'orders',
        label: 'Đơn Hàng',
        path: '/dashboard/orders',
        icon: <ShoppingCartOutlined />,
    },
    {
        key: 'promotions',
        label: 'Khuyến Mãi',
        path: '/dashboard/promotions',
        icon: <GiftOutlined />,
    },
    {
        key: 'roles',
        label: 'Phân Quyền',
        path: '/dashboard/roles',
        icon: <UserOutlined />,
    },
    {
        key: 'stores',
        label: 'Cửa Hàng',
        path: '/dashboard/stores',
        icon: <ShopOutlined />,
    },
];

export const DASHBOARD_SIDEBAR_BOTTOM_LINKS: SidebarLink[] = [
    {
        key: 'settings',
        label: 'Cài Đặt',
        path: '/dashboard/settings',
        icon: <SettingOutlined />,
    },
    {
        key: 'logout',
        label: 'Đăng Xuất',
        path: '/logout',
        icon: <LogoutOutlined />,
    },
];