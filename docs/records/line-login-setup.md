# LINEログイン設定手順

> SupabaseはLINEをネイティブサポートしていないため、
> Third-party Auth（カスタムOIDC）として設定する。

---

## 1. LINE Developers Console での設定

### 1-1. チャネル作成

1. [LINE Developers Console](https://developers.line.biz/console/) にアクセス
2. プロバイダーを作成（または既存を選択）
3. 「LINEログイン」チャネルを新規作成
   - チャネル名: Colombia Coffee
   - チャネル説明: コロンビアコーヒーECサイト
   - アプリタイプ: Web app
   - メールアドレス: （運営者メール）

### 1-2. チャネル設定

1. 「LINEログイン設定」タブ
   - コールバックURL: `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
2. 「チャネル基本設定」からチャネルIDとチャネルシークレットを控える

---

## 2. Supabase ダッシュボードでの設定

1. Supabase ダッシュボード > Authentication > Providers
2. 「Third-party Auth」セクションで新しいプロバイダーを追加
3. 以下を設定:
   - **Provider Name**: `line-login`（任意。コード側の `NEXT_PUBLIC_LINE_OIDC_PROVIDER` と一致させる）
   - **Issuer URL**: `https://access.line.me`
   - **Client ID**: LINE Developers ConsoleのチャネルID
   - **Client Secret**: LINE Developers Consoleのチャネルシークレット
   - **Scopes**: `openid profile email`

---

## 3. 環境変数の追加

`.env.local` に追加:

```
NEXT_PUBLIC_LINE_OIDC_PROVIDER=line-login
```

---

## 4. 動作確認

1. `/login` ページにアクセス
2. 「LINEでログイン」ボタンをクリック
3. LINE認証画面にリダイレクトされる
4. 認証後、アプリに戻ってくる
5. profilesテーブルにレコードが自動作成されていることを確認

---

## 注意事項

- LINE Developers Consoleのチャネルは、**公開**状態にする必要がある（非公開だと自分以外のユーザーがログインできない）
- LINEのemail取得には、LINE側でemailスコープの申請が必要な場合がある
- 本番環境ではコールバックURLを本番ドメインに変更すること
