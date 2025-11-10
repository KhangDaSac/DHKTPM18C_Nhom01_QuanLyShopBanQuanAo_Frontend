import {Heart} from 'lucide-react';
import styles from './styles.module.css'

interface ProductImgCardProps {
  imageUrl: string | undefined;
  alt?: string;
}

export const ProductImgCard = ({ imageUrl, alt = "Product" }: ProductImgCardProps) => {
  return (
  <>
    <div className={styles.out_img_card}>
      <img src={imageUrl} alt={alt} className={styles.out_image} />

      <div className={styles.overlay}>
        <div className={styles.icon_container}>
          <button className={styles.icon_btn} aria-label="Add to wishlist">
            <Heart />
          </button>
        </div>
      </div>
    </div>
  </>
  );
};