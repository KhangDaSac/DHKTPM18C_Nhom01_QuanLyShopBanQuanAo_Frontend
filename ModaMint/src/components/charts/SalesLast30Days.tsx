/**
 * Sales Last 30 Days Chart
 * Line chart showing revenue and orders for the last 30 days
 * 
 * Style: Modern high-end dashboard (Stripe/Shopify)
 * Features: Smooth lines, pastel colors, subtle gradients, responsive
 * Performance: Optimized with React.memo, useMemo, cleanup, data limiting
 */

import React, { useMemo, useEffect, useRef } from 'react';
import type { ApexOptions } from 'apexcharts';
import BaseChart from './BaseChart';
import LoadingChart from './LoadingChart';
import { mergeChartConfig, chartColors, formatCurrency, formatCurrencyShort } from '../../config/chartConfig';

export interface DailySalesData {
    date: string;      // "2025-11-10"
    revenue: number;   // 12000000
    orders: number;    // 38
}

interface SalesLast30DaysProps {
    data: DailySalesData[];
    loading?: boolean;
}

// Giới hạn số data points để tránh lag
const MAX_DATA_POINTS = 100;

/**
 * SalesLast30Days Component
 * 
 * Biểu đồ đường (Line Chart) hiển thị doanh thu và số đơn hàng trong 30 ngày gần nhất
 * - Dual Y-axis: Revenue (VNĐ) bên trái, Orders bên phải
 * - Smooth curves với màu pastel
 * - Tooltip hiển thị đầy đủ thông tin
 * - Optimized: React.memo + useMemo + cleanup + data limiting
 */
const SalesLast30Days: React.FC<SalesLast30DaysProps> = React.memo(({ data, loading = false }) => {
    const chartRef = useRef<any>(null);

    // Giới hạn data points nếu quá nhiều
    const limitedData = useMemo(() => {
        if (data.length <= MAX_DATA_POINTS) return data;
        // Lấy data points mới nhất
        return data.slice(-MAX_DATA_POINTS);
    }, [data]);

    // Prepare chart data - memoized
    const chartData = useMemo(() => {
        const dates = limitedData.map(item => {
            const date = new Date(item.date);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        });
        const revenues = limitedData.map(item => item.revenue);
        const orders = limitedData.map(item => item.orders);

        return { dates, revenues, orders };
    }, [limitedData]);

    // Custom chart options - merge with base config - memoized
    const chartOptions: ApexOptions = useMemo(() => {
        return mergeChartConfig({
            chart: {
                type: 'line',
                id: 'sales-last-30-days',
                group: 'sales',
                animations: {
                    enabled: false // Tắt animation để giảm lag
                },
                redrawOnParentResize: false, // Tắt auto redraw
                redrawOnWindowResize: false // Tắt redraw on resize
            },
            colors: [chartColors.primary, chartColors.success],
            stroke: {
                width: 3,
                curve: 'smooth'
            },
            xaxis: {
                categories: chartData.dates,
                labels: {
                    style: {
                        colors: chartColors.gray,
                        fontSize: '12px',
                        fontWeight: 400
                    },
                    rotate: -45,
                    rotateAlways: false,
                    trim: false
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
                    text: 'Ngày',
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
            type: 'line',
            data: chartData.revenues
        },
        {
            name: 'Số đơn hàng',
            type: 'line',
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
                type="line"
                series={series}
                options={chartOptions}
                height={350}
            />
        </div>
    );
});

SalesLast30Days.displayName = 'SalesLast30Days';

export default SalesLast30Days;
