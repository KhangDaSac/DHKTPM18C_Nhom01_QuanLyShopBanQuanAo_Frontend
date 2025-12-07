/**
 * Sales Analytics Page (Lazy Loading Version)
 * 
 * EXAMPLE: Sử dụng lazy loading để tối ưu hiệu năng
 * - React.lazy cho chart components
 * - Suspense với LoadingChart skeleton
 * - Conditional rendering dựa trên tab active
 * - Cleanup on unmount
 * 
 * Performance: Chỉ load chart khi cần thiết, giảm bundle size
 */

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Spin, Alert } from 'antd';
import LoadingChart from '../../components/charts/LoadingChart';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy load chart components - chỉ load khi cần
const SalesLast30Days = lazy(() => import('../../components/charts/SalesLast30Days'));
const SalesByMonth = lazy(() => import('../../components/charts/SalesByMonth'));

interface SalesAnalyticsWithLazyProps {
    className?: string;
}

/**
 * SalesAnalyticsWithLazy Component
 * 
 * DEMO: Lazy loading charts với React.lazy và Suspense
 * - Tab switching để chỉ render chart đang active
 * - LoadingChart skeleton cho loading state
 * - Error boundary cho error handling
 */
const SalesAnalyticsWithLazy: React.FC<SalesAnalyticsWithLazyProps> = ({ className = '' }) => {
    const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');
    const [loading, setLoading] = useState(false);
    const [tabLoading, setTabLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Simulate loading khi chuyển tab
    const handleTabChange = (tab: 'daily' | 'monthly') => {
        if (tab === activeTab) return;

        setTabLoading(true);
        setActiveTab(tab);

        // Simulate API call delay
        setTimeout(() => {
            setTabLoading(false);
        }, 500);
    };

    // Demo data - 30 days
    const dailyData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
            date: date.toISOString().split('T')[0],
            revenue: Math.floor(Math.random() * 20000000) + 5000000,
            orders: Math.floor(Math.random() * 50) + 10
        };
    });

    // Demo data - 12 months
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        return {
            month: `T${date.getMonth() + 1} ${date.getFullYear()}`,
            revenue: Math.floor(Math.random() * 300000000) + 100000000,
            orders: Math.floor(Math.random() * 800) + 200
        };
    });

    return (
        <div className={className} style={{ margin: 0, padding: 0 }}>
            {/* Tab Selector */}
            <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '24px',
                borderBottom: '2px solid #e2e8f0',
                paddingBottom: '12px'
            }}>
                <button
                    onClick={() => handleTabChange('daily')}
                    disabled={tabLoading}
                    style={{
                        padding: '8px 16px',
                        border: 'none',
                        background: activeTab === 'daily' ? '#2563eb' : 'transparent',
                        color: activeTab === 'daily' ? '#fff' : '#64748b',
                        borderRadius: '6px',
                        cursor: tabLoading ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                        fontSize: '14px',
                        transition: 'all 0.2s',
                        opacity: tabLoading ? 0.6 : 1
                    }}
                >
                    Doanh số 30 ngày
                </button>
                <button
                    onClick={() => handleTabChange('monthly')}
                    disabled={tabLoading}
                    style={{
                        padding: '8px 16px',
                        border: 'none',
                        background: activeTab === 'monthly' ? '#2563eb' : 'transparent',
                        color: activeTab === 'monthly' ? '#fff' : '#64748b',
                        borderRadius: '6px',
                        cursor: tabLoading ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                        fontSize: '14px',
                        transition: 'all 0.2s',
                        opacity: tabLoading ? 0.6 : 1
                    }}
                >
                    Doanh số theo tháng
                </button>
            </div>

            {/* Error State */}
            {error && (
                <Alert
                    message="Lỗi tải dữ liệu"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            {/* Loading State */}
            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                </div>
            )}

            {/* Charts with Lazy Loading */}
            {!loading && !error && (
                <>
                    {/* Tab Loading Overlay */}
                    {tabLoading && (
                        <div style={{
                            background: '#fff',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            marginBottom: '32px',
                            minHeight: '450px'
                        }}>
                            <LoadingSpinner tip="Đang tải dữ liệu..." size="large" />
                        </div>
                    )}

                    {/* Daily Chart - chỉ render khi tab active và không loading */}
                    {!tabLoading && activeTab === 'daily' && (
                        <div style={{
                            background: '#fff',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            marginBottom: '32px'
                        }}>
                            <div style={{ marginBottom: '16px' }}>
                                <h2 style={{
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: '#1e293b',
                                    margin: 0
                                }}>
                                    Doanh số 30 ngày gần nhất
                                </h2>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#64748b',
                                    margin: '4px 0 0 0'
                                }}>
                                    Theo dõi doanh thu và số đơn hàng theo ngày
                                </p>
                            </div>
                            {/* Suspense với LoadingChart skeleton */}
                            <Suspense fallback={<LoadingChart height={350} />}>
                                <SalesLast30Days data={dailyData} loading={false} />
                            </Suspense>
                        </div>
                    )}

                    {/* Monthly Chart - chỉ render khi tab active và không loading */}
                    {!tabLoading && activeTab === 'monthly' && (
                        <div style={{
                            background: '#fff',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            marginBottom: '32px'
                        }}>
                            <div style={{ marginBottom: '16px' }}>
                                <h2 style={{
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: '#1e293b',
                                    margin: 0
                                }}>
                                    Doanh số theo tháng
                                </h2>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#64748b',
                                    margin: '4px 0 0 0'
                                }}>
                                    So sánh doanh thu và đơn hàng theo tháng
                                </p>
                            </div>
                            {/* Suspense với LoadingChart skeleton */}
                            <Suspense fallback={<LoadingChart height={350} />}>
                                <SalesByMonth data={monthlyData} loading={false} />
                            </Suspense>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SalesAnalyticsWithLazy;
