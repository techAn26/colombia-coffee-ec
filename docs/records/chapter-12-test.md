# Chapter 12: 育てて学ぼう — 理解度テスト

---

## IT知識・概念理解

### 初級（絶対に抑えてほしい基礎知識）

**Q1.** 「振り返り」を行う目的を2つ挙げてください。
<details><summary>回答</summary>
1. プロジェクトを「語れる」ようにする（面接やクライアントへの説明）。2. 次のプロジェクトに活かすために、うまくいったこと・いかなかったことを整理する。
</details>

**Q2.** 改善リストの「優先度」はなぜ必要ですか？
<details><summary>回答</summary>
全部を一度にやることはできない。限られた時間で最も効果が高いものから着手するために、優先度をつけて判断する。
</details>

**Q3.** 「技術的負債」とは何ですか？
<details><summary>回答</summary>
「今は動くけど、将来的に問題になるコードや設計」のこと。例: Webhook冪等性の未対応、エラーログの未集約。後で対処しないと、問題がどんどん大きくなる（借金の利息のように）。
</details>

**Q4.** ユーザーフィードバックを集める方法を3つ挙げてください。
<details><summary>回答</summary>
1. 知人に実際に使ってもらい感想を聞く。2. アンケートフォームを設置する。3. アクセス解析（Google Analytics等）でユーザー行動を分析する。
</details>

**Q5.** MVP（Minimum Viable Product）とは何ですか？
<details><summary>回答</summary>
「最小限の実用的な製品」。全機能を作り込む前に、核となる機能だけで公開し、ユーザーの反応を見てから改善・機能追加していくアプローチ。
</details>

### 中級（仕組みを説明できるレベル）

**Q1.** 今回のプロジェクトで「仕様変更」が3件発生しました。仕様変更を記録する重要性を説明してください。
<details><summary>回答</summary>
1. v1完成時に正確な仕様書をfixできる（当初設計と最終実装の差分が明確）。2. 変更の理由が残るので、後から「なぜこうなっているか」がわかる。3. 同じ判断を再度議論する無駄を防げる。
</details>

**Q2.** 「リグレッション（退行）」とは何ですか？どうやって防ぎますか？
<details><summary>回答</summary>
Aを修正したらBが壊れること。防ぐ方法: 1. ユニットテストを書いておき、変更のたびに実行する。2. 手動テストシナリオを用意して全フローを確認する。3. CI（継続的インテグレーション）で自動テストをpushのたびに実行する。
</details>

**Q3.** 「スケーラビリティ」の観点で、今回のECサイトが将来課題になりうるポイントを2つ挙げてください。
<details><summary>回答</summary>
1. 商品数が増えた場合、フィルタリングのパフォーマンス（全件取得+アプリ側フィルター）が問題になる可能性。2. proxyで毎リクエストDB問い合わせ（管理者チェック）するため、アクセス増加時にレイテンシが増える。
</details>

**Q4.** 今回のプロジェクトで「AIが対応したこと」と「田中さんが自分でやったこと」の境界線は何でしたか？
<details><summary>回答</summary>
AIが対応: コード生成、技術用語の説明、設計のドラフト作成、エラー解決。田中さん: ビジネス判断（テーマカラー、MVPスコープ）、ドメイン知識（コーヒー豆の情報）、理解の言語化、鈴木さんへのレビュー依頼。判断と理解は田中さん、実装はAIという分担。
</details>

**Q5.** 「教訓を次に活かす」とは具体的に何をすることですか？
<details><summary>回答</summary>
1. フレームワークの改善（マイルストーン設計、理解度テストの追加）。2. 改善リストの優先度上位を次のイテレーションで実装。3. 今回詰まったポイント（LINE OIDC、Server Actionsのテスト分離等）を教材化し、同じ問題で詰まらないようにする。
</details>

### 上級（実務応用レベル）

**Q1.** KPT（Keep/Problem/Try）フレームワークでプロジェクトを振り返ってください。
<details><summary>回答</summary>
Keep: Chapter形式の講義+実践、RLSによるセキュリティ設計、仕様変更の記録。Problem: 配送先が決済フローに未統合、Webhook冪等性の未対応、モバイルメニューの未実装。Try: マイルストーン設計の導入、理解度テストの各Chapter追加、E2Eテストの導入。
</details>

**Q2.** 今回のプロジェクトをポートフォリオとして見せる場合、面接官が評価するポイントは何ですか？
<details><summary>回答</summary>
1. 課題定義の明確さ（「なぜ作ったか」が語れる）。2. 技術選定の理由（「なぜNext.js/Supabaseか」を説明できる）。3. セキュリティ意識（RLS、署名検証、三重ガード）。4. 開発プロセスの記録（フレームワーク、Chapter記録、テスト）。5. 改善リストの存在（完璧ではないことを認識し、次のステップが見えている）。
</details>

**Q3.** 「技術的負債を返済する」タイミングの判断基準を説明してください。
<details><summary>回答</summary>
1. ユーザーに直接影響する問題は即座に返済（例: Webhook冪等性→重複注文のリスク）。2. 開発速度に影響する問題は定期的に返済（例: 型定義の自動生成→手動管理の手間）。3. 将来のスケールで問題になるものはスケール前に返済（例: パフォーマンス最適化）。「いつか直す」は「永遠に直さない」と同義なので、スプリントに組み込む。
</details>

**Q4.** A/Bテストをこのサイトに導入するとしたら、何をテストしますか？
<details><summary>回答</summary>
1. トップページのCTAボタンの文言（「商品を見る」vs「今すぐ購入」）。2. 商品詳細ページのレイアウト（画像左/情報右 vs 画像上/情報下）。3. 農園ストーリーの表示位置（商品情報の下 vs タブ切り替え）。KPIは商品詳細ページからのカート追加率。
</details>

**Q5.** 「運用」と「開発」の違いを、ECサイトの文脈で説明してください。
<details><summary>回答</summary>
開発: 新機能の実装、バグ修正、コードの変更。運用: 日々の商品登録・在庫管理、注文処理（ステータス更新）、顧客対応、売上分析、マーケティング。開発は「作る」、運用は「使い続ける」。田中さんの日常業務は運用が中心で、開発は改善時のみ。
</details>

### 玄人（設計判断・トレードオフ）

**Q1.** 「自前EC」vs「Shopify」の判断を、今回のプロジェクトの経験を踏まえて再評価してください。
<details><summary>回答</summary>
自前ECのメリット: 農園ストーリーのUI自由度、将来のカテゴリ拡張、技術力の証明。デメリット: 開発・保守コスト、決済・配送の細かい実装。Shopifyのメリット: すぐ始められる、決済・配送が統合済み。デメリット: 月額費用、テンプレートの制約。結論: ポートフォリオ目的なら自前ECは正解。事業としてはShopifyで始めて検証し、スケール後に自前移行の方が合理的だった可能性もある。
</details>

**Q2.** マイクロサービスとモノリスのトレードオフを、今回のECサイトの文脈で説明してください。
<details><summary>回答</summary>
今回はモノリス（Next.js 1つで全機能）。個人開発・小規模ではモノリスの方が開発速度が速く、デプロイも簡単。マイクロサービスは、チームが大きくなったり、特定機能（決済、在庫管理）を独立してスケールさせたい場合に検討する。時期尚早のマイクロサービス化は複雑性だけが増える。
</details>

**Q3.** 今回のフレームワーク（理解駆動開発 + Chapter形式）の限界は何ですか？
<details><summary>回答</summary>
1. 開発速度が遅い（理解のステップが多い分、純粋な開発より時間がかかる）。2. AIの説明が正しいか検証する手段が限られる（経験者レビューに依存）。3. 「理解した」の基準が自己申告（テスト問題で改善したが、実務での応用力は別）。4. 1人で進めると視野が狭くなる（チーム開発の経験は得られない）。
</details>

**Q4.** このプロジェクトを「商品」として就活生に提供する場合、フレームワークで改善すべき最も重要なポイントは何ですか？
<details><summary>回答</summary>
マイルストーン設計。ECサイト全体を一度に作ると12Chapterで長すぎる。Phase 1（LP）→Phase 2（商品表示）→Phase 3（認証）→Phase 4（決済）と小さな完成品を積み上げる形にすれば、各Phaseで達成感を得られ、途中で止めてもポートフォリオとして使える。
</details>

**Q5.** 10年後、AIが今よりさらに進化した世界で、「理解駆動開発」はまだ必要ですか？
<details><summary>回答</summary>
必要。AIがコードを書く精度が上がっても、「何を作るべきか」「なぜそう設計するか」の判断は人間の仕事。むしろAIが万能になるほど、「AIに正しい指示を出せる人」と「出せない人」の差が広がる。理解があるからこそ、AIの出力を評価・修正・改善できる。理解駆動開発は「AIと協働するための基礎力」。
</details>

---

## コーディング・操作理解

### 初級（基本操作を覚える）

**Q1.** ユニットテストを実行するコマンドは何ですか？
<details><summary>回答</summary>

```bash
npm test
```
</details>

**Q2.** Gitで直近5件のコミットログを確認するコマンドは何ですか？
<details><summary>回答</summary>

```bash
git log --oneline -5
```
</details>

**Q3.** 特定のコミットを取り消すコマンドは何ですか？
<details><summary>回答</summary>

```bash
git revert <commit-hash>
```
（コミット自体は履歴に残り、取り消すコミットが新たに作られる）
</details>

**Q4.** TypeScriptの型チェックだけ実行する（コンパイルはしない）コマンドは何ですか？
<details><summary>回答</summary>

```bash
npx tsc --noEmit
```
</details>

**Q5.** 現在のブランチの変更状況を確認するコマンドは何ですか？
<details><summary>回答</summary>

```bash
git status
```
</details>

### 中級（実装パターンを理解する）

**Q1.** 以下のコードで、テスト対象の関数を別ファイルに分離している理由は何ですか？
```ts
// order-utils.ts（テスト可能）
export function getNextStatuses(current: OrderStatus): OrderStatus[] { ... }

// orders.ts（"use server" 付き）
export { getNextStatuses } from "@/lib/order-utils";
```
<details><summary>回答</summary>
`"use server"` が付いたファイルはNext.jsがServer Action専用として扱うため、通常のテスト環境からimportすると問題が起きる。純粋関数（DBに依存しない計算だけの関数）を別ファイルに分離することで、テストから安全にimportできる。
</details>

**Q2.** revalidatePathの使い方で、以下のように複数パスを指定しているのはなぜですか？
```ts
revalidatePath("/admin/orders");
revalidatePath(`/admin/orders/${orderId}`);
revalidatePath("/mypage/orders");
```
<details><summary>回答</summary>
注文ステータスの変更は3つのページに影響する: 管理者の注文一覧、管理者の注文詳細、ユーザーの注文履歴。全てのキャッシュを無効化して最新データを表示させるため、影響する全パスをrevalidateする。
</details>

**Q3.** package.jsonに以下のスクリプトが2つあるのはなぜですか？
```json
"test": "vitest run",
"test:watch": "vitest"
```
<details><summary>回答</summary>
`test`: テストを1回実行して終了。CI/CDやコミット前の確認に使う。`test:watch`: ファイルの変更を監視し、変更があるたびにテストを再実行。開発中のリアルタイムフィードバックに使う。
</details>

**Q4.** 以下のtodo.mdの変更は何を意味しますか？
```diff
-| Ch.1 全体像を掴もう | 環境構築・画面設計 | 5-1, 5-2, 5-6, 4-2 |
+| Ch.1 全体像を掴もう | 環境構築・画面設計 | 5-1, 5-2, 5-6, 4-2 | ✅ 完了 |
```
<details><summary>回答</summary>
Chapter 1の全タスク（5-1, 5-2, 5-6, 4-2）が完了したことを示すステータス列を追加した。プロジェクト全体の進捗を一目で把握できるようにするため。
</details>

**Q5.** development-framework.mdの「検証記録」セクションに「フレームワークへの気づき」列がある理由は何ですか？
<details><summary>回答</summary>
フレームワーク自体が仮説であり、実践を通じて改善していくため。各Phaseの実践中に「この教え方は効果的だった」「ここは改善が必要」という気づきを記録し、フレームワークのv2に反映する。
</details>

### 上級（応用的な実装）

**Q1.** CIパイプラインにユニットテストを組み込むGitHub Actionsの設定を書いてください。
<details><summary>回答</summary>

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm test
```
</details>

**Q2.** Sentryを導入してエラーログを集約する場合、Next.js App Routerではどのファイルに設定しますか？
<details><summary>回答</summary>
1. `sentry.client.config.ts`（クライアントサイドの初期化）。2. `sentry.server.config.ts`（サーバーサイドの初期化）。3. `next.config.ts`に`withSentryConfig`を適用。4. `instrumentation.ts`でサーバーサイドの初期化。5. `global-error.tsx`でグローバルエラーをキャプチャ。
</details>

**Q3.** Google Analyticsを導入して「カート追加率」を計測するには、どのイベントをトラッキングしますか？
<details><summary>回答</summary>
1. `view_item`: 商品詳細ページの表示。2. `add_to_cart`: カートに追加ボタンのクリック。3. `begin_checkout`: 購入手続きボタンのクリック。4. `purchase`: 決済完了。カート追加率 = add_to_cart / view_item × 100。
</details>

**Q4.** データベースのバックアップ戦略を設計してください。
<details><summary>回答</summary>
Supabaseの場合: 1. Supabase Pro以上で自動バックアップ（日次）が利用可能。2. 手動バックアップとして `pg_dump` でSQLダンプを定期的にエクスポート。3. マイグレーションファイルをGitで管理しているので、スキーマはいつでも再作成可能。4. 商品データやユーザーデータは定期的なエクスポートスクリプトを用意。
</details>

**Q5.** パフォーマンスモニタリングを導入する場合、ECサイトで特に重要な指標は何ですか？
<details><summary>回答</summary>
1. LCP（Largest Contentful Paint）: 商品一覧の表示速度。2. FID/INP: カートに追加ボタンの応答速度。3. TTFB（Time to First Byte）: サーバーレスポンス時間。4. API応答時間: Supabaseクエリの実行時間。5. Stripe Checkout遷移時間。Core Web Vitalsの3指標（LCP、INP、CLS）がSEOにも影響する。
</details>

### 玄人（深い理解）

**Q1.** 今回のプロジェクトのコードベースをリファクタリングするとしたら、最初に手をつけるべき箇所はどこですか？コードの具体例で説明してください。
<details><summary>回答</summary>
Supabaseのクエリ結果の型定義。現在は`as unknown as CartItemWithDetails[]`のような型アサーションが多い。Supabase CLIで`npx supabase gen types typescript`を実行して型定義ファイルを自動生成し、クエリ結果の型安全性を確保する。これによりDBスキーマ変更時の型不整合を自動検出できる。
</details>

**Q2.** モノレポ（monorepo）構成に移行する場合のメリット・デメリットとディレクトリ構成を提案してください。
<details><summary>回答</summary>

```
packages/
  web/         # Next.jsアプリ
  db/          # Supabaseマイグレーション・型定義
  ui/          # 共通UIコンポーネント
  config/      # ESLint・TSConfig共有
```
メリット: コード共有、依存関係の一元管理、型定義の共有。デメリット: ビルド設定の複雑化、CI時間の増加。現段階ではオーバーエンジニアリング。チームが2人以上になったら検討。
</details>

**Q3.** 今回のフレームワークをOSS化して公開する場合、必要な作業を5つ挙げてください。
<details><summary>回答</summary>
1. ライセンスの選定と記載（MIT等）。2. 個人情報・API キーの完全除去（git履歴含む）。3. セットアップの自動化（テンプレートリポジトリ or CLI）。4. ドキュメントの整理（コントリビューションガイド、Code of Conduct）。5. デモサイトのデプロイ（フレームワークの実践例として）。
</details>

**Q4.** 「テスト駆動開発（TDD）」と今回の「理解駆動開発」を比較し、それぞれの適切な使用場面を説明してください。
<details><summary>回答</summary>
TDD: テストを先に書き、テストを通すためにコードを書く。明確な仕様がある場合、バグの再発防止に有効。理解駆動開発: 概念を理解してからコードを書く。学習目的、新しい技術の習得に有効。TDDは「何を作るか明確な場合」、理解駆動開発は「何を作るか学びながら決める場合」に適している。両者は排他的ではなく組み合わせ可能。
</details>

**Q5.** 5年後にこのコードベースをメンテナンスする開発者に向けて、最も伝えたいことを1つだけ書くとしたら何ですか？
<details><summary>回答</summary>
「RLSポリシーを絶対に無効化しないでください。セキュリティの最後の砦です。パフォーマンスのためにRLSを外したくなるかもしれませんが、代わりにクエリの最適化やキャッシュの導入を検討してください。RLSの一覧はdocs/db-design.mdのRLSポリシーセクションに記載されています。」
</details>
