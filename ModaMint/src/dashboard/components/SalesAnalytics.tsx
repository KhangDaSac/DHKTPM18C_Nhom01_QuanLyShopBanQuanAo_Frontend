import React from 'react';
import { Card, Row, Col, Spin, Alert } from 'antd';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
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
    // Daily Sales Line Chart
    const dailyChartOptions: ApexOptions = {
        chart: {
            type: 'line',
            height: 350,
            toolbar: {
                show: true
            },
            zoom: {
                enabled: true
            }
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        colors: ['#1677ff', '#52c41a'],
        dataLabels: {
            enabled: false
        },
        legend: {
            show: true,
            position: 'top'
        },
        xaxis: {
            categories: dailySales.map(d => {
                const date = new Date(d.date);
                return `${date.getDate()}/${date.getMonth() + 1}`;
            }),
            title: {
                text: 'Ngày'
            }
        },
        yaxis: [
            {
                title: {
                    text: 'Doanh thu (₫)'
                },
                labels: {
                    formatter: (value) => {
                        return `${(value / 1000000).toFixed(1)}M`;
                    }
                }
            },
            {
                opposite: true,
                title: {
                    text: 'Số đơn hàng'
                }
            }
        ],
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: (value, { seriesIndex }) => {
                    if (seriesIndex === 0) {
                        return value.toLocaleString('vi-VN') + '₫';
                    }
                    return value.toString() + ' đơn';
                }
            }
        },
        grid: {
            borderColor: '#f1f1f1'
        }
    };

    const dailyChartSeries = [
        {
            name: 'Doanh thu',
            type: 'line',
            data: dailySales.map(d => d.revenue)
        },
        {
            name: 'Số đơn hàng',
            type: 'line',
            data: dailySales.map(d => d.orders)
        }
    ];

    // Monthly Sales Bar Chart
    const monthlyChartOptions: ApexOptions = {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: {
                show: true
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 8
            }
        },
        colors: ['#1677ff', '#52c41a'],
        dataLabels: {
            enabled: false
        },
        legend: {
            show: true,
            position: 'top'
        },
        xaxis: {
            categories: monthlySales.map(m => m.month),
            title: {
                text: 'Tháng'
            }
        },
        yaxis: [
            {
                title: {
                    text: 'Doanh thu (₫)'
                },
                labels: {
                    formatter: (value) => {
                        return `${(value / 1000000).toFixed(0)}M`;
                    }
                }
            },
            {
                opposite: true,
                title: {
                    text: 'Số đơn hàng'
                }
            }
        ],
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: (value, { seriesIndex }) => {
                    if (seriesIndex === 0) {
                        return value.toLocaleString('vi-VN') + '₫';
                    }
                    return value.toString() + ' đơn';
                }
            }
        },
        grid: {
            borderColor: '#f1f1f1'
        }
    };

    const monthlyChartSeries = [
        {
            name: 'Doanh thu',
            data: monthlySales.map(m => m.revenue)
        },
        {
            name: 'Số đơn hàng',
            data: monthlySales.map(m => m.orders)
        }
    ];

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
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card title="Doanh số 30 ngày gần nhất" bordered={false}>
                        <ReactApexChart
                            options={dailyChartOptions}
                            series={dailyChartSeries}
                            type="line"
                            height={350}
                        />
                    </Card>
                </Col>
                <Col span={24}>
                    <Card title="Doanh số theo tháng" bordered={false}>
                        <ReactApexChart
                            options={monthlyChartOptions}
                            series={monthlyChartSeries}
                            type="bar"
                            height={350}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SalesAnalytics;
