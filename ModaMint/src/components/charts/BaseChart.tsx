/**
 * Base Chart Component
 * Reusable wrapper for ApexCharts with consistent styling
 * High-end dashboard aesthetic (Stripe/Shopify style)
 */

import React from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

interface BaseChartProps {
    /** Chart type */
    type: 'line' | 'bar' | 'area' | 'pie' | 'donut' | 'radialBar';
    /** Chart series data */
    series: ApexAxisChartSeries | ApexNonAxisChartSeries;
    /** ApexCharts options */
    options: ApexOptions;
    /** Chart height in pixels */
    height?: number | string;
    /** Chart width */
    width?: number | string;
    /** Additional CSS classes */
    className?: string;
}

/**
 * BaseChart Component
 * 
 * Wrapper component for ApexCharts with consistent styling and structure
 * Provides a clean, modern look aligned with high-end dashboard designs
 */
const BaseChart: React.FC<BaseChartProps> = ({
    type,
    series,
    options,
    height = 350,
    width = '100%',
    className = ''
}) => {
    return (
        <div className={`base-chart-container ${className}`}>
            <ReactApexChart
                options={options}
                series={series}
                type={type}
                height={height}
                width={width}
            />
        </div>
    );
};

export default BaseChart;
