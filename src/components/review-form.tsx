"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { submitReview } from "@/lib/review-actions";

interface ReviewFormProps {
  productId: string;
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const comment = formData.get("comment") as string;

    try {
      await submitReview(productId, rating, comment);
      setMessage("レビューを投稿しました");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "投稿に失敗しました"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-1">評価</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl transition-colors"
                >
                  {star <= rating ? "★" : "☆"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Textarea
              name="comment"
              placeholder="コーヒーの感想を書いてください（任意）"
              rows={3}
            />
          </div>
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "投稿中..." : "レビューを投稿"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
