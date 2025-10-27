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
    images?: string[]; // Mảng nhiều ảnh
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

    // Hàm lấy danh sách sản phẩm từ API
    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get("http://localhost:8080/api/v1/products");

            // Kiểm tra response
            if (response.data && response.data.code === 1000) {
                // Chuyển đổi dữ liệu từ API sang format Product
                const apiProducts = response.data.result.map((item: any) => ({
                    id: item.id,
                    name: item.name || item.productName,
                    price: item.price || item.currentPrice || 0,
                    originalPrice: item.originalPrice || item.price || 0,
                    currentPrice: item.currentPrice || item.price || 0,
                    image: item.image || item.imageUrl || '',
                    hoverImage: item.hoverImage || item.image || item.imageUrl || '',
                    category: item.category || item.categoryName || '',
                    color: item.color || '',
                    size: item.sizes || item.size || []
                }));

                setProducts(apiProducts);
                console.log('Đã tải được', apiProducts.length, 'sản phẩm');
            } else {
                // Fallback sử dụng MOCK data nếu API trả về lỗi
                console.warn('API response không đúng format, sử dụng MOCK data');
                setProducts(MOCK);
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách sản phẩm:', error);
            setError('Không thể tải danh sách sản phẩm. Sử dụng dữ liệu mẫu.');

            // Sử dụng MOCK data khi có lỗi
            setProducts(MOCK);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [])

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
    }, [products, category, filters]);

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
        <>
            {/* CSS Animation cho loading skeleton */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>

            {/* Container tổng bao bọc toàn bộ trang, xếp các phần tử theo chiều dọc */}
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
        </>
    );
};

export default ProductList;