import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ProductCard } from '@/components/product';
import Sidebar from '@/components/product-list/Sidebar';
import Pagination from '@/components/product-list/Pagination';
import SortSelect from '@/components/product-list/SortSelect';
import axios from 'axios';
import { cartService } from '@/services/cart';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/authContext';
import { useCart } from '@/hooks/useCart';
import { productVariantService } from '@/services/productVariant';
import BrandCarousel from '@/components/product-list/BrandCarousel';
import { useSearchParams, useNavigate } from 'react-router-dom';

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
  variantId?: number;
}

// Price range mapping for filter
const PRICE_RANGES: Record<string, { min?: number; max?: number }> = {
  'p1': { min: 0, max: 200000 },
  'p2': { min: 200000, max: 500000 },
  'p3': { min: 500000, max: 700000 },
  'p4': { min: 700000, max: 1000000 },
  'p5': { min: 1000000 }
};

// Color name to hex mapping
const COLOR_NAME_MAP: Record<string, string> = {
  '#ffffff': 'Trắng',
  '#0000ff': 'Xanh',
  '#000000': 'Đen',
  '#ff0000': 'Đỏ'
};

const PAGE_SIZE = 12;

const ProductList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sort, setSort] = useState<string>('default');
  const [page, setPage] = useState<number>(1);
  const [brand, setBrand] = useState<number | undefined>(undefined);
  const [filters, setFilters] = useState<{ prices: string[]; colors: string[]; sizes: string[] }>({ 
    prices: [], 
    colors: [], 
    sizes: [] 
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { setCartFromBackend } = useCart();

  // Get categoryId directly from URL - don't need intermediate state
  const urlCategoryId = searchParams.get('categoryId');

  // Callback để handle category click từ Sidebar
  const handleCategorySelect = useCallback((catId: string | undefined) => {
    if (catId) {
      navigate(`?categoryId=${catId}`);
    } else {
      navigate('');
    }
  }, [navigate]);

  // Fetch products with filters from backend - memoized to prevent infinite loops
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      
      if (brand) {
        params.append('brandId', brand.toString());
      }
      
      // Use urlCategoryId directly instead of state
      if (urlCategoryId) {
        params.append('categoryId', urlCategoryId);
      }
      
      // Handle price ranges
      if (filters.prices.length > 0) {
        const priceRanges = filters.prices.map(p => PRICE_RANGES[p]);
        const minPrice = Math.min(...priceRanges.map(r => r.min ?? 0));
        const maxPrice = Math.max(...priceRanges.map(r => r.max ?? Number.MAX_SAFE_INTEGER));
        
        if (minPrice > 0) {
          params.append('minPrice', minPrice.toString());
        }
        if (maxPrice < Number.MAX_SAFE_INTEGER) {
          params.append('maxPrice', maxPrice.toString());
        }
      }
      
      // Handle colors - convert hex to color names
      if (filters.colors.length > 0) {
        filters.colors.forEach(hex => {
          const colorName = COLOR_NAME_MAP[hex];
          if (colorName) {
            params.append('colors', colorName);
          }
        });
      }
      
      // Handle sizes
      if (filters.sizes.length > 0) {
        filters.sizes.forEach(size => {
          params.append('sizes', size);
        });
      }

      const endpoint = params.toString() 
        ? `http://localhost:8080/api/v1/products/filter?${params.toString()}`
        : 'http://localhost:8080/api/v1/products';

      console.log('🔍 Fetching with filters:', endpoint);
      
      const res = await axios.get<{ code: number; result: any[]; message: string }>(endpoint);

      console.log('📦 API Response:', res.data);

      // Map data from API
      const mappedProducts: Product[] = (res.data.result ?? []).map((p: any) => {
        let variantId: number | undefined = undefined;
        let variantPrice: number | undefined = undefined;
        let variantDiscount: number | undefined = undefined;

        if (p.productVariants && Array.isArray(p.productVariants) && p.productVariants.length > 0) {
          const firstVariant = p.productVariants[0];
          variantId = firstVariant.id;
          variantPrice = firstVariant.price;
          variantDiscount = firstVariant.discount;
        } else if (p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
          const firstVariant = p.variants[0];
          variantId = firstVariant.id;
          variantPrice = firstVariant.price;
          variantDiscount = firstVariant.discount;
        } else if (p.variantId) {
          variantId = p.variantId;
        }

        const basePrice = variantPrice ?? p.price ?? 0;
        const originalPriceNum = basePrice;
        let currentPriceNum = basePrice;
        
        if (variantDiscount && variantDiscount > 0 && basePrice > 0) {
          currentPriceNum = Math.round(basePrice * (1 - variantDiscount / 100));
        }

        return {
          id: p.id,
          name: p.name || '',
          price: currentPriceNum,
          originalPrice: originalPriceNum,
          currentPrice: currentPriceNum,
          image: p.images && p.images.length > 0 ? p.images[0] : (p.imageUrl || ''),
          hoverImage: p.images && p.images.length > 1 ? p.images[1] : (p.images && p.images[0] ? p.images[0] : (p.imageUrl || '')),
          category: p.categoryName || p.category || '',
          color: undefined,
          size: undefined,
          variantId: variantId
        };
      });
      
      setProducts(mappedProducts);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setError("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [brand, urlCategoryId, filters]);

  // Handle add to cart
  const handleAddToCart = async (product: any) => {
    console.log('🛒 Adding to cart, product:', product);

    let variantId = product.variantId;
    console.log('🔑 variantId from product:', variantId);

    if (!variantId) {
      console.log('⚠️ No variantId, fetching from API for product:', product.id);
      try {
        const variantsResult = await productVariantService.getProductVariantsByProductId(product.id);
        console.log('📦 Variants result:', variantsResult);

        if (variantsResult.success && variantsResult.data && variantsResult.data.length > 0) {
          variantId = variantsResult.data[0].id;
          console.log('✅ Got variantId from API:', variantId);
        } else {
          toast.error('Sản phẩm này chưa có biến thể. Vui lòng chọn từ trang chi tiết.');
          return;
        }
      } catch (error: any) {
        console.error('❌ Error fetching variants:', error);
        toast.error('Không thể lấy thông tin biến thể sản phẩm. Vui lòng thử lại.');
        return;
      }
    }

    if (!variantId) {
      toast.error('Không thể xác định phiên bản sản phẩm. Vui lòng chọn từ trang chi tiết.');
      return;
    }

    console.log('📤 Adding to cart with variantId:', variantId);
    try {
      if (isAuthenticated) {
        // Authenticated user - use backend cart
        const result = await cartService.addItem({
          variantId: variantId,
          quantity: 1
        });

        if (result.success) {
          toast.success('Đã thêm sản phẩm vào giỏ hàng!');
          const event = new CustomEvent('cartUpdated', {
            detail: { timestamp: Date.now() }
          });
          window.dispatchEvent(event);
        } else {
          toast.error(result.message || 'Không thể thêm sản phẩm vào giỏ hàng');
        }
      } else {
        // Guest user - use localStorage cart
        console.log('🛒 [ProductList] Adding to guest cart - Price:', product.price);
        cartService.addItemToGuestCart({
          variantId: variantId,
          productId: product.id,
          productName: product.name,
          image: product.imageUrl || product.image,
          imageUrl: product.imageUrl || product.image,
          unitPrice: product.price,
          price: product.price,
          quantity: 1,
          color: product.color,
          size: product.size
        });
        
        // Sync guest cart to CartContext
        const updatedGuestCart = cartService.getGuestCart();
        console.log('🔄 [ProductList] Syncing guest cart to context:', updatedGuestCart);
        setCartFromBackend(updatedGuestCart);
        
        toast.success('Đã thêm sản phẩm vào giỏ hàng!');
        const event = new CustomEvent('cartUpdated', {
          detail: { timestamp: Date.now() }
        });
        window.dispatchEvent(event);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  };

  // Fetch products when filters change
  useEffect(() => {
    console.log('🔄 useEffect triggered - brand:', brand, 'urlCategoryId:', urlCategoryId, 'filters:', filters);
    fetchProducts();
    setPage(1); // Reset to page 1 when filters change
  }, [brand, urlCategoryId, filters, fetchProducts]);

  // Client-side sorting only
  const sorted = useMemo(() => {
    const copy = [...products];
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
  }, [products, sort]);

  // Hàm reset toàn bộ filter
  const handleResetAllFilters = () => {
    setBrand(undefined);
    navigate(''); // Clear category from URL
    setFilters({ prices: [], colors: [], sizes: [] });
    setPage(1);
  };

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE) || 1;
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: 12 }}>
      <div style={{ marginBottom: 24 }}>
        <BrandCarousel 
          onSelect={(id: number) => setBrand(id === 0 ? undefined : id)} 
          selectedBrand={brand}
        />
      </div>

      <div style={{ display: 'flex' }}>
        <main style={{ flex: 3, paddingRight: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4>
              {!loading && (
                <span style={{ color: '#666', fontSize: '14px', fontWeight: 'normal' }}>
                  ({products.length} sản phẩm)
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
                {loading ? '⟳' : '↻'} 
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(brand || urlCategoryId || filters.prices.length > 0 || filters.colors.length > 0 || filters.sizes.length > 0) && (
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '600', color: '#333' }}>Đang lọc theo:</span>
              
              {/* Reusable Filter Tag Component */}
              {[
                urlCategoryId ? { label: 'Danh mục', onRemove: () => handleCategorySelect(undefined) } : null,
                brand ? { label: 'Thương hiệu', onRemove: () => setBrand(undefined) } : null,
                filters.prices.length > 0 ? { label: `Giá (${filters.prices.length})`, onRemove: () => setFilters({ ...filters, prices: [] }) } : null,
                filters.colors.length > 0 ? { label: `Màu (${filters.colors.length})`, onRemove: () => setFilters({ ...filters, colors: [] }) } : null,
                filters.sizes.length > 0 ? { label: `Size (${filters.sizes.length})`, onRemove: () => setFilters({ ...filters, sizes: [] }) } : null
              ].filter((f): f is { label: string; onRemove: () => void } => f !== null).map((filter, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: '#ff6347',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  <span>{filter.label}</span>
                  <button
                    onClick={filter.onRemove}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '0 4px',
                      display: 'flex',
                      alignItems: 'center',
                      lineHeight: '1'
                    }}
                    title="Xóa bộ lọc"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

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
                pageItems
                  .filter(p => p && p.id)
                  .map(p => {
                    const originalPriceNum = p.originalPrice ?? p.price ?? 0;
                    const currentPriceNum = p.currentPrice ?? p.price ?? 0;

                    const formatPrice = (price: number): string => {
                      return `${price.toLocaleString('vi-VN')}đ`;
                    };

                    let discount: string | undefined = undefined;
                    if (originalPriceNum > currentPriceNum && originalPriceNum > 0) {
                      const discountPercent = Math.round(((originalPriceNum - currentPriceNum) / originalPriceNum) * 100);
                      if (discountPercent > 0) {
                        discount = `-${discountPercent}%`;
                      }
                    }

                    const productCardData = {
                      ...p,
                      originalPrice: formatPrice(originalPriceNum),
                      currentPrice: formatPrice(currentPriceNum),
                      discount: discount,
                      image: p.image || '',
                      hoverImage: p.hoverImage || p.image || '',
                      variantId: p.variantId
                    };
                    
                    return (
                      <ProductCard
                        key={p.id}
                        product={productCardData}
                        buttonText="Thêm vào giỏ hàng"
                        onButtonClick={handleAddToCart}
                      />
                    );
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
            onCategory={handleCategorySelect}
            filtersSelected={filters}
            onFiltersChange={setFilters}
            onResetAll={handleResetAllFilters} // Thêm prop mới
          />
        </aside>
      </div>
    </div>
  );
};

export default ProductList;