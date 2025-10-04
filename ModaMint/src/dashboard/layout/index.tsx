import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './sidebar';
import Header from './header';
import { useTheme } from '../hooks/useTheme';
import 'antd/dist/reset.css';

const { Content } = Layout;

const DashboardLayout: React.FC = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Apply theme on dashboard load
    useTheme();

    const toggleSidebar = () => {
        setSidebarCollapsed(prev => !prev);
    };

    return (
        <Layout style={{ minHeight: '100vh' }} className="debug-theme-info" data-testid="dashboard-container">
            <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
            <Layout style={{ marginLeft: sidebarCollapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
                <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
                <Content
                    style={{
                        marginTop: 64,
                        padding: '24px',
                        background: '#f5f5f5',
                        minHeight: 'calc(100vh - 64px)',
                        overflow: 'auto',
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default DashboardLayout;
