import customerApiClient from '@/api/client';
import type { ApiResponse } from '@/types';

// ============================================
// TypeScript Interfaces
// ============================================

export interface CustomerSummary {
    totalCustomers: number;
    newThisMonth: number;
    activeCustomers: number;
    inactiveCustomers: number;
}

export interface CustomerNewDaily {
    dates: string[];
    newCustomers: number[];
}

export interface CustomerSegmentation {
    new: number;
    returning: number;
    vip: number;
}

export interface CustomerTopSpender {
    name: string;
    totalSpent: number;
}

// ============================================
// Mock Data Generators
// ============================================

const generateMockCustomerSummary = (): CustomerSummary => ({
    totalCustomers: 1520,
    newThisMonth: 120,
    activeCustomers: 865,
    inactiveCustomers: 655,
});

const generateMockNewCustomersDaily = (days: number = 30): CustomerNewDaily => {
    const dates: string[] = [];
    const newCustomers: number[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
        newCustomers.push(Math.floor(Math.random() * 20) + 5); // 5-25 new customers per day
    }

    return { dates, newCustomers };
};

const generateMockCustomerSegmentation = (): CustomerSegmentation => ({
    new: 35,
    returning: 55,
    vip: 10,
});

const generateMockTopSpenders = (limit: number = 10): CustomerTopSpender[] => {
    const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng'];
    const middleNames = ['Văn', 'Thị', 'Minh', 'Hữu', 'Đức', 'Anh', 'Quang', 'Tuấn', 'Thanh', 'Hồng'];
    const lastNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K'];

    return Array.from({ length: limit }, (_, i) => ({
        name: `${firstNames[i % firstNames.length]} ${middleNames[i % middleNames.length]} ${lastNames[i % lastNames.length]}`,
        totalSpent: Math.floor(Math.random() * 10000000) + 3000000, // 3M - 13M VND
    })).sort((a, b) => b.totalSpent - a.totalSpent);
};

// ============================================
// API Service Functions
// ============================================

export const customerAnalyticsService = {
    /**
     * Get customer summary statistics
     * TEMPORARY: Using mock data - endpoints not implemented yet
     * TODO: Implement /api/customers/* endpoints or use /api/charts/customers
     */
    async getCustomerSummary(): Promise<CustomerSummary> {
        // TEMPORARY: Skip API call, return mock data directly
        return generateMockCustomerSummary();

        /* COMMENTED OUT - Enable when backend is ready
        try {
            const response = await customerApiClient.get<ApiResponse<CustomerSummary>>('/api/customers/summary');

            if (response.data.success && response.data.result) {
                return response.data.result;
            }

            console.warn('⚠️ API returned no data, using mock data for customer summary');
            return generateMockCustomerSummary();
        } catch (error) {
            console.warn('⚠️ Failed to fetch customer summary, using mock data:', error);
            return generateMockCustomerSummary();
        }
        */
    },

    /**
     * Get new customers daily for specified number of days
     * TEMPORARY: Using mock data - endpoints not implemented yet
     */
    async getNewCustomersDaily(days: number = 30): Promise<CustomerNewDaily> {
        // TEMPORARY: Skip API call, return mock data directly
        return generateMockNewCustomersDaily(days);

        /* COMMENTED OUT - Enable when backend is ready
        try {
            const response = await customerApiClient.get<ApiResponse<CustomerNewDaily>>(
                `/api/customers/new/daily?days=${days}`
            );

            if (response.data.success && response.data.result) {
                return response.data.result;
            }

            console.warn('⚠️ API returned no data, using mock data for new customers daily');
            return generateMockNewCustomersDaily(days);
        } catch (error) {
            console.warn('⚠️ Failed to fetch new customers daily, using mock data:', error);
            return generateMockNewCustomersDaily(days);
        }
        */
    },

    /**
     * Get customer segmentation (new, returning, VIP)
     * TEMPORARY: Using mock data - endpoints not implemented yet
     */
    async getCustomerSegmentation(): Promise<CustomerSegmentation> {
        // TEMPORARY: Skip API call, return mock data directly
        return generateMockCustomerSegmentation();

        /* COMMENTED OUT - Enable when backend is ready
        try {
            const response = await customerApiClient.get<ApiResponse<CustomerSegmentation>>(
                '/api/customers/segmentation'
            );

            if (response.data.success && response.data.result) {
                return response.data.result;
            }

            console.warn('⚠️ API returned no data, using mock data for customer segmentation');
            return generateMockCustomerSegmentation();
        } catch (error) {
            console.warn('⚠️ Failed to fetch customer segmentation, using mock data:', error);
            return generateMockCustomerSegmentation();
        }
        */
    },

    /**
     * Get top spending customers
     * TEMPORARY: Using mock data - endpoints not implemented yet
     */
    async getTopSpenders(limit: number = 10): Promise<CustomerTopSpender[]> {
        // TEMPORARY: Skip API call, return mock data directly
        return generateMockTopSpenders(limit);

        /* COMMENTED OUT - Enable when backend is ready
        try {
            const response = await customerApiClient.get<ApiResponse<CustomerTopSpender[]>>(
                `/api/customers/top-spenders?limit=${limit}`
            );

            if (response.data.success && response.data.result) {
                return response.data.result;
            }

            console.warn('⚠️ API returned no data, using mock data for top spenders');
            return generateMockTopSpenders(limit);
        } catch (error) {
            console.warn('⚠️ Failed to fetch top spenders, using mock data:', error);
            return generateMockTopSpenders(limit);
        }
        */
    },
};
