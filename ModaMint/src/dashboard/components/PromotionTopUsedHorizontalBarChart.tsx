import React from 'react';
import Chart from 'react-apexcharts';

interface TopUsedPromotion {
    code: string;
    used: number;
}

interface PromotionTopUsedHorizontalBarChartProps {
    data: TopUsedPromotion[];
    loading: boolean;
    error: string | null;
}

const PromotionTopUsedHorizontalBarChart: React.FC<PromotionTopUsedHorizontalBarChartProps> = ({ data, loading, error }) => {
    if (loading) {
        return (
            <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '12px', padding: '2px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                    <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                        <div style={{ height: '16px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '33%', marginBottom: '16px' }}></div>
                        <div style={{ height: '450px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data || data.length === 0) {
        return (
            <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '12px', padding: '2px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>Top 10 mã sử dụng nhiều nhất</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '450px', color: '#ef4444' }}>
                        {error || 'Không có dữ liệu'}
                    </div>
                </div>
            </div>
        );
    }

    const series = [{
        name: 'Lượt sử dụng',
        data: data.map(item => item.used)
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
                horizontal: true,
                borderRadius: 8,
                dataLabels: {
                    position: 'top'
                }
            }
        },
        dataLabels: {
            enabled: true,
            offsetX: 30,
            style: {
                fontSize: '12px',
                colors: ['#304758']
            },
            formatter: (val: number) => `${val} lượt`
        },
        colors: ['#fa709a'],
        xaxis: {
            categories: data.map(item => item.code),
            labels: {
                style: {
                    fontSize: '12px'
                }
            }
        },
        yaxis: {
            title: {
                text: 'Mã khuyến mãi'
            }
        },
        grid: {
            borderColor: '#f1f1f1'
        },
        tooltip: {
            y: {
                formatter: (val: number) => `${val} lượt sử dụng`
            }
        }
    };

    return (
        <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '12px', padding: '2px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>Top 10 mã sử dụng nhiều nhất</h3>
                <Chart options={chartOptions} series={series} type="bar" height={450} />
            </div>
        </div>
    );
};

export default PromotionTopUsedHorizontalBarChart;
