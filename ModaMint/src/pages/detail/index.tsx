
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Share2, Zap, Award, Package, Clock, X } from 'lucide-react';
import ProductTabs from '@/components/detail/DetailInforTab';

// Import file CSS Module

import styles from './styles.module.css';
import type { ProductResponse } from '@/services/product';
import type { ProductVariant } from '@/services/productVariant';
import { productService } from '@/services/product';
import { productVariantService } from '@/services/productVariant';
import { cartService } from '@/services/cart';
import { useFavorites } from '@/contexts/favoritesContext';
import { useAuth } from '@/contexts/authContext';
import { useCart } from '@/hooks/useCart';
import { toast } from 'react-toastify';

// Lightbox Component (Đã refactor)
const ImageLightbox: React.FC<{
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}> = ({ images, currentIndex, onClose, onNavigate }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate('prev');
      if (e.key === 'ArrowRight') onNavigate('next');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate]);

  return (
    <div onClick={onClose} className={styles.lightbox_overlay}>
      <button onClick={onClose} className={styles.lightbox_close_button}>
        <X size={24} color="#fff" />
      </button>

      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('prev');
          }}
          className={`${styles.lightbox_nav_button} ${styles.lightbox_nav_button_prev}`}
        >
          <ChevronLeft size={30} color="#fff" />
        </button>
      )}

      <img
        src={images[currentIndex]}
        alt={`Full view ${currentIndex + 1}`}
        onClick={(e) => e.stopPropagation()}
        className={styles.lightbox_image}
      />

      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('next');
          }}
          className={`${styles.lightbox_nav_button} ${styles.lightbox_nav_button_next}`}
        >
          <ChevronRight size={30} color="#fff" />
        </button>
      )}

      <div className={styles.lightbox_counter}>
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

