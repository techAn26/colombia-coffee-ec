"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Review } from "@/lib/review-actions";

interface ReviewItemProps {
  review: Review;
  productId: string;
  currentUserId?: string;
}

export function ReviewItem({ review }: ReviewItemProps) {
  return (
    <Card>
      <CardContent className="py-4 px-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">
            {"★".repeat(review.rating)}
            {"☆".repeat(5 - review.rating)}
          </span>
          <span className="text-sm font-medium">{review.user.name}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(review.created_at).toLocaleDateString("ja-JP")}
          </span>
        </div>
        {review.comment && (
          <p className="text-sm text-muted-foreground">{review.comment}</p>
        )}
      </CardContent>
    </Card>
  );
}
