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
        try {
            const response = await customerApiClient.get<any>('/api/charts/customers');
            const payload = response.data?.result ?? response.data?.data ?? response.data ?? null;
            if (payload) {
                // Map backend shape to CustomerSummary. Provide safe defaults.
                const totalCustomers = Number(payload.totalCustomers ?? 0) || 0;
                const newThisMonth = Number(payload.newThisMonth ?? 0) || 0;
                const activeCustomers = Number(payload.activeCustomers ?? payload.active ?? 0) || 0;
                const inactiveCustomers = Number(payload.inactiveCustomers ?? (totalCustomers - activeCustomers) ?? 0) || 0;
                return {
                    totalCustomers,
                    newThisMonth,
                    activeCustomers,
                    inactiveCustomers,
                };
            }
            console.warn('customerAnalyticsService.getCustomerSummary - no payload, using mock');
            return generateMockCustomerSummary();
        } catch (error) {
            console.warn('Failed to fetch customer summary, using mock data:', error);
            return generateMockCustomerSummary();
        }
    },

    /**
     * Get new customers daily for specified number of days
     * TEMPORARY: Using mock data - endpoints not implemented yet
     */
    async getNewCustomersDaily(days: number = 30): Promise<CustomerNewDaily> {
        try {
            const response = await customerApiClient.get<any>(`/api/charts/customers`);
            const payload = response.data?.result ?? response.data?.data ?? response.data ?? null;
            if (payload && Array.isArray(payload.newCustomersDaily)) {
                const arr = payload.newCustomersDaily as Array<{ date: string; count: number }>;
                // Normalize dates to ISO (YYYY-MM-DD) and build a map for quick lookup
                const map = new Map<string, number>();
                arr.forEach(item => {
                    try {
                        const d = item.date ?? (item.day ?? null);
                        if (!d) return;
                        const iso = new Date(d).toISOString().split('T')[0];
                        map.set(iso, Number(item.count ?? item.value ?? 0) || 0);
                    } catch (e) {
                        // ignore invalid date
                    }
                });

                // Build contiguous last N days ending today (client local timezone)
                const dates: string[] = [];
                const counts: number[] = [];
                const today = new Date();
                for (let i = days - 1; i >= 0; i--) {
                    const d = new Date(today);
                    d.setDate(d.getDate() - i);
                    const iso = d.toISOString().split('T')[0];
                    dates.push(iso);
                    counts.push(map.get(iso) ?? 0);
                }

                return { dates, newCustomers: counts };
            }

            // If backend only returns a single number for new customers in the period
            if (payload && (typeof payload.newCustomers === 'number' || typeof payload.newCustomers === 'string')) {
                const totalNew = Number(payload.newCustomers) || 0;
                const dates: string[] = [];
                const counts: number[] = [];
                const today = new Date();
                for (let i = days - 1; i >= 0; i--) {
                    const d = new Date(today);
                    d.setDate(d.getDate() - i);
                    const iso = d.toISOString().split('T')[0];
                    dates.push(iso);
                    counts.push(0);
                }
                // Put the reported total on the last day (most recent)
                counts[counts.length - 1] = totalNew;
                return { dates, newCustomers: counts };
            }

            console.warn('customerAnalyticsService.getNewCustomersDaily - payload missing or invalid, using mock');
            return generateMockNewCustomersDaily(days);
        } catch (error) {
            console.warn('Failed to fetch new customers daily, using mock data:', error);
            return generateMockNewCustomersDaily(days);
        }
    },

    /**
     * Get customer segmentation (new, returning, VIP)
     * TEMPORARY: Using mock data - endpoints not implemented yet
     */
    async getCustomerSegmentation(): Promise<CustomerSegmentation> {
        try {
            // Backend may not provide segmentation separately; attempt to derive
            const response = await customerApiClient.get<any>('/api/charts/customers');
            const payload = response.data?.result ?? response.data?.data ?? response.data ?? null;
            if (payload) {
                // If segmentation provided directly, use it
                if (payload.segmentation && typeof payload.segmentation === 'object') {
                    return {
                        new: Number(payload.segmentation.new ?? payload.segmentation.newPercent ?? payload.segmentation.new) || 0,
                        returning: Number(payload.segmentation.returning ?? payload.segmentation.returningPercent ?? 0) || 0,
                        vip: Number(payload.segmentation.vip ?? payload.segmentation.vipPercent ?? 0) || 0,
                    };
                }

                // Otherwise try to derive from summary (best-effort)
                const total = Number(payload.totalCustomers ?? 0) || 0;
                const newCount = Array.isArray(payload.newCustomersDaily)
                    ? (payload.newCustomersDaily.reduce((s: number, it: any) => s + (Number(it.count) || 0), 0) || 0)
                    : 0;
                const active = Number(payload.activeCustomers ?? 0) || 0;
                const returning = Math.max(0, active - newCount);
                const vip = Number((payload.vipCount ?? payload.vipCustomers ?? 0)) || 0;

                // Convert to percentages (0-100)
                if (total > 0) {
                    return {
                        new: Math.round((newCount / total) * 100),
                        returning: Math.round((returning / total) * 100),
                        vip: Math.round((vip / total) * 100),
                    };
                }
            }

            // Fallback to mock
            console.warn('customerAnalyticsService.getCustomerSegmentation - fallback to mock');
            return generateMockCustomerSegmentation();
        } catch (error) {
            console.warn('Failed to fetch customer segmentation, using mock data:', error);
            return generateMockCustomerSegmentation();
        }
    },

    /**
     * Get top spending customers
     * TEMPORARY: Using mock data - endpoints not implemented yet
     */
    async getTopSpenders(limit: number = 10): Promise<CustomerTopSpender[]> {
        try {
            const response = await customerApiClient.get<any>('/api/charts/customers');
            const payload = response.data?.result ?? response.data?.data ?? response.data ?? null;
            if (payload && Array.isArray(payload.topSpenders)) {
                const top = (payload.topSpenders as Array<any>).slice(0, limit).map(item => ({
                    name: item.customerName ?? item.name ?? item.customerId ?? 'Khách hàng',
                    totalSpent: Number(item.totalSpent ?? item.total ?? item.amount ?? 0) || 0
                }));
                return top;
            }

            console.warn('customerAnalyticsService.getTopSpenders - payload missing, using mock');
            return generateMockTopSpenders(limit);
        } catch (error) {
            console.warn('Failed to fetch top spenders, using mock data:', error);
            return generateMockTopSpenders(limit);
        }
    },
};
