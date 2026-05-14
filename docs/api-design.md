# API設計

作成日: 2026-05-14

> Next.js App Routerでは、サーバーコンポーネントから直接Supabaseにクエリできるため、
> 商品の取得系（GET）はAPI Routeを経由せず、サーバーコンポーネントで直接データ取得する。
> API Routeは外部サービス連携（Stripe Webhook）やクライアントからの変更操作に使用する。

---

## 商品関連

### 商品一覧取得

| 項目 | 内容 |
|------|------|
| 方式 | サーバーコンポーネントで直接Supabase query |
| パス | `/products` ページ内 |
| フィルター | `?origin=xxx&roast=xxx&flavor=xxx&q=xxx` (URL searchParams) |
| 取得内容 | products + product_variants（最低価格のみ） |
| RLS | is_published = true のみ |

```sql
-- 実際のクエリイメージ
SELECT p.*, 
  (SELECT MIN(pv.price) FROM product_variants pv WHERE pv.product_id = p.id) as min_price
FROM products p
WHERE p.is_published = true
  AND (p.origin ILIKE '%{origin}%' OR '{origin}' IS NULL)
  AND (p.roast_level = '{roast}' OR '{roast}' IS NULL)
  AND (p.name ILIKE '%{q}%' OR p.description ILIKE '%{q}%' OR '{q}' IS NULL)
ORDER BY p.created_at DESC
```

### 商品詳細取得

| 項目 | 内容 |
|------|------|
| 方式 | サーバーコンポーネントで直接Supabase query |
| パス | `/products/[id]` ページ内 |
| 取得内容 | product + 全product_variants + reviews (with profile name) |
| RLS | is_published = true のみ |

---

## カート関連

| メソッド | エンドポイント | 説明 | 方式 |
|---------|-------------|------|------|
| GET | — | カート取得 | サーバーコンポーネント直接 |
| POST | — | カートに追加 | Server Action |
| PATCH | — | 数量変更 | Server Action |
| DELETE | — | カートから削除 | Server Action |

---

## 注文関連

| メソッド | エンドポイント | 説明 | 方式 |
|---------|-------------|------|------|
| GET | — | 注文履歴取得 | サーバーコンポーネント直接 |
| GET | — | 注文詳細取得 | サーバーコンポーネント直接 |
| POST | `/api/checkout` | Stripe Checkout Session作成 | API Route |
| POST | `/api/webhook/stripe` | Stripe Webhook受信・注文作成 | API Route |
| PATCH | — | ステータス更新（管理者） | Server Action |

---

## 商品管理（管理者）

| メソッド | エンドポイント | 説明 | 方式 |
|---------|-------------|------|------|
| GET | — | 商品一覧（管理者用） | サーバーコンポーネント直接 |
| POST | — | 商品追加 | Server Action |
| PATCH | — | 商品編集 | Server Action |
| DELETE | — | 商品削除 | Server Action |

---

## レビュー

| メソッド | エンドポイント | 説明 | 方式 |
|---------|-------------|------|------|
| GET | — | 商品のレビュー取得 | サーバーコンポーネント直接 |
| POST | — | レビュー投稿 | Server Action |
| PATCH | — | レビュー編集 | Server Action |
| DELETE | — | レビュー削除 | Server Action |

---

## ユーザー関連

| メソッド | エンドポイント | 説明 | 方式 |
|---------|-------------|------|------|
| GET | — | プロフィール取得 | サーバーコンポーネント直接 |
| PATCH | — | プロフィール更新 | Server Action |
| GET | — | 配送先一覧取得 | サーバーコンポーネント直接 |
| POST | — | 配送先追加 | Server Action |
| PATCH | — | 配送先編集 | Server Action |
| DELETE | — | 配送先削除 | Server Action |

---

## 認証

| メソッド | エンドポイント | 説明 |
|---------|-------------|------|
| GET | `/auth/callback` | OAuth callback（認証コード→セッション交換） |

---

## 設計方針

1. **GET系はサーバーコンポーネントで直接取得** — API Routeを経由しない（不要なネットワークホップを避ける）
2. **変更操作はServer Action** — Next.jsのServer Actionsを使い、フォーム送信やボタン操作でサーバー処理を実行
3. **外部連携のみAPI Route** — Stripe WebhookのようにNext.jsの外から呼ばれるものだけAPI Routeにする
