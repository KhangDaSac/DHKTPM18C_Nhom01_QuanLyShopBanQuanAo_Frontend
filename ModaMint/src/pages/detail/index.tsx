import React, { useState } from 'react';
import { Heart, Share2, ChevronLeft, ChevronRight, Zap, Award, Package, Clock, Star } from 'lucide-react';
import ProductTabs from '@/components/detail/DetailInforTab';

// Import file CSS Module
import styles from './styles.module.css';

// Interfaces
interface ProductColor {
  id: string;
  name: string;
  code: string;
  image: string;
}

interface ProductVariant {
  id: string;
  colorId: string;
  size: string;
  stock: number;
  price: number;
  sku: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  status: string;
  images: string[];
  description: string;
  currentPrice: number;
  originalPrice: number;
  discount: number;
  colors: ProductColor[];
  sizes: string[];
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  soldCount: number;
  inCartCount: number;
  viewingCount: number;
}

interface RelatedProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  sizes: string[];
  colors: string[];
}

// Mock Data
const mockProduct: Product = {
  id: 'ND008',
  name: 'Áo polo nam phối màu ND008',
  brand: 'Canifa',
  status: 'Còn hàng',
  images: [
    'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&h=600&fit=crop',
    'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=500&h=600&fit=crop',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=600&fit=crop',
    'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=500&h=600&fit=crop',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&h=600&fit=crop'
  ],
  description: 'Áo t-shirt cổ bẻ, họa tiết cài cúc chi tiết cổ áo phối 2 màu mang đến sự kết hợp hoàn hảo giữa phong cách thể thao và sự thanh lịch. Thiết kế tỉ mỉ, hiện đại, dễ dàng phối hợp với nhiều loại trang phục khác nhau như quần jean, chinos hay short. Chất liệu vải mềm mại, thoáng khí tạo cảm giác thoải mái suốt ngày dài. Đây là lựa chọn lý tưởng cho các dịp dạo phố, đi làm hay gặp gỡ bạn bè, giúp bạn luôn tự tin và năng động.',
  currentPrice: 450000,
  originalPrice: 680000,
  discount: 34,
  colors: [
    { id: 'c1', name: 'Be Xám', code: '#E8DDD0', image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=100&h=100&fit=crop' },
    { id: 'c2', name: 'Đen', code: '#2C2C2C', image: 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=100&h=100&fit=crop' },
    { id: 'c3', name: 'Đỏ', code: '#E74C3C', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=100&h=100&fit=crop' }
  ],
  sizes: ['S', 'M', 'L', 'XL'],
  variants: [
    { id: 'v1', colorId: 'c1', size: 'S', stock: 10, price: 450000, sku: 'ND00801' },
    { id: 'v2', colorId: 'c1', size: 'M', stock: 15, price: 450000, sku: 'ND00802' },
    { id: 'v3', colorId: 'c1', size: 'L', stock: 8, price: 450000, sku: 'ND00803' },
    { id: 'v4', colorId: 'c1', size: 'XL', stock: 5, price: 450000, sku: 'ND00804' },
    { id: 'v5', colorId: 'c2', size: 'S', stock: 12, price: 450000, sku: 'ND00805' },
    { id: 'v6', colorId: 'c2', size: 'M', stock: 20, price: 450000, sku: 'ND00806' },
    { id: 'v7', colorId: 'c2', size: 'L', stock: 10, price: 450000, sku: 'ND00807' },
    { id: 'v8', colorId: 'c2', size: 'XL', stock: 7, price: 450000, sku: 'ND00808' },
    { id: 'v9', colorId: 'c3', size: 'S', stock: 8, price: 450000, sku: 'ND00809' },
    { id: 'v10', colorId: 'c3', size: 'M', stock: 18, price: 450000, sku: 'ND00810' },
    { id: 'v11', colorId: 'c3', size: 'L', stock: 12, price: 450000, sku: 'ND00811' },
    { id: 'v12', colorId: 'c3', size: 'XL', stock: 6, price: 450000, sku: 'ND00812' },
  ],
  rating: 4.5,
  reviewCount: 128,
  soldCount: 234,
  inCartCount: 5,
  viewingCount: 10
};

const relatedProducts: RelatedProduct[] = [
  {
    id: 'P001',
    name: 'Bạn đang xem: Áo polo nam phối màu ND008',
    image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300&h=300&fit=crop',
    price: 450000,
    originalPrice: 680000,
    sizes: ['S', 'M', 'L'],
    colors: ['Be Xám', 'Đen']
  },
  {
    id: 'P002',
    name: 'Quần Jeans Nam Slim Denim Like Có Bản',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop',
    price: 680000,
    originalPrice: 890000,
    sizes: ['28', '29', '30'],
    colors: ['Tím than']
  },
  {
    id: 'P003',
    name: 'Thắt Lưng Nam Khóa Cài Kim Loại Viền Vuông',
    image: 'https://images.unsplash.com/photo-1624222247344-424b8c6e8f8f?w=300&h=300&fit=crop',
    price: 368000,
    originalPrice: 450000,
    sizes: ['Đen'],
    colors: ['Đen']
  },
];

// Sub-Components
const ProductCard: React.FC<{ product: RelatedProduct; isSelected?: boolean }> = ({ product, isSelected }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);

  return (
    <div className={styles.product_card}>
      {isSelected && (
        <div className={styles.product_card_selected_badge}>✓</div>
      )}
      <img
        src={product.image}
        alt={product.name}
        className={styles.product_card_image}
      />
      <div className={styles.product_card_content}>
        <p className={styles.product_card_name}>
          {product.name}
        </p>
        <select
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          className={styles.product_card_select}
        >
          {product.sizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <div className={styles.product_card_price_wrapper}>
          <span className={styles.product_card_current_price}>
            {product.price.toLocaleString('vi-VN')}₫
          </span>
          <span className={styles.product_card_original_price}>
            {product.originalPrice.toLocaleString('vi-VN')}₫
          </span>
        </div>
      </div>
    </div>
  );
};

const SizeChart: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div
      onClick={onClose}
      className={styles.size_chart_modal_overlay}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={styles.size_chart_modal_content}
      >
        <h3 className={styles.size_chart_modal_title}>Bảng kích thước</h3>
        <table className={styles.size_chart_modal_table}>
          <thead>
            <tr>
              <th className={styles.size_chart_modal_table_header}>Size</th>
              <th className={styles.size_chart_modal_table_header}>Ngực (cm)</th>
              <th className={styles.size_chart_modal_table_header}>Dài áo (cm)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.size_chart_modal_table_cell}>S</td>
              <td className={styles.size_chart_modal_table_cell}>94</td>
              <td className={styles.size_chart_modal_table_cell}>68</td>
            </tr>
            <tr>
              <td className={styles.size_chart_modal_table_cell}>M</td>
              <td className={styles.size_chart_modal_table_cell}>98</td>
              <td className={styles.size_chart_modal_table_cell}>70</td>
            </tr>
            <tr>
              <td className={styles.size_chart_modal_table_cell}>L</td>
              <td className={styles.size_chart_modal_table_cell}>102</td>
              <td className={styles.size_chart_modal_table_cell}>72</td>
            </tr>
            <tr>
              <td className={styles.size_chart_modal_table_cell}>XL</td>
              <td className={styles.size_chart_modal_table_cell}>106</td>
              <td className={styles.size_chart_modal_table_cell}>74</td>
            </tr>
          </tbody>
        </table>
        <button
          onClick={onClose}
          className={styles.size_chart_modal_close_button}
        >
          ĐÓNG
        </button>
      </div>
    </div>
  );
};

