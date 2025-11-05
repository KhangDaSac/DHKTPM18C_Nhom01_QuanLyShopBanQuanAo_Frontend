# QUY TẮC PHÁT TRIỂN DỰ ÁN MODAMINT

## 📁 QUY TẮC ĐẶT TÊN FILE VÀ THƯ MỤC

### 1. Đặt tên file CSS Module
- **Tất cả file CSS phải sử dụng CSS Module**: `style.module.css`
- **Ví dụ**: 
  - ✅ `src/components/header/style.module.css`
  - ✅ `src/pages/login/style.module.css`
  - ❌ `style.css` (không sử dụng CSS Module)

### 2. Quy tắc đặt tên thư mục
- **Tên thư mục phải viết thường**
- **Khi có từ 2 chữ trở lên phải sử dụng dấu gạch ngang (-)**
- **Ví dụ**:
  - ✅ `product-detail`
  - ✅ `user-profile`
  - ✅ `checkout-page`
  - ✅ `product-list`
  - ❌ `productDetail` (camelCase)
  - ❌ `product_detail` (snake_case)

### 3. Cấu trúc thư mục chuẩn
```
src/
├── components/
│   ├── header/
│   │   ├── index.tsx
│   │   └── style.module.css
│   ├── footer/
│   │   ├── index.tsx
│   │   └── style.module.css
│   └── product-card/
│       ├── index.tsx
│       └── style.module.css
├── pages/
│   ├── home/
│   │   ├── index.tsx
│   │   └── style.module.css
│   └── product-detail/
│       ├── index.tsx
│       └── style.module.css
```

## 🎨 QUY TẮC CSS BEM (Block Element Modifier)

### 1. Cấu trúc BEM chuẩn
```css
/* Block */
.header { }

/* Element */
.header__logo { }
.header__search-input { }
.header__menu-item { }

/* Modifier */
.header__menu-item--active { }
.header__button--primary { }
.header__button--secondary { }
```

### 2. Quy tắc đặt tên class
- **Block**: Tên component chính (VD: `header`, `product-card`)
- **Element**: Sử dụng `__` để phân cách (VD: `header__logo`, `product-card__title`)
- **Modifier**: Sử dụng `--` để phân cách (VD: `header__button--primary`)

### 3. Ví dụ thực tế
```css
/* Header Component */
.header { }
.header__topbar { }
.header__middle { }
.header__menu { }
.header__logo { }
.header__search-input { }
.header__search-button { }
.header__action-icon { }
.header__menu-item { }
.header__menu-item--active { }
.header__submenu { }
.header__submenu-column { }
```

## 🎨 BẢNG MÀU CHỦ ĐẠO

### 1. Màu chính (Primary Colors)
```css
:root {
  /* Màu cam chủ đạo */
  --primary-color: #ff6347;        /* Tomato - Màu chính */
  --primary-hover: #e55a40;        /* Hover state */
  --primary-light: #ffcc80;        /* Màu cam nhạt */
  
  /* Màu đỏ accent */
  --accent-red: #ff4d4d;           /* Màu đỏ accent */
  --accent-red-light: #ffe8d4;     /* Màu đỏ nhạt */
}
```

### 2. Màu nền (Background Colors)
```css
:root {
  /* Nền chính */
  --bg-primary: #ffffff;           /* Nền trắng */
  --bg-secondary: #f9f9f9;        /* Nền xám nhạt */
  --bg-tertiary: #faf4f1;         /* Nền kem nhạt */
  
  /* Nền gradient */
  --bg-gradient-topbar: url("/header/background-topbar.webp");
}
```

### 3. Màu văn bản (Text Colors)
```css
:root {
  --text-primary: #333333;         /* Văn bản chính */
  --text-secondary: #666666;       /* Văn bản phụ */
  --text-white: #ffffff;           /* Văn bản trắng */
  --text-muted: #999999;           /* Văn bản mờ */
}
```

### 4. Màu border và shadow
```css
:root {
  --border-light: #e5e5e5;         /* Border nhạt */
  --border-medium: #eaeaea;        /* Border trung bình */
  --shadow-light: rgba(0, 0, 0, 0.05);
  --shadow-medium: rgba(0, 0, 0, 0.1);
}
```

## 📐 QUY TẮC RESPONSIVE DESIGN

### 1. Breakpoints chuẩn
```css
/* Mobile First Approach */
@media (min-width: 576px) { }   /* Small devices */
@media (min-width: 768px) { }   /* Medium devices */
@media (min-width: 992px) { }   /* Large devices */
@media (min-width: 1200px) { }  /* Extra large devices */
```

### 2. Container width
```css
.container {
  width: 100%;
  max-width: 80%;              /* Desktop */
  margin: 0 auto;
}

@media (max-width: 768px) {
  .container {
    max-width: 95%;            /* Mobile */
  }
}
```

## 🔧 QUY TẮC COMPONENT

### 1. Cấu trúc component chuẩn
```tsx
// Component structure
import React from 'react';
import styles from './style.module.css';

interface ComponentProps {
  // Props interface
}

const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  return (
    <div className={styles.component}>
      <div className={styles.component__element}>
        {/* Content */}
      </div>
    </div>
  );
};

export default ComponentName;
```

### 2. Import CSS Module
```tsx
// ✅ Đúng
import styles from './style.module.css';
<div className={styles.header}>

// ❌ Sai
import './style.css';
<div className="header">
```

## 📱 QUY TẮC UI/UX

### 1. Spacing system
```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;
}
```

### 2. Border radius
```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 999px;
}
```

### 3. Transition effects
```css
:root {
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}
```

## 🚀 QUY TẮC PERFORMANCE

### 1. Image optimization
- Sử dụng format WebP cho hình ảnh
- Lazy loading cho hình ảnh
- Responsive images với srcset

### 2. CSS optimization
- Sử dụng CSS Module để tránh conflict
- Minimize CSS bundle size
- Sử dụng CSS variables cho consistency

## 📝 QUY TẮC COMMIT MESSAGE

### 1. Format chuẩn
```
type(scope): description

feat(header): add responsive navigation menu
fix(product-card): resolve image loading issue
style(home): update color scheme to match brand
refactor(auth): simplify login component structure
```

### 2. Types
- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `style`: Thay đổi CSS/styling
- `refactor`: Refactor code
- `docs`: Cập nhật documentation
- `test`: Thêm/sửa test

## 🔍 QUY TẮC CODE REVIEW

### 1. Checklist
- [ ] Tuân thủ quy tắc đặt tên file và thư mục
- [ ] CSS sử dụng BEM methodology
- [ ] Sử dụng CSS Module
- [ ] Màu sắc tuân thủ brand guidelines
- [ ] Responsive design đúng breakpoints
- [ ] Performance optimization

### 2. Code quality
- Code readable và maintainable
- Không có unused CSS
- Proper TypeScript types
- Error handling đầy đủ

---

**Lưu ý**: Tất cả developers phải tuân thủ nghiêm ngặt các quy tắc này để đảm bảo tính nhất quán và chất lượng của dự án.