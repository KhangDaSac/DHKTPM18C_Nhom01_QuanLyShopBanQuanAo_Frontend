import React from 'react';
import { Card, Spin, Alert, Row, Col, Statistic } from 'antd';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import type { OrderStatusSummary } from '../../services/analytics/index';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface OrderStatusChartProps {
    statusData: OrderStatusSummary[];
    loading: boolean;
    error: string | null;
}

const OrderStatusChart: React.FC<OrderStatusChartProps> = ({
    statusData,
    loading,
    error
}) => {
    const totalOrders = statusData.reduce((sum, s) => sum + s.count, 0);
    const completedOrders = statusData.find(s => s.status === 'Hoàn thành')?.count || 0;
    const cancelledOrders = statusData.find(s => s.status === 'Đã hủy')?.count || 0;

    const chartOptions: ApexOptions = {
        chart: {
            type: 'pie',
            height: 450
        },
        colors: ['#faad14', '#1677ff', '#722ed1', '#52c41a', '#f5222d'],
        labels: statusData.map(s => s.status),
        dataLabels: {
            enabled: true,
            formatter: (val, opts) => {
                const name = opts.w.globals.labels[opts.seriesIndex];
                const count = statusData[opts.seriesIndex].count;
                const percentage = typeof val === 'number' ? val.toFixed(1) : val;
                return `${name}\n${count} (${percentage}%)`;
            },
            style: {
                fontSize: '13px',
                fontWeight: 600
            },
            dropShadow: {
                enabled: false
            }
        },
        legend: {
            show: true,
            position: 'bottom',
            fontSize: '14px'
        },
        plotOptions: {
            pie: {
                expandOnClick: true,
                donut: {
                    size: '0%'
                }
            }
        },
        tooltip: {
            y: {
                formatter: (val, { seriesIndex }) => {
                    const status = statusData[seriesIndex];
                    return `${val} đơn hàng (${status.percentage}%)`;
                }
            }
        },
        responsive: [
            {
                breakpoint: 768,
                options: {
                    chart: {
                        height: 350
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        ]
    };

    const chartSeries = statusData.map(s => s.count);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return <Alert message="Lỗi" description={error} type="error" showIcon />;
    }

    return (
        <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng đơn hàng"
                            value={totalOrders}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#1677ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Đơn hoàn thành"
                            value={completedOrders}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Đơn đã hủy"
                            value={cancelledOrders}
                            prefix={<CloseCircleOutlined />}
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
            </Row>
            <Card title="Phân bổ trạng thái đơn hàng" bordered={false}>
                <ReactApexChart
                    options={chartOptions}
                    series={chartSeries}
                    type="pie"
                    height={450}
                />
            </Card>
        </div>
    );
};

export default OrderStatusChart;
