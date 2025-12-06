# ✅ FIXED - Field Name Mismatch Between Frontend and Backend

## 🔴 Nguyên nhân lỗi "Product không lưu vào database"

**Root Cause:** Frontend gửi field names KHÁC với những gì Backend DTO nhận được → Backend không map được data → Silent fail

---

## 📋 TẤT CẢ CÁC SỬA ĐỔI

### 1️⃣ **CreateProductVariantRequest** - DTO cho tạo variants

**File:** `src/services/product/index.ts`

**SAI:**
```typescript
export interface CreateProductVariantRequest {
    size?: string;
    color?: string;
    image?: string;  // ❌ Backend cần imageUrl
    price: number;
    discount?: number;
    quantity: number;
    additionalPrice?: number;
}
```

**ĐÚNG:**
```typescript
export interface CreateProductVariantRequest {
    size?: string;
    color?: string;
    imageUrl?: string;  // ✅ Khớp với backend CreateProductVariantRequest.imageUrl
    price: number;
    discount?: number;
    quantity: number;
    additionalPrice?: number;
}
```

---

### 2️⃣ **ProductRequest** - DTO cho tạo/update product

**File:** `src/services/product/index.ts`

**SAI:**
```typescript
export interface ProductRequest {
    name: string;
    brandId: number;
    categoryId: number;
    description: string;
    images?: string[];  // ❌ Backend cần imageUrls
    active?: boolean;
}
```

**ĐÚNG:**
```typescript
export interface ProductRequest {
    name: string;
    brandId: number;
    categoryId: number;
    description: string;
    imageUrls?: string[];  // ✅ Khớp với backend ProductRequest.imageUrls
    active?: boolean;
}
```

---

### 3️⃣ **ProductVariantRequest** - DTO cho create/update single variant

**File:** `src/services/productVariant.ts`

**SAI:**
```typescript
export interface ProductVariantRequest {
    productId: number;
    size: string;
    color: string;
    image?: string;  // ❌ Backend cần imageUrl
    price: number;
    discount?: number;
    quantity: number;
    additionalPrice?: number;
    active?: boolean;
}
```

**ĐÚNG:**
```typescript
export interface ProductVariantRequest {
    productId: number;
    size: string;
    color: string;
    imageUrl?: string;  // ✅ Khớp với backend ProductVariantRequest.imageUrl
    price: number;
    discount?: number;
    quantity: number;
    additionalPrice?: number;
    active?: boolean;
}
```

---

### 4️⃣ **ProductModal.tsx** - CREATE MODE: Assign product images

**File:** `src/dashboard/pages/products/ProductModal.tsx` (line ~539)

**SAI:**
```typescript
if (uploadedProductImageUrls.length > 0) {
    productData.images = uploadedProductImageUrls;  // ❌ SAI
}
```

**ĐÚNG:**
```typescript
if (uploadedProductImageUrls.length > 0) {
    productData.imageUrls = uploadedProductImageUrls;  // ✅ ĐÚNG
}
```

---

### 5️⃣ **ProductModal.tsx** - EDIT MODE: Assign product images

**File:** `src/dashboard/pages/products/ProductModal.tsx` (line ~594)

**SAI:**
```typescript
if (uploadedProductImageUrls.length > 0) {
    productData.images = uploadedProductImageUrls;  // ❌ SAI
}
```

**ĐÚNG:**
```typescript
if (uploadedProductImageUrls.length > 0) {
    productData.imageUrls = uploadedProductImageUrls;  // ✅ ĐÚNG
}
```

---

### 6️⃣ **ProductModal.tsx** - CREATE MODE: Map variants with uploaded images

**File:** `src/dashboard/pages/products/ProductModal.tsx` (line ~523)

**SAI:**
```typescript
return {
    size: variant.size,
    color: variant.color,
    price: variant.price,
    quantity: variant.quantity,
    discount: variant.discount || 0,
    additionalPrice: variant.additionalPrice || 0,
    image: finalImageUrl || ''  // ❌ SAI
};
```

**ĐÚNG:**
```typescript
return {
    size: variant.size,
    color: variant.color,
    price: variant.price,
    quantity: variant.quantity,
    discount: variant.discount || 0,
    additionalPrice: variant.additionalPrice || 0,
    imageUrl: finalImageUrl || ''  // ✅ ĐÚNG
};
```

---

### 7️⃣ **ProductModal.tsx** - EDIT MODE: CREATE new variant

**File:** `src/dashboard/pages/products/ProductModal.tsx` (line ~302)

**SAI:**
```typescript
const variantData: ProductVariantRequest = {
    productId: editingProduct!.id,
    size: variant.size,
    color: variant.color,
    price: variant.price,
    quantity: variant.quantity,
    discount: variant.discount,
    additionalPrice: variant.additionalPrice,
    image: finalImageUrl  // ❌ SAI
};
```

**ĐÚNG:**
```typescript
const variantData: ProductVariantRequest = {
    productId: editingProduct!.id,
    size: variant.size,
    color: variant.color,
    price: variant.price,
    quantity: variant.quantity,
    discount: variant.discount,
    additionalPrice: variant.additionalPrice,
    imageUrl: finalImageUrl  // ✅ ĐÚNG
};
```

---

### 8️⃣ **ProductModal.tsx** - EDIT MODE: UPDATE existing variant

**File:** `src/dashboard/pages/products/ProductModal.tsx` (line ~327)

**SAI:**
```typescript
const variantData: ProductVariantRequest = {
    productId: editingProduct!.id,
    size: variant.size,
    color: variant.color,
    price: variant.price,
    quantity: variant.quantity,
    discount: variant.discount,
    additionalPrice: variant.additionalPrice,
    image: finalImageUrl,  // ❌ SAI
    active: variant.active !== undefined ? variant.active : true
};
```

**ĐÚNG:**
```typescript
const variantData: ProductVariantRequest = {
    productId: editingProduct!.id,
    size: variant.size,
    color: variant.color,
    price: variant.price,
    quantity: variant.quantity,
    discount: variant.discount,
    additionalPrice: variant.additionalPrice,
    imageUrl: finalImageUrl,  // ✅ ĐÚNG
    active: variant.active !== undefined ? variant.active : true
};
```

---

## 🎯 TÓM TẮT CÁC FIELD MAPPING

| **Context** | **Frontend Field** | **Backend Field** | **Fixed?** |
|-------------|-------------------|-------------------|------------|
| Product images (array) | `imageUrls` | `imageUrls` | ✅ |
| Variant image (single) trong CreateProductVariantRequest | `imageUrl` | `imageUrl` | ✅ |
| Variant image (single) trong ProductVariantRequest | `imageUrl` | `imageUrl` | ✅ |

---

## 🧪 CÁCH TEST LẠI

### Bước 1: Build Frontend
```bash
cd FE/ModaMint
npm run build
```

### Bước 2: Start Frontend Dev Server
```bash
npm run dev
```

### Bước 3: Test tạo sản phẩm mới
1. Mở Dashboard → Products → "Thêm sản phẩm mới"
2. Điền thông tin sản phẩm
3. Upload ảnh sản phẩm (tối đa 8 ảnh)
4. Thêm variants với ảnh
5. Click "Lưu"

### Bước 4: Kiểm tra Backend Log

**Nếu THÀNH CÔNG**, sẽ thấy log:
```
[CONTROLLER] Received request - Product: Áo Sơ Mi Nam...
[CREATE_PRODUCT_WITH_VARIANTS] Starting - Product name: Áo Sơ Mi Nam, Variants: 2
[CREATE_PRODUCT_WITH_VARIANTS] Validating brand ID: 1
[CREATE_PRODUCT_WITH_VARIANTS] Validating category ID: 2
[CREATE_PRODUCT_WITH_VARIANTS] Mapping ProductRequest to Product entity
[CREATE_PRODUCT_WITH_VARIANTS] Image URLs count: 3
[CREATE_PRODUCT_WITH_VARIANTS] Product saved successfully with ID: 123
[CREATE_PRODUCT_WITH_VARIANTS] Creating 2 variants
[CREATE_PRODUCT_WITH_VARIANTS] Saving 2 variants to database
[CREATE_PRODUCT_WITH_VARIANTS] Saved 2 variants successfully
[CREATE_PRODUCT_WITH_VARIANTS] Successfully created product ID: 123 with 2 variants
[CONTROLLER] Successfully created product ID: 123
```

### Bước 5: Kiểm tra Database
```sql
-- Kiểm tra product mới tạo
SELECT * FROM products ORDER BY id DESC LIMIT 1;

-- Kiểm tra variants của product
SELECT * FROM product_variants WHERE product_id = <ID_VỪA_TẠO>;
```

**Expected:**
- Table `products` có record mới với field `images` chứa JSON array URLs
- Table `product_variants` có N records với field `image` chứa URL

---

## ✅ KẾT LUẬN

**Nguyên nhân:** Field name mismatch giữa Frontend TypeScript interfaces và Backend Java DTOs

**Giải pháp:** Đổi tất cả:
- `images` → `imageUrls` (product)
- `image` → `imageUrl` (variant)

**Files đã sửa:**
1. `src/services/product/index.ts` - Interface definitions
2. `src/services/productVariant.ts` - Interface definition
3. `src/dashboard/pages/products/ProductModal.tsx` - 5 chỗ gán field name

**Status:** ✅ ĐÃ SỬA XONG - Sẵn sàng test lại
