import { useState } from 'react';
import styles from './LazyImage.module.css';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
}

export const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  onClick,
  loading = 'lazy' 
}: LazyImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  const handleError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div className={`${styles.lazyImageWrapper} ${className}`} onClick={onClick}>
      {!imageLoaded && (
        <div className={styles.lazyImagePlaceholder}>
          <div className={styles.spinner} />
        </div>
      )}
      {imageError ? (
        <div className={styles.lazyImageError}>
          <span>⚠️</span>
          <span>Không thể tải hình ảnh</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`${styles.lazyImage} ${imageLoaded ? styles.lazyImageLoaded : ''}`}
        />
      )}
    </div>
  );
};

