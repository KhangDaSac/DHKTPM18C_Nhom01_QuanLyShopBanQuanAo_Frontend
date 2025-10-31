import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

// Create axios instance with interceptor
const promotionApiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor: Automatically add JWT token to every request
promotionApiClient.interceptors.request.use(
    (config) => {
        const authDataStr = localStorage.getItem("authData");
        if (authDataStr) {
            try {
                const authData = JSON.parse(authDataStr);
                if (authData?.accessToken) {
                    config.headers.Authorization = `Bearer ${authData.accessToken}`;
                }
            } catch (error) {
                console.error('Error parsing authData:', error);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// API Response wrapper
interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

// Types for Percentage Promotion
export interface PercentagePromotion {
    id?: number;
    name: string;
    code: string;
    discountPercent: number;
    minOrderValue: number;
    startAt: string;
    endAt: string;
    quantity: number;
    isActive: boolean;
    createAt?: string;
}

// Types for Amount Promotion
export interface AmountPromotion {
    id?: number;
    name: string;
    code: string;
    discountAmount: number;
    minOrderValue: number;
    startAt: string;
    endAt: string;
    quantity: number;
    isActive: boolean;
    createAt?: string;
}

// Percentage Promotion Services
export const percentagePromotionService = {
    // Get all percentage promotions
    getAll: async (): Promise<PercentagePromotion[]> => {
        const response = await promotionApiClient.get<ApiResponse<PercentagePromotion[]>>('/percentage-promotions');
        return response.data.result;
    },

    // Get percentage promotion by id
    getById: async (id: number): Promise<PercentagePromotion> => {
        const response = await promotionApiClient.get<ApiResponse<PercentagePromotion>>(`/percentage-promotions/${id}`);
        return response.data.result;
    },

    // Create percentage promotion
    create: async (data: Omit<PercentagePromotion, 'id' | 'createAt'>): Promise<PercentagePromotion> => {
        const response = await promotionApiClient.post<ApiResponse<PercentagePromotion>>('/percentage-promotions', data);
        return response.data.result;
    },

    // Update percentage promotion
    update: async (id: number, data: Omit<PercentagePromotion, 'id' | 'createAt'>): Promise<PercentagePromotion> => {
        const response = await promotionApiClient.put<ApiResponse<PercentagePromotion>>(`/percentage-promotions/${id}`, data);
        return response.data.result;
    },

    // Delete percentage promotion
    delete: async (id: number): Promise<void> => {
        await promotionApiClient.delete(`/percentage-promotions/${id}`);
    },

    // Get active percentage promotions
    getActive: async (): Promise<PercentagePromotion[]> => {
        const response = await promotionApiClient.get<ApiResponse<PercentagePromotion[]>>('/percentage-promotions/active');
        return response.data.result;
    },
};

// Amount Promotion Services
export const amountPromotionService = {
    // Get all amount promotions
    getAll: async (): Promise<AmountPromotion[]> => {
        const response = await promotionApiClient.get<ApiResponse<AmountPromotion[]>>('/amount-promotions');
        return response.data.result;
    },

    // Get amount promotion by id
    getById: async (id: number): Promise<AmountPromotion> => {
        const response = await promotionApiClient.get<ApiResponse<AmountPromotion>>(`/amount-promotions/${id}`);
        return response.data.result;
    },

    // Create amount promotion
    create: async (data: Omit<AmountPromotion, 'id' | 'createAt'>): Promise<AmountPromotion> => {
        const response = await promotionApiClient.post<ApiResponse<AmountPromotion>>('/amount-promotions', data);
        return response.data.result;
    },

    // Update amount promotion
    update: async (id: number, data: Omit<AmountPromotion, 'id' | 'createAt'>): Promise<AmountPromotion> => {
        const response = await promotionApiClient.put<ApiResponse<AmountPromotion>>(`/amount-promotions/${id}`, data);
        return response.data.result;
    },

    // Delete amount promotion
    delete: async (id: number): Promise<void> => {
        await promotionApiClient.delete(`/amount-promotions/${id}`);
    },

    // Get active amount promotions
    getActive: async (): Promise<AmountPromotion[]> => {
        const response = await promotionApiClient.get<ApiResponse<AmountPromotion[]>>('/amount-promotions/active');
        return response.data.result;
    },
};
