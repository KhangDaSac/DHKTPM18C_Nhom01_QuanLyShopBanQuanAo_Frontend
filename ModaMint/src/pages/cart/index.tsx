import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./style.module.css";
import { AiOutlineMinusCircle, AiOutlinePlusCircle, AiOutlineCloseCircle } from 'react-icons/ai';
// Connect to backend cart service
import { cartService } from '@/services/cart';
import type { CartDto, CartItemDto } from '@/services/cart';
import { useAuth } from '@/contexts/authContext';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (user) {
        // Logged in user - load from backend
        const res = await cartService.getCart();
        if (res.success && res.data) {
          setCart(res.data);
          setIsGuest(false);
        } else {
          setCart(null);
        }
      } else {
        // Guest user - load from localStorage
        const guestCart = cartService.getGuestCart();
        setCart(guestCart);
        setIsGuest(true);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      load();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [user]);

  const removeFromCart = async (variantId?: number) => {
    if (!variantId) return;
    
    if (isGuest) {
      cartService.removeItemFromGuestCart(variantId);
      await load();
    } else {
      await cartService.deleteItem(variantId);
      await load();
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
      return;
    }
    
    setLoading(true);
    try {
      if (isGuest) {
        cartService.clearGuestCart();
        await load();
      } else {
        const result = await cartService.clearCart();
        if (result.success) {
          await load();
        } else {
          alert('Không thể xóa giỏ hàng: ' + (result.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Đã có lỗi xảy ra khi xóa giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const increaseQty = async (item: CartItemDto | undefined) => {
    if (!item || !item.variantId) return;
    const newQty = (item.quantity ?? 1) + 1;
    console.log('➕ Increasing qty:', { 
      variantId: item.variantId, 
      currentQty: item.quantity, 
      newQty 
    });
    
    if (isGuest) {
      cartService.updateGuestCartItemQuantity(item.variantId, newQty);
      await load();
    } else {
      const result = await cartService.updateItem(item.variantId, newQty);
      console.log('Update result:', result);
      if (result.success) {
        await load();
      } else {
        alert('Không thể cập nhật: ' + (result as any).message || 'Unknown error');
      }
    }
  };

  const decreaseQty = async (item: CartItemDto | undefined) => {
    if (!item || !item.variantId) return;
    const newQty = (item.quantity ?? 1) - 1;
    console.log('➖ Decreasing qty:', { 
      variantId: item.variantId, 
      currentQty: item.quantity, 
      newQty 
    });
    
    if (newQty <= 0) {
      if (isGuest) {
        cartService.removeItemFromGuestCart(item.variantId);
        await load();
      } else {
        const result = await cartService.deleteItem(item.variantId);
        console.log('Delete result:', result);
        if (result.success) {
          await load();
        } else {
          alert('Không thể xóa: ' + result.message);
        }
      }
    } else {
      if (isGuest) {
        cartService.updateGuestCartItemQuantity(item.variantId, newQty);
        await load();
      } else {
        const result = await cartService.updateItem(item.variantId, newQty);
        console.log('Update result:', result);
        if (result.success) {
          await load();
        } else {
          alert('Không thể cập nhật: ' + (result as any).message || 'Unknown error');
        }
      }
    }
  };

  // Calculate total - always calculate from items to exclude shipping fee
  const total = cart?.items?.reduce((sum, item) => {
    const price = item.unitPrice ?? item.price ?? 0;
    const qty = item.quantity ?? 0;
    return sum + (price * qty);
  }, 0) ?? 0;

  if (loading) {
    return (
      <div className={styles['cart-page']}>
        <div className={styles['cart-card']}>
          <p style={{ textAlign: 'center', padding: '40px' }}>Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

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

        {isGuest && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: '#fff7e6', borderRadius: '8px', border: '1px solid #ffd591' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#d46b08' }}>
              💡 Bạn đang mua hàng với tư cách khách vãng lai. 
              <Link to="/login" style={{ marginLeft: '8px', color: '#fa8c16', fontWeight: 500, textDecoration: 'underline' }}>
                Đăng nhập
              </Link> để lưu giỏ hàng và nhận ưu đãi!
            </p>
          </div>
        )}

        {(!cart || (cart.items?.length ?? 0) === 0) ? (
          <div className={styles['empty-box']}>
            <p className={styles['empty-title']}>Giỏ hàng trống</p>
            <p className={styles.muted}>Hãy thêm sản phẩm vào giỏ trước khi thanh toán.</p>
            <Link to="/products">
              <button className={`${styles.btn} ${styles.primary} ${styles.long}`}>Mua ngay</button>
            </Link>
          </div>
        ) : (
          <div className={styles['cart-content']}>
            <div style={{ marginBottom: '16px', textAlign: 'right' }}>
              <button 
                onClick={clearCart}
                className={`${styles.btn} ${styles.outline}`}
                style={{ fontSize: '14px', padding: '8px 16px' }}
              >
                Xóa toàn bộ giỏ hàng
              </button>
            </div>
            <ul className={styles['cart-list']}>
              {cart.items?.map((item) => (
                <li key={item.id || item.itemId} className={styles['cart-item']}>
                  <button 
                    aria-label="Xóa sản phẩm" 
                    className={styles['remove-icon']} 
                    onClick={() => removeFromCart(item.variantId)}
                  >
                    <AiOutlineCloseCircle size={16} />
                  </button>

                  <div className={styles['cart-left']}>
                    {item.imageUrl || item.image ? (
                      <div className={styles['thumb-wrap']}>
                        <img 
                          src={item.imageUrl || item.image} 
                          alt={item.productName} 
                          className={styles['cart-thumb']} 
                        />
                      </div>
                    ) : (
                      <div className={styles['no-thumb']}>No image</div>
                    )}

                    <div className={styles['cart-info']}>
                      <div className={styles['cart-name']}>{item.productName}</div>
                      <div className={`${styles['cart-variant']} ${styles.muted}`}>
                        {item.color ? `Màu: ${item.color}` : ''} {item.size ? `Size: ${item.size}` : ''}
                      </div>

                      <div className={styles['qty-controls']}>
                        <button 
                          className={styles['qty-btn']} 
                          aria-label="Giảm" 
                          onClick={() => decreaseQty(item)}
                        >
                          <AiOutlineMinusCircle size={22} />
                        </button>
                        <div className={styles['qty-number']}>{item.quantity}</div>
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
                    <span className={styles['item-total-value']}>
                      {((item.unitPrice || item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles['summary-bottom']}>
              <div className={styles['summary-row']}>
                <div className={styles['summary-label']}>Tổng tiền:</div>
                <div className={styles['summary-value']}>{total.toLocaleString('vi-VN')} đ</div>
              </div>

              <div className={styles['summary-actions']}>
                <button 
                  onClick={() => navigate('/products')} 
                  className={`${styles.btn} ${styles.outline}`}
                >
                  Tiếp tục mua hàng
                </button>
                <button 
                  onClick={() => navigate('/checkoutpage')} 
                  className={`${styles.btn} ${styles.primary} ${styles.long}`}
                >
                  Thanh toán ngay
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;