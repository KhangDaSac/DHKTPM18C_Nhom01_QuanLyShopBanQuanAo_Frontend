import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./style.module.css";
import { AiOutlineMinusCircle, AiOutlinePlusCircle, AiOutlineCloseCircle } from 'react-icons/ai'

type CartItem = { id: string; name?: string; price: number; image?: string; qty: number };

// UI-only: use static/mock data and stub handlers. The app-level CartContext/logic is intentionally omitted.
const Cart = () => {
  const navigate = useNavigate();

  // Mock data for UI preview
  const cart: CartItem[] = useMemo(
    () => [
      { id: '1', name: 'Áo phông Basic', price: 199000, image: '/header/sample1.jpg', qty: 2 },
      { id: '2', name: 'Quần jeans xanh', price: 459000, image: '/header/sample2.jpg', qty: 1 },
    ],
    []
  );

  // Stub handlers (no logic) — keep them harmless for UI testing
  const addToCart = (_product: Partial<CartItem>) => {
    // UI-only: no-op
    // eslint-disable-next-line no-console
    console.log('addToCart (UI-only):', _product);
  };
  const removeFromCart = (id: string) => {
    // eslint-disable-next-line no-console
    console.log('removeFromCart (UI-only):', id);
  };
  const decreaseQty = (id: string) => {
    // eslint-disable-next-line no-console
    console.log('decreaseQty (UI-only):', id);
  };

  const total = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.qty, 0);

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

        {cart.length === 0 ? (
          <div className={styles['empty-box']}>
            <p className={styles['empty-title']}>Giỏ hàng trống</p>
            <p className={styles.muted}>Hãy thêm sản phẩm vào giỏ trước khi thanh toán.</p>
            <Link to="/products">
              <button className={`${styles.btn} ${styles.primary} ${styles.long}`}>Mua ngay</button>
            </Link>
          </div>
        ) : (
          <div className={styles['cart-content']}>
            <ul className={styles['cart-list']}>
              {cart.map((item: CartItem) => (
                <li key={item.id} className={styles['cart-item']}>
                  <button aria-label="Xóa sản phẩm" className={styles['remove-icon']} onClick={() => removeFromCart(item.id)}>
                    <AiOutlineCloseCircle size={16} />
                  </button>

                  <div className={styles['cart-left']}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className={styles['cart-thumb']} />
                    ) : (
                      <div className={styles['no-thumb']}>No image</div>
                    )}

                    <div className={styles['cart-info']}>
                      <div className={styles['cart-name']}>{item.name}</div>
                      <div className={`${styles['cart-variant']} ${styles.muted}`}>Trắng</div>

                      <div className={styles['qty-controls']}>
                        <button className={styles['qty-btn']} aria-label="Giảm" onClick={() => decreaseQty(item.id)}>
                          <AiOutlineMinusCircle size={22} />
                        </button>
                        <div className={styles['qty-number']}>{item.qty}</div>
                        <button className={styles['qty-btn']} aria-label="Tăng" onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image })}>
                          <AiOutlinePlusCircle size={22} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={styles['cart-price']}>
                    
                    <span className={styles['item-total-value']}>{(item.price * item.qty).toLocaleString()} đ</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles['summary-bottom']}>
              <div className={styles['summary-row']}>
                <div className={styles['summary-label']}>Tổng tiền:</div>
                <div className={styles['summary-value']}>{total.toLocaleString()} đ</div>
              </div>

              <div className={styles['summary-actions']}>
                <button onClick={() => navigate('/products')} className={`${styles.btn} ${styles.outline}`}>Tiếp tục mua hàng</button>
                <button onClick={() => navigate('/checkoutpage')} className={`${styles.btn} ${styles.primary} ${styles.long}`}>Thanh toán ngay</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;