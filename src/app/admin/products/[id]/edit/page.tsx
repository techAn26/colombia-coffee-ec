import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminProduct, deleteProduct } from "@/lib/product-actions";
import { ProductForm } from "@/components/product-form";
import { Button } from "@/components/ui/button";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getAdminProduct(id);

  if (!product) {
    notFound();
  }

  const variants = (
    product.product_variants as {
      id: string;
      label: string;
      weight_g: number;
      price: number;
      stock: number;
      sort_order: number;
    }[]
  ).sort((a, b) => a.sort_order - b.sort_order);

  const handleDelete = async () => {
    "use server";
    await deleteProduct(id);
  };

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
        <span>{product.name}</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">商品を編集</h1>
        <form action={handleDelete}>
          <Button type="submit" variant="destructive" size="sm">
            この商品を削除
          </Button>
        </form>
      </div>

      <ProductForm
        mode="edit"
        productId={id}
        categoryId={product.category_id ?? ""}
        defaultValues={{
          name: product.name,
          description: product.description,
          origin: product.origin,
          farm_name: product.farm_name ?? "",
          farm_story: product.farm_story ?? "",
          roast_level: product.roast_level,
          process: product.process ?? "",
          altitude: product.altitude ?? "",
          flavor_notes: product.flavor_notes ?? [],
          image_url: product.image_url ?? null,
          is_published: product.is_published,
          category_id: product.category_id,
          variants,
        }}
      />
    </div>
  );
}
