import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { Delete, Hand, Pen } from 'lucide-react';
import { reviewService, type ReviewResponse } from '@/services/review';
import { uploadImageToCloudinary } from '@/services/review/upImage';
import { customerService, type CustomerResponse } from '@/services/customer';

interface ProductReviewProps {
  productId: number;
  customerId?: string;
  orderItemId: number | null;
}

interface ReviewWithCustomer extends ReviewResponse {
  customerAvatar?: string;
  customerFullName?: string;
}

export const ProductReview: React.FC<ProductReviewProps> = ({ 
  productId, 
  customerId, 
  orderItemId 
}) => {
  const [reviews, setReviews] = useState<ReviewWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewWithCustomer | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  
  
  // Form state
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [formImages, setFormImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Form validation errors
  const [errors, setErrors] = useState<{
    rating?: string;
    comment?: string;
    images?: string;
  }>({});

  // Fetch reviews on component mount
  useEffect(() => {
    fetchReviews();
  }, [productId]);

// Thay thế toàn bộ hàm fetchReviews bằng đoạn này:
const fetchReviews = async () => {
  setLoading(true);
  try {
    const result = await reviewService.getReviewsByProductId(productId);
    if (!result.success || !result.data) {
      console.error('Failed to fetch reviews:', result.message);
      setReviews([]);
      return;
    }

    // Lấy thông tin customer cho từng review
    const reviewsWithCustomerInfo = await Promise.all(
      result.data.map(async (review) => {
        let customerAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.customerName || 'User')}&background=ff4d4d&color=fff`;
        let customerFullName = review.customerName || 'Khách hàng';

        try {
          const customerResult = await customerService.getCustomerById(review.customerId);
          
          if (customerResult.success && customerResult.data?.user) {
            const user = customerResult.data.user;
            customerFullName = `${user.firstName} ${user.lastName}`.trim() || 'Khách hàng';
            
            // Ưu tiên ảnh từ user.image, nếu không có thì dùng ui-avatars
            if (user.image) {
              customerAvatar = user.image;
            } else {
              customerAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&background=ff4d4d&color=fff`;
            }
          }
        } catch (error) {
          console.warn(`Không thể tải thông tin khách hàng ID: ${review.customerId}`, error);
          // Giữ fallback
        }

        return {
          ...review,
          customerAvatar,
          customerFullName,
        };
      })
    );

    setReviews(reviewsWithCustomerInfo);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    setReviews([]);
  } finally {
    setLoading(false);
  }
};
  const customerReview = reviews.find(r => r.customerId === customerId);
  const displayedReviews = showAll ? reviews : reviews.slice(0, 5);

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const handleOpenModal = (review?: ReviewWithCustomer) => {
    if (review) {
      setEditingReview(review);
      setFormRating(review.rating);
      setFormComment(review.comment || '');

      // Load ảnh cũ để hiển thị
      const oldImages = review.images || [];
      setExistingImageUrls(oldImages);
      setImagePreviewUrls(oldImages.map(img => img)); // Preview ảnh cũ

      setFormImages([]); // Chưa có ảnh mới
    } else {
      // Viết mới
      setEditingReview(null);
      setFormRating(5);
      setFormComment('');
      setExistingImageUrls([]);
      setImagePreviewUrls([]);
      setFormImages([]);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReview(null);
    setFormImages([]);
    setExistingImageUrls([]);
    // Dọn dẹp URL preview
    imagePreviewUrls.forEach(url => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
    setImagePreviewUrls([]);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formRating || formRating < 1 || formRating > 5) {
      newErrors.rating = 'Đánh giá tối thiểu là 1 và tối đa là 5';
    }

    if (!formComment || formComment.trim().length === 0) {
      newErrors.comment = 'Nhận xét không được để trống';
    }

    if (formImages.length > 5) {
      newErrors.images = 'Tối đa 5 ảnh';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitReview = async () => {
    if (!validateForm()) return;
    if (!customerId || !orderItemId) {
      alert('Thông tin không hợp lệ');
      return;
    }

    setSubmitting(true);
    setUploadingImages(formImages.length > 0);

    try {
      let finalImageUrls: string[] = [...existingImageUrls]; // Giữ ảnh cũ

      // Upload ảnh mới
      if (formImages.length > 0) {
        const uploadPromises = formImages.map(file => uploadImageToCloudinary(file));
        const newUrls = await Promise.all(uploadPromises);
        finalImageUrls.push(...newUrls);
      }

      const reviewData = {
        productId,
        customerId,
        orderItemId,
        rating: formRating,
        comment: formComment.trim(),
        images: finalImageUrls
      };

      let result;
      if (editingReview) {
        result = await reviewService.updateReview(editingReview.id, reviewData);
      } else {
        result = await reviewService.createReview(reviewData);
      }

      if (result.success) {
        alert(editingReview ? 'Cập nhật thành công!' : 'Gửi đánh giá thành công!');
        await fetchReviews();
        handleCloseModal();
      } else {
        alert(result.message || 'Thao tác thất bại');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
      setUploadingImages(false);
    }
  };
  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      return;
    }

    try {
      const result = await reviewService.deleteReview(reviewId);
      if (result.success) {
        alert('Xóa đánh giá thành công!');
        await fetchReviews();
      } else {
        alert(result.message || 'Xóa đánh giá thất bại');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Có lỗi xảy ra khi xóa đánh giá');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const totalImages = formImages.length + fileArray.length;
      
      if (totalImages > 5) {
        alert('Tối đa 5 ảnh');
        return;
      }

      // Create preview URLs
      const newPreviewUrls = fileArray.map(file => URL.createObjectURL(file));
      
      setFormImages([...formImages, ...fileArray]);
      setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    }
  };

  const handleRemoveImage = (index: number) => {
    // Revoke the preview URL to free memory
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setFormImages(formImages.filter((_, i) => i !== index));
    setImagePreviewUrls(imagePreviewUrls.filter((_, i) => i !== index));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} className={star <= rating ? styles.star_icon_filled : styles.star_icon}>
          ★
        </span>
      ))}
    </div>
  );

  // Show warning if not logged in
  if (!customerId) {
    return (
      <div className={styles.review_container}>
        <div className={styles.review_warning}>
          <p className={styles.review_warning__text}>
            Vui lòng đăng nhập để xem và viết đánh giá sản phẩm.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.review_container}>
        <div className={styles.review_loading}>Đang tải đánh giá...</div>
      </div>
    );
  }

  // Show reviews only if customer hasn't purchased
  if (!orderItemId) {
    return (
      <div className={styles.review_container}>
        <div className={styles.review_warning}>
          <p className={styles.review_warning__text}>
            Bạn chưa mua sản phẩm này. Vui lòng mua sản phẩm để có thể đánh giá.
          </p>
        </div>
        
        <div className={styles.review_header}>
          <h2 className={styles.review_header__title}>Đánh giá sản phẩm</h2>
          <div className={styles.review_header__stats}>
            <div className={styles.review_stats__average}>
              <span className={styles.review_stats__average_number}>{averageRating}</span>
              <StarRating rating={Math.round(parseFloat(averageRating))} size={20} />
            </div>
            <span className={styles.review_stats__total}>({reviews.length} đánh giá)</span>
          </div>
        </div>

        <div className={styles.review_list}>
          {reviews.length === 0 ? (
            <p className={styles.review_list__empty}>Chưa có đánh giá nào cho sản phẩm này.</p>
          ) : (
            displayedReviews.map(review => (
              <div key={review.id} className={styles.review_item}>
                <div className={styles.review_item__header}>
                  <img 
                    src={review.customerAvatar}
                    alt={review.customerFullName || 'Customer'}
                    className={styles.review_item__avatar}
                  />
                  <div className={styles.review_item__info}>
                    <h4 className={styles.review_item__name}>{review.customerFullName}</h4>
                    <span className={styles.review_item__date}>{formatDate(review.createAt)}</span>
                  </div>
                </div>
                
                <div className={styles.review_item__rating}>
                  <StarRating rating={review.rating} />
                </div>

                {review.images && review.images.length > 0 && (
                  <div className={styles.review_item__images}>
                    {review.images.map((img, idx) => (
                      <img 
                        key={idx}
                        src={img}
                        alt={`Review ${idx + 1}`}
                        className={styles.review_item__image}
                        onClick={() => setSelectedImage(img)}
                      />
                    ))}
                  </div>
                )}

                <p className={styles.review_item__comment}>{review.comment}</p>
              </div>
            ))
          )}
        </div>

        {reviews.length > 5 && (
          <div className={styles.review_list__toggle}>
            <button 
              className={styles.review_list__toggle_button}
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Ẩn bớt' : `Xem tất cả ${reviews.length} đánh giá`}
            </button>
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div className={styles.image_modal_overlay} onClick={() => setSelectedImage(null)}>
            <div className={styles.image_modal_container}>
              <button 
                className={styles.image_modal__close}
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
              <img 
                src={selectedImage} 
                alt="Review"
                className={styles.image_modal__image}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full review interface for customers who purchased
  return (
    <div className={styles.review_container}>
      <div className={styles.review_header}>
        <h2 className={styles.review_header__title}>Đánh giá sản phẩm</h2>
        <div className={styles.review_header__stats}>
          <div className={styles.review_stats__average}>
            <span className={styles.review_stats__average_number}>{averageRating}</span>
            <StarRating rating={Math.round(parseFloat(averageRating))} size={20} />
          </div>
          <span className={styles.review_stats__total}>({reviews.length} đánh giá)</span>
        </div>
      </div>

      <div className={styles.review_action}>
        {customerReview ? (
          <>
            <button 
              className={`${styles.review_action__button} ${styles.review_action__button_primary}`}
              onClick={() => handleOpenModal(customerReview)}
            >
              <Pen/> Sửa đánh giá của bạn
            </button>
            <button 
              className={`${styles.review_action__button} ${styles.review_action__button_secondary}`}
              onClick={() => handleDeleteReview(customerReview.id)}
            >
              <Delete/> Xóa đánh giá
            </button>
          </>
        ) : (
          <button 
            className={`${styles.review_action__button} ${styles.review_action__button_primary}`}
            onClick={() => handleOpenModal()}
          >
            <Hand/> Viết đánh giá
          </button>
        )}
      </div>

      <div className={styles.review_list}>
        {reviews.length === 0 ? (
          <p className={styles.review_list__empty}>Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên!</p>
        ) : (
          displayedReviews.map(review => (
            <div key={review.id} className={styles.review_item}>
              <div className={styles.review_item__header}>
                <img 
                  src={review.customerAvatar}
                  alt={review.customerFullName || 'Customer'}
                  className={styles.review_item__avatar}
                />
                <div className={styles.review_item__info}>
                  <h4 className={styles.review_item__name}>
                    {review.customerId === customerId ? 'Bạn' : review.customerFullName}
                  </h4>
                  <span className={styles.review_item__date}>{formatDate(review.createAt)}</span>
                </div>
              </div>
              
              <div className={styles.review_item__rating}>
                <StarRating rating={review.rating} />
              </div>

              {review.images && review.images.length > 0 && (
                <div className={styles.review_item__images}>
                  {review.images.map((img, idx) => (
                    <img 
                      key={idx}
                      src={img}
                      alt={`Review ${idx + 1}`}
                      className={styles.review_item__image}
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              )}

              <p className={styles.review_item__comment}>{review.comment}</p>

              {review.customerId === customerId && (
                <div className={styles.review_item__actions}>
                  <button 
                    className={styles.review_item__action_button}
                    onClick={() => handleOpenModal(review)}
                  >
                    Sửa
                  </button>
                  <button 
                    className={styles.review_item__action_button}
                    onClick={() => handleDeleteReview(review.id)}
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {reviews.length > 5 && (
        <div className={styles.review_list__toggle}>
          <button 
            className={styles.review_list__toggle_button}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Ẩn bớt' : `Xem tất cả ${reviews.length} đánh giá`}
          </button>
        </div>
      )}

      {/* Review Modal */}
      {isModalOpen && (
        <div className={styles.modal_overlay} onClick={handleCloseModal}>
          <div className={styles.modal_container} onClick={e => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h3 className={styles.modal_header__title}>
                {editingReview ? 'Sửa đánh giá' : 'Viết đánh giá'}
              </h3>
              <button className={styles.modal_header__close} onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <div className={styles.modal_body}>
              <div className={styles.modal_rating}>
                <label className={styles.modal_rating__label}>
                  Đánh giá của bạn <span style={{ color: 'red' }}>*</span>
                </label>
                <div className={styles.modal_rating__stars}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`${styles.modal_rating__star} ${
                        star <= formRating ? styles.modal_rating__star_active : ''
                      }`}
                      onClick={() => setFormRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
                {errors.rating && <span className={styles.error_message}>{errors.rating}</span>}
              </div>

              <div className={styles.modal_comment}>
                <label className={styles.modal_comment__label}>
                  Nhận xét <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea
                  className={styles.modal_comment__textarea}
                  value={formComment}
                  onChange={e => setFormComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                  rows={5}
                />
                {errors.comment && <span className={styles.error_message}>{errors.comment}</span>}
              </div>

              <div className={styles.modal_images}>
                <label className={styles.modal_images__label}>
                  Thêm ảnh (tối đa 5 ảnh)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className={styles.modal_images__input}
                  onChange={handleImageUpload}
                  disabled={formImages.length >= 5}
                />
                {errors.images && <span className={styles.error_message}>{errors.images}</span>}
                
                {imagePreviewUrls.length > 0 && (
                  <div className={styles.modal_images__preview}>
                    {imagePreviewUrls.map((url, idx) => (
                      <div key={idx} className={styles.modal_images__preview_item}>
                        <img 
                          src={url} 
                          alt={`Preview ${idx + 1}`}
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            objectFit: 'cover', 
                            borderRadius: '8px' 
                          }} 
                        />
                        <button
                          className={styles.modal_images__preview_remove}
                          onClick={() => {
                            // Xóa ảnh cũ
                            if (idx < existingImageUrls.length) {
                              setExistingImageUrls(prev => prev.filter((_, i) => i !== idx));
                            }
                            // Xóa ảnh mới
                              else {
                              const newFileIndex = idx - existingImageUrls.length;
                              setFormImages(prev => prev.filter((_, i) => i !== newFileIndex));
                              // Revoke the preview URL (a string) instead of passing the File to revokeObjectURL
                              // imagePreviewUrls contains the blob: URLs created with URL.createObjectURL(file)
                              URL.revokeObjectURL(imagePreviewUrls[idx]);
                            }
                            // Cập nhật preview
                            setImagePreviewUrls(prev => prev.filter((_, i) => i !== idx));
                          }}
                          type="button"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {uploadingImages && (
                <div className={styles.upload_progress}>
                  Đang tải ảnh lên...
                </div>
              )}
            </div>

            <div className={styles.modal_footer}>
              <button 
                className={`${styles.modal_footer__button} ${styles.modal_footer__button_cancel}`}
                onClick={handleCloseModal}
                disabled={submitting}
              >
                Hủy
              </button>
              <button 
                className={`${styles.modal_footer__button} ${styles.modal_footer__button_submit}`}
                onClick={handleSubmitReview}
                disabled={submitting || uploadingImages}
              >
                {submitting ? 'Đang xử lý...' : (editingReview ? 'Cập nhật' : 'Gửi đánh giá')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className={styles.image_modal_overlay} onClick={() => setSelectedImage(null)}>
          <div className={styles.image_modal_container}>
            <button 
              className={styles.image_modal__close}
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
            <img 
              src={selectedImage} 
              alt="Review"
              className={styles.image_modal__image}
            />
          </div>
        </div>
      )}
    </div>
  );
};