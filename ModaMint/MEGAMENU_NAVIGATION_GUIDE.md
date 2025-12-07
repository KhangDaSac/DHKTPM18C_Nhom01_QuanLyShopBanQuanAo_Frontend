# MegaMenu Navigation System - E-commerce Style

## 📋 Tổng quan
Hệ thống điều hướng MegaMenu được xây dựng theo chuẩn các website thương mại điện tử lớn (H&M, Zara, Uniqlo), cho phép người dùng lọc sản phẩm theo nhiều tiêu chí khác nhau.

## 🎯 Cách hoạt động

### 1. **Navigation URL Pattern**
Khi người dùng click vào bất kỳ mục nào trong MegaMenu, họ sẽ được chuyển đến trang Product Listing với query parameters:

```typescript
// Lọc theo danh mục
/products?categoryId={id}

// Lọc theo thương hiệu
/products?brandId={id}

// Lọc theo giới tính
/products?gender=male
/products?gender=female

// Kết hợp nhiều filter
/products?categoryId=1&brandId=5&gender=male
```

### 2. **Header MegaMenu Structure**

#### A. Menu Danh mục (Categories)
```tsx
{/* Hierarchical categories with parent-child structure */}
<Link to={`/products?categoryId=${parentCategory.id}`}>
  {parentCategory.name}
</Link>

{/* Subcategories */}
<Link to={`/products?categoryId=${subCategory.id}`}>
  {subCategory.name}
</Link>
```

**Features:**
- Tự động load từ database qua `categoryService.getAllCategories()`
- Hiển thị cấu trúc phân cấp (parent → children)
- Layout grid tự động chia cột
- Mỗi category có thể click → navigate to products page

#### B. Menu Thương hiệu (Brands)
```tsx
{/* Brands split into 3 columns */}
<Link to={`/products?brandId=${brand.id}`}>
  {brand.name}
</Link>
```

**Features:**
- Load brands từ `brandService.getActiveBrands()`
- Tự động chia thành 3 cột để hiển thị đẹp
- Chỉ hiển thị brands đang active

#### C. Menu Giới tính (Gender)
```tsx
{/* Gender filter */}
<Link to="/products?gender=male">Nam</Link>
<Link to="/products?gender=female">Nữ</Link>
```

**Features:**
- Hardcoded 2 options: Nam/Nữ
- Navigate với gender parameter

### 3. **Product Listing Page Logic**

#### A. Read Query Parameters
```tsx
const [searchParams] = useSearchParams();

const urlCategoryId = searchParams.get('categoryId');
const urlBrandId = searchParams.get('brandId');
const urlGender = searchParams.get('gender');
```

#### B. Build API Request
```tsx
const params = new URLSearchParams();

if (urlBrandId) {
  params.append('brandId', urlBrandId);
}

if (urlCategoryId) {
  params.append('categoryId', urlCategoryId);
}

if (urlGender) {
  params.append('gender', urlGender);
}

// Call API
const endpoint = params.toString() 
  ? `http://localhost:8080/api/v1/products/filter?${params.toString()}`
  : 'http://localhost:8080/api/v1/products';
```

#### C. Display Active Filters (FilterBreadcrumb)
```tsx
<FilterBreadcrumb />
```

Component này:
- Đọc query params từ URL
- Fetch tên category/brand từ API
- Hiển thị badge với tên filter
- Cho phép xóa từng filter hoặc xóa tất cả

**Example UI:**
```
Bộ lọc đang áp dụng:
[Danh mục: Áo Nam ×] [Thương hiệu: Nike ×] [Giới tính: Nam ×] [Xóa tất cả]
```

### 4. **Component Structure**

```
src/
├── components/
│   └── layout/
│       └── Header/
│           ├── Header.tsx           # MegaMenu navigation
│           └── Header.module.css    # MegaMenu styles
│   └── product-list/
│       └── FilterBreadcrumb.tsx    # Active filters display
│
├── pages/
│   └── products/
│       └── index.tsx               # Product listing with filters
│
├── services/
│   ├── category/
│   │   └── index.ts               # Category API service
│   └── brand/
│       └── index.ts               # Brand API service
```

### 5. **CSS Styling (MegaMenu)**

```css
.header__submenu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  min-width: 600px;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 25px;
}

