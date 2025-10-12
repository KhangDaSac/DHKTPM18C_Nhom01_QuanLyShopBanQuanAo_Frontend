import {Heart} from 'lucide-react';

interface ProductImgCardProps {
  imageUrl: string;
  alt?: string;
}

export const ProductImgCard = ({ imageUrl, alt = "Product" }: ProductImgCardProps) => {
  return (
    <>
      <div className="out-img-card">
        <img 
          src={imageUrl} 
          alt={alt}
          className="out-image"
        />
        
        <div className="overlay">
          <div className="icon-container">
            <button 
              className="icon-btn"
              aria-label="Add to wishlist"
            >
              <Heart/>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};