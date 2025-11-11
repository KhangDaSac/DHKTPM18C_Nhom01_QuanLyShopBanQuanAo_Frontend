// src/components/home/item-components/ReviewCard.tsx
import { Star } from "lucide-react";
import styles from "./styles.module.css";
import type { ReviewResponse } from "@/services/review";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dkokkltme/image/upload/v1762793886/image_album_8_soqfvo.webp";

export const ReviewCard = ({ review }: { review: ReviewResponse }) => {
  const rating = review.rating || 0;
  const comment = review.comment?.trim() || "Không có bình luận";

  // Ưu tiên: firstName + lastName > customerName > "Khách hàng"
  const displayName = review.firstName || review.lastName
    ? `${review.firstName || ""} ${review.lastName || ""}`.trim() || "Khách hàng"
    : review.customerName || "Khách hàng";

  // Ưu tiên: image từ user > DEFAULT_AVATAR
  const avatarUrl = review.image || DEFAULT_AVATAR;

  return (
    <div className={styles.review_card}>
      {/* Bình luận */}
      <p className={styles.review_text}>{comment}</p>

      {/* Đánh giá sao */}
      <div className={styles.star_rating}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={16}
            fill={i < rating ? "#FFD700" : "#E5E7EB"}
            color={i < rating ? "#FFD700" : "#E5E7EB"}
            className={i < rating ? styles.star_filled : styles.star_empty}
          />
        ))}
      </div>

      {/* Thông tin người đánh giá */}
      <div className={styles.reviewer_info}>
        <div className={styles.avatar_container}>
          <img
            src={avatarUrl}
            alt={displayName}
            className={styles.avatar}
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== DEFAULT_AVATAR) {
                target.src = DEFAULT_AVATAR;
              }
            }}
          />
        </div>
        <div>
          <div className={styles.reviewer_name}>{displayName}</div>
          <div className={styles.reviewer_role}>Khách hàng</div>
        </div>
      </div>
    </div>
  );
};