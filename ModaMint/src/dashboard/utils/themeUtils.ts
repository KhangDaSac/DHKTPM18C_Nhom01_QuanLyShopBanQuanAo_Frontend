// Direct theme application without DaisyUI CSS variables
export const THEME_COLORS = {
    modamint: {
        primary: '#ff6347',
        primaryHover: '#ff7f50',
        primaryLight: '#ff9582',
        sidebar: 'linear-gradient(135deg, #ff6347 0%, #ff7f50 100%)',
        cardBorder: '#ffbeb1',
        statistic: '#ff6347',
        success: '#52c41a',
        warning: '#faad14',
        error: '#ff4d4f'
    },
    light: {
        primary: '#570df8',
        primaryHover: '#4c0df5',
        primaryLight: '#8b5cf6',
        sidebar: 'linear-gradient(135deg, #570df8 0%, #4c0df5 100%)',
        cardBorder: '#c4b5fd',
        statistic: '#570df8',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
    },
    dark: {
        primary: '#661ae6',
        primaryHover: '#5a17d1',
        primaryLight: '#a855f7',
        sidebar: 'linear-gradient(135deg, #661ae6 0%, #5a17d1 100%)',
        cardBorder: '#d8b4fe',
        statistic: '#661ae6',
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626'
    },
    cupcake: {
        primary: '#65c3c8',
        primaryHover: '#5bb1b6',
        primaryLight: '#7dd3d8',
        sidebar: 'linear-gradient(135deg, #65c3c8 0%, #5bb1b6 100%)',
        cardBorder: '#b2ebf2',
        statistic: '#65c3c8',
        success: '#4ade80',
        warning: '#fbbf24',
        error: '#f87171'
    },
    bumblebee: {
        primary: '#e0a82e',
        primaryHover: '#d19825',
        primaryLight: '#f3cc30',
        sidebar: 'linear-gradient(135deg, #e0a82e 0%, #d19825 100%)',
        cardBorder: '#fde68a',
        statistic: '#e0a82e',
        success: '#22c55e',
        warning: '#eab308',
        error: '#ef4444'
    },
    emerald: {
        primary: '#66cc8a',
        primaryHover: '#5bb777',
        primaryLight: '#86efac',
        sidebar: 'linear-gradient(135deg, #66cc8a 0%, #5bb777 100%)',
        cardBorder: '#bbf7d0',
        statistic: '#66cc8a',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
    }
};

