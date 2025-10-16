import type React from "react";
import { useState } from "react";
import { ReviewCard } from "./item-components/ReviewCard";
import {CircleChevronRight, CircleChevronLeft} from 'lucide-react';

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
      <div className="rv-carousel-container">
        <div className="carousel-wrapper">
          <div 
            className="carousel-content"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {reviews.map((review) => (
              <div key={review.id} className="carousel-item">
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        </div>

        <div className="carousel-controls">
          <button 
            className="control-btn" 
            onClick={prevSlide}
            aria-label="Previous review"
          >
            <CircleChevronLeft/>
          </button>

          <div className="dots-container">
            {reviews.map((_, index) => (
              <div
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>

          <button 
            className="control-btn" 
            onClick={nextSlide}
            aria-label="Next review"
          >
            <CircleChevronRight/>
          </button>
        </div>
      </div>
    </>
  );
};