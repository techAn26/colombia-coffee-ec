# Colombia Coffee ☕

コロンビア産スペシャリティコーヒー豆の専門ECサイト。
農園の顔が見える、こだわりの一杯を届けます。

## 概要

コロンビアの農園から直接仕入れたスペシャリティコーヒー豆を販売するECサイトです。
産地・焙煎度・フレーバーで検索でき、農園のストーリーと共にコーヒー豆を選べます。

### 主な機能

- **商品一覧・検索**: 産地・焙煎度・フレーバーで絞り込み、キーワード検索
- **商品詳細**: スペック、農園ストーリー、バリエーション（200g/500g/1kg）、レビュー
- **カート・決済**: Stripe Checkout による安全なクレジットカード決済
- **注文管理**: ユーザー側の注文履歴、管理者側のステータス更新
- **ユーザー機能**: Google/LINE ログイン、プロフィール編集、配送先管理、レビュー投稿
- **管理画面**: 商品CRUD、画像アップロード、在庫管理、注文管理

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 16 (App Router) / React 19 / TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui |
| バックエンド | Next.js API Routes + Server Actions |
| データベース | Supabase (PostgreSQL) |
| 認証 | Supabase Auth (Google / LINE OAuth) |
| 決済 | Stripe (Checkout + Webhook) |
| ファイルストレージ | Supabase Storage |
| テスト | Vitest |
| ホスティング | Vercel |

## セットアップ

### 前提条件

- Node.js 20+
- npm
- Supabase アカウント
- Stripe アカウント（テストモード）

### 手順

1. リポジトリをクローン

```bash
git clone <repository-url>
cd practice-1
```

2. 依存関係をインストール

```bash
npm install
```

3. 環境変数を設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集し、実際の値を設定:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# LINE Login (カスタムOIDC)
NEXT_PUBLIC_LINE_OIDC_PROVIDER=line-login

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

4. データベースをセットアップ

Supabase ダッシュボードの SQL Editor で、`supabase/migrations/` 内の SQL を順番に実行:

```
20260514_001_initial_schema.sql
20260514_002_rls_policies.sql
20260515_003_decrement_stock.sql
20260515_004_storage_policies.sql
```

5. デモデータを投入（任意）

```
supabase/seed.sql
```

6. 開発サーバーを起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

## 開発コマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint実行 |
| `npm test` | ユニットテスト実行（vitest） |
| `npm run test:watch` | テストのウォッチモード |

## ディレクトリ構成

```
src/
├── app/                    # ページ（App Router）
│   ├── admin/              # 管理者ページ
│   ├── api/                # API Routes（Stripe連携）
│   ├── auth/               # OAuth callback
│   ├── cart/               # カートページ
│   ├── checkout/           # 決済完了ページ
│   ├── login/              # ログインページ
│   ├── mypage/             # マイページ（注文履歴、プロフィール、配送先）
│   └── products/           # 商品一覧・詳細
├── components/             # UIコンポーネント
│   └── ui/                 # shadcn/ui コンポーネント
└── lib/                    # ユーティリティ・ビジネスロジック
    ├── supabase/           # Supabaseクライアント（server/client/admin）
    └── __tests__/          # ユニットテスト
```

## ドキュメント

- `docs/development-framework.md` — AI×課題解決 システム開発フレームワーク
- `docs/chapters.md` — 開発Chapter構成（講義＋実践）
- `docs/todo.md` — 開発タスク一覧
- `docs/db-design.md` — データベース詳細設計
- `docs/api-design.md` — API設計
- `docs/screen-design.md` — 画面一覧・遷移設計
- `docs/records/` — 各Chapterの開発記録・学習証跡・テスト問題
