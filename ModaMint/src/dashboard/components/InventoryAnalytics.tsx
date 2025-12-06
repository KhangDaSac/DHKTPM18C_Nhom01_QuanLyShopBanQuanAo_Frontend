import React from 'react';
import { Card, Row, Col, Spin, Alert } from 'antd';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import type { InventoryData, InventoryCategoryData } from '../../services/analytics/index';

interface InventoryAnalyticsProps {
    inventoryData: InventoryData[];
    categoryData: InventoryCategoryData[];
    loading: boolean;
    error: string | null;
}

const InventoryAnalytics: React.FC<InventoryAnalyticsProps> = ({
    inventoryData,
    categoryData,
    loading,
    error
}) => {
    // Inventory Bar Chart
    const inventoryChartOptions: ApexOptions = {
        chart: {
            type: 'bar',
            height: 400,
            toolbar: {
                show: true
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 6
            }
        },
        colors: ['#52c41a'],
        dataLabels: {
            enabled: true,
            formatter: (val) => val.toString()
        },
        xaxis: {
            categories: inventoryData.map(i => i.productName),
            labels: {
                rotate: -45,
                rotateAlways: true,
                maxHeight: 120
            },
            title: {
                text: 'Sản phẩm'
            }
        },
        yaxis: {
            title: {
                text: 'Số lượng tồn kho'
            }
        },
        tooltip: {
            y: {
                formatter: (val, { dataPointIndex }) => {
                    const item = inventoryData[dataPointIndex];
                    return `${val} sản phẩm (${item.categoryName})`;
                }
            }
        },
        grid: {
            borderColor: '#f1f1f1'
        }
    };

    const inventoryChartSeries = [
        {
            name: 'Tồn kho',
            data: inventoryData.map(i => i.quantity)
        }
    ];

    // Category Donut Chart
    const categoryChartOptions: ApexOptions = {
        chart: {
            type: 'donut',
            height: 400
        },
        colors: ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'],
        labels: categoryData.map(c => c.categoryName),
        dataLabels: {
            enabled: true,
            formatter: (val, opts) => {
                const name = opts.w.globals.labels[opts.seriesIndex];
                const percentage = typeof val === 'number' ? val.toFixed(1) : val;
                return `${name}: ${percentage}%`;
            }
        },
        legend: {
            show: true,
            position: 'bottom'
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '16px',
                            fontWeight: 600
                        },
                        value: {
                            show: true,
                            fontSize: '24px',
                            fontWeight: 700,
                            formatter: (val) => val.toString()
                        },
                        total: {
                            show: true,
                            label: 'Tổng tồn kho',
                            fontSize: '14px',
                            formatter: () => {
                                return categoryData
                                    .reduce((sum, c) => sum + c.totalQuantity, 0)
                                    .toString();
                            }
                        }
                    }
                }
            }
        },
        tooltip: {
            y: {
                formatter: (val) => `${val} sản phẩm`
            }
        }
    };

    const categoryChartSeries = categoryData.map(c => c.totalQuantity);

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
                    <Card title="Tồn kho theo sản phẩm" bordered={false}>
                        <ReactApexChart
                            options={inventoryChartOptions}
                            series={inventoryChartSeries}
                            type="bar"
                            height={400}
                        />
                    </Card>
                </Col>
                <Col span={24}>
                    <Card title="Phân bổ tồn kho theo danh mục" bordered={false}>
                        <ReactApexChart
                            options={categoryChartOptions}
                            series={categoryChartSeries}
                            type="donut"
                            height={400}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default InventoryAnalytics;
