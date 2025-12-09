import React from 'react';
import { Card, Spin, Alert } from 'antd';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import type { VariantMatrixData } from '../../services/analytics/index';

interface VariantMatrixProps {
    matrixData: VariantMatrixData[];
    loading: boolean;
    error: string | null;
}

const VariantMatrix: React.FC<VariantMatrixProps> = ({
    matrixData,
    loading,
    error
}) => {
    // Get unique colors and sizes
    const colors = [...new Set(matrixData.map(d => d.color))];
    const sizes = [...new Set(matrixData.map(d => d.size))];

    // Transform data for heatmap
    const series = colors.map(color => ({
        name: color,
        data: sizes.map(size => {
            const item = matrixData.find(d => d.color === color && d.size === size);
            return item ? item.quantity : 0;
        })
    }));

    const chartOptions: ApexOptions = {
        chart: {
            type: 'heatmap',
            height: 450,
            toolbar: {
                show: true
            }
        },
        plotOptions: {
            heatmap: {
                shadeIntensity: 0.5,
                radius: 8,
                useFillColorAsStroke: false,
                colorScale: {
                    ranges: [
                        {
                            from: 0,
                            to: 20,
                            name: 'Rất thấp',
                            color: '#f5222d'
                        },
                        {
                            from: 21,
                            to: 40,
                            name: 'Thấp',
                            color: '#faad14'
                        },
                        {
                            from: 41,
                            to: 60,
                            name: 'Trung bình',
                            color: '#1677ff'
                        },
                        {
                            from: 61,
                            to: 80,
                            name: 'Cao',
                            color: '#52c41a'
                        },
                        {
                            from: 81,
                            to: 100,
                            name: 'Rất cao',
                            color: '#389e0d'
                        }
                    ]
                }
            }
        },
        dataLabels: {
            enabled: true,
            style: {
                colors: ['#fff'],
                fontSize: '12px',
                fontWeight: 600
            }
        },
        xaxis: {
            type: 'category',
            categories: sizes,
            title: {
                text: 'Kích thước',
                style: {
                    fontSize: '14px',
                    fontWeight: 600
                }
            }
        },
        yaxis: {
            title: {
                text: 'Màu sắc',
                style: {
                    fontSize: '14px',
                    fontWeight: 600
                }
            }
        },
        title: {
            text: 'Ma trận số lượng theo Màu sắc × Kích thước',
            align: 'center',
            style: {
                fontSize: '16px',
                fontWeight: 600
            }
        },
        tooltip: {
            y: {
                formatter: (val, { seriesIndex, dataPointIndex }) => {
                    const color = colors[seriesIndex];
                    const size = sizes[dataPointIndex];
                    return `${color} - ${size}: ${val} sản phẩm`;
                }
            }
        },
        legend: {
            show: true,
            position: 'bottom'
        }
    };

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

    // Guard: if no matrix data, show friendly placeholder instead of rendering chart
    if (!Array.isArray(matrixData) || matrixData.length === 0) {
        return (
            <Card bordered={false}>
                <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
                    Không có dữ liệu biến thể để hiển thị.
                </div>
            </Card>
        );
    }

    return (
        <Card bordered={false}>
            <ReactApexChart
                options={chartOptions}
                series={series}
                type="heatmap"
                height={450}
            />
        </Card>
    );
};

export default VariantMatrix;
