import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct, getRoastLabel } from "@/lib/products";
import { createClient } from "@/lib/supabase/server";
import { AddToCart } from "@/components/add-to-cart";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const variants = product.product_variants.sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* パンくずリスト */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/products" className="hover:text-foreground">
          商品一覧
        </Link>
        <span className="mx-2">/</span>
        <span>{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 商品画像 */}
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-8xl">☕</span>
          )}
        </div>

        {/* 商品情報 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          {/* スペック */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              スペック
            </h2>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">産地</dt>
              <dd>{product.origin}</dd>

              {product.farm_name && (
                <>
                  <dt className="text-muted-foreground">農園</dt>
                  <dd>{product.farm_name}</dd>
                </>
              )}

              <dt className="text-muted-foreground">焙煎度</dt>
              <dd>{getRoastLabel(product.roast_level)}</dd>

              {product.process && (
                <>
                  <dt className="text-muted-foreground">精製方法</dt>
                  <dd>{product.process}</dd>
                </>
              )}

              {product.altitude && (
                <>
                  <dt className="text-muted-foreground">標高</dt>
                  <dd>{product.altitude}</dd>
                </>
              )}
            </dl>
          </div>

          {/* フレーバーノート */}
          {product.flavor_notes && product.flavor_notes.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                フレーバーノート
              </h2>
              <div className="flex flex-wrap gap-2">
                {product.flavor_notes.map((note) => (
                  <span
                    key={note}
                    className="inline-block rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* バリエーション選択・カートに入れる */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              容量を選んでカートに入れる
            </h2>
            <AddToCart variants={variants} isLoggedIn={!!user} />
          </div>
        </div>
      </div>

      {/* 農園ストーリー */}
      {product.farm_story && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">
            🌱 農園のストーリー — {product.farm_name}
          </h2>
          <div className="prose prose-neutral max-w-none">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.farm_story}
            </p>
          </div>
        </section>
      )}

      {/* レビュー（後のChapterで実装） */}
      <section className="mt-12">
        <h2 className="text-xl font-bold mb-4">レビュー</h2>
        <p className="text-muted-foreground">
          まだレビューがありません。
        </p>
      </section>
    </div>
  );
}