export const applyThemeDirectly = (themeName: string) => {
    const colors = THEME_COLORS[themeName as keyof typeof THEME_COLORS] || THEME_COLORS.modamint;

    console.log('Applying theme:', themeName, colors);

    // Remove existing theme styles
    const existingStyle = document.getElementById('dynamic-theme-styles');
    if (existingStyle) {
        existingStyle.remove();
    }

    // Create new style element with maximum specificity
    const style = document.createElement('style');
    style.id = 'dynamic-theme-styles';
    style.innerHTML = `
        /* Ultra high specificity selectors to override Ant Design */
        html body .ant-layout .ant-typography.text-primary,
        html body .ant-layout h1.text-primary,
        html body .ant-layout h2.text-primary,
        html body .ant-layout h3.text-primary,
        html body .ant-layout .text-primary {
            color: ${colors.primary} !important;
        }
        
        html body .ant-layout .ant-btn.btn-primary,
        html body .ant-layout button.btn-primary,
        html body .ant-layout .btn-primary {
            background-color: ${colors.primary} !important;
            border-color: ${colors.primary} !important;
            color: white !important;
        }
        
        html body .ant-layout .ant-btn.btn-primary:hover,
        html body .ant-layout button.btn-primary:hover,
        html body .ant-layout .btn-primary:hover {
            background-color: ${colors.primaryHover} !important;
            border-color: ${colors.primaryHover} !important;
            color: white !important;
        }
        
        html body .ant-layout .modamint-sidebar.bg-primary .ant-layout-sider,
        html body .modamint-sidebar.bg-primary .ant-layout-sider {
            background: ${colors.sidebar} !important;
        }
        
        /* Force theme on specific elements by tag */
        [data-theme="${themeName}"] .text-primary {
            color: ${colors.primary} !important;
        }
        
        [data-theme="${themeName}"] .btn-primary {
            background-color: ${colors.primary} !important;
            border-color: ${colors.primary} !important;
        }
    `;

    // Append to head
    document.head.appendChild(style);

    // Also try direct element manipulation as backup
    setTimeout(() => {
        const titles = document.querySelectorAll('.text-primary');
        titles.forEach(title => {
            const element = title as HTMLElement;
            element.style.color = colors.primary;
            element.setAttribute('data-theme-color', colors.primary);
        });

        const buttons = document.querySelectorAll('.btn-primary');
        buttons.forEach(btn => {
            const button = btn as HTMLElement;
            button.style.backgroundColor = colors.primary;
            button.style.borderColor = colors.primary;
        });

        console.log('Direct manipulation backup applied');
    }, 100);

    // Update CSS custom properties
    document.documentElement.style.setProperty('--theme-primary', colors.primary);
    document.documentElement.style.setProperty('--theme-primary-hover', colors.primaryHover);
    document.documentElement.style.setProperty('--theme-sidebar', colors.sidebar);

    // Save theme
    localStorage.setItem('dashboard-theme', themeName);
    document.documentElement.setAttribute('data-theme', themeName);

    console.log('Theme styles injected with high specificity + CSS variables updated');
};

// Nuclear option - complete theme override
export const forceThemeNuclear = (themeName: string) => {
    const colors = THEME_COLORS[themeName as keyof typeof THEME_COLORS] || THEME_COLORS.modamint;

    console.log('🚀 NUCLEAR THEME APPLICATION:', themeName, colors);

    // Method 1: CSS injection with extreme specificity
    const styleId = 'nuclear-theme-styles';
    let style = document.getElementById(styleId) as HTMLStyleElement;

    if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
    }

    style.textContent = `
        /* 🚀 Nuclear CSS - Complete Dashboard Theme Override */
        
        /* IMPORTANT: Only apply to dashboard routes */
        [data-dashboard-theme="${themeName}"] .text-primary,
        [data-dashboard-theme="${themeName}"] .ant-typography.text-primary,
        [data-dashboard-theme="${themeName}"] h1.text-primary,
        [data-dashboard-theme="${themeName}"] h2.text-primary,
        [data-dashboard-theme="${themeName}"] h3.text-primary {
            color: ${colors.primary} !important;
        }
        
        /* Primary Buttons */
        [data-dashboard-theme="${themeName}"] .btn-primary,
        [data-dashboard-theme="${themeName}"] .ant-btn.btn-primary,
        [data-dashboard-theme="${themeName}"] .ant-btn-primary {
            background-color: ${colors.primary} !important;
            border-color: ${colors.primary} !important;
            color: white !important;
        }
        
        [data-dashboard-theme="${themeName}"] .btn-primary:hover,
        [data-dashboard-theme="${themeName}"] .ant-btn.btn-primary:hover,
        [data-dashboard-theme="${themeName}"] .ant-btn-primary:hover {
            background-color: ${colors.primaryHover} !important;
            border-color: ${colors.primaryHover} !important;
        }
        
        /* Sidebar */
        [data-dashboard-theme="${themeName}"] .modamint-sidebar .ant-layout-sider {
            background: ${colors.sidebar} !important;
        }
        
        /* Statistics */
        [data-dashboard-theme="${themeName}"] .ant-statistic-content-value {
            color: ${colors.statistic} !important;
        }
        
        /* Cards */
        [data-dashboard-theme="${themeName}"] .ant-card-head {
            border-color: ${colors.cardBorder} !important;
        }
        
        [data-dashboard-theme="${themeName}"] .ant-card-head-title {
            color: ${colors.primary} !important;
        }
        
        /* Progress bars */
        [data-dashboard-theme="${themeName}"] .ant-progress-bg {
            background-color: ${colors.primary} !important;
        }
        
        /* Tags */
        [data-dashboard-theme="${themeName}"] .ant-tag.ant-tag-success {
            background-color: ${colors.success} !important;
            border-color: ${colors.success} !important;
        }
        
        [data-dashboard-theme="${themeName}"] .ant-tag.ant-tag-warning {
            background-color: ${colors.warning} !important;
            border-color: ${colors.warning} !important;
        }
        
        [data-dashboard-theme="${themeName}"] .ant-tag.ant-tag-error {
            background-color: ${colors.error} !important;
            border-color: ${colors.error} !important;
        }
        
        /* Menu items */
        [data-dashboard-theme="${themeName}"] .ant-menu-item-selected {
            background-color: ${colors.primaryLight} !important;
        }
        
        /* Badges */
        [data-dashboard-theme="${themeName}"] .ant-badge-count {
            background-color: ${colors.primary} !important;
        }
        
        /* Dropdown menus */
        [data-dashboard-theme="${themeName}"] .ant-dropdown-menu-item:hover {
            background-color: ${colors.primaryLight} !important;
        }
        
        /* Input focus */
        [data-dashboard-theme="${themeName}"] .ant-input:focus,
        [data-dashboard-theme="${themeName}"] .ant-input-focused {
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 0 2px ${colors.primaryLight}33 !important;
        }
        
        /* Tabs */
        [data-dashboard-theme="${themeName}"] .ant-tabs-tab-active .ant-tabs-tab-btn {
            color: ${colors.primary} !important;
        }
        
        [data-dashboard-theme="${themeName}"] .ant-tabs-ink-bar {
            background-color: ${colors.primary} !important;
        }
    `;

    // Method 2: Set dashboard theme attribute (only for dashboard)
    const dashboardContainer = document.querySelector('[data-testid="dashboard-container"]') || document.body;
    dashboardContainer.setAttribute('data-dashboard-theme', themeName);

    // Method 3: Direct DOM manipulation for immediate visual feedback
    setTimeout(() => {
        // Text elements
        document.querySelectorAll('.text-primary').forEach(el => {
            const element = el as HTMLElement;
            element.style.color = colors.primary;
        });

        // Buttons
        document.querySelectorAll('.btn-primary, .ant-btn-primary').forEach(el => {
            const element = el as HTMLElement;
            element.style.backgroundColor = colors.primary;
            element.style.borderColor = colors.primary;
        });

        // Statistics
        document.querySelectorAll('.ant-statistic-content-value').forEach(el => {
            const element = el as HTMLElement;
            element.style.color = colors.statistic;
        });

        // Card titles
        document.querySelectorAll('.ant-card-head-title').forEach(el => {
            const element = el as HTMLElement;
            element.style.color = colors.primary;
        });

        // Progress bars
        document.querySelectorAll('.ant-progress-bg').forEach(el => {
            const element = el as HTMLElement;
            element.style.backgroundColor = colors.primary;
        });

        // Tabs
        document.querySelectorAll('.ant-tabs-ink-bar').forEach(el => {
            const element = el as HTMLElement;
            element.style.backgroundColor = colors.primary;
        });

        document.querySelectorAll('.ant-tabs-tab-active .ant-tabs-tab-btn').forEach(el => {
            const element = el as HTMLElement;
            element.style.color = colors.primary;
        });

        console.log('🎯 Complete dashboard theme applied:', colors);
    }, 100);

    // Save theme (dashboard specific)
    localStorage.setItem('dashboard-theme', themeName);
    document.documentElement.setAttribute('data-theme', themeName);

    console.log('🚀 COMPLETE DASHBOARD THEME APPLIED:', themeName);
};