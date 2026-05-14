# DB詳細設計

作成日: 2026-05-14

---

## ER図（テキスト表現）

```
categories ─┐
             │ 1:N
products ────┤
  │          │
  │ 1:N      │
  ▼          │
product_variants ──┐
  │                │
  │          ┌─────┘
  │          │
  │     cart_items ← profiles (user)
  │          │
  │     order_items
  │          │ N:1
  │          ▼
  │       orders ← profiles (user)
  │
  │     reviews ← profiles (user)
  │
  └── shipping_addresses ← profiles (user)

profiles ← Supabase Auth (1:1)
```

**ポイント**: 価格と在庫は `products` ではなく `product_variants` に持つ。
「エチオピア イルガチェフェ」という商品に「200g: ¥1,200」「500g: ¥2,800」というバリエーションがぶら下がる構造。

---

## テーブル定義

### profiles（ユーザー情報）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, FK → auth.users.id | Supabase AuthのユーザーIDと一致 |
| name | text | NOT NULL | 表示名 |
| avatar_url | text | | プロフィール画像URL |
| role | text | NOT NULL, DEFAULT 'user' | 'user' or 'admin' |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

---

### categories（カテゴリ）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| name | text | NOT NULL, UNIQUE | カテゴリ名（例: コーヒー豆、カカオ） |
| slug | text | NOT NULL, UNIQUE | URL用（例: coffee-beans） |
| sort_order | int | NOT NULL, DEFAULT 0 | 表示順 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

---

### products（商品）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| category_id | uuid | FK → categories.id | |
| name | text | NOT NULL | 商品名（例: エチオピア イルガチェフェ） |
| description | text | NOT NULL | 商品説明 |
| origin | text | NOT NULL | 産地（例: コロンビア ウィラ地区） |
| farm_name | text | | 農園名 |
| farm_story | text | | 農園のストーリー |
| roast_level | text | NOT NULL | 焙煎度（light / medium / dark） |
| process | text | | 精製方法（washed / natural / honey など） |
| altitude | text | | 標高（例: 1,600-1,900m） |
| flavor_notes | text[] | | フレーバーノート（例: ['チョコレート', 'ナッツ', '柑橘']） |
| image_url | text | | メイン画像URL |
| is_published | boolean | NOT NULL, DEFAULT false | 公開/非公開 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

---

### product_variants（商品バリエーション）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| product_id | uuid | FK → products.id, ON DELETE CASCADE | |
| label | text | NOT NULL | 表示名（例: 200g, 500g, 1kg） |
| weight_g | int | NOT NULL | 重量（グラム） |
| price | int | NOT NULL | 価格（円、税込） |
| stock | int | NOT NULL, DEFAULT 0 | 在庫数 |
| sort_order | int | NOT NULL, DEFAULT 0 | 表示順 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

**UNIQUE制約**: (product_id, weight_g) — 同じ商品に同じ重量のバリエーションは作れない

---

### cart_items（カート）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → profiles.id, NOT NULL | |
| variant_id | uuid | FK → product_variants.id, NOT NULL | |
| quantity | int | NOT NULL, DEFAULT 1, CHECK > 0 | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

**UNIQUE制約**: (user_id, variant_id) — 同じバリエーションはカート内で1行にまとめる（数量で管理）

---

### orders（注文）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → profiles.id, NOT NULL | |
| order_number | text | NOT NULL, UNIQUE | 注文番号（表示用。例: ORD-20260514-001） |
| status | text | NOT NULL, DEFAULT 'pending' | pending / preparing / shipped / completed / cancelled |
| total | int | NOT NULL | 合計金額（円） |
| shipping_name | text | NOT NULL | 配送先氏名 |
| shipping_postal_code | text | NOT NULL | 配送先郵便番号 |
| shipping_address | text | NOT NULL | 配送先住所 |
| shipping_phone | text | NOT NULL | 配送先電話番号 |
| stripe_checkout_session_id | text | | Stripe Checkout Session ID |
| stripe_payment_intent_id | text | | Stripe Payment Intent ID |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

**注**: 配送先は注文時にコピーする（shipping_addressesの参照ではなく値をコピー）。注文後に配送先を変更しても、注文時の情報が残るようにするため。

---

### order_items（注文明細）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| order_id | uuid | FK → orders.id, ON DELETE CASCADE | |
| variant_id | uuid | FK → product_variants.id | |
| product_name | text | NOT NULL | 注文時の商品名（スナップショット） |
| variant_label | text | NOT NULL | 注文時のバリエーション名（スナップショット） |
| price | int | NOT NULL | 注文時の単価（スナップショット） |
| quantity | int | NOT NULL, CHECK > 0 | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

**注**: product_name, variant_label, price は注文時点の値をコピーする。商品名や価格が後から変わっても、注文記録は当時のままにするため。

---

### reviews（レビュー）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → profiles.id, NOT NULL | |
| product_id | uuid | FK → products.id, NOT NULL | |
| rating | int | NOT NULL, CHECK 1-5 | 星評価（1〜5） |
| comment | text | | コメント |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

**UNIQUE制約**: (user_id, product_id) — 1ユーザー1商品につき1レビュー

---

### shipping_addresses（配送先）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → profiles.id, NOT NULL | |
| label | text | NOT NULL | ラベル（例: 自宅, 職場） |
| name | text | NOT NULL | 氏名 |
| postal_code | text | NOT NULL | 郵便番号 |
| address | text | NOT NULL | 住所 |
| phone | text | NOT NULL | 電話番号 |
| is_default | boolean | NOT NULL, DEFAULT false | デフォルト配送先 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

---

## RLSポリシー

### 方針

- **全テーブルでRLSを有効化**する
- ユーザーは自分のデータのみアクセス可能
- 管理者（role = 'admin'）は管理に必要な範囲で拡張権限を持つ
- 商品・カテゴリは全員が閲覧可能（公開データ）

### ポリシー一覧

| テーブル | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| profiles | 自分のみ | Auth トリガーで自動作成 | 自分のみ（roleは変更不可） | 不可 |
| categories | 全員 | admin のみ | admin のみ | admin のみ |
| products | 全員（is_published = true）、admin は全件 | admin のみ | admin のみ | admin のみ |
| product_variants | 全員（親productが公開中）、admin は全件 | admin のみ | admin のみ | admin のみ |
| cart_items | 自分のみ | 自分のみ | 自分のみ | 自分のみ |
| orders | 自分のみ、admin は全件 | サーバーサイドのみ（Webhook経由） | admin のみ（ステータス更新） | 不可 |
| order_items | 自分の注文のもののみ、admin は全件 | サーバーサイドのみ | 不可 | 不可 |
| reviews | 全員（閲覧）| 自分のみ（購入済み商品に限る） | 自分のみ | 自分のみ |
| shipping_addresses | 自分のみ | 自分のみ | 自分のみ | 自分のみ |

### RLSの重要ポイント

1. **profilesのroleカラム**: ユーザー自身がroleを'admin'に変更できないようにする（UPDATE時にroleカラムの変更を禁止）
2. **ordersのINSERT**: フロントエンドから直接作成させず、Stripe Webhookからサーバーサイドで作成する（不正な注文を防ぐ）
3. **reviewsのINSERT**: 該当商品を購入済みであることをチェックする
4. **productsのSELECT**: 一般ユーザーには `is_published = true` のもののみ表示

---

## インデックス

| テーブル | カラム | 理由 |
|---------|--------|------|
| products | category_id | カテゴリ別の商品取得 |
| products | roast_level | 焙煎度フィルター |
| products | origin | 産地フィルター |
| product_variants | product_id | 商品別バリエーション取得 |
| cart_items | user_id | ユーザー別カート取得 |
| orders | user_id | ユーザー別注文取得 |
| orders | status | ステータス別注文取得（管理者用） |
| order_items | order_id | 注文別明細取得 |
| reviews | product_id | 商品別レビュー取得 |
| shipping_addresses | user_id | ユーザー別配送先取得 |
