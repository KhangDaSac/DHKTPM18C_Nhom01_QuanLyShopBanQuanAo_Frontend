import React from 'react';
import Chart from 'react-apexcharts';

interface PromotionTypeDonutChartProps {
    data: {
        percentage: number;
        fixed: number;
        freeShipping: number;
        buyXgetY: number;
    } | null;
    loading: boolean;
    error: string | null;
}

const PromotionTypeDonutChart: React.FC<PromotionTypeDonutChartProps> = ({ data, loading, error }) => {
    if (loading) {
        return (
            <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', padding: '2px' }}>
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
            <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', padding: '2px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>Phân loại mã khuyến mãi</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#ef4444' }}>
                        {error || 'Không có dữ liệu'}
                    </div>
                </div>
            </div>
        );
    }

    const series = [data.percentage, data.fixed, data.freeShipping, data.buyXgetY];

    const chartOptions: any = {
        chart: {
            type: 'donut'
        },
        labels: ['Giảm theo % (Percentage)', 'Giảm cố định (Fixed)', 'Miễn phí ship', 'Mua X tặng Y'],
        colors: ['#722ed1', '#1890ff', '#52c41a', '#faad14'],
        legend: {
            position: 'bottom',
            fontSize: '12px'
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Tổng',
                            fontSize: '16px',
                            fontWeight: 600,
                            formatter: () => {
                                const total = series.reduce((a, b) => a + b, 0);
                                return `${total}%`;
                            }
                        }
                    }
                }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number) => `${val.toFixed(1)}%`
        },
        tooltip: {
            y: {
                formatter: (val: number) => `${val}%`
            }
        }
    };

    return (
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', padding: '2px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>Phân loại mã khuyến mãi</h3>
                <Chart options={chartOptions} series={series} type="donut" height={300} />
            </div>
        </div>
    );
};

export default PromotionTypeDonutChart;
