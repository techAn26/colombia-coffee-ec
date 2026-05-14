"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addToCart(variantId: string, quantity: number = 1) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインが必要です");

  // UNIQUE(user_id, variant_id) を利用したupsert
  // 既にカートにあれば数量を加算
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("variant_id", variantId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      variant_id: variantId,
      quantity,
    });
    if (error) throw error;
  }

  revalidatePath("/cart");
  revalidatePath("/products");
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインが必要です");

  if (quantity <= 0) {
    return removeFromCart(cartItemId);
  }

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/cart");
}

export async function removeFromCart(cartItemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインが必要です");

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/cart");
}

export type CartItemWithDetails = {
  id: string;
  quantity: number;
  variant: {
    id: string;
    label: string;
    weight_g: number;
    price: number;
    stock: number;
    product: {
      id: string;
      name: string;
      image_url: string | null;
    };
  };
};

export async function getCartItems(): Promise<CartItemWithDetails[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      quantity,
      variant:product_variants (
        id,
        label,
        weight_g,
        price,
        stock,
        product:products (
          id,
          name,
          image_url
        )
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []) as unknown as CartItemWithDetails[];
}
