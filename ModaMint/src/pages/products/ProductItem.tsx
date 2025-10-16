
import "./style.css";

type ProductShape = { id: number; name?: string; price?: number; image?: string };
type Props = { product: ProductShape; onAdd: () => void };

const ProductItem = ({ product, onAdd }: Props) => {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h4>{product.name}</h4>
  <p>{(product.price ?? 0).toLocaleString()} đ</p>
      <button type="button" onClick={onAdd} className="add-btn">
        Thêm vào giỏ
      </button>
    </div>
  );
};

export default ProductItem;
