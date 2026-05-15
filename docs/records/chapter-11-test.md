# Chapter 11: 世界に届けよう — 理解度テスト

---

## IT知識・概念理解

### 初級（絶対に抑えてほしい基礎知識）

**Q1.** デプロイとは何ですか？
<details><summary>回答</summary>
作ったWebサイトをインターネットに公開し、誰でもアクセスできる状態にすること。
</details>

**Q2.** READMEファイルは何のためにありますか？
<details><summary>回答</summary>
プロジェクトを初めて見る人に「何のプロジェクトで、どう動かすか」を伝えるためのドキュメント。
</details>

**Q3.** OGPとは何の略で、何をするものですか？
<details><summary>回答</summary>
Open Graph Protocol。SNSでURLをシェアしたときに表示されるタイトル・説明文・画像を設定する仕組み。
</details>

**Q4.** 環境変数をテスト用と本番用で分ける理由は何ですか？
<details><summary>回答</summary>
テスト用のキーでは本番の決済が動かず、本番のキーをテスト環境で使うとセキュリティリスクになる。環境ごとに適切な設定を使い分けるため。
</details>

**Q5.** SEOとは何ですか？
<details><summary>回答</summary>
Search Engine Optimization（検索エンジン最適化）。Googleなどの検索結果でサイトが上位に表示されるように、メタ情報やコンテンツを最適化すること。
</details>

### 中級（仕組みを説明できるレベル）

**Q1.** `metadata` と `generateMetadata` の違いを説明してください。
<details><summary>回答</summary>
metadataは静的（ビルド時に決定）で全ページ共通。generateMetadataは動的（リクエスト時に決定）でページごとに異なるメタ情報を生成する。商品詳細ページのように、URLのパラメータに応じてタイトルが変わる場合はgenerateMetadataを使う。
</details>

**Q2.** Vercelデプロイ後にSupabaseの設定を更新する必要があるのはなぜですか？
<details><summary>回答</summary>
OAuth認証のcallback URLが本番ドメインに変わるため。Supabase側のSite URLとRedirect URLsを本番ドメインに更新しないと、ログイン後に正しくリダイレクトされない。
</details>

**Q3.** `title.template: "%s | Colombia Coffee"` は何をしますか？
<details><summary>回答</summary>
サブページのタイトルに自動で「| Colombia Coffee」を付与する。例えば商品名が「ウィラ エル・パライソ農園」なら、ブラウザのタブには「ウィラ エル・パライソ農園 | Colombia Coffee」と表示される。
</details>

**Q4.** Stripe Webhookの設定をデプロイ後に行う必要があるのはなぜですか？
<details><summary>回答</summary>
WebhookのエンドポイントURLが本番ドメインに変わるため。Stripeダッシュボードで新しいエンドポイントを登録し、Signing Secretを環境変数に設定する必要がある。
</details>

**Q5.** `metadataBase` を設定する理由は何ですか？
<details><summary>回答</summary>
OGP画像などの相対パスを絶対パスに解決するためのベースURL。これがないとSNSのクローラーが画像を取得できない場合がある。
</details>

### 上級（実務応用レベル）

**Q1.** 本番デプロイ時にStripeのテストキーを使い続けるとどうなりますか？
<details><summary>回答</summary>
実際の決済が処理されない。テストモードではお金が動かないため、お客さんが購入しようとしてもカード決済が完了しない。テストカード番号（4242...）でしか決済できない。
</details>

**Q2.** OGP画像が正しく表示されないときの原因を3つ挙げてください。
<details><summary>回答</summary>
1. metadataBaseが未設定で相対パスが解決できない。2. 画像URLがCORS制限でクローラーからアクセスできない。3. SNS側のキャッシュが古い情報を保持している（デバッガーツールでキャッシュをクリアする必要がある）。
</details>

**Q3.** CI/CD（Continuous Integration/Continuous Deployment）とは何ですか？Vercelではどう実現されていますか？
<details><summary>回答</summary>
コードの変更を自動でテスト・ビルド・デプロイする仕組み。VercelではGitHubにpushするだけで自動ビルド・デプロイが実行される。プレビューデプロイ（PRごと）と本番デプロイ（mainブランチ）が自動で行われる。
</details>

**Q4.** 環境変数に `NEXT_PUBLIC_` プレフィックスがある変数とない変数の違いは何ですか？
<details><summary>回答</summary>
NEXT_PUBLIC_付きはブラウザ（クライアントサイド）に露出する。なし（STRIPE_SECRET_KEYなど）はサーバーサイドでのみ利用可能。秘密鍵にNEXT_PUBLIC_を付けると全ユーザーに見えてしまうセキュリティ事故になる。
</details>

**Q5.** Vercelのプレビューデプロイとは何ですか？どう活用しますか？
<details><summary>回答</summary>
Pull Requestごとに自動で作成される一時的なデプロイ環境。コードレビュー時に「実際に動く状態」を確認できる。鈴木さん（レビュアー）がPRのURLをクリックするだけで、変更内容を実際に操作して確認できる。
</details>

### 玄人（設計判断・トレードオフ）

**Q1.** SSG（静的サイト生成）とSSR（サーバーサイドレンダリング）のトレードオフを、ECサイトの文脈で説明してください。
<details><summary>回答</summary>
SSGはビルド時にHTMLを生成するので高速だが、在庫や価格の変更がリアルタイムに反映されない。SSRはリクエスト時にHTMLを生成するので最新データを表示できるが、サーバー負荷が高い。ECサイトでは商品一覧はISR（増分静的再生成）、カートや注文はSSRが適切。
</details>

**Q2.** CDN（Content Delivery Network）がSEOに与える影響を説明してください。
<details><summary>回答</summary>
CDNによりページの読み込み速度が向上する。GoogleはCore Web Vitals（LCP、FID、CLS）をランキング要因に含めており、表示速度が速いサイトはSEO的に有利。Vercelは自動的にCDNを利用する。
</details>

**Q3.** robots.txtとsitemap.xmlの役割と、ECサイトでの設定指針を説明してください。
<details><summary>回答</summary>
robots.txtは検索エンジンのクローラーにどのページをクロールしてよいかを指示する。sitemap.xmlは全ページのURLリストを提供する。ECサイトでは管理画面（/admin）やカート（/cart）はクロール不要（robots.txtで除外）、商品ページはsitemap.xmlに含めてインデックスを促進する。
</details>

**Q4.** 本番デプロイ前に行うべきセキュリティチェックリストを5つ挙げてください。
<details><summary>回答</summary>
1. 全ての環境変数が本番用に切り替わっているか。2. service_role keyがクライアントに露出していないか（NEXT_PUBLIC_がついていないか）。3. RLSが全テーブルで有効か。4. Stripe Webhookの署名検証が有効か。5. OAuth callbackのリダイレクトURLが本番ドメインに設定されているか。
</details>

**Q5.** ゼロダウンタイムデプロイとは何ですか？Vercelはどう実現していますか？
<details><summary>回答</summary>
デプロイ中にサイトが停止しないこと。Vercelはイミュータブルデプロイメントを採用しており、新しいバージョンのビルドが完了してからトラフィックを切り替える。古いバージョンは即座に削除されず、問題があればロールバック可能。
</details>

---

## コーディング・操作理解

### 初級（基本操作を覚える）

**Q1.** Next.jsの開発サーバーを起動するコマンドは何ですか？
<details><summary>回答</summary>

```bash
npm run dev
```
</details>

**Q2.** 以下のメタデータ設定で、ブラウザのタブに表示されるタイトルは何ですか？
```tsx
export const metadata = {
  title: "商品一覧",
};
```
（layout.tsxに `title.template: "%s | Colombia Coffee"` が設定されている場合）
<details><summary>回答</summary>
「商品一覧 | Colombia Coffee」
</details>

**Q3.** `.env.local.example` を `.env.local` にコピーするコマンドは何ですか？
<details><summary>回答</summary>

```bash
cp .env.local.example .env.local
```
</details>

**Q4.** 本番ビルドを作成するコマンドは何ですか？
<details><summary>回答</summary>

```bash
npm run build
```
</details>

**Q5.** Gitで現在の変更をリモートに送信するコマンドは何ですか？
<details><summary>回答</summary>

```bash
git push origin main
```
</details>

### 中級（実装パターンを理解する）

**Q1.** 以下のコードは何をしていますか？
```tsx
export const metadata: Metadata = {
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "Colombia Coffee",
  },
};
```
<details><summary>回答</summary>
OGP（Open Graph Protocol）のメタ情報を設定している。SNSでURLをシェアしたとき、サイトの種類（website）、言語（日本語）、サイト名が表示される。
</details>

**Q2.** `generateMetadata` で `await getProduct(id)` を呼んでいますが、ページ本体でも同じ関数を呼んでいます。2回DBにアクセスするのですか？
<details><summary>回答</summary>
Next.jsのリクエストデデュプリケーション（重複排除）により、同じリクエスト内で同じfetchは1回だけ実行される。ただしSupabaseクライアントの場合はフレームワークの自動キャッシュに依存するため、実装によっては2回アクセスされる可能性がある。
</details>

**Q3.** 以下のVercel環境変数設定で、`STRIPE_SECRET_KEY`に`NEXT_PUBLIC_`プレフィックスを付けたらどうなりますか？
<details><summary>回答</summary>
Stripeの秘密鍵がブラウザのJavaScriptに埋め込まれ、誰でも取得できてしまう。悪意のある第三者がその鍵を使って不正な決済操作を行える重大なセキュリティ事故になる。
</details>

**Q4.** READMEに環境変数の一覧を書く際、実際の値（`sk_test_xxx...`）を書いてはいけない理由は何ですか？
<details><summary>回答</summary>
READMEはGitHubに公開される。実際のAPIキーを書くと全世界に漏洩する。代わりにプレースホルダー（`sk_test_xxx`）やexampleファイル（`.env.local.example`）を使う。
</details>

**Q5.** 以下のコードで`product.description.slice(0, 120)`をしている理由は何ですか？
```tsx
const description = `${product.origin}産 ${getRoastLabel(product.roast_level)} | ${product.description.slice(0, 120)}`;
```
<details><summary>回答</summary>
OGPのdescriptionが長すぎるとSNSで途中で切れてしまう。120文字に制限することで、主要な情報が確実に表示されるようにしている。
</details>

### 上級（応用的な実装）

**Q1.** Vercelでデプロイ後、OGP画像が表示されない場合のデバッグ手順を説明してください。
<details><summary>回答</summary>
1. ブラウザのDevToolsでHTMLの`<head>`内のmetaタグを確認。2. Facebook Sharing Debugger（`developers.facebook.com/tools/debug/`）やTwitter Card Validator（`cards-dev.twitter.com/validator`）でURLを検証。3. 画像URLに直接アクセスして表示されるか確認。4. metadataBaseの設定を確認。5. キャッシュが原因ならデバッガーで「Scrape Again」を実行。
</details>

**Q2.** Next.jsのApp Routerで、特定のページだけSSR（キャッシュなし）にするにはどうしますか？
<details><summary>回答</summary>

```tsx
export const dynamic = "force-dynamic";
```
をページコンポーネントファイルに追加する。これによりリクエストごとにサーバーで再レンダリングされる。カートページや注文ページなど、常に最新データが必要なページに使う。
</details>

**Q3.** `next.config.ts` でリダイレクトを設定する方法と、proxy.tsでリダイレクトする方法の使い分けを説明してください。
<details><summary>回答</summary>
next.config.tsのredirectsは静的なURL→URLのマッピング（例: /old-page → /new-page）。proxy.tsはリクエストデータ（Cookie、ヘッダー、パラメータ）に基づく動的なリダイレクト（例: ログイン状態によって分岐）。条件分岐が不要ならnext.config.tsの方がシンプルでパフォーマンスも良い。
</details>

**Q4.** Vercelの環境変数で「Production」「Preview」「Development」の3つのスコープがある理由は何ですか？
<details><summary>回答</summary>
環境ごとに異なる設定が必要だから。本番（Production）は本番のAPIキー、プレビュー（Preview）はテスト用キー、開発（Development）はローカル用キーを設定できる。例えばStripeの本番キーはProductionのみに設定し、PreviewやDevelopmentにはテストキーを設定する。
</details>

**Q5.** `npm run build` でビルドエラーが出た場合、Vercelではどう表示されますか？対処法は？
<details><summary>回答</summary>
Vercelのデプロイログにビルドエラーが表示され、デプロイが失敗する。前のバージョンのデプロイが維持されるのでサイトは停止しない。対処法: ローカルで`npm run build`を実行してエラーを再現・修正し、再度pushする。
</details>

### 玄人（深い理解）

**Q1.** ISR（Incremental Static Regeneration）をECサイトの商品ページに適用する場合、revalidateの値をどう設定しますか？根拠も含めて説明してください。
<details><summary>回答</summary>
商品情報の更新頻度による。在庫がリアルタイムに変わる場合はrevalidate: 60（1分）程度。価格や説明文の変更が主ならrevalidate: 3600（1時間）でも可。ただし在庫0表示の遅延が許容できない場合はSSR（dynamic = "force-dynamic"）にする。トラフィックとデータ鮮度のバランスが重要。
</details>

**Q2.** Edge Runtime（Vercel Edge Functions）でproxy.tsを実行するメリットとデメリットを説明してください。
<details><summary>回答</summary>
メリット: ユーザーに近いエッジサーバーで実行されるため、レイテンシが低い。コールドスタートが速い。デメリット: Node.js APIの一部が使えない制約がある。Supabaseクライアントの一部機能が動かない可能性がある。今回のproxyではSupabaseのセッション管理を行っているため、Edge Runtimeとの互換性を確認する必要がある。
</details>

**Q3.** Content Security Policy（CSP）ヘッダーをNext.jsで設定する場合、ECサイトで考慮すべきポイントを3つ挙げてください。
<details><summary>回答</summary>
1. Stripe.jsの外部スクリプト読み込みを`script-src`で許可する必要がある。2. Supabase Storageの画像URLを`img-src`で許可する必要がある。3. OGP用のメタタグで外部画像を参照する場合、`meta`タグのnonce対応が必要な場合がある。CSPを厳しくしすぎるとStripe決済やSupabase認証が動かなくなるリスクがある。
</details>

**Q4.** Vercelのサーバーレス関数のタイムアウト（デフォルト10秒）がStripe Webhookの処理に影響を与える可能性はありますか？対策は？
<details><summary>回答</summary>
大量の注文明細や在庫更新で処理が10秒を超える可能性がある。対策: 1. Webhookハンドラは200をすぐ返し、処理はバックグラウンドキュー（Vercel Background Functions）で行う。2. Stripeのリトライ（最大3回）を活用し、冪等性を確保した上でタイムアウト時は次のリトライで処理を完了する。3. Vercel Proプランでタイムアウトを60秒に延長する。
</details>

**Q5.** A/Bテストをデプロイレベルで実現する方法を2つ挙げ、それぞれのメリット・デメリットを説明してください。
<details><summary>回答</summary>
1. **Vercel Edge Config + proxy.ts**: proxy.tsでランダムにリクエストを振り分け、異なるページを表示。メリット: サーバーレベルで制御できるので確実。デメリット: 実装が複雑、キャッシュとの整合性に注意が必要。2. **Vercel Skew Protection + 複数デプロイ**: 異なるバージョンのデプロイにトラフィックを分割。メリット: コード変更なしでインフラ設定だけで実現。デメリット: 細かい制御が難しい、Proプランが必要。
</details>
