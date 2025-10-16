import { useEffect } from 'react';
import { forceThemeNuclear } from '../utils/themeUtils';

export const useTheme = () => {
    useEffect(() => {
        // Apply saved theme on dashboard mount
        const savedTheme = localStorage.getItem('dashboard-theme') || 'modamint';

        // Use nuclear theme application for complete dashboard theming
        setTimeout(() => {
            forceThemeNuclear(savedTheme);
        }, 200); // Delay to ensure DOM is ready

        return () => {
            // Cleanup dashboard theme on unmount
            const dashboardContainer = document.querySelector('[data-testid="dashboard-container"]');
            if (dashboardContainer) {
                dashboardContainer.removeAttribute('data-dashboard-theme');
            }
        };
    }, []);
};