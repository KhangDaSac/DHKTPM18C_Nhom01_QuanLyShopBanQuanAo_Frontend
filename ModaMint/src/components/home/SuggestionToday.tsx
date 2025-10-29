import React, { useState } from 'react';
import {ProductCard} from '../home/item-components/ProductCard';
import styles from './styles.module.css';

interface Product {
  id: number;
  image: string;
  name: string;
  discount?: string;
  originalPrice: string;
  currentPrice: string;
  soldCount?: number;
  category?: string;
}

interface SuggestionTodayProps {
  products: Product[];
  tabs: string[];
}

const SuggestionToday: React.FC<SuggestionTodayProps> = ({ products, tabs }) => {
  const [activeTab, setActiveTab] = useState('Hàng mới về');


  const filterProducts = (tab: string) => {
    switch (tab) {
      case 'Hàng mới về':
        return products;
        // return products.filter(p => !p.discount);
      case 'Giá tốt':
        return products.filter(p => parseInt(p.currentPrice.replace(/[^\d]/g, '')) < 600000);
      case 'Tiết kiệm nhiều nhất':
        return products.filter(p => p.discount && parseInt(p.discount.replace(/[^-\d]/g, '')) <= -40);
      case 'Demo':
        return products.filter(p => p.category === 'Demo');
      default:
        return products;
    }
  };

  const filteredProducts = filterProducts(activeTab);

  return (
    <div className={styles.suggestion_today}>
      <div className={styles.suggestion_today__tabs}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.suggestion_today__tab_button} ${activeTab === tab ? styles["suggestion_today__tab_button--active"] : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className={styles.suggestion_today__product_grid}>
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} buttonText="Tùy chọn" />
        ))}
      </div>
    </div>
  );
};

export default SuggestionToday;