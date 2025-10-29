import React from "react";
import { useCart } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";

const CartPage: React.FC = () => {
  const { cart, increment, decrement, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  // 🧾 Khi giỏ hàng trống
if (!cart || !cart.items?.length) {
  return (
    <div className="flex justify-center bg-gray-50 py-12">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Giỏ hàng của bạn
        </h2>

        <div className="bg-amber-50 border border-amber-100 text-amber-800 px-6 py-4 rounded-lg text-base">
          Không có sản phẩm nào trong giỏ hàng của bạn.{" "}
          <button
            onClick={() => navigate("/products")}
            className="text-orange-600 font-medium hover:underline"
          >
            Tiếp tục mua hàng.
          </button>
        </div>
      </div>
    </div>
  );
}


  // 🛒 Nếu có sản phẩm trong giỏ
  const totalAll = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-6">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-6xl mt-10">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">
          Giỏ hàng của bạn
        </h2>

        <div className="space-y-5">
          {cart.items.map((item) => (
            <div
              key={item.variantId}
              className="flex items-center justify-between border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-5">
                <img
                  src={item.imageUrl || "/no-image.png"}
                  alt={item.productName}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {item.productName}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {item.color} / {item.size}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => decrement(item.variantId)}
                  className="bg-gray-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-300"
                >
                  –
                </button>
                <span className="w-8 text-center font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() => increment(item.variantId)}
                  className="bg-gray-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-300"
                >
                  +
                </button>
              </div>

              <div className="text-right w-32 font-semibold text-orange-600">
                {(item.price * item.quantity).toLocaleString("vi-VN")}₫
              </div>

              <button
                onClick={() => removeFromCart(item.variantId)}
                className="text-red-500 hover:text-red-700 text-xl"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Tổng tiền + nút hành động */}
        <div className="flex justify-between items-center mt-8 border-t border-gray-200 pt-6">
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/products")}
              className="border border-orange-500 text-orange-500 font-medium px-6 py-3 rounded-lg hover:bg-orange-50 transition"
            >
              Tiếp tục mua hàng
            </button>
            <button
              onClick={clearCart}
              className="border border-gray-300 text-gray-600 font-medium px-6 py-3 rounded-lg hover:bg-gray-100 transition"
            >
              Xóa toàn bộ
            </button>
          </div>

          <div className="text-right">
            <h3 className="text-2xl font-bold text-gray-800">
              Tổng tiền:{" "}
              <span className="text-orange-600">
                {totalAll.toLocaleString("vi-VN")}₫
              </span>
            </h3>

            <button
              onClick={() => navigate("/checkout")}
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition"
            >
              Thanh toán ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
