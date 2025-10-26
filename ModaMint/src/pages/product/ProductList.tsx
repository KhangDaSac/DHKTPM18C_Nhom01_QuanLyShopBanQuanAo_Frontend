import React, { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '../../components/home/item-components/ProductCard';
import Sidebar from '../../components/productList/Sidebar';
import Pagination from '../../components/productList/Pagination';
import SortSelect from '../../components/productList/SortSelect';
import CategoryCarousel from '../../components/productList/CategoryCarousel';
// Mock data (replace with API calls later)
interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  currentPrice: number;
  image: string;
  hoverImage: string;
  category: string;
  color?: string;
  size?: string[];
}



const PAGE_SIZE = 12;

const ProductList: React.FC = () => {
  const [sort, setSort] = useState<string>('default');
  const [page, setPage] = useState<number>(1);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [filters, setFilters] = useState<{ prices: string[]; colors: string[]; sizes: string[] }>({ prices: [], colors: [], sizes: [] });
const [products, setProducts] = useState<Product[]>([]);

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/products');
      const data = await response.json();
      if (data && Array.isArray(data.result)) {
        setProducts(
          data.result.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price ?? 0,
            originalPrice: p.price ?? 0,
            currentPrice: p.price ?? 0,
            image: '/default.png',
            hoverImage: '/default.png',
            category: p.categoryName,
          }))
        );
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm:', error);
    }
  };

  fetchProducts();
}, []);


  const filtered = useMemo(() => {
    return products.filter(p => {
      if (category && typeof category === 'string') {
        const normalize = (s: string) => s
          .toLowerCase()
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .replace(/[^a-z0-9]/g, '');
        const categoryNorm = normalize(category);
        const productCategory = (p.category || '').toString();
        const productName = (p.name || '').toString();
        const productCategoryNorm = normalize(productCategory);
        const productNameNorm = normalize(productName);
        if (!productCategoryNorm.includes(categoryNorm) && !productNameNorm.includes(categoryNorm) && p.id.toString() !== category) {
          return false;
        }
      }
      const matchingPrice = filters.prices.length === 0 || filters.prices.some(pid => {
        switch (pid) {
          case 'p1': return p.price < 200000;
          case 'p2': return p.price >= 200000 && p.price <= 500000;
          case 'p3': return p.price >= 500000 && p.price <= 700000;
          case 'p4': return p.price >= 700000 && p.price <= 1000000;
          case 'p5': return p.price > 1000000;
          default: return false;
        }
      });
      if (!matchingPrice) return false;
      const matchingColor = filters.colors.length === 0 || filters.colors.includes(p.color ?? '');
      if (!matchingColor) return false;
      const matchingSize = filters.sizes.length === 0 || (p.size ?? []).some(s => filters.sizes.includes(s));
      if (!matchingSize) return false;
      return true;
    });
  }, [category, filters]);

  useEffect(() => {
    setPage(1);
  }, [category, filters, sort]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sort) {
      case 'az':
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case 'za':
        return copy.sort((a, b) => b.name.localeCompare(a.name));
      case 'price-asc':
        return copy.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return copy.sort((a, b) => b.price - a.price);
      default:
        return copy;
    }
  }, [sort, filtered]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [page, sorted]);

  return (
    // Container tổng bao bọc toàn bộ trang, xếp các phần tử theo chiều dọc
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 12, display: 'flex', flexDirection: 'column' }}>

      {/* 1. CategoryCarousel được đưa ra ngoài và nằm ở trên cùng */}
      <div style={{ marginBottom: '24px' }}>
        <CategoryCarousel onSelect={(id: string) => setCategory(id)} />
      </div>

      {/* Container mới chứa Main Content và Sidebar, xếp theo chiều ngang */}
      <div style={{ display: 'flex' }}>
        
        {/* --- PHẦN NỘI DUNG CHÍNH (Bên trái) --- */}
        <main style={{ flex: 3, paddingRight: 20 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4>Tất cả sản phẩm</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div>Sắp xếp theo</div>
              <SortSelect value={sort} onChange={(v) => setSort(v)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 20,minHeight:1102 }}>
            {pageItems.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div style={{display: 'flex', justifyContent: 'center'}}>
            <Pagination page={page} totalPages={totalPages} onPage={(p) => setPage(p)} />
          </div>

        </main>

        {/* --- PHẦN SIDEBAR (Bên phải) --- */}
        <aside style={{ flex: 1, maxWidth: 260 }}>
          <Sidebar
            onCategory={setCategory}
            filtersSelected={filters}
            onFiltersChange={setFilters}
          />
        </aside>
      </div>
    </div>
  );
};

export default ProductList;