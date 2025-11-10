import React, { useRef, useState } from 'react';
import {CircleChevronRight, CircleChevronLeft, ArrowRight} from 'lucide-react';
import styles from './styles.module.css'
import { Link } from 'react-router-dom';
import type { ProductResponse } from '@/services/product';
import { ProductCard } from './item-components/ProductCardHome';

interface ListProductsProps {
  products: ProductResponse[];
  itemsPerPage: number;
}

const ListProducts: React.FC<ListProductsProps> = ({ products, itemsPerPage}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const totalItems = products.length;
      if (direction === 'right') {
        setCurrentIndex((prev) => Math.min(prev + 1, Math.floor((totalItems - 1) / itemsPerPage)));
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
      const scrollAmount = 220 * itemsPerPage; // Width of 4 cards + margin
      scrollRef.current.scrollLeft += direction === 'right' ? scrollAmount : -scrollAmount;
    }
  };

  const visibleProducts = products.slice(currentIndex * itemsPerPage, (currentIndex + 1) * itemsPerPage);

  return (
    <div>
      <div className={styles.product_list__container}>
        <button
          className={styles.product_list__nav_button}
          onClick={() => scroll('left')}
          disabled={currentIndex === 0}
        >
          <CircleChevronLeft />
        </button>

        <div className={styles.product_list} ref={scrollRef}>
          {visibleProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              buttonText="Xem chi tiết"
            />
          ))}
        </div>

        <button
          className={styles.product_list__nav_button}
          onClick={() => scroll('right')}
          disabled={currentIndex >= Math.floor((products.length - 1) / itemsPerPage)}
        >
          <CircleChevronRight />
        </button>
      </div>

      <button className={styles.product_list_view_all}><Link to="/products" className={styles.product_list_view_all_text}>Xem tất cả</Link></button>
    </div>
  );
};

export default ListProducts;