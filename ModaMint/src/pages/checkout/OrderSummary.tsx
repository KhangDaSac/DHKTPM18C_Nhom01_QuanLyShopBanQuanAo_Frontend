import "./style.css";

const OrderSummary = () => {
  return (
    <div className="order-summary">
      <h2>
        Đơn hàng <span className="text-gray-500 text-base">(2 sản phẩm)</span>
      </h2>

      <div className="order-item">
        <img
          src="https://bizweb.dktcdn.net/thumb/1024x1024/100/534/571/products/sp1-2-994d2b9b-4bd3-4498-b1c5-377d7dda8b67.jpg?v=1731853502867"
          alt="product"
        />
        <div>
          <p className="font-medium">Túi Xách Nữ Da PU Cao Cấp</p>
          <p className="text-gray-500 text-sm">Trắng</p>
        </div>
        <p className="ml-auto font-semibold">2.736.000đ</p>
      </div>

      <div className="coupon-box">
        <input placeholder="Nhập mã giảm giá" />
        <button>Áp dụng</button>
      </div>

      <div className="totals">
        <div className="total-row">
          <span>Tạm tính</span>
          <span>2.736.000đ</span>
        </div>
        <div className="total-row">
          <span>Phí vận chuyển</span>
          <span>-</span>
        </div>
      </div>

      <div className="grand-total">
        <span>Tổng cộng</span>
        <span className="text-sky-600">2.736.000đ</span>
      </div>

      <button className="place-order">ĐẶT HÀNG</button>

      <p className="back-to-cart">&lt; Quay về giỏ hàng</p>
    </div>
  );
};

export default OrderSummary;
