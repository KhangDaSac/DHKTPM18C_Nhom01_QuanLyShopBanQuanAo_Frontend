import "./style.css";

const PaymentMethods = () => {
  return (
    <div className="mt-6">
      <h2 className="section-title">Thanh toán</h2>
      <div className="payment-list">
        <label className="payment-option">
          <input type="radio" name="payment" />
          <span>Chuyển khoản</span>
        </label>
        <label className="payment-option">
          <input type="radio" name="payment" />
          <span>Thu hộ (COD)</span>
        </label>
      </div>
    </div>
  );
};

export default PaymentMethods;