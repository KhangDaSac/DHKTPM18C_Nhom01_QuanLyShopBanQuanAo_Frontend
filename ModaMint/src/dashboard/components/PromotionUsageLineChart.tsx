import React from 'react';
import Chart from 'react-apexcharts';

interface PromotionUsageLineChartProps {
    data: {
        dates: string[];
        usage: number[];
    } | null;
    loading: boolean;
    error: string | null;
}

const PromotionUsageLineChart: React.FC<PromotionUsageLineChartProps> = ({ data, loading, error }) => {
    if (loading) {
        return (
            <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '12px', padding: '2px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                    <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                        <div style={{ height: '16px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '33%', marginBottom: '16px' }}></div>
                        <div style={{ height: '350px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data || data.dates.length === 0) {
        return (
            <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '12px', padding: '2px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>Lịch sử sử dụng mã (30 ngày)</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '350px', color: '#ef4444' }}>
                        {error || 'Không có dữ liệu'}
                    </div>
                </div>
            </div>
        );
    }

    const series = [{
        name: 'Lượt sử dụng',
        data: data.usage
    }];

    const chartOptions: any = {
        chart: {
            type: 'line',
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true
                }
            },
            zoom: {
                enabled: true
            }
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        colors: ['#4facfe'],
        dataLabels: {
            enabled: false
        },
        markers: {
            size: 4,
            colors: ['#4facfe'],
            strokeColors: '#fff',
            strokeWidth: 2,
            hover: {
                size: 6
            }
        },
        xaxis: {
            categories: data.dates,
            labels: {
                rotate: -45,
                style: {
                    fontSize: '11px'
                },
                formatter: (value: string) => {
                    if (!value) return '';
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                }
            }
        },
        yaxis: {
            title: {
                text: 'Lượt sử dụng'
            },
            labels: {
                formatter: (val: number) => Math.floor(val).toString()
            }
        },
        grid: {
            borderColor: '#f1f1f1',
            row: {
                colors: ['#f9f9f9', 'transparent'],
                opacity: 0.5
            }
        },
        tooltip: {
            x: {
                formatter: (value: number) => {
                    const date = new Date(data.dates[value - 1]);
                    return date.toLocaleDateString('vi-VN');
                }
            },
            y: {
                formatter: (val: number) => `${val} lượt`
            }
        }
    };

    return (
        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '12px', padding: '2px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>Lịch sử sử dụng mã (30 ngày)</h3>
                <Chart options={chartOptions} series={series} type="line" height={350} />
            </div>
        </div>
    );
};

export default PromotionUsageLineChart;
