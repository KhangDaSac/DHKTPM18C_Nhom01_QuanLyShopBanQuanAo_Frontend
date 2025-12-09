import apiClient from '../../api/client';
import { productVariantService } from '../productVariant';
import { orderService } from '../order';

export interface DailySalesData {
    date: string;
    revenue: number;
    orders: number;
}

export interface MonthlySalesData {
    month: string;
    revenue: number;
    orders: number;
}

export interface TopSellingProduct {
    productId: number;
    productName: string;
    totalSold: number;
    revenue: number;
}

export interface InventoryData {
    productId: number;
    productName: string;
    quantity: number;
    categoryName: string;
}

export interface InventoryCategoryData {
    categoryName: string;
    totalQuantity: number;
    percentage: number;
}

export interface VariantMatrixData {
    color: string;
    size: string;
    quantity: number;
}

export interface OrderStatusSummary {
    status: string;
    count: number;
    percentage: number;
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

class AnalyticsService {
    // Sales Analytics
    async getDailySales(days: number = 30): Promise<DailySalesData[]> {
        try {
            // Backend exposes sales endpoints under /api/charts/sales
            const response = await apiClient.get<ApiResponse<DailySalesData[]>>(
                `/api/charts/sales/daily`
            );
            if (response.data.code === 1000) {
                const result = response.data.result;
                // If backend returned an array of DailySalesData, return it
                if (Array.isArray(result)) return result;
                // If backend returned an object (summary), it's not the expected timeseries
                // Log and throw to trigger mock fallback
                console.warn('getDailySales: unexpected payload shape, expected array but got', typeof result);
                throw new Error('Unexpected daily sales payload');
            }
            throw new Error(response.data.message || 'Failed to fetch daily sales');
        } catch (error) {
            console.error('Error fetching daily sales:', error);
            // Return mock data for demo
            return this.getMockDailySales(days);
        }
    }

    async getMonthlySales(months: number = 12): Promise<MonthlySalesData[]> {
        try {
            // Backend exposes sales endpoints under /api/charts/sales
            const response = await apiClient.get<ApiResponse<MonthlySalesData[]>>(
                `/api/charts/sales/monthly`
            );
            if (response.data.code === 1000) {
                const result = response.data.result;
                if (Array.isArray(result)) return result;
                console.warn('getMonthlySales: unexpected payload shape, expected array but got', typeof result);
                throw new Error('Unexpected monthly sales payload');
            }
            throw new Error(response.data.message || 'Failed to fetch monthly sales');
        } catch (error) {
            console.error('Error fetching monthly sales:', error);
            // Return mock data for demo
            return this.getMockMonthlySales(months);
        }
    }

    // Top Selling Products
    async getTopSellingProducts(limit: number = 10): Promise<TopSellingProduct[]> {
        try {
            const response = await apiClient.get<ApiResponse<any[]>>(
                `/api/charts/products/top-selling?limit=${limit}`
            );
            // Debug: log full response to help diagnose missing data
            console.debug('getTopSellingProducts - raw response:', response.data);
            if (response.data.code === 1000) {
                // Backend may return fields with different names (e.g. productName, qtySold, revenue)
                // Normalize the response into the frontend TopSellingProduct shape.
                // Support several possible payload shapes (result, data, nested result)
                let raw: any[] = [];
                if (Array.isArray(response.data.result)) raw = response.data.result;
                else if (Array.isArray((response.data as any).data)) raw = (response.data as any).data;
                else if (response.data.result && Array.isArray((response.data.result as any).result)) raw = (response.data.result as any).result;
                else raw = response.data.result ?? [];
                const normalized: TopSellingProduct[] = raw.map((item: any, index: number) => ({
                    productId: (item.productId ?? item.id ?? 0) as number,
                    productName: (item.productName ?? item.product_name ?? item.name ?? `Sản phẩm ${index + 1}`) as string,
                    totalSold: (item.totalSold ?? item.qtySold ?? item.qty ?? 0) as number,
                    revenue: (item.revenue ?? item.revenueAmount ?? item.totalRevenue ?? 0) as number
                }));
                return normalized;
            }
            throw new Error(response.data.message || 'Failed to fetch top selling products');
        } catch (error) {
            console.error('Error fetching top selling products:', error);
            // Return mock data for demo
            return this.getMockTopSellingProducts(limit);
        }
    }

    // Inventory Analytics
    async getInventoryData(): Promise<InventoryData[]> {
        try {
            const response = await apiClient.get<ApiResponse<InventoryData[]>>(
                `/api/charts/products/inventory`
            );
            if (response.data.code === 1000) {
                return response.data.result;
            }
            throw new Error(response.data.message || 'Failed to fetch inventory data');
        } catch (error) {
            console.error('Error fetching inventory data:', error);
            // Return mock data for demo
            return this.getMockInventoryData();
        }
    }

