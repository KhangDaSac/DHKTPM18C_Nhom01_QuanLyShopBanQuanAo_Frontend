import React from 'react';
import { Spin } from 'antd';

interface LoadingSpinnerProps {
    size?: 'small' | 'default' | 'large';
    tip?: string;
    fullScreen?: boolean;
    spinning?: boolean;
    children?: React.ReactNode;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'default',
    tip = 'Đang tải...',
    fullScreen = false,
    spinning = true,
    children
}) => {
    if (fullScreen) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                zIndex: 9999
            }}>
                <Spin size={size} tip={tip} />
            </div>
        );
    }

    if (children) {
        return (
            <Spin size={size} tip={tip} spinning={spinning}>
                {children}
            </Spin>
        );
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            width: '100%'
        }}>
            <Spin size={size} tip={tip} />
        </div>
    );
};

export default LoadingSpinner;
