// components/home/item-components/PersonalDiscount.tsx
import React, { useState } from 'react';
import styles from './styles.module.css';

interface PersonalDiscountProps {
  id?: number;
  name: string;
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minOrderValue: number;
  type: 'percentage' | 'amount';
}

export const PersonalDisCount: React.FC<PersonalDiscountProps> = ({
  discountPercent,
  discountAmount,
  minOrderValue,
  type,
  code,
}) => {
  const [copied, setCopied] = useState(false);

  // Hàm sao chép mã
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset sau 2s
    } catch (err) {
      console.error('Lỗi sao chép:', err);
    }
  };

  // Format giá
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value / 1000) + 'K';
  };

  const discountText = type === 'percentage'
    ? `${discountPercent}%`
    : `Giảm ${formatPrice(discountAmount!)}`;

  const cashbackText = type === 'percentage' && discountAmount
    ? `Giảm ${formatPrice(discountAmount)}`
    : `Đơn tối thiểu ${formatPrice(minOrderValue)}`;

  return (
    <div className={styles.discount_item}>
      <div className={styles.coupon}>
        <div className={styles.discount}>{discountText}</div>
        <div className={styles.cashback}>{cashbackText}</div>
      </div>

      <button
        className={`${styles.view_button} ${copied ? styles.copied : ''}`}
        onClick={handleCopy}
      >
        {copied ? 'Đã sao chép!' : 'Sao chép mã'}
      </button>
    </div>
  );
};