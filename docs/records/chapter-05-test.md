# Chapter 5: 「買う」を実現しよう — 理解度テスト

> カート、Server Actions、Stripe、Webhook、署名検証、楽観的ロック

---

## IT知識・概念理解

### 初級（絶対に抑えてほしい基礎知識）

**Q1.** ECサイトの「カート」機能とは何ですか？カートのデータはどこに保存すべきですか？

<details><summary>回答</summary>

カートは、ユーザーが購入予定の商品を**一時的に保管**する機能です。

データの保存場所の選択肢:

| 保存場所 | メリット | デメリット |
|----------|---------|----------|
| **データベース** | デバイス間で同期、永続化 | 認証が必要、DB負荷 |
| **localStorage** | 認証不要、実装が簡単 | デバイス間で同期できない |
| **Cookie** | サーバーサイドで参照可能 | 容量制限（4KB）、リクエストサイズ増加 |

推奨: **ログインユーザーはDB保存、ゲストはlocalStorage** → ログイン時にマージするパターン。
</details>

**Q2.** Server Actions とは何ですか？API Route（`route.ts`）との違いを説明してください。

<details><summary>回答</summary>

Server Actionsは、Next.jsの機能で、**クライアントから直接呼び出せるサーバーサイド関数**です。

```typescript
"use server";

export async function addToCart(productId: string) {
  // サーバーで実行される
  await db.cart.insert({ productId, userId: auth.userId });
}
```

**API Route との違い:**

| 観点 | Server Actions | API Route |
|------|---------------|-----------|
| 定義 | `"use server"` の関数 | `route.ts` のHTTPハンドラ |
| 呼び出し | 関数呼び出し（RPC） | `fetch("/api/xxx")` |
| 型安全性 | 引数・戻り値に型あり | リクエスト/レスポンスの型は手動 |
| フォーム連携 | `<form action={fn}>` で直接呼び出し | JS なしでは使えない |
| 用途 | データ変更（mutation） | 外部連携、Webhook受信 |
</details>

**Q3.** Stripeとは何ですか？ECサイトでStripeを使う理由を3つ挙げてください。

<details><summary>回答</summary>

Stripeは**オンライン決済プラットフォーム**です。クレジットカードなどの決済処理を代行します。

Stripeを使う理由:
1. **PCI DSS準拠が不要** — カード情報をStripeが管理するため、自社サーバーにカード番号を保存しなくてよい（セキュリティ）
2. **豊富な決済手段** — クレジットカード、Apple Pay、Google Pay、コンビニ払い等をAPIで一括管理
3. **開発者フレンドリー** — 優れたAPIドキュメント、テスト環境、Webhook対応
</details>

**Q4.** Webhookとは何ですか？なぜECサイトでWebhookが必要ですか？

<details><summary>回答</summary>

Webhookは、外部サービスから自分のサーバーに**イベント発生時にHTTPリクエストを送信**してもらう仕組みです（逆API）。

**通常のAPI:** アプリ → 外部サービス（能動的に問い合わせ）
**Webhook:** 外部サービス → アプリ（イベント発生時に通知）

**ECサイトで必要な理由:**
- 決済完了をリアルタイムに検知（Stripeが決済完了を通知してくれる）
- ポーリング（定期的に問い合わせ）は非効率
- 決済処理はStripeのサーバーで行われるため、結果を受け取る必要がある

例: ユーザーがカード決済完了 → Stripe が `/api/webhook` にPOST → 注文確定処理
</details>

**Q5.** 「楽観的ロック」とは何ですか？ECサイトの在庫管理でなぜ必要ですか？

<details><summary>回答</summary>

楽観的ロックは、データ更新時に**他の人が先に変更していないかを確認**する仕組みです。「たぶん競合しないだろう」と楽観的に考え、実際に競合した場合のみエラーにします。

**在庫管理での必要性:**
- 人気商品に複数ユーザーが同時に購入ボタンを押した場合
- 在庫10個 → AさんとBさんが同時に購入 → 在庫を-1する処理が競合
- 楽観的ロックがないと「在庫0なのに11件売れた」という**在庫割れ**が発生

```sql
-- 楽観的ロックの例
UPDATE products
SET stock = stock - 1, updated_at = now()
WHERE id = 'xxx' AND stock > 0 AND updated_at = '前回読んだ時のupdated_at';
-- 0行更新 = 競合発生 → リトライ or エラー
```
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q6.** Stripeの決済フロー（Checkout Session）を、ユーザー・アプリサーバー・Stripeの3者間で説明してください。

<details><summary>回答</summary>

1. **ユーザー** が「購入する」ボタンをクリック
2. **アプリサーバー** がStripe APIで **Checkout Session** を作成（商品、金額、成功/キャンセルURLを指定）
3. **Stripe** がセッションURLを返す
4. **アプリ** がユーザーを **Stripeの決済ページ** にリダイレクト
5. **ユーザー** がカード情報を入力して決済（カード情報はStripeのサーバーにのみ送信）
6. **Stripe** が決済を処理し、**成功URL** にユーザーをリダイレクト
7. **Stripe** が **Webhook** でアプリサーバーに決済完了を通知（`checkout.session.completed`）
8. **アプリサーバー** がWebhookを受けて注文を確定

ポイント: ステップ6の成功URLリダイレクトだけでは不十分（ユーザーがブラウザを閉じる可能性）。**Webhook（ステップ7）で確実に注文確定する**。
</details>

**Q7.** Webhookの「署名検証」とは何ですか？なぜ必要ですか？

<details><summary>回答</summary>

署名検証は、Webhookリクエストが**本当にStripeから送信されたものかを確認する**仕組みです。

**なぜ必要か:**
- Webhookエンドポイント（`/api/webhook`）は公開URLなので、誰でもアクセスできる
- 攻撃者が偽の「決済完了」リクエストを送れば、支払いなしで商品を入手できる

**仕組み:**
1. Stripeがリクエストボディ + タイムスタンプ + シークレットキーで**HMAC署名**を生成
2. 署名を `Stripe-Signature` ヘッダーに含めて送信
3. アプリ側でも同じ計算を行い、署名が一致するか検証
4. 一致しない = 偽のリクエスト → 拒否

```typescript
const event = stripe.webhooks.constructEvent(
  body,          // リクエストボディ（生データ）
  signature,     // Stripe-Signature ヘッダー
  webhookSecret  // ダッシュボードで取得したシークレット
);
```
</details>

**Q8.** Server Actions で `revalidatePath` と `revalidateTag` を使う場面をそれぞれ説明してください。

<details><summary>回答</summary>

**`revalidatePath`:**
- 特定のURLパスに関連するキャッシュを無効化
- そのパスの**全データ**が再取得される

```typescript
"use server";

export async function addToCart(productId: string) {
  await insertCartItem(productId);
  revalidatePath("/cart"); // カートページのキャッシュを無効化
}
```

**`revalidateTag`:**
- 特定のタグが付けられたキャッシュを無効化
- **複数ページにまたがるデータ**の更新に便利

```typescript
"use server";

export async function updateProduct(id: string, data: ProductUpdate) {
  await updateProductInDB(id, data);
  revalidateTag("products"); // 商品関連の全キャッシュを無効化
  // → 商品一覧、商品詳細、カート内の商品表示が全て更新される
}
```

**使い分け:**
- 1ページだけ更新 → `revalidatePath`
- 複数ページに影響する更新 → `revalidateTag`
</details>

**Q9.** トランザクション処理がECサイトの注文処理で必要な理由を、具体的なシナリオで説明してください。

<details><summary>回答</summary>

**シナリオ: 注文確定処理**
1. 在庫を減らす（`UPDATE products SET stock = stock - 1`）
2. 注文レコードを作成（`INSERT INTO orders ...`）
3. 注文明細を作成（`INSERT INTO order_items ...`）
4. カートを空にする（`DELETE FROM cart_items ...`）

**トランザクションがない場合の問題:**
- ステップ1成功 → ステップ2でエラー → **在庫は減ったのに注文が作られない**
- ユーザーは商品を受け取れず、在庫だけ減った状態に

**トランザクションがある場合:**
```sql
BEGIN;
  UPDATE products SET stock = stock - 1 WHERE id = 'xxx';
  INSERT INTO orders (...) VALUES (...);
  INSERT INTO order_items (...) VALUES (...);
  DELETE FROM cart_items WHERE user_id = 'yyy';
COMMIT;
-- どれか1つでも失敗 → ROLLBACK で全て元に戻る
```

全ステップが成功 → COMMIT、1つでも失敗 → ROLLBACK で**データの整合性を保証**。
</details>

**Q10.** 「冪等性（べきとうせい / Idempotency）」とは何ですか？Webhook処理でなぜ重要ですか？

<details><summary>回答</summary>

冪等性とは、**同じ操作を何回実行しても結果が同じ**になる性質です。

**Webhook処理での重要性:**
- Stripeはレスポンスを受け取れなかった場合、同じWebhookを**複数回再送**する
- 冪等性がないと「同じ決済で2回注文が作成される」問題が発生

**冪等でない処理（NG）:**
```typescript
// 同じWebhookが2回来たら注文が2件作られる
async function handlePayment(sessionId: string) {
  await db.orders.insert({ sessionId, status: "paid" });
}
```

**冪等な処理（OK）:**
```typescript
// stripe_session_id で既存チェック → 重複を防止
async function handlePayment(sessionId: string) {
  const existing = await db.orders.findBySessionId(sessionId);
  if (existing) return; // 既に処理済み → スキップ

  await db.orders.insert({ sessionId, status: "paid" });
}
```

Webhookだけでなく、ネットワーク障害でのリトライやユーザーの二重クリック対策としても冪等性は重要です。
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q11.** Stripe Checkout と Stripe Elements（カスタム決済フォーム）のトレードオフを比較してください。

<details><summary>回答</summary>

| 観点 | Checkout（リダイレクト型） | Elements（埋め込み型） |
|------|--------------------------|----------------------|
| **実装コスト** | 低い（数行のコード） | 高い（フォームUI自作） |
| **UIカスタマイズ** | 限定的（色・ロゴ程度） | 完全自由 |
| **UX** | Stripeページに遷移 | サイト内で完結 |
| **PCI DSS** | Stripe側で完結 | SAQ A準拠が必要（限定的） |
| **決済手段** | Stripe側で自動対応 | 手動で各決済手段を実装 |
| **コンバージョン** | 遷移で離脱リスク | サイト内完結で離脱少 |
| **モバイル対応** | Stripeが最適化済み | 自分で対応が必要 |

**推奨:**
- 小〜中規模ECサイト → **Checkout**（速く安全に実装、決済手段も豊富）
- 大規模・ブランド重視 → **Elements**（ブランドの世界観を維持）
- MVP/最初のリリース → **Checkout**（後からElementsに移行可能）
</details>

**Q12.** カートの「競合状態」にはどのような種類がありますか？3つのシナリオとその対策を説明してください。

<details><summary>回答</summary>

**シナリオ1: 在庫の競合**
- AさんとBさんが同時に在庫1の商品を購入
- 対策: 楽観的ロック + 在庫チェックのatomic operation
```sql
UPDATE products SET stock = stock - 1
WHERE id = 'xxx' AND stock > 0;
-- 0行更新なら在庫切れ
```

**シナリオ2: 価格変更との競合**
- カートに商品を入れた後、管理者が価格を変更
- ユーザーはカート追加時の価格で購入してしまう
- 対策: 決済時にDBの最新価格を再取得し、カート表示時の価格と比較
```typescript
const currentPrice = await getProductPrice(productId);
if (currentPrice !== cartItem.price) {
  throw new Error("価格が変更されました。カートを更新してください");
}
```

**シナリオ3: 同一ユーザーの複数デバイス競合**
- PCとスマホで同時にカートを操作
- PCで追加した商品がスマホに反映されない
- 対策: DBベースのカート管理 + リアルタイム同期 or ページアクセス時に最新取得
```typescript
// カートページ表示時にDBから最新を取得（キャッシュなし）
export const dynamic = "force-dynamic";
```
</details>

**Q13.** Stripeの「テスト環境」と「本番環境」の切り替えで注意すべき点を5つ挙げてください。

<details><summary>回答</summary>

| 注意点 | 詳細 |
|--------|------|
| **1. APIキーの切り替え** | テスト: `sk_test_xxx` → 本番: `sk_live_xxx`。環境変数で切り替え |
| **2. Webhookの再登録** | テスト用Webhookと本番用Webhookは別。本番URLで新規登録が必要 |
| **3. Webhook Secretの更新** | テスト用と本番用で `whsec_` が異なる。環境変数を必ず更新 |
| **4. テストカード番号が使えない** | `4242 4242 4242 4242` は本番では使えない。本物のカードが必要 |
| **5. Stripe Dashboardの切り替え** | ダッシュボード上部の「Test mode」トグルで切り替え。データは完全に分離 |

**追加の注意:**
- 本番の `sk_live_xxx` をフロントエンドに露出させない
- Stripe CLIでの `stripe listen --forward-to` は開発環境のみ
- 本番移行前に Stripe の「Go Live」チェックリストを確認
</details>

**Q14.** 注文処理で「二重購入」を防ぐ方法を3つのレイヤーで説明してください。

<details><summary>回答</summary>

**レイヤー1: フロントエンド（UX対策）**
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handlePurchase = async () => {
  if (isSubmitting) return;  // 二重クリック防止
  setIsSubmitting(true);
  try {
    await createCheckoutSession();
  } finally {
    setIsSubmitting(false);
  }
};

<button disabled={isSubmitting}>
  {isSubmitting ? "処理中..." : "購入する"}
</button>
```

**レイヤー2: サーバーサイド（冪等性キー）**
```typescript
// Stripe の idempotency_key を使用
const session = await stripe.checkout.sessions.create(
  { /* パラメータ */ },
  { idempotencyKey: `order_${userId}_${cartHash}` }
);
```

**レイヤー3: データベース（制約）**
```sql
-- stripe_session_id にユニーク制約
CREATE UNIQUE INDEX unique_order_session
  ON orders (stripe_session_id);

-- 同じセッションIDで2回INSERTしようとするとエラー
```

3つのレイヤーで防御することで、フロントのバグ・ネットワーク障害・Webhookの重複配信のいずれでも二重購入を防止できます。
</details>

**Q15.** 決済後の「成功ページ」で注文情報を表示する際、`searchParams` の `session_id` だけに頼るのが危険な理由を説明してください。

<details><summary>回答</summary>

**危険な理由:**
- `session_id` はURLに含まれるため、**誰でもURLを手入力・改ざんできる**
- 他人の `session_id` を推測・盗聴されると、その人の注文情報が見えてしまう
- Webhookがまだ到着していない段階でアクセスされると、注文が確定していない可能性がある

**NG:**
```typescript
// session_id だけで注文情報を表示
const session = await stripe.checkout.sessions.retrieve(sessionId);
return <div>注文完了！合計: {session.amount_total}円</div>;
```

**OK:**
```typescript
// 1. session_id からセッションを取得
const session = await stripe.checkout.sessions.retrieve(sessionId);

// 2. セッションの顧客IDと、ログインユーザーが一致するか検証
const user = await supabase.auth.getUser();
if (session.metadata?.userId !== user.id) {
  redirect("/"); // 不正アクセス
}

// 3. DB上の注文ステータスも確認（Webhook到着済みか）
const order = await getOrderBySessionId(sessionId);
if (!order || order.status !== "paid") {
  // Webhook未到着 → ポーリングまたは「処理中」表示
  return <div>注文を処理中です...</div>;
}
```

ユーザー認証 + DB上の注文存在確認 の二重チェックが必要です。
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q16.** ECサイトの注文処理アーキテクチャを設計してください。「カート確認 → 決済 → 注文確定 → メール通知」の各ステップで、失敗した場合のリカバリ戦略も含めてください。

<details><summary>回答</summary>

**全体フロー:**

```
[1] カート確認   → 在庫・価格の最新チェック
          ↓
[2] Checkout作成  → Stripe Session 作成
          ↓
[3] 決済         → Stripe決済ページでユーザーが支払い
          ↓
[4] Webhook受信   → checkout.session.completed
          ↓
[5] 注文確定     → トランザクション内で注文作成 + 在庫減少
          ↓
[6] メール通知    → 注文確認メール送信
```

**各ステップの失敗リカバリ:**

| ステップ | 失敗時の対処 |
|----------|-------------|
| [1] 在庫切れ | ユーザーにメッセージ表示、カートから自動削除 |
| [2] Session作成失敗 | リトライ。Stripe障害ならメンテナンスページ表示 |
| [3] 決済失敗/キャンセル | cancel_url にリダイレクト。カートは維持 |
| [4] Webhook未到着 | Stripeが自動リトライ（最大3日間）。成功ページではポーリング |
| [5] 注文確定失敗（在庫不足） | 決済を返金（`stripe.refunds.create`）。ユーザーに通知 |
| [6] メール送信失敗 | 非同期キューでリトライ。注文自体は確定済みなので影響なし |

**設計上の原則:**
- 決済成功 + 注文確定失敗 → **必ず返金**（ユーザーを損させない）
- メール失敗 → 注文は有効（メールは補助）。マイページで注文確認可能に
- 全ステップのログを記録し、手動リカバリを可能にする
</details>

**Q17.** Server Actions vs API Route の使い分けについて、具体的な判断基準を5つ挙げてください。この2つを混在させるのはアンチパターンですか？

<details><summary>回答</summary>

**判断基準:**

| 基準 | Server Actions | API Route |
|------|---------------|-----------|
| **1. 呼び出し元** | 自分のNext.jsアプリ内のみ | 外部サービス、モバイルアプリ、他のサーバーからも呼ぶ |
| **2. 用途** | データ変更（mutation） | Webhook受信、外部API連携、ファイルアップロード |
| **3. HTTPメソッド** | POST固定（内部的に） | GET/POST/PUT/DELETE を使い分けたい |
| **4. フォーム連携** | `<form action={fn}>` で直接使える | JS必須 |
| **5. レスポンス形式** | JSのオブジェクト（自動シリアライズ） | JSON/Stream/ファイル等を自由に返したい |

**混在はアンチパターンか？ NO — むしろ推奨。**

適材適所で使い分ける:
- カート追加、お気に入り登録 → **Server Actions**（シンプルなmutation）
- Stripe Webhook → **API Route**（外部からのHTTPリクエスト受信）
- 画像アップロード → **API Route**（ストリーム処理が必要）
- データ検索・取得 → **Server Component**（データ取得はActionでもRouteでもなく、コンポーネント内で直接）

アンチパターンになるのは「同じ処理をServer ActionとAPI Routeの両方で重複実装する」こと。共通ロジックはサービス層（`lib/services/`）に切り出して共有する。
</details>

**Q18.** Stripeの `metadata` フィールドをどう活用すべきですか？設計上の注意点も含めて説明してください。

<details><summary>回答</summary>

**metadataとは:**
StripeのCheckout SessionやPayment Intentに付与できる**カスタムキーバリューペア**（最大50個、各キー40文字/値500文字まで）。

**活用例:**
```typescript
const session = await stripe.checkout.sessions.create({
  // ...
  metadata: {
    userId: user.id,         // 誰の注文か
    orderId: order.id,       // アプリ側の注文ID
    cartHash: hashCart(cart), // カート内容のハッシュ（冪等性確保）
    source: "web",           // 注文元（Web/モバイル/API）
  },
});
```

**Webhookでの活用:**
```typescript
const session = event.data.object;
const userId = session.metadata.userId;
const orderId = session.metadata.orderId;
// → アプリ側のデータと紐付け
```

**設計上の注意点:**
1. **機密情報を入れない** — metadataはStripeダッシュボードで閲覧可能。個人情報やパスワードは不可
2. **サイズ制限に注意** — カート全体の詳細情報は入らない。IDで参照する
3. **Webhook到着時に検証** — metadataの値をそのまま信用せず、DBと突き合わせる
4. **文字列型のみ** — 数値もIDも全て文字列として保存される。パース時にバリデーション必要
5. **ログ・分析に活用** — Stripe Dashboard で metadata で検索・フィルタリング可能
</details>

**Q19.** ECサイトで「部分的な在庫引き当て」が必要になるケースと、その実装方法を説明してください。

<details><summary>回答</summary>

**必要になるケース:**
- カートに商品Aが3個、商品Bが2個 → 商品Aは在庫2個しかない
- 全部を買えない場合に、「在庫がある分だけ購入する」オプションを提供

**実装方法:**

```typescript
"use server";

type CartItem = { productId: string; quantity: number };
type AllocationResult = {
  allocated: CartItem[];
  unavailable: { productId: string; requested: number; available: number }[];
};

export async function allocateStock(cartItems: CartItem[]): Promise<AllocationResult> {
  const supabase = await createClient();
  const allocated: CartItem[] = [];
  const unavailable: AllocationResult["unavailable"] = [];

  // トランザクション内で在庫チェック + 引き当て
  for (const item of cartItems) {
    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.productId)
      .single();

    if (!product || product.stock === 0) {
      unavailable.push({
        productId: item.productId,
        requested: item.quantity,
        available: 0,
      });
    } else if (product.stock < item.quantity) {
      // 部分引き当て
      allocated.push({ productId: item.productId, quantity: product.stock });
      unavailable.push({
        productId: item.productId,
        requested: item.quantity,
        available: product.stock,
      });
    } else {
      allocated.push(item);
    }
  }

  return { allocated, unavailable };
}
```

**UXの考慮:**
- 購入前にユーザーに「在庫不足の商品」を明示し、数量調整を促す
- 「在庫がある分だけ購入」ボタンと「全部揃うまで待つ」の選択肢を提供
- 引き当てには有効期限を設けて、一定時間後に解放する（カゴ落ち対策）
</details>

**Q20.** 決済処理における「最終的一貫性（Eventual Consistency）」の概念を、Stripe + Supabaseの文脈で説明してください。

<details><summary>回答</summary>

**最終的一貫性とは:**
「一時的にデータの不整合が発生するが、最終的には一貫した状態に収束する」というモデル。

**Stripe + Supabaseでの具体例:**

```
時刻T1: ユーザーがStripeで決済完了 → Stripeの状態: "paid"
時刻T2: アプリの状態: 注文ステータスまだ "pending"（Webhook未到着）
  → 不整合! しかし...
時刻T3: Webhook到着 → 注文ステータスを "paid" に更新
  → 最終的に一貫した状態に
```

**この不整合時間帯（T1〜T3）の対処:**

1. **成功ページでのポーリング:**
```typescript
// 最大30秒間、1秒ごとにDB確認
const order = await pollForOrder(sessionId, {
  maxAttempts: 30,
  intervalMs: 1000,
});
```

2. **楽観的UI表示:**
```typescript
// Stripe Session のステータスを先に確認
const session = await stripe.checkout.sessions.retrieve(sessionId);
if (session.payment_status === "paid") {
  return <div>お支払いを受け付けました。注文を処理中です...</div>;
}
```

3. **最終防衛線: Stripeの自動リトライ**
- Webhookのレスポンスが200以外 → Stripeが最大72時間リトライ
- それでも失敗 → Stripeダッシュボードで手動再送

**設計原則:**
- Webhook = **注文確定の唯一の真実**
- 成功ページ = **楽観的なUI表示**（確定ではない）
- 管理画面でStripeとDBの状態を突き合わせる定期バッチを用意
</details>

---

## コーディング・操作理解

### 初級（絶対に抑えてほしい基礎知識）

**Q1.** Server Action を定義して、フォームから呼び出す基本的なコードを書いてください。

<details><summary>回答</summary>

```typescript
// app/actions/cart.ts
"use server";

export async function addToCart(formData: FormData) {
  const productId = formData.get("productId") as string;
  const quantity = Number(formData.get("quantity"));

  // DBに追加
  const supabase = await createClient();
  await supabase.from("cart_items").insert({
    product_id: productId,
    quantity,
    user_id: (await supabase.auth.getUser()).data.user?.id,
  });

  revalidatePath("/cart");
}
```

```typescript
// コンポーネントから呼び出し
import { addToCart } from "@/app/actions/cart";

export function AddToCartForm({ productId }: { productId: string }) {
  return (
    <form action={addToCart}>
      <input type="hidden" name="productId" value={productId} />
      <input type="number" name="quantity" defaultValue={1} min={1} />
      <button type="submit">カートに追加</button>
    </form>
  );
}
```
</details>

**Q2.** Stripe の Checkout Session を作成する基本的なコードを書いてください。

<details><summary>回答</summary>

```typescript
// app/actions/checkout.ts
"use server";

import Stripe from "stripe";
import { redirect } from "next/navigation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession() {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "jpy",
          product_data: {
            name: "コーヒー豆 ブラジル",
          },
          unit_amount: 1500,  // 1500円
        },
        quantity: 2,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
  });

  redirect(session.url!);
}
```
</details>

**Q3.** カートの合計金額を計算する関数を書いてください。

<details><summary>回答</summary>

```typescript
type CartItem = {
  productId: string;
  name: string;
  price: number;      // 単価（円）
  quantity: number;
};

export function calculateCartTotal(items: CartItem[]) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const tax = Math.floor(subtotal * 0.1);  // 消費税10%（切り捨て）
  const total = subtotal + tax;

  return {
    subtotal,   // 税抜合計
    tax,        // 消費税
    total,      // 税込合計
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

// 使用例
const cart = [
  { productId: "1", name: "コーヒー", price: 1500, quantity: 2 },
  { productId: "2", name: "マグカップ", price: 2000, quantity: 1 },
];
const result = calculateCartTotal(cart);
// subtotal: 5000, tax: 500, total: 5500, itemCount: 3
```
</details>

**Q4.** Webhookエンドポイントの基本的な構造を書いてください（署名検証含む）。

<details><summary>回答</summary>

```typescript
// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  // 1. 生のリクエストボディを取得
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  // 2. 署名検証
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook署名検証エラー:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 3. イベント処理
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      // 注文確定処理
      await handleCheckoutCompleted(session);
      break;
    default:
      console.log(`未処理のイベント: ${event.type}`);
  }

  // 4. 200を返す（Stripeにリトライさせない）
  return NextResponse.json({ received: true });
}
```
</details>

**Q5.** カートに商品を追加・削除・数量変更する Server Actions をそれぞれ書いてください。

<details><summary>回答</summary>

```typescript
// app/actions/cart.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// 追加
export async function addToCart(productId: string, quantity: number = 1) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  // 既にカートにあれば数量を加算
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single();

  if (existing) {
    await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
  } else {
    await supabase.from("cart_items").insert({
      user_id: user.id,
      product_id: productId,
      quantity,
    });
  }

  revalidatePath("/cart");
}

// 削除
export async function removeFromCart(cartItemId: string) {
  const supabase = await createClient();
  await supabase.from("cart_items").delete().eq("id", cartItemId);
  revalidatePath("/cart");
}

// 数量変更
export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const supabase = await createClient();

  if (quantity <= 0) {
    await supabase.from("cart_items").delete().eq("id", cartItemId);
  } else {
    await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId);
  }

  revalidatePath("/cart");
}
```
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q6.** カートのデータをSupabaseから取得し、商品情報を含めて表示するServer Componentを書いてください。

<details><summary>回答</summary>

```typescript
// app/cart/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CartItemRow } from "./cart-item-row";

export default async function CartPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(`
      id,
      quantity,
      products (
        id,
        name,
        price,
        image_url,
        stock
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h1>カートは空です</h1>
        <a href="/products">商品一覧を見る</a>
      </div>
    );
  }

  const total = cartItems.reduce(
    (sum, item) => sum + (item.products?.price ?? 0) * item.quantity,
    0
  );

  return (
    <div>
      <h1>カート</h1>
      <ul>
        {cartItems.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </ul>
      <div className="border-t pt-4 mt-4">
        <p className="text-2xl font-bold">
          合計: ¥{total.toLocaleString()}
        </p>
        <form action={createCheckoutSession}>
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded">
            購入手続きへ
          </button>
        </form>
      </div>
    </div>
  );
}
```
</details>

**Q7.** `useOptimistic` を使って、カートの数量変更を楽観的UIで実装してください。

<details><summary>回答</summary>

```typescript
"use client";

import { useOptimistic, useTransition } from "react";
import { updateCartQuantity } from "@/app/actions/cart";

type CartItem = {
  id: string;
  quantity: number;
  product: { name: string; price: number };
};

export function CartItemRow({ item }: { item: CartItem }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticQuantity, setOptimisticQuantity] = useOptimistic(
    item.quantity,
    (_current: number, newQuantity: number) => newQuantity
  );

  const handleQuantityChange = (newQuantity: number) => {
    startTransition(async () => {
      setOptimisticQuantity(newQuantity);  // 即座にUIを更新
      await updateCartQuantity(item.id, newQuantity);  // サーバーに反映
    });
  };

  return (
    <div className={`flex items-center gap-4 ${isPending ? "opacity-50" : ""}`}>
      <span>{item.product.name}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(optimisticQuantity - 1)}
          disabled={optimisticQuantity <= 1}
        >
          -
        </button>
        <span>{optimisticQuantity}</span>
        <button onClick={() => handleQuantityChange(optimisticQuantity + 1)}>
          +
        </button>
      </div>
      <span>¥{(item.product.price * optimisticQuantity).toLocaleString()}</span>
    </div>
  );
}
```

`useOptimistic` により、サーバーの応答を待たずにUIが即座に更新され、ユーザーはラグを感じません。サーバーでエラーが発生した場合は自動的に元の値に戻ります。
</details>

**Q8.** Stripe Checkout Session を、カートの全商品を含めて動的に作成するServer Actionを書いてください。

<details><summary>回答</summary>

```typescript
// app/actions/checkout.ts
"use server";

import Stripe from "stripe";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  // カートアイテムを取得
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(`
      quantity,
      products ( id, name, price, image_url )
    `)
    .eq("user_id", user.id);

  if (!cartItems || cartItems.length === 0) {
    throw new Error("カートが空です");
  }

  // Stripe の line_items に変換
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    cartItems.map((item) => ({
      price_data: {
        currency: "jpy",
        product_data: {
          name: item.products!.name,
          images: [item.products!.image_url],
        },
        unit_amount: item.products!.price,
      },
      quantity: item.quantity,
    }));

  // Checkout Session 作成
  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
    metadata: {
      userId: user.id,
    },
  });

  redirect(session.url!);
}
```
</details>

**Q9.** Webhook内で注文を確定する処理（注文作成 + 在庫減少 + カートクリア）を書いてください。

<details><summary>回答</summary>

```typescript
// lib/services/order.ts
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

// service_role キーでRLSをバイパス（Webhook処理用）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.userId;
  if (!userId) throw new Error("userId が metadata にありません");

  // 冪等性チェック: 既に処理済みか確認
  const { data: existingOrder } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .single();

  if (existingOrder) {
    console.log("既に処理済み:", session.id);
    return;
  }

  // カートアイテムを取得
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("product_id, quantity, products(price)")
    .eq("user_id", userId);

  if (!cartItems || cartItems.length === 0) {
    throw new Error("カートが空です");
  }

  // 注文作成
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      stripe_session_id: session.id,
      total: session.amount_total,
      status: "paid",
    })
    .select("id")
    .single();

  if (orderError) throw orderError;

  // 注文明細作成 + 在庫減少
  for (const item of cartItems) {
    await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.products?.price ?? 0,
    });

    // 在庫を減らす（楽観的ロック）
    const { data: updated } = await supabase
      .rpc("decrement_stock", {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      });
  }

  // カートをクリア
  await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId);

  console.log("注文確定:", order.id);
}
```
</details>

**Q10.** 在庫を安全に減らすPostgreSQL関数（楽観的ロック付き）を書いてください。

<details><summary>回答</summary>

```sql
-- supabase/migrations/xxx_create_decrement_stock.sql

CREATE OR REPLACE FUNCTION decrement_stock(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  rows_updated INTEGER;
BEGIN
  UPDATE products
  SET
    stock = stock - p_quantity,
    updated_at = now()
  WHERE id = p_product_id
    AND stock >= p_quantity;  -- 在庫が足りる場合のみ

  GET DIAGNOSTICS rows_updated = ROW_COUNT;

  IF rows_updated = 0 THEN
    RAISE EXCEPTION '在庫不足: product_id=%, 要求数量=%', p_product_id, p_quantity;
  END IF;

  RETURN true;
END;
$$;
```

**呼び出し:**
```typescript
const { error } = await supabase.rpc("decrement_stock", {
  p_product_id: productId,
  p_quantity: quantity,
});

if (error) {
  // 在庫不足 → 返金処理へ
  console.error("在庫不足:", error.message);
}
```

`stock >= p_quantity` の条件をUPDATE内で確認することで、**チェック→更新をアトミックに実行**し、競合状態を防ぎます。
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q11.** Server Action のエラーハンドリングを型安全に実装してください。成功/失敗を呼び出し元で判別できるパターンで書いてください。

<details><summary>回答</summary>

```typescript
// lib/types/action-result.ts
type ActionSuccess<T = void> = {
  success: true;
  data: T;
};

type ActionError = {
  success: false;
  error: string;
  code?: "UNAUTHORIZED" | "NOT_FOUND" | "OUT_OF_STOCK" | "VALIDATION" | "UNKNOWN";
};

type ActionResult<T = void> = ActionSuccess<T> | ActionError;
```

```typescript
// app/actions/cart.ts
"use server";

export async function addToCart(
  productId: string,
  quantity: number
): Promise<ActionResult<{ cartItemId: string }>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "ログインが必要です", code: "UNAUTHORIZED" };
    }

    if (quantity <= 0 || quantity > 99) {
      return { success: false, error: "数量は1〜99の間で指定してください", code: "VALIDATION" };
    }

    // 在庫チェック
    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", productId)
      .single();

    if (!product) {
      return { success: false, error: "商品が見つかりません", code: "NOT_FOUND" };
    }

    if (product.stock < quantity) {
      return { success: false, error: `在庫が不足しています（残り${product.stock}個）`, code: "OUT_OF_STOCK" };
    }

    const { data, error } = await supabase
      .from("cart_items")
      .insert({ user_id: user.id, product_id: productId, quantity })
      .select("id")
      .single();

    if (error) throw error;

    revalidatePath("/cart");
    return { success: true, data: { cartItemId: data.id } };
  } catch (e) {
    console.error("カート追加エラー:", e);
    return { success: false, error: "予期しないエラーが発生しました", code: "UNKNOWN" };
  }
}
```

```typescript
// クライアント側
"use client";

const handleAddToCart = async () => {
  const result = await addToCart(productId, 1);
  if (result.success) {
    toast.success("カートに追加しました");
  } else {
    switch (result.code) {
      case "OUT_OF_STOCK":
        toast.error(result.error);
        break;
      case "UNAUTHORIZED":
        router.push("/login");
        break;
      default:
        toast.error(result.error);
    }
  }
};
```
</details>

**Q12.** Stripe Webhook で複数のイベントタイプを処理する実装を書いてください。`checkout.session.completed`, `payment_intent.payment_failed`, `charge.refunded` を処理してください。

<details><summary>回答</summary>

```typescript
// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { handleCheckoutCompleted } from "@/lib/services/order";
import { handlePaymentFailed } from "@/lib/services/payment";
import { handleRefund } from "@/lib/services/refund";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("署名検証失敗:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        console.log("注文確定:", session.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        console.log("決済失敗:", paymentIntent.id);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        console.log("返金処理:", charge.id);
        break;
      }

      default:
        console.log(`未処理イベント: ${event.type}`);
    }
  } catch (err) {
    console.error(`Webhook処理エラー (${event.type}):`, err);
    // 500を返すとStripeがリトライしてくれる
    return NextResponse.json(
      { error: "Webhook処理中にエラー" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
```

```typescript
// lib/services/payment.ts
export async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata?.userId;
  if (!userId) return;

  await supabase
    .from("orders")
    .update({ status: "payment_failed" })
    .eq("stripe_payment_intent_id", paymentIntent.id);

  // ユーザーに通知（メール等）
}

// lib/services/refund.ts
export async function handleRefund(charge: Stripe.Charge) {
  // 返金額に応じて注文ステータスを更新
  const isFullRefund = charge.amount_refunded === charge.amount;

  await supabase
    .from("orders")
    .update({
      status: isFullRefund ? "refunded" : "partially_refunded",
      refunded_amount: charge.amount_refunded,
    })
    .eq("stripe_charge_id", charge.id);

  // 在庫を戻す処理
}
```
</details>

**Q13.** `useFormStatus` と `useActionState` を使って、購入ボタンにローディング状態とエラー表示を実装してください。

<details><summary>回答</summary>

```typescript
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createCheckoutSession } from "@/app/actions/checkout";

// 送信ボタン（useFormStatusはform内の子コンポーネントで使う）
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full py-3 rounded font-bold text-white
        ${pending ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          処理中...
        </span>
      ) : (
        "購入手続きへ"
      )}
    </button>
  );
}

// フォーム全体
export function CheckoutForm() {
  const [state, formAction] = useActionState(
    async (_prevState: { error?: string } | null) => {
      try {
        await createCheckoutSession();
        return null; // リダイレクトされるので到達しない
      } catch (e) {
        return { error: e instanceof Error ? e.message : "エラーが発生しました" };
      }
    },
    null
  );

  return (
    <form action={formAction}>
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
          {state.error}
        </div>
      )}
      <SubmitButton />
    </form>
  );
}
```

ポイント:
- `useFormStatus` は `<form>` の**子コンポーネント**内でのみ動作する（フォーム自体のコンポーネントでは使えない）
- `useActionState` でServer Actionの結果（エラー等）を状態管理
</details>

**Q14.** 注文履歴ページを実装してください。各注文の詳細（商品一覧、合計金額、ステータス）を表示してください。

<details><summary>回答</summary>

```typescript
// app/orders/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const STATUS_LABELS: Record<string, string> = {
  pending: "処理中",
  paid: "支払い済み",
  shipped: "発送済み",
  delivered: "配達完了",
  cancelled: "キャンセル",
  refunded: "返金済み",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      total,
      status,
      created_at,
      order_items (
        id,
        quantity,
        price_at_purchase,
        products ( name, image_url )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!orders || orders.length === 0) {
    return <p>注文履歴はありません</p>;
  }

  return (
    <div>
      <h1>注文履歴</h1>
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString("ja-JP")}
            </span>
            <span className={`px-2 py-1 rounded text-sm ${
              order.status === "paid" ? "bg-green-100 text-green-800" :
              order.status === "cancelled" ? "bg-red-100 text-red-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>

          <ul className="divide-y">
            {order.order_items?.map((item) => (
              <li key={item.id} className="py-2 flex justify-between">
                <span>
                  {item.products?.name} × {item.quantity}
                </span>
                <span>
                  ¥{(item.price_at_purchase * item.quantity).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>

          <div className="text-right font-bold mt-2 pt-2 border-t">
            合計: ¥{order.total.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
```
</details>

**Q15.** Stripe CLIを使ったローカル開発でのWebhookテスト手順を書いてください。

<details><summary>回答</summary>

```bash
# 1. Stripe CLI のインストール（macOS）
brew install stripe/stripe-cli/stripe

# 2. Stripe にログイン
stripe login

# 3. Webhook をローカルに転送
stripe listen --forward-to localhost:3000/api/webhook
# → 出力される whsec_xxx を .env.local にセット
# STRIPE_WEBHOOK_SECRET=whsec_xxx

# 4. 別ターミナルでテストイベントを発火
stripe trigger checkout.session.completed

# 5. 特定のイベントだけリッスン
stripe listen --forward-to localhost:3000/api/webhook \
  --events checkout.session.completed,payment_intent.payment_failed

# 6. ログの確認
# stripe listen のターミナルにイベントの送受信ログが表示される
# [200] POST http://localhost:3000/api/webhook
```

**テスト用カード番号:**
| カード番号 | 結果 |
|-----------|------|
| `4242 4242 4242 4242` | 成功 |
| `4000 0000 0000 0002` | カード拒否 |
| `4000 0000 0000 3220` | 3Dセキュア認証必要 |

有効期限: 未来の日付、CVC: 任意の3桁
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q16.** ECサイトの注文処理全体をService層として設計してください。関心の分離、テスタビリティ、エラーハンドリングを考慮してください。

<details><summary>回答</summary>

```typescript
// lib/services/order-service.ts

import type Stripe from "stripe";

// 依存の注入（テスタビリティ向上）
type Dependencies = {
  db: SupabaseClient;
  stripe: Stripe;
};

type CreateOrderInput = {
  userId: string;
  cartItems: CartItemWithProduct[];
  stripeSessionId: string;
  totalAmount: number;
};

export class OrderService {
  constructor(private deps: Dependencies) {}

  // 注文作成（Webhook から呼ばれる）
  async createOrder(input: CreateOrderInput): Promise<Order> {
    // 1. 冪等性チェック
    const existing = await this.findByStripeSession(input.stripeSessionId);
    if (existing) return existing;

    // 2. 在庫チェック + 引き当て
    await this.validateAndReserveStock(input.cartItems);

    // 3. 注文 + 明細を作成
    const order = await this.insertOrder(input);
    await this.insertOrderItems(order.id, input.cartItems);

    // 4. カートクリア
    await this.clearCart(input.userId);

    return order;
  }

  // 返金処理
  async refundOrder(orderId: string): Promise<void> {
    const order = await this.getOrder(orderId);
    if (order.status !== "paid") {
      throw new OrderError("返金できるステータスではありません", "INVALID_STATUS");
    }

    // Stripe 返金
    await this.deps.stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
    });

    // ステータス更新 + 在庫復元
    await this.updateStatus(orderId, "refunded");
    await this.restoreStock(orderId);
  }

  // 注文ステータス遷移の検証
  private validateStatusTransition(current: string, next: string): boolean {
    const transitions: Record<string, string[]> = {
      pending: ["paid", "cancelled"],
      paid: ["shipped", "refunded"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
      refunded: [],
    };
    return transitions[current]?.includes(next) ?? false;
  }

  // ... private メソッド群
}

// カスタムエラークラス
class OrderError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "OrderError";
  }
}
```

**設計ポイント:**
- **依存注入**: `db` と `stripe` を外から渡す → テスト時にモック化可能
- **冪等性**: 最初に重複チェック
- **ステータス遷移検証**: 不正な状態遷移を防止
- **カスタムエラー**: エラーコードでハンドリングを分岐
- **単一責任**: 各メソッドが1つの責任を持つ
</details>

**Q17.** カートの永続化戦略で「ゲストカート → ログイン時にマージ」を実装する場合の設計とエッジケースを議論してください。

<details><summary>回答</summary>

**設計:**
```typescript
// ゲストカート: localStorage に保存
type GuestCartItem = {
  productId: string;
  quantity: number;
  addedAt: string;  // ISO8601
};

// ログイン時のマージ処理
export async function mergeGuestCart() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // localStorage からゲストカートを取得
  const guestCart: GuestCartItem[] = JSON.parse(
    localStorage.getItem("guest_cart") ?? "[]"
  );
  if (guestCart.length === 0) return;

  // DB上の既存カートを取得
  const { data: dbCart } = await supabase
    .from("cart_items")
    .select("product_id, quantity")
    .eq("user_id", user.id);

  // マージロジック
  for (const guestItem of guestCart) {
    const dbItem = dbCart?.find(i => i.product_id === guestItem.productId);

    if (dbItem) {
      // 既にDBにある → 数量を合算（上限チェック付き）
      const newQty = Math.min(dbItem.quantity + guestItem.quantity, 99);
      await supabase
        .from("cart_items")
        .update({ quantity: newQty })
        .eq("user_id", user.id)
        .eq("product_id", guestItem.productId);
    } else {
      // DBにない → 新規追加
      await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: guestItem.productId,
        quantity: guestItem.quantity,
      });
    }
  }

  // ゲストカートをクリア
  localStorage.removeItem("guest_cart");
}
```

**エッジケース:**
1. **同じ商品が両方にある** → 合算するか、ログインカートを優先するか（上記は合算）
2. **ゲストカートの商品が在庫切れ** → マージ時にスキップし、ユーザーに通知
3. **ゲストカートの価格が変わった** → マージ時に最新価格で更新
4. **ゲストカートが古い（1ヶ月前等）** → `addedAt` をチェックして期限切れアイテムは除外
5. **localStorageが改ざんされた** → サーバー側でproductIdの存在・数量の妥当性を検証
6. **SSR時にlocalStorageにアクセスできない** → `onAuthStateChange` でクライアントサイドで実行
</details>

**Q18.** Webhookの信頼性を高めるための設計パターンを3つ説明し、それぞれ実装のポイントを示してください。

<details><summary>回答</summary>

**パターン1: 冪等性の保証**
```typescript
// イベントIDでの重複排除
async function processWebhook(event: Stripe.Event) {
  // processed_events テーブルで管理
  const { data: existing } = await supabase
    .from("processed_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .single();

  if (existing) {
    console.log("処理済みイベント:", event.id);
    return; // スキップ
  }

  // 処理実行
  await handleEvent(event);

  // 処理済みとして記録
  await supabase.from("processed_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    processed_at: new Date().toISOString(),
  });
}
```

**パターン2: 非同期処理キュー**
```typescript
// Webhookは即座に200を返し、処理はキューに入れる
export async function POST(request: NextRequest) {
  // 署名検証
  const event = verifySignature(body, signature);

  // キューに入れる（Supabase Edge Function / BullMQ / SQS等）
  await supabase.from("webhook_queue").insert({
    event_id: event.id,
    event_type: event.type,
    payload: event.data.object,
    status: "pending",
  });

  // 即座に200を返す（Stripeのタイムアウト防止）
  return NextResponse.json({ received: true });
}

// 別プロセスでキューを処理
// → 失敗時のリトライ、バックオフ、デッドレターキューが実装可能
```

**パターン3: 整合性チェックバッチ**
```typescript
// 定期的にStripeとDBの状態を突き合わせる
async function reconcileOrders() {
  // 直近24時間のStripe決済を取得
  const sessions = await stripe.checkout.sessions.list({
    created: { gte: Math.floor(Date.now() / 1000) - 86400 },
    status: "complete",
  });

  for (const session of sessions.data) {
    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_session_id", session.id)
      .single();

    if (!order) {
      // Webhook漏れ → 手動で注文作成
      console.error("注文欠損検出:", session.id);
      await handleCheckoutCompleted(session);
    }
  }
}
```

3つのパターンを組み合わせることで、Webhookの取りこぼし・重複・遅延に対してロバストなシステムを構築できます。
</details>

**Q19.** 消費税計算のロジックで注意すべき点を5つ挙げ、正確な計算を行う実装を書いてください。

<details><summary>回答</summary>

**注意すべき5つの点:**

1. **端数処理のタイミング** — 商品ごとに端数処理するか、合計で端数処理するかで金額が変わる
2. **軽減税率** — 食品は8%、それ以外は10%（日本の場合）
3. **浮動小数点の誤差** — `0.1 + 0.2 !== 0.3` 問題。金額計算は整数（銭/cent単位）で行う
4. **税込/税抜の統一** — DBに保存する価格が税込か税抜かを統一する
5. **法的な表示義務** — 総額表示が義務（税込価格の表示）

**実装:**
```typescript
type TaxRate = 0.08 | 0.10;

type CartItem = {
  productId: string;
  name: string;
  price: number;      // 税抜価格（整数: 円）
  quantity: number;
  taxRate: TaxRate;    // 0.08（軽減税率）or 0.10（標準税率）
};

type TaxSummary = {
  subtotal: number;       // 税抜合計
  tax8: number;           // 8%対象の税額
  tax10: number;          // 10%対象の税額
  totalTax: number;       // 消費税合計
  total: number;          // 税込合計
  items: {
    name: string;
    priceWithTax: number; // 税込単価
    quantity: number;
    lineTotal: number;    // 税込小計
  }[];
};

export function calculateTax(items: CartItem[]): TaxSummary {
  let subtotal = 0;
  let tax8Total = 0;
  let tax10Total = 0;
  const itemDetails = [];

  for (const item of items) {
    const lineSubtotal = item.price * item.quantity;
    // 商品行ごとに端数処理（切り捨て）
    const lineTax = Math.floor(lineSubtotal * item.taxRate);
    const lineTotal = lineSubtotal + lineTax;

    subtotal += lineSubtotal;

    if (item.taxRate === 0.08) {
      tax8Total += lineTax;
    } else {
      tax10Total += lineTax;
    }

    itemDetails.push({
      name: item.name,
      priceWithTax: item.price + Math.floor(item.price * item.taxRate),
      quantity: item.quantity,
      lineTotal,
    });
  }

  const totalTax = tax8Total + tax10Total;

  return {
    subtotal,
    tax8: tax8Total,
    tax10: tax10Total,
    totalTax,
    total: subtotal + totalTax,
    items: itemDetails,
  };
}
```

全ての金額計算を**整数**で行い、`Math.floor`で端数を切り捨てることで、浮動小数点の誤差を回避しています。
</details>

**Q20.** Stripeの決済処理で発生しうるエラーを網羅的に分類し、それぞれのユーザーへの通知方法とシステム側の対処を設計してください。

<details><summary>回答</summary>

**エラー分類と対処:**

| カテゴリ | エラー例 | ユーザー通知 | システム対処 |
|----------|---------|-------------|-------------|
| **カード拒否** | 残高不足、カード無効、盗難カード | 「お支払いが完了しませんでした。別のカードをお試しください」 | ログ記録。リトライ不要 |
| **3Dセキュア失敗** | 認証未完了、タイムアウト | 「認証に失敗しました。再度お試しください」 | セッションを期限切れ処理 |
| **Stripe API エラー** | レート制限、サーバーダウン | 「一時的な問題が発生しています。しばらくお待ちください」 | 指数バックオフでリトライ |
| **ネットワークエラー** | 接続タイムアウト | 「通信エラーが発生しました」 | リトライ（3回まで） |
| **不正利用検出** | Stripe Radar ブロック | 「お支払いを処理できませんでした」 | 詳細を伏せる（セキュリティ） |
| **Webhookエラー** | 署名検証失敗、処理例外 | 表示不要（バックグラウンド） | アラート通知 + 手動確認 |

**実装:**
```typescript
export async function handleStripeError(error: unknown): ActionResult {
  if (error instanceof Stripe.errors.StripeCardError) {
    // カード拒否: ユーザーに表示可能なメッセージ
    return {
      success: false,
      error: getCardErrorMessage(error.code),
      code: "CARD_DECLINED",
    };
  }

  if (error instanceof Stripe.errors.StripeRateLimitError) {
    // レート制限: リトライ可能
    return {
      success: false,
      error: "混雑しています。しばらくしてから再度お試しください",
      code: "RATE_LIMIT",
    };
  }

  if (error instanceof Stripe.errors.StripeConnectionError) {
    // 接続エラー: リトライ可能
    return {
      success: false,
      error: "通信エラーが発生しました。再度お試しください",
      code: "CONNECTION",
    };
  }

  // 予期しないエラー: 詳細を隠す
  console.error("予期しないStripeエラー:", error);
  return {
    success: false,
    error: "お支払いの処理中にエラーが発生しました",
    code: "UNKNOWN",
  };
}

function getCardErrorMessage(code?: string): string {
  const messages: Record<string, string> = {
    card_declined: "カードが拒否されました",
    insufficient_funds: "残高が不足しています",
    expired_card: "カードの有効期限が切れています",
    incorrect_cvc: "セキュリティコードが正しくありません",
    processing_error: "処理中にエラーが発生しました。再度お試しください",
  };
  return messages[code ?? ""] ?? "お支払いを処理できませんでした";
}
```

**セキュリティ原則:** カード拒否の詳細理由をユーザーに伝えすぎると、不正利用者に有用な情報を与えてしまう。「カードが拒否されました」程度に留め、具体的な理由はログにのみ記録する。
</details>
