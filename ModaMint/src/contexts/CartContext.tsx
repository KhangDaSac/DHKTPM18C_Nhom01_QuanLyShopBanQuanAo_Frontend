import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import axios, { type AxiosError } from "axios";

// 🧩 Cấu trúc dữ liệu theo backend
export type CartItem = {
  id: number;
  variantId: number;
  productName: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

export type CartResponse = {
  items: CartItem[];
  totalPrice: number;
};

type CartContextType = {
  cart: CartResponse | null;
  fetchCart: () => Promise<void>;
  addToCart: (variantId: number, quantity?: number) => Promise<void>;
  removeFromCart: (variantId: number) => Promise<void>;
  increment: (variantId: number) => Promise<void>;
  decrement: (variantId: number) => Promise<void>;
  clearCart: () => Promise<void>;
};

export const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const BASE_URL = "http://localhost:8080/api/v1/carts";

  // 🔐 Lấy token từ localStorage
  const getAuthHeaders = (): Record<string, string> | undefined => {
    try {
      const authData = JSON.parse(localStorage.getItem("authData") || "{}");
      const token = authData?.accessToken || authData?.token;
      return token ? { Authorization: `Bearer ${token}` } : undefined;
    } catch {
      return undefined;
    }
  };

  // ⚙️ Lấy customerId hoặc sessionId
  useEffect(() => {
    const savedCustomer = localStorage.getItem("customerId");
    const savedSession = localStorage.getItem("sessionId");

    if (savedCustomer) {
      setCustomerId(savedCustomer);
      return;
    }

    try {
      const authData = JSON.parse(localStorage.getItem("authData") || "{}");
      const userId = authData?.user?.id;
      if (userId) {
        setCustomerId(userId);
        localStorage.setItem("customerId", userId);
      } else {
        let sid = savedSession;
        if (!sid) {
          sid = crypto.randomUUID();
          localStorage.setItem("sessionId", sid);
        }
        setSessionId(sid);
      }
    } catch {
      console.warn("⚠️ authData parse error");
    }
  }, []);

  // 🔗 Tạo query params
  const getParams = () => {
    if (customerId) return `customerId=${customerId}`;
    if (sessionId) return `sessionId=${sessionId}`;
    throw new Error("Missing customerId or sessionId");
  };

  // ✅ Lấy giỏ hàng
  const fetchCart = useCallback(async () => {
    if (!customerId && !sessionId) return;
    try {
      const url = customerId
        ? `${BASE_URL}/customer/${customerId}`
        : `${BASE_URL}/session/${sessionId}`;
      const res = await axios.get(url, { headers: getAuthHeaders() });
      setCart(res.data.result);
    } catch (error) {
      console.error("❌ Error fetching cart:", error);
    }
  }, [customerId, sessionId]);

  // ✅ Thêm sản phẩm
  const addToCart = async (variantId: number, quantity = 1) => {
    try {
      const params = getParams();
      const res = await axios.post(
        `${BASE_URL}/add?${params}`,
        { variantId, quantity },
        { headers: getAuthHeaders() }
      );
      setCart(res.data.result);
    } catch (error) {
      const err = error as AxiosError;
      if (err.response?.status === 401) {
        alert("⚠️ Bạn cần đăng nhập để thêm sản phẩm!");
      } else {
        console.error("❌ Error adding to cart:", error);
      }
    }
  };

  // ✅ Xóa 1 sản phẩm hoặc giảm số lượng (backend tự xử lý)
  const removeFromCart = async (variantId: number) => {
    try {
      const params = getParams();
      const res = await axios.delete(`${BASE_URL}/remove/${variantId}?${params}`, {
        headers: getAuthHeaders(),
      });
      setCart(res.data.result);
    } catch (error) {
      console.error("❌ Error removing item:", error);
    }
  };

  // ✅ Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    try {
      const params = getParams();
      await axios.delete(`${BASE_URL}/clear?${params}`, { headers: getAuthHeaders() });
      setCart({ items: [], totalPrice: 0 });
    } catch (error) {
      console.error("❌ Error clearing cart:", error);
    }
  };

  // ✅ Tăng số lượng (backend tăng trực tiếp)
  const increment = async (variantId: number) => {
    await addToCart(variantId, 1);
  };

  // ✅ Giảm số lượng (backend giảm trực tiếp)
  const decrement = async (variantId: number) => {
    await removeFromCart(variantId);
    await fetchCart();
  };

  // 🔁 Fetch giỏ hàng khi có ID
  useEffect(() => {
    if (customerId || sessionId) fetchCart();
  }, [customerId, sessionId, fetchCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        fetchCart,
        addToCart,
        removeFromCart,
        increment,
        decrement,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ✅ Hook tiện dụng
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
