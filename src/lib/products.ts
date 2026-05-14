import { createClient } from "@/lib/supabase/server";

export type Product = {
  id: string;
  name: string;
  description: string;
  origin: string;
  farm_name: string | null;
  farm_story: string | null;
  roast_level: "light" | "medium" | "dark";
  process: string | null;
  altitude: string | null;
  flavor_notes: string[] | null;
  image_url: string | null;
  is_published: boolean;
  category_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  label: string;
  weight_g: number;
  price: number;
  stock: number;
  sort_order: number;
};

export type ProductWithMinPrice = Product & {
  min_price: number | null;
};

export type ProductWithVariants = Product & {
  product_variants: ProductVariant[];
};

export type ProductFilters = {
  origin?: string;
  roast?: string;
  flavor?: string;
  q?: string;
};

const ROAST_LABELS: Record<string, string> = {
  light: "浅煎り",
  medium: "中煎り",
  dark: "深煎り",
};

export function getRoastLabel(level: string): string {
  return ROAST_LABELS[level] ?? level;
}

/**
 * 商品一覧を取得（フィルター・検索対応）
 */
export async function getProducts(
  filters: ProductFilters = {}
): Promise<ProductWithMinPrice[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*, product_variants(price)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (filters.origin) {
    query = query.ilike("origin", `%${filters.origin}%`);
  }

  if (filters.roast) {
    query = query.eq("roast_level", filters.roast);
  }

  if (filters.q) {
    query = query.or(
      `name.ilike.%${filters.q}%,description.ilike.%${filters.q}%,farm_name.ilike.%${filters.q}%`
    );
  }

  const { data, error } = await query;

  if (error) throw error;

  // flavor_notesフィルターはアプリ側で処理（PostgreSQLの配列フィルターは複雑なため）
  let products = data ?? [];

  if (filters.flavor) {
    products = products.filter((p) =>
      p.flavor_notes?.some((note: string) =>
        note.includes(filters.flavor!)
      )
    );
  }

  // min_priceを計算
  return products.map((p) => {
    const variants = p.product_variants as { price: number }[];
    const min_price =
      variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : null;
    const { product_variants: _, ...product } = p;
    return { ...product, min_price } as ProductWithMinPrice;
  });
}

/**
 * 商品詳細を取得（バリエーション付き）
 */
export async function getProduct(
  id: string
): Promise<ProductWithVariants | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error) return null;

  return data as ProductWithVariants;
}

/**
 * フィルター用のユニークな産地一覧を取得
 */
export async function getUniqueOrigins(): Promise<string[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("origin")
    .eq("is_published", true);

  if (!data) return [];

  const origins = [...new Set(data.map((p) => p.origin))];
  return origins.sort();
}

/**
 * フィルター用のユニークなフレーバー一覧を取得
 */
export async function getUniqueFlavors(): Promise<string[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("flavor_notes")
    .eq("is_published", true);

  if (!data) return [];

  const flavors = new Set<string>();
  data.forEach((p) => {
    p.flavor_notes?.forEach((note: string) => flavors.add(note));
  });

  return [...flavors].sort();
}