.header__submenu-column h3 {
  font-size: 15px;
  font-weight: 700;
  border-bottom: 2px solid #ff6347;
  text-transform: uppercase;
}
```

### 6. **User Flow**

```
1. User hover "Danh mục" → MegaMenu xuất hiện
2. User click "Áo Nam" (categoryId=5)
3. Navigate to: /products?categoryId=5
4. Product page:
   - Read categoryId=5 from URL
   - Call API: /api/v1/products/filter?categoryId=5
   - Show FilterBreadcrumb: [Danh mục: Áo Nam ×]
   - Render filtered products
5. User click "×" on FilterBreadcrumb
   - Remove categoryId from URL
   - Navigate to: /products
   - Show all products
```

### 7. **Key Features**

✅ **Pure Navigation**: MegaMenu không hiển thị sản phẩm, chỉ điều hướng
✅ **URL-based Filtering**: Tất cả filters được lưu trong URL (shareable, bookmarkable)
✅ **Active Filter Highlight**: FilterBreadcrumb hiển thị filter đang active
✅ **Removable Filters**: Click × để xóa từng filter
✅ **Combinable Filters**: Có thể kết hợp nhiều filter cùng lúc
✅ **Auto-sync State**: useSearchParams tự động sync state với URL

### 8. **API Endpoints Expected**

```typescript
// Get all categories (with parent-child structure)
GET /api/categories
Response: { code: 1000, result: Category[] }

// Get category by ID
GET /api/categories/{id}
Response: { code: 1000, result: Category }

// Get active brands
GET /api/brands/active
Response: { code: 1000, result: BrandResponse[] }

// Get brand by ID
GET /api/brands/{id}
Response: { code: 1000, result: BrandResponse }

// Filter products
GET /api/v1/products/filter?categoryId={id}&brandId={id}&gender={male|female}
Response: { code: number, result: Product[] }
```

### 9. **Technology Stack**

- **React Router**: useSearchParams, useNavigate, Link
- **React Hooks**: useState, useEffect, useCallback
- **Axios**: API calls
- **TypeScript**: Type safety
- **CSS Modules**: Scoped styling
- **Heroicons**: Icons (XMarkIcon)

### 10. **Best Practices Implemented**

1. ✅ **Single Source of Truth**: URL is the source of truth for filters
2. ✅ **Memoization**: useCallback prevents infinite re-renders
3. ✅ **Loading States**: Show "Đang tải..." while fetching
4. ✅ **Error Handling**: Try-catch with console errors
5. ✅ **Responsive Design**: Grid auto-fit for different screen sizes
6. ✅ **Accessibility**: Semantic HTML, keyboard navigation
7. ✅ **SEO Friendly**: Clean URLs with meaningful parameters
8. ✅ **User Feedback**: Toast notifications, visual indicators

## 🚀 Usage Example

```tsx
// User clicks "Áo Nam" in category menu
<Link to="/products?categoryId=5">Áo Nam</Link>

// Product page reads params and filters
const categoryId = searchParams.get('categoryId'); // "5"

// API call with filter
fetch('/api/v1/products/filter?categoryId=5')

// Show breadcrumb
<FilterBreadcrumb /> 
// Renders: [Danh mục: Áo Nam ×] [Xóa tất cả]

// User removes filter
removeFilter('category')
// Navigate to: /products (shows all products)
```

## 📝 Notes

- Backend cần hỗ trợ `gender` parameter trong API filter
- Gender values: `male` hoặc `female`
- Có thể mở rộng thêm filters: price range, colors, sizes
- MegaMenu tự động hide khi navigate away
