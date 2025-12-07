import { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ProductResponse, ProductVariant } from '@/services/product';
import { useFavorites } from '@/contexts/favoritesContext';
import { toast } from 'react-toastify';
import { productVariantService } from '@/services/productVariant';

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
  const favorites = useFavorites();
  const [isFavorite, setIsFavorite] = useState(false);

  // State mới để lưu giá thấp nhất
  const [lowestPrice, setLowestPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  // Lấy danh sách ảnh
  const images = product.images && product.images.length > 0 ? product.images : [''];
  const hasMultipleImages = images.length > 1;



  // Tính giá thấp nhất từ variants
  const minPrice = product.productVariants && product.productVariants.length > 0
    ? Math.min(...product.productVariants.map(v => v.price || 0))
    : 0;

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
      }, 1000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };
  }, [isHovered, hasMultipleImages, images.length]);

  // Reset về ảnh đầu khi rời hover
  useEffect(() => {
    if (!isHovered) {
      setCurrentImageIndex(0);
    }
  }, [isHovered]);

  // Khởi tạo trạng thái yêu thích
  useEffect(() => {
    try {
      setIsFavorite(favorites.isFavorite(product.id));
    } catch (e) {
      // ignore
    }
  }, [product.id, favorites]);

  // === FETCH GIÁ THẤP NHẤT TỪ CÁC VARIANT ===
// === CHỈ THAY ĐỔI PHẦN NÀY TRONG useEffect fetch giá thấp nhất ===

useEffect(() => {
  const fetchLowestPrice = async () => {
    if (!product.id) return;

    setLoadingPrice(true);
    const response = await productVariantService.getProductVariantsByProductId(product.id);

    if (response.success && response.data && response.data.length > 0) {
      const prices = response.data.map((variant: ProductVariant) => {
        // Dùng giá trị mặc định 0 nếu undefined
        const additionalPrice = variant.additionalPrice ?? 0;
        const discount = variant.discount ?? 0;

        const finalPrice = variant.price + additionalPrice - discount;
        return finalPrice > 0 ? finalPrice : 0;
      });

      const minPrice = Math.min(...prices);
      setLowestPrice(minPrice);
    } else {
      setLowestPrice(null);
    }
    setLoadingPrice(false);
  };

  fetchLowestPrice();
}, [product.id]);

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick(product);
    } else {
      navigate(`/detail/${product.id}`);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
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
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={async (e) => {
            e.stopPropagation();
            try {
              if (!isFavorite) {
                const ok = await favorites.addToFavorites(product.id);
                if (ok) {
                  setIsFavorite(true);
                  toast.success('Đã thêm vào yêu thích');
                } else {
                  toast.error('Không thể thêm vào yêu thích');
                }
              } else {
                const ok = await favorites.removeFromFavorites(product.id);
                if (ok) {
                  setIsFavorite(false);
                  toast.success('Đã xóa khỏi yêu thích');
                } else {
                  toast.error('Không thể xóa khỏi yêu thích');
                }
              }
            } catch (err) {
              console.error('Favorite toggle error', err);
              toast.error('Có lỗi xảy ra. Vui lòng thử lại');
            }
          }}
        >
          <Heart fill={isFavorite ? '#FF3914' : '#FF765C'} color={isFavorite ? '#FF3914' : '#fff'} />
        </button>

        {hasMultipleImages && isHovered && (
          <>
            <button className={`${styles.nav_button} ${styles.nav_left}`} onClick={handlePrevImage} aria-label="Previous image">
              <ChevronLeft size={20} />
            </button>
            <button className={`${styles.nav_button} ${styles.nav_right}`} onClick={handleNextImage} aria-label="Next image">
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {hasMultipleImages && isHovered && (
          <div className={styles.image_indicators}>
            {images.map((_, index) => (
              <div
                key={index}

                className={`${styles.indicator_dot} ${index === currentImageIndex ? styles.active : ''
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
          {remaining > 0 && (
            <div className={styles.stock}>
              <div className={styles.stock_bar_wrapper}>
                <div className={styles.stock_progress} style={{ width: `${progressWidth}%` }} />
                <span className={styles.stock_text}>Còn {remaining} sản phẩm</span>
              </div>
            </div>
          )}

          {remaining === 0 && (
            <div className={styles.out_of_stock}>
              <span>Hết hàng</span>
            </div>
          )}

          <div className={styles.price}>
            <span className={styles.current_price}>{formatVND(minPrice)}</span>
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