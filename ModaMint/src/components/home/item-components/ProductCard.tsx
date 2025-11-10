import { useState } from 'react';
import styles from './ProductCard.module.css';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ProductResponse } from '@/services/product';

const formatVND = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : amount;
  if (isNaN(num)) return '0 ₫';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(num);
};

export interface ProductCardProps {
  product: ProductResponse;
  buttonText?: string;
  onButtonClick?: (product: ProductResponse) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  buttonText = 'Xem chi tiết',
  onButtonClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Tính % còn lại dựa trên quantity (tối đa 200 để giữ UI nhất quán)
  const remaining = product.quantity ?? 0;
  const maxDisplay = 200;
  const percentage = remaining > 0 ? (remaining / maxDisplay) * 100 : 0;
  const progressWidth = Math.min(percentage, 100);

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick(product);
    } else {
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
        <img src={product.images?.[0]} alt={product.name} />
        <button
          className={`${styles.heart_icon} ${isHovered ? styles.visible : ''}`}
        >
          <Heart />
        </button>
      </div>

      <div className={styles.product_details}>
        <div className={styles.user_info}>
          <span>{product.name}</span>
        </div>

        <div className={styles.price_section}>
          {/* Thanh tồn kho */}
          {remaining > 0 && (
            <div className={styles.stock}>
              <div className={styles.stock_bar_wrapper}>
                <div
                  className={styles.stock_progress} // Đổi class để dễ style riêng
                  style={{ width: `${progressWidth}%` }}
                />
                <span className={styles.stock_text}>
                  Còn {remaining} sản phẩm
                </span>
              </div>
            </div>
          )}

          {/* Hết hàng */}
          {remaining === 0 && (
            <div className={styles.out_of_stock}>
              <span>Hết hàng</span>
            </div>
          )}

          <div className={styles.price}>
            <span className={styles.current_price}>{formatVND(product.price)}</span>
          </div>
        </div>

        <button
          className={`${styles.option_button} ${isHovered ? styles.hovered : ''}`}
          onClick={handleButtonClick}
          disabled={remaining === 0}
        >
          {remaining === 0 ? 'Hết hàng' : buttonText}
        </button>
      </div>
    </div>
  );
};