// components/home/CarouselDiscount.tsx
import { useState, useEffect } from "react";
import { PersonalDisCount } from "./item-components/PersonalDiscount";
import styles from './styles.module.css';
import type { Promotion } from "@/pages/home";

interface CarouselDiscountProps {
  promotions: Promotion[];
}

export const CarouselDiscount: React.FC<CarouselDiscountProps> = ({ promotions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!promotions.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 3000); // Tăng thời gian để người dùng đọc
    return () => clearInterval(interval);
  }, [promotions.length]);

  if (!promotions.length) {
    return <div className={styles.carousel__container}>Không có khuyến mãi</div>;
  }

  return (
    <div className={styles.carousel__container}>
      <div
        className={styles.carousel__wrapper}
        style={{ transform: `translateX(-${currentIndex * 33.33}%)` }}
      >
        {promotions.map((promo) => (
          <PersonalDisCount key={promo.id ?? promo.code} {...promo} />
        ))}
      </div>

      {/* Dots indicator */}
      <div className={styles.carousel__dots}>
        {promotions.map((_, index) => (
          <span
            key={index}
            className={`${styles.dot} ${currentIndex === index ? styles.active : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};