import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';
import type { ProductResponse } from '@/services/product';
import { ProductCard2 } from './item-components/ProductCardHome2';

interface SuggestionTodayProps {
  products: ProductResponse[];
  tabs?: string[];
}

const DEFAULT_TABS = [
  'Hàng mới về',
  'Giá tốt nhất',
  'Còn ít hàng',
  'Còn nhiều hàng'
] as const;

type DefaultTab = typeof DEFAULT_TABS[number];

const SuggestionToday: React.FC<SuggestionTodayProps> = ({
  products,
  tabs = DEFAULT_TABS
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const filteredProducts = useMemo(() => {
    console.log('Trang hơm ne', products);
    const activeProducts = products.filter(p => p.active);
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000; // 7 ngày trước

    // Kiểm tra tab mặc định
    const isDefaultTab = DEFAULT_TABS.includes(activeTab as DefaultTab);

    if (isDefaultTab) {
      let result: ProductResponse[] = [];

      switch (activeTab) {
        case 'Hàng mới về':
          result = activeProducts.filter(p => {
            const createdAt = new Date(p.createAt || 0).getTime();
            return createdAt >= sevenDaysAgo;
          });
          break;

        case 'Hàng mới cập nhật':
          result = activeProducts.filter(p => {
            const createdAt = new Date(p.updateAt || 0).getTime();
            return createdAt >= sevenDaysAgo;
          });
          break;

        case 'Còn ít hàng':
          result = activeProducts.filter(p =>
            p.quantity !== undefined && p.quantity > 0 && p.quantity <= 20
          );
          break;

        case 'Còn nhiều hàng':
          result = activeProducts.filter(p =>
            p.quantity !== undefined && p.quantity >= 21
          );
          break;

        default:
          result = activeProducts;
      }

      return result.slice(0, 12); // Giới hạn 12 sản phẩm
    }

    // === XỬ LÝ TAB BRAND ===
    return activeProducts
      .filter(p => p.brandName === activeTab)
      .slice(0, 12);
  }, [products, activeTab]);

  return (
    <div className={styles.suggestion_today}>
      <div className={styles.suggestion_today__tabs}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.suggestion_today__tab_button} ${
              activeTab === tab ? styles["suggestion_today__tab_button--active"] : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.suggestion_today__product_grid}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard2
              key={product.id}
              product={product}
              buttonText="Xem chi tiết"
            />
          ))
        ) : (
          <p className={styles.no_products}>
            {DEFAULT_TABS.includes(activeTab as DefaultTab)
              ? (activeTab === 'Còn ít hàng'
                  ? 'Không có sản phẩm sắp hết'
                  : 'Không có sản phẩm phù hợp')
              : `Không có sản phẩm của ${activeTab}`}
          </p>
        )}
      </div>
    </div>
  );
};

export default SuggestionToday;