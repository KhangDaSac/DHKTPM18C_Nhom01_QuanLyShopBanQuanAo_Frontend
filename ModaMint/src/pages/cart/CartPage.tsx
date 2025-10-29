import React from "react";
import Cart from "../../components/cart";

const CartPage: React.FC = () => {
  // Sử dụng component Cart từ components/cart/index.tsx 
  // Component này có đầy đủ logic load từ backend và event handling
  return <Cart />;
};

export default CartPage;
