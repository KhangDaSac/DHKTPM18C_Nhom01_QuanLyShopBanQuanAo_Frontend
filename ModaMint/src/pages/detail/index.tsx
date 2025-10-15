// src/pages/ProductDetail.tsx
import { useState, useEffect, useMemo } from "react";
import { Button, Rate } from "antd";
import { useParams } from "react-router-dom";
import type { Product } from "../../types/product";
import ProductImageGallery from "../../components/product-image-gallery";
import QuantitySelector from "../../components/quantity-selector";
import RelatedProducts from "../../components/related-products";

const mockProduct: Product = {
  id: "p1",
  name: "Mũ Lưỡi Trai Phối Màu Thêu Chữ P",
  price: 268000,
  image: "https://bizweb.dktcdn.net/thumb/1024x1024/100/534/571/products/sp8-cc2dfef7-6d19-4c03-ac59-32ad42a21589.jpg?v=1731849926150",
  description:
    "Mũ Lưỡi Trai Phối Màu Thêu Chữ P là một phụ kiện thời trang độc đáo...",
  stockStatus: "Còn hàng",
  related: [
    { id: "r1", name: "Mũ Space Màu Navy", price: 138000, image: "https://bizweb.dktcdn.net/thumb/1024x1024/100/534/571/products/sp8-cc2dfef7-6d19-4c03-ac59-32ad42a21589.jpg?v=1731849926150", description: "", stockStatus: "Còn hàng", related: [] },
    { id: "r2", name: "Mũ Space Màu Đỏ", price: 138000, image: "https://bizweb.dktcdn.net/thumb/1024x1024/100/534/571/products/sp8-cc2dfef7-6d19-4c03-ac59-32ad42a21589.jpg?v=1731849926150", description: "", stockStatus: "Còn hàng", related: [] },
  ],
};

export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);

  const product = useMemo(() => mockProduct, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      <ProductImageGallery image={product.image} />

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-red-500 font-semibold text-xl">
          {product.price.toLocaleString()}đ
        </p>
        <p className="text-gray-600">{product.description}</p>
        <p className="text-green-600">{product.stockStatus}</p>

        <QuantitySelector value={quantity} onChange={setQuantity} />

        <div className="flex gap-3 mt-4">
          <Button type="primary" size="large">
            Thêm vào giỏ
          </Button>
          <Button size="large">Mua ngay</Button>
        </div>

        <Rate defaultValue={5} disabled />
      </div>

      <div className="col-span-2 mt-12">
        <h2 className="text-xl font-semibold mb-4">Sản phẩm liên quan</h2>
        <RelatedProducts products={product.related} />
      </div>
    </div>
  );
}
