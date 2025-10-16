import {Star} from "lucide-react";
import React, { useState } from 'react';

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
    <div className="review-card">
      <p className="review-text">{review.text}</p>

      <div className="star-rating">
        {
            items.map( i => <Star key={i} color="yellow" fill="yellow"/>)
        }
      </div>

      <div className="reviewer-info">
        <div className="avatar-container">
          <img 
            src={review.avatar}
            alt={review.name}
            className="avatar"
          />
        </div>
        <div className="reviewer-name">{review.name}</div>
        <div className="reviewer-role">{review.role}</div>
      </div>
    </div>
  );
};