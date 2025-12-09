import React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import type { CustomerNewDaily } from '@/services/customer/analytics';

interface CustomerNewDailyChartProps {
    data: CustomerNewDaily | null;
    loading: boolean;
    error: string | null;
}

const CustomerNewDailyChart: React.FC<CustomerNewDailyChartProps> = ({ data, loading, error }) => {
    if (loading) {
        return (
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '2px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                    <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                        <div style={{ height: '16px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '25%', marginBottom: '16px' }}></div>
                        <div style={{ height: '256px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '2px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>Khách hàng mới (30 ngày)</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px', color: '#ef4444' }}>
                        {error || 'Không có dữ liệu'}
                    </div>
                </div>
            </div>
        );
    } const chartOptions: ApexOptions = {
        chart: {
            type: 'line',
            height: 350,
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true,
                },
            },
            zoom: {
                enabled: true,
            },
        },
        stroke: {
            curve: 'smooth',
            width: 3,
        },
        colors: ['#3b82f6'],
        dataLabels: {
            enabled: false,
        },
        markers: {
            size: 4,
            colors: ['#3b82f6'],
            strokeColors: '#fff',
            strokeWidth: 2,
            hover: {
                size: 6,
            },
        },
        xaxis: {
            categories: data.dates,
            labels: {
                rotate: -45,
                rotateAlways: false,
                // Avoid using `new Date(string)` to prevent timezone shifts across browsers.
                // Expect `value` in ISO YYYY-MM-DD and format by splitting the string.
                formatter: (value: string) => {
                    if (!value) return '';
                    const parts = String(value).split('-');
                    if (parts.length >= 3) return `${Number(parts[2])}/${Number(parts[1])}`;
                    return value;
                },
            },
            title: {
                text: 'Ngày',
            },
        },
        yaxis: {
            title: {
                text: 'Số khách hàng mới',
            },
            labels: {
                formatter: (value: number) => Math.floor(value).toString(),
            },
        },
        grid: {
            borderColor: '#e5e7eb',
            strokeDashArray: 4,
        },
        tooltip: {
            x: {
                formatter: (value: number, opts?: any) => {
                    const index = opts?.dataPointIndex;
                    if (index !== undefined && data.dates[index]) {
                        const iso = String(data.dates[index]);
                        const parts = iso.split('-');
                        if (parts.length >= 3) return `${Number(parts[2])}/${Number(parts[1])}/${parts[0]}`;
                        return iso;
                    }
                    return String(value);
                },
            },
            y: {
                formatter: (value: number) => `${Math.floor(value)} khách hàng`,
            },
        },
    };

    const series = [
        {
            name: 'Khách hàng mới',
            data: data.newCustomers,
        },
    ];

    return (
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '2px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>Khách hàng mới (30 ngày)</h3>
                <Chart options={chartOptions} series={series} type="line" height={350} />
            </div>
        </div>
    );
};

export default CustomerNewDailyChart;
