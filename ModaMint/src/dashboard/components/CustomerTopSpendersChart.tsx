import React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import type { CustomerTopSpender } from '@/services/customer/analytics';

interface CustomerTopSpendersChartProps {
    data: CustomerTopSpender[] | null;
    loading: boolean;
    error: string | null;
}

const CustomerTopSpendersChart: React.FC<CustomerTopSpendersChartProps> = ({ data, loading, error }) => {
    if (loading) {
        return (
            <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '12px', padding: '2px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                    <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                        <div style={{ height: '16px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '33%', marginBottom: '16px' }}></div>
                        <div style={{ height: '384px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data || data.length === 0) {
        return (
            <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '12px', padding: '2px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>Top 10 khách hàng chi tiêu cao nhất</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '384px', color: '#ef4444' }}>
                        {error || 'Không có dữ liệu'}
                    </div>
                </div>
            </div>
        );
    } const chartOptions: ApexOptions = {
        chart: {
            type: 'bar',
            height: 450,
            toolbar: {
                show: true,
            },
        },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 6,
                dataLabels: {
                    position: 'top',
                },
            },
        },
        colors: ['#8b5cf6'],
        dataLabels: {
            enabled: true,
            formatter: (val: number | number[]) => {
                const value = typeof val === 'number' ? val : val[0];
                return new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                }).format(value);
            },
            offsetX: 50,
            style: {
                fontSize: '12px',
                fontWeight: 600,
                colors: ['#1f2937'],
            },
        },
        xaxis: {
            categories: data.map((customer) => customer.name),
            labels: {
                formatter: (value: string) => {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue)) return value;

                    if (numValue >= 1000000) {
                        return `${(numValue / 1000000).toFixed(1)}M`;
                    }
                    return new Intl.NumberFormat('vi-VN').format(numValue);
                },
            },
            title: {
                text: 'Tổng chi tiêu (VND)',
            },
        },
        yaxis: {
            title: {
                text: 'Khách hàng',
            },
        },
        grid: {
            borderColor: '#e5e7eb',
            strokeDashArray: 4,
        },
        tooltip: {
            y: {
                formatter: (value: number) => {
                    return new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                    }).format(value);
                },
            },
        },
    };

    const series = [
        {
            name: 'Tổng chi tiêu',
            data: data.map((customer) => customer.totalSpent),
        },
    ];

    return (
        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '12px', padding: '2px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>Top 10 khách hàng chi tiêu cao nhất</h3>
                <Chart options={chartOptions} series={series} type="bar" height={450} />
            </div>
        </div>
    );
};

export default CustomerTopSpendersChart;