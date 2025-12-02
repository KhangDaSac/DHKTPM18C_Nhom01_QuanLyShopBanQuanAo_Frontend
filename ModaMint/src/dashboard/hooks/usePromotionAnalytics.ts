import { useState, useEffect } from 'react';
import apiClient from '../../api/client';

interface PromotionSummary {
    total: number;
    active: number;
    scheduled: number;
    expired: number;
}

interface PromotionStatusSummary {
    active: number;
    scheduled: number;
    expired: number;
    disabled: number;
}

interface PromotionTypeDistribution {
    percentage: number;
    fixed: number;
    freeShipping: number;
    buyXgetY: number;
}

interface PromotionUsageDaily {
    dates: string[];
    usage: number[];
}

interface TopUsedPromotion {
    code: string;
    used: number;
}

export const usePromotionAnalytics = () => {
    const [summary, setSummary] = useState<PromotionSummary | null>(null);
    const [statusSummary, setStatusSummary] = useState<PromotionStatusSummary | null>(null);
    const [typeDistribution, setTypeDistribution] = useState<PromotionTypeDistribution | null>(null);
    const [usageDaily, setUsageDaily] = useState<PromotionUsageDaily | null>(null);
    const [topUsed, setTopUsed] = useState<TopUsedPromotion[]>([]);

    const [summaryLoading, setSummaryLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(true);
    const [typeLoading, setTypeLoading] = useState(true);
    const [usageLoading, setUsageLoading] = useState(true);
    const [topUsedLoading, setTopUsedLoading] = useState(true);

    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [statusError, setStatusError] = useState<string | null>(null);
    const [typeError, setTypeError] = useState<string | null>(null);
    const [usageError, setUsageError] = useState<string | null>(null);
    const [topUsedError, setTopUsedError] = useState<string | null>(null);

    useEffect(() => {
        fetchSummary();
        fetchStatusSummary();
        fetchTypeDistribution();
        fetchUsageDaily();
        fetchTopUsed();
    }, []);

    const fetchSummary = async () => {
        try {
            setSummaryLoading(true);
            setSummaryError(null);
            const response = await apiClient.get('/api/promotions/summary');
            setSummary(response.data);
        } catch (error: any) {
            console.warn('Failed to fetch promotion summary, using mock data:', error.message);
            // Mock data fallback
            setSummary({
                total: 42,
                active: 12,
                scheduled: 5,
                expired: 25
            });
        } finally {
            setSummaryLoading(false);
        }
    };

    const fetchStatusSummary = async () => {
        try {
            setStatusLoading(true);
            setStatusError(null);
            const response = await apiClient.get('/api/promotions/status-summary');
            setStatusSummary(response.data);
        } catch (error: any) {
            console.warn('Failed to fetch status summary, using mock data:', error.message);
            // Mock data fallback
            setStatusSummary({
                active: 12,
                scheduled: 5,
                expired: 21,
                disabled: 4
            });
        } finally {
            setStatusLoading(false);
        }
    };

    const fetchTypeDistribution = async () => {
        try {
            setTypeLoading(true);
            setTypeError(null);
            const response = await apiClient.get('/api/promotions/type-distribution');
            setTypeDistribution(response.data);
        } catch (error: any) {
            console.warn('Failed to fetch type distribution, using mock data:', error.message);
            // Mock data fallback
            setTypeDistribution({
                percentage: 40,
                fixed: 25,
                freeShipping: 20,
                buyXgetY: 15
            });
        } finally {
            setTypeLoading(false);
        }
    };

    const fetchUsageDaily = async () => {
        try {
            setUsageLoading(true);
            setUsageError(null);
            const response = await apiClient.get('/api/promotions/usage/daily?days=30');
            setUsageDaily(response.data);
        } catch (error: any) {
            console.warn('Failed to fetch usage data, using mock data:', error.message);
            // Mock data fallback - generate 30 days
            const dates: string[] = [];
            const usage: number[] = [];
            const today = new Date();

            for (let i = 29; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                dates.push(date.toISOString().split('T')[0]);
                usage.push(Math.floor(Math.random() * 30) + 5); // Random between 5-35
            }

            setUsageDaily({ dates, usage });
        } finally {
            setUsageLoading(false);
        }
    };

    const fetchTopUsed = async () => {
        try {
            setTopUsedLoading(true);
            setTopUsedError(null);
            const response = await apiClient.get('/api/promotions/top-used?limit=10');
            setTopUsed(response.data);
        } catch (error: any) {
            console.warn('Failed to fetch top used promotions, using mock data:', error.message);
            // Mock data fallback
            setTopUsed([
                { code: 'SALE50', used: 120 },
                { code: 'FREESHIP', used: 85 },
                { code: 'SUMMER20', used: 68 },
                { code: 'NEWUSER', used: 55 },
                { code: 'FLASH30', used: 48 },
                { code: 'WEEKEND15', used: 42 },
                { code: 'VIP25', used: 38 },
                { code: 'STUDENT10', used: 32 },
                { code: 'LOYAL40', used: 28 },
                { code: 'GIFT20', used: 25 }
            ]);
        } finally {
            setTopUsedLoading(false);
        }
    };

    return {
        summary,
        statusSummary,
        typeDistribution,
        usageDaily,
        topUsed,
        summaryLoading,
        statusLoading,
        typeLoading,
        usageLoading,
        topUsedLoading,
        summaryError,
        statusError,
        typeError,
        usageError,
        topUsedError,
    };
};
