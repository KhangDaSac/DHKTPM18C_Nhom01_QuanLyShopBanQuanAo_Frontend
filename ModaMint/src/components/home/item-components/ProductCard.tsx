import React, { useState } from 'react';

interface Product {
  id: number;
  image: string;
  name: string;
  discount?: string;
  originalPrice: string | number;
  currentPrice: string | number;
  soldCount?: number;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const percentage = product.soldCount && product.soldCount > 0 ? (product.soldCount / 200) * 100 : 0;
  const progressWidth = Math.min(percentage, 100);

  return (
    <>
      <div 
        className="product-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="product-image">
          <img src={product.image} alt={product.name} />
          {product.discount && (
            <div className="discount-badge">{product.discount}</div>
          )}
          <button className={`heart-icon ${isHovered ? 'visible' : ''}`}>
            ♥
          </button>
        </div>
        <div className="product-details">
          <div className="user-info">
            <span>{product.name}</span>
          </div>
          <div className="price-section">
            {product.soldCount !== undefined && (
              <div className="sold-bar">
                {product.soldCount === 0 ? (
                  <span className="sold-text">0 sản phẩm đã bán</span>
                ) : (
                  <div 
                    className="sold-progress"
                    style={{ width: `${progressWidth}%` }}
                  >
                    {product.soldCount} sản phẩm đã bán
                  </div>
                )}
              </div>
            )}
            <div className="price">
              <span className="current-price">{product.currentPrice}</span>
              <span className="original-price">{product.originalPrice}</span>
            </div>
          </div>
          <button className={`option-button ${isHovered ? 'hovered' : ''}`}>
            Tùy chọn
          </button>
        </div>
      </div>
    </>
  );
};