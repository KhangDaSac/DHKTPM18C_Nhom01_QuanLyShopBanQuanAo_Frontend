import React from "react";

interface Props {
  image: string;
}

const ProductImageGallery: React.FC<Props> = ({ image }) => (
  <div className="flex justify-center p-4">
  <img
    src={image}
    alt="product"
    className="rounded-lg w-[350px] object-cover"
  />
</div>

);

export default ProductImageGallery;
