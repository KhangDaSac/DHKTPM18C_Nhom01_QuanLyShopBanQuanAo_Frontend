// CarouselDiscount.tsx
import { useState, useEffect } from "react"
import { PersonalDisCount } from "./item-components/PersonalDiscount";

interface Promotion {
    id: number;
    discount: string;
    price: string;
    buttonText: string;
}

interface CarouselDiscountProps {
    promotions: Promotion[];
}

export const CarouselDiscount: React.FC<CarouselDiscountProps> = ({ promotions }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    useEffect(() => {
        if (!promotions.length) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % promotions.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [promotions.length]);

    return (
        <div className="carousel-container">
            <div className="carousel-wrapper" style={{ transform: `translateX(-${currentIndex * 33.33}%)` }}>
                {promotions.map((promo) => (
                    <PersonalDisCount key={promo.id} {...promo} />
                ))}
            </div>
        </div>
    );
};

