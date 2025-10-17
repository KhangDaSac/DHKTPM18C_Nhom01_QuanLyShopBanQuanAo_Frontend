import { useContext } from "react";
import { CartContext } from "../../components/contexts/CartContext";
import ProductItem from "./ProductItem";
import { useNavigate } from "react-router-dom";
import "./style.css";

const products = [
  { id: 1, name: "Áo thun", price: 120000, image: "https://bizweb.dktcdn.net/thumb/1024x1024/100/534/571/products/sp7-b7493e19-ed59-4e84-a899-7f2e0f049b58.jpg?v=1731849854890" },
  { id: 2, name: "Quần jean", price: 250000, image: "https://bizweb.dktcdn.net/thumb/1024x1024/100/534/571/products/sp7-b7493e19-ed59-4e84-a899-7f2e0f049b58.jpg?v=1731849854890" },
  { id: 3, name: "Giày sneaker", price: 800000, image: "https://bizweb.dktcdn.net/thumb/1024x1024/100/534/571/products/sp7-b7493e19-ed59-4e84-a899-7f2e0f049b58.jpg?v=1731849854890" },
];

const ProductList = () => {
  const navigate = useNavigate();
  // Provide a lightweight local type for the CartContext to access addToCart
  type ProductShape = { id: number; name?: string; price?: number; image?: string };
  type CartCtx = { addToCart: (p: ProductShape) => void } | undefined;
  const { addToCart } = (useContext(CartContext) as CartCtx) || { addToCart: () => {} };

  const goToCart = () => {
    // route in your App.tsx is "carts" — adjust if your route is "/cart"
    navigate("/carts");
  };
  return (
    <>
      <div className="products-topbar">
        <button type="button" onClick={goToCart} className="btn-cart">
          📥 Qua giỏ hàng
        </button>
      </div>

      <div className="products-wrap">
        <h2 className="products-title">Danh sách sản phẩm</h2>
        <div className="products-grid">
          {products.map((p) => (
            <ProductItem key={p.id} product={p} onAdd={() => addToCart(p)} />
          ))}
        </div>
      </div>
    </>
  );
};

export default ProductList;
