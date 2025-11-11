import React, { useEffect, useState } from "react";
import styles from "./style.module.css";
import { ProductCard } from '@/components/product';
import { favoritesService } from '@/services/favorites';
import { useFavorites } from '@/contexts/favoritesContext';
import type { FavoriteDto } from '@/services/favorites';

// frontend favorites are represented by backend FavoriteDto

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
  const [favoritesList, setFavoritesList] = useState<FavoriteDto[]>([]);
  const { favorites: favoritesSet } = useFavorites();

  useEffect(() => {
    let mounted = true;
    favoritesService.getFavorites().then(res => {
      if (!mounted) return;
      if (res.success && res.data) setFavoritesList(res.data);
    }).catch(() => {/* ignore */});
    return () => { mounted = false };
  }, []);

  // Filter out removed favorites from the list
  const displayedFavorites = favoritesList.filter(fav => favoritesSet.has(fav.productId));

  // UI-only handlers (non-functional as requested)

  return (
    <div className={styles.pageWrap}>
      <div className={styles.breadcrumb}>
        Trang chủ &nbsp;&gt;&nbsp;
        <span className={styles.current}> Yêu thích</span>
      </div>

      <div className={styles.container}>
        {displayedFavorites.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Không có sản phẩm yêu thích</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {displayedFavorites.map((item) => {
              const card: ProductCardData = {
                id: item.productId, // Use productId instead of index
                image: item.price ? `https://picsum.photos/seed/fav${item.productId}/320` : 'https://picsum.photos/320',
                name: item.productName || 'Sản phẩm',
                discount: undefined,
                originalPrice: '',
                currentPrice: item.price ? Number(item.price).toLocaleString('vi-VN') + ' đ' : '',
                soldCount: undefined,
              };

              return (
                <div key={item.id} className={styles.card}>
                  <ProductCard product={card} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;