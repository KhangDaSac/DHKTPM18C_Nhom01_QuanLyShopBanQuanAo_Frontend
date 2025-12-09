import { useState, useEffect } from 'react';
import styles from './ProductCard.module.css'
import { Heart, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '@/contexts/favoritesContext';
import { useAuth } from '@/contexts/authContext';
import { toast } from 'react-toastify';

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
  imageUrl?: string;
}

export interface ProductCardProps {
  product: ProductCardData;
  buttonText?: string; // Text của nút, mặc định là "Tùy chọn"
  onButtonClick?: (product: ProductCardData) => void; // Callback khi click nút
  onFavoriteChange?: (productId: number, isFavorite: boolean) => void; // Callback khi thay đổi trạng thái yêu thích
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  buttonText = 'Xem chi tiết',
  onButtonClick,
  onFavoriteChange
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const percentage = product.soldCount && product.soldCount > 0 ? (product.soldCount / 200) * 100 : 0;
  const progressWidth = Math.min(percentage, 100);

  const isProductFavorite = isFavorite(product.id);

  const handleAddToCart = () => {
    if (onButtonClick) {
      onButtonClick(product);
    }
  };

  const handleViewDetails = () => {
    try {
      console.debug('ProductCard: view details clicked, product id =', product.id);
      if (!product.id && product.id !== 0) {
        toast.error('Không thể xác định sản phẩm để xem chi tiết');
        return;
      }
      navigate(`/detail/${product.id}`);
    } catch (err) {
      console.error('Error navigating to product detail:', err);
      toast.error('Không thể chuyển tới trang chi tiết sản phẩm');
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

    try {
      if (isProductFavorite) {
        // Bỏ yêu thích
        const success = await removeFromFavorites(product.id);
        if (success) {
          onFavoriteChange?.(product.id, false);
        }
      } else {
        // Thêm vào yêu thích
        const success = await addToFavorites(product.id);
        if (success) {
          onFavoriteChange?.(product.id, true);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const parseNumber = (v: string | number | undefined) => {
    if (v == null) return null;
    // Remove all non-digit characters (thousands separators, currency symbols, spaces)
    // e.g. "259.000 đ" -> "259000"
    const cleaned = String(v).replace(/\D+/g, '');
    const n = Number(cleaned === '' ? NaN : cleaned);
    return Number.isFinite(n) ? n : null;
  };

  const currNum = parseNumber(product.currentPrice);
  const origNum = parseNumber(product.originalPrice);
  const displayCurrent = currNum != null ? `${currNum.toLocaleString('vi-VN')}đ` : (product.currentPrice || '0đ');
  const displayOriginal = origNum != null ? `${origNum.toLocaleString('vi-VN')}đ` : (product.originalPrice || '0đ');

  const showOriginal = origNum != null && currNum != null && origNum > currNum;

  return (
    <div
      className={styles.product_card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.product_image}>
        <img src={product.image || product.imageUrl || '/placeholder.png'} alt={product.name} />
        {product.discount && (
          <div className={styles.discount_badge}>{product.discount}</div>
        )}
        <button
          className={`${styles.heart_icon} ${isHovered ? styles.visible : ''} ${isProductFavorite ? styles.favorited : ''}`}
          onClick={handleFavoriteClick}
          disabled={isToggling}
          title={isProductFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
        >
          <Heart fill={isProductFavorite ? 'currentColor' : 'none'} />
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
            <span className={styles.current_price}>{displayCurrent}</span>
            {showOriginal && (
              <span className={styles.original_price} style={{ marginLeft: 8 }}>{displayOriginal}</span>
            )}
          </div>
        </div>
        <div className={styles.button_group}>
          <button
            className={styles.option_button}
            onClick={handleViewDetails}
          >
            Xem chi tiết
          </button>
          <button
            className={styles.cart_icon_button}
            onClick={handleAddToCart}
            title={buttonText}
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

