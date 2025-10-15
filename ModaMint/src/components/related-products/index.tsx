import React from "react";
import type { Product } from "../../types/product";

interface Props {
  products: Product[];
}

const RelatedProducts: React.FC<Props> = ({ products }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {products.map((p) => (
      <div key={p.id} className="w-[350px] p-6 border rounded-lg p-2 hover:shadow">
        <img src={p.image} alt={p.name} className="w-full h-40 object-cover" />
        <p className="font-medium mt-2">{p.name}</p>
        <p className="text-red-500">{p.price.toLocaleString()}đ</p>
      </div>
    ))}
  </div>
);

export default RelatedProducts;
