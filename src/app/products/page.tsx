import { Suspense } from "react";
import { getProducts, getUniqueOrigins, getUniqueFlavors } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [products, origins, flavors] = await Promise.all([
    getProducts({
      origin: params.origin,
      roast: params.roast,
      flavor: params.flavor,
      q: params.q,
    }),
    getUniqueOrigins(),
    getUniqueFlavors(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">商品一覧</h1>

      <Suspense fallback={null}>
        <ProductFilters origins={origins} flavors={flavors} />
      </Suspense>

      <div className="mt-6">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              該当する商品が見つかりませんでした。
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {products.length}件の商品
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
