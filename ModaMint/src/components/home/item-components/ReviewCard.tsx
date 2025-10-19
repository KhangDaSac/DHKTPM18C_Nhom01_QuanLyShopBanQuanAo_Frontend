import { Star } from "lucide-react";
import styles from './styles.module.css'
// import React, { useState } from 'react'; // Not used

interface Review {
  id: number;
  text: string;
  name: string;
  role: string;
  rating: number;
  avatar: string;
}

export const ReviewCard = ({ review }: { review: Review }) => {
  const items = Array.from({ length: review.rating }, (_, i) => i + 1);
  return (
    <div className={styles.review_card}>
      <p className={styles.review_text}>{review.text}</p>

      <div className={styles.star_rating}>
        {items.map((i) => (
          <Star key={i} color="yellow" fill="yellow" />
        ))}
      </div>

      <div className={styles.reviewer_info}>
        <div className={styles.avatar_container}>
          <img
            src={review.avatar}
            alt={review.name}
            className={styles.avatar}
          />
        </div>
        <div className={styles.reviewer_name}>{review.name}</div>
        <div className={styles.reviewer_role}>{review.role}</div>
      </div>
    </div>
  );
};