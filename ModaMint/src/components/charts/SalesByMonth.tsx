/**
 * Sales By Month Chart
 * Column chart showing revenue and orders by month
 * 
 * Style: Modern high-end dashboard (Stripe/Shopify)
 * Features: Rounded columns, data labels on top, gradient fills, responsive
 * Performance: Optimized with React.memo, useMemo, cleanup, data limiting
 */

import React, { useMemo, useEffect, useRef } from 'react';
import type { ApexOptions } from 'apexcharts';
import BaseChart from './BaseChart';
import LoadingChart from './LoadingChart';
import { mergeChartConfig, chartColors, formatCurrency, formatCurrencyShort } from '../../config/chartConfig';

export interface MonthlySalesData {
    month: string;     // "2025-10" or "T10 2025"
    revenue: number;   // 250000000
    orders: number;    // 680
}

interface SalesByMonthProps {
    data: MonthlySalesData[];
    loading?: boolean;
}

// Giới hạn số tháng hiển thị
const MAX_MONTHS = 24;

/**
 * SalesByMonth Component
 * 
 * Biểu đồ cột (Column Chart) hiển thị doanh thu và số đơn hàng theo từng tháng
 * - Grouped columns với màu pastel
 * - Data labels hiển thị giá trị trên đầu cột
 * - Tooltip chi tiết
 * - Optimized: React.memo + useMemo + cleanup + data limiting
 */
const SalesByMonth: React.FC<SalesByMonthProps> = React.memo(({ data, loading = false }) => {
    const chartRef = useRef<any>(null);

    // Giới hạn số tháng nếu quá nhiều
    const limitedData = useMemo(() => {
        if (data.length <= MAX_MONTHS) return data;
        // Lấy tháng mới nhất
        return data.slice(-MAX_MONTHS);
    }, [data]);

    // Prepare chart data - memoized
    const chartData = useMemo(() => {
        const months = limitedData.map(item => item.month);
        const revenues = limitedData.map(item => item.revenue);
        const orders = limitedData.map(item => item.orders);

        return { months, revenues, orders };
    }, [limitedData]);

    // Custom chart options - merge with base config - memoized
    const chartOptions: ApexOptions = useMemo(() => {
        return mergeChartConfig({
            chart: {
                type: 'bar',
                id: 'sales-by-month',
                group: 'sales',
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: false,
                        zoom: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,
                        reset: false
                    }
                },
                animations: {
                    enabled: false // Tắt animation để giảm lag
                },
                redrawOnParentResize: false,
                redrawOnWindowResize: false
            },
            colors: [chartColors.primary, chartColors.success],
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '65%',
                    borderRadius: 8,
                    borderRadiusApplication: 'end',
                    dataLabels: {
                        position: 'top'
                    }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: (value: number, opts) => {
                    // Hiển thị giá trị trên cột
                    if (opts.seriesIndex === 0) {
                        // Doanh thu: 250M
                        return formatCurrencyShort(value);
                    } else {
                        // Số đơn: 680
                        return value.toString();
                    }
                },
                offsetY: -25,
                style: {
                    fontSize: '11px',
                    fontWeight: 600,
                    colors: [chartColors.primary, chartColors.success]
                },
                background: {
                    enabled: true,
                    foreColor: '#fff',
                    padding: 6,
                    borderRadius: 4,
                    borderWidth: 0,
                    opacity: 0.9
                }
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            fill: {
                opacity: 1
            },
            xaxis: {
                categories: chartData.months,
                labels: {
                    style: {
                        colors: chartColors.gray,
                        fontSize: '12px',
                        fontWeight: 400
                    },
                    rotate: -45,
                    rotateAlways: false
                },
                axisBorder: {
                    show: true,
                    color: chartColors.lightGray,
                    height: 1
                },
                axisTicks: {
                    show: true,
                    color: chartColors.lightGray,
                    height: 4
                },
                title: {
                    text: 'Tháng',
                    style: {
                        color: chartColors.slate,
                        fontSize: '13px',
                        fontWeight: 500
                    },
                    offsetY: 10
                }
            },
            yaxis: [
                {
                    // Y-axis bên trái: Doanh thu
                    seriesName: 'Doanh thu',
                    title: {
                        text: 'Doanh thu (VNĐ)',
                        style: {
                            color: chartColors.primary,
                            fontSize: '13px',
                            fontWeight: 500
                        }
                    },
                    labels: {
                        formatter: (value: number) => formatCurrencyShort(value),
                        style: {
                            colors: chartColors.primary,
                            fontSize: '12px',
                            fontWeight: 400
                        }
                    },
                    axisBorder: {
                        show: false
                    },
                    axisTicks: {
                        show: false
                    }
                },
                {
                    // Y-axis bên phải: Số đơn hàng
                    opposite: true,
                    seriesName: 'Số đơn hàng',
                    title: {
                        text: 'Số đơn hàng',
                        style: {
                            color: chartColors.success,
                            fontSize: '13px',
                            fontWeight: 500
                        }
                    },
                    labels: {
                        formatter: (value: number) => Math.round(value).toString(),
                        style: {
                            colors: chartColors.success,
                            fontSize: '12px',
                            fontWeight: 400
                        }
                    },
                    axisBorder: {
                        show: false
                    },
                    axisTicks: {
                        show: false
                    }
                }
            ],
            tooltip: {
                shared: true,
                intersect: false,
                y: [
                    {
                        formatter: (value: number) => formatCurrency(value)
                    },
                    {
                        formatter: (value: number) => `${value.toLocaleString('vi-VN')} đơn`
                    }
                ]
            }
        });
    }, [chartData]);

    // Chart series - memoized
    const series: ApexAxisChartSeries = useMemo(() => [
        {
            name: 'Doanh thu',
            data: chartData.revenues
        },
        {
            name: 'Số đơn hàng',
            data: chartData.orders
        }
    ], [chartData]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (chartRef.current) {
                try {
                    chartRef.current.destroy();
                } catch (error) {
                    console.error('Error destroying chart:', error);
                }
            }
        };
    }, []);

    // Loading state with skeleton
    if (loading) {
        return <LoadingChart height={350} />;
    }

    // No data state
    if (limitedData.length === 0) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '350px',
                color: '#94a3b8',
                fontSize: '14px'
            }}>
                Không có dữ liệu
            </div>
        );
    }

    return (
        <div ref={chartRef}>
            <BaseChart
                type="bar"
                series={series}
                options={chartOptions}
                height={350}
            />
        </div>
    );
});

SalesByMonth.displayName = 'SalesByMonth';

export default SalesByMonth;
