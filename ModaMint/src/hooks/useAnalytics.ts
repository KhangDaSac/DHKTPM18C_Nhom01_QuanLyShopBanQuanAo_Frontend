import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analytics/index';
import type {
    DailySalesData,
    MonthlySalesData,
    TopSellingProduct,
    InventoryData,
    InventoryCategoryData,
    VariantMatrixData,
    OrderStatusSummary
} from '../services/analytics/index';

export const useAnalytics = () => {
    // Sales data
    const [dailySales, setDailySales] = useState<DailySalesData[]>([]);
    const [monthlySales, setMonthlySales] = useState<MonthlySalesData[]>([]);
    const [salesLoading, setSalesLoading] = useState(false);
    const [salesError, setSalesError] = useState<string | null>(null);

    // Top selling products
    const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([]);
    const [topProductsLoading, setTopProductsLoading] = useState(false);
    const [topProductsError, setTopProductsError] = useState<string | null>(null);

    // Inventory data
    const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
    const [categoryData, setCategoryData] = useState<InventoryCategoryData[]>([]);
    const [inventoryLoading, setInventoryLoading] = useState(false);
    const [inventoryError, setInventoryError] = useState<string | null>(null);

    // Variant matrix
    const [variantMatrix, setVariantMatrix] = useState<VariantMatrixData[]>([]);
    const [variantLoading, setVariantLoading] = useState(false);
    const [variantError, setVariantError] = useState<string | null>(null);

    // Order status
    const [orderStatus, setOrderStatus] = useState<OrderStatusSummary[]>([]);
    const [orderStatusLoading, setOrderStatusLoading] = useState(false);
    const [orderStatusError, setOrderStatusError] = useState<string | null>(null);

    // Fetch sales data
    const fetchSalesData = async () => {
        setSalesLoading(true);
        setSalesError(null);
        try {
            const [daily, monthly] = await Promise.all([
                analyticsService.getDailySales(30),
                analyticsService.getMonthlySales(12)
            ]);
            setDailySales(daily);
            setMonthlySales(monthly);
        } catch (error) {
            setSalesError(error instanceof Error ? error.message : 'Failed to fetch sales data');
        } finally {
            setSalesLoading(false);
        }
    };

    // Fetch top selling products
    const fetchTopProducts = async () => {
        setTopProductsLoading(true);
        setTopProductsError(null);
        try {
            const data = await analyticsService.getTopSellingProducts(10);
            setTopProducts(data);
        } catch (error) {
            setTopProductsError(error instanceof Error ? error.message : 'Failed to fetch top products');
        } finally {
            setTopProductsLoading(false);
        }
    };

    // Fetch inventory data
    const fetchInventoryData = async () => {
        setInventoryLoading(true);
        setInventoryError(null);
        try {
            const [inventory, category] = await Promise.all([
                analyticsService.getInventoryData(),
                analyticsService.getInventoryByCategory()
            ]);
            setInventoryData(inventory);
            setCategoryData(category);
        } catch (error) {
            setInventoryError(error instanceof Error ? error.message : 'Failed to fetch inventory data');
        } finally {
            setInventoryLoading(false);
        }
    };

    // Fetch variant matrix
    const fetchVariantMatrix = async () => {
        setVariantLoading(true);
        setVariantError(null);
        try {
            const data = await analyticsService.getVariantMatrix();
            setVariantMatrix(data);
        } catch (error) {
            setVariantError(error instanceof Error ? error.message : 'Failed to fetch variant matrix');
        } finally {
            setVariantLoading(false);
        }
    };

    // Fetch order status
    const fetchOrderStatus = async () => {
        setOrderStatusLoading(true);
        setOrderStatusError(null);
        try {
            const data = await analyticsService.getOrderStatusSummary();
            setOrderStatus(data);
        } catch (error) {
            setOrderStatusError(error instanceof Error ? error.message : 'Failed to fetch order status');
        } finally {
            setOrderStatusLoading(false);
        }
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchSalesData();
        fetchTopProducts();
        fetchInventoryData();
        fetchVariantMatrix();
        fetchOrderStatus();
    }, []);

    return {
        // Sales
        dailySales,
        monthlySales,
        salesLoading,
        salesError,
        refetchSales: fetchSalesData,

        // Top products
        topProducts,
        topProductsLoading,
        topProductsError,
        refetchTopProducts: fetchTopProducts,

        // Inventory
        inventoryData,
        categoryData,
        inventoryLoading,
        inventoryError,
        refetchInventory: fetchInventoryData,

        // Variant matrix
        variantMatrix,
        variantLoading,
        variantError,
        refetchVariantMatrix: fetchVariantMatrix,

        // Order status
        orderStatus,
        orderStatusLoading,
        orderStatusError,
        refetchOrderStatus: fetchOrderStatus
    };
};
