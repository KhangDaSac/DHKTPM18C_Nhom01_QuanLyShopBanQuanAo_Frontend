import React from 'react';
import Chart from 'react-apexcharts';

interface PromotionStatusBarChartProps {
    data: {
        active: number;
        scheduled: number;
        expired: number;
        disabled: number;
    } | null;
    loading: boolean;
    error: string | null;
}

const PromotionStatusBarChart: React.FC<PromotionStatusBarChartProps> = ({ data, loading, error }) => {
    if (loading) {
        return (
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '2px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                    <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                        <div style={{ height: '16px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '33%', marginBottom: '16px' }}></div>
                        <div style={{ height: '300px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '2px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>Phân bố trạng thái khuyến mãi</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#ef4444' }}>
                        {error || 'Không có dữ liệu'}
                    </div>
                </div>
            </div>
        );
    }

    const series = [{
        name: 'Số lượng',
        data: [data.active, data.scheduled, data.expired, data.disabled]
    }];

    const chartOptions: any = {
        chart: {
            type: 'bar',
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 8,
                dataLabels: {
                    position: 'top'
                }
            }
        },
        dataLabels: {
            enabled: true,
            offsetY: -20,
            style: {
                fontSize: '12px',
                colors: ['#304758']
            }
        },
        colors: ['#52c41a', '#1890ff', '#faad14', '#ff4d4f'],
        xaxis: {
            categories: ['Đang hoạt động', 'Sắp diễn ra', 'Đã hết hạn', 'Vô hiệu hóa'],
            labels: {
                style: {
                    fontSize: '12px'
                }
            }
        },
        yaxis: {
            title: {
                text: 'Số lượng'
            }
        },
        grid: {
            borderColor: '#f1f1f1'
        },
        tooltip: {
            y: {
                formatter: (val: number) => `${val} mã`
            }
        }
    };

    return (
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '2px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>Phân bố trạng thái khuyến mãi</h3>
                <Chart options={chartOptions} series={series} type="bar" height={300} />
            </div>
        </div>
    );
};

export default PromotionStatusBarChart;
