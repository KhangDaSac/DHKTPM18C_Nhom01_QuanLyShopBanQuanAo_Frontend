import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '@/components/product';
import Pagination from '@/components/product-list/Pagination';
import { productService } from '@/services/product';
import { toast } from 'react-toastify';
import './styles.css';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  currentPrice: number;
  image: string;
  discount?: string;
  variantId?: number;
}

const PAGE_SIZE = 12;

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);

  const fetchSearchResults = async (currentPage: number) => {
    try {
      setLoading(true);
      setError(null);

      if (!query.trim()) {
        setProducts([]);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      const res = await productService.searchProductsByName(query);

      if (res.success && res.data) {
        // Calculate pagination
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allProducts = res.data.map((item: any) => {
          return {
            id: item.id,
            name: item.name,
            price: item.currentPrice || item.price || 0,
            originalPrice: item.originalPrice || item.price || 0,
            currentPrice: item.currentPrice || item.price || 0,
            image: item.images?.[0] || item.image || '/default-product.png',
            discount: item.originalPrice && item.currentPrice ? `${Math.round((1 - item.currentPrice / item.originalPrice) * 100)}%` : undefined,
            variantId: item.variantId || item.id,
          };
        });

        const total = Math.ceil(allProducts.length / PAGE_SIZE);
        setTotalPages(total);
        setTotalResults(allProducts.length);

        // Get products for current page
        const startIdx = (currentPage - 1) * PAGE_SIZE;
        const endIdx = startIdx + PAGE_SIZE;
        setProducts(allProducts.slice(startIdx, endIdx));
      } else {
        toast.error(res.message || 'Không tìm thấy sản phẩm');
        setProducts([]);
        setTotalPages(1);
        setTotalResults(0);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Lỗi khi tìm kiếm sản phẩm');
      toast.error('Lỗi khi tìm kiếm sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (query.trim()) {
      fetchSearchResults(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="search-page">
      <div className="search-page__container">
        <div className="search-page__header">
          {/* <h1 className="search-page__title">
            Kết quả tìm kiếm: "{query}"
          </h1> */}
          {totalResults > 0 && (
            <p className="search-page__count">
              Có {totalResults} kết quả tìm kiếm phù hợp
            </p>
          )}
        </div>

        {loading && (
          <div className="search-page__loading">
            <p>Đang tìm kiếm...</p>
          </div>
        )}

        {error && (
          <div className="search-page__error">
            <p>{error}</p>
          </div>
        )}

        {!loading && products.length === 0 && query && (
          <div className="search-page__empty">
            <p>Không tìm thấy sản phẩm nào phù hợp với từ khóa "{query}"</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <>
            <div className="search-page__grid">
              {products.map((product) => (
                <ProductCard
                  key={`${product.id}-${product.variantId}`}
                  product={{
                    id: product.id,
                    name: product.name,
                    image: product.image,
                    originalPrice: product.originalPrice.toString(),
                    currentPrice: product.currentPrice.toString(),
                    discount: product.discount,
                    variantId: product.variantId,
                  }}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
