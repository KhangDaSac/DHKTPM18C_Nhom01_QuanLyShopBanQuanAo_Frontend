import React from 'react';
import { Card, Spin, Alert, Statistic, Row, Col } from 'antd';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import type { TopSellingProduct } from '../../services/analytics/index';
import { RiseOutlined, DollarOutlined } from '@ant-design/icons';

interface TopSellingProductsProps {
    products: TopSellingProduct[];
    loading: boolean;
    error: string | null;
}

const TopSellingProducts: React.FC<TopSellingProductsProps> = ({
    products,
    loading,
    error
}) => {
    const totalSold = products.reduce((sum, p) => sum + p.totalSold, 0);
    const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);

    const chartOptions: ApexOptions = {
        chart: {
            type: 'bar',
            height: 450,
            toolbar: {
                show: true
            }
        },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 8,
                dataLabels: {
                    position: 'top'
                }
            }
        },
        colors: ['#1677ff'],
        dataLabels: {
            enabled: true,
            formatter: (val) => val.toLocaleString('vi-VN'),
            offsetX: 30,
            style: {
                fontSize: '12px',
                colors: ['#304758']
            }
        },
        xaxis: {
            categories: products.map(p => p.productName),
            title: {
                text: 'Số lượng đã bán'
            }
        },
        yaxis: {
            title: {
                text: 'Sản phẩm'
            }
        },
        tooltip: {
            y: {
                formatter: (val, { dataPointIndex }) => {
                    const product = products[dataPointIndex];
                    return `${val} sản phẩm - ${product.revenue.toLocaleString('vi-VN')}₫`;
                }
            }
        },
        grid: {
            borderColor: '#f1f1f1'
        }
    };

    const chartSeries = [
        {
            name: 'Đã bán',
            data: products.map(p => p.totalSold)
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
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12}>
                    <Card>
                        <Statistic
                            title="Tổng sản phẩm bán ra (Top 10)"
                            value={totalSold}
                            prefix={<RiseOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu (Top 10)"
                            value={totalRevenue}
                            prefix={<DollarOutlined />}
                            suffix="₫"
                            valueStyle={{ color: '#1677ff' }}
                        />
                    </Card>
                </Col>
            </Row>
            <Card title="Top 10 sản phẩm bán chạy nhất" bordered={false}>
                <ReactApexChart
                    options={chartOptions}
                    series={chartSeries}
                    type="bar"
                    height={450}
                />
            </Card>
        </div>
    );
};

export default TopSellingProducts;
