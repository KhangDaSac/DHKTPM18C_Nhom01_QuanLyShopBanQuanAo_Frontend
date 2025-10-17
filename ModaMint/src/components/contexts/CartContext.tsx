import { createContext, useState, type ReactNode } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, 'qty'>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Thêm sản phẩm vào giỏ
  const addToCart = (product: Omit<CartItem, 'qty'>) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {

      setCart(cart.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      alert("Tăng số lượng");
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
      alert("Đã thêm vào giỏ hàng chưa có san phẩm này");
    }

  };

  // Xóa sản phẩm
  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Xóa toàn bộ
  const clearCart = () => {
    setCart([]);
  };

  // Tính tổng số lượng
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.qty, 0);
  };

  // Tính tổng giá
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.qty), 0);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, getTotalItems, getTotalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};
