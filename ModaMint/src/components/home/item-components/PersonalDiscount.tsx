
import React from 'react';

interface PersonalDiscountProps {
    discount: string;
    price: string;
    buttonText: string;
}
export const PersonalDisCount: React.FC<PersonalDiscountProps> = ({ discount, price, buttonText }) => {
    return (
        <div className="promotion-item">
            <div className="coupon">
                <div className="discount">{discount}</div>
                <div className="cashback">Giảm {price}</div>
            </div>
            <button className="view-button">{buttonText}</button>
        </div>
    );
};