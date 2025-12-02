// components/review/ProductReviewList.tsx
import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { reviewService, type ReviewResponse } from '@/services/review';

interface ProductReviewListProps {
  productId: number;
  customerId?: string; // Để hiển thị "Bạn" nếu là review của user hiện tại
  onReviewEdited?: () => void; // Optional callback khi cần reload sau edit
}

export const ProductReviewList: React.FC<ProductReviewListProps> = ({
  productId,
  customerId,
  onReviewEdited,
}) => {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const result = await reviewService.getReviewsByProductId(productId);
      if (result.success && result.data) {
        setReviews(result.data);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Reload sau khi có thay đổi (edit/delete từ component khác)
  React.useEffect(() => {
    if (onReviewEdited) {
      fetchReviews();
    }
  }, [onReviewEdited]);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const displayedReviews = showAll ? reviews : reviews.slice(0, 5);

  const getCustomerDisplayInfo = (review: ReviewResponse) => {
    const fullName = `${review.firstName || ''} ${review.lastName || ''}`.trim() || 'Khách hàng';
    const avatarUrl = review.image ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=ff4d4d&color=fff`;
    return { fullName, avatarUrl };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
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

  if (loading) {
    return <div className={styles.review_container}><div className={styles.review_loading}>Đang tải đánh giá...</div></div>;
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

      <div className={styles.review_list}>
        {reviews.length === 0 ? (
          <p className={styles.review_list__empty}>Chưa có đánh giá nào cho sản phẩm này.</p>
        ) : (
          displayedReviews.map(review => {
            const { fullName, avatarUrl } = getCustomerDisplayInfo(review);
            const isOwnReview = review.customerId === customerId;

            return (
              <div key={review.id} className={styles.review_item}>
                <div className={styles.review_item__header}>
                  <img src={avatarUrl} alt={fullName} className={styles.review_item__avatar} />
                  <div className={styles.review_item__info}>
                    <h4 className={styles.review_item__name}>
                      {isOwnReview ? 'Bạn' : fullName}
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
              </div>
            );
          })
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
            <button className={styles.image_modal__close} onClick={() => setSelectedImage(null)}>
              X
            </button>
            <img src={selectedImage} alt="Review" className={styles.image_modal__image} />
          </div>
        </div>
      )}
    </div>
  );
};