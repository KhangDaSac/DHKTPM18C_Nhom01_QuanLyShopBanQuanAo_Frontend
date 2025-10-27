import React, { useState, useMemo } from 'react';
import styles from './styles.module.css'
import { Delete, Hand, Pen } from 'lucide-react';

// Interfaces
interface Review {
  id: number;
  productId: number;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  orderItemId: number;
  rating: number;
  images: string[];
  comment: string;
  createAt: string;
}

interface ProductReviewProps {
  productId: number;
  customerId: string | null;
  orderItemId: number | null;
}


export const ProductReview: React.FC<ProductReviewProps> = ({ productId, customerId, orderItemId }) => {
  // Generate mock reviews
  const mockReviews: Review[] = useMemo(() => {
    const reviews: Review[] = [];
    const comments = [
      'Sản phẩm rất tốt, chất lượng vượt mong đợi!',
      'Giao hàng nhanh, đóng gói cẩn thận. Sản phẩm đẹp như hình.',
      'Đáng đồng tiền bát gạo. Sẽ ủng hộ shop lâu dài.',
      'Chất lượng ok, giá cả hợp lý. Recommend!',
      'Sản phẩm tốt nhưng giao hơi lâu. Nhìn chung ổn.',
      'Rất hài lòng với sản phẩm này. 5 sao không cần bàn cãi!',
      'Mình đã dùng được 2 tuần rồi, sản phẩm hoạt động tốt.',
      'Giá hơi cao nhưng chất lượng xứng đáng.'
    ];

    for (let i = 1; i <= 12; i++) {
      const numImages = Math.floor(Math.random() * 4);
      const images: string[] = [];
      
      for (let j = 0; j < numImages; j++) {
        images.push(`https://picsum.photos/400/400?random=${i}-${j}`);
      }

      reviews.push({
        id: i,
        productId: productId,
        customerId: `customer${i}`,
        customerName: `Khách hàng ${i}`,
        customerAvatar: `https://ui-avatars.com/api/?name=KH${i}&background=ff4d4d&color=fff`,
        orderItemId: 100 + i,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        images: images,
        comment: comments[Math.floor(Math.random() * comments.length)],
        createAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    return reviews;
  }, [productId]);

  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [showAll, setShowAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Form state
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);

  // Check if customer has reviewed
  const customerReview = reviews.find(r => r.customerId === customerId);
  const displayedReviews = showAll ? reviews : reviews.slice(0, 5);

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const handleOpenModal = (review?: Review) => {
    if (review) {
      setEditingReview(review);
      setFormRating(review.rating);
      setFormComment(review.comment);
      setFormImages(review.images);
    } else {
      setEditingReview(null);
      setFormRating(5);
      setFormComment('');
      setFormImages([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReview(null);
  };

  const handleSubmitReview = () => {
    if (editingReview) {
      // Update existing review
      setReviews(reviews.map(r => 
        r.id === editingReview.id 
          ? { ...r, rating: formRating, comment: formComment, images: formImages }
          : r
      ));
    } else {
      // Add new review
      const newReview: Review = {
        id: Date.now(),
        productId: productId,
        customerId: customerId!,
        customerName: 'Bạn',
        customerAvatar: `https://ui-avatars.com/api/?name=You&background=ff4d4d&color=fff`,
        orderItemId: orderItemId!,
        rating: formRating,
        images: formImages,
        comment: formComment,
        createAt: new Date().toISOString()
      };
      setReviews([newReview, ...reviews]);
    }
    handleCloseModal();
  };

  const handleDeleteReview = (reviewId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      setReviews(reviews.filter(r => r.id !== reviewId));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setFormImages([...formImages, ...newImages].slice(0, 5));
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormImages(formImages.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
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

  // Show warning messages
  if (!customerId) {
    return (
      <div className={styles.review_container}>
        <div className={styles.review_warning}>
          <p className={styles.review_warning__text}>
            ⚠️ Vui lòng đăng nhập để xem và viết đánh giá sản phẩm.
          </p>
        </div>
      </div>
    );
  }

  if (!orderItemId) {
    return (
      <div className={styles.review_container}>
        <div className={styles.review_warning}>
          <p className={styles.review_warning__text}>
            ⚠️ Bạn chưa mua sản phẩm này. Vui lòng mua sản phẩm để có thể đánh giá.
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
          {displayedReviews.map(review => (
            <div key={review.id} className={styles.review_item}>
              <div className={styles.review_item__header}>
                <img 
                  src={review.customerAvatar} 
                  alt={review.customerName}
                  className={styles.review_item__avatar}
                />
                <div className={styles.review_item__info}>
                  <h4 className={styles.review_item__name}>{review.customerName}</h4>
                  <span className={styles.review_item__date}>{formatDate(review.createAt)}</span>
                </div>
              </div>
              
              <div className={styles.review_item__rating}>
                <StarRating rating={review.rating} />
              </div>

              {review.images.length > 0 && (
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
          ))}
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
      </div>
    );
  }

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
        {displayedReviews.map(review => (
          <div key={review.id} className={styles.review_item}>
            <div className={styles.review_item__header}>
              <img 
                src={review.customerAvatar} 
                alt={review.customerName}
                className={styles.review_item__avatar}
              />
              <div className={styles.review_item__info}>
                <h4 className={styles.review_item__name}>
                  {review.customerId === customerId ? 'Bạn' : review.customerName}
                </h4>
                <span className={styles.review_item__date}>{formatDate(review.createAt)}</span>
              </div>
            </div>
            
            <div className={styles.review_item__rating}>
              <StarRating rating={review.rating} />
            </div>

            {review.images.length > 0 && (
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
        ))}
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
                <label className={styles.modal_rating__label}>Đánh giá của bạn</label>
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
              </div>

              <div className={styles.modal_comment}>
                <label className={styles.modal_comment__label}>Nhận xét</label>
                <textarea
                  className={styles.modal_comment__textarea}
                  value={formComment}
                  onChange={e => setFormComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                  rows={5}
                />
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
                
                {formImages.length > 0 && (
                  <div className={styles.modal_images__preview}>
                    {formImages.map((img, idx) => (
                      <div key={idx} className={styles.modal_images__preview_item}>
                        <img src={img} alt={`Preview ${idx + 1}`} />
                        <button
                          className={styles.modal_images__preview_remove}
                          onClick={() => handleRemoveImage(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modal_footer}>
              <button 
                className={`${styles.modal_footer__button} ${styles.modal_footer__button_cancel}`}
                onClick={handleCloseModal}
              >
                Hủy
              </button>
              <button 
                className={`${styles.modal_footer__button} ${styles.modal_footer__button_submit}`}
                onClick={handleSubmitReview}
                disabled={!formComment.trim()}
              >
                {editingReview ? 'Cập nhật' : 'Gửi đánh giá'}
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
