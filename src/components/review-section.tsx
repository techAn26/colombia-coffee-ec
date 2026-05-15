import { getProductReviews, getAverageRating } from "@/lib/review-actions";
import { createClient } from "@/lib/supabase/server";
import { ReviewForm } from "@/components/review-form";
import { ReviewItem } from "@/components/review-item";

interface ReviewSectionProps {
  productId: string;
}

export async function ReviewSection({ productId }: ReviewSectionProps) {
  const [reviews, { average, count }, supabase] = await Promise.all([
    getProductReviews(productId),
    getAverageRating(productId),
    createClient(),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ユーザーが既にレビューを投稿済みかチェック
  const hasReviewed = user
    ? reviews.some((r) => {
        // reviewにはuser_idが含まれないのでサーバーで別途チェック
        return false; // ReviewFormで制御
      })
    : false;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold mb-4">
        レビュー
        {count > 0 && (
          <span className="ml-2 text-base font-normal text-muted-foreground">
            {"★".repeat(Math.round(average))}
            {"☆".repeat(5 - Math.round(average))} {average.toFixed(1)} ({count}件)
          </span>
        )}
      </h2>

      {/* レビュー投稿フォーム */}
      {user && !hasReviewed && (
        <div className="mb-6">
          <ReviewForm productId={productId} />
        </div>
      )}

      {!user && (
        <p className="text-sm text-muted-foreground mb-6">
          レビューを投稿するには
          <a href="/login" className="underline ml-1">
            ログイン
          </a>
          してください。
        </p>
      )}

      {/* レビュー一覧 */}
      {reviews.length === 0 ? (
        <p className="text-muted-foreground">まだレビューがありません。</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              productId={productId}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
