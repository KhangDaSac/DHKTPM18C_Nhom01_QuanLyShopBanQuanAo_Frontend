import axios from 'axios';
import type { ApiResponse } from '../authentication';

// ==================== Interfaces ====================
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
  shippingAddressId: number;
  phone: string;
  createAt: string;
  updateAt: string;
  orderItems: OrderItemResponse[];
}

// ==================== Axios instance riêng cho Order ====================
const orderApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  // Giữ withCredentials nếu backend dùng session, còn nếu chỉ dùng JWT thì có thể bỏ
  withCredentials: true,
});

// Interceptor: Tự động thêm Authorization header nếu có accessToken trong localStorage
orderApiClient.interceptors.request.use(
  (config) => {
    const authDataStr = localStorage.getItem('authData');
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

// ==================== Order Service Class ====================
class OrderService {
  async createOrder(payload: OrderRequest) {
    try {
      const resp = await orderApiClient.post<ApiResponse<OrderResponse>>('/orders', payload);
      return { success: true, data: resp.data.result };
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Network error';
      return { success: false, message };
    }
  }

  async getOrderDetailById(id: number) {
    try {
      const resp = await orderApiClient.get<ApiResponse<OrderDetailResponse>>(`/orders/detail/${id}`);
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
}

export const orderService = new OrderService();