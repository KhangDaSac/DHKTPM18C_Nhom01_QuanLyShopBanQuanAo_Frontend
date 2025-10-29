import { useState } from 'react';
import styles from './styles.module.css'
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductCardData {
  id: number;
  image: string;
  name: string;
  discount?: string;
  originalPrice: string;
  currentPrice: string;
  soldCount?: number;
  variantId?: number; // ID của product variant để thêm vào giỏ hàng
}

interface ProductCardProps {
  product: ProductCardData;
  buttonText?: string; // Text của nút, mặc định là "Tùy chọn"
  onButtonClick?: (product: ProductCardData) => void; // Callback khi click nút
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  buttonText = 'Tùy chọn',
  onButtonClick 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const percentage = product.soldCount && product.soldCount > 0 ? (product.soldCount / 200) * 100 : 0;
  const progressWidth = Math.min(percentage, 100);

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick(product);
    } else {
      // Default action: navigate to product detail page
      navigate(`/detail/${product.id}`);
    }
  };

  return (
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
          <Heart/>
        </button>
      </div>
      <div className={styles.product_details}>
        <div className={styles.user_info}>
          <span>{product.name}</span>
        </div>
        <div className={styles.price_section}>
          {product.soldCount !== undefined && (
            <div className={styles.sold_bar}>
              <div className={styles.sold_bar_wrapper}>
                <div
                  className={styles.sold_progress}
                  style={{ width: `${progressWidth}%` }}
                />
                <span className={styles.sold_text}>
                  Đã bán {product.soldCount}
                </span>
              </div>
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
          onClick={handleButtonClick}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};