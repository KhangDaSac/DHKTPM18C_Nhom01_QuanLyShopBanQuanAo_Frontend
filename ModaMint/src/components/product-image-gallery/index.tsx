// components/ProductGallery.tsx
import { useState } from "react";
import { Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const IMAGES = [
  "/green-and-cream-baseball-cap-with-p-logo-front-vie.jpg",
  "/green-and-cream-baseball-cap-with-p-logo-side-view.jpg",
  "/green-and-cream-baseball-cap-with-p-logo-back-view.jpg",
  "/green-and-cream-baseball-cap-with-p-logo-detail-vi.jpg",
];

export default function ProductGallery() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % IMAGES.length);
  const prev = () => setIndex((i) => (i === 0 ? IMAGES.length - 1 : i - 1));

  return (
    <div className="flex gap-6 items-start justify-center">
      {/* Thumbnails */}
      <div className="flex flex-col gap-4">
        {IMAGES.map((img, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            className={`rounded-lg overflow-hidden border-2 cursor-pointer m-3 transition-all sm:w-24 sm:h-24 ${
              i === index
                ? "border-blue-500"
                : "border-transparent hover:border-gray-300"
            }`}
          >
            <img
              src={img}
              alt={`thumbnail-${i}`}
              className="object-cover w-[100px]"
            />
          </div>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative w-[500px] sm:w-96 sm:h-96 rounded-xl overflow-hidden bg-gray-100 shadow-md">
        <img
          src={IMAGES[index]}
          alt="product"
          className="w-full h-full object-cover transition-transform duration-300"
        />
        <Button
          shape="circle"
          icon={<LeftOutlined />}
          className="!absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow"
          onClick={prev}
        />
        <Button
          shape="circle"
          icon={<RightOutlined />}
          className="!absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow"
          onClick={next}
        />
      </div>
    </div>
  );
}
