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
      
      const resp = await cartClient.get<ApiResponse<CartDto>>(`/carts/customer/${customerId}`);
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
      
      const url = `/carts/add?customerId=${encodeURIComponent(customerId)}`;
      console.log('📡 POST', url, 'Body:', body);
      
      const resp = await cartClient.post<ApiResponse<CartDto>>(url, body);
      
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

  async updateItem(variantId: number, quantity: number, customerId?: string) {
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

      // Backend không có endpoint update trực tiếp
      // Workaround: xóa hết rồi thêm lại với quantity mới
      const currentCart = await this.getCart(customerId);
      
      if (!currentCart.success || !currentCart.data) {
        return { success: false, message: 'Cannot get current cart' };
      }

      const currentItem = currentCart.data.items?.find(item => item.variantId === variantId);
      if (!currentItem) {
        return { success: false, message: 'Item not found in cart' };
      }

      const currentQty = currentItem.quantity || 1;
      const diff = quantity - currentQty;

      if (diff > 0) {
        // Tăng: thêm thêm quantity
        const result = await this.addItem({ variantId, quantity: diff, customerId });
        return { success: result.success, message: result.message || 'Updated successfully' };
      } else if (diff < 0) {
        // Giảm: gọi removeItem multiple times
        const absDiff = Math.abs(diff);
        for (let i = 0; i < absDiff; i++) {
          await cartClient.delete(`/carts/remove/${variantId}?customerId=${encodeURIComponent(customerId)}`);
        }
        return { success: true, message: 'Updated successfully' };
      } else {
        // Không thay đổi
        return { success: true, message: 'No change needed' };
      }
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  }

  async deleteItem(variantId: number, customerId?: string) {
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

      const resp = await cartClient.delete<ApiResponse<void>>(`/carts/remove/${variantId}/complete?customerId=${encodeURIComponent(customerId)}`);
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
            const authData = JSON.parse(authData);
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

      const resp = await cartClient.delete<ApiResponse<void>>(`/carts/clear?customerId=${encodeURIComponent(customerId)}`);
      return { success: true, message: resp.data.message };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  }

  // Guest cart methods using localStorage
  getGuestCart(): CartDto | null {
    try {
      const guestCartData = localStorage.getItem('guestCart');
      if (guestCartData) {
        const cartWithExpiry = JSON.parse(guestCartData);
        
        // Kiểm tra expiry date (30 ngày)
        if (cartWithExpiry.expiryDate) {
          const expiryDate = new Date(cartWithExpiry.expiryDate);
          const now = new Date();
          
          if (now > expiryDate) {
            // Giỏ hàng đã hết hạn - xóa khỏi localStorage
            console.log('Guest cart expired, removing...');
            localStorage.removeItem('guestCart');
            return null;
          }
        }
        
        return cartWithExpiry;
      }
      return null;
    } catch (error) {
      console.error('Error loading guest cart:', error);
      return null;
    }
  }

  saveGuestCart(cart: CartDto): void {
    try {
      const cartWithExpiry = {
        ...cart,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 ngày
      };
      localStorage.setItem('guestCart', JSON.stringify(cartWithExpiry));
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  }

  addItemToGuestCart(item: CartItemDto): void {
    console.log('🛒 Adding item to guest cart:', item);
    const cart = this.getGuestCart() || { items: [] };
    console.log('📦 Current guest cart:', cart);
    const items = cart.items || [];
    
    const existingItemIndex = items.findIndex(i => i.variantId === item.variantId);
    
    if (existingItemIndex >= 0) {
      // Update quantity
      console.log('✏️ Updating existing item at index:', existingItemIndex);
      items[existingItemIndex].quantity = (items[existingItemIndex].quantity || 0) + (item.quantity || 1);
      items[existingItemIndex].totalPrice = (items[existingItemIndex].unitPrice || items[existingItemIndex].price || 0) * items[existingItemIndex].quantity!;
    } else {
      // Add new item
      console.log('➕ Adding new item to cart');
      items.push({
        ...item,
        quantity: item.quantity || 1,
        totalPrice: (item.unitPrice || item.price || 0) * (item.quantity || 1)
      });
    }
    
    cart.items = items;
    this.updateGuestCartTotals(cart);
    console.log('💾 Saving guest cart:', cart);
    this.saveGuestCart(cart);
  }

  removeItemFromGuestCart(variantId: number): void {
    const cart = this.getGuestCart();
    if (cart && cart.items) {
      cart.items = cart.items.filter(item => item.variantId !== variantId);
      this.updateGuestCartTotals(cart);
      this.saveGuestCart(cart);
    }
  }

  updateGuestCartItemQuantity(variantId: number, quantity: number): void {
    const cart = this.getGuestCart();
    if (cart && cart.items) {
      const item = cart.items.find(i => i.variantId === variantId);
      if (item) {
        item.quantity = quantity;
        item.totalPrice = (item.unitPrice || item.price || 0) * quantity;
        this.updateGuestCartTotals(cart);
        this.saveGuestCart(cart);
      }
    }
  }

  clearGuestCart(): void {
    localStorage.removeItem('guestCart');
  }

  private updateGuestCartTotals(cart: CartDto): void {
    const subtotal = (cart.items || []).reduce((sum, item) => {
      return sum + ((item.unitPrice || item.price || 0) * (item.quantity || 0));
    }, 0);
    
    cart.subtotal = subtotal;
    cart.shipping = 30000; // Default shipping fee
    cart.total = subtotal + (cart.shipping || 0);
    cart.totalPrice = cart.total;
  }
}

export const cartService = new CartService();