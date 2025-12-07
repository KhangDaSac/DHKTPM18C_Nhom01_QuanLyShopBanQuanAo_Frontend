import apiClient from '../../api/client';

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
            const response = await apiClient.get<ApiResponse<DailySalesData[]>>(
                `/api/charts/orders/stats/daily?days=${days}`
            );
            if (response.data.code === 1000) {
                return response.data.result;
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
            const response = await apiClient.get<ApiResponse<MonthlySalesData[]>>(
                `/api/charts/orders/stats/monthly?months=${months}`
            );
            if (response.data.code === 1000) {
                return response.data.result;
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
            const response = await apiClient.get<ApiResponse<TopSellingProduct[]>>(
                `/api/charts/products/top-selling?limit=${limit}`
            );
            if (response.data.code === 1000) {
                return response.data.result;
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
            const response = await apiClient.get<ApiResponse<VariantMatrixData[]>>(
                `/api/charts/variants/matrix`
            );
            if (response.data.code === 1000) {
                return response.data.result;
            }
            throw new Error(response.data.message || 'Failed to fetch variant matrix');
        } catch (error) {
            console.error('Error fetching variant matrix:', error);
            // Return mock data for demo
            return this.getMockVariantMatrix();
        }
    }

    // Order Status Summary
    async getOrderStatusSummary(): Promise<OrderStatusSummary[]> {
        try {
            const response = await apiClient.get<ApiResponse<OrderStatusSummary[]>>(
                `/api/charts/orders/status-summary`
            );
            if (response.data.code === 1000) {
                return response.data.result;
            }
            throw new Error(response.data.message || 'Failed to fetch order status summary');
        } catch (error) {
            console.error('Error fetching order status summary:', error);
            // Return mock data for demo
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