const SizeChart: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div onClick={onClose} className={styles.size_chart_modal_overlay}>
      <div onClick={(e) => e.stopPropagation()} className={styles.size_chart_modal_content}>
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
        <button onClick={onClose} className={styles.size_chart_modal_close_button}>
          ĐÓNG
        </button>
      </div>
    </div>
  );
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  const { user } = useAuth();
  const favorites = useFavorites();
  const { setCartFromBackend } = useCart();

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [added, setAdded] = useState(false);

  const uniqueColors = Array.from(new Set(variants.map((v) => v.color)));
  const uniqueSizes = Array.from(new Set(variants.map((v) => v.size)));

  // Lấy số lượng tồn kho theo color + size
  const getVariantStock = (color: string, size: string): number => {
    const variant = variants.find((v) => v.color === color && v.size === size);
    return variant?.quantity || 0;
  };

  const currentStock =
    selectedColor && selectedSize ? getVariantStock(selectedColor, selectedSize) : 0;

  const isOutOfStock = currentStock <= 0 || !selectedColor || !selectedSize;

  // Lấy variant hiện tại
  const currentVariant = variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const currentPrice = currentVariant
    ? currentVariant.price - currentVariant.discount
    : 0;

  const originalPrice = currentVariant?.price || 0;
  const currentSKU = currentVariant?.id.toString() || 'N/A';

  // Lọc ảnh theo màu
  const getImagesForColor = (color: string): string[] => {
    const colorVariantImages = variants
      .filter((v) => v.color === color && v.image)
      .map((v) => v.image as string);

    if (colorVariantImages.length > 0) {
      const combined = [...colorVariantImages, ...(product?.images || [])];
      return combined.filter((img, i, self) => self.indexOf(img) === i);
    }
    return product?.images || [];
  };

  const displayImages = selectedColor ? getImagesForColor(selectedColor) : product?.images || [];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const productRes = await productService.getProductById(productId);
      if (productRes.success && productRes.data) {
        setProduct(productRes.data);

        const variantsRes = await productVariantService.getProductVariantsByProductId(productId);
        if (variantsRes.success && variantsRes.data) {
          setVariants(variantsRes.data);

          if (variantsRes.data.length > 0) {
            const defaultColor = variantsRes.data[0].color;
            const defaultSize = variantsRes.data[0].size;
            setSelectedColor(defaultColor);
            setSelectedSize(defaultSize);
          }
        } else {
          setError(variantsRes.message || 'Lỗi lấy variants');
        }
      } else {
        setError(productRes.message || 'Lỗi lấy product');
      }

      setLoading(false);
    };

    fetchData();
  }, [productId]);

  // Reset quantity khi đổi variant
  useEffect(() => {
    setQuantity(1);
  }, [selectedColor, selectedSize]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setCurrentImageIndex(0);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const handleLightboxNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
    } else {
      setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
    }
  };

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (isOutOfStock) return;

    if (type === 'increase' && quantity < currentStock) {
      setQuantity((prev) => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    if (!currentVariant) return;
    setAddingToCart(true);
    try {
      if (user) {
        // Authenticated user
        const res = await cartService.addItem({ variantId: currentVariant.id, quantity });
        if (res && res.success) {
          setAdded(true);
          toast.success('Đã thêm sản phẩm vào giỏ hàng!');
          setTimeout(() => setAdded(false), 1800);
        } else {
          console.error('Add to cart failed', res?.message);
          toast.error(res?.message || 'Không thể thêm sản phẩm vào giỏ hàng');
        }
      } else {
        // Guest user
        const itemPrice = currentVariant.price || 0;
        console.log('🛒 Adding to guest cart - Variant price:', itemPrice, 'Variant:', currentVariant);
        
        cartService.addItemToGuestCart({
          variantId: currentVariant.id,
          productId: product?.id,
          productName: product?.name,
          image: currentVariant.image || product?.images?.[0],
          imageUrl: currentVariant.image || product?.images?.[0],
          unitPrice: itemPrice,
          price: itemPrice,
          quantity: quantity,
          color: currentVariant.color,
          size: currentVariant.size
        });
        
        // Sync guest cart to CartContext
        const updatedGuestCart = cartService.getGuestCart();
        console.log('🔄 Syncing guest cart to context:', updatedGuestCart);
        setCartFromBackend(updatedGuestCart);
        
        setAdded(true);
        toast.success('Đã thêm sản phẩm vào giỏ hàng!');
        setTimeout(() => setAdded(false), 1800);
      }
    } catch (e) {
      console.error('Add to cart error', e);
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    if (!currentVariant) return;
    setAddingToCart(true);
    try {
      if (user) {
        // Authenticated user
        const res = await cartService.addItem({ variantId: currentVariant.id, quantity });
        if (res && res.success) {
          toast.success('Đã thêm vào giỏ hàng, chuyển đến thanh toán...');
          navigate('/checkoutpage');
        } else {
          console.error('Buy now failed', res?.message);
          toast.error(res?.message || 'Không thể thêm sản phẩm vào giỏ hàng');
        }
      } else {
        // Guest user
        const itemPrice = currentVariant.price || 0;
        console.log('🛒 Buy Now - Adding to guest cart - Variant price:', itemPrice);
        
        cartService.addItemToGuestCart({
          variantId: currentVariant.id,
          productId: product?.id,
          productName: product?.name,
          image: currentVariant.image || product?.images?.[0],
          imageUrl: currentVariant.image || product?.images?.[0],
          unitPrice: itemPrice,
          price: itemPrice,
          quantity: quantity,
          color: currentVariant.color,
          size: currentVariant.size
        });
        
        // Sync guest cart to CartContext
        const updatedGuestCart = cartService.getGuestCart();
        setCartFromBackend(updatedGuestCart);
        
        toast.success('Đã thêm vào giỏ hàng, chuyển đến thanh toán...');
        navigate('/checkoutpage');
      }
    } catch (e) {
      console.error('Buy now error', e);
      toast.error('Có lỗi xảy ra');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleFavorite = async () => {
    if (!product) return;
    try {
      if (!isFavorite) {
        const ok = await favorites.addToFavorites(product.id);
        if (ok) {
          setIsFavorite(true);
          toast.success('Đã thêm vào yêu thích');
        } else {
          toast.error('Không thể thêm vào yêu thích');
        }
      } else {
        const ok = await favorites.removeFromFavorites(product.id);
        if (ok) {
          setIsFavorite(false);
          toast.success('Đã xóa khỏi yêu thích');
        } else {
          toast.error('Không thể xóa khỏi yêu thích');
        }
      }
    } catch (e: unknown) {
      console.error('Favorite error', e);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại');
    }
  };

  // Initialize favorite state from context when product or favorites change
  useEffect(() => {
    if (!product) return;
    try {
      setIsFavorite(favorites.isFavorite(product.id));
    } catch {
      // ignore
    }
  }, [product, favorites]);

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error || !product)
    return <div className={styles.error}>{error || 'Không tìm thấy sản phẩm'}</div>;

  return (
    <div className={styles.product_detail_page}>
      <div className={styles.product_detail_page_breadcrumb}>
        <span className={styles.product_detail_page_breadcrumb_link}><Link to={'/'}>Trang chủ</Link></span>
        <span className={styles.product_detail_page_breadcrumb_separator}>›</span>
        <span className={styles.product_detail_page_breadcrumb_link}><Link to={'/products'}>Sản phẩm nổi bật</Link></span>
        <span className={styles.product_detail_page_breadcrumb_separator}>›</span>
        <span className={styles.product_detail_page_breadcrumb_active}>{product.name}</span>
      </div>

      <div className={styles.product_detail_page_main_content}>
        <div className={styles.product_images_wrapper}>
          <div className={styles.product_images_container}>
            <div className={styles.product_images_thumbnail_list}>
              {displayImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumb ${idx + 1}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`${styles.product_images_thumbnail} ${
                    currentImageIndex === idx ? styles.product_images_thumbnail_active : ''
                  }`}
                />
              ))}
            </div>

            <div className={styles.product_images_main_wrapper}>
              <img
                src={displayImages[currentImageIndex]}
                alt={product.name}
                className={styles.product_images_main_image}
                onClick={() => setShowLightbox(true)}
              />

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

          <div className={styles.product_images_share}>
            <span className={styles.product_images_share_text}>Chia sẻ</span>
            <button
              className={`${styles.product_images_share_button} ${styles.product_images_share_button_facebook}`}
            >
              f
            </button>
            <button
              className={`${styles.product_images_share_button} ${styles.product_images_share_button_twitter}`}
            >
              t
            </button>
            <button
              className={`${styles.product_images_share_button} ${styles.product_images_share_button_generic}`}
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        <div className={styles.product_info_wrapper}>
          <h1 className={styles.product_info_title}>{product.name}</h1>

          <div className={styles.product_info_header}>
            <div className={styles.product_info_price_group}>
              <span className={styles.product_info_current_price}>
                {currentPrice.toLocaleString('vi-VN')}₫
              </span>
              {(currentVariant?.discount ?? 0) > 0 && (
                <span className={styles.product_info_original_price}>
                  {originalPrice.toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>
            <div
              className={styles.product_info_status}
              style={{ color: currentStock > 0 ? 'white' : 'black' }}
            >
              {currentStock > 0 ? 'Còn hàng' : 'Hết hàng'}
            </div>
          </div>

          <div className={styles.product_info_meta}>
            <div>
              <span className={styles.product_info_meta_label}>Mã SKU: </span>
              <span className={styles.product_info_meta_value}>{currentSKU}</span>
            </div>
            <div>
              <span className={styles.product_info_meta_label}>Thương hiệu: </span>
              <span className={styles.product_info_meta_value}>{product.brandName}</span>
            </div>
          </div>

          <p className={styles.product_info_description}>{product.description}</p>

          {/* Hiển thị số lượng tồn kho */}
          <div className={styles.product_info_section}>
            <div className={styles.product_info_section_header}>
              Tồn kho:
              <span
                style={{
                  color: currentStock > 0 ? '#28a745' : '#dc3545',
                  marginLeft: '8px',
                  fontWeight: 'bold',
                }}
              >
                {currentStock > 0 ? currentStock : 'Hết hàng'}
              </span>
            </div>
          </div>

          <div className={styles.product_info_section}>
            <div className={styles.product_info_section_header}>
              Màu sắc:{' '}
              <span className={styles.product_info_selected_value}>
                {selectedColor || 'Chọn màu'}
              </span>
            </div>
            <div className={styles.product_info_option_list}>
              {uniqueColors.map((color) => {
                const hasStock = uniqueSizes.some((size) => getVariantStock(color, size) > 0);
                return (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    disabled={!hasStock}
                    className={`${styles.product_info_size_button} ${
                      selectedColor === color ? styles.product_info_size_button_active : ''
                    }`}
                    style={{
                      opacity: !hasStock ? 0.4 : 1,
                      cursor: !hasStock ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {color}
                    {!hasStock && <span className={styles.out_of_stock_label}>Hết</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.product_info_section}>
            <div className={styles.product_info_section_header}>
              Kích cỡ:{' '}
              <span className={styles.product_info_selected_value}>
                {selectedSize || 'Chọn size'}
              </span>
            </div>
            <div className={styles.product_info_option_list}>
              {uniqueSizes.map((size) => {
                const stock = selectedColor ? getVariantStock(selectedColor, size) : 0;
                const isDisabled = stock <= 0;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={isDisabled}
                    className={`${styles.product_info_size_button} ${
                      selectedSize === size ? styles.product_info_size_button_active : ''
                    }`}
                    style={{
                      opacity: isDisabled ? 0.4 : 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {size}
                    {isDisabled && <span className={styles.out_of_stock_label}>Hết</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.product_info_section}>
            <div className={styles.product_info_section_header}>Số lượng:</div>
            <div className={styles.product_info_quantity_wrapper}>
              <div className={styles.product_info_quantity_input_group}>
                <button
                  onClick={() => handleQuantityChange('decrease')}
                  disabled={quantity <= 1 || isOutOfStock}
                  className={styles.product_info_quantity_button}
                  style={{ opacity: quantity <= 1 || isOutOfStock ? 0.5 : 1 }}
                >
                  −
                </button>
                <input
                  type="text"
                  value={quantity}
                  readOnly
                  className={styles.product_info_quantity_input}
                />
                <button
                  onClick={() => handleQuantityChange('increase')}
                  disabled={quantity >= currentStock || isOutOfStock}
                  className={styles.product_info_quantity_button}
                  style={{ opacity: quantity >= currentStock || isOutOfStock ? 0.5 : 1 }}
                >
                  +
                </button>
              </div>
              <button
                onClick={() => setShowSizeModal(true)}
                className={styles.product_info_size_chart_button}
              >
                Bảng kích thước
              </button>
            </div>
          </div>

          <div className={styles.product_info_action_buttons}>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className={`${styles.product_info_button} ${styles.product_info_button_primary_dark}`}
              style={{
                opacity: isOutOfStock ? 0.5 : 1,
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              }}
            >
              {isOutOfStock ? 'HẾT HÀNG' : addingToCart ? 'ĐANG THÊM...' : added ? 'ĐÃ THÊM' : 'THÊM VÀO GIỎ'}
            </button>
            <button
              onClick={handleFavorite}
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

          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className={`${styles.product_info_button} ${styles.product_info_button_primary_cta}`}
            style={{
              opacity: isOutOfStock ? 0.5 : 1,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            }}
          >
            {isOutOfStock ? 'HẾT HÀNG' : 'MUA NGAY'}
          </button>

          <div className={styles.product_info_alert}>
            <Zap size={16} color="#FF6347" className={styles.icon_prefix} />
            <div>
              <span className={styles.product_info_alert_text}>
                Sản phẩm hiện có {product.quantity || 0} người thêm vào giỏ hàng.
              </span>
              <span
                className={`${styles.product_info_alert_text} ${styles.product_info_alert_text_highlight}`}
              >
                0 người đang xem.
              </span>
            </div>
          </div>

          <div className={styles.product_info_features_list}>
            <div className={styles.product_info_feature_item}>
              <Award size={20} color="#FF6347" className={styles.icon_prefix} />
              <span>
                <strong>Giao hàng toàn quốc:</strong> Thanh toán (COD) khi nhận hàng
              </span>
            </div>
            <div className={styles.product_info_feature_item}>
              <Package size={20} color="#FF6347" className={styles.icon_prefix} />
              <span>
                <strong>Miễn phí giao hàng:</strong> Theo chính sách
              </span>
            </div>
            <div className={styles.product_info_feature_item}>
              <Clock size={20} color="#FF6347" className={styles.icon_prefix} />
              <span>
                <strong>Đổi trả trong 7 ngày:</strong> Kể từ ngày mua hàng
              </span>
            </div>
            <div className={styles.product_info_feature_item}>
              <Clock size={20} color="#FF6347" className={styles.icon_prefix} />
              <span>
                <strong>Hỗ trợ 24/7:</strong> Theo chính sách
              </span>
            </div>
          </div>
        </div>
      </div>

      <ProductTabs productId={product.id}/>

      {showSizeModal && <SizeChart onClose={() => setShowSizeModal(false)} />}

      {showLightbox && (
        <ImageLightbox
          images={displayImages}
          currentIndex={currentImageIndex}
          onClose={() => setShowLightbox(false)}
          onNavigate={handleLightboxNavigate}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;