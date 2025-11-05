import type React from "react";
import { useState } from "react";
import { ReviewCard } from "./item-components/ReviewCard";
import {CircleChevronRight, CircleChevronLeft} from 'lucide-react';
import styles from './styles.module.css'

interface Review {
  id: number;
  text: string;
  name: string;
  role: string;
  rating: number;
  avatar: string;
}
interface ReviewCarouselProps{
    reviews: Review[];
}

export const ReviewCarousel: React.FC<ReviewCarouselProps> = ({reviews}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
  <>
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
              className={`${styles.review_carousel__dot} ${index === currentIndex ? styles["review_carousel__dot--active"] : ""}`}
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
  </>
  );
};