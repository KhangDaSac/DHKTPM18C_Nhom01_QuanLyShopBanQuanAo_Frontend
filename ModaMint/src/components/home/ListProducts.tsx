import React, { useRef, useState } from 'react';
import './style.css';
import { ProductCard } from './item-components/ProductCard';
import {CircleChevronRight, CircleChevronLeft} from 'lucide-react';

interface Product {
  id: number;
  image: string;
  name: string;
  discount?: string;
  originalPrice: string;
  currentPrice: string;
  soldCount?: number;
}

interface ListProductsProps {
  products: Product[];
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
        <div className='container-product-list'>
          <button 
          className="nav-button left" 
          onClick={() => scroll('left')}
          disabled={currentIndex === 0}
        >
          <CircleChevronLeft/>
        </button>
        <div className="product-list" ref={scrollRef}>
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <button 
          className="nav-button right" 
          onClick={() => scroll('right')}
          disabled={currentIndex >= Math.floor((products.length - 1) / itemsPerPage)}
        >
          <CircleChevronRight/>
        </button>
        </div>
        <button className="view-all">Xem tất cả &gt;</button>
      </div>
  );
};

export default ListProducts;