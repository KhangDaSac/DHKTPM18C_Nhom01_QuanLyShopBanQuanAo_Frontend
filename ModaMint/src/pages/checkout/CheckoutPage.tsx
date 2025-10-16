import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";
import "./style.css";

const CheckoutPage = () => {
  return (
    <div className="checkout-page min-h-screen bg-gray-50 flex justify-center py-10">
      <div className="checkout-card w-full max-w-6xl">
        <div className="checkout-left">
          <h1 className="text-3xl font-bold text-sky-600 mb-6">ND Style</h1>

          <CheckoutForm />
        </div>

        <aside className="checkout-right">
          <OrderSummary />
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
