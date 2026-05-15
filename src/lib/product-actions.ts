"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProductFormData = {
  name: string;
  description: string;
  origin: string;
  farm_name: string;
  farm_story: string;
  roast_level: string;
  process: string;
  altitude: string;
  flavor_notes_text: string; // カンマ区切り
  image_url: string | null;
  is_published: boolean;
  category_id: string | null;
  variants: {
    id?: string;
    label: string;
    weight_g: number;
    price: number;
    stock: number;
    sort_order: number;
  }[];
};

export async function createProduct(data: ProductFormData) {
  const supabase = await createClient();

  const flavorNotes = data.flavor_notes_text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: data.name,
      description: data.description,
      origin: data.origin,
      farm_name: data.farm_name || null,
      farm_story: data.farm_story || null,
      roast_level: data.roast_level,
      process: data.process || null,
      altitude: data.altitude || null,
      flavor_notes: flavorNotes.length > 0 ? flavorNotes : null,
      image_url: data.image_url,
      is_published: data.is_published,
      category_id: data.category_id,
    })
    .select("id")
    .single();

  if (error) throw error;

  // バリエーションを作成
  if (data.variants.length > 0) {
    const { error: variantError } = await supabase
      .from("product_variants")
      .insert(
        data.variants.map((v) => ({
          product_id: product.id,
          label: v.label,
          weight_g: v.weight_g,
          price: v.price,
          stock: v.stock,
          sort_order: v.sort_order,
        }))
      );
    if (variantError) throw variantError;
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function updateProduct(productId: string, data: ProductFormData) {
  const supabase = await createClient();

  const flavorNotes = data.flavor_notes_text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("products")
    .update({
      name: data.name,
      description: data.description,
      origin: data.origin,
      farm_name: data.farm_name || null,
      farm_story: data.farm_story || null,
      roast_level: data.roast_level,
      process: data.process || null,
      altitude: data.altitude || null,
      image_url: data.image_url,
      flavor_notes: flavorNotes.length > 0 ? flavorNotes : null,
      is_published: data.is_published,
      category_id: data.category_id,
    })
    .eq("id", productId);

  if (error) throw error;

  // バリエーション: 既存を削除して再作成（シンプルな実装）
  await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", productId);

  if (data.variants.length > 0) {
    const { error: variantError } = await supabase
      .from("product_variants")
      .insert(
        data.variants.map((v) => ({
          product_id: productId,
          label: v.label,
          weight_g: v.weight_g,
          price: v.price,
          stock: v.stock,
          sort_order: v.sort_order,
        }))
      );
    if (variantError) throw variantError;
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  redirect("/admin/products");
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) throw error;

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

/**
 * 管理者用: 全商品一覧（非公開含む）
 */
export async function getAdminProducts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(id, label, weight_g, price, stock)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * 管理者用: 商品詳細（バリエーション付き）
 */
export async function getAdminProduct(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
