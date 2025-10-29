import React, { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '../../components/home/item-components/ProductCard';
import Sidebar from '../../components/product-list/Sidebar';
import Pagination from '../../components/product-list/Pagination';
import SortSelect from '../../components/product-list/SortSelect';
import CategoryCarousel from '../../components/product-list/CategoryCarousel';
import axios from 'axios';

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

const MOCK: Product[] = [
    // Sản phẩm giá thấp, màu đen, size S
    {
        id: 1,
        name: 'Áo thun basic đen',
        price: 150000,
        originalPrice: 150000,
        currentPrice: 150000,
        image: 'https://bizweb.dktcdn.net/thumb/large/100/534/571/products/sp11-2.jpg?v=1731125392907',
        hoverImage: '/vite.svg',
        category: 'ao-nam',
        color: '#000000',
        size: ['S']
    },
    // Sản phẩm giá trung bình, màu đỏ, size M
    {
        id: 2,
        name: 'Áo sơ mi đỏ',
        price: 350000,
        originalPrice: 350000,
        currentPrice: 350000,
        image: 'https://bizweb.dktcdn.net/thumb/large/100/534/571/products/sp11-2.jpg?v=1731125392907',
        hoverImage: '/vite.svg',
        category: 'ao-nam',
        color: '#ff0000',
        size: ['M']
    },
    // Sản phẩm giá cao, màu xanh, size L
    {
        id: 3,
        name: 'Áo khoác xanh',
        price: 850000,
        originalPrice: 850000,
        currentPrice: 850000,
        image: 'https://bizweb.dktcdn.net/thumb/large/100/534/571/products/sp7-2.jpg?v=1731125215147',
        hoverImage: '/vite.svg',
        category: 'ao-nam',
        color: '#0000ff',
        size: ['L']
    },
    // Thêm một số sản phẩm đa dạng
    {
        id: 4,
        name: 'Quần jeans đen',
        price: 650000,
        originalPrice: 650000,
        currentPrice: 650000,
        image: 'https://bizweb.dktcdn.net/thumb/large/100/534/571/products/sp5-2-1ebabec4-fa1b-4365-ba8b-b189cecdea6e.jpg?v=1731512874167',
        hoverImage: '/vite.svg',
        category: 'quan-nam',
        color: '#000000',
        size: ['M', 'L']
    },
    {
        id: 5,
        name: 'Áo polo đỏ',
        price: 250000,
        originalPrice: 250000,
        currentPrice: 250000,
        image: 'https://bizweb.dktcdn.net/thumb/large/100/534/571/products/sp1-2-994d2b9b-4bd3-4498-b1c5-377d7dda8b67.jpg?v=1731853502867',
        hoverImage: '/vite.svg',
        category: 'ao-nam',
        color: '#ff0000',
        size: ['S', 'M', 'L']
    },
    // Sản phẩm giá cao
    {
        id: 6,
        name: 'Áo khoác da cao cấp',
        price: 1200000,
        originalPrice: 1200000,
        currentPrice: 1200000,
        image: 'https://bizweb.dktcdn.net/thumb/large/100/534/571/products/sp1-2-c034c1cf-4923-4e69-9ef0-96d9ae6e3f60.jpg?v=1731513969997',
        hoverImage: '/vite.svg',
        category: 'ao-nam',
        color: '#000000',
        size: ['M', 'L']
    },
    {
        id: 7,
        name: 'Áo polo đỏ',
        price: 250000,
        originalPrice: 250000,
        currentPrice: 250000,
        image: 'https://bizweb.dktcdn.net/thumb/large/100/534/571/products/sp1-2-994d2b9b-4bd3-4498-b1c5-377d7dda8b67.jpg?v=1731853502867',
        hoverImage: '/vite.svg',
        category: 'ao-nam',
        color: '#ff0000',
        size: ['S', 'M', 'L']
    },
    // Sản phẩm giá cao
    {
        id: 8,
        name: 'Áo khoác da cao cấp',
        price: 1200000,
        originalPrice: 1200000,
        currentPrice: 1200000,
        image: 'https://bizweb.dktcdn.net/thumb/large/100/534/571/products/sp1-2-c034c1cf-4923-4e69-9ef0-96d9ae6e3f60.jpg?v=1731513969997',
        hoverImage: '/vite.svg',
        category: 'ao-nam',
        color: '#000000',
        size: ['M', 'L']
    },
    {
        id: 9,
        name: 'Áo polo đỏ',
        price: 250000,
        originalPrice: 250000,
        currentPrice: 250000,
        image: 'https://bizweb.dktcdn.net/thumb/large/100/534/571/products/sp1-2-994d2b9b-4bd3-4498-b1c5-377d7dda8b67.jpg?v=1731853502867',
        hoverImage: '/vite.svg',
        category: 'ao-nam',
        color: '#ff0000',
        size: ['S', 'M', 'L']
    },
    // Sản phẩm giá cao
    {
        id: 10,
        name: 'Áo khoác da cao cấp',
        price: 1200000,
        originalPrice: 1200000,
        currentPrice: 1200000,
        image: 'https://bizweb.dktcdn.net/thumb/large/100/534/571/products/sp1-2-c034c1cf-4923-4e69-9ef0-96d9ae6e3f60.jpg?v=1731513969997',
        hoverImage: '/vite.svg',
        category: 'ao-nam',
        color: '#000000',
        size: ['M', 'L']
    },
    {
        id: 11,
        name: 'Áo polo đỏ',
        price: 250000,
        originalPrice: 250000,
        currentPrice: 250000,
        image: 'https://bizweb.dktcdn.net/thumb/large/100/534/571/products/sp1-2-994d2b9b-4bd3-4498-b1c5-377d7dda8b67.jpg?v=1731853502867',
        hoverImage: '/vite.svg',
        category: 'ao-nam',
        color: '#ff0000',
        size: ['S', 'M', 'L']
    },
    // Sản phẩm giá cao
    {
        id: 12,
        name: 'Áo khoác da cao cấp',
        price: 1200000,
        originalPrice: 1200000,
        currentPrice: 1200000,
        image: 'https://bizweb.dktcdn.net/thumb/large/100/534/571/products/sp1-2-c034c1cf-4923-4e69-9ef0-96d9ae6e3f60.jpg?v=1731513969997',
        hoverImage: '/vite.svg',
        category: 'ao-nam',
        color: '#000000',
        size: ['M', 'L']
    },
    {
        id: 13,
        name: 'Áo polo đỏ',
        price: 250000,
        originalPrice: 250000,
        currentPrice: 250000,
        image: 'https://bizweb.dktcdn.net/thumb/large/100/534/571/products/sp1-2-994d2b9b-4bd3-4498-b1c5-377d7dda8b67.jpg?v=1731853502867',
        hoverImage: '/vite.svg',
        category: 'ao-nam',
        color: '#ff0000',
        size: ['S', 'M', 'L']
    },
    // Sản phẩm giá cao
    {
        id: 14,
        name: 'Áo khoác da cao cấp',
        price: 1200000,
        originalPrice: 1200000,
        currentPrice: 1200000,
        image: 'https://bizweb.dktcdn.net/thumb/large/100/534/571/products/sp1-2-c034c1cf-4923-4e69-9ef0-96d9ae6e3f60.jpg?v=1731513969997',
        hoverImage: '/vite.svg',
        category: 'ao-nam',
        color: '#000000',
        size: ['M', 'L']
    }
];

const PAGE_SIZE = 12;

const ProductList: React.FC = () => {
    const [sort, setSort] = useState<string>('default');
    const [page, setPage] = useState<number>(1);
    const [category, setCategory] = useState<string | undefined>(undefined);
    const [filters, setFilters] = useState<{ prices: string[]; colors: string[]; sizes: string[] }>({ prices: [], colors: [], sizes: [] });

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get<ProductResponse>("http://localhost:8080/api/v1/products");
      setProducts(res.data.result ?? []);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category && !p.categoryName.toLowerCase().includes(category.toLowerCase())) return false;
      return true;
    });
  }, [products, category, filters]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sort) {
      case "az":
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case "za":
        return copy.sort((a, b) => b.name.localeCompare(a.name));
      case "price-asc":
        return copy.sort((a, b) => a.price - b.price);
      case "price-desc":
        return copy.sort((a, b) => b.price - a.price);
      default:
        return copy;
    }
  }, [filtered, sort]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE) || 1;
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: 12 }}>
      <div style={{ marginBottom: 24 }}>
        <CategoryCarousel onSelect={(id: string) => setCategory(id)} />
      </div>

                {/* Container mới chứa Main Content và Sidebar, xếp theo chiều ngang */}
                <div style={{ display: 'flex' }}>

                    {/* --- PHẦN NỘI DUNG CHÍNH (Bên trái) --- */}
                    <main style={{ flex: 3, paddingRight: 20 }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h4>
                                Tất cả sản phẩm
                                {!loading && (
                                    <span style={{ color: '#666', fontSize: '14px', fontWeight: 'normal' }}>
                                        ({filtered.length} sản phẩm)
                                    </span>
                                )}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div>Sắp xếp theo</div>
                                <SortSelect value={sort} onChange={(v) => setSort(v)} />
                                <button
                                    onClick={fetchProducts}
                                    disabled={loading}
                                    style={{
                                        marginLeft: '12px',
                                        padding: '6px 12px',
                                        backgroundColor: loading ? '#ccc' : '#ff6347',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '12px'
                                    }}
                                    title="Tải lại danh sách sản phẩm"
                                >
                                    {loading ? '⟳' : '↻'} Refresh
                                </button>
                            </div>
                        </div>

                        {/* Hiển thị thông báo lỗi nếu có */}
                        {error && (
                            <div style={{
                                backgroundColor: '#fff3cd',
                                color: '#856404',
                                padding: '12px',
                                borderRadius: '4px',
                                marginBottom: '16px',
                                border: '1px solid #ffeaa7'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Loading state */}
                        {loading ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: 20,
                                marginBottom: 20,
                                minHeight: 1102
                            }}>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            height: '300px',
                                            backgroundColor: '#f0f0f0',
                                            borderRadius: '8px',
                                            animation: 'pulse 1.5s ease-in-out infinite'
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 20, minHeight: 1102 }}>
                                {pageItems.length > 0 ? (
                                    pageItems.map(p => {
                                        // Convert Product to ProductCardData format
                                        const productCardData = {
                                            ...p,
                                            originalPrice: p.originalPrice.toString(),
                                            currentPrice: p.currentPrice.toString()
                                        };
                                        return <ProductCard key={p.id} product={productCardData} />;
                                    })
                                ) : (
                                    <div style={{
                                        gridColumn: '1 / -1',
                                        textAlign: 'center',
                                        padding: '60px 20px',
                                        color: '#666'
                                    }}>
                                        <h3>Không tìm thấy sản phẩm nào</h3>
                                        <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Pagination page={page} totalPages={totalPages} onPage={(p) => setPage(p)} />
                        </div>

                    </main>

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
