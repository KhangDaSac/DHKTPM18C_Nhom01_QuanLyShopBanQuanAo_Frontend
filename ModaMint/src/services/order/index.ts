// ======== services/order.ts =========
import axios from 'axios';
import type { ApiResponse } from '../authentication';

export interface OrderItemResponse {
  id: number;
  productId: number;
  productVariantId: number;
  productVariantName: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  productVariantImage: string;
}

export interface OrderDetailResponse {
  id: number;
  orderCode: string;
  customerId: string;
  totalAmount: number;
  subTotal: number;
  percentPromotionId: number | null;
  amountPromotionId: number | null;
  promotionValue: number;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus?: string;
  shippingAddressId: number;
  phone: string;
  createAt: string;
  updateAt: string;
  orderItems: OrderItemResponse[];
  orderStatusHistories?: {
    id: number;
    orderStatus: string;
    message?: string;
    createdAt: string;
    actor?: string;
  }[];
}

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
  orderStatus:
  | 'PENDING'
  | 'PREPARING'
  | 'ARRIVED_AT_LOCATION'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';
  paymentMethod: 'COD' | 'BANK_TRANSFER' | 'E_WALLET';
  shippingAddressId?: number;
  phone: string;
  createAt: string;
  updateAt: string;
  paymentStatus?: string;
}

export interface PaymentResponse {
  paymentUrl: string;

}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;

}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Add Authorization automatically
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


  async getAllOrders() {
    try {
      const resp = await client.get<ApiResponse<OrderResponse[]>>('/orders');
      return { success: true, data: resp.data.result };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error', data: [] };
    }
  }

  async getOrdersWithPagination(
    page = 0,
    size = 10,
    sortBy = 'id',
    sortDirection = 'desc'
  ) {
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

      return { success: false, message: err?.message || 'Network error' };
    }
  }



  async cancelOrder(orderId: number, customerId: string, cancelReason: string) {
    try {
      const resp = await client.put<ApiResponse<string>>(
        `/orders/${orderId}/cancel?customerId=${customerId}&cancelReason=${encodeURIComponent(
          cancelReason
        )}`
      );
      return {
        success: true,
        data: resp.data.result,
        message: resp.data.message || 'Hủy đơn hàng thành công',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Network error',
        data: [],
      };
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


  async retryPayment(orderId: number) {
    try {
      const resp = await client.post<ApiResponse<PaymentResponse>>(`/payment/retry-payment/${orderId}`);
      return { success: true, data: resp.data.result, message: resp.data.message };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err?.message || 'Network error';
      return { success: false, message: errorMessage };
    }
  }
  async getOrderDetailById(id: number) {
    try {
      const resp = await client.get<ApiResponse<OrderDetailResponse>>(`/orders/detail/${id}`);
      return {
        success: true,
        data: resp.data.result,
        message: resp.data.message,
      };
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        'Không tìm thấy đơn hàng hoặc lỗi mạng';
      return { success: false, message };
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
