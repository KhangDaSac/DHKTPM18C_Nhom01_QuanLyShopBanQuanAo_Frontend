# 📋 Gợi ý Cải thiện Frontend - ModaMint Project

## 📅 Ngày tạo: 30/10/2025

---

## 🎯 Tổng quan

Dự án ModaMint hiện tại có cấu trúc khá tốt, tuy nhiên vẫn còn một số điểm cần cải thiện để tăng tính maintainability, scalability và performance. Dưới đây là các gợi ý chi tiết.

---

## 🗂️ 1. Cấu trúc Thư mục (Folder Structure)

### ⚠️ Vấn đề hiện tại:

1. **Trùng lặp Context**: Có 2 folder contexts:
   - `src/contexts/` (authContext, CartContext, productContext)
   - `src/components/contexts/` (CartContext)
   
2. **Services không nhất quán về extension**: 
   - Một số file `.ts`: `address/index.ts`, `cart/index.ts`, `promotion/index.ts`
   - Một số file `.tsx`: `authentication/index.tsx`, `category/index.tsx`, `product/index.tsx`
   - ❌ Services **không nên** dùng `.tsx` vì không chứa JSX

3. **Phân tách Pages và Components chưa rõ ràng**:
   - `src/pages/cart/CartPage.tsx` và `src/components/cart/index.tsx` gây nhầm lẫn
   - `src/pages/profile/` có nhiều component con nên tách riêng

4. **Dashboard structure hơi phức tạp**:
   - Nhiều file CSS: `style.css`, `theme-styles.css`, `debug-theme.css`, `force-theme.css`, `daisyui-override.css`
   - File `index-backup.tsx` không nên để trong source code

### ✅ Đề xuất cải thiện:

```
src/
├── api/                          # 🆕 API client và interceptors
│   ├── client.ts                 # Axios instance chung
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   └── error.interceptor.ts
│   └── endpoints.ts              # Centralized API endpoints
│
├── assets/                       # 🆕 Static assets (images, fonts, icons)
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── components/                   # Shared components
│   ├── common/                   # 🆕 Common reusable components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Table/
│   ├── layout/
│   │   ├── Header/
│   │   ├── Footer/
│   │   └── Sidebar/
│   ├── cart/
│   ├── product/                  # 🆕 Product-related components
│   │   ├── ProductCard/
│   │   ├── ProductGrid/
│   │   ├── ProductImageGallery/
│   │   └── RelatedProducts/
│   └── guards/                   # 🆕 Route guards
│       └── RoleGuard.tsx
│
├── contexts/                     # ✨ CONSOLIDATE - Chỉ 1 folder contexts
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   └── ProductContext.tsx
│
├── features/                     # 🆕 Feature-based organization
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── services/
│   │       └── auth.service.ts
│   ├── products/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── checkout/
│       ├── components/
│       ├── hooks/
│       └── services/
│
├── hooks/                        # Global custom hooks
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useProducts.ts
│   └── useDebounce.ts           # 🆕 Add utility hooks
│
├── layouts/                      # 🆕 Layout components
│   ├── MainLayout.tsx
│   ├── DashboardLayout.tsx
│   └── AuthLayout.tsx
│
├── pages/                        # Page components (route-level)
│   ├── HomePage/
│   │   ├── index.tsx
│   │   └── styles.module.css
│   ├── ProductsPage/
│   ├── CheckoutPage/
│   └── ProfilePage/
│
├── services/                     # ✨ ALL .ts files (not .tsx)
│   ├── address.service.ts
│   ├── auth.service.ts
│   ├── cart.service.ts
│   ├── category.service.ts
│   ├── customer.service.ts
│   ├── order.service.ts
│   ├── product.service.ts
│   └── promotion.service.ts
│
├── styles/                       # 🆕 Global styles
│   ├── globals.css
│   ├── variables.css
│   ├── themes/
│   │   ├── light.css
│   │   └── dark.css
│   └── mixins.css
│
├── types/                        # 🆕 TypeScript type definitions
│   ├── index.ts
│   ├── product.types.ts
│   ├── user.types.ts
│   └── api.types.ts
│
├── utils/                        # Utility functions
│   ├── auth.utils.ts
│   ├── format.utils.ts
│   ├── validation.utils.ts
│   └── constants.ts             # 🆕 App constants
│
├── dashboard/                    # Dashboard admin
│   ├── components/
│   ├── features/                # 🆕 Dashboard-specific features
│   │   ├── products/
│   │   ├── orders/
│   │   ├── customers/
│   │   └── promotions/
│   ├── layouts/
│   ├── pages/
│   ├── styles/                  # 🆕 Consolidate all CSS here
│   │   ├── main.css
│   │   ├── theme.css
│   │   └── overrides.css
│   └── routes.tsx
│
├── config/                       # Configuration files
│   ├── env.ts
│   └── cloudinary.ts
│
├── App.tsx
├── main.tsx
└── routes/                       # Route definitions
    ├── index.tsx
    ├── ProtectedRoute.tsx
    └── routes.config.ts
```

---

## 🎨 2. Styling và CSS Organization

### ⚠️ Vấn đề hiện tại:

1. **Không nhất quán giữa `.css` và `.module.css`**
   - Một số page dùng `.module.css`, một số dùng `.css`
   - Dễ gây xung đột CSS

2. **Dashboard có quá nhiều CSS files**:
   - `style.css`, `theme-styles.css`, `debug-theme.css`, `force-theme.css`, `daisyui-override.css`
   - Khó maintain và debug

3. **Duplicate styles**:
   - `common-styles.css` và `common-styles.module.css` trong dashboard/components

### ✅ Đề xuất cải thiện:

#### Option 1: All CSS Modules (Recommended)
```
styles/
├── global.module.css              # Global styles
├── variables.module.css           # CSS variables
└── themes/
    ├── light.module.css
    └── dark.module.css

components/
└── Button/
    ├── Button.tsx
    └── Button.module.css          # Component-specific styles
```

#### Option 2: Styled-components hoặc Emotion
```bash
npm install styled-components
# or
npm install @emotion/react @emotion/styled
```

#### Option 3: Tailwind + CSS Modules cho custom styles
- ✅ Đã có Tailwind và DaisyUI
- Chỉ dùng CSS Modules cho các custom styles phức tạp

### 🎯 Action Items:

1. **Consolidate Dashboard CSS**:
```
dashboard/styles/
├── index.css                     # Import all styles
├── base.css                      # Base styles
├── theme.css                     # Theme variables
├── components.css                # Common component styles
└── overrides/
    └── daisyui.css              # DaisyUI overrides
```

2. **Standardize naming**:
   - Components: `ComponentName.module.css`
   - Pages: `PageName.module.css`
   - Global: `global.css`, `variables.css`

3. **Remove debug/temp files**:
   - ❌ `debug-theme.css`
   - ❌ `force-theme.css`
   - ❌ `debug-theme.js`

---

## 🔧 3. Services Layer

### ⚠️ Vấn đề hiện tại:

1. **Inconsistent file extensions**: `.ts` vs `.tsx`
2. **No centralized API client**: Mỗi service tạo axios instance riêng
3. **Duplicate interceptors**: Token interceptor bị duplicate
4. **Type definitions scattered**: Types định nghĩa trong service files

### ✅ Đề xuất cải thiện:

#### 1. Tạo centralized API client:

```typescript
// src/api/client.ts
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAuthToken, refreshAuthToken } from '@/utils/auth.utils';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newToken = await refreshAuthToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Wrapper methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1');
```

#### 2. Refactor services to use API client:

```typescript
// src/services/product.service.ts (not .tsx!)
import { apiClient } from '@/api/client';
import type { Product, ProductRequest, ApiResponse } from '@/types';

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products');
    return response.result;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.result;
  },

  create: async (data: ProductRequest): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<Product>>('/products', data);
    return response.result;
  },

  update: async (id: number, data: ProductRequest): Promise<Product> => {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.result;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};
```

#### 3. Move types to separate files:

```typescript
// src/types/product.types.ts
export interface Product {
  id: number;
  name: string;
  price: number;
  // ... other fields
}

export interface ProductRequest {
  name: string;
  price: number;
  // ... other fields
}

export interface ProductVariant {
  id: number;
  size?: string;
  color?: string;
  // ... other fields
}
```

---

## 🚀 4. Performance Optimization

### 🎯 Code Splitting

#### 1. Lazy load routes:

```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';

// Lazy load pages
const HomePage = lazy(() => import('./pages/home'));
const ProductsPage = lazy(() => import('./pages/products'));
const DashboardPage = lazy(() => import('./dashboard'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
```

#### 2. Split dashboard bundle:

```typescript
// src/dashboard/routes.tsx
import { lazy } from 'react';

const ProductsPage = lazy(() => import('./pages/products'));
const OrdersPage = lazy(() => import('./pages/orders'));
const PromotionsPage = lazy(() => import('./pages/promotions'));
```

### 🎯 Image Optimization

```typescript
// Add image lazy loading
<img 
  src={imageUrl} 
  loading="lazy" 
  alt={product.name}
/>

// Or use react-lazy-load-image-component
npm install react-lazy-load-image-component
```

### 🎯 Memo và useMemo

```typescript
// Memo expensive components
export const ProductCard = memo(({ product }: ProductCardProps) => {
  // ... component logic
});

// useMemo for expensive calculations
const filteredProducts = useMemo(() => {
  return products.filter(p => p.category === selectedCategory);
}, [products, selectedCategory]);
```

---

## 🧩 5. Component Architecture

### ⚠️ Vấn đề hiện tại:

1. **Large component files**: 
   - `dashboard/pages/products/index.tsx`: **1707 lines**
   - `dashboard/pages/promotions/index.tsx`: **860 lines**

2. **Mixed concerns**: UI logic, business logic, data fetching trong 1 file

### ✅ Đề xuất cải thiện:

#### 1. Split large components:

```typescript
// Before: products/index.tsx (1707 lines)

// After:
products/
├── index.tsx                    // Main component (200 lines)
├── components/
│   ├── ProductTable.tsx
│   ├── ProductForm.tsx
│   ├── ProductFilters.tsx
│   ├── ProductStats.tsx
│   └── BulkActions.tsx
├── hooks/
│   ├── useProducts.ts
│   ├── useProductForm.ts
│   └── useProductFilters.ts
└── types.ts
```

#### 2. Extract business logic to hooks:

```typescript
// hooks/useProducts.ts
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (data: ProductRequest) => {
    await productService.create(data);
    await fetchProducts();
  }, [fetchProducts]);

  // ... other methods

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    // ... other methods
  };
};
```

#### 3. Separate presentational and container components:

```typescript
// Container (logic)
const ProductsContainer = () => {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts();
  
  return (
    <ProductsView
      products={products}
      loading={loading}
      onCreateProduct={createProduct}
      onUpdateProduct={updateProduct}
      onDeleteProduct={deleteProduct}
    />
  );
};

// Presentational (UI)
const ProductsView = ({ products, loading, onCreateProduct, onUpdateProduct, onDeleteProduct }) => {
  return (
    <div>
      <ProductStats products={products} />
      <ProductTable 
        products={products} 
        onEdit={onUpdateProduct}
        onDelete={onDeleteProduct}
      />
    </div>
  );
};
```

---

## 🎨 6. UI/UX Improvements

### 🎯 Dashboard

#### 1. **Consistent spacing và layout**:
```typescript
// Use consistent spacing tokens
const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};
```

#### 2. **Better loading states**:
```typescript
// Add skeleton loading
import { Skeleton } from 'antd';

{loading ? (
  <Skeleton active paragraph={{ rows: 4 }} />
) : (
  <ProductTable data={products} />
)}
```

#### 3. **Empty states**:
```typescript
import { Empty } from 'antd';

{products.length === 0 && !loading && (
  <Empty
    description="Chưa có sản phẩm nào"
    image={Empty.PRESENTED_IMAGE_SIMPLE}
  >
    <Button type="primary" icon={<PlusOutlined />}>
      Thêm sản phẩm đầu tiên
    </Button>
  </Empty>
)}
```

#### 4. **Better error handling**:
```typescript
import { Alert } from 'antd';

{error && (
  <Alert
    message="Lỗi"
    description={error}
    type="error"
    showIcon
    closable
    onClose={() => setError(null)}
  />
)}
```

#### 5. **Add breadcrumbs**:
```typescript
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

<Breadcrumb>
  <Breadcrumb.Item href="/dashboard">
    <HomeOutlined />
  </Breadcrumb.Item>
  <Breadcrumb.Item>
    Sản phẩm
  </Breadcrumb.Item>
</Breadcrumb>
```

### 🎯 User-facing pages

#### 1. **Add loading spinners cho images**:
```typescript
<Image
  src={product.imageUrl}
  placeholder={
    <div className="image-placeholder">
      <Spin />
    </div>
  }
/>
```

#### 2. **Better responsive design**:
```css
/* Use consistent breakpoints */
@media (max-width: 640px) { /* mobile */ }
@media (min-width: 641px) and (max-width: 1024px) { /* tablet */ }
@media (min-width: 1025px) { /* desktop */ }
```

#### 3. **Add page transitions**:
```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  <YourPage />
</motion.div>
```

---

## 🔒 7. Security & Best Practices

### 🎯 Environment Variables

```typescript
// src/config/env.ts
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  cloudinaryUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Usage
import { env } from '@/config/env';
const response = await fetch(`${env.apiBaseUrl}/products`);
```

### 🎯 Input Validation

```typescript
// Add Zod or Yup for validation
npm install zod

// src/utils/validation.ts
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống').max(255),
  price: z.number().positive('Giá phải lớn hơn 0'),
  description: z.string().optional(),
});

// Usage in form
try {
  productSchema.parse(formData);
  await createProduct(formData);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Handle validation errors
  }
}
```

### 🎯 XSS Protection

```typescript
// Use DOMPurify for sanitizing HTML
npm install dompurify
npm install --save-dev @types/dompurify

import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(product.description)
}} />
```

---

## 📦 8. State Management

### ⚠️ Vấn đề hiện tại:
- Context API được sử dụng, nhưng có thể không đủ cho large-scale app
- Nhiều duplicate state trong các components

### ✅ Đề xuất:

#### Option 1: Continue with Context API + Custom Hooks
- ✅ Đơn giản, đủ cho medium app
- ❌ Performance issues với large state trees

#### Option 2: Add Zustand (Recommended)
```bash
npm install zustand

# Lightweight, simple, no boilerplate
```

```typescript
// src/stores/productStore.ts
import { create } from 'zustand';
import { productService } from '@/services/product.service';

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  createProduct: (data: ProductRequest) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  loading: false,
  error: null,
  
  fetchProducts: async () => {
    set({ loading: true });
    try {
      const products = await productService.getAll();
      set({ products, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  createProduct: async (data) => {
    await productService.create(data);
    // Refresh products
    useProductStore.getState().fetchProducts();
  },
}));

// Usage in component
const { products, loading, fetchProducts } = useProductStore();
```

#### Option 3: Redux Toolkit (For very large apps)
- ✅ Best for large, complex state
- ❌ More boilerplate

---

## 🧪 9. Testing

### 🎯 Add testing setup:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';

// src/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

---

## 📚 10. Documentation

### 🎯 Add component documentation:

```typescript
/**
 * ProductCard component displays product information in a card format
 * 
 * @param {Product} product - Product object to display
 * @param {function} onAddToCart - Callback when add to cart is clicked
 * @param {boolean} showActions - Whether to show action buttons
 * 
 * @example
 * <ProductCard 
 *   product={product} 
 *   onAddToCart={handleAddToCart}
 *   showActions={true}
 * />
 */
export const ProductCard = ({ product, onAddToCart, showActions }: ProductCardProps) => {
  // ...
};
```

### 🎯 Create README files:

```
src/
├── README.md                    # Project structure overview
├── components/README.md         # Components documentation
├── hooks/README.md              # Custom hooks documentation
└── services/README.md           # API services documentation
```

---

## 🚀 11. Build & Deployment Optimization

### 🎯 Vite configuration:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-vendor': ['antd', '@ant-design/icons'],
          'utils-vendor': ['axios', 'dayjs'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### 🎯 Add bundle analyzer:

```bash
npm install --save-dev rollup-plugin-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

---

## ✅ Priority Action Items

### 🔥 High Priority (Làm ngay):

1. **Rename all service files từ `.tsx` sang `.ts`**
2. **Consolidate contexts folder** (xóa duplicate)
3. **Tạo centralized API client**
4. **Remove debug/backup files** (`index-backup.tsx`, `debug-theme.css`, etc.)
5. **Split large component files** (products, promotions pages)

### 🟡 Medium Priority (1-2 tuần):

6. **Implement lazy loading cho routes**
7. **Add error boundaries cho từng feature**
8. **Standardize CSS approach** (all modules hoặc all Tailwind)
9. **Move types to separate folder**
10. **Add loading và empty states cho tất cả pages**

### 🟢 Low Priority (Nice to have):

11. **Add testing setup**
12. **Add component documentation**
13. **Implement state management (Zustand)**
14. **Add bundle analyzer**
15. **Add page transitions**

---

## 📖 Tài liệu tham khảo

- [React Best Practices 2024](https://react.dev/learn)
- [Vite Documentation](https://vitejs.dev/)
- [Ant Design Best Practices](https://ant.design/docs/react/introduce)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

---

## 📝 Notes

- File này là gợi ý, không cần phải làm tất cả ngay
- Ưu tiên những phần ảnh hưởng đến maintainability và performance
- Có thể implement từng phần một, test kỹ trước khi merge

**Tạo bởi**: AI Assistant  
**Ngày**: 30/10/2025  
**Version**: 1.0