// Main Component
const ProductDetailPage: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set(['P001']));

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? mockProduct.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === mockProduct.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const toggleProductSelection = (id: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      if (newSelected.size > 1) {
        newSelected.delete(id);
      }
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  const calculateTotal = () => {
    return relatedProducts
      .filter(p => selectedProducts.has(p.id))
      .reduce((sum, p) => sum + p.price, 0);
  };

  const getCurrentSKU = () => {
    const variant = mockProduct.variants.find(
      v => v.colorId === mockProduct.colors[selectedColor].id && v.size === selectedSize
    );
    return variant?.sku || 'N/A';
  };

  const getCurrentStock = () => {
    const variant = mockProduct.variants.find(
      v => v.colorId === mockProduct.colors[selectedColor].id && v.size === selectedSize
    );
    return variant?.stock || 0;
  };

  return (
    <div className={styles.product_detail_page}>
      {/* Breadcrumb */}
      <div className={styles.product_detail_page_breadcrumb}>
        <span className={styles.product_detail_page_breadcrumb_link}>Trang chủ</span>
        <span className={styles.product_detail_page_breadcrumb_separator}>›</span>
        <span className={styles.product_detail_page_breadcrumb_link}>Sản phẩm nổi bật</span>
        <span className={styles.product_detail_page_breadcrumb_separator}>›</span>
        <span className={styles.product_detail_page_breadcrumb_active}>{mockProduct.name}</span>
      </div>

      {/* Main Content */}
      <div className={styles.product_detail_page_main_content}>
        {/* Left: Images */}
        <div className={styles.product_images_wrapper}>
          <div className={styles.product_images_container}>
            {/* Thumbnail List */}
            <div className={styles.product_images_thumbnail_list}>
              {mockProduct.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumb ${idx + 1}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`${styles.product_images_thumbnail} ${currentImageIndex === idx ? styles.product_images_thumbnail_active : ''}`}
                />
              ))}
            </div>

            {/* Main Image */}
            <div className={styles.product_images_main_wrapper}>
              <img
                src={mockProduct.images[currentImageIndex]}
                alt={mockProduct.name}
                className={styles.product_images_main_image}
              />

              {/* Navigation Arrows */}
              <button
                onClick={handlePrevImage}
                className={`${styles.product_images_nav_button} ${styles.product_images_nav_button_prev}`}
              >
                <ChevronLeft size={24} color="#333" />
              </button>
              <button
                onClick={handleNextImage}
                className={`${styles.product_images_nav_button} ${styles.product_images_nav_button_next}`}
              >
                <ChevronRight size={24} color="#333" />
              </button>
            </div>
          </div>

          {/* Share */}
          <div className={styles.product_images_share}>
            <span className={styles.product_images_share_text}>Chia sẻ</span>
            <button className={`${styles.product_images_share_button} ${styles.product_images_share_button_facebook}`}>f</button>
            <button className={`${styles.product_images_share_button} ${styles.product_images_share_button_twitter}`}>t</button>
            <button className={`${styles.product_images_share_button} ${styles.product_images_share_button_generic}`}>
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className={styles.product_info_wrapper}>
          <h1 className={styles.product_info_title}>{mockProduct.name}</h1>

          {/* Price & Status */}
          <div className={styles.product_info_header}>
            <div className={styles.product_info_price_group}>
              <span className={styles.product_info_current_price}>
                {mockProduct.currentPrice.toLocaleString('vi-VN')}₫
              </span>
              <span className={styles.product_info_original_price}>
                {mockProduct.originalPrice.toLocaleString('vi-VN')}₫
              </span>
            </div>
            <div className={styles.product_info_status}>
              {mockProduct.status}
            </div>
          </div>

          {/* Meta Info */}
          <div className={styles.product_info_meta}>
            <div>
              <span className={styles.product_info_meta_label}>Mã Sku: </span>
              <span className={styles.product_info_meta_value}>{getCurrentSKU()}</span>
            </div>
            <div>
              <span className={styles.product_info_meta_label}>Thương hiệu: </span>
              <span className={styles.product_info_meta_value}>{mockProduct.brand}</span>
            </div>
          </div>

          {/* Description */}
          <p className={styles.product_info_description}>
            {mockProduct.description}
          </p>

          {/* Color Selection */}
          <div className={styles.product_info_section}>
            <div className={styles.product_info_section_header}>
              Màu sắc: <span className={styles.product_info_selected_value}>{mockProduct.colors[selectedColor].name}</span>
            </div>
            <div className={styles.product_info_option_list}>
              {mockProduct.colors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedColor(idx);
                    setCurrentImageIndex(idx);
                  }}
                  className={`${styles.product_info_color_swatch} ${selectedColor === idx ? styles.product_info_color_swatch_active : ''}`}
                  style={{ backgroundColor: color.code }}
                />
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className={styles.product_info_section}>
            <div className={styles.product_info_section_header}>
              Kích cỡ: <span className={styles.product_info_selected_value}>{selectedSize}</span>
            </div>
            <div className={styles.product_info_option_list}>
              {mockProduct.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`${styles.product_info_size_button} ${selectedSize === size ? styles.product_info_size_button_active : ''}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className={styles.product_info_section}>
            <div className={styles.product_info_section_header}>Số lượng:</div>
            <div className={styles.product_info_quantity_wrapper}>
              <div className={styles.product_info_quantity_input_group}>
                <button
                  onClick={() => handleQuantityChange('decrease')}
                  className={styles.product_info_quantity_button}
                >−</button>
                <input
                  type="text"
                  value={quantity}
                  readOnly
                  className={styles.product_info_quantity_input}
                />
                <button
                  onClick={() => handleQuantityChange('increase')}
                  className={styles.product_info_quantity_button}
                >+</button>
              </div>
              <button
                onClick={() => setShowSizeModal(true)}
                className={styles.product_info_size_chart_button}
              >
                📏 Bảng kích thước
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.product_info_action_buttons}>
            <button className={`${styles.product_info_button} ${styles.product_info_button_primary_dark}`}>
              THÊM VÀO GIỎ
            </button>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`${styles.product_info_button} ${styles.product_info_button_icon}`}
            >
              <Heart
                size={24}
                fill={isFavorite ? '#FF6347' : 'none'}
                color={isFavorite ? '#FF6347' : '#666'}
              />
            </button>
            <button className={`${styles.product_info_button} ${styles.product_info_button_icon}`}>
              <Share2 size={20} color="#666" />
            </button>
          </div>

          <button className={`${styles.product_info_button} ${styles.product_info_button_primary_cta}`}>
            MUA NGAY
          </button>

          {/* Info Alert */}
          <div className={styles.product_info_alert}>
            <Zap size={16} color="#FF6347" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span className={styles.product_info_alert_text}>Sản phẩm hiện có {mockProduct.inCartCount} người thêm vào giỏ hàng.</span>
              <span className={`${styles.product_info_alert_text} ${styles.product_info_alert_text_highlight}`}>{mockProduct.viewingCount} người đang xem.</span>
            </div>
          </div>

          {/* Features */}
          <div className={styles.product_info_features_list}>
            <div className={styles.product_info_feature_item}>
              <Award size={20} color="#FF6347" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Giao hàng toàn quốc:</strong> Thanh toán (COD) khi nhận hàng</span>
            </div>
            <div className={styles.product_info_feature_item}>
              <Package size={20} color="#FF6347" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Miễn phí giao hàng:</strong> Theo chính sách</span>
            </div>
            <div className={styles.product_info_feature_item}>
              <Clock size={20} color="#FF6347" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Đổi trả trong 7 ngày:</strong> Kể từ ngày mua hàng</span>
            </div>
            <div className={styles.product_info_feature_item}>
              <Clock size={20} color="#FF6347" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Hỗ trợ 24/7:</strong> Theo chính sách</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className={styles.related_products_wrapper}>
        <h2 className={styles.related_products_title}>Thường được mua cùng</h2>

        <div className={styles.related_products_grid}>
          {relatedProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => toggleProductSelection(product.id)}
              className={styles.related_products_item_wrapper}
            >
              <ProductCard
                product={product}
                isSelected={selectedProducts.has(product.id)}
              />
            </div>
          ))}
        </div>

        <div className={styles.related_products_footer}>
          <div className={styles.related_products_total_info}>
            <span className={styles.related_products_total_label}>Tổng cộng: </span>
            <span className={styles.related_products_total_price}>
              {calculateTotal().toLocaleString('vi-VN')}₫
            </span>
          </div>
          <button className={styles.related_products_combo_button}>
            ĐẶT COMBO NGAY
          </button>
        </div>
      </div>
      
      <ProductTabs />

      {/* Size Modal */}
      {showSizeModal && <SizeChart onClose={() => setShowSizeModal(false)} />}
    </div>
  );
};

export default ProductDetailPage;