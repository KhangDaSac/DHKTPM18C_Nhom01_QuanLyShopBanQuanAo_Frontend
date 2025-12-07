/**
 * Sales Analytics Component
 * Dashboard Doanh Số - High-End Modern Style
 * 
 * Style: Stripe, Shopify, Binance Dashboard
 * Layout: Full container (margin: 0, padding: 0), vertical stack
 * Display: 2 charts hiển thị cùng lúc (không có tabs)
 */

import React from 'react';
import { Spin, Alert } from 'antd';
import ChartCard from '../../components/layout/ChartCard';
import SalesLast30Days from '../../components/charts/SalesLast30Days';
import SalesByMonth from '../../components/charts/SalesByMonth';
import type { DailySalesData, MonthlySalesData } from '../../services/analytics/index';

interface SalesAnalyticsProps {
    dailySales: DailySalesData[];
    monthlySales: MonthlySalesData[];
    loading: boolean;
    error: string | null;
}

const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({
    dailySales,
    monthlySales,
    loading,
    error
}) => {
    // ============================================================
    // LOADING & ERROR STATES
    // ============================================================
    if (loading) {
        return (
            <div style={{ margin: 0, padding: 0 }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '500px'
                }}>
                    <Spin size="large" tip="Đang tải dữ liệu doanh số..." />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ margin: 0, padding: 0 }}>
                <Alert
                    message="Lỗi tải dữ liệu"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: '16px' }}
                />
            </div>
        );
    }

    // ============================================================
    // RENDER UI - VERTICAL STACK (2 CHARTS)
    // ============================================================
    return (
        <div style={{ margin: 0, padding: 0 }}>
            {/* Line Chart - Doanh số 30 ngày gần nhất */}
            <ChartCard
                title="Doanh số 30 ngày gần nhất"
                subtitle="Theo dõi xu hướng doanh thu và số lượng đơn hàng theo ngày"
            >
                <SalesLast30Days data={dailySales} loading={false} />
            </ChartCard>

            {/* Column Chart - Doanh số theo tháng */}
            <ChartCard
                title="Doanh số theo tháng"
                subtitle="So sánh hiệu suất kinh doanh giữa các tháng"
            >
                <SalesByMonth data={monthlySales} loading={false} />
            </ChartCard>
        </div>
    );
};

export default SalesAnalytics;
