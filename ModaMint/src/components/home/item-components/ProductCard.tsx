import { useState } from 'react';
import styles from './styles.module.css'

interface ProductCardData {
  id: number;
  image: string;
  name: string;
  discount?: string;
  originalPrice: string;
  currentPrice: string;
  soldCount?: number;
}

interface ProductCardProps {
  product: ProductCardData;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const percentage = product.soldCount && product.soldCount > 0 ? (product.soldCount / 200) * 100 : 0;
  const progressWidth = Math.min(percentage, 100);

  return (
    <>
      <div
        className={styles.product_card}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={styles.product_image}>
          <img src={product.image} alt={product.name} />
          {product.discount && (
            <div className={styles.discount_badge}>{product.discount}</div>
          )}
          <button
            className={`${styles.heart_icon} ${isHovered ? styles.visible : ''}`}
          >
            ♥
          </button>
        </div>
        <div className={styles.product_details}>
          <div className={styles.user_info}>
            <span>{product.name}</span>
          </div>
          <div className={styles.price_section}>
            {product.soldCount !== undefined && (
              <div className={styles.sold_bar}>
                {product.soldCount === 0 ? (
                  <span className={styles.sold_text}>0 sản phẩm đã bán</span>
                ) : (
                  <div
                    className={styles.sold_progress}
                    style={{ width: `${progressWidth}%` }}
                  >
                    {product.soldCount} sản phẩm đã bán
                  </div>
                )}
              </div>
            )}
            <div className={styles.price}>
              <span className={styles.current_price}>{product.currentPrice}</span>
              <span className={styles.original_price}>{product.originalPrice}</span>
            </div>
          </div>
          <button
            className={`${styles.option_button} ${
              isHovered ? styles.hovered : ''
            }`}
          >
            Tùy chọn
          </button>
        </div>
      </div>
    </>
  );
};