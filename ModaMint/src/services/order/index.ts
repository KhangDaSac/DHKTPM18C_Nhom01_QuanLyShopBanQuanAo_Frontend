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
  promotionId?: string;
  promotionValue?: number;
  orderStatus: 'PENDING' | 'PREPARING' | 'ARRIVED_AT_LOCATION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  paymentMethod: 'COD' | 'BANK_TRANSFER' | 'E_WALLET';
  shippingAddressId?: number;
  phone: string;
  createAt: string;
  updateAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
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

  async getAllOrders() {
    try {
      const resp = await client.get<ApiResponse<OrderResponse[]>>('/orders');
      return { success: true, data: resp.data.result };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error', data: [] };
    }
  }

  async getOrdersWithPagination(page: number = 0, size: number = 10, sortBy: string = 'id', sortDirection: string = 'desc') {
    try {
      const resp = await client.get<ApiResponse<PageResponse<OrderResponse>>>(
        `/orders/paginated?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
      );
      return { success: true, data: resp.data.result };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error', data: null };
    }
  }

  async getOrderById(id: number) {
    try {
      const resp = await client.get<ApiResponse<OrderResponse>>(`/orders/${id}`);
      return { success: true, data: resp.data.result };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error', data: null };
    }
  }

  async getOrdersByCustomerId(customerId: string) {
    try {
      const resp = await client.get<ApiResponse<OrderResponse[]>>(`/orders/customer/${customerId}`);
      return { success: true, data: resp.data.result };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error', data: [] };
    }
  }

  async getOrdersByStatus(status: string) {
    try {
      const resp = await client.get<ApiResponse<OrderResponse[]>>(`/orders/status/${status}`);
      return { success: true, data: resp.data.result };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error', data: [] };
    }
  }

  async updateOrder(id: number, payload: OrderRequest) {
    try {
      const resp = await client.put<ApiResponse<OrderResponse>>(`/orders/${id}`, payload);
      return { success: true, data: resp.data.result };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  }

  async deleteOrder(id: number) {
    try {
      const resp = await client.delete<ApiResponse<string>>(`/orders/${id}`);
      return { success: true, data: resp.data.result };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  }

  async getTotalOrderCount() {
    try {
      const resp = await client.get<ApiResponse<number>>('/orders/count');
      return { success: true, data: resp.data.result };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error', data: 0 };
    }
  }
}

export const orderService = new OrderService();
