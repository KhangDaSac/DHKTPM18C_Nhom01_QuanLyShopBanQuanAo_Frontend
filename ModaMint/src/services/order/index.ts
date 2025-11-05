import axios from 'axios';
import type { ApiResponse } from '../authentication';

export interface OrderRequest {
  customerId?: string;
  phone?: string;
  shippingAddressId?: number;
  paymentMethod?: string;
}

export interface OrderResponse {
  id?: number;
  orderCode?: string;
  totalAmount?: number;
  message?: string;
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
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
}

export const orderService = new OrderService();
