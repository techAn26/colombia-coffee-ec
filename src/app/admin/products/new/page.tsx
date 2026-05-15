import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/product-form";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "coffee-beans")
    .single();

  const categoryId = categories?.id ?? "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/admin" className="hover:text-foreground">
          管理画面
        </Link>
        <span className="mx-2">/</span>
        <Link href="/admin/products" className="hover:text-foreground">
          商品管理
        </Link>
        <span className="mx-2">/</span>
        <span>新規追加</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">商品を追加</h1>

      <ProductForm mode="create" categoryId={categoryId} />
    </div>
  );
}
