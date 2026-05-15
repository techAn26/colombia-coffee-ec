# Colombia Coffee

**コロンビア産スペシャリティコーヒー豆の専門ECサイト**

農園の顔が見える、こだわりの一杯を届けます。

---

## プロジェクト概要

### 背景と課題

コロンビアの小規模農園が作る高品質なスペシャリティコーヒー豆は、既存の大手EC（Amazon、楽天等）では農園のストーリーや品質のこだわりが消費者に伝わりません。一方、日本のコーヒー愛好家は「どこの誰が、どう作った豆なのか」を知りたがっています。

### 解決策

産地・焙煎度・フレーバーで検索でき、農園のストーリーと共にコーヒー豆を選べる**専門ECサイト**を構築しました。

### 開発アプローチ

このプロジェクトは「**AI x 課題解決 システム開発フレームワーク**」の実践検証として開発されました。IT初心者がAIを活用しながら、理解を深めつつ品質の高いシステムを構築するプロセスを、12章の講義+実践形式で記録しています。

> 詳細: [docs/development-framework.md](docs/development-framework.md)

---

## 主な機能

### ユーザー向け

| 機能 | 説明 |
|------|------|
| **商品一覧・検索** | 産地・焙煎度・フレーバーで絞り込み、キーワード検索 |
| **商品詳細** | スペック、農園ストーリー、バリエーション（200g/500g/1kg）、レビュー |
| **カート・決済** | Stripe Checkout による安全なクレジットカード決済 |
| **注文管理** | 注文履歴の確認、ステータス追跡 |
| **レビュー** | 購入済み商品への星評価（1-5）+ コメント投稿 |
| **認証** | Google / LINE アカウントでのソーシャルログイン |
| **プロフィール** | 表示名・配送先の管理 |

### 管理者向け

| 機能 | 説明 |
|------|------|
| **商品管理** | 商品のCRUD（追加・編集・削除）、画像アップロード |
| **在庫管理** | バリエーション（重量別）ごとの在庫数管理 |
| **注文管理** | 全注文の一覧・ステータス更新（受注 -> 発送準備 -> 発送済み -> 完了） |

### 画面構成（全16画面）

```
公開ページ（3画面）     会員ページ（7画面）         管理者ページ（5画面）
 - トップページ         - カート                    - ダッシュボード
 - 商品一覧             - 決済完了                  - 商品管理（一覧）
 - 商品詳細             - マイページ                - 商品追加/編集
                        - 注文履歴                  - 注文管理（一覧）
認証ページ（1画面）     - 注文詳細                  - 注文詳細
 - ログイン             - プロフィール編集
                        - 配送先管理
```

> 詳細: [docs/screen-design.md](docs/screen-design.md)

---

## 技術スタック

| レイヤー | 技術 | 選定理由 |
|---------|------|---------|
| フロントエンド | **Next.js 16** (App Router) / React 19 / TypeScript | SSR/SSGによるSEO対応、型安全性 |
| UI | **Tailwind CSS v4** + shadcn/ui | 高品質なUIを効率的に構築 |
| バックエンド | Next.js **API Routes** + **Server Actions** | サーバーレス、フロントと統合 |
| データベース | **Supabase** (PostgreSQL) | 認証・DB・ストレージが統合、RLS対応 |
| 認証 | Supabase Auth (Google / LINE OAuth) | パスワード管理不要、セキュリティリスク軽減 |
| 決済 | **Stripe** (Checkout + Webhook) | 業界標準、カード情報非保持 |
| ファイルストレージ | Supabase Storage | 商品画像の保存・配信 |
| テスト | **Vitest** | 高速なユニットテスト |
| ホスティング | Vercel | Next.jsとの親和性、CI/CD統合 |

---

## アーキテクチャ

### データベース設計（9テーブル）

```
profiles <-- auth.users (1:1)
categories --+
             | 1:N
products ----+
  |          |
  | 1:N      |
  v          |
product_variants --+
  |                |
  |     cart_items <-- profiles
  |     order_items <-- orders <-- profiles
  |     reviews <-- profiles
  +-- shipping_addresses <-- profiles
```

**セキュリティ**: 全テーブルにRLS（行レベルセキュリティ）を適用。25のポリシーで「誰が何をできるか」をDB層で強制。

> 詳細: [docs/db-design.md](docs/db-design.md)

### 認証ガード（三重防御）

| レイヤー | 仕組み | 守るもの |
|---------|--------|---------|
| UI | 管理者リンクの条件表示 | 一般ユーザーには見せない |
| Proxy | パスベースのリダイレクト | ページへのアクセス自体を遮断 |
| RLS | DB層のアクセス制御 | データの読み書きを制御（最後の砦） |

### 決済フロー

```
カート -> /api/checkout -> Stripe決済ページ -> Webhook -> 注文作成 -> 在庫減算 -> カートクリア
                                                  ^
                                          署名検証（なりすまし防止）
```

> 詳細: [docs/api-design.md](docs/api-design.md)

---

## 開発プロセス

### AI x 課題解決 システム開発フレームワーク

9つのPhaseで「何を作るか」から「どう見せるか」までを体系化:

```
Phase 0  状況整理        Phase 3  要件定義        Phase 6  テスト
Phase 1  課題発見        Phase 4  設計            Phase 7  リリース
Phase 2  解決策整理      Phase 5  開発            Phase 8  運用・検証
```

### 理解駆動開発

各タスクを6ステップで進行し、「動いたから次」ではなく「**理解したから次**」で進める:

```
理解 -> 判断 -> 実装 -> 確認 -> 記録 -> レビュー
```

### Chapter形式（全12章）

開発を「**学ぶ -> 手を動かす -> 振り返る**」の講義+実践形式で構成:

| Chapter | テーマ | 学ぶこと |
|---------|--------|---------|
| Ch.1 | 全体像を掴もう | Web基礎、環境構築、Git |
| Ch.2 | データの置き場所を作ろう | DB、テーブル設計、RLS |
| Ch.3 | ログインを作ろう | OAuth、認証、セッション |
| Ch.4 | 商品を並べよう | コンポーネント、データ取得 |
| Ch.5 | 「買う」を実現しよう | カート、Stripe決済 |
| Ch.6 | 注文を届けよう | 注文管理、ステータス遷移 |
| Ch.7 | お店を回そう | CRUD、画像、在庫 |
| Ch.8 | お客さんとつながろう | プロフィール、レビュー |
| Ch.9 | サイトの顔を仕上げよう | レイアウト、レスポンシブ |
| Ch.10 | 品質を確かめよう | テスト |
| Ch.11 | 世界に届けよう | デプロイ、OGP/SEO |
| Ch.12 | 育てて学ぼう | 振り返り、改善 |

> 詳細: [docs/chapters.md](docs/chapters.md)

---

## プロジェクト数値

| 項目 | 数値 |
|------|------|
| 画面数 | 16 |
| DBテーブル数 | 9 |
| RLSポリシー数 | 25 |
| ユニットテスト | 12（全通過） |
| 手動テストシナリオ | 43項目 |
| 理解度テスト問題 | 480問 |
| デモ商品数 | 5（15バリエーション） |
| 開発Chapter | 12 |

---

## To-Do（改善リスト）

### 機能追加

| # | 機能 | 優先度 | 理由 |
|---|------|--------|------|
| 1 | 配送先選択を決済フローに組み込み | **高** | 現在は配送先が「未設定」で注文される |
| 2 | 注文確認メール送信 | **高** | 注文完了の通知がない |
| 3 | お気に入り機能 | 中 | リピーターの利便性向上 |
| 4 | 商品画像の複数枚対応 | 中 | 現在は1枚のみ |
| 5 | 注文キャンセルのユーザー操作 | 中 | 現在は管理者のみ可 |
| 6 | サブスクリプション（定期購入） | 低 | リピーターからの要望を見てから |
| 7 | おすすめ診断機能 | 低 | 初心者がフレーバーで選べない問題の解決 |

### UX改善

| # | 改善 | 優先度 |
|---|------|--------|
| 1 | ヘッダーのモバイルメニュー（ハンバーガー） | **高** |
| 2 | 商品画像の実写真への差し替え | **高** |
| 3 | カートアイコンにバッジ（商品数）表示 | 中 |
| 4 | ステータス変更時の確認ダイアログ | 中 |
| 5 | ローディング中のスケルトンUIの充実 | 低 |

### 技術的改善

| # | 改善 | 優先度 |
|---|------|--------|
| 1 | Webhook冪等性の確保（重複注文防止） | **高** |
| 2 | TypeScriptの型をSupabase CLIで自動生成 | 中 |
| 3 | E2Eテスト（Playwright） | 中 |
| 4 | エラーログの集約（Sentry等） | 中 |
| 5 | ISR（増分静的再生成）の導入 | 低 |

---

## セットアップ

### 前提条件

- Node.js 20+
- npm
- [Supabase](https://supabase.com/) アカウント
- [Stripe](https://stripe.com/) アカウント（テストモード）

### 手順

```bash
# 1. クローン
git clone <repository-url>
cd practice-1

# 2. 依存関係インストール
npm install

# 3. 環境変数設定
cp .env.local.example .env.local
# .env.local を編集して実際の値を設定

# 4. DB セットアップ（Supabase SQL Editorで順番に実行）
#    supabase/migrations/20260514_001_initial_schema.sql
#    supabase/migrations/20260514_002_rls_policies.sql
#    supabase/migrations/20260515_003_decrement_stock.sql
#    supabase/migrations/20260515_004_storage_policies.sql

# 5. デモデータ投入（任意）
#    supabase/seed.sql

# 6. 開発サーバー起動
npm run dev
```

### 環境変数

| 変数名 | 説明 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key（Webhook用） |
| `NEXT_PUBLIC_APP_URL` | アプリのURL |
| `NEXT_PUBLIC_LINE_OIDC_PROVIDER` | LINE OIDCプロバイダー名 |
| `STRIPE_SECRET_KEY` | Stripe Secret Key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Signing Secret |

### 開発コマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm test` | ユニットテスト実行 |
| `npm run lint` | ESLint実行 |

---

## ドキュメント

| ファイル | 内容 |
|---------|------|
| [docs/development-framework.md](docs/development-framework.md) | AI x 課題解決 システム開発フレームワーク |
| [docs/chapters.md](docs/chapters.md) | 12章の講義構成 |
| [docs/db-design.md](docs/db-design.md) | DB詳細設計（テーブル・RLS・インデックス） |
| [docs/api-design.md](docs/api-design.md) | API設計 |
| [docs/screen-design.md](docs/screen-design.md) | 画面一覧・遷移設計 |
| [docs/todo.md](docs/todo.md) | 開発タスク一覧（全完了） |
| [docs/records/](docs/records/) | 各Chapterの開発記録・理解度テスト・仕様変更記録 |

---

## ライセンス

このプロジェクトはポートフォリオ・教育目的で公開しています。
