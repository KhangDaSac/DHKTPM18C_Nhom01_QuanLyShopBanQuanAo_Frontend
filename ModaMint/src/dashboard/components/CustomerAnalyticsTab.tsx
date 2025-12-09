import React from 'react';
import { Card, Statistic, Row, Col, Typography } from 'antd';
import { UserOutlined, UserAddOutlined, UserSwitchOutlined, UserDeleteOutlined } from '@ant-design/icons';
import { useCustomerAnalytics } from '../hooks/useCustomerAnalytics';
import CustomerNewDailyChart from './CustomerNewDailyChart';
import CustomerTopSpendersChart from './CustomerTopSpendersChart';

const { Text } = Typography;

const CustomerAnalyticsTab: React.FC = () => {
    const {
        summary,
        newCustomersDaily,
        segmentation,
        topSpenders,
        summaryLoading,
        newCustomersLoading,
        segmentationLoading,
        topSpendersLoading,
        summaryError,
        newCustomersError,
        segmentationError,
        topSpendersError,
    } = useCustomerAnalytics();

    return (
        <div>
            {/* KPI Cards Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable loading={summaryLoading}>
                        <Statistic
                            title="Tổng số khách hàng"
                            value={summaryError ? 0 : summary?.totalCustomers || 0}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<UserOutlined />}
                        />
                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            {summary?.activeCustomers || 0} khách hàng hoạt động
                        </Text>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable loading={summaryLoading}>
                        <Statistic
                            title="Mới trong tháng"
                            value={summaryError ? 0 : summary?.newThisMonth || 0}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<UserAddOutlined />}
                        />
                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            Khách hàng mới tháng này
                        </Text>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable loading={summaryLoading}>
                        <Statistic
                            title="Đang hoạt động"
                            value={summaryError ? 0 : summary?.activeCustomers || 0}
                            valueStyle={{ color: '#722ed1' }}
                            prefix={<UserSwitchOutlined />}
                        />
                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            {summary?.totalCustomers ? Math.round((summary.activeCustomers / summary.totalCustomers) * 100) : 0}% tổng khách hàng
                        </Text>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable loading={summaryLoading}>
                        <Statistic
                            title="Không hoạt động"
                            value={summaryError ? 0 : summary?.inactiveCustomers || 0}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<UserDeleteOutlined />}
                        />
                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            {summary?.totalCustomers ? Math.round((summary.inactiveCustomers / summary.totalCustomers) * 100) : 0}% tổng khách hàng
                        </Text>
                    </Card>
                </Col>
            </Row>

            {/* Charts Row 1: Line Chart (Khách mới 30 ngày) */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} lg={24}>
                    <CustomerNewDailyChart
                        data={newCustomersDaily}
                        loading={newCustomersLoading}
                        error={newCustomersError}
                    />
                </Col>
            </Row>

            {/* Charts Row 2: Top Spenders */}
            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <CustomerTopSpendersChart
                        data={topSpenders}
                        loading={topSpendersLoading}
                        error={topSpendersError}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default CustomerAnalyticsTab;
