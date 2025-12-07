/**
 * Chart Card Component
 * Wrapper card cho các biểu đồ dashboard
 * 
 * Style: High-end dashboard (Stripe/Shopify)
 * Features: Shadow mềm, hover effect, responsive
 * Performance: Optimized hover effect với will-change
 */

import React from 'react';

interface ChartCardProps {
    /** Tiêu đề card */
    title: string;
    /** Mô tả phụ (subtitle) */
    subtitle?: string;
    /** Nội dung bên trong card (chart) */
    children: React.ReactNode;
    /** CSS class tùy chỉnh */
    className?: string;
}

/**
 * ChartCard Component
 * 
 * Card container cho charts với styling chuẩn dashboard high-end
 * - Background trắng
 * - Shadow mềm, tăng nhẹ khi hover
 * - Padding rộng thoáng
 * - Tiêu đề + subtitle rõ ràng
 */
const ChartCard: React.FC<ChartCardProps> = React.memo(({
    title,
    subtitle,
    children,
    className = ''
}) => {
    return (
        <div
            className={`chart-card ${className}`}
            style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                marginBottom: '32px',
                willChange: 'transform' // Optimize for transform changes
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(15, 23, 42, 0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(15, 23, 42, 0.06)';
            }}
        >
            {/* Header: Title + Subtitle */}
            <div style={{ marginBottom: '16px' }}>
                <h3
                    style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#1e293b',
                        margin: 0,
                        marginBottom: subtitle ? '8px' : 0
                    }}
                >
                    {title}
                </h3>
                {subtitle && (
                    <p
                        style={{
                            fontSize: '14px',
                            color: '#64748b',
                            margin: 0
                        }}
                    >
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Chart Content */}
            <div className="chart-content">
                {children}
            </div>
        </div>
    );
});

ChartCard.displayName = 'ChartCard';

export default ChartCard;
