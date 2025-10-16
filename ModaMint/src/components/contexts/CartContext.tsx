import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Thêm sản phẩm vào giỏ
  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      
      setCart(cart.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      alert("Tăng số lượng" );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
      alert("Đã thêm vào giỏ hàng chưa có san phẩm này" );
    }
    
  };

  // Xóa sản phẩm
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Xóa toàn bộ
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
