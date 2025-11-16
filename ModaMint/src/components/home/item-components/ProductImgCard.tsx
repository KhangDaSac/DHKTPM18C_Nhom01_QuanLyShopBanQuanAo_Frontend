import { Heart } from 'lucide-react';
import styles from './styles.module.css'
import { useFavorites } from '@/contexts/favoritesContext';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

interface ProductImgCardProps {
  imageUrl: string | undefined;
  alt?: string;
  productId?: number; // optional; pass when available to enable wishlist
}

export const ProductImgCard = ({ imageUrl, alt = "Product", productId }: ProductImgCardProps) => {
  const favorites = useFavorites();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (productId != null) {
      try {
        setIsFavorite(favorites.isFavorite(productId));
      } catch (e) {
        // ignore
      }
    }
  }, [productId, favorites]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (productId == null) {
      toast.warning('Không xác định sản phẩm');
      return;
    }
    try {
      if (!isFavorite) {
        const ok = await favorites.addToFavorites(productId);
        if (ok) {
          setIsFavorite(true);
          toast.success('Đã thêm vào yêu thích');
        } else {
          toast.error('Không thể thêm vào yêu thích');
        }
      } else {
        const ok = await favorites.removeFromFavorites(productId);
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
  };

  return (
    <>
      <div className={styles.out_img_card}>
        <img src={imageUrl} alt={alt} className={styles.out_image} />

        <div className={styles.overlay}>
          <div className={styles.icon_container}>
            <button className={styles.icon_btn} aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'} onClick={toggleFavorite}>
              <Heart fill={isFavorite ? '#FF6347' : undefined} color={isFavorite ? '#FF6347' : undefined} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};