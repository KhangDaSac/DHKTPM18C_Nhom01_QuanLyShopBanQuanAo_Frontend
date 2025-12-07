/**
 * Chart Configuration - Base Config for All Charts
 * High-end Dashboard Style (Stripe, Shopify, Binance)
 * 
 * Pastel colors + subtle gradients + smooth animations
 */

import type { ApexOptions } from 'apexcharts';

// ============================================================
// COLOR PALETTE - PASTEL & MODERN
// ============================================================
export const chartColors = {
    primary: '#2563eb',      // Blue (modern, clean)
    success: '#10b981',      // Green (growth, positive)
    danger: '#ef4444',       // Red (warning, negative)
    warning: '#f59e0b',      // Orange (attention)
    info: '#06b6d4',         // Cyan (info)
    purple: '#8b5cf6',       // Purple (premium)
    slate: '#1e293b',        // Dark slate (titles)
    gray: '#94a3b8',         // Light gray (axis, subtle text)
    lightGray: '#f1f5f9',    // Background subtle
    white: '#ffffff'
};

// ============================================================
// BASE CHART CONFIG - REUSABLE FOR ALL CHARTS
// ============================================================
export const baseChartConfig: ApexOptions = {
    chart: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        height: 350,
        toolbar: {
            show: true,
            tools: {
                download: true,
                selection: false,
                zoom: true,
                zoomin: true,
                zoomout: true,
                pan: true,
                reset: true
            },
            offsetY: -10
        },
        zoom: {
            enabled: true,
            type: 'x',
            autoScaleYaxis: true
        },
        animations: {
            enabled: false, // Tắt animation để giảm lag
            speed: 400, // Giảm speed nếu enable
            dynamicAnimation: {
                enabled: false // Tắt dynamic animation
            }
        },
        redrawOnParentResize: false, // Tắt auto redraw khi parent resize
        redrawOnWindowResize: false, // Tắt auto redraw khi window resize
        background: 'transparent',
        foreColor: chartColors.gray,
        dropShadow: {
            enabled: false
        }
    },
    stroke: {
        width: 3,
        curve: 'smooth', // Đường cong mượt mà
        lineCap: 'round'
    },
    dataLabels: {
        enabled: false // Không hiển thị label trên điểm data
    },
    legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '13px',
        fontWeight: 500,
        labels: {
            colors: chartColors.slate
        },
        markers: {
            size: 8,
            shape: 'circle',
            strokeWidth: 0,
            offsetX: -2
        },
        itemMargin: {
            horizontal: 12,
            vertical: 8
        },
        onItemClick: {
            toggleDataSeries: true
        },
        onItemHover: {
            highlightDataSeries: true
        }
    },
    grid: {
        show: true,
        borderColor: 'rgba(148, 163, 184, 0.1)', // Opacity 0.1 - mờ nhẹ
        strokeDashArray: 4,
        position: 'back',
        xaxis: {
            lines: {
                show: false
            }
        },
        yaxis: {
            lines: {
                show: true
            }
        },
        padding: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        }
    },
    tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        followCursor: true,
        theme: 'light',
        style: {
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif'
        },
        x: {
            show: true
        },
        marker: {
            show: true
        }
    },
    markers: {
        size: 0, // Ẩn marker mặc định
        strokeWidth: 3,
        strokeOpacity: 1,
        strokeColors: '#fff',
        hover: {
            size: 7, // Hiện marker khi hover
            sizeOffset: 3
        }
    },
    noData: {
        text: 'Không có dữ liệu',
        align: 'center',
        verticalAlign: 'middle',
        offsetX: 0,
        offsetY: 0,
        style: {
            color: chartColors.gray,
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif'
        }
    },
    responsive: [
        {
            breakpoint: 768,
            options: {
                chart: {
                    height: 300
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    ]
};

// ============================================================
// HELPER FUNCTIONS - FORMAT NUMBERS
// ============================================================

/**
 * Format currency to Vietnamese format
 * 12500000 -> "12.5M VNĐ"
 * 250000 -> "250K VNĐ"
 */
export const formatCurrency = (value: number): string => {
    if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B VNĐ`;
    }
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M VNĐ`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K VNĐ`;
    }
    return `${value.toLocaleString('vi-VN')} VNĐ`;
};

/**
 * Format currency for chart axis (shorter)
 * 12500000 -> "12.5M"
 */
export const formatCurrencyShort = (value: number): string => {
    if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
};

/**
 * Format number with locale
 * 1234 -> "1,234"
 */
export const formatNumber = (value: number): string => {
    return value.toLocaleString('vi-VN');
};

/**
 * Merge base config with custom config
 */
export const mergeChartConfig = (customConfig: ApexOptions): ApexOptions => {
    return {
        ...baseChartConfig,
        ...customConfig,
        chart: {
            ...baseChartConfig.chart,
            ...customConfig.chart
        },
        grid: {
            ...baseChartConfig.grid,
            ...customConfig.grid
        },
        tooltip: {
            ...baseChartConfig.tooltip,
            ...customConfig.tooltip
        }
    };
};

export default baseChartConfig;
