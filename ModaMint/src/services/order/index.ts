import axios from 'axios';
import type { ApiResponse } from '../authentication';

export interface OrderRequest {
  customerId?: string;
  phone?: string;
  shippingAddressId?: number;
  paymentMethod?: string;
}

export interface OrderResponse {
  id: number;
  orderCode: string;
  customerId: string;
  totalAmount: number;
  subTotal: number;
  promotionId?: number;
  promotionValue?: number;
  orderStatus: 'PENDING' | 'PREPARING' | 'ARRIVED_AT_LOCATION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  paymentMethod: 'CASH_ON_DELIVERY' | 'BANK_TRANSFER' | 'E_WALLET';
  shippingAddressId?: number;
  phone?: string;
  createAt: string;
  updateAt: string;
}

export interface PaymentResponse {
  paymentUrl: string;
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Interceptor để tự động thêm Authorization header
client.interceptors.request.use((config) => {
  const authDataStr = localStorage.getItem('authData');
  if (authDataStr) {
    try {
      const authData = JSON.parse(authDataStr);
      if (authData?.accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${authData.accessToken}`;
      }
    } catch (e) {
      console.error('Error parsing authData:', e);
    }
  }
  return config;
});


class OrderService {
  async createOrder(payload: OrderRequest) {
    try {
      const resp = await client.post<ApiResponse<OrderResponse>>('/orders', payload);
      return { success: true, data: resp.data.result };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  }

  async getOrdersByCustomerId(customerId: string) {
    try {
      const resp = await client.get<ApiResponse<OrderResponse[]>>(`/orders/customer/${customerId}`);
      return { success: true, data: resp.data.result };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  }

  async retryPayment(orderId: number) {
    try {
      const resp = await client.post<ApiResponse<PaymentResponse>>(`/payment/retry-payment/${orderId}`);
      return { success: true, data: resp.data.result, message: resp.data.message };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err?.message || 'Network error';
      return { success: false, message: errorMessage };
    }
  }
}

export const orderService = new OrderService();

