import { useState, useEffect } from 'react';
import { customerAnalyticsService } from '@/services/customer/analytics';
import type {
    CustomerSummary,
    CustomerNewDaily,
    CustomerSegmentation,
    CustomerTopSpender,
} from '@/services/customer/analytics';

interface UseCustomerAnalyticsReturn {
    // Data
    summary: CustomerSummary | null;
    newCustomersDaily: CustomerNewDaily | null;
    segmentation: CustomerSegmentation | null;
    topSpenders: CustomerTopSpender[] | null;

    // Loading states
    summaryLoading: boolean;
    newCustomersLoading: boolean;
    segmentationLoading: boolean;
    topSpendersLoading: boolean;

    // Error states
    summaryError: string | null;
    newCustomersError: string | null;
    segmentationError: string | null;
    topSpendersError: string | null;

    // Refetch functions
    refetchSummary: () => Promise<void>;
    refetchNewCustomers: () => Promise<void>;
    refetchSegmentation: () => Promise<void>;
    refetchTopSpenders: () => Promise<void>;
    refetchAll: () => Promise<void>;
}

export const useCustomerAnalytics = (): UseCustomerAnalyticsReturn => {
    // Data states
    const [summary, setSummary] = useState<CustomerSummary | null>(null);
    const [newCustomersDaily, setNewCustomersDaily] = useState<CustomerNewDaily | null>(null);
    const [segmentation, setSegmentation] = useState<CustomerSegmentation | null>(null);
    const [topSpenders, setTopSpenders] = useState<CustomerTopSpender[] | null>(null);

    // Loading states
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [newCustomersLoading, setNewCustomersLoading] = useState(false);
    const [segmentationLoading, setSegmentationLoading] = useState(false);
    const [topSpendersLoading, setTopSpendersLoading] = useState(false);

    // Error states
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [newCustomersError, setNewCustomersError] = useState<string | null>(null);
    const [segmentationError, setSegmentationError] = useState<string | null>(null);
    const [topSpendersError, setTopSpendersError] = useState<string | null>(null);

    // Fetch customer summary
    const fetchSummary = async () => {
        setSummaryLoading(true);
        setSummaryError(null);
        try {
            const data = await customerAnalyticsService.getCustomerSummary();
            setSummary(data);
        } catch (error) {
            setSummaryError('Không thể tải tổng quan khách hàng');
            console.error('Error fetching customer summary:', error);
        } finally {
            setSummaryLoading(false);
        }
    };

    // Fetch new customers daily
    const fetchNewCustomers = async () => {
        setNewCustomersLoading(true);
        setNewCustomersError(null);
        try {
            const data = await customerAnalyticsService.getNewCustomersDaily(30);
            setNewCustomersDaily(data);
        } catch (error) {
            setNewCustomersError('Không thể tải dữ liệu khách hàng mới');
            console.error('Error fetching new customers daily:', error);
        } finally {
            setNewCustomersLoading(false);
        }
    };

    // Fetch customer segmentation
    const fetchSegmentation = async () => {
        setSegmentationLoading(true);
        setSegmentationError(null);
        try {
            const data = await customerAnalyticsService.getCustomerSegmentation();
            setSegmentation(data);
        } catch (error) {
            setSegmentationError('Không thể tải phân loại khách hàng');
            console.error('Error fetching customer segmentation:', error);
        } finally {
            setSegmentationLoading(false);
        }
    };

    // Fetch top spenders
    const fetchTopSpenders = async () => {
        setTopSpendersLoading(true);
        setTopSpendersError(null);
        try {
            const data = await customerAnalyticsService.getTopSpenders(10);
            setTopSpenders(data);
        } catch (error) {
            setTopSpendersError('Không thể tải khách hàng chi tiêu cao');
            console.error('Error fetching top spenders:', error);
        } finally {
            setTopSpendersLoading(false);
        }
    };

    // Refetch all data
    const refetchAll = async () => {
        await Promise.all([
            fetchSummary(),
            fetchNewCustomers(),
            fetchSegmentation(),
            fetchTopSpenders(),
        ]);
    };

    // Initial data fetch
    useEffect(() => {
        refetchAll();
    }, []);

    return {
        // Data
        summary,
        newCustomersDaily,
        segmentation,
        topSpenders,

        // Loading states
        summaryLoading,
        newCustomersLoading,
        segmentationLoading,
        topSpendersLoading,

        // Error states
        summaryError,
        newCustomersError,
        segmentationError,
        topSpendersError,

        // Refetch functions
        refetchSummary: fetchSummary,
        refetchNewCustomers: fetchNewCustomers,
        refetchSegmentation: fetchSegmentation,
        refetchTopSpenders: fetchTopSpenders,
        refetchAll,
    };
};
