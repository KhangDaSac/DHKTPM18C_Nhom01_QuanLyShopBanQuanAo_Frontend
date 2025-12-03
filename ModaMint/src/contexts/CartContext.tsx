import { createContext, useState, useEffect, type ReactNode } from "react";
import type { CartDto, CartItemDto } from '../services/cart';
import { cartService } from '../services/cart';

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
  // synchronize local context from backend CartDto
  setCartFromBackend: (cart?: CartDto | null) => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from backend on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const res = await cartService.getCart();
        if (res.success && res.data) {
          setCartFromBackend(res.data);
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    };
    loadCart();
  }, []);

  // Thêm sản phẩm vào giỏ (local fallback)
  const addToCart = (product: Omit<CartItem, 'qty'>) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(cart.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
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

  // Map backend CartDto -> local CartItem[] and set state
  const setCartFromBackend = (cartDto?: CartDto | null) => {
    if (!cartDto || !cartDto.items) {
      setCart([]);
      return;
    }

    const mapped: CartItem[] = cartDto.items.map((it: CartItemDto) => ({
      id: String(it.itemId ?? it.variantId ?? it.productId ?? Math.random()),
      name: it.productName ?? 'Sản phẩm',
      price: it.unitPrice ?? 0,
      qty: it.quantity ?? 1,
      image: it.image ?? undefined,
    }));

    setCart(mapped);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, getTotalItems, getTotalPrice, setCartFromBackend }}
    >
      {children}
    </CartContext.Provider>
  );
};