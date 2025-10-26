import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./style.module.css";
import { AiOutlineMinusCircle, AiOutlinePlusCircle, AiOutlineCloseCircle } from 'react-icons/ai'
// Connect to backend cart service
import { cartService } from '../../services/cart';
import type { CartDto, CartItemDto } from '../../services/cart';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartDto | null>(null);

  const load = async () => {
    const res = await cartService.getCart();
    if (res.success && res.data) setCart(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const addToCart = async (_product: { variantId?: number; quantity?: number }) => {
    await cartService.addItem({ variantId: _product.variantId ?? 0, quantity: _product.quantity ?? 1 });
    await load();
  };

  const removeFromCart = async (itemId?: number) => {
    if (!itemId) return;
    await cartService.deleteItem(itemId);
    await load();
  };

  const decreaseQty = async (item: CartItemDto | undefined) => {
    if (!item) return;
    const newQty = (item.quantity ?? 1) - 1;
    if (newQty <= 0) {
      await cartService.deleteItem(item.itemId ?? 0);
    } else {
      await cartService.updateItem(item.itemId ?? 0, newQty);
    }
    await load();
  };

  const total = cart?.subtotal ?? 0;

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
            <ul className={styles['cart-list']}>
              {cart.items?.map((item) => (
                <li key={item.itemId} className={styles['cart-item']}>
                  <button aria-label="Xóa sản phẩm" className={styles['remove-icon']} onClick={() => removeFromCart(item.itemId)}>
                    <AiOutlineCloseCircle size={16} />
                  </button>

                  <div className={styles['cart-left']}>
                    {item.image ? (
                      <img src={item.image} alt={item.productName} className={styles['cart-thumb']} />
                    ) : (
                      <div className={styles['no-thumb']}>No image</div>
                    )}

                    <div className={styles['cart-info']}>
                      <div className={styles['cart-name']}>{item.productName}</div>
                      <div className={`${styles['cart-variant']} ${styles.muted}`}>Trắng</div>

                      <div className={styles['qty-controls']}>
                        <button className={styles['qty-btn']} aria-label="Giảm" onClick={() => decreaseQty(item)}>
                          <AiOutlineMinusCircle size={22} />
                        </button>
                        <div className={styles['qty-number']}>{item.quantity}</div>
                        <button className={styles['qty-btn']} aria-label="Tăng" onClick={() => addToCart({ variantId: item.variantId, quantity: (item.quantity ?? 0) + 1 })}>
                          <AiOutlinePlusCircle size={22} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={styles['cart-price']}>
                    <span className={styles['item-total-value']}>{(item.totalPrice ?? 0).toLocaleString()} đ</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles['summary-bottom']}>
              <div className={styles['summary-row']}>
                <div className={styles['summary-label']}>Tổng tiền:</div>
                <div className={styles['summary-value']}>{(total ?? 0).toLocaleString()} đ</div>
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