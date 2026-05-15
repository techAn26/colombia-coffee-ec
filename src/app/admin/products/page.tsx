import Link from "next/link";
import { getAdminProducts } from "@/lib/product-actions";
import { getRoastLabel } from "@/lib/products";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/admin" className="hover:text-foreground">
          管理画面
        </Link>
        <span className="mx-2">/</span>
        <span>商品管理</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">商品管理</h1>
        <Link
          href="/admin/products/new"
          className={buttonVariants({ variant: "default" })}
        >
          + 商品を追加
        </Link>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {products.length}件の商品
      </p>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">まだ商品がありません。</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {
            const variants = product.product_variants as {
              id: string;
              label: string;
              price: number;
              stock: number;
            }[];
            const totalStock = variants.reduce(
              (sum, v) => sum + v.stock,
              0
            );

            return (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}/edit`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer mb-3">
                  <CardContent className="flex items-center justify-between py-4 px-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-xl">☕</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {getRoastLabel(product.roast_level)} /{" "}
                          {product.origin}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                          product.is_published
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.is_published ? "公開" : "非公開"}
                      </span>
                      <span
                        className={`text-xs ${
                          totalStock <= 0
                            ? "text-destructive"
                            : totalStock <= 10
                            ? "text-orange-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        在庫: {totalStock}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
