// components/RelatedProducts.tsx
import { Card } from "antd";
const { Meta } = Card;

const RELATED_PRODUCTS = [
  {
    id: 1,
    name: "Túi Xách Nữ Công Sở",
    price: "1.800.000₫",
    image: "/brown-leather-shoulder-bag.jpg",
  },
  {
    id: 2,
    name: "Túi Xách Nữ Da PU Cao Cấp",
    price: "1.368.000₫",
    image: "/white-leather-handbag-with-gold-chain.jpg",
  },
  {
    id: 3,
    name: "Mũ Lưỡi Trai Thêu Space Màu Navy",
    price: "138.000₫",
    image: "/navy-blue-baseball-cap-with-space-embroidery.jpg",
  },
  {
    id: 4,
    name: "Mũ Lưỡi Trai Thêu Space Màu Đỏ",
    price: "138.000₫",
    image: "/red-baseball-cap-with-space-embroidery.jpg",
  },
];

export default function RelatedProducts() {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
      {RELATED_PRODUCTS.map((p) => (
        <Card
          key={p.id}
          hoverable
          cover={
            <img
              src={p.image}
              alt={p.name}
              className="object-cover aspect-square transition-transform duration-300 hover:scale-105 rounded-t-lg  mx-auto"
            />
          }
          className="rounded-xl shadow-sm"
        >
          <Meta
            title={
              <h3 className="text-base font-semibold text-gray-800 line-clamp-2">
                {p.name}
              </h3>
            }
            description={
              <p className="text-red-500 font-bold mt-2">{p.price}</p>
            }
          />
        </Card>
      ))}
    </div>
  );
}
