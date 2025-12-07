/**
 * Loading Chart Skeleton Component
 * Hiển thị skeleton khi chart đang loading
 * 
 * Features: Shimmer effect, stable layout
 */

import React from 'react';

interface LoadingChartProps {
    height?: number | string;
}

const LoadingChart: React.FC<LoadingChartProps> = ({ height = 350 }) => {
    return (
        <div
            style={{
                width: '100%',
                height: typeof height === 'number' ? `${height}px` : height,
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                borderRadius: '8px',
                position: 'relative'
            }}
        >
            <style>{`
                @keyframes shimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }
            `}</style>

            {/* Fake axis lines */}
            <div style={{
                position: 'absolute',
                bottom: '40px',
                left: '60px',
                right: '40px',
                height: '1px',
                background: '#d0d0d0'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '40px',
                left: '60px',
                width: '1px',
                top: '40px',
                background: '#d0d0d0'
            }} />
        </div>
    );
};

export default LoadingChart;
