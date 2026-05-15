# Chapter 4: 商品を並べよう — 理解度テスト

> コンポーネント、データ取得、動的ルーティング、フィルター、searchParams

---

## IT知識・概念理解

### 初級（絶対に抑えてほしい基礎知識）

**Q1.** Reactの「コンポーネント」とは何ですか？なぜコンポーネント単位でUIを構築するのですか？

<details><summary>回答</summary>

コンポーネントは、UIの**再利用可能な部品**です。HTMLの構造 + ロジック + スタイルをひとまとまりにしたもの。

コンポーネント単位で構築する理由:
1. **再利用性** — 同じUIパーツを複数箇所で使い回せる（例: ボタン、カード）
2. **保守性** — 変更が1箇所で済む。影響範囲が限定的
3. **可読性** — 大きなページを小さな部品に分割して理解しやすくする
4. **テスト容易性** — 部品単位でテストできる
</details>

**Q2.** `props` とは何ですか？`state` との違いを説明してください。

<details><summary>回答</summary>

- **props（プロパティ）** — 親コンポーネントから子コンポーネントに渡される**読み取り専用**のデータ。子は変更できない。
- **state（状態）** — コンポーネント内部で管理する**変更可能**なデータ。`useState` で定義する。

| | props | state |
|---|---|---|
| 変更 | 不可（読み取り専用） | 可能（setState） |
| 管理元 | 親コンポーネント | 自分自身 |
| 用途 | データの受け渡し | UIの動的変化 |

例: `<ProductCard product={data} />` の `product` はprops。カートに入れたかどうかの `isAdded` はstate。
</details>

**Q3.** Next.jsの動的ルーティングとは何ですか？`/products/[id]` のURLパターンで `id` をどう取得しますか？

<details><summary>回答</summary>

動的ルーティングは、URLの一部を**パラメータ**として受け取る仕組みです。

ディレクトリ構造:
```
app/products/[id]/page.tsx
```

`/products/123` にアクセスすると `id = "123"` が取得できます。

```typescript
// app/products/[id]/page.tsx
type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  // id を使ってデータ取得
  return <h1>商品ID: {id}</h1>;
}
```
</details>

**Q4.** `searchParams`（クエリパラメータ）とは何ですか？URLの `?category=coffee&sort=price` からどのようにデータを取得しますか？

<details><summary>回答</summary>

searchParamsはURLの `?` 以降に含まれるキー=値のペアです。フィルター、検索条件、ページ番号などに使います。

```typescript
// app/products/page.tsx
type Props = {
  searchParams: Promise<{ category?: string; sort?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const { category, sort } = await searchParams;
  // category = "coffee", sort = "price"

  return <div>カテゴリ: {category}, 並び替え: {sort}</div>;
}
```

特徴:
- ブックマーク可能（URLに含まれる）
- ブラウザの戻る/進むで状態が復元される
- サーバーサイドで直接アクセスできる
</details>

**Q5.** Next.jsの `<Image>` コンポーネントを使う理由は何ですか？通常の `<img>` タグとの違いを挙げてください。

<details><summary>回答</summary>

Next.jsの `<Image>` コンポーネントは画像を**自動最適化**します。

| 機能 | `<Image>` | `<img>` |
|------|-----------|---------|
| サイズ最適化 | デバイスに応じたサイズを自動生成 | 原寸のまま |
| フォーマット変換 | WebP/AVIFに自動変換 | 手動変換が必要 |
| 遅延読み込み | デフォルトで `lazy` | 手動設定が必要 |
| CLS防止 | `width`/`height` でスペース確保 | 画像読み込み時にレイアウトがずれる |
| キャッシュ | 自動キャッシュ | なし |
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q6.** Server Component でのデータ取得と、Client Component で `useEffect` を使ったデータ取得の違いを説明してください。

<details><summary>回答</summary>

**Server Component（推奨）:**
```typescript
// サーバーで実行。クライアントにJSを送らない
export default async function ProductsPage() {
  const products = await fetchProducts(); // サーバーで直接取得
  return <ProductList products={products} />;
}
```
- サーバー側でデータ取得 → HTMLとして送信
- 初回表示が速い（データ付きHTMLが届く）
- APIキーが露出しない
- SEOに有利（クローラーがデータを取得できる）

**Client Component（useEffect）:**
```typescript
"use client";
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(setProducts);
  }, []);
  return <ProductList products={products} />;
}
```
- ブラウザでJS実行後にデータ取得
- 初回はローディング表示（データなしHTMLが届く）
- ウォーターフォール問題（JS読み込み → 実行 → API呼び出し → 表示）
</details>

**Q7.** Next.jsで `loading.tsx` と `error.tsx` はそれぞれどのような役割ですか？Suspenseとの関係を説明してください。

<details><summary>回答</summary>

**`loading.tsx`:**
- 同じディレクトリの `page.tsx` がデータ取得中に表示される**ローディングUI**
- 内部的にReactの `<Suspense>` でラップされている
- ストリーミングSSRにより、ローディングUIを先にクライアントに送信

**`error.tsx`:**
- 同じディレクトリの `page.tsx` でエラーが発生した際に表示される**エラーUI**
- React Error Boundaryとして動作
- `"use client"` が必須（`reset` 関数でリトライできるため）

**Suspenseとの関係:**
```
layout.tsx
├── loading.tsx  ←  <Suspense fallback={<Loading />}>
└── page.tsx     ←    <Page />
                     </Suspense>
```

`loading.tsx` は `<Suspense>` の `fallback` と同じ。`page.tsx` のPromiseが解決するまで `loading.tsx` が表示されます。
</details>

**Q8.** コンポーネントの「コンポジション（合成）」とは何ですか？`children` propsの使い方を含めて説明してください。

<details><summary>回答</summary>

コンポジションは、コンポーネントを**組み合わせて**複雑なUIを構築する手法です。継承ではなく合成を使うのがReactの設計思想です。

**`children` props:**
```typescript
// コンテナコンポーネント
function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded shadow p-4">{children}</div>;
}

// 使う側 — 何でも中に入れられる
<Card>
  <h2>商品名</h2>
  <p>説明文</p>
</Card>

<Card>
  <img src="/photo.jpg" />
</Card>
```

メリット:
- コンポーネントが汎用的になる（中身を固定しない）
- propsのバケツリレー（prop drilling）を減らせる
- レイアウトとコンテンツの責任を分離できる
</details>

**Q9.** フィルター機能をURLのクエリパラメータ（`searchParams`）で管理するメリットは何ですか？クライアントの `useState` で管理する場合と比較してください。

<details><summary>回答</summary>

| 観点 | searchParams（URL） | useState（クライアント状態） |
|------|---------------------|---------------------------|
| **ブックマーク/共有** | URLに含まれるので共有可能 | 状態はURLに反映されない |
| **ブラウザ履歴** | 戻る/進むでフィルタ状態が復元 | リセットされる |
| **SSR対応** | Server Componentで直接参照可 | クライアント側でしか使えない |
| **SEO** | 検索エンジンがフィルタ付きページをインデックス可 | クローラーはフィルタを認識しない |
| **初回表示** | サーバーでフィルタ適用済みHTMLを返せる | ローディング後にフィルタ適用 |
| **複雑さ** | URLエンコード/デコードが必要 | シンプルなstate管理 |

推奨: **検索・フィルター・ページネーション → searchParams**、モーダル開閉・UIトグル → useState
</details>

**Q10.** 「データの取得」と「データの表示」を分離する設計の意味と効果を説明してください。

<details><summary>回答</summary>

データ取得と表示を分離する = **Container/Presentationalパターン**（RSC時代ではServer/Clientの分離）。

```typescript
// データ取得（Server Component）
async function ProductsPage() {
  const products = await getProducts(); // ← 取得
  return <ProductGrid products={products} />; // ← 表示に渡す
}

// データ表示（純粋なUI）
function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

**効果:**
1. **テスト容易性** — 表示コンポーネントはモックデータで簡単にテスト
2. **再利用性** — 表示コンポーネントは別のデータソースでも使える
3. **関心の分離** — 「どう取得するか」と「どう表示するか」を独立して変更可能
4. **パフォーマンス** — 表示コンポーネントがClient Componentでも、データ取得はサーバーで実行
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q11.** Next.jsの `generateStaticParams` は何をしますか？ISR（Incremental Static Regeneration）との違いも含めて説明してください。

<details><summary>回答</summary>

**`generateStaticParams`:**
動的ルート（`[id]`）に対して、ビルド時に静的生成するパラメータのリストを返す関数。

```typescript
// app/products/[id]/page.tsx
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map(p => ({ id: p.id }));
}
// → /products/1, /products/2, ... をビルド時に生成
```

**ISRとの違い:**

| | generateStaticParams | ISR (revalidate) |
|---|---|---|
| 生成タイミング | ビルド時 | ビルド時 + リクエスト時 |
| 新しいページ | ビルドし直さないと追加されない | 初回アクセス時に自動生成 |
| 更新方法 | 再ビルド | `revalidate` 秒数後に再生成 |
| 用途 | ページ数が固定・少量 | ページ数が動的・大量 |

```typescript
// ISR — 60秒ごとに再生成
export const revalidate = 60;
```

組み合わせも可能: `generateStaticParams` で主要ページをビルド時生成 + `dynamicParams = true` で未生成ページをオンデマンド生成。
</details>

**Q12.** `<Suspense>` の境界をどこに設置するかの設計判断基準を述べてください。粒度が細かすぎる場合と粗すぎる場合のデメリットも含めて。

<details><summary>回答</summary>

**設計判断基準:**
1. **独立したデータソースごと** — 異なるAPIから取得するセクションを個別にSuspense
2. **ユーザーの注目ポイント** — ファーストビュー（ATF）は即表示、下部は遅延OK
3. **エラーの影響範囲** — エラー時に巻き込まれる範囲を最小化

**粒度が細かすぎるデメリット:**
- ローディングスピナーが画面中に大量表示（「ポップコーンUI」問題）
- 各セクションが異なるタイミングで表示されてレイアウトが不安定
- ユーザーにちらつきを与える

**粒度が粗すぎるデメリット:**
- 1つの遅いデータ取得が全体をブロック
- 早く表示できる部分もローディングに巻き込まれる
- ユーザーの待ち時間が不必要に長くなる

**推奨パターン:**
```
<layout>            — 即表示（ヘッダー、ナビ）
  <Suspense>        — メインコンテンツ（商品一覧）
    <ProductList />
  </Suspense>
  <Suspense>        — サイドバー（カテゴリ一覧）
    <CategoryNav />
  </Suspense>
</layout>
```
</details>

**Q13.** ページネーションの「オフセット方式」と「カーソル方式」の違いを説明してください。それぞれの利点と問題点は？

<details><summary>回答</summary>

**オフセット方式:**
```sql
SELECT * FROM products ORDER BY id LIMIT 20 OFFSET 40;  -- 3ページ目
```
- 利点: 実装がシンプル。「全N件中X〜Y件目」が表示可能
- 問題: データが追加/削除されると表示がずれる。OFFSETが大きいと遅い（先頭からスキャン）

**カーソル方式:**
```sql
SELECT * FROM products WHERE id > 'last_seen_id' ORDER BY id LIMIT 20;
```
- 利点: データの追加/削除で表示がずれない。大量データでも一定速度
- 問題: 「N ページ目に飛ぶ」ができない。total count の取得が別途必要

| 観点 | オフセット | カーソル |
|------|-----------|---------|
| ページジャンプ | 可能 | 不可 |
| パフォーマンス | 後半ページで劣化 | 常に一定 |
| データ整合性 | ずれる可能性あり | 一貫性あり |
| 実装複雑度 | 低い | 中程度 |
| 適切な場面 | 管理画面、小規模データ | 無限スクロール、大規模データ |
</details>

**Q14.** Next.jsで画像の最適化戦略を設計してください。外部ストレージ（Supabase Storage）からの画像を扱う場合の考慮点も含めて。

<details><summary>回答</summary>

**1. next.config.js の設定:**
```javascript
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
};
```

**2. コンポーネント実装:**
```typescript
<Image
  src={`${SUPABASE_URL}/storage/v1/object/public/products/${imagePath}`}
  alt={product.name}
  width={400}
  height={300}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  placeholder="blur"
  blurDataURL={product.blurHash}  // 事前生成したプレースホルダー
  priority={isAboveTheFold}       // ファーストビューの画像はtrue
/>
```

**3. 考慮点:**
- **priority属性**: LCP（Largest Contentful Paint）の画像に設定
- **sizes属性**: ビューポートに応じた適切なサイズを指定（不要な大サイズ画像の読み込み防止）
- **プレースホルダー**: blurDataURLを事前生成してCLS防止
- **キャッシュ**: Supabase Storageのキャッシュヘッダー + Next.jsの画像キャッシュの二重キャッシュ
- **エラーハンドリング**: 画像読み込み失敗時のフォールバック画像を用意
</details>

**Q15.** `React.memo`、`useMemo`、`useCallback` の違いと、それぞれの適切な使用場面を説明してください。

<details><summary>回答</summary>

| | 目的 | メモ化する対象 |
|---|---|---|
| **React.memo** | コンポーネントの再レンダリングを防ぐ | コンポーネント自体 |
| **useMemo** | 高コストな計算結果をキャッシュ | 値 |
| **useCallback** | 関数の参照を保持 | 関数 |

**React.memo:**
```typescript
const ProductCard = React.memo(function ProductCard({ product }: Props) {
  return <div>{product.name}</div>;
});
// propsが変わらなければ再レンダリングしない
```
使用場面: リスト内の各アイテム、頻繁に再レンダリングされる親の子コンポーネント

**useMemo:**
```typescript
const filteredProducts = useMemo(
  () => products.filter(p => p.category === category).sort((a, b) => a.price - b.price),
  [products, category]
);
```
使用場面: フィルタリング・ソート・集計など重い計算

**useCallback:**
```typescript
const handleClick = useCallback((id: string) => {
  addToCart(id);
}, [addToCart]);
```
使用場面: `React.memo` の子コンポーネントに渡す関数（参照が変わると再レンダリングが発生するため）

**注意:** 過度な最適化は逆にパフォーマンスを悪化させる。まずプロファイリングで問題を特定してから適用する。
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q16.** ECサイトの商品一覧ページで、フィルター・ソート・ページネーションの状態管理を設計してください。URL駆動設計のメリットと実装の複雑さのトレードオフを議論してください。

<details><summary>回答</summary>

**URL駆動設計（推奨）:**
```
/products?category=coffee&roast=dark&sort=price-asc&page=2
```

**状態の流れ:**
1. ユーザーがフィルターを操作
2. `useRouter().push()` でURLを更新
3. Server Componentが `searchParams` からフィルター条件を取得
4. サーバーでフィルタ適用済みデータを返す

**メリット:**
- ブックマーク・URL共有可能
- ブラウザ履歴で状態が復元される
- SSRでフィルタ適用済みHTMLを返せる（SEO対応）
- サーバーでデータ取得を最適化できる（クライアントに全件渡さない）

**実装の複雑さ:**
1. URL↔状態の変換ロジックが必要（URLパース、バリデーション）
2. 複数フィルターの組み合わせ管理（追加・削除・リセット）
3. デフォルト値の扱い（URLに含めない場合の判断）
4. 履歴の管理（`push` vs `replace`）

**設計パターン:**
```typescript
// searchParamsのバリデーション + デフォルト値
function parseFilters(searchParams: Record<string, string | undefined>) {
  return {
    category: searchParams.category ?? "all",
    sort: (["price-asc", "price-desc", "newest"] as const)
      .includes(searchParams.sort as any) ? searchParams.sort : "newest",
    page: Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1),
  };
}
```

不正な `searchParams` に対するバリデーションとフォールバックを必ず実装する。
</details>

**Q17.** コンポーネント設計で「Atomic Design」と「Feature-based」の2つのアプローチを比較し、Next.jsプロジェクトでの推奨構成を提案してください。

<details><summary>回答</summary>

**Atomic Design:**
```
components/
├── atoms/        — Button, Input, Badge
├── molecules/    — SearchBar, ProductPrice
├── organisms/    — ProductCard, Header
├── templates/    — ProductListTemplate
└── pages/        — (App Routerでは不要)
```

**Feature-based:**
```
features/
├── products/
│   ├── components/  — ProductCard, ProductFilter
│   ├── hooks/       — useProducts, useFilter
│   ├── types/       — Product, Filter
│   └── actions/     — getProducts, createProduct
├── cart/
│   ├── components/
│   ├── hooks/
│   └── actions/
```

| 観点 | Atomic Design | Feature-based |
|------|---------------|---------------|
| 再利用性 | 高い（粒度が細かい） | 機能内で閉じがち |
| 発見しやすさ | 「このボタンどこ？」→ atoms | 「カート機能のコード全部」→ cart/ |
| スケーラビリティ | 5段階の分類判断が曖昧になる | 機能追加がディレクトリ追加で完結 |
| 削除容易性 | 依存が広範囲で削除しにくい | ディレクトリごと削除可能 |

**Next.jsでの推奨構成（ハイブリッド）:**
```
src/
├── app/              — ルーティング（薄く保つ）
├── components/
│   └── ui/           — 共通UIパーツ（Button, Input等）
├── features/
│   ├── products/     — 商品関連
│   └── cart/         — カート関連
├── lib/              — ユーティリティ、DB接続
└── types/            — 共通型定義
```

共通UIを `components/ui/` に、ビジネスロジック付きコンポーネントを `features/` に分離する。
</details>

**Q18.** 商品詳細ページ（`/products/[id]`）で存在しないIDにアクセスされた場合のエラーハンドリング戦略を設計してください。SEOへの影響も考慮してください。

<details><summary>回答</summary>

**実装:**
```typescript
// app/products/[id]/page.tsx
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound(); // 404ページを表示
  }

  return <ProductDetail product={product} />;
}
```

```typescript
// app/products/[id]/not-found.tsx
export default function ProductNotFound() {
  return (
    <div>
      <h1>商品が見つかりません</h1>
      <p>お探しの商品は存在しないか、削除された可能性があります。</p>
      <a href="/products">商品一覧に戻る</a>
    </div>
  );
}
```

**SEOへの影響と対策:**

| 対策 | 効果 |
|------|------|
| `notFound()` で404ステータスを返す | 検索エンジンがインデックスから除外 |
| `robots.txt` でクロール対象を制限 | 不要なページのクロールを防止 |
| `generateStaticParams` で有効なIDのみ生成 | 存在しないパスへの静的生成を防止 |
| カスタム404ページ | ユーザーを有効なページに誘導 |

**エッジケース:**
1. UUIDでないIDが渡された場合 → `notFound()` の前にバリデーション
2. 削除された商品 → 論理削除なら「この商品は販売終了しました」+ 類似商品表示
3. 一時的なDB障害 → `error.tsx` で「時間をおいて再度お試しください」
</details>

**Q19.** 大量の商品データ（10,000件以上）を扱うECサイトで、検索・フィルター性能を確保するための設計戦略を3つ提案してください。

<details><summary>回答</summary>

**戦略1: データベースレベルの最適化**
```sql
-- 複合インデックスの作成
CREATE INDEX idx_products_category_price
  ON products (category, price);

CREATE INDEX idx_products_search
  ON products USING GIN (to_tsvector('japanese', name || ' ' || description));
  -- 全文検索インデックス（日本語対応）
```
- WHERE句、ORDER BY句で使うカラムに適切なインデックス
- PostgreSQLの全文検索（FTS）で `LIKE '%keyword%'` を回避

**戦略2: サーバーサイドでのフィルタリング + ページネーション**
```typescript
// クライアントに全件送らない
const { data, count } = await supabase
  .from("products")
  .select("*", { count: "exact" })
  .eq("category", category)
  .gte("price", minPrice)
  .order("created_at", { ascending: false })
  .range(offset, offset + pageSize - 1);
```
- 必要な件数だけ取得（20〜50件/ページ）
- `count: "exact"` でトータル件数を取得（ページネーションUI用）

**戦略3: キャッシュ戦略**
```typescript
// Next.js のデータキャッシュ
const products = await fetch(url, {
  next: { revalidate: 60 }, // 60秒キャッシュ
});

// よく使われるフィルター条件の結果をキャッシュ
// unstable_cache（App Router）
import { unstable_cache } from "next/cache";

const getCachedProducts = unstable_cache(
  async (category: string) => getProducts(category),
  ["products"],
  { revalidate: 300 } // 5分キャッシュ
);
```

- ISRで商品一覧を定期的に再生成
- 人気カテゴリのクエリ結果をキャッシュ
- Supabase側でもクエリキャッシュを活用
</details>

**Q20.** Server ComponentとClient Componentの境界線をどこに引くべきですか？「Client Componentの最小化」原則を、商品一覧ページの具体例で説明してください。

<details><summary>回答</summary>

**原則:** Client Componentは**インタラクションが必要な最小単位**だけに使い、それ以外はServer Componentに留める。

**NG: ページ全体をClient Component**
```typescript
"use client"; // ← ページ全体がクライアント
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("all");
  // ... 全てクライアントで処理
}
```
問題: JSバンドル肥大化、SEO不利、初回表示遅延

**OK: 境界を適切に設計**
```
ProductsPage (Server)         ← データ取得
├── ProductFilter (Client)    ← フィルターUI（useState）
├── ProductGrid (Server)      ← 一覧表示（静的）
│   └── ProductCard (Server)  ← カード表示（静的）
│       └── AddToCartButton (Client) ← ボタン操作（onClick）
└── Pagination (Client)       ← ページ切替（router.push）
```

**実装例:**
```typescript
// Server Component — データ取得を担当
async function ProductsPage({ searchParams }) {
  const products = await getFilteredProducts(searchParams);
  return (
    <div>
      <ProductFilter currentFilter={searchParams.category} />  {/* Client */}
      <ProductGrid products={products} />                       {/* Server */}
      <Pagination total={products.total} page={searchParams.page} /> {/* Client */}
    </div>
  );
}

// Server Component — 表示のみ
function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(p => (
        <div key={p.id}>
          <Image ... />
          <h3>{p.name}</h3>
          <p>{p.price}円</p>
          <AddToCartButton productId={p.id} />  {/* 最小限のClient */}
        </div>
      ))}
    </div>
  );
}
```

Client Componentの境界を「葉」（末端）に押しやることで、大部分をServer Componentに保てます。
</details>

---

## コーディング・操作理解

### 初級（絶対に抑えてほしい基礎知識）

**Q1.** 以下のPropsの型定義を書いて、`ProductCard` コンポーネントを完成させてください。表示項目: 商品名、価格、画像URL。

<details><summary>回答</summary>

```typescript
type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <img src={product.imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.price.toLocaleString()}円</p>
    </div>
  );
}
```
</details>

**Q2.** 配列の `map` を使って商品リストを表示するコンポーネントを書いてください。`key` プロパティの役割も説明してください。

<details><summary>回答</summary>

```typescript
type Product = { id: string; name: string; price: number };

function ProductList({ products }: { products: Product[] }) {
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          {product.name} - {product.price}円
        </li>
      ))}
    </ul>
  );
}
```

**`key` の役割:**
- Reactがリストの各要素を**一意に識別**するために使用
- 要素の追加・削除・並べ替え時に、**最小限のDOM操作**で更新するため
- `key` がないと全要素を再レンダリングしてしまう（パフォーマンス低下）
- 配列のインデックス（`index`）をkeyに使うのは非推奨（並べ替え時にバグの原因）
</details>

**Q3.** Supabaseから商品一覧を取得してServer Componentで表示するコードを書いてください。

<details><summary>回答</summary>

```typescript
// app/products/page.tsx
import { createClient } from "@/lib/supabase/server";

export default async function ProductsPage() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, image_url")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("商品の取得に失敗しました");
  }

  return (
    <div>
      <h1>商品一覧</h1>
      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.price.toLocaleString()}円</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```
</details>

**Q4.** Next.jsの `<Link>` コンポーネントを使って、商品一覧から商品詳細ページへの遷移を実装してください。

<details><summary>回答</summary>

```typescript
import Link from "next/link";

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="border rounded-lg p-4 hover:shadow-lg transition">
        <h3>{product.name}</h3>
        <p>{product.price.toLocaleString()}円</p>
      </div>
    </Link>
  );
}
```

**`<Link>` の特徴:**
- クライアントサイドナビゲーション（ページ全体のリロードなし）
- プリフェッチ（ビューポート内のリンク先を事前読み込み）
- `<a>` タグとしてレンダリングされる（SEO対応）
</details>

**Q5.** 条件付きレンダリングの3つの方法を、コード例で示してください。

<details><summary>回答</summary>

```typescript
// 1. 三項演算子 — 2つの選択肢がある場合
{isLoggedIn ? <UserMenu /> : <LoginButton />}

// 2. 論理AND演算子 — 表示/非表示の切り替え
{products.length > 0 && <ProductList products={products} />}

// 3. 早期リターン — コンポーネント全体の切り替え
function ProductDetail({ product }: { product: Product | null }) {
  if (!product) {
    return <p>商品が見つかりません</p>;
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.price}円</p>
    </div>
  );
}
```

注意: `&&` 演算子で数値 `0` を使うと意図せず `0` が表示される。`{count && <Badge />}` は `{count > 0 && <Badge />}` にする。
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q6.** カテゴリでフィルターする機能を `searchParams` を使って実装してください（Server Component + Client Component の組み合わせ）。

<details><summary>回答</summary>

```typescript
// app/products/page.tsx (Server Component)
import { createClient } from "@/lib/supabase/server";
import { CategoryFilter } from "./category-filter";

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("products").select("*");
  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data: products } = await query.order("created_at", { ascending: false });

  return (
    <div>
      <CategoryFilter currentCategory={category ?? "all"} />
      <div className="grid grid-cols-3 gap-4">
        {products?.map((p) => (
          <div key={p.id}>{p.name}</div>
        ))}
      </div>
    </div>
  );
}
```

```typescript
// app/products/category-filter.tsx (Client Component)
"use client";

import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIES = ["all", "coffee", "tea", "equipment"];

export function CategoryFilter({ currentCategory }: { currentCategory: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => handleChange(cat)}
          className={currentCategory === cat ? "font-bold" : ""}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
```
</details>

**Q7.** 商品詳細ページの動的ルーティングを実装してください。Supabaseからデータを取得し、存在しない場合は404を返すようにしてください。

<details><summary>回答</summary>

```typescript
// app/products/[id]/page.tsx
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <div>
      <Image
        src={product.image_url}
        alt={product.name}
        width={600}
        height={400}
      />
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p className="text-2xl font-bold">
        {product.price.toLocaleString()}円
      </p>
    </div>
  );
}
```
</details>

**Q8.** `loading.tsx` と `error.tsx` を実装してください。

<details><summary>回答</summary>

```typescript
// app/products/loading.tsx
export default function ProductsLoading() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 h-48 rounded-lg" />
          <div className="bg-gray-200 h-4 mt-2 rounded w-3/4" />
          <div className="bg-gray-200 h-4 mt-1 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
```

```typescript
// app/products/error.tsx
"use client"; // 必須

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="text-center py-10">
      <h2>エラーが発生しました</h2>
      <p className="text-gray-600 mt-2">
        商品の読み込みに失敗しました。
      </p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        再試行
      </button>
    </div>
  );
}
```

`error.tsx` は `"use client"` が必須です。`reset()` 関数はServer Componentの再レンダリングを試みます。
</details>

**Q9.** TypeScriptのジェネリクスを使って、汎用的なリスト表示コンポーネントを作成してください。

<details><summary>回答</summary>

```typescript
type ListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
};

export function List<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = "データがありません",
}: ListProps<T>) {
  if (items.length === 0) {
    return <p className="text-gray-500 text-center">{emptyMessage}</p>;
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

// 使用例
<List
  items={products}
  keyExtractor={(p) => p.id}
  renderItem={(product) => (
    <div>{product.name} - {product.price}円</div>
  )}
  emptyMessage="商品がありません"
/>
```
</details>

**Q10.** 価格のフォーマット関数を作成してください。`1234` → `¥1,234`、`0` → `無料`、`null/undefined` → `価格未定` のように変換します。

<details><summary>回答</summary>

```typescript
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) {
    return "価格未定";
  }

  if (price === 0) {
    return "無料";
  }

  return `¥${price.toLocaleString("ja-JP")}`;
}

// テスト
console.log(formatPrice(1234));      // "¥1,234"
console.log(formatPrice(0));         // "無料"
console.log(formatPrice(null));      // "価格未定"
console.log(formatPrice(undefined)); // "価格未定"
console.log(formatPrice(100000));    // "¥100,000"
```

Intl.NumberFormat を使う場合:
```typescript
const formatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
});

export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "価格未定";
  if (price === 0) return "無料";
  return formatter.format(price); // "￥1,234"
}
```
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q11.** 複数のフィルター条件（カテゴリ、価格帯、並び替え）を組み合わせた商品一覧のクエリビルダーを実装してください。

<details><summary>回答</summary>

```typescript
// lib/queries/products.ts
import { createClient } from "@/lib/supabase/server";

type ProductFilters = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price-asc" | "price-desc" | "newest" | "name";
  page?: number;
  pageSize?: number;
  search?: string;
};

export async function getFilteredProducts(filters: ProductFilters) {
  const supabase = await createClient();
  const {
    category,
    minPrice,
    maxPrice,
    sort = "newest",
    page = 1,
    pageSize = 20,
    search,
  } = filters;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" });

  // フィルター適用
  if (category && category !== "all") {
    query = query.eq("category", category);
  }
  if (minPrice !== undefined) {
    query = query.gte("price", minPrice);
  }
  if (maxPrice !== undefined) {
    query = query.lte("price", maxPrice);
  }
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  // ソート適用
  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
  }

  // ページネーション
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error("商品の取得に失敗しました");

  return {
    products: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}
```
</details>

**Q12.** 無限スクロール（Infinite Scroll）をClient Componentで実装してください。Intersection Observer APIを使用してください。

<details><summary>回答</summary>

```typescript
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Product = { id: string; name: string; price: number };

export function InfiniteProductList({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const PAGE_SIZE = 20;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const nextPage = page + 1;
    const from = (nextPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("products")
      .select("id, name, price")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      setProducts((prev) => [...prev, ...data]);
      setPage(nextPage);
      if (data.length < PAGE_SIZE) setHasMore(false);
    }

    setLoading(false);
  }, [page, loading, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id}>{p.name} - {p.price}円</div>
        ))}
      </div>

      {/* 監視対象の要素 */}
      <div ref={observerRef} className="h-10">
        {loading && <p>読み込み中...</p>}
        {!hasMore && <p>全ての商品を表示しました</p>}
      </div>
    </div>
  );
}
```
</details>

**Q13.** `searchParams` のバリデーション関数を型安全に実装してください。不正な値が渡された場合はデフォルト値にフォールバックしてください。

<details><summary>回答</summary>

```typescript
// lib/validations/search-params.ts

const VALID_CATEGORIES = ["all", "coffee", "tea", "equipment"] as const;
const VALID_SORTS = ["price-asc", "price-desc", "newest", "name"] as const;

type Category = (typeof VALID_CATEGORIES)[number];
type Sort = (typeof VALID_SORTS)[number];

type ValidatedParams = {
  category: Category;
  sort: Sort;
  page: number;
  search: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
};

export function validateSearchParams(
  params: Record<string, string | string[] | undefined>
): ValidatedParams {
  // カテゴリ
  const rawCategory = typeof params.category === "string" ? params.category : "all";
  const category: Category = VALID_CATEGORIES.includes(rawCategory as Category)
    ? (rawCategory as Category)
    : "all";

  // ソート
  const rawSort = typeof params.sort === "string" ? params.sort : "newest";
  const sort: Sort = VALID_SORTS.includes(rawSort as Sort)
    ? (rawSort as Sort)
    : "newest";

  // ページ番号（1以上の整数）
  const rawPage = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

  // 検索キーワード（XSS対策: サニタイズ）
  const search = typeof params.search === "string"
    ? params.search.trim().slice(0, 100)  // 最大100文字
    : "";

  // 価格帯
  const parsePrice = (value: unknown): number | undefined => {
    if (typeof value !== "string") return undefined;
    const num = parseInt(value, 10);
    return Number.isFinite(num) && num >= 0 ? num : undefined;
  };

  return {
    category,
    sort,
    page,
    search,
    minPrice: parsePrice(params.minPrice),
    maxPrice: parsePrice(params.maxPrice),
  };
}
```
</details>

**Q14.** レスポンシブ対応の商品グリッドを Tailwind CSS で実装してください。モバイル1列、タブレット2列、デスクトップ3列で表示してください。

<details><summary>回答</summary>

```typescript
import Image from "next/image";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
};

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>商品が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="group block"
        >
          <div className="overflow-hidden rounded-lg border border-gray-200
                          transition-shadow hover:shadow-lg">
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform
                           group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <span className="text-xs text-gray-500 uppercase">
                {product.category}
              </span>
              <h3 className="mt-1 text-lg font-semibold truncate">
                {product.name}
              </h3>
              <p className="mt-2 text-xl font-bold">
                ¥{product.price.toLocaleString()}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
```

レスポンシブのブレークポイント:
- `grid-cols-1` — デフォルト（モバイル）: 1列
- `md:grid-cols-2` — 768px以上（タブレット）: 2列
- `lg:grid-cols-3` — 1024px以上（デスクトップ）: 3列
</details>

**Q15.** 動的ルートのメタデータを生成する `generateMetadata` 関数を実装してください。商品名、説明、OGP画像を含めてください。

<details><summary>回答</summary>

```typescript
// app/products/[id]/page.tsx
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("name, description, image_url")
    .eq("id", id)
    .single();

  if (!product) {
    return {
      title: "商品が見つかりません",
    };
  }

  return {
    title: `${product.name} | Coffee Shop`,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description,
      images: [
        {
          url: product.image_url,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: [product.image_url],
    },
  };
}
```

注意: `generateMetadata` と `page` コンポーネントで同じデータを取得する場合、Next.jsが自動的にリクエストを重複排除（deduplicate）するため、2回DBアクセスが発生することはありません。
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q16.** 商品一覧ページのパフォーマンスを計測・改善するためのチェックリストを作成してください。Core Web Vitals の各指標と対策を含めてください。

<details><summary>回答</summary>

**Core Web Vitals チェックリスト:**

| 指標 | 目標値 | 計測方法 | 対策 |
|------|--------|----------|------|
| **LCP** (Largest Contentful Paint) | < 2.5秒 | Lighthouse, PageSpeed Insights | メイン画像に `priority` 属性。Server Componentでデータ取得 |
| **INP** (Interaction to Next Paint) | < 200ms | Chrome DevTools Performance | イベントハンドラの軽量化。重い処理は `useTransition` で |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Lighthouse | Image に `width`/`height` 指定。フォントの `font-display: swap` |

**パフォーマンス改善チェックリスト:**

```
□ 画像最適化
  □ Next.js <Image> を使用
  □ sizes 属性で適切なサイズ指定
  □ LCP画像に priority 設定
  □ 適切なフォーマット（WebP/AVIF）

□ データ取得
  □ Server Componentでデータ取得
  □ ページネーションで必要分だけ取得
  □ SELECTで必要カラムのみ指定
  □ 適切なインデックス設定

□ バンドルサイズ
  □ Client Componentの最小化
  □ dynamic import で遅延読み込み
  □ Bundle Analyzerで不要な依存を特定

□ キャッシュ
  □ revalidate の適切な設定
  □ CDNキャッシュヘッダーの設定
  □ Supabase クエリキャッシュ

□ レンダリング
  □ Suspenseで段階的表示
  □ React.memo で不要な再レンダリング防止
  □ 仮想スクロール（大量データの場合）
```
</details>

**Q17.** コンポーネントのテスタビリティ（テストのしやすさ）を高めるための設計原則を5つ挙げ、商品カードコンポーネントを例に説明してください。

<details><summary>回答</summary>

**原則1: 純粋関数コンポーネントにする**
```typescript
// NG: 内部でデータ取得
function ProductCard() {
  const [product, setProduct] = useState(null);
  useEffect(() => { fetchProduct().then(setProduct); }, []);
}

// OK: propsでデータを受け取る
function ProductCard({ product }: { product: Product }) {
  return <div>{product.name}</div>;
}
```

**原則2: 副作用を分離する**
```typescript
// NG: コンポーネント内でロジックを実装
function ProductCard({ product }: Props) {
  const handleAddToCart = async () => {
    await fetch("/api/cart", { method: "POST", body: JSON.stringify({ productId: product.id }) });
  };
}

// OK: コールバックをpropsで受け取る
function ProductCard({ product, onAddToCart }: Props) {
  return <button onClick={() => onAddToCart(product.id)}>カートに追加</button>;
}
```

**原則3: 条件分岐を明示的にする**
- 各状態（ローディング、エラー、空、データあり）を個別にテスト可能に

**原則4: アクセシビリティ属性を付与する**
- `role`, `aria-label` でテストからの要素特定を容易にする

**原則5: 型を厳密にする**
- `any` を使わず、propsの型を明確に定義 → テスト時のモックデータ作成が容易
</details>

**Q18.** `searchParams` の変更時に不要なサーバーリクエストを防ぐデバウンス実装を行い、さらにURLの即座更新（楽観的UI更新）も実現してください。

<details><summary>回答</summary>

```typescript
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useRef, useTransition, useCallback } from "react";

export function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [value, setValue] = useState(searchParams.get("search") ?? "");
  const timerRef = useRef<NodeJS.Timeout>();

  const updateURL = useCallback(
    (searchValue: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (searchValue) {
        params.set("search", searchValue);
      } else {
        params.delete("search");
      }

      // ページ番号をリセット
      params.delete("page");

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue); // 入力は即座に反映（楽観的UI）

    // デバウンス: 300ms 入力が止まったらURL更新
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      updateURL(newValue);
    }, 300);
  };

  // クリーンアップ
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="商品を検索..."
        className="w-full px-4 py-2 border rounded-lg"
      />
      {isPending && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          ⏳
        </span>
      )}
    </div>
  );
}
```

ポイント:
- `setValue` で入力フィールドを即座に更新（楽観的UI）
- `setTimeout` でデバウンス（300ms）
- `startTransition` で遷移中のUIフィードバック
- `router.replace` で履歴を汚さない
</details>

**Q19.** 商品データのキャッシュ戦略を設計してください。「商品一覧は5分キャッシュ、商品詳細は1時間キャッシュ、価格変更時は即時反映」という要件を満たしてください。

<details><summary>回答</summary>

```typescript
// lib/queries/products.ts
import { unstable_cache, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// 商品一覧: 5分キャッシュ + タグ付き
export const getProducts = unstable_cache(
  async (category?: string) => {
    const supabase = await createClient();
    let query = supabase.from("products").select("id, name, price, image_url, category");
    if (category) query = query.eq("category", category);
    const { data } = await query.order("created_at", { ascending: false });
    return data ?? [];
  },
  ["products-list"],
  { revalidate: 300, tags: ["products"] }  // 5分
);

// 商品詳細: 1時間キャッシュ + 個別タグ
export const getProduct = unstable_cache(
  async (id: string) => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    return data;
  },
  ["product-detail"],
  { revalidate: 3600, tags: ["products"] }  // 1時間
);

// 価格変更時の即時反映（Server Action or API Route）
export async function updateProductPrice(productId: string, newPrice: number) {
  const supabase = await createClient();
  await supabase
    .from("products")
    .update({ price: newPrice })
    .eq("id", productId);

  // キャッシュを即時無効化
  revalidateTag("products");
}
```

```typescript
// app/api/revalidate/route.ts — Webhook用
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("products");
  return NextResponse.json({ revalidated: true });
}
```

管理画面で価格変更 → `revalidateTag("products")` で全キャッシュを即時無効化 → 次のリクエストで新しいデータを取得・キャッシュ。
</details>

**Q20.** アクセシビリティ（a11y）を考慮した商品一覧コンポーネントを設計してください。スクリーンリーダー対応、キーボード操作、ARIA属性を含めてください。

<details><summary>回答</summary>

```typescript
import Image from "next/image";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
};

export function AccessibleProductGrid({
  products,
  totalCount,
}: {
  products: Product[];
  totalCount: number;
}) {
  return (
    <section aria-label="商品一覧">
      {/* スクリーンリーダー向けの件数情報 */}
      <p className="sr-only" role="status" aria-live="polite">
        {totalCount}件の商品が見つかりました。{products.length}件を表示中です。
      </p>

      <ul
        role="list"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {products.map((product) => (
          <li key={product.id} role="listitem">
            <Link
              href={`/products/${product.id}`}
              className="block rounded-lg border p-4
                         focus-visible:outline-2 focus-visible:outline-offset-2
                         focus-visible:outline-blue-600
                         hover:shadow-lg transition"
              aria-label={`${product.name}、${product.price.toLocaleString()}円${
                product.stock === 0 ? "、在庫切れ" : ""
              }`}
            >
              <div className="relative aspect-square">
                <Image
                  src={product.imageUrl}
                  alt=""  // 装飾画像（リンクのaria-labelで説明済み）
                  fill
                  className="object-cover rounded"
                />
                {product.stock === 0 && (
                  <div
                    className="absolute inset-0 bg-black/50 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="text-white font-bold">SOLD OUT</span>
                  </div>
                )}
              </div>

              <div className="mt-3">
                <span className="text-xs text-gray-500" aria-hidden="true">
                  {product.category}
                </span>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-xl font-bold mt-1">
                  <span className="sr-only">価格</span>
                  ¥{product.price.toLocaleString()}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

**アクセシビリティ対応ポイント:**
1. `aria-label` でリンクの説明を完全に提供
2. `aria-live="polite"` でフィルター変更時に件数をアナウンス
3. `focus-visible` でキーボードフォーカスの視覚的フィードバック
4. `sr-only` クラスでスクリーンリーダー専用テキスト
5. 装飾画像は `alt=""` で読み上げを抑制
6. 在庫切れ状態を `aria-label` に含める
</details>
