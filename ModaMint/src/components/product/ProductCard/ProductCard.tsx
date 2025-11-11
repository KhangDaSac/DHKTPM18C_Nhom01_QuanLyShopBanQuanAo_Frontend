import { useState, useEffect } from 'react';
import styles from './ProductCard.module.css'
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { favoritesService } from '@/services/favorites';
import { useAuth } from '@/contexts/authContext';
import { toast } from 'react-hot-toast';

export interface ProductCardData {
  id: number;
  image: string;
  name: string;
  discount?: string;
  originalPrice: string;
  currentPrice: string;
  soldCount?: number;
  variantId?: number; // ID của product variant để thêm vào giỏ hàng
  isFavorite?: boolean; // Trạng thái yêu thích
}

export interface ProductCardProps {
  product: ProductCardData;
  buttonText?: string; // Text của nút, mặc định là "Tùy chọn"
  onButtonClick?: (product: ProductCardData) => void; // Callback khi click nút
  onFavoriteChange?: (productId: number, isFavorite: boolean) => void; // Callback khi thay đổi trạng thái yêu thích
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  buttonText = 'Tùy chọn',
  onButtonClick,
  onFavoriteChange
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(product.isFavorite || false);
  const [isToggling, setIsToggling] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const percentage = product.soldCount && product.soldCount > 0 ? (product.soldCount / 200) * 100 : 0;
  const progressWidth = Math.min(percentage, 100);

  useEffect(() => {
    setIsFavorite(product.isFavorite || false);
  }, [product.isFavorite]);

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick(product);
    } else {
      // Default action: navigate to product detail page
      navigate(`/detail/${product.id}`);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chặn event bubbling
    
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm yêu thích');
      return;
    }

    if (isToggling) return; // Ngăn chặn nhiều click liên tiếp

    setIsToggling(true);
    const newFavoriteState = !isFavorite;

    try {
      if (newFavoriteState) {
        // Thêm vào yêu thích
        const result = await favoritesService.addFavorite(product.id);
        if (result.success) {
          setIsFavorite(true);
          toast.success('Đã thêm vào yêu thích');
          onFavoriteChange?.(product.id, true);
        } else {
          toast.error('Không thể thêm vào yêu thích: ' + result.message);
        }
      } else {
        // Bỏ yêu thích
        const result = await favoritesService.removeFavorite(product.id);
        if (result.success) {
          setIsFavorite(false);
          toast.success('Đã bỏ yêu thích');
          onFavoriteChange?.(product.id, false);
        } else {
          toast.error('Không thể bỏ yêu thích: ' + result.message);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsToggling(false);
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

