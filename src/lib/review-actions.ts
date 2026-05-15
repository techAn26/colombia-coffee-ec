"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user: {
    name: string;
    avatar_url: string | null;
  };
};

export async function getProductReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, user:profiles(name, avatar_url)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as Review[];
}

export async function getAverageRating(
  productId: string
): Promise<{ average: number; count: number }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId);

  if (error || !data || data.length === 0) {
    return { average: 0, count: 0 };
  }

  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  return { average: sum / data.length, count: data.length };
}

export async function submitReview(
  productId: string,
  rating: number,
  comment: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインが必要です");

  const { error } = await supabase.from("reviews").insert({
    user_id: user.id,
    product_id: productId,
    rating,
    comment: comment || null,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("この商品には既にレビューを投稿済みです");
    }
    throw error;
  }

  revalidatePath(`/products/${productId}`);
}

export async function deleteReview(reviewId: string, productId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) throw error;

  revalidatePath(`/products/${productId}`);
}
