import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Space, Typography } from 'antd';
import { BgColorsOutlined, CheckOutlined } from '@ant-design/icons';
import { applyThemeDirectly } from '../../utils/themeUtils';

const { Text } = Typography;

export interface ThemeOption {
    key: string;
    label: string;
    preview: string[];
    description: string;
}

const THEME_OPTIONS: ThemeOption[] = [
    {
        key: 'modamint',
        label: 'ModaMint',
        preview: ['#ff6347', '#ff9582', '#ffbeb1'],
        description: 'Theme chính của ModaMint với màu cam coral'
    },
    {
        key: 'light',
        label: 'Light',
        preview: ['#570df8', '#f000b8', '#37cdbe'],
        description: 'Theme sáng mặc định'
    },
    {
        key: 'dark',
        label: 'Dark',
        preview: ['#661ae6', '#d926aa', '#1fb2a6'],
        description: 'Theme tối hiện đại'
    },
    {
        key: 'cupcake',
        label: 'Cupcake',
        preview: ['#65c3c8', '#ef9fbc', '#eeaf3a'],
        description: 'Theme pastel ngọt ngào'
    },
    {
        key: 'bumblebee',
        label: 'Bumblebee',
        preview: ['#e0a82e', '#f9d72f', '#181830'],
        description: 'Theme vàng năng động'
    },
    {
        key: 'emerald',
        label: 'Emerald',
        preview: ['#66cc8a', '#377cfb', '#ea5234'],
        description: 'Theme xanh lá tươi mát'
    },
    {
        key: 'corporate',
        label: 'Corporate',
        preview: ['#4b6bfb', '#7b92b2', '#67cba0'],
        description: 'Theme doanh nghiệp chuyên nghiệp'
    },
    {
        key: 'synthwave',
        label: 'Synthwave',
        preview: ['#e779c1', '#58c7f3', '#f3cc30'],
        description: 'Theme retro synthwave'
    },
    {
        key: 'cyberpunk',
        label: 'Cyberpunk',
        preview: ['#ff7598', '#75d1f0', '#fcd34d'],
        description: 'Theme cyberpunk futuristic'
    },
    {
        key: 'valentine',
        label: 'Valentine',
        preview: ['#e96d7b', '#a991f7', '#88dbdd'],
        description: 'Theme hồng lãng mạn'
    },
    {
        key: 'garden',
        label: 'Garden',
        preview: ['#5c7f67', '#ecf4e7', '#fbbf24'],
        description: 'Theme xanh thiên nhiên'
    },
    {
        key: 'aqua',
        label: 'Aqua',
        preview: ['#09ecf3', '#966fb3', '#fbbf24'],
        description: 'Theme xanh nước biển'
    }
];

interface ThemeDropdownProps {
    onThemeChange?: (theme: string) => void;
    className?: string;
}

const ThemeDropdown: React.FC<ThemeDropdownProps> = ({ onThemeChange, className }) => {
    const [currentTheme, setCurrentTheme] = useState<string>('modamint');

    useEffect(() => {
        // Get theme from localStorage or default to modamint
        const savedTheme = localStorage.getItem('dashboard-theme') || 'modamint';
        setCurrentTheme(savedTheme);
        applyTheme(savedTheme);
    }, []);

    const applyTheme = (theme: string) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('dashboard-theme', theme);

        // Add theme-aware class to body to enable theme styles
        document.body.classList.add('theme-aware');
    };

    const handleThemeSelect = (theme: string) => {
        setCurrentTheme(theme);
        applyThemeDirectly(theme);
        onThemeChange?.(theme);
    };

    const currentThemeOption = THEME_OPTIONS.find(t => t.key === currentTheme) || THEME_OPTIONS[0];

    const menuItems = THEME_OPTIONS.map(theme => ({
        key: theme.key,
        label: (
            <div style={{ padding: '8px 4px', minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {theme.preview.map((color, index) => (
                                <div
                                    key={index}
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        backgroundColor: color,
                                        borderRadius: '3px',
                                        border: '1px solid rgba(0,0,0,0.1)'
                                    }}
                                />
                            ))}
                        </div>
                        <div>
                            <div style={{ fontWeight: 500, fontSize: '14px' }}>
                                {theme.label}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                {theme.description}
                            </div>
                        </div>
                    </div>
                    {currentTheme === theme.key && (
                        <CheckOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
                    )}
                </div>
            </div>
        ),
        onClick: () => handleThemeSelect(theme.key),
    }));

    return (
        <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
            overlayStyle={{ maxHeight: '400px', overflowY: 'auto' }}
        >
            <Button
                type="text"
                className={className}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    height: 'auto'
                }}
            >
                <BgColorsOutlined style={{ fontSize: '16px' }} />
                <Space direction="vertical" size={0} style={{ alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: '12px', lineHeight: 1.2, margin: 0 }}>
                        Theme
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                            {currentThemeOption.preview.slice(0, 3).map((color, index) => (
                                <div
                                    key={index}
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        backgroundColor: color,
                                        borderRadius: '1px',
                                    }}
                                />
                            ))}
                        </div>
                        <Text style={{ fontSize: '11px', lineHeight: 1.2, margin: 0 }}>
                            {currentThemeOption.label}
                        </Text>
                    </div>
                </Space>
            </Button>
        </Dropdown>
    );
};

export default ThemeDropdown;