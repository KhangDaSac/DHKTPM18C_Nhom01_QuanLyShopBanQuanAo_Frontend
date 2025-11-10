import axios from 'axios';
import type { ApiResponse } from '../authentication';
import { getUserInfoFromToken } from '../../utils/apiAuthUtils';

export interface CartItemDto {
  id?: number; // Backend trả về id
  itemId?: number; // Map từ id
  variantId?: number;
  productId?: number;
  productName?: string;
  image?: string;
  imageUrl?: string; // Backend trả về imageUrl
  unitPrice?: number;
  price?: number; // Backend trả về price
  quantity?: number;
  totalPrice?: number;
  color?: string;
  size?: string;
}

export interface CartDto {
  id?: number;
  cartId?: number;
  customerId?: string;
  items?: CartItemDto[];
  subtotal?: number;
  shipping?: number;
  total?: number;
  totalPrice?: number; // Backend trả về totalPrice thay vì total
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
  async getCart(customerId?: string) : Promise<{ success: boolean; data?: CartDto; message?: string }> {
    try {
      // Get customerId from auth context if not provided
      if (!customerId) {
        const authDataStr = localStorage.getItem('authData');
        if (authDataStr) {
          try {
            const authData = JSON.parse(authDataStr);
            
            // Thử lấy từ user.id
            customerId = authData?.user?.id;
            
            // Nếu không có, thử lấy từ JWT token
            if (!customerId && authData?.accessToken) {
              const userInfo = getUserInfoFromToken(authData.accessToken);
              customerId = userInfo?.id;
            }
          } catch (e) {
            console.error('❌ Error parsing authData in getCart:', e);
          }
        }
      }
      
      if (!customerId) {
        return { success: false, message: 'Customer ID is required' };
      }
      
      // Backend expects X-User-Id header
      const resp = await cartClient.get<ApiResponse<CartDto>>(`/carts`, {
        headers: {
          'X-User-Id': customerId
        }
      });
      return { success: true, data: resp.data.result };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  }

  async addItem(payload: { variantId: number; quantity?: number; customerId?: string }) {
    try {
      // Get customerId from auth context if not provided
      let customerId = payload.customerId;
      if (!customerId) {
        const authDataStr = localStorage.getItem('authData');
        if (authDataStr) {
          try {
            const authData = JSON.parse(authDataStr);
            
            // Thử lấy từ user.id (ưu tiên cao nhất)
            customerId = authData?.user?.id;
            console.log('🔑 Step 1: Trying to get customerId from authData.user.id:', customerId);
            
            // Nếu không có, thử lấy từ JWT token (payload.sub)
            if (!customerId && authData?.accessToken) {
              try {
                const userInfo = getUserInfoFromToken(authData.accessToken);
                if (userInfo?.id) {
                  customerId = userInfo.id;
                  console.log('🔑 Step 2: Got customerId from JWT token (sub):', customerId);
                }
              } catch (e) {
                console.error('❌ Error getting user info from token:', e);
              }
            }
            
            // Nếu vẫn không có, log để debug
            if (!customerId) {
              console.error('❌ No customerId found. authData structure:', {
                hasUser: !!authData?.user,
                userKeys: authData?.user ? Object.keys(authData.user) : [],
                userId: authData?.user?.id,
                hasAccessToken: !!authData?.accessToken,
                tokenPreview: authData?.accessToken ? authData.accessToken.substring(0, 50) + '...' : null
              });
            }
          } catch (e) {
            console.error('❌ Error parsing authData:', e);
          }
        } else {
          console.error('❌ No authData found in localStorage');
        }
      }
      
      if (!customerId) {
        console.error('❌ No customerId found');
        return { success: false, message: 'Customer ID is required. Please login first.' };
      }
      
      const body = { 
        variantId: payload.variantId,
        quantity: payload.quantity ?? 1
      };
      
      // Backend expects X-User-Id header, not query param
      const url = `/carts/items`;
      console.log('📡 POST', url, 'Body:', body, 'CustomerId:', customerId);
      
      const resp = await cartClient.post<ApiResponse<CartDto>>(url, body, {
        headers: {
          'X-User-Id': customerId
        }
      });
      
      console.log('✅ addItem success:', resp.data);
      return { success: true, data: resp.data.result };
    } catch (err: any) {
      console.error('❌ addItem error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.message || 'Network error';
      return { success: false, message: errorMessage };
    }
  }

  async updateItem(itemId: number, quantity: number) {
    try {
      // Backend endpoint: PUT /carts/items/{itemId}
      const resp = await cartClient.put<ApiResponse<CartItemDto>>(`/carts/items/${itemId}`, {
        quantity: quantity
      });
      
      return { success: true, data: resp.data.result, message: 'Updated successfully' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  }

  async deleteItem(itemId: number, customerId?: string) {
    try {
      // Lấy customerId từ auth nếu chưa có (không dùng nhưng giữ lại để consistency)
      if (!customerId) {
        const authDataStr = localStorage.getItem('authData');
        if (authDataStr) {
          try {
            const authData = JSON.parse(authDataStr);
            customerId = authData?.user?.id;
            if (!customerId && authData?.accessToken) {
              const userInfo = getUserInfoFromToken(authData.accessToken);
              customerId = userInfo?.id;
            }
          } catch (e) {
            console.error('Error parsing authData:', e);
          }
        }
      }

      // Backend endpoint: DELETE /carts/items/{itemId}
      const resp = await cartClient.delete<ApiResponse<void>>(`/carts/items/${itemId}`);
      return { success: true, message: resp.data.message };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  }

  async clearCart(customerId?: string) {
    try {
      // Lấy customerId từ auth nếu chưa có
      if (!customerId) {
        const authDataStr = localStorage.getItem('authData');
        if (authDataStr) {
          try {
            const authData = JSON.parse(authDataStr);
            customerId = authData?.user?.id;
            if (!customerId && authData?.accessToken) {
              const userInfo = getUserInfoFromToken(authData.accessToken);
              customerId = userInfo?.id;
            }
          } catch (e) {
            console.error('Error parsing authData:', e);
          }
        }
      }

      if (!customerId) {
        return { success: false, message: 'Customer ID is required' };
      }

      // Backend endpoint: DELETE /carts with X-User-Id header
      const resp = await cartClient.delete<ApiResponse<void>>(`/carts`, {
        headers: {
          'X-User-Id': customerId
        }
      });
      return { success: true, message: resp.data.message };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  }
}

export const cartService = new CartService();