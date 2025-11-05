import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './sidebar';
import Header from './header';
import { useTheme } from '../hooks/useTheme';
import 'antd/dist/reset.css';
import '../styles/index.css';

const { Content } = Layout;

const DashboardLayout: React.FC = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Apply theme on dashboard load
    useTheme();

    const toggleSidebar = () => {
        setSidebarCollapsed(prev => !prev);
    };

    return (
        <>
            <style>
                {`
                    .dashboard-layout {
                        min-height: 100vh;
                        transition: margin-left 0.2s ease;
                    }
                    
                    .dashboard-content {
                        background: #f5f5f5;
                        min-height: calc(100vh - 64px);
                        overflow: auto;
                        position: relative;
                    }
                    
                    .dashboard-content-wrapper {
                        position: relative;
                        z-index: 1;
                        padding: 24px;
                    }
                `}
            </style>
            <Layout className="dashboard-layout" data-testid="dashboard-container">
                <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
                <Layout style={{ 
                    marginLeft: sidebarCollapsed ? 80 : 240, 
                    transition: 'margin-left 0.2s ease' 
                }}>
                    <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
                    <Content className="dashboard-content">
                        <div className="dashboard-content-wrapper">
                            <Outlet />
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </>
    );
};

export default DashboardLayout;
