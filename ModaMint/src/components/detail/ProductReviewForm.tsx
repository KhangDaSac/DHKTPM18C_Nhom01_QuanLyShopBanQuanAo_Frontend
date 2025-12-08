// components/review/ProductReviewModal.tsx
import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { uploadImageToCloudinary } from '@/services/review/upImage';
import { reviewService, type ReviewResponse } from '@/services/review';
import { toast } from 'react-toastify';

interface ProductReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  customerId: string;
  orderItemId: number;
  existingReview?: ReviewResponse | null;
  onSuccess: () => void;
}

export const ProductReviewModal: React.FC<ProductReviewModalProps> = ({
  isOpen,
  onClose,
  productId,
  customerId,
  orderItemId,
  existingReview,
  onSuccess,
}) => {
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [formImages, setFormImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errors, setErrors] = useState<{ rating?: string; comment?: string; images?: string }>({});

  // Reset form khi mở modal hoặc thay đổi existingReview
  useEffect(() => {
    if (!isOpen) return;

    if (existingReview) {
      setFormRating(existingReview.rating);
      setFormComment(existingReview.comment || '');
      setExistingImageUrls(existingReview.images || []);
      setImagePreviewUrls(existingReview.images || []);
    } else {
      setFormRating(5);
      setFormComment('');
      setExistingImageUrls([]);
      setImagePreviewUrls([]);
    }
    setFormImages([]);
    setErrors({});
  }, [isOpen, existingReview]);

  // Dọn dẹp blob URLs khi đóng
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => url.startsWith('blob:') && URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formComment.trim()) newErrors.comment = 'Nhận xét không được để trống';
    if (formImages.length + existingImageUrls.length > 5) newErrors.images = 'Tối đa 5 ảnh';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    setUploadingImages(formImages.length > 0);

    try {
      let finalImageUrls = [...existingImageUrls];
      if (formImages.length > 0) {
        const newUrls = await Promise.all(formImages.map(uploadImageToCloudinary));
        finalImageUrls.push(...newUrls);
      }

      const reviewData = {
        productId,
        customerId,
        orderItemId,
        rating: formRating,
        comment: formComment.trim(),
        images: finalImageUrls,
      };

      const result = existingReview
        ? await reviewService.updateReview(existingReview.id, reviewData)
        : await reviewService.createReview(reviewData);

      if (result.success) {
        toast(existingReview ? 'Cập nhật thành công!' : 'Gửi đánh giá thành công!');
        onSuccess();
        onClose();
      } else {
        toast(result.message || 'Thao tác thất bại');
      }
    } catch (error) {
      console.error(error);
      toast('Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
      setUploadingImages(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    const total = formImages.length + newFiles.length + existingImageUrls.length;
    if (total > 5) {
      toast('Tối đa 5 ảnh');
      return;
    }
    const previews = newFiles.map(f => URL.createObjectURL(f));
    setFormImages(prev => [...prev, ...newFiles]);
    setImagePreviewUrls(prev => [...prev, ...previews]);
  };

  const handleRemoveImage = (index: number) => {
    const url = imagePreviewUrls[index];
    if (url.startsWith('blob:')) URL.revokeObjectURL(url);

    if (index < existingImageUrls.length) {
      setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      const fileIdx = index - existingImageUrls.length;
      setFormImages(prev => prev.filter((_, i) => i !== fileIdx));
    }
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.modal_overlay} onClick={onClose}>
      <div className={styles.modal_container} onClick={e => e.stopPropagation()}>
        <div className={styles.modal_header}>
          <h3 className={styles.modal_header__title}>
            {existingReview ? 'Sửa đánh giá' : 'Viết đánh giá'}
          </h3>
          <button className={styles.modal_header__close} onClick={onClose}>X</button>
        </div>

        <div className={styles.modal_body}>
          {/* Rating */}
          <div className={styles.modal_rating}>
            <label className={styles.modal_rating__label}>Đánh giá <span style={{ color: 'red' }}>*</span></label>
            <div className={styles.modal_rating__stars}>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`${styles.modal_rating__star} ${star <= formRating ? styles.modal_rating__star_active : ''}`}
                  onClick={() => setFormRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className={styles.modal_comment}>
            <label className={styles.modal_comment__label}>Nhận xét <span style={{ color: 'red' }}>*</span></label>
            <textarea
              className={styles.modal_comment__textarea}
              value={formComment}
              onChange={e => setFormComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              rows={5}
            />
            {errors.comment && <span className={styles.error_message}>{errors.comment}</span>}
          </div>

          {/* Images */}
          <div className={styles.modal_images}>
            <label className={styles.modal_images__label}>Thêm ảnh (tối đa 5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={formImages.length + existingImageUrls.length >= 5}
            />
            {errors.images && <span className={styles.error_message}>{errors.images}</span>}

            {imagePreviewUrls.length > 0 && (
              <div className={styles.modal_images__preview}>
                {imagePreviewUrls.map((url, idx) => (
                  <div key={idx} className={styles.modal_images__preview_item}>
                    <img src={url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                    <button className={styles.modal_images__preview_remove} onClick={() => handleRemoveImage(idx)}>
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
            {uploadingImages && <div className={styles.upload_progress}>Đang tải ảnh lên...</div>}
          </div>
        </div>

        <div className={styles.modal_footer}>
          <button className={`${styles.modal_footer__button} ${styles.modal_footer__button_cancel}`} onClick={onClose} disabled={submitting}>
            Hủy
          </button>
          <button
            className={`${styles.modal_footer__button} ${styles.modal_footer__button_submit}`}
            onClick={handleSubmit}
            disabled={submitting || uploadingImages}
          >
            {submitting ? 'Đang xử lý...' : (existingReview ? 'Cập nhật' : 'Gửi đánh giá')}
          </button>
        </div>
      </div>
    </div>
  );
};