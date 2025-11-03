import apiClient from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';

export interface CheckoutRequest {
    customerId: string;
    shippingAddressId: number;
    percentagePromotionCode?: string;
    amountPromotionCode?: string;
    paymentMethod: 'COD' | 'BANK_TRANSFER' | 'E_WALLET';
    phone?: string;
    note?: string;
}

export interface PromotionSummary {
    id: number;
    name: string;
    code: string;
    type: 'PERCENTAGE' | 'AMOUNT';
    discountPercent?: number;
    discountAmount?: number;
    minOrderValue?: number;
    startAt?: string;
    endAt?: string;
    remainingQuantity?: number;
    isActive: boolean;
    description: string;
}

export interface AddressResponse {
    id: number;
    customerId: string;
    city: string;
    district: string;
    ward: string;
    addressDetail: string;
    fullAddress: string;
}

export interface CartItemResponse {
    id: number;
    variantId: number;
    productName: string;
    color: string;
    size: string;
    price: number;
    quantity: number;
    imageUrl: string;
}

export interface CheckoutResponse {
    orderId: number;
    orderCode: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: AddressResponse;
    orderItems: CartItemResponse[];
    subtotal: number;
    shippingFee: number;
    appliedPromotion?: PromotionSummary;
    discountAmount: number;
    totalAmount: number;
    paymentMethod: string;
    orderStatus: string;
    message: string;
}

/**
 * Lấy danh sách mã giảm giá khả dụng
 */
export const getAvailablePromotions = async (customerId: string): Promise<PromotionSummary[]> => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.CHECKOUT.AVAILABLE_PROMOTIONS(customerId));
        return response.data.result || [];
    } catch (error) {
        console.error('Error fetching available promotions:', error);
        throw error;
    }
};

/**
 * Thực hiện checkout
 */
export const processCheckout = async (request: CheckoutRequest): Promise<CheckoutResponse> => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.CHECKOUT.PROCESS, request);
        return response.data.result;
    } catch (error) {
        console.error('Error processing checkout:', error);
        throw error;
    }
};

/**
 * Lấy thông tin customer (bao gồm addresses)
 */
export const getCustomerInfo = async (userId: string) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.CUSTOMERS.BY_ID(userId));
        return response.data.result;
    } catch (error) {
        console.error('Error fetching customer info:', error);
        throw error;
    }
};

/**
 * Lấy addresses của customer
 */
export const getCustomerAddresses = async (customerId: string): Promise<AddressResponse[]> => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.ADDRESSES.BY_CUSTOMER(customerId));
        return response.data.result || [];
    } catch (error) {
        console.error('Error fetching customer addresses:', error);
        return [];
    }
};
