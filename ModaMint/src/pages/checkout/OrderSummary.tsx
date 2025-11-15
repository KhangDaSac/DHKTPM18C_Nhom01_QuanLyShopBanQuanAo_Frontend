import "./style.css";
import { useContext, useState } from "react";
import { CartContext } from "@/contexts/CartContext";
import { orderService } from "@/services/order";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const OrderSummary = () => {
  const cartCtx = useContext(CartContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await orderService.createOrder({});
      if (res.success && res.data) {
        toast.success(res.data.message || 'Đơn hàng đã được đặt');
        // clear local cart state
        if (cartCtx && cartCtx.clearCart) cartCtx.clearCart();
        // navigate to home or order confirmation
        navigate('/');
      } else {
        toast.error(res.message || 'Không thể tạo đơn hàng');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Lỗi mạng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-summary">
      <h2>
        Đơn hàng <span className="text-gray-500 text-base">({cartCtx?.getTotalItems() ?? 0} sản phẩm)</span>
      </h2>

      {/* basic summary from context */}
      {cartCtx?.cart && cartCtx.cart.map((it) => (
        <div key={it.id} className="order-item">
          {it.image ? <img src={it.image} alt="product" /> : null}
          <div>
            <p className="font-medium">{it.name}</p>
            <p className="text-gray-500 text-sm">x{it.qty}</p>
          </div>
          <p className="ml-auto font-semibold">{(it.price * it.qty).toLocaleString()}đ</p>
        </div>
      ))}

      <div className="coupon-box">
        <input placeholder="Nhập mã giảm giá" />
        <button>Áp dụng</button>
      </div>

      <div className="totals">
        <div className="total-row">
          <span>Tạm tính</span>
          <span>{(cartCtx?.getTotalPrice() ?? 0).toLocaleString()}đ</span>
        </div>
        <div className="total-row">
          <span>Phí vận chuyển</span>
          <span>-</span>
        </div>
      </div>

      <div className="grand-total">
        <span>Tổng cộng</span>
        <span className="text-sky-600">{(cartCtx?.getTotalPrice() ?? 0).toLocaleString()}đ</span>
      </div>

      <button disabled={loading} onClick={handlePlaceOrder} className="place-order">{loading ? 'Đang xử lý...' : 'ĐẶT HÀNG'}</button>

      <p onClick={() => navigate('/carts')} className="back-to-cart">&lt; Quay về giỏ hàng</p>
    </div>
  );
};

export default OrderSummary;