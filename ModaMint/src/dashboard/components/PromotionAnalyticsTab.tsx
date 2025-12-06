import React from 'react';
import { Card, Statistic, Row, Col, Typography } from 'antd';
import { GiftOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { usePromotionAnalytics } from '../hooks/usePromotionAnalytics';
import PromotionStatusBarChart from './PromotionStatusBarChart';
import PromotionTypeDonutChart from './PromotionTypeDonutChart';
import PromotionUsageLineChart from './PromotionUsageLineChart';
import PromotionTopUsedHorizontalBarChart from './PromotionTopUsedHorizontalBarChart';

const { Text } = Typography;

const PromotionAnalyticsTab: React.FC = () => {
    const {
        summary,
        statusSummary,
        typeDistribution,
        usageDaily,
        topUsed,
        summaryLoading,
        statusLoading,
        typeLoading,
        usageLoading,
        topUsedLoading,
        summaryError,
        statusError,
        typeError,
        usageError,
        topUsedError,
    } = usePromotionAnalytics();

    return (
        <div>
            {/* KPI Cards Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable loading={summaryLoading}>
                        <Statistic
                            title="Tổng số mã khuyến mãi"
                            value={summaryError ? 0 : summary?.total || 0}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<GiftOutlined />}
                        />
                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            Tổng số mã trong hệ thống
                        </Text>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable loading={summaryLoading}>
                        <Statistic
                            title="Mã đang hoạt động"
                            value={summaryError ? 0 : summary?.active || 0}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                        />
                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            {summary?.total ? Math.round((summary.active / summary.total) * 100) : 0}% tổng mã
                        </Text>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable loading={summaryLoading}>
                        <Statistic
                            title="Mã sắp diễn ra"
                            value={summaryError ? 0 : summary?.scheduled || 0}
                            valueStyle={{ color: '#722ed1' }}
                            prefix={<ClockCircleOutlined />}
                        />
                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            Chưa đến thời gian áp dụng
                        </Text>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable loading={summaryLoading}>
                        <Statistic
                            title="Mã đã hết hạn"
                            value={summaryError ? 0 : summary?.expired || 0}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<CloseCircleOutlined />}
                        />
                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            {summary?.total ? Math.round((summary.expired / summary.total) * 100) : 0}% tổng mã
                        </Text>
                    </Card>
                </Col>
            </Row>

            {/* Charts Row 1: Status Bar Chart & Type Donut Chart */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} lg={12}>
                    <PromotionStatusBarChart
                        data={statusSummary}
                        loading={statusLoading}
                        error={statusError}
                    />
                </Col>
                <Col xs={24} lg={12}>
                    <PromotionTypeDonutChart
                        data={typeDistribution}
                        loading={typeLoading}
                        error={typeError}
                    />
                </Col>
            </Row>

            {/* Charts Row 2: Usage Line Chart & Top Used Bar Chart */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <PromotionUsageLineChart
                        data={usageDaily}
                        loading={usageLoading}
                        error={usageError}
                    />
                </Col>
                <Col xs={24} lg={12}>
                    <PromotionTopUsedHorizontalBarChart
                        data={topUsed}
                        loading={topUsedLoading}
                        error={topUsedError}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default PromotionAnalyticsTab;
