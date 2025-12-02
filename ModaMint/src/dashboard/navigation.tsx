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
    PercentageOutlined,
    DollarOutlined,
    TagsOutlined,
} from '@ant-design/icons';

export interface SidebarLink {
    key: string;
    label: string;
    path: string;
    icon: React.ReactNode;
    children?: SidebarLink[];
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
        key: 'brands',
        label: 'Thương Hiệu',
        path: '/dashboard/brands',
        icon: <TagsOutlined />,
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
        children: [
            {
                key: 'promotions-percentage',
                label: 'Khuyến Mãi Theo %',
                path: '/dashboard/promotions/percentage',
                icon: <PercentageOutlined />,
            },
            {
                key: 'promotions-fixed',
                label: 'Khuyến Mãi Theo Giá',
                path: '/dashboard/promotions/fixed',
                icon: <DollarOutlined />,
            },
        ],
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
        key: 'profile',
        label: 'Thông tin cá nhân',
        path: '/dashboard/profile',
        icon: <UserOutlined />,
    },
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