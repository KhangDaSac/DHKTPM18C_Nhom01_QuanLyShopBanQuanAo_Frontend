import React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import type { CustomerSegmentation } from '@/services/customer/analytics';

interface CustomerSegmentationDonutProps {
    data: CustomerSegmentation | null;
    loading: boolean;
    error: string | null;
}

const CustomerSegmentationDonut: React.FC<CustomerSegmentationDonutProps> = ({ data, loading, error }) => {
    if (loading) {
        return (
            <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', padding: '2px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                    <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                        <div style={{ height: '16px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '33%', marginBottom: '16px' }}></div>
                        <div style={{ height: '256px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', padding: '2px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>Phân loại khách hàng</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px', color: '#ef4444' }}>
                        {error || 'Không có dữ liệu'}
                    </div>
                </div>
            </div>
        );
    } const chartOptions: ApexOptions = {
        chart: {
            type: 'donut',
            height: 350,
        },
        labels: ['Khách hàng mới', 'Khách hàng quay lại', 'Khách hàng VIP'],
        colors: ['#10b981', '#3b82f6', '#f59e0b'],
        legend: {
            position: 'bottom',
            fontSize: '14px',
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
                            fontWeight: 600,
                        },
                        value: {
                            show: true,
                            fontSize: '24px',
                            fontWeight: 700,
                            formatter: (val: string | number | number[]) => `${val}%`,
                        },
                        total: {
                            show: true,
                            label: 'Tổng cộng',
                            fontSize: '14px',
                            fontWeight: 600,
                            formatter: () => {
                                const total = data.new + data.returning + data.vip;
                                return `${total}%`;
                            },
                        },
                    },
                },
            },
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number | number[]) => {
                const value = typeof val === 'number' ? val : val[0];
                return `${value.toFixed(1)}%`;
            },
            style: {
                fontSize: '14px',
                fontWeight: 600,
            },
        },
        tooltip: {
            y: {
                formatter: (value: number) => `${value}%`,
            },
        },
    };

    const series = [data.new, data.returning, data.vip];

    return (
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', padding: '2px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>Phân loại khách hàng</h3>
                <Chart options={chartOptions} series={series} type="donut" height={350} />
            </div>
        </div>
    );
};

export default CustomerSegmentationDonut;