import styles from './styles.module.css'
import React from 'react';

interface PersonalDiscountProps {
    discount: string;
    price: string;
    buttonText: string;
}
export const PersonalDisCount: React.FC<PersonalDiscountProps> = ({ discount, price, buttonText }) => {
    return (
        <div className={styles.discount_item}>
        <div className={styles.coupon}>
            <div className={styles.discount}>{discount}</div>
            <div className={styles.cashback}>Giảm {price}</div>
        </div>
        <button className={styles.view_button}>{buttonText}</button>
        </div>
    );
};