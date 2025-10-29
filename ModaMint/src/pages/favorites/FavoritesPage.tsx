import React, { useMemo } from "react";
import styles from "./style.module.css";
import { ProductCard } from '../../components/home/item-components/ProductCard';

type FavItem = {
  id: string;
  name?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  badge?: string;
};

type ProductCardData = {
  id: number;
  image: string;
  name: string;
  discount?: string;
  originalPrice: string;
  currentPrice: string;
  soldCount?: number;
};

const FavoritesPage: React.FC = () => {
  const favorites: FavItem[] = useMemo(
    () => [
      {
        id: "f1",
        name: "Áo polo nam phối màu ND008",
        price: 450000,
        originalPrice: 600000,
        image: "https://picsum.photos/seed/f1/640/800",
        badge: "-25%",
      },
      {
        id: "f2",
        name: "Túi Xách Nữ Công Sở",
        price: 1800000,
        image: "https://picsum.photos/seed/f2/640/800",
      },
      {
        id: "f3",
        name: "Đầm hoa xinh",
        price: 349000,
        image: "https://picsum.photos/seed/f3/640/800",
      },
    ],
    []
  );

  // UI-only handlers (non-functional as requested)

  return (
    <div className={styles.pageWrap}>
      <div className={styles.breadcrumb}>
        Trang chủ &nbsp;&gt;&nbsp;
        <span className={styles.current}> Yêu thích</span>
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          {favorites.map((item, idx) => {
            const card: ProductCardData = {
              id: idx + 1,
              image: item.image || 'https://picsum.photos/320',
              name: item.name || 'Sản phẩm',
              discount: item.badge,
              originalPrice: item.originalPrice ? item.originalPrice.toLocaleString('vi-VN') + ' đ' : '',
              currentPrice: item.price ? item.price.toLocaleString('vi-VN') + ' đ' : '',
              soldCount: undefined,
            };

            return (
              <div key={item.id} className={styles.card}>
                <ProductCard product={card} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;