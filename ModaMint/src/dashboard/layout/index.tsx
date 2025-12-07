import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './sidebar';
import Header from './header';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '../hooks/useTheme';
import 'antd/dist/reset.css';
import '../styles/index.css';

const { Content } = Layout;

const DashboardLayout: React.FC = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const location = useLocation();

    // Apply theme on dashboard load
    useTheme();

    // Handle route change với loading effect
    useEffect(() => {
        setPageLoading(true);

        // Simulate loading - 1 giây
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [location.pathname]);

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
                            {pageLoading ? (
                                <div style={{
                                    minHeight: '500px',
                                    background: '#fff',
                                    borderRadius: '8px',
                                    padding: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <LoadingSpinner
                                        tip="Đang tải dữ liệu..."
                                        size="large"
                                    />
                                </div>
                            ) : (
                                <Outlet />
                            )}
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </>
    );
};

export default DashboardLayout;
