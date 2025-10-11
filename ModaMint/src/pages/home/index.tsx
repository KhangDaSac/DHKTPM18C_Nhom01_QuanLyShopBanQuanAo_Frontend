// Home.tsx

import { CarouselDiscount } from "../../components/home/CarouselDiscount";
import { CategoryList } from "../../components/home/CategoryList";
import SaleBanner from "../../components/home/SaleBanner";

export default function Home() {

    // Corrected data structure to align with PersonalDisCount and the promotions array used in CarouselDiscount's useEffect
    const promotions = [
        { id: 1, discount: '15%', price: '0.99K', buttonText: 'Xem ngay >' },
        { id: 2, discount: '25%', price: '10.49K', buttonText: 'Xem ngay >' },
        { id: 3, discount: '+1 triệu', price: '1.99K', buttonText: 'Xem ngay >' },
        { id: 4, discount: '+1 triệu', price: '1.99K', buttonText: 'Xem ngay >' },
        { id: 5, discount: '+1 triệu', price: '1.99K', buttonText: 'Xem ngay >' },
        { id: 6, discount: '+1 triệu', price: '1.99K', buttonText: 'Xem ngay >' },
    ];

    return (
        <div className="home-container">
            <SaleBanner />
            <CategoryList />
            {/* Pass the promotions array as a prop */}
            <CarouselDiscount promotions={promotions} />
        </div>
    );
}