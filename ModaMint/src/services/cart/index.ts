import axios from 'axios';
import type { ApiResponse } from '../authentication';

export interface CartItemDto {
  itemId: number;
  variantId?: number;
  productId?: number;
  productName?: string;
  image?: string;
  unitPrice?: number;
  quantity?: number;
  totalPrice?: number;
}

export interface CartDto {
  id?: number;
  sessionId?: string;
  items?: CartItemDto[];
  subtotal?: number;
  shipping?: number;
  total?: number;
}

const cartClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

cartClient.interceptors.request.use((config) => {
  const authDataStr = localStorage.getItem('authData');
  if (authDataStr) {
    try {
      const authData = JSON.parse(authDataStr);
      if (authData?.accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${authData.accessToken}`;
      }
    } catch (e) {}
  }
  return config;
});

class CartService {
  async getCart(sessionId?: string) : Promise<{ success: boolean; data?: CartDto; message?: string }> {
    try {
      const stored = localStorage.getItem('cartSessionId');
      const sid = sessionId ?? stored;
      const url = '/carts' + (sid ? `?sessionId=${encodeURIComponent(sid)}` : '');
      const resp = await cartClient.get<ApiResponse<CartDto>>(url);
      return { success: true, data: resp.data.result };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  }

  async addItem(payload: { variantId: number; quantity?: number; sessionId?: string }) {
    try {
      // Ensure we include existing sessionId so backend will append to the same cart
      const stored = localStorage.getItem('cartSessionId');
      const body = { ...(payload || {}), sessionId: payload.sessionId ?? stored };
      const resp = await cartClient.post<ApiResponse<CartDto>>('/carts/items', body);
      const cart = resp.data.result;
      if (cart?.sessionId) {
        try { localStorage.setItem('cartSessionId', cart.sessionId); } catch (e) {}
      }
      return { success: true, data: cart };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  }

  async updateItem(itemId: number, quantity: number) {
    try {
      const resp = await cartClient.put<ApiResponse<CartItemDto>>(`/carts/items/${itemId}`, { quantity });
      return { success: true, data: resp.data.result };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  }

  async deleteItem(itemId: number) {
    try {
      const resp = await cartClient.delete<ApiResponse<void>>(`/carts/items/${itemId}`);
      return { success: true, message: resp.data.message };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  }

  async clearCart() {
    try {
      const resp = await cartClient.delete<ApiResponse<void>>('/carts');
      return { success: true, message: resp.data.message };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  }
}

export const cartService = new CartService();
