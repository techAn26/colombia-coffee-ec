# Vercel デプロイ手順書

---

## 1. 前提条件

- GitHub にリポジトリを push 済み
- [Vercel](https://vercel.com/) アカウント作成済み
- Supabase プロジェクトが稼働中
- Stripe テストモードの API キーを取得済み

---

## 2. Vercel にプロジェクトをインポート

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. 「Add New...」→「Project」
3. GitHub リポジトリを選択（practice-1）
4. Framework: Next.js（自動検出される）
5. Root Directory: `./`（デフォルト）

---

## 3. 環境変数の設定

Vercel の「Settings」→「Environment Variables」で以下を設定:

| 変数名 | 値 | 備考 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabaseダッシュボードから |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJxxx...` | Supabaseダッシュボードから |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJxxx...` | Supabaseダッシュボード > Settings > API |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | デプロイ後のURL |
| `NEXT_PUBLIC_LINE_OIDC_PROVIDER` | `line-login` | LINE設定後に変更 |
| `STRIPE_SECRET_KEY` | `sk_test_xxx` or `sk_live_xxx` | Stripeダッシュボードから |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_xxx` or `pk_live_xxx` | Stripeダッシュボードから |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxx` | Stripe Webhook設定後に取得 |

---

## 4. デプロイ

「Deploy」ボタンをクリック。ビルドが自動実行される。

---

## 5. デプロイ後の設定

### 5-1. Supabase の設定更新

Supabase ダッシュボード > Authentication > URL Configuration:
- **Site URL**: `https://your-domain.vercel.app`
- **Redirect URLs**: `https://your-domain.vercel.app/auth/callback`

### 5-2. Stripe Webhook の設定

1. [Stripe Dashboard](https://dashboard.stripe.com/webhooks) > Webhooks
2. 「Add endpoint」
3. Endpoint URL: `https://your-domain.vercel.app/api/webhook/stripe`
4. Events: `checkout.session.completed`
5. 作成後に表示される Signing Secret を `STRIPE_WEBHOOK_SECRET` に設定

### 5-3. Google OAuth の設定更新

Google Cloud Console > Credentials:
- **Authorized redirect URIs** に `https://xxx.supabase.co/auth/v1/callback` を追加

### 5-4. LINE Login の設定更新（設定済みの場合）

LINE Developers Console > チャネル設定:
- **Callback URL** に `https://xxx.supabase.co/auth/v1/callback` を追加

---

## 6. 動作確認

1. トップページが表示されること
2. 商品一覧・詳細が表示されること
3. Google ログインが動作すること
4. カートに追加→決済フローが動作すること（テストカード: `4242 4242 4242 4242`）

---

## 7. 独自ドメイン（任意）

Vercel の「Settings」→「Domains」で独自ドメインを設定可能。
設定後、上記の全URLを独自ドメインに更新すること。
