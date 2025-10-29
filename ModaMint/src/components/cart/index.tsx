import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "./style.module.css";
import { AiOutlineMinusCircle, AiOutlinePlusCircle, AiOutlineCloseCircle } from 'react-icons/ai'
import { toast } from 'react-toastify';
// Connect to backend cart service
import { cartService } from '../../services/cart';
import type { CartDto, CartItemDto } from '../../services/cart';
import { getUserInfoFromToken } from '../../utils/apiAuthUtils';

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState<CartDto | null>(null);
  const lastLoadTime = useRef<number>(0);

  const load = async () => {
    // Get customerId from auth context
    const authDataStr = localStorage.getItem('authData');
    let customerId: string | undefined;
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
        console.error('❌ Error parsing authData in load:', e);
      }
    }
    
    if (!customerId) {
      console.warn('⚠️ No customerId found, cannot load cart');
      setCart(null);
      return;
    }
    
    try {
      console.log('📤 Loading cart for customerId:', customerId);
      const res = await cartService.getCart(customerId);
      console.log('📦 Cart load response:', res);
      console.log('📦 Response success:', res.success);
      console.log('📦 Response data:', res.data);
      
      if (res.success && res.data) {
        console.log('📦 Cart data:', res.data);
        console.log('📦 Cart items:', res.data.items);
        console.log('📦 Cart items length:', res.data.items?.length ?? 0);
        
        // Map items để đảm bảo itemId được set từ id
        const mappedData = {
          ...res.data,
          items: (res.data.items || []).map(item => ({
            ...item,
            itemId: item.itemId ?? item.id ?? 0
          }))
        };
        
        console.log('📦 Mapped cart data:', mappedData);
        console.log('📦 Mapped items length:', mappedData.items.length);
        console.log('📦 Setting cart state...');
        setCart(mappedData);
        console.log('✅ Cart state set with', mappedData.items.length, 'items');
      } else {
        console.warn('⚠️ Cart load failed or no data:', res.message);
        setCart(null);
      }
    } catch (error) {
      console.error('❌ Error loading cart:', error);
      setCart(null);
    }
  };

  // Reload cart khi navigate vào trang này
  useEffect(() => {
    if (location.pathname === '/carts') {
      const now = Date.now();
      // Tránh reload quá nhiều lần trong thời gian ngắn
      if (now - lastLoadTime.current > 500) {
        console.log('📍 Cart page path detected (/carts), reloading cart...');
        load();
        lastLoadTime.current = now;
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    load();
    lastLoadTime.current = Date.now();
    
    // Listen for cart update events
    const handleCartUpdate = (event: Event | CustomEvent) => {
      console.log('📢 Cart update event received!', event);
      console.log('📢 Event type:', event.type);
      console.log('📢 Current path:', window.location.pathname);
      
      // Delay một chút để đảm bảo backend đã save xong
      setTimeout(() => {
        const now = Date.now();
        if (now - lastLoadTime.current > 300) {
          console.log('🔄 Reloading cart after event...');
          load();
          lastLoadTime.current = Date.now();
        } else {
          console.log('⏸️ Skipping reload - too soon after last load');
        }
      }, 800);
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);
    
    // Reload khi window focus (user có thể quay lại từ tab khác)
    const handleFocus = () => {
      console.log('📢 Window focused, reloading cart...');
      setTimeout(() => {
        const now = Date.now();
        if (now - lastLoadTime.current > 1000) {
          load();
          lastLoadTime.current = now;
        }
      }, 300);
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Also listen on storage changes (if cart is updated elsewhere)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authData') {
        console.log('📢 AuthData changed, reloading cart...');
        setTimeout(() => {
          load();
        }, 300);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const addToCart = async (_product: { variantId?: number; quantity?: number }) => {
    // Get customerId from auth context
    const authDataStr = localStorage.getItem('authData');
    let customerId: string | undefined;
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
        console.error('❌ Error parsing authData in addToCart:', e);
      }
    }
    
    try {
      const result = await cartService.addItem({ 
        variantId: _product.variantId ?? 0, 
        quantity: _product.quantity ?? 1,
        customerId 
      });
      
      if (result.success) {
        console.log('✅ Item added/updated successfully');
        await load();
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        console.error('❌ Failed to add item:', result.message);
      }
    } catch (error) {
      console.error('❌ Error in addToCart:', error);
    }
  };

  const removeFromCart = async (variantId?: number) => {
    if (!variantId) {
      console.error('❌ Cannot remove item: variantId is required');
      return;
    }
    
    // Get customerId
    const authDataStr = localStorage.getItem('authData');
    let customerId: string | undefined;
    let accessToken: string | undefined;
    
    if (authDataStr) {
      try {
        const authData = JSON.parse(authDataStr);
        customerId = authData?.user?.id;
        accessToken = authData?.accessToken;
        if (!customerId && accessToken) {
          const userInfo = getUserInfoFromToken(accessToken);
          customerId = userInfo?.id;
        }
      } catch (e) {
        console.error('❌ Error parsing authData in removeFromCart:', e);
      }
    }
    
    if (!customerId) {
      console.error('❌ Cannot remove item: customerId is required');
      return;
    }
    
    try {
      console.log('🗑️ Removing item - variantId:', variantId, 'customerId:', customerId);
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(
        `http://localhost:8080/api/v1/carts/remove/${variantId}?customerId=${encodeURIComponent(customerId)}`,
        {
          method: 'DELETE',
          headers,
          credentials: 'include'
        }
      );
      
      if (response.ok) {
        console.log('✅ Item removed/decreased successfully');
        await load();
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to remove item:', response.status, errorData);
      }
    } catch (error) {
      console.error('❌ Error removing item:', error);
    }
  };

  const decreaseQty = async (item: CartItemDto | undefined) => {
    if (!item || !item.variantId) {
      console.error('❌ Cannot decrease quantity: item or variantId missing');
      return;
    }
    
    // Backend removeItem tự động giảm 1 hoặc xóa nếu quantity = 1
    await removeFromCart(item.variantId);
  };

  const increaseQty = async (item: CartItemDto | undefined) => {
    if (!item || !item.variantId) {
      console.error('❌ Cannot increase quantity: item or variantId missing');
      return;
    }
    
    // Sử dụng addItem với quantity = 1 để tăng số lượng
    await addToCart({ variantId: item.variantId, quantity: 1 });
  };

  const removeItemCompletely = async (variantId?: number) => {
    if (!variantId) {
      console.error('❌ Cannot remove item completely: variantId is required');
      return;
    }
    
    // Get customerId
    const authDataStr = localStorage.getItem('authData');
    let customerId: string | undefined;
    let accessToken: string | undefined;
    
    if (authDataStr) {
      try {
        const authData = JSON.parse(authDataStr);
        customerId = authData?.user?.id;
        accessToken = authData?.accessToken;
        if (!customerId && accessToken) {
          const userInfo = getUserInfoFromToken(accessToken);
          customerId = userInfo?.id;
        }
      } catch (e) {
        console.error('❌ Error parsing authData in removeItemCompletely:', e);
      }
    }
    
    if (!customerId) {
      console.error('❌ Cannot remove item completely: customerId is required');
      return;
    }
    
    try {
      console.log('🗑️ Removing item completely - variantId:', variantId, 'customerId:', customerId);
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(
        `http://localhost:8080/api/v1/carts/remove/${variantId}/complete?customerId=${encodeURIComponent(customerId)}`,
        {
          method: 'DELETE',
          headers,
          credentials: 'include'
        }
      );
      
      if (response.ok) {
        console.log('✅ Item completely removed successfully');
        toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
        await load();
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to remove item completely:', response.status, errorData);
      }
    } catch (error) {
      console.error('❌ Error removing item completely:', error);
    }
  };

  const clearCart = async () => {
    // Get customerId
    const authDataStr = localStorage.getItem('authData');
    let customerId: string | undefined;
    let accessToken: string | undefined;
    
    if (authDataStr) {
      try {
        const authData = JSON.parse(authDataStr);
        customerId = authData?.user?.id;
        accessToken = authData?.accessToken;
        if (!customerId && accessToken) {
          const userInfo = getUserInfoFromToken(accessToken);
          customerId = userInfo?.id;
        }
      } catch (e) {
        console.error('❌ Error parsing authData in clearCart:', e);
      }
    }
    
    if (!customerId) {
      console.error('❌ Cannot clear cart: customerId is required');
      return;
    }
    
    // Xác nhận trước khi xóa
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?');
    if (!confirmed) {
      return;
    }
    
    try {
      console.log('🗑️ Clearing cart for customerId:', customerId);
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(
        `http://localhost:8080/api/v1/carts/clear?customerId=${encodeURIComponent(customerId)}`,
        {
          method: 'DELETE',
          headers,
          credentials: 'include'
        }
      );
      
      if (response.ok) {
        console.log('✅ Cart cleared successfully');
        toast.success('Đã xóa toàn bộ giỏ hàng');
        await load();
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to clear cart:', response.status, errorData);
      }
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
    }
  };

  const total = cart?.totalPrice ?? cart?.subtotal ?? 0;

  return (
    <div className={styles['cart-page']}>
      <div className={styles['breadcrumb']}>
        Trang chủ &nbsp;&gt;&nbsp;
        <span className={styles['current']}> Giỏ hàng</span>
      </div>
      <div className={styles['cart-card']}>
        <header className={styles['cart-header']}>
          <h2 className={styles['cart-title']}>Giỏ hàng của bạn</h2>
        </header>

        {(() => {
          const hasItems = cart?.items && Array.isArray(cart.items) && cart.items.length > 0;
          console.log('🎨 Render check - cart exists:', !!cart);
          console.log('🎨 Render check - items exists:', !!cart?.items);
          console.log('🎨 Render check - items is array:', Array.isArray(cart?.items));
          console.log('🎨 Render check - items length:', cart?.items?.length ?? 0);
          console.log('🎨 Render check - hasItems:', hasItems);
          
          return !hasItems;
        })() ? (
          <div className={styles['empty-box']}>
            <p className={styles['empty-title']}>Giỏ hàng trống</p>
            <p className={styles.muted}>Hãy thêm sản phẩm vào giỏ trước khi thanh toán.</p>
            <Link to="/products">
              <button className={`${styles.btn} ${styles.primary} ${styles.long}`}>Mua ngay</button>
            </Link>
          </div>
        ) : cart && cart.items && cart.items.length > 0 ? (
          <div className={styles['cart-content']}>
            <ul className={styles['cart-list']}>
              {cart.items.map((item) => {
                const itemId = item.itemId ?? item.id ?? 0;
                const imageUrl = item.imageUrl ?? item.image;
                const itemPrice = item.price ?? item.unitPrice ?? 0;
                const itemQuantity = item.quantity ?? 0;
                const itemTotalPrice = item.totalPrice ?? (itemPrice * itemQuantity);
                const variantInfo = item.color || item.size 
                  ? `${item.color || ''}${item.color && item.size ? ' - ' : ''}${item.size || ''}`.trim()
                  : 'Trắng';
                
                return (
                  <li key={itemId} className={styles['cart-item']}>
                    <button 
                      aria-label="Xóa sản phẩm" 
                      className={styles['remove-icon']} 
                      onClick={async () => {
                        const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${item.productName || 'này'}" khỏi giỏ hàng?`);
                        if (confirmed) {
                          await removeItemCompletely(item.variantId);
                        }
                      }}
                      title="Xóa sản phẩm này khỏi giỏ hàng"
                    >
                      <AiOutlineCloseCircle size={16} />
                    </button>

                    <div className={styles['cart-left']}>
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.productName} className={styles['cart-thumb']} />
                      ) : (
                        <div className={styles['no-thumb']}>No image</div>
                      )}

                      <div className={styles['cart-info']}>
                        <div className={styles['cart-name']}>{item.productName || 'Sản phẩm'}</div>
                        <div className={`${styles['cart-variant']} ${styles.muted}`}>{variantInfo}</div>

                        <div className={styles['qty-controls']}>
                          <button 
                            className={styles['qty-btn']} 
                            aria-label="Giảm" 
                            onClick={() => decreaseQty(item)}
                            disabled={itemQuantity <= 0}
                          >
                            <AiOutlineMinusCircle size={22} />
                          </button>
                          <div className={styles['qty-number']}>{itemQuantity}</div>
                          <button 
                            className={styles['qty-btn']} 
                            aria-label="Tăng" 
                            onClick={() => increaseQty(item)}
                          >
                            <AiOutlinePlusCircle size={22} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className={styles['cart-price']}>
                      <span className={styles['item-total-value']}>{itemTotalPrice.toLocaleString()} đ</span>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className={styles['summary-bottom']}>
              <div className={styles['summary-row']}>
                <div className={styles['summary-label']}>Tổng tiền:</div>
                <div className={styles['summary-value']}>{(total ?? 0).toLocaleString()} đ</div>
              </div>

              <div className={styles['summary-actions']}>
                <button 
                  onClick={clearCart} 
                  className={`${styles.btn} ${styles.outline}`}
                  style={{ backgroundColor: '#fee', color: '#c33', borderColor: '#c33' }}
                >
                  Xóa toàn bộ
                </button>
                <button onClick={() => navigate('/products')} className={`${styles.btn} ${styles.outline}`}>Tiếp tục mua hàng</button>
                <button onClick={() => navigate('/checkoutpage')} className={`${styles.btn} ${styles.primary} ${styles.long}`}>Thanh toán ngay</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Cart;