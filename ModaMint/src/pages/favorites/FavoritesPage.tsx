import React, { useEffect, useState } from "react";
import styles from "./style.module.css";
import { ProductCard } from '../../components/home/item-components/ProductCard';
import { favoritesService } from '../../services/favorites';
import { cartService } from '../../services/cart';
import { useContext } from 'react';
import { CartContext } from '../../components/contexts/CartContext';
import { toast } from 'react-toastify';
import type { FavoriteDto } from '../../services/favorites';

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
  const [favorites, setFavorites] = useState<FavoriteDto[]>([]);

  const cartCtx = useContext(CartContext);

  useEffect(() => {
    let mounted = true;
    favoritesService.getFavorites().then(res => {
      if (!mounted) return;
      if (res.success && res.data) setFavorites(res.data);
    }).catch(() => {/* ignore */});
    return () => { mounted = false };
  }, []);

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
              image: item.price ? `https://picsum.photos/seed/fav${item.productId}/320` : 'https://picsum.photos/320',
              name: item.productName || 'Sản phẩm',
              discount: undefined,
              originalPrice: '',
              currentPrice: item.price ? Number(item.price).toLocaleString('vi-VN') + ' đ' : '',
              soldCount: undefined,
            };

            return (
              <div key={item.id} className={styles.card}>
                <ProductCard product={card} onAdd={async ({ variantId, quantity }) => {
                  try {
                    const res = await cartService.addItem({ variantId: variantId ?? item.productId ?? 0, quantity: quantity ?? 1 });
                    if (res.success && res.data) {
                      if (cartCtx && cartCtx.setCartFromBackend) cartCtx.setCartFromBackend(res.data);
                      toast.success('Đã thêm vào giỏ hàng');
                    } else {
                      toast.error('Không thể thêm vào giỏ hàng');
                    }
                  } catch (e) {
                    toast.error('Không thể thêm vào giỏ hàng');
                  }
                }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;