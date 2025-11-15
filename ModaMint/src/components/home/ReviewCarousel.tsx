// src/components/home/item-components/ReviewCarousel.tsx
import type React from "react";
import { useState } from "react";
import { ReviewCard } from "./item-components/ReviewCard";
import { CircleChevronRight, CircleChevronLeft } from "lucide-react";
import styles from "./styles.module.css";
import type { ReviewResponse } from "@/services/review";

interface ReviewCarouselProps {
  reviews: ReviewResponse[];
}

const DEFAULT_PRODUCT_IMAGE =
  "https://res.cloudinary.com/dkokkltme/image/upload/v1762793886/image_album_8_soqfvo.webp"; // Thêm ảnh mặc định nếu cần

export const ReviewCarousel: React.FC<ReviewCarouselProps> = ({ reviews }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Lấy ảnh sản phẩm hiện tại
  const currentProductImage = reviews[currentIndex]?.productImage || DEFAULT_PRODUCT_IMAGE;

  return (
    <div className={styles.review_carousel__main_container}>
      {/* === ẢNH SẢN PHẨM BÊN TRÁI === */}
      <div className={styles.review_carousel__product_image_container}>
        <img
          src={currentProductImage}
          alt={`Sản phẩm đánh giá ${currentIndex + 1}`}
          className={styles.review_carousel__product_image}
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== DEFAULT_PRODUCT_IMAGE) {
              target.src = DEFAULT_PRODUCT_IMAGE;
            }
          }}
        />
      </div>

      {/* === CAROUSEL BÊN PHẢI === */}
      <div className={styles.review_carousel__carousel_section}>
        <div className={styles.review_carousel__container}>
          <div className={styles.review_carousel__wrapper}>
            <div
              className={styles.review_carousel__content}
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {reviews.map((review) => (
                <div key={review.id} className={styles.review_carousel__item}>
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>

          {/* NÚT & DOTS */}
          <div className={styles.review_carousel__controls}>
            <button
              className={styles.review_carousel__control_btn}
              onClick={prevSlide}
              aria-label="Previous review"
            >
              <CircleChevronLeft />
            </button>

            <div className={styles.review_carousel__dots_container}>
              {reviews.map((_, index) => (
                <div
                  key={index}
                  className={`${styles.review_carousel__dot} ${
                    index === currentIndex ? styles["review_carousel__dot--active"] : ""
                  }`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>

            <button
              className={styles.review_carousel__control_btn}
              onClick={nextSlide}
              aria-label="Next review"
            >
              <CircleChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};