    async getInventoryByCategory(): Promise<InventoryCategoryData[]> {
        try {
            const response = await apiClient.get<ApiResponse<InventoryCategoryData[]>>(
                `/api/charts/products/inventory/by-category`
            );
            if (response.data.code === 1000) {
                return response.data.result;
            }
            throw new Error(response.data.message || 'Failed to fetch inventory by category');
        } catch (error) {
            console.error('Error fetching inventory by category:', error);
            // Return mock data for demo
            return this.getMockInventoryByCategory();
        }
    }

    // Variant Matrix
    async getVariantMatrix(): Promise<VariantMatrixData[]> {
        try {
            // Variant matrix is exposed under the charts namespace
            const response = await apiClient.get<ApiResponse<VariantMatrixData[]>>(
                `/api/charts/variants/matrix`
            );
            if (response.data.code === 1000) {
                return response.data.result;
            }
            throw new Error(response.data.message || 'Failed to fetch variant matrix');
        } catch (error) {
            console.error('Error fetching variant matrix:', error);
            // If the dedicated charts endpoint is not available, fall back to fetching
            // all product variants and aggregating them into a matrix. This ensures
            // the dashboard shows real backend data instead of static mocks.
            try {
                const resp = await productVariantService.getAllProductVariants();
                if (resp.success && resp.data) {
                    const variants = resp.data;
                    // Aggregate by color × size
                    const map = new Map<string, VariantMatrixData>();
                    variants.forEach(v => {
                        const color = v.color || 'Unknown';
                        const size = v.size || 'N/A';
                        const key = `${color}||${size}`;
                        const existing = map.get(key);
                        const qty = v.quantity || 0;
                        if (existing) {
                            existing.quantity += qty;
                        } else {
                            map.set(key, { color, size, quantity: qty });
                        }
                    });
                    return Array.from(map.values());
                }
            } catch (innerError) {
                console.error('Fallback: error aggregating product variants:', innerError);
            }

            // Final fallback: return mock data for demo
            return this.getMockVariantMatrix();
        }
    }

    // Order Status Summary
    async getOrderStatusSummary(grouped: boolean = true): Promise<OrderStatusSummary[]> {
        // Map backend order status codes into dashboard groups
        const statusGroupMap: Record<string, string> = {
            PENDING: 'Chờ xác nhận',
            CONFIRMED: 'Chờ xác nhận',
            PREPARING: 'Đang xử lý',
            ARRIVED_AT_LOCATION: 'Đang giao',
            SHIPPED: 'Đang giao',
            DELIVERED: 'Hoàn thành',
            CANCELLED: 'Đã hủy',
            RETURNED: 'Đã trả hàng'
        };

        try {
            const response = await apiClient.get<ApiResponse<OrderStatusSummary[]>>(
                `/api/charts/orders/status-summary`
            );
            console.debug('analytics.getOrderStatusSummary - raw response:', response.data);
            const code = response.data?.code;
            if (code === 1000 || code === 2000) {
                const res = response.data.result ?? (response.data as any).data ?? null;
                // Normalize array-shaped responses: backend may return { status, total }
                if (Array.isArray(res)) {
                    // compute numeric counts for each item (supporting 'count' or 'total')
                    const rawItems = (res as any[]).map((item, idx) => ({
                        status: (item.status ?? item.label ?? item.name ?? `Trạng thái ${idx + 1}`).toString(),
                        count: Number(item.count ?? item.total ?? item.value ?? 0) || 0
                    }));
                    const totalRaw = rawItems.reduce((s, it) => s + it.count, 0) || 1;
                    if (!grouped) {
                        // Return detailed list (raw statuses) with computed percentage
                        return rawItems.map(it => ({ status: it.status, count: it.count, percentage: Math.round((it.count / totalRaw) * 100 * 10) / 10 }));
                    }
                    // grouped === true -> roll up into dashboard categories
                    const groupedMap: Record<string, number> = {};
                    rawItems.forEach(it => {
                        const grp = statusGroupMap[it.status] ?? it.status;
                        groupedMap[grp] = (groupedMap[grp] || 0) + it.count;
                    });
                    const totalGrouped = Object.values(groupedMap).reduce((s, v) => s + v, 0) || 1;
                    return Object.entries(groupedMap).map(([k, v]) => ({ status: k, count: v, percentage: Math.round((v / totalGrouped) * 100 * 10) / 10 }));
                }
                // If backend returned an object of counts, convert to array
                if (res && typeof res === 'object') {
                    // res is like { PENDING: 5, SHIPPED: 2 }
                    const rawItems: { status: string; count: number }[] = [];
                    for (const k of Object.keys(res)) {
                        const count = Number((res as any)[k]) || 0;
                        rawItems.push({ status: k, count });
                    }
                    const totalRaw = rawItems.reduce((s, it) => s + it.count, 0) || 1;
                    if (!grouped) {
                        return rawItems.map(it => ({ status: it.status, count: it.count, percentage: Math.round((it.count / totalRaw) * 100 * 10) / 10 }));
                    }
                    const groupedMap: Record<string, number> = {};
                    rawItems.forEach(it => {
                        const grp = statusGroupMap[it.status] ?? it.status;
                        groupedMap[grp] = (groupedMap[grp] || 0) + it.count;
                    });
                    const total = Object.values(groupedMap).reduce((s, v) => s + v, 0) || 1;
                    return Object.entries(groupedMap).map(([k, v]) => ({ status: k, count: v, percentage: Math.round((v / total) * 100 * 10) / 10 }));
                }
            }
            throw new Error(response.data.message || 'Failed to fetch order status summary');
        } catch (error) {
            console.error('Error fetching order status summary:', error);
            // Fallback: aggregate statuses from orders API
            try {
                const resp = await orderService.getAllOrders();
                console.debug('analytics.getOrderStatusSummary - fallback orderService.getAllOrders response:', resp);
                if (resp.success && Array.isArray(resp.data)) {
                    const orders = resp.data as any[];
                    // Aggregate using the grouping map so multiple internal statuses roll up
                    const grouped: Record<string, number> = {};
                    orders.forEach(o => {
                        const raw = (o.orderStatus ?? 'UNKNOWN').toString();
                        const group = statusGroupMap[raw] ?? raw;
                        grouped[group] = (grouped[group] || 0) + 1;
                    });
                    const total = Object.values(grouped).reduce((s, v) => s + v, 0) || 1;
                    const result: OrderStatusSummary[] = Object.entries(grouped).map(([k, v]) => ({
                        status: k,
                        count: v,
                        percentage: Math.round((v / total) * 100 * 10) / 10
                    }));
                    return result;
                }
            } catch (inner) {
                console.error('Fallback aggregating orders failed:', inner);
            }

            // Final fallback: return mock data for demo
            return this.getMockOrderStatusSummary();
        }
    }

    // Mock data generators
    private getMockDailySales(days: number): DailySalesData[] {
        const data: DailySalesData[] = [];
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toISOString().split('T')[0],
                revenue: Math.floor(Math.random() * 10000000) + 5000000,
                orders: Math.floor(Math.random() * 50) + 10
            });
        }
        return data;
    }

    private getMockMonthlySales(months: number): MonthlySalesData[] {
        const data: MonthlySalesData[] = [];
        const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        const today = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            data.push({
                month: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
                revenue: Math.floor(Math.random() * 200000000) + 100000000,
                orders: Math.floor(Math.random() * 500) + 200
            });
        }
        return data;
    }

    private getMockTopSellingProducts(limit: number): TopSellingProduct[] {
        const products = [
            'Áo thun nam basic', 'Quần jean nữ', 'Váy midi hoa', 'Áo sơ mi trắng',
            'Quần short kaki', 'Áo khoác bomber', 'Chân váy xòe', 'Áo polo nam',
            'Quần baggy nữ', 'Áo sweater hoodie'
        ];
        return products.slice(0, limit).map((name, index) => ({
            productId: index + 1,
            productName: name,
            totalSold: Math.floor(Math.random() * 500) + 100,
            revenue: Math.floor(Math.random() * 50000000) + 10000000
        }));
    }

    private getMockInventoryData(): InventoryData[] {
        const products = [
            { name: 'Áo thun nam basic', category: 'Áo thun' },
            { name: 'Quần jean nữ', category: 'Quần' },
            { name: 'Váy midi hoa', category: 'Váy' },
            { name: 'Áo sơ mi trắng', category: 'Áo sơ mi' },
            { name: 'Quần short kaki', category: 'Quần' },
            { name: 'Áo khoác bomber', category: 'Áo khoác' },
            { name: 'Chân váy xòe', category: 'Váy' },
            { name: 'Áo polo nam', category: 'Áo thun' }
        ];
        return products.map((p, index) => ({
            productId: index + 1,
            productName: p.name,
            quantity: Math.floor(Math.random() * 200) + 10,
            categoryName: p.category
        }));
    }

    private getMockInventoryByCategory(): InventoryCategoryData[] {
        return [
            { categoryName: 'Áo thun', totalQuantity: 350, percentage: 30 },
            { categoryName: 'Quần', totalQuantity: 280, percentage: 24 },
            { categoryName: 'Váy', totalQuantity: 230, percentage: 20 },
            { categoryName: 'Áo sơ mi', totalQuantity: 180, percentage: 15 },
            { categoryName: 'Áo khoác', totalQuantity: 130, percentage: 11 }
        ];
    }

    private getMockVariantMatrix(): VariantMatrixData[] {
        const colors = ['Đỏ', 'Xanh', 'Trắng', 'Đen', 'Vàng'];
        const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
        const data: VariantMatrixData[] = [];
        colors.forEach(color => {
            sizes.forEach(size => {
                data.push({
                    color,
                    size,
                    quantity: Math.floor(Math.random() * 100)
                });
            });
        });
        return data;
    }

    private getMockOrderStatusSummary(): OrderStatusSummary[] {
        return [
            { status: 'Chờ xác nhận', count: 45, percentage: 18 },
            { status: 'Đang xử lý', count: 78, percentage: 31 },
            { status: 'Đang giao', count: 52, percentage: 21 },
            { status: 'Hoàn thành', count: 65, percentage: 26 },
            { status: 'Đã hủy', count: 10, percentage: 4 }
        ];
    }
}

export const analyticsService = new AnalyticsService();
