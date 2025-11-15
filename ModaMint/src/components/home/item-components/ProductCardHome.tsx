import { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Lấy danh sách ảnh, mặc định có ít nhất 1 ảnh
  const images = product.images && product.images.length > 0 ? product.images : [''];
  const hasMultipleImages = images.length > 1;

  // Tính % còn lại dựa trên quantity
  const remaining = product.quantity ?? 0;
  const maxDisplay = 200;
  const percentage = remaining > 0 ? (remaining / maxDisplay) * 100 : 0;
  const progressWidth = Math.min(percentage, 100);

  // Auto-play carousel khi hover
  useEffect(() => {
    if (isHovered && hasMultipleImages) {
      autoPlayRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }, 1000); // Chuyển ảnh mỗi 2 giây
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };
  }, [isHovered, hasMultipleImages, images.length]);

  // Reset về ảnh đầu tiên khi không hover
  useEffect(() => {
    if (!isHovered) {
      setCurrentImageIndex(0);
    }
  }, [isHovered]);

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick(product);
    } else {
      navigate(`/detail/${product.id}`);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Dừng auto-play khi user tự điều khiển
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Dừng auto-play khi user tự điều khiển
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className={styles.product_card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.product_image}>
        <img src={images[currentImageIndex]} alt={product.name} />
        
        <button
          className={`${styles.heart_icon} ${isHovered ? styles.visible : ''}`}
        >
          <Heart />
        </button>

        {/* Navigation buttons - chỉ hiện khi hover và có nhiều hơn 1 ảnh */}
        {hasMultipleImages && isHovered && (
          <>
            <button
              className={`${styles.nav_button} ${styles.nav_left}`}
              onClick={handlePrevImage}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className={`${styles.nav_button} ${styles.nav_right}`}
              onClick={handleNextImage}
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Image indicators - chỉ hiện khi hover và có nhiều hơn 1 ảnh */}
        {hasMultipleImages && isHovered && (
          <div className={styles.image_indicators}>
            {images.map((_, index) => (
              <div
                key={index}
                className={`${styles.indicator_dot} ${
                  index === currentImageIndex ? styles.active : ''
                }`}
              />
            ))}
          </div>
        )}
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
                  className={styles.stock_progress}
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