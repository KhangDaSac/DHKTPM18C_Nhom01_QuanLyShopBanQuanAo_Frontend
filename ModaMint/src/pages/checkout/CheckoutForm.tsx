import PaymentMethods from "./PaymentMethods";
import "./style.css";

const CheckoutForm = () => {
  return (
    <div className="checkout-form">
      <h2 className="section-title">Thông tin nhận hàng</h2>

      <div className="space-y-4">
        <input className="" type="email" placeholder="Email" />
        <input className="" type="text" placeholder="Họ và tên" />
        <div className="form-row">
          <input className="" type="tel" placeholder="Số điện thoại" />
          <div className="flag-box">🇻🇳</div>
        </div>
        <input className="" type="text" placeholder="Địa chỉ (tùy chọn)" />
        <select>
          <option>---</option>
          <option>TP. Hồ Chí Minh</option>
          <option>Hà Nội</option>
        </select>
        <input className="" type="text" placeholder="Quận huyện (tùy chọn)" />
        <input className="" type="text" placeholder="Phường xã (tùy chọn)" />
        <textarea placeholder="Ghi chú (tùy chọn)"></textarea>
      </div>

      <div className="mt-6">
        <h2 className="section-title">Vận chuyển</h2>
        <div className="shipping-note">Vui lòng nhập thông tin giao hàng</div>
      </div>

      <PaymentMethods />
    </div>
  );
};

export default CheckoutForm;