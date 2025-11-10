# ModaMint Frontend - Development Standards

Bộ quy tắc chuẩn hóa toàn diện cho việc phát triển Frontend trong dự án ModaMint. Tài liệu này đảm bảo tính nhất quán về code structure, UI/UX, performance, và best practices.

**📌 Lưu ý quan trọng:**
- Tài liệu này áp dụng cho **TẤT CẢ** components, pages, services trong frontend
- Dashboard pages tuân theo [DASHBOARD_STANDARDS.md](./DASHBOARD_STANDARDS.md)
- Màu sắc sử dụng theo [COLOR_PALETTE.md](./COLOR_PALETTE.md) - **Bảng Màu A: Warm & Professional**

---

## 📚 Mục Lục

1. [Cấu trúc Project](#1-cấu-trúc-project)
2. [Naming Conventions](#2-naming-conventions)
3. [Component Patterns](#3-component-patterns)
4. [Styling Guidelines](#4-styling-guidelines)
5. [State Management](#5-state-management)
6. [API & Services](#6-api--services)
7. [Hooks Patterns](#7-hooks-patterns)
8. [TypeScript Conventions](#8-typescript-conventions)
9. [Performance Optimization](#9-performance-optimization)
10. [Build & Deployment](#10-build--deployment)
11. [Git & Commit Messages](#11-git--commit-messages)
12. [Code Review Checklist](#12-code-review-checklist)

---

## 1. Cấu Trúc Project

### 1.1 Cấu trúc thư mục chuẩn

```
FE/ModaMint/
├── src/
│   ├── api/                    # API clients và interceptors
│   │   ├── client.ts          # Axios instance chính
│   │   ├── endpoints.ts       # API endpoints constants
│   │   └── interceptors/      # Request/Response interceptors
│   │       ├── auth.interceptor.ts
│   │       └── error.interceptor.ts
│   │
│   ├── components/            # Reusable components
│   │   ├── layout/           # Layout components (Header, Footer, RootLayout)
│   │   ├── common/           # Common components (LazyImage, etc.)
│   │   ├── product/          # Product-related components
│   │   └── [component-name]/  # Component folders
│   │       ├── index.tsx
│   │       └── style.module.css
│   │
│   ├── pages/                # Page components
│   │   ├── home/
│   │   ├── product/
│   │   ├── profile/
│   │   └── [page-name]/
│   │       ├── index.tsx
│   │       └── style.module.css
│   │
│   ├── dashboard/            # Dashboard specific (có standards riêng)
│   │   ├── pages/
│   │   ├── layout/
│   │   └── components/
│   │
│   ├── services/             # API service layers
│   │   ├── product/
│   │   ├── category/
│   │   └── [service-name]/
│   │       └── index.ts
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useProducts.ts
│   │   └── useRoles.ts
│   │
│   ├── contexts/             # React Context providers
│   │   ├── authContext.tsx
│   │   ├── CartContext.tsx
│   │   └── productContext.tsx
│   │
│   ├── types/                # TypeScript type definitions
│   │   ├── api.types.ts
│   │   ├── product.types.ts
│   │   └── user.types.ts
│   │
│   ├── utils/                # Utility functions
│   │   ├── format.utils.ts
│   │   ├── validation.utils.ts
│   │   └── constants.ts
│   │
│   ├── routes/               # Route configurations
│   │   └── ProtectedRoute.tsx
│   │
│   ├── config/               # Configuration files
│   │   └── cloudinary.ts
│   │
│   ├── App.tsx               # Root component
│   └── main.tsx              # Entry point
│
├── public/                   # Static assets
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── RULE.md                    # Legacy rules (tham khảo)
├── DASHBOARD_STANDARDS.md     # Dashboard specific rules
├── COLOR_PALETTE.md          # Color palette standards
└── FRONTEND_STANDARDS.md     # File này
```

### 1.2 Quy tắc tổ chức file

- **Components**: Mỗi component có folder riêng với `index.tsx` và `style.module.css`
- **Pages**: Mỗi page có folder riêng với `index.tsx` và `style.module.css`
- **Services**: Mỗi service có folder riêng với `index.ts` chứa tất cả functions
- **Hooks**: Mỗi hook là một file `.ts` trong `src/hooks/`
- **Types**: Nhóm theo domain trong `src/types/`

---

## 2. Naming Conventions

### 2.1 File và Thư Mục

#### Thư mục
- **Viết thường**, sử dụng **dấu gạch ngang (-)** cho tên nhiều từ
- ✅ `product-detail`, `user-profile`, `checkout-page`
- ❌ `productDetail`, `product_detail`, `ProductDetail`

#### Files
- **Components/Pages**: `index.tsx` hoặc `[ComponentName].tsx`
- **CSS**: `style.module.css` (cho CSS Modules) hoặc `[component-name].module.css`
- **Services**: `index.ts`
- **Hooks**: `use[Name].ts` (VD: `useProducts.ts`)
- **Types**: `[domain].types.ts` (VD: `product.types.ts`)

#### Ví dụ
```
✅ src/components/product-card/index.tsx
✅ src/pages/product-detail/index.tsx
✅ src/services/product/index.ts
✅ src/hooks/useProducts.ts
✅ src/types/product.types.ts

❌ src/components/ProductCard.tsx
❌ src/pages/productDetail/index.tsx
❌ src/services/productService.ts
```

### 2.2 TypeScript/JavaScript

#### Variables & Functions
- **camelCase** cho variables và functions
- ✅ `const productName`, `function calculateTotal()`
- ❌ `const product_name`, `function CalculateTotal()`

#### Components
- **PascalCase** cho component names
- ✅ `const ProductCard`, `const UserProfile`
- ❌ `const productCard`, `const user_profile`

#### Constants
- **UPPER_SNAKE_CASE** cho constants
- ✅ `const API_BASE_URL`, `const MAX_RETRY_COUNT`
- ❌ `const apiBaseUrl`, `const MaxRetryCount`

#### Interfaces/Types
- **PascalCase** cho interface/type names
- ✅ `interface ProductResponse`, `type UserRole`
- ❌ `interface productResponse`, `type user_role`

#### CSS Classes (BEM)
- **Block**: Tên component (lowercase, hyphen)
- **Element**: `block__element`
- **Modifier**: `block__element--modifier`

---

## 3. Component Patterns

### 3.1 Cấu trúc Component chuẩn

```tsx
import React, { useState, useEffect } from 'react';
import styles from './style.module.css';

interface ComponentProps {
    title: string;
    onAction?: () => void;
    children?: React.ReactNode;
}

const ComponentName: React.FC<ComponentProps> = ({ 
    title, 
    onAction, 
    children 
}) => {
    // State declarations
    const [state, setState] = useState<Type>(initialValue);
    
    // Effects
    useEffect(() => {
        // Effect logic
    }, [dependencies]);
    
    // Event handlers
    const handleAction = () => {
        // Handler logic
        onAction?.();
    };
    
    // Render
    return (
        <div className={styles.component}>
            <div className={styles.component__header}>
                <h2 className={styles.component__title}>{title}</h2>
            </div>
            <div className={styles.component__content}>
                {children}
            </div>
        </div>
    );
};

export default ComponentName;
```

### 3.2 Component Best Practices

#### ✅ DO
- Sử dụng TypeScript interfaces cho props
- Tách logic phức tạp ra custom hooks
- Sử dụng CSS Modules cho styling
- Destructure props trong function signature
- Sử dụng optional chaining (`?.`) và nullish coalescing (`??`)
- Export default cho page components
- Named exports cho reusable components

#### ❌ DON'T
- Không inline styles (trừ trường hợp đặc biệt như dynamic values)
- Không sử dụng global CSS classes (trừ CSS variables)
- Không hardcode magic numbers/strings
- Không mix CSS Modules với global CSS
- Không export multiple default exports từ một file

### 3.3 Component Categories

#### Page Components (`src/pages/`)
- Mỗi route tương ứng với một page component
- Sử dụng `index.tsx` làm entry point
- Có thể import layout components

```tsx
// src/pages/product/index.tsx
import React from 'react';
import { RootLayout } from '@/components/layout';
import ProductList from './ProductList';
import styles from './style.module.css';

const ProductPage: React.FC = () => {
    return (
        <RootLayout>
            <div className={styles.productPage}>
                <ProductList />
            </div>
        </RootLayout>
    );
};

export default ProductPage;
```

#### Layout Components (`src/components/layout/`)
- Header, Footer, RootLayout
- Tái sử dụng trên nhiều pages

#### Reusable Components (`src/components/`)
- ProductCard, LazyImage, etc.
- Có thể sử dụng ở nhiều nơi
- Props interface rõ ràng

---

## 4. Styling Guidelines

### 4.1 CSS Modules (Bắt buộc)

#### ✅ Sử dụng CSS Modules
```tsx
import styles from './style.module.css';

<div className={styles.header}>
    <div className={styles.header__logo}></div>
</div>
```

#### ❌ Không sử dụng Global CSS cho components
```tsx
// ❌ SAI
import './style.css';
<div className="header"></div>
```

### 4.2 BEM Methodology

#### Cấu trúc BEM
```css
/* Block */
.product-card { }

/* Element */
.product-card__image { }
.product-card__title { }
.product-card__price { }

/* Modifier */
.product-card--featured { }
.product-card__button--primary { }
.product-card__button--secondary { }
```

#### Quy tắc BEM
- **Block**: Tên component chính (lowercase, hyphen)
- **Element**: Sử dụng `__` để phân cách
- **Modifier**: Sử dụng `--` để phân cách
- **KHÔNG NESTING** quá 2 cấp: `block__element--modifier`

### 4.3 CSS Variables

#### Màu sắc (tham chiếu COLOR_PALETTE.md)
```css
:root {
    /* Primary Colors */
    --primary-color: #ff6347;
    --primary-hover: #e55a40;
    --primary-light: #ffcc80;
    
    /* Text Colors */
    --text-primary: #262626;
    --text-secondary: #8c8c8c;
    --text-white: #ffffff;
    
    /* Background Colors */
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f5;
    
    /* Status Colors */
    --color-success: #52c41a;
    --color-warning: #faad14;
    --color-error: #ff4d4f;
    --color-info: #1890ff;
    --color-special: #722ed1;
    
    /* Spacing */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    
    /* Border Radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-full: 999px;
    
    /* Transitions */
    --transition-fast: 0.2s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
}
```

### 4.4 Responsive Design

#### Breakpoints
```css
/* Mobile First Approach */
@media (min-width: 576px) { }   /* Small devices */
@media (min-width: 768px) { }   /* Medium devices */
@media (min-width: 992px) { }   /* Large devices */
@media (min-width: 1200px) { }  /* Extra large devices */
```

#### Container Width
```css
.container {
    width: 100%;
    max-width: 80%;        /* Desktop */
    margin: 0 auto;
}

@media (max-width: 768px) {
    .container {
        max-width: 95%;   /* Mobile */
    }
}
```

### 4.5 Dashboard Styling

**📌 Quan trọng:** Dashboard pages có standards riêng, xem [DASHBOARD_STANDARDS.md](./DASHBOARD_STANDARDS.md)

Dashboard sử dụng:
- **Ant Design** components
- **Inline styles** cho table spacing (theo standards)
- **CSS classes** từ `dashboard/style.css` cho buttons
- **Màu sắc** theo [COLOR_PALETTE.md](./COLOR_PALETTE.md)

---

## 5. State Management

### 5.1 React Hooks

#### useState
```tsx
// ✅ Đúng: Khai báo type rõ ràng
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState<boolean>(false);
const [user, setUser] = useState<User | null>(null);
```

#### useEffect
```tsx
// ✅ Đúng: Dependency array đầy đủ
useEffect(() => {
    fetchData();
}, [dependency1, dependency2]);

// ✅ Cleanup function nếu cần
useEffect(() => {
    const subscription = subscribe();
    return () => {
        subscription.unsubscribe();
    };
}, []);
```

### 5.2 Context API

#### Context Pattern
```tsx
// contexts/authContext.tsx
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    
    // Context logic
    
    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
```

#### Context Usage
```tsx
// ✅ Sử dụng custom hook
const { isAuthenticated, user, login } = useAuth();

// ❌ Không sử dụng Context trực tiếp
const context = useContext(AuthContext);
```

### 5.3 State Best Practices

#### ✅ DO
- Sử dụng local state cho UI state (modals, forms)
- Sử dụng Context cho global state (auth, cart, theme)
- Tách complex state logic vào custom hooks
- Memoize expensive computations với `useMemo`
- Memoize callbacks với `useCallback` khi cần

#### ❌ DON'T
- Không overuse Context (chỉ cho state thực sự global)
- Không đặt quá nhiều state trong một component
- Không sử dụng state cho derived values

---

## 6. API & Services

### 6.1 API Client Pattern

#### Axios Instance
```tsx
// src/api/client.ts
import axios from 'axios';
import { authRequestInterceptor, authResponseInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
    withCredentials: true,
});

// Setup interceptors
apiClient.interceptors.request.use(authRequestInterceptor);
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const authResult = await authResponseInterceptor(error);
        if (authResult !== undefined) return Promise.resolve(authResult);
        return errorInterceptor(error);
    }
);
```

#### ✅ Sử dụng `apiClient` cho TẤT CẢ API calls
```tsx
// ✅ Đúng
import { apiClient } from '@/api/client';

const response = await apiClient.get('/products');
```

#### ❌ Không tạo axios instance riêng (trừ trường hợp đặc biệt)
```tsx
// ❌ SAI
const customClient = axios.create({ baseURL: '...' });
```

### 6.2 Service Layer Pattern

#### Service Structure
```tsx
// src/services/product/index.ts
import { apiClient } from '@/api/client';
import type { ApiResponse } from '../authentication';

// ==================== INTERFACES ====================
export interface ProductResponse {
    id: number;
    name: string;
    price: number;
    // ...
}

export interface ProductRequest {
    name: string;
    price: number;
    // ...
}

// ==================== SERVICES ====================
export const productService = {
    // Get all products
    getAllProducts: async (): Promise<ApiResponse<ProductResponse[]>> => {
        try {
            const response = await apiClient.get<ApiResponse<ProductResponse[]>>('/products');
            return {
                success: true,
                data: response.data.result,
                message: response.data.message || 'Success',
            };
        } catch (error: any) {
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Failed to fetch products',
            };
        }
    },
    
    // Get product by ID
    getProductById: async (id: number): Promise<ApiResponse<ProductResponse>> => {
        // Implementation
    },
    
    // Create product
    createProduct: async (data: ProductRequest): Promise<ApiResponse<ProductResponse>> => {
        // Implementation
    },
    
    // Update product
    updateProduct: async (id: number, data: Partial<ProductRequest>): Promise<ApiResponse<ProductResponse>> => {
        // Implementation
    },
    
    // Delete product
    deleteProduct: async (id: number): Promise<ApiResponse<void>> => {
        // Implementation
    },
};
```

#### Service Best Practices

##### ✅ DO
- Group related API calls trong một service file
- Export interfaces cùng với service
- Sử dụng `ApiResponse<T>` wrapper cho type safety
- Return consistent response format: `{ success, data, message }`
- Handle errors trong service layer

##### ❌ DON'T
- Không đặt business logic trong service (chỉ API calls)
- Không tạo nhiều axios instances
- Không hardcode API URLs (dùng constants từ `endpoints.ts`)

### 6.3 Error Handling

#### Error Response Format
```tsx
interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    message: string;
}
```

#### Error Handling Pattern
```tsx
try {
    const result = await productService.getAllProducts();
    if (result.success && result.data) {
        setProducts(result.data);
    } else {
        message.error(result.message || 'Failed to load products');
    }
} catch (error) {
    message.error('An unexpected error occurred');
    console.error('Error:', error);
}
```

---

## 7. Hooks Patterns

### 7.1 Custom Hooks Structure

```tsx
// src/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { productService } from '../services/product';
import type { ProductResponse } from '../services/product';

interface UseProductsReturn {
    products: ProductResponse[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useProducts = (): UseProductsReturn => {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        // Check authentication
        const authDataStr = localStorage.getItem("authData");
        if (!authDataStr) {
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const result = await productService.getAllProducts();
            
            if (result.success && result.data) {
                setProducts(result.data);
            } else {
                setError(result.message || 'Failed to fetch products');
            }
        } catch (err) {
            setError('An error occurred while fetching products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return {
        products,
        loading,
        error,
        refetch: fetchProducts,
    };
};
```

### 7.2 Hook Naming Convention

- **Prefix**: `use` (VD: `useProducts`, `useAuth`, `useCart`)
- **File name**: `use[Name].ts` (VD: `useProducts.ts`)
- **Return type**: Interface với tên `Use[Name]Return` hoặc explicit return type

### 7.3 Hook Best Practices

#### ✅ DO
- Return object với named properties (không return array trừ `useState`, `useReducer`)
- Handle loading và error states
- Provide `refetch` function để reload data
- Check authentication trước khi gọi API
- Memoize returned values nếu cần

#### ❌ DON'T
- Không side effects trong render phase
- Không mutate state trực tiếp
- Không return inconsistent data types

---

## 8. TypeScript Conventions

### 8.1 Type Definitions

#### Interface vs Type
```tsx
// ✅ Interface cho object shapes
interface Product {
    id: number;
    name: string;
    price: number;
}

// ✅ Type cho unions, intersections, aliases
type UserRole = 'admin' | 'user' | 'guest';
type ApiResponse<T> = {
    success: boolean;
    data: T | null;
    message: string;
};
```

### 8.2 Type Safety

#### ✅ DO
- Luôn type props của components
- Sử dụng `interface` cho object shapes
- Sử dụng `type` cho unions, intersections
- Export types/interfaces cùng với implementation
- Sử dụng generics cho reusable types

```tsx
// ✅ Good
interface ComponentProps {
    title: string;
    items: Product[];
    onSelect?: (item: Product) => void;
}

const Component: React.FC<ComponentProps> = ({ title, items, onSelect }) => {
    // ...
};
```

#### ❌ DON'T
```tsx
// ❌ Không sử dụng `any` (trừ khi thực sự cần thiết)
const handleData = (data: any) => { }

// ❌ Không bỏ qua types
const Component = ({ title, items }) => { }
```

### 8.3 Import Paths

#### Path Aliases
```tsx
// vite.config.ts
resolve: {
    alias: {
        '@': path.resolve(__dirname, './src'),
    },
}

// ✅ Sử dụng alias
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/authContext';
import type { Product } from '@/types/product.types';
```

#### ✅ DO
- Sử dụng `@/` alias cho absolute imports từ `src/`
- Sử dụng relative imports cho files cùng folder/level

#### ❌ DON'T
```tsx
// ❌ Không sử dụng relative paths dài
import { apiClient } from '../../../../api/client';
```

---

## 9. Performance Optimization

### 9.1 Code Splitting

#### Route-based splitting (automatic với React Router)
```tsx
// App.tsx - routes được split tự động
const router = createBrowserRouter([
    { path: '/', element: <HomePage /> },
    { path: '/products', element: <ProductPage /> },
]);
```

### 9.2 Image Optimization

#### ✅ DO
```tsx
// Sử dụng LazyImage component
import { LazyImage } from '@/components/common';

<LazyImage 
    src={product.image} 
    alt={product.name}
    loading="lazy"
/>
```

#### Image Best Practices
- Format: **WebP** khi có thể
- Lazy loading cho images ngoài viewport
- Responsive images với `srcset`
- Optimize image sizes trước khi upload

### 9.3 React Optimization

#### Memoization
```tsx
// ✅ useMemo cho expensive computations
const expensiveValue = useMemo(() => {
    return heavyComputation(data);
}, [data]);

// ✅ useCallback cho stable function references
const handleClick = useCallback(() => {
    // Handler logic
}, [dependencies]);
```

#### ✅ DO
- Memoize expensive computations
- Memoize callbacks passed to child components
- Sử dụng `React.memo` cho components render nhiều lần
- Lazy load heavy components

### 9.4 Build Optimization

#### Vite Configuration
```ts
// vite.config.ts - đã config sẵn
build: {
    rollupOptions: {
        output: {
            manualChunks: {
                'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                'antd-vendor': ['antd', '@ant-design/icons'],
                'utils-vendor': ['axios', 'dayjs', 'xlsx'],
            },
        },
    },
    minify: 'esbuild',
    target: 'es2020',
}
```

---

## 10. Build & Deployment

### 10.1 Environment Variables

#### Setup
```bash
# .env.local (không commit)
VITE_API_URL=http://localhost:8080/api/v1
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

#### Usage
```tsx
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
```

### 10.2 Scripts

```json
{
    "dev": "vite",              // Development server
    "build": "tsc -b && vite build",  // Production build
    "preview": "vite preview",  // Preview production build
    "lint": "eslint ."          // Lint code
}
```

### 10.3 Build Output

- **Output directory**: `dist/`
- **Source maps**: Generated for debugging
- **Chunk splitting**: Automatic theo vendors

---

## 11. Git & Commit Messages

### 11.1 Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

#### Types
- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `style`: Thay đổi CSS/styling (không ảnh hưởng logic)
- `refactor`: Refactor code (không thêm tính năng/sửa lỗi)
- `docs`: Cập nhật documentation
- `test`: Thêm/sửa test
- `chore`: Cập nhật build process, dependencies
- `perf`: Performance improvements

#### Examples
```
feat(product): add product search functionality
fix(cart): resolve cart item quantity update issue
style(header): update header color scheme to match brand
refactor(auth): simplify login component structure
docs(readme): update installation instructions
perf(image): implement lazy loading for product images
```

### 11.2 Branch Naming

```
feature/product-search
fix/cart-quantity-bug
refactor/auth-flow
style/header-redesign
```

### 11.3 Git Best Practices

#### ✅ DO
- Commit thường xuyên với messages rõ ràng
- Tách commits theo logical changes
- Review code trước khi merge
- Sử dụng descriptive branch names

#### ❌ DON'T
- Không commit với message như "fix", "update", "changes"
- Không commit code chưa test
- Không commit sensitive data (tokens, passwords)

---

## 12. Code Review Checklist

### 12.1 General Checklist

- [ ] Tuân thủ naming conventions (files, folders, variables)
- [ ] TypeScript types đầy đủ và chính xác
- [ ] Không có `any` types (trừ trường hợp cần thiết)
- [ ] Không có unused imports/variables
- [ ] Code readable và maintainable
- [ ] Comments cho logic phức tạp

### 12.2 Component Checklist

- [ ] Sử dụng CSS Modules (không global CSS)
- [ ] BEM naming cho CSS classes
- [ ] Props interface đầy đủ
- [ ] Error handling đầy đủ
- [ ] Loading states được handle
- [ ] Responsive design đúng breakpoints

### 12.3 API/Service Checklist

- [ ] Sử dụng `apiClient` (không tạo axios instance riêng)
- [ ] Service có error handling
- [ ] Return types rõ ràng với `ApiResponse<T>`
- [ ] Không hardcode API URLs

### 12.4 Performance Checklist

- [ ] Images được optimize (WebP, lazy loading)
- [ ] Không có unnecessary re-renders
- [ ] Memoization cho expensive operations
- [ ] Code splitting đúng cho routes

### 12.5 Styling Checklist

- [ ] Tuân thủ BEM methodology
- [ ] Sử dụng CSS variables cho colors/spacing
- [ ] Responsive design đúng breakpoints
- [ ] Màu sắc theo [COLOR_PALETTE.md](./COLOR_PALETTE.md)
- [ ] Dashboard pages theo [DASHBOARD_STANDARDS.md](./DASHBOARD_STANDARDS.md)

---

## 📚 Tài Liệu Tham Khảo

### Internal Documentation
- [DASHBOARD_STANDARDS.md](./DASHBOARD_STANDARDS.md) - Dashboard specific standards
- [COLOR_PALETTE.md](./COLOR_PALETTE.md) - Color palette guidelines
- [RULE.md](./RULE.md) - Legacy rules (tham khảo)

### External Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Ant Design](https://ant.design/)
- [Vite Documentation](https://vite.dev/)
- [BEM Methodology](http://getbem.com/)

---

## 🔄 Cập Nhật Tài Liệu

Tài liệu này được cập nhật định kỳ. Khi có thay đổi:
1. Update file này
2. Thông báo cho team
3. Review trong code review nếu thay đổi lớn

---

**Lưu ý:** Tất cả developers phải tuân thủ nghiêm ngặt các quy tắc này để đảm bảo tính nhất quán và chất lượng của dự án ModaMint.

