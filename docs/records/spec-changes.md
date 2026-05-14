# 仕様変更記録

> 当初設計から変更があった箇所を記録する。
> v1完成時にこの情報を元に仕様書をfixする。

---

## 変更一覧

| # | 日付 | 対象 | 変更内容 | 理由 |
|---|------|------|---------|------|
| 1 | 2026-05-14 | products テーブル | `process`（精製方法）と `altitude`（標高）カラムを追加 | スペシャリティコーヒーでは精製方法・標高は品質を左右する重要情報。商品詳細ページでの表示に必要 |
| 2 | 2026-05-14 | LINEログイン | ネイティブOAuthではなくThird-party Auth（カスタムOIDC）で実装 | SupabaseがLINEをネイティブサポートしていないため。設定手順は `line-login-setup.md` に記録 |

---

## 変更詳細

### #1: products テーブルにカラム追加（2026-05-14）

**当初設計**:
productsテーブルのコーヒー豆属性は `origin`, `farm_name`, `farm_story`, `roast_level`, `flavor_notes` の5つ。

**変更後**:
`process`（精製方法）と `altitude`（標高）を追加し、7属性に。

**追加カラム**:

| カラム | 型 | 説明 | 例 |
|--------|-----|------|-----|
| process | text (nullable) | 精製方法 | washed / natural / honey |
| altitude | text (nullable) | 標高 | 1,600-1,900m |

**影響範囲**:
- DB: productsテーブル
- フロント: 商品詳細ページに表示項目追加
- 管理画面: 商品登録フォームに入力項目追加

**判断者**: 開発チーム（AIの提案 → 田中さんが承認）

---

### #2: LINEログインの実装方式（2026-05-14）

**当初設計**:
Supabase Auth の LINE / Google ログイン（ネイティブOAuth）を想定。

**変更後**:
- Google: Supabase Auth ネイティブOAuth（当初設計通り）
- LINE: Supabase Auth Third-party Auth（カスタムOIDCプロバイダー）

**理由**:
SupabaseはLINEをネイティブのOAuthプロバイダーとしてサポートしていない。
ただし、Third-party Auth（カスタムOIDC）機能を使えば、LINEのOpenID Connect対応を利用して実現可能。

**影響範囲**:
- コード: `signInWithLine()` でカスタムOIDCプロバイダー名を使用（`@ts-expect-error` 付き）
- 環境変数: `NEXT_PUBLIC_LINE_OIDC_PROVIDER` を追加
- 設定: LINE Developers Console + Supabaseダッシュボードでの手動設定が必要
- 設定手順書: `docs/records/line-login-setup.md` に記録

**判断者**: 開発チーム（技術的制約による変更）
