import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";
import "./style.css";

type CartItem = { id: number; name?: string; price: number; image?: string; qty: number };
type CartCtx = { cart: CartItem[]; addToCart: (p: CartItem) => void; removeFromCart: (id: number) => void; clearCart: () => void } | undefined;

const Cart = () => {
  const { cart, addToCart, removeFromCart, clearCart } = (useContext(CartContext) as CartCtx) || { cart: [], addToCart: () => {}, removeFromCart: () => {}, clearCart: () => {} };
  const navigate = useNavigate();

  const total = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.qty, 0);

  return (
    <div className="cart-page">
      <header className="cart-header">
        <h2 style={{ margin: 0 }}>🛒 Giỏ hàng của bạn</h2>
        <div className="cart-actions">
          <Link to="/ProductList">
            <button className="btn">
              <p style={{ margin: 0 }}>🔙 Tiếp tục mua hàng</p>
            </button>
          </Link>
          <button
            onClick={() => navigate("/checkoutpage")}
            className="btn btn-primary"
            disabled={cart.length === 0}
          >
            ➜ Thanh toán
          </button>
        </div>
      </header>

      {cart.length === 0 ? (
        <div className="empty-box">
          <p style={{ fontSize: 18, margin: "0 0 8px" }}>Giỏ hàng trống</p>
          <p style={{ margin: "0 0 16px", color: "#666" }}>Hãy thêm sản phẩm vào giỏ trước khi thanh toán.</p>
          <Link to="/ProductList">
            <button className="btn btn-primary" style={{ background: "#28a745" }}>
              🛍️ Mua ngay
            </button>
          </Link>
        </div>

      ) : (
        <div className="grid">
          <div>
            <ul className="cart-list">
              {cart.map((item: CartItem) => (
                <li key={item.id} className="cart-item">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="cart-thumb" />
                  ) : (
                    <div className="no-thumb">No image</div>
                  )}

                  <div className="cart-item-info">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        <div style={{ color: "#666", fontSize: 14 }}>{item.price.toLocaleString()} đ</div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700 }}>{(item.price * item.qty).toLocaleString()} đ</div>
                        <div style={{ color: "#666", fontSize: 13 }}>{item.qty} pcs</div>
                      </div>
                    </div>

                    <div className="cart-item-actions">
                      <button
                        onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, qty: 1 })}
                        className="small-btn"
                      >
                        ➕
                      </button>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="small-btn remove-btn"
                      >
                        ❌ Xóa
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <aside className="summary">
            <h3 style={{ marginTop: 0 }}>Tóm tắt đơn hàng</h3>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "12px 0", color: "#444" }}>
              <div>Tạm tính</div>
              <div style={{ fontWeight: 700 }}>{total.toLocaleString()} đ</div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => navigate("/checkoutpage")}
                className="checkout-btn"
              >
                Thanh toán
              </button>
              <button
                onClick={clearCart}
                className="clear-btn"
              >
                Xóa tất cả
              </button>
            </div>

            <div style={{ marginTop: 12, color: "#888", fontSize: 13 }}>
              Bạn có thể chỉnh sửa số lượng bằng nút +. Để giảm số lượng, bấm ❌ để xóa và thêm lại số lượng mong muốn.
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
