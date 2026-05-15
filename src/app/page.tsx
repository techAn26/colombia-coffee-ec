import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export default async function Home() {
  const products = await getProducts();
  const featured = products.slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* ヒーローセクション */}
      <section className="relative bg-gradient-to-b from-accent/30 to-background py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            コロンビアから届く、
            <br />
            農園の想いが詰まった一杯。
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            生産者の顔が見えるスペシャリティコーヒー豆を、
            農園から直接あなたのもとへ。
            産地・焙煎度・フレーバーで、あなただけの一杯を見つけてください。
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/products" className={buttonVariants({ size: "lg" })}>
              商品を見る
            </Link>
            <Link
              href="#story"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              ストーリーを読む
            </Link>
          </div>
        </div>
      </section>

      {/* おすすめ商品セクション */}
      {featured.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold">おすすめのコーヒー豆</h2>
              <p className="text-muted-foreground mt-2">
                コロンビア各地の農園から届いた厳選スペシャリティコーヒー
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/products"
                className={buttonVariants({ variant: "outline" })}
              >
                すべての商品を見る
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ブランドストーリーセクション */}
      <section id="story" className="py-16 px-4 bg-secondary/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Colombia Coffee のストーリー
          </h2>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              コロンビアは、世界でもトップクラスのコーヒー生産国。
              アンデス山脈の高地で育てられたコーヒーチェリーは、
              昼夜の寒暖差と豊かな火山性土壌によって、
              他にはない複雑で豊かな風味を持ちます。
            </p>
            <p>
              私たちは、コロンビアの農園を直接訪れ、
              農園主たちと対話し、彼らのこだわりと情熱を肌で感じてきました。
              大量生産では失われてしまう「農園の個性」を、
              そのまま日本のコーヒー愛好家にお届けしたい。
              それが Colombia Coffee の原点です。
            </p>
            <p>
              一杯のコーヒーの向こう側には、
              農園の土壌を守り、品質を追求し、
              次の世代に美しい山を残そうとする人々がいます。
              コーヒーを選ぶとき、その人たちのストーリーも
              一緒に味わっていただけたら嬉しいです。
            </p>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Colombia Coffee の3つのこだわり
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="text-4xl">🌱</div>
              <h3 className="text-lg font-bold">農園直送</h3>
              <p className="text-sm text-muted-foreground">
                コロンビアの農園から直接仕入れ。
                中間業者を通さないからこそ、鮮度と品質を保てます。
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-4xl">📖</div>
              <h3 className="text-lg font-bold">ストーリーが見える</h3>
              <p className="text-sm text-muted-foreground">
                すべての商品に農園のストーリーを掲載。
                誰が、どんな想いで作ったかを知ることができます。
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-4xl">☕</div>
              <h3 className="text-lg font-bold">こだわりで選べる</h3>
              <p className="text-sm text-muted-foreground">
                産地・焙煎度・フレーバーで検索。
                あなたの好みに合った一杯が必ず見つかります。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
