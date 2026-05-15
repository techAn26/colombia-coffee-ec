# Chapter 9: サイトの顔を仕上げよう — 理解度テスト

---

## IT知識・概念理解

### 初級（絶対に抑えてほしい基礎知識）

**Q1.** 「レスポンシブデザイン」とは何ですか？なぜ必要なのか説明してください。

<details><summary>回答</summary>

レスポンシブデザインとは、スマートフォン・タブレット・PCなど、画面サイズが異なるデバイスでも適切に表示されるように自動調整するデザイン手法です。

必要な理由:
1. **ユーザーの多様性**: 現在のWebアクセスの約半数以上がモバイルデバイスから
2. **UX向上**: PC用のレイアウトをスマホで見ると文字が小さすぎて読めない、ボタンが押しにくい
3. **SEO**: Googleはモバイルフレンドリーなサイトを検索順位で優遇する
4. **コスト削減**: PC用とスマホ用のサイトを別々に作るより、1つのコードで対応する方が効率的
</details>

**Q2.** 「スケルトンUI」とは何ですか？通常のローディング表示（「読み込み中...」テキスト）との違いを説明してください。

<details><summary>回答</summary>

スケルトンUIとは、データが読み込まれる前に「こんなレイアウトになりますよ」という骨格（灰色の四角や線）を先に表示する仕組みです。

**通常のローディングとの違い:**

| 観点 | 「読み込み中...」 | スケルトンUI |
|------|------------------|-------------|
| 見た目 | テキストだけ | 実際のレイアウトに似た灰色の図形 |
| 切り替わり | 突然画面が変わる（チカチカ） | 灰色がスムーズに実データに変わる |
| ユーザーの感覚 | 「まだかな？」（不安） | 「もうすぐ来る」（安心） |
| CLS対策 | レイアウトが大きくズレる | レイアウトが安定する |

AmazonやYouTubeでも使われている手法で、ユーザーに「ここに商品カードが表示されますよ」と事前に伝えることで、体感的な待ち時間を短く感じさせます。
</details>

**Q3.** `error.tsx` と `not-found.tsx` の違いを説明してください。それぞれどのような状況で表示されますか？

<details><summary>回答</summary>

**`error.tsx`（エラーページ）:**
- 表示される状況: サーバーエラー、DB接続失敗、予期しない例外が発生した場合
- 目的: 「問題が発生しました」とユーザーに伝え、「もう一度試す」ボタンで復帰を促す
- HTTPステータス: 500（Internal Server Error）

**`not-found.tsx`（404ページ）:**
- 表示される状況: 存在しないURLにアクセスした場合、削除された商品のページにアクセスした場合
- 目的: 「このページは存在しません」とユーザーに伝え、トップページへのリンクを表示する
- HTTPステータス: 404（Not Found）

**違い:** error.tsxは「サーバー側の問題」、not-found.tsxは「ユーザーがアクセスしたURLが存在しない」という問題を扱います。
</details>

**Q4.** CTA（Call to Action）とは何ですか？ECサイトにおけるCTAの例を3つ挙げてください。

<details><summary>回答</summary>

CTAとは「行動喚起」の略で、ユーザーに次のアクションを促すUI要素（主にボタンやリンク）のことです。

ECサイトにおけるCTAの例:
1. **「商品を見る」ボタン** — トップページのヒーローセクションで、商品一覧への誘導
2. **「カートに入れる」ボタン** — 商品詳細ページで、購入アクションへの誘導
3. **「レジに進む」ボタン** — カートページで、決済フローへの誘導

CTAのデザインのポイント:
- 目立つ色（サイトのアクセントカラー）を使う
- 動詞で始まるテキスト（「見る」「買う」「始める」）
- 画面内で最も重要なアクションを1つ目立たせる
</details>

**Q5.** Next.jsの「規約ファイル」とは何ですか？`loading.tsx`, `error.tsx`, `not-found.tsx` がどのように動作するか説明してください。

<details><summary>回答</summary>

規約ファイル（Convention Files）とは、Next.js App Routerで特定のファイル名を使うと、自動的に特定の機能が適用される仕組みです。

| ファイル名 | 機能 | 自動的に行われること |
|-----------|------|-------------------|
| `loading.tsx` | ローディングUI | ページのデータ取得中にこのUIが表示される |
| `error.tsx` | エラーUI | ページでエラーが発生した場合にこのUIが表示される |
| `not-found.tsx` | 404 UI | `notFound()` が呼ばれた場合にこのUIが表示される |
| `layout.tsx` | レイアウト | 子ページを包むレイアウト（ヘッダー、サイドバー等） |
| `page.tsx` | ページ | ルートに対応するメインコンテンツ |

これらのファイルを配置するだけで、Next.jsが自動的にReactのSuspense BoundaryやError Boundaryを設定してくれます。設定コードを書く必要がありません。
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q6.** Next.jsのMiddleware（proxy）がリクエストのライフサイクルのどの時点で実行されるか、ページレンダリングとの関係を説明してください。

<details><summary>回答</summary>

**リクエストのライフサイクル:**

```
ユーザーのリクエスト
  ↓
[1. Proxy（旧Middleware）] ← ここで実行される
  ↓ リダイレクト or 続行
[2. レイアウト（layout.tsx）]
  ↓
[3. ローディング表示（loading.tsx）]
  ↓ データ取得中
[4. ページ（page.tsx）]
  ↓ エラー発生時
[5. エラー表示（error.tsx）]
```

**Proxyの位置づけ:**
- ページのレンダリングより**前**に実行される
- ページコンポーネントのコードは一切実行されない段階で判定する
- ここでリダイレクトすれば、ページのレンダリング自体が発生しないため高速
- 認証チェック・権限チェックのような「入口で判定すべき処理」に最適

**Proxyでやるべきこと:**
- ログインチェック → 未ログインなら `/login` にリダイレクト
- 管理者チェック → 非adminなら `/` にリダイレクト

**Proxyでやるべきでないこと:**
- データベースへの重い問い合わせ（レスポンスが遅くなる）
- 個別のデータの存在チェック（ページ内で `notFound()` を使う）
</details>

**Q7.** トップページの4セクション構成（ヒーロー・おすすめ商品・ストーリー・こだわり）の順番に、マーケティング的な意図がある理由を説明してください。

<details><summary>回答</summary>

**セクションの順番と意図:**

1. **ヒーロー（最上部）**: 「ここは何のサイトか」を一瞬で伝える。キャッチコピーと2つのCTAで、来訪者に最初の行動を促す。ファーストビュー（スクロールなしで見える範囲）に収める

2. **おすすめ商品**: 「何が買えるか」を具体的に見せる。興味を持った人がすぐに商品に遷移できる。4商品のグリッドで選びやすく

3. **ブランドストーリー**: 「なぜこの店で買うべきか」を伝える。価格だけでなく「想い」で差別化。購入意欲が高くない人も、ストーリーで心を動かされて購買につながる

4. **3つのこだわり**: 「他と何が違うか」を明確に。農園直送・トレーサビリティ・選べる楽しさ。購入の背中を押す最後のひと押し

**この順番のフレームワーク:** AIDA（Attention → Interest → Desire → Action）に基づいています。
- Attention: ヒーローで注意を引く
- Interest: おすすめ商品で興味を持たせる
- Desire: ストーリーとこだわりで欲求を生む
- Action: ページ全体を通じてCTAに誘導
</details>

**Q8.** CLS（Cumulative Layout Shift）とは何ですか？スケルトンUIがCLSの改善にどう貢献するか説明してください。

<details><summary>回答</summary>

**CLSとは:**
CLS（Cumulative Layout Shift）は、ページ読み込み中にレイアウトが予期せずズレる度合いを数値化したWeb指標です。Google Core Web Vitalsの1つで、0に近いほど良い（0.1以下が「良好」）。

**CLSが発生する例:**
- 画像の読み込み前はテキストだけ表示 → 画像が読み込まれると下のコンテンツが押し下げられる
- 「読み込み中...」のテキスト → 商品カード4枚に切り替わると高さが大幅に変わる

**スケルトンUIがCLSを改善する理由:**
- スケルトンが実際のコンテンツと同じサイズ・レイアウトで表示される
- データが読み込まれても「灰色 → 実データ」に変わるだけで、要素のサイズは変わらない
- 周囲のコンテンツが押されたり引っ張られたりしない

```
悪い例: [テキスト] → [商品カード4枚] （高さが50px→400pxに変化 = レイアウトシフト）
良い例: [スケルトン4枚] → [商品カード4枚] （高さが400px→400pxで変化なし = シフトなし）
```
</details>

**Q9.** `error.tsx` の「もう一度試す」ボタンが `reset()` 関数を呼ぶ仕組みを説明してください。

<details><summary>回答</summary>

`error.tsx` はReactのError Boundary（エラー境界）として機能します。

```typescript
"use client"; // error.tsx は必ず Client Component

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>問題が発生しました</h2>
      <button onClick={() => reset()}>もう一度試す</button>
    </div>
  );
}
```

**`reset()` の動作:**
1. Error Boundaryの状態をクリアする（エラーをキャッチした状態を解除）
2. 同じページコンポーネントの再レンダリングを試みる
3. Server Componentの場合、データの再取得も行われる

**使い所:**
- 一時的なネットワークエラー → リトライで成功する可能性が高い
- DBの一時的な負荷 → 少し待ってリトライすれば解決する可能性

**注意:** エラーの原因がコードのバグの場合は、`reset()` を押しても同じエラーが繰り返されます。
</details>

**Q10.** ヒーローセクションで「メインCTA」と「サブCTA」を分ける理由は何ですか？

<details><summary>回答</summary>

**メインCTA（「商品を見る」）:**
- サイトの主目的（商品購入）に直結する最も重要なアクション
- 目立つデザイン（塗りつぶしボタン、大きめ、アクセントカラー）
- 購買意欲が高いユーザーに最短ルートを提供

**サブCTA（「ストーリーを読む」）:**
- すぐに買うつもりはないが、興味はあるユーザー向け
- 控えめなデザイン（アウトラインボタン、小さめ、セカンダリカラー）
- ブランドの世界観を知ってもらい、将来の購買につなげる

**分ける理由:**
1. **ユーザーの温度感に対応**: すぐ買いたい人と情報収集中の人の両方をキャッチ
2. **視覚的優先順位**: 2つのCTAが同じデザインだと「どちらを押すべきか」迷う
3. **コンバージョンへの導線**: メインCTAに自然と目が行くようにデザインで誘導
4. **離脱防止**: 「商品を見る」に興味がない人でも「ストーリーを読む」で滞在してもらえる
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q11.** Next.jsのMiddleware（proxy）から、Next.js 16のProxy APIへの移行で、機能的に変わった点と変わらない点を説明してください。

<details><summary>回答</summary>

**変わらない点（機能は同じ）:**
- リクエストのインターセプト（途中で捕まえる）
- リダイレクト、リライトの実行
- ヘッダーの書き換え
- cookieの読み書き
- マッチャー（特定パスにのみ適用）の設定

**変わった点:**
- **ファイル名**: `middleware.ts` → `proxy.ts`
- **関数名**: `export function middleware()` → `export function proxy()`
- **名前の意図**: 「ミドルウェア」は汎用的すぎた。「プロキシ（代理）」の方がこの機能の本質（リクエストの代理処理）を正確に表現

**移行作業:**
1. `middleware.ts` を `proxy.ts` にリネーム
2. 関数名を `middleware` から `proxy` に変更
3. exportの名前も変更
4. 機能的な変更は不要

**重要な学び:**
フレームワークのバージョンアップで名前が変わることは珍しくありません。大切なのは「名前」ではなく「何をする機能か」を理解していること。機能を理解していれば、名前が変わっても対応できます。
</details>

**Q12.** レスポンシブデザインで「モバイルファースト」と「デスクトップファースト」のアプローチの違いと、それぞれの適用場面を説明してください。

<details><summary>回答</summary>

**モバイルファースト:**
- 最小画面（スマホ）のデザインを基準に作り、画面が大きくなるにつれてレイアウトを拡張する
- CSSの書き方: `min-width` のメディアクエリ
```css
/* ベース: モバイル */
.grid { grid-template-columns: 1fr; }

/* タブレット以上 */
@media (min-width: 768px) { .grid { grid-template-columns: repeat(2, 1fr); } }

/* PC以上 */
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(4, 1fr); } }
```
- Tailwind CSS: `md:`, `lg:` プレフィックスがモバイルファースト

**デスクトップファースト:**
- 大画面（PC）のデザインを基準に作り、画面が小さくなるにつれてレイアウトを縮小する
- CSSの書き方: `max-width` のメディアクエリ

**適用場面:**
| アプローチ | 適用場面 |
|-----------|---------|
| モバイルファースト | ECサイト（モバイルからの購入が多い）、ブログ、ニュースサイト |
| デスクトップファースト | 管理画面、ダッシュボード、複雑なデータ表示 |

**本アプリ:** ECサイトなのでモバイルファーストが適切。Tailwind CSSはモバイルファーストが前提の設計になっています。
</details>

**Q13.** 「おすすめ商品」セクションで最新4件を表示する設計について、代替案（人気順、管理者が選んだ商品、AIレコメンド）との比較を行ってください。

<details><summary>回答</summary>

| 方式 | メリット | デメリット | 実装難易度 |
|------|---------|-----------|----------|
| **最新4件** | シンプル。新商品のアピール。更新感がある | 古い人気商品が埋もれる。新商品が良い商品とは限らない | 低（ORDER BY created_at） |
| **人気順（売上数）** | 実績に基づく。社会的証明効果 | 新商品が表示されにくい。売上データの集計が必要 | 中（注文データの集計クエリ） |
| **管理者が選んだ商品** | 意図的なプロモーション。季節商品の訴求 | 更新を忘れると古いまま。管理コスト | 中（featured フラグ or 順序カラム） |
| **AIレコメンド** | パーソナライズ。ユーザーごとに最適化 | 実装が複雑。データが少ないうちは精度が低い。コスト | 高（ML基盤が必要） |

**MVPの判断:** 最新4件が最適。理由:
1. 実装がシンプル（追加のクエリやロジック不要）
2. 商品数が少ない段階では、最新=全体のカバーに近い
3. 新商品を追加するたびにトップページが自動更新される

**段階的な改善:**
MVP → 最新4件
成長期 → 管理者が選んだ商品（featured フラグ追加）
成熟期 → 売上データに基づく人気順 + 管理者ピックのハイブリッド
</details>

**Q14.** ローディングUI（`loading.tsx`）が表示される時間が長い場合のUX改善方法を3つ挙げてください。

<details><summary>回答</summary>

1. **段階的な表示（Streaming SSR）:**
   - ページ全体を待つのではなく、準備できた部分から順に表示する
   - React Server Componentsの `<Suspense>` を使い、各セクションを個別にストリーミング
   ```tsx
   <Suspense fallback={<HeroSkeleton />}>
     <HeroSection />
   </Suspense>
   <Suspense fallback={<ProductsSkeleton />}>
     <RecommendedProducts /> {/* ← DB問い合わせがある部分 */}
   </Suspense>
   ```
   - ヒーロー（静的）はすぐ表示、おすすめ商品（DB取得）は後から表示

2. **データ取得の最適化:**
   - 不要なデータを取得しない（`select` で必要なカラムだけ指定）
   - データベースにインデックスを追加して検索を高速化
   - クエリの `N+1問題` を解消（リレーション取得を1クエリにまとめる）

3. **キャッシュ戦略:**
   - `unstable_cache` や ISR（Incremental Static Regeneration）でデータをキャッシュ
   - 頻繁に変わらないデータ（商品情報等）はキャッシュし、ローディング自体を発生させない
   - `revalidate` 期間を設定して定期的にキャッシュを更新
</details>

**Q15.** ダークモード対応を実装する場合の技術的なアプローチと、ECサイトでダークモードが適切かどうかの判断を述べてください。

<details><summary>回答</summary>

**技術的なアプローチ:**

1. **CSSメディアクエリ（OS設定に追従）:**
```css
@media (prefers-color-scheme: dark) {
  :root { --bg: #1a1a1a; --text: #ffffff; }
}
```

2. **Tailwind CSSのダークモード:**
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```
- `tailwind.config.ts` で `darkMode: 'class'` を設定
- `<html>` タグに `dark` クラスを付け外しで切り替え

3. **ユーザー選択の保存:**
```typescript
// localStorage または cookie に保存
localStorage.setItem("theme", "dark");
```

**ECサイトでダークモードは適切か:**

**慎重に検討すべき理由:**
- 商品画像の色味が変わって見える（白背景で撮影した商品写真がダーク背景で浮く）
- 商品の色が正確に伝わらない場合がある（特にアパレル、食品）
- CTAボタンの視認性がダークモードで低下する可能性

**適切な場合:**
- テック系の商品（開発者向けツール等）
- コンテンツ中心のサイト（ブログ、ニュース）
- ユーザーからの要望が多い場合

**コーヒー豆ECの場合:** ダークモードは商品の見た目に影響しにくい（茶色系の商品）ため、対応しても問題は少ない。ただしMVPでの優先度は低く、ユーザーからの要望があれば検討レベル。
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q16.** Core Web Vitals（LCP, FID/INP, CLS）の3つの指標が何を測り、Next.jsのApp Routerがそれぞれにどう貢献しているか説明してください。

<details><summary>回答</summary>

**LCP（Largest Contentful Paint）— 最大コンテンツの描画時間:**
- 何を測る: ページ内の最も大きなコンテンツ（画像、テキストブロック等）が表示されるまでの時間
- 良好: 2.5秒以内
- App Routerの貢献:
  - Server ComponentによるSSRで、HTMLにデータが含まれた状態で配信
  - Streaming SSRで、ヒーロー画像などの主要コンテンツを優先配信
  - `<Image>` コンポーネントの `priority` 属性でLCPの画像を優先読み込み

**INP（Interaction to Next Paint）— インタラクション応答性:**
- 何を測る: ユーザーの操作（クリック、タップ等）から画面が更新されるまでの時間
- 良好: 200ミリ秒以内
- App Routerの貢献:
  - Server Componentは操作のたびにJavaScriptが動く必要がない（静的HTML）
  - Client Componentは必要な部分だけに限定し、JavaScriptバンドルを小さく保つ
  - `useTransition` で重い処理中もUIがブロックされない

**CLS（Cumulative Layout Shift）— レイアウトの安定性:**
- 何を測る: ページ読み込み中にレイアウトがズレる度合い
- 良好: 0.1以下
- App Routerの貢献:
  - `loading.tsx` のスケルトンUIでレイアウトシフトを防止
  - `<Image>` コンポーネントの`width`/`height`指定でレイアウト確保
  - フォントの `font-display: swap` + `next/font` でフォント読み込みによるシフトを防止
</details>

**Q17.** サイト全体のレイアウト（ヘッダー・フッター）を `layout.tsx` で定義するメリットと、レイアウトのネスト（入れ子）が有効な場面を説明してください。

<details><summary>回答</summary>

**`layout.tsx` でレイアウトを定義するメリット:**

1. **コードの重複排除**: ヘッダーとフッターを全ページに書く必要がない
2. **パフォーマンス**: ページ遷移時にレイアウトは再レンダリングされない（子だけが差し替わる）
3. **状態の保持**: レイアウト内のstateがページ遷移で消えない（例: サイドバーの開閉状態）
4. **一貫性**: サイト全体で統一されたヘッダー・フッターを保証

**レイアウトのネストが有効な場面:**

```
app/
  layout.tsx           ← 全体レイアウト（ヘッダー + フッター）
  page.tsx             ← トップページ
  admin/
    layout.tsx         ← 管理画面レイアウト（サイドナビ追加）
    page.tsx           ← ダッシュボード
    products/page.tsx  ← 商品管理
  mypage/
    layout.tsx         ← マイページレイアウト（タブナビ追加）
    orders/page.tsx    ← 注文履歴
    profile/page.tsx   ← プロフィール
```

- **管理画面**: 全体のヘッダーに加えて、管理者用のサイドナビを追加
- **マイページ**: 全体のヘッダーに加えて、マイページ内のタブナビを追加
- **認証ページ**: ヘッダー・フッターを非表示にするため、別のレイアウトを使用

ネストにより、各セクションに固有のUI要素を追加しつつ、全体のレイアウトも維持できます。
</details>

**Q18.** 「プログレッシブエンハンスメント」の考え方を、エラーハンドリングUIに適用する場合の設計を説明してください。

<details><summary>回答</summary>

**プログレッシブエンハンスメントとは:**
基本機能はJavaScriptなし（またはエラー時）でも動作し、JavaScriptが使える環境ではより良い体験を提供する設計思想です。

**エラーハンドリングへの適用:**

**レベル1: HTML（最低限の体験）**
```html
<!-- JavaScriptが無効でも表示される -->
<div class="error-page">
  <h2>問題が発生しました</h2>
  <p>ページを再読み込みしてください</p>
  <a href="/">トップページに戻る</a> <!-- ← JSなしでも動くリンク -->
</div>
```

**レベル2: JavaScript有効（より良い体験）**
```typescript
"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>問題が発生しました</h2>
      <button onClick={reset}>もう一度試す</button> {/* ← ページ遷移なしでリトライ */}
      <details>
        <summary>エラー詳細</summary>
        <pre>{error.message}</pre> {/* ← 開発者向け情報 */}
      </details>
    </div>
  );
}
```

**レベル3: 高機能な体験**
```typescript
// エラー発生時に自動でエラートラッキングサービスに報告
useEffect(() => {
  reportError(error); // Sentry, Datadog等に送信
}, [error]);

// 自動リトライ（3回まで）
useEffect(() => {
  if (retryCount < 3) {
    const timer = setTimeout(reset, 2000);
    return () => clearTimeout(timer);
  }
}, [retryCount]);
```

**ポイント:** 最悪のケース（JSエラー、ネットワーク断）でも「トップページに戻る」リンクだけは機能するようにしておくことが重要です。
</details>

**Q19.** `next/font` を使ったフォント最適化の仕組みと、フォントがUXに与える影響を説明してください。

<details><summary>回答</summary>

**`next/font` の仕組み:**
```typescript
import { Noto_Sans_JP } from "next/font/google";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

// layout.tsx
<body className={notoSansJP.className}>
```

**最適化の内容:**
1. **ビルド時にフォントファイルをダウンロード**: Google Fontsへの外部リクエストが不要になる
2. **セルフホスティング**: フォントファイルがアプリと同じサーバーから配信される（DNSルックアップ削減）
3. **CSS `size-adjust`**: フォールバックフォントのサイズを調整し、本来のフォントとのレイアウトシフトを最小化
4. **サブセット化**: 日本語フォント全体（数MB）ではなく、使用する文字のサブセットだけ配信

**フォントがUXに与える影響:**

| 問題 | 影響 | 対策 |
|------|------|------|
| FOIT（Flash of Invisible Text） | フォント読み込み中にテキストが見えない | `display: swap` で代替フォントを先に表示 |
| FOUT（Flash of Unstyled Text） | 代替フォント→本来のフォントに切り替わる瞬間のチラつき | `size-adjust` でサイズを合わせる |
| CLS | フォント切り替えでレイアウトがズレる | `next/font` の自動最適化 |
| 読み込み遅延 | 日本語フォントは大きい（数MB） | サブセット化で必要な文字だけ配信 |
</details>

**Q20.** ECサイトの「コンバージョン最適化」の観点から、トップページの改善指標（KPI）と、データに基づいた改善サイクルを説明してください。

<details><summary>回答</summary>

**トップページの主要KPI:**

| KPI | 計測方法 | 目標 |
|-----|---------|------|
| 直帰率 | トップページだけ見て離脱した割合 | 40%以下 |
| CTAクリック率 | 「商品を見る」ボタンのクリック割合 | 15%以上 |
| スクロール深度 | ページのどこまでスクロールされたか | 50%以上が「こだわり」まで到達 |
| 商品一覧への遷移率 | トップ→商品一覧に遷移した割合 | 30%以上 |
| 平均滞在時間 | トップページでの滞在時間 | 30秒以上 |

**データに基づいた改善サイクル:**

1. **計測（Measure）:**
   - Google Analytics 4でイベントトラッキング
   - ヒートマップツール（Clarity, Hotjar）でクリック位置・スクロール深度を可視化

2. **分析（Analyze）:**
   - 「ヒーローのCTAが押されていない」→ コピーの問題？ボタンの視認性？
   - 「スクロールされていない」→ ファーストビューで興味を引けていない

3. **仮説（Hypothesize）:**
   - 「CTAのテキストを『商品を見る』→『人気のコーヒー豆を見る』に変えたら、具体性が増してクリック率が上がるのでは？」

4. **テスト（Test）:**
   - A/Bテスト: 50%のユーザーに変更版を表示し、クリック率を比較

5. **学習（Learn）:**
   - 結果を記録し、次の改善に活かす

**MVPでの優先度:** まずはGoogle Analytics 4を導入して計測基盤を作ること。データなしの「勘」による改善は避けます。
</details>

---

## コーディング・操作理解

### 初級（絶対に抑えてほしい基礎知識）

**Q21.** 以下のTailwind CSSクラスを読んで、どのようなレスポンシブ対応をしているか説明してください。

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {products.map(p => <ProductCard key={p.id} product={p} />)}
</div>
```

<details><summary>回答</summary>

画面サイズに応じて、商品カードのグリッド列数が変化します。

| 画面サイズ | クラス | 列数 | 表示 |
|-----------|--------|------|------|
| モバイル（〜767px） | `grid-cols-1` | 1列 | 商品カードが縦に並ぶ |
| タブレット（768px〜1023px） | `md:grid-cols-2` | 2列 | 2列のグリッド |
| PC（1024px〜） | `lg:grid-cols-4` | 4列 | 4列のグリッド |

`gap-6` は全ての画面サイズでカード間に24px（1.5rem）の余白を設定しています。

Tailwind CSSはモバイルファーストなので、プレフィックスなしの `grid-cols-1` がベース（最小画面）で、`md:` や `lg:` で画面が大きくなるにつれて列数を増やしています。
</details>

**Q22.** 以下の `loading.tsx` は何をしていますか？

```tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin text-4xl">☕</div>
      <p className="ml-4 text-gray-500">読み込み中...</p>
    </div>
  );
}
```

<details><summary>回答</summary>

ページのデータ取得中に表示されるローディングUIです。

- `flex items-center justify-center`: 要素を水平・垂直方向に中央配置
- `min-h-[50vh]`: 最低でもビューポートの半分の高さを確保（画面の真ん中あたりに表示）
- `animate-spin`: コーヒーカップの絵文字を回転アニメーション
- `text-4xl`: コーヒーカップを大きめに表示
- `ml-4 text-gray-500`: テキストを左マージン付きの灰色で表示

ファイル名が `loading.tsx` であることにより、同じフォルダの `page.tsx` がデータを取得している間、Next.jsが自動的にこのコンポーネントを表示します。設定コードは不要です。
</details>

**Q23.** 以下の `not-found.tsx` で、`Link` コンポーネントを使っている理由を説明してください。

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="mt-4 text-gray-600">ページが見つかりませんでした</p>
      <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
        トップページに戻る
      </Link>
    </div>
  );
}
```

<details><summary>回答</summary>

Next.jsの `Link` コンポーネントは、通常の `<a>` タグと異なり、クライアントサイドナビゲーションを行います。

| 要素 | 動作 | 違い |
|------|------|------|
| `<a href="/">` | フルページリロード | サーバーにリクエスト→HTML全体を取得→全リソース再読み込み |
| `<Link href="/">` | クライアントサイド遷移 | JSで必要な部分だけ差し替え→高速でスムーズ |

`Link` を使うメリット:
1. ページ遷移が高速（フルリロードしない）
2. レイアウト（ヘッダー等）が再レンダリングされない
3. プリフェッチ: マウスホバー時に遷移先のデータを事前取得

404ページからトップに戻る体験が、スムーズで高速になります。
</details>

**Q24.** ヒーローセクションのCTAボタンのスタイリングで、メインとサブの違いを作っているTailwind CSSを読み解いてください。

```tsx
<div className="flex gap-4">
  <Link href="/products" className="bg-amber-800 text-white px-8 py-3 rounded-lg hover:bg-amber-900 font-bold">
    商品を見る
  </Link>
  <Link href="/story" className="border-2 border-amber-800 text-amber-800 px-8 py-3 rounded-lg hover:bg-amber-50">
    ストーリーを読む
  </Link>
</div>
```

<details><summary>回答</summary>

**メインCTA（「商品を見る」）:**
- `bg-amber-800 text-white`: 茶色の背景に白い文字（塗りつぶしボタン）
- `hover:bg-amber-900`: ホバー時により濃い茶色に変化
- `font-bold`: 太字で目立たせる
- 効果: 背景色で塗りつぶされているため、視覚的に最も目立つ

**サブCTA（「ストーリーを読む」）:**
- `border-2 border-amber-800 text-amber-800`: 茶色の枠線と茶色の文字（アウトラインボタン）
- `hover:bg-amber-50`: ホバー時に薄い茶色の背景が表示
- `font-bold` なし: 通常の太さ
- 効果: 枠線だけなので、メインCTAより控えめ

**共通:**
- `px-8 py-3`: 十分なパディング（押しやすいサイズ）
- `rounded-lg`: 角丸

デザインの原則: メインCTA = 塗りつぶし（目立つ）、サブCTA = アウトライン（控えめ）で、ユーザーの視線を自然にメインCTAに誘導します。
</details>

**Q25.** 以下のスケルトンUIコンポーネントが何を表現しているか説明してください。

```tsx
export default function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 h-48 rounded-lg" />
          <div className="mt-3 bg-gray-200 h-4 rounded w-3/4" />
          <div className="mt-2 bg-gray-200 h-4 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
```

<details><summary>回答</summary>

商品一覧ページの読み込み中に表示されるスケルトンUIです。

- `Array.from({ length: 8 })`: 8個の商品カードのスケルトンを生成
- `animate-pulse`: 灰色の要素が明滅するアニメーション（「読み込み中」を視覚的に伝える）
- `bg-gray-200 h-48 rounded-lg`: 商品画像の代わりの灰色の四角（高さ192px）
- `bg-gray-200 h-4 rounded w-3/4`: 商品名の代わりの灰色の線（幅75%）
- `bg-gray-200 h-4 rounded w-1/2`: 価格の代わりの灰色の線（幅50%）

グリッドのレスポンシブ対応も実際の商品一覧と同じ（`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`）なので、データが読み込まれても**レイアウトがズレない**（CLS = 0）。
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q26.** `error.tsx` で `"use client"` が必須な理由を説明してください。Server Componentとして書くことはできますか？

<details><summary>回答</summary>

`error.tsx` は **必ず Client Component** でなければなりません。理由:

1. **Error Boundary はクライアント側の機能**: ReactのError Boundaryはclass component の `componentDidCatch` ライフサイクルメソッドで動作し、これはクライアント側でのみ利用可能です

2. **`reset()` 関数の呼び出し**: 「もう一度試す」ボタンで `reset()` を呼ぶには、クライアント側のイベントハンドラ（`onClick`）が必要です

3. **状態の管理**: エラー発生後のUIはインタラクティブ（ボタンクリック等）であり、Client Componentが必要です

**Server Componentとして書けない理由:**
- Server Componentはサーバー上でHTMLを生成するだけで、クライアント側のインタラクションを処理できない
- `onClick` ハンドラを直接書くことができない
- Error Boundaryのライフサイクルがサーバー側には存在しない

```typescript
// これは動作しない
// "use server" ← error.tsx には書けない
export default function Error({ error, reset }) {
  return <button onClick={reset}>リトライ</button>; // ← Server Componentでは onClick が使えない
}
```
</details>

**Q27.** 以下のコードでトップページの「おすすめ商品」セクションを実装しています。Server Componentでデータ取得する利点を説明してください。

```tsx
// app/page.tsx (Server Component)
export default async function HomePage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <main>
      <HeroSection />
      <section>
        <h2>おすすめ商品</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products?.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </main>
  );
}
```

<details><summary>回答</summary>

**Server Componentでデータ取得する利点:**

1. **クライアントにJavaScriptが不要**: データ取得のコード（Supabaseクライアント、fetch等）がクライアントに送信されない。バンドルサイズが小さくなる

2. **SEO対応**: サーバーでHTMLが完成した状態で配信されるため、検索エンジンのクローラーが商品データを読み取れる。Client Componentでfetchする場合、JavaScriptを実行しないクローラーは空のHTMLしか見えない

3. **初回表示の高速化**: サーバーでデータ取得→HTML生成→クライアントに配信。クライアントはHTMLを受け取るだけで表示が完了する。useEffectでfetchする場合は「HTML表示→JS実行→fetch→データ取得→再レンダリング」と2往復かかる

4. **セキュリティ**: Supabaseのservice_role keyやサーバー専用の認証情報がクライアントに露出しない

5. **ウォーターフォール回避**: サーバー側でデータを取得してからHTMLを送るため、クライアントでの順次ロード（レイアウト→データ取得→表示）を避けられる
</details>

**Q28.** 以下のproxy.ts（旧middleware.ts）のコードを読んで、どのルートが保護されているか、どのルートが公開されているかを説明してください。

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公開ルート
  const publicPaths = ["/", "/products", "/story", "/login"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 以下、認証が必要なルート
  // ... セッションチェック
  // ... /admin/* は管理者チェック
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

<details><summary>回答</summary>

**公開ルート（認証不要）:**
- `/` — トップページ
- `/products` 以下 — 商品一覧・商品詳細（`/products/[id]`）
- `/story` — ブランドストーリーページ
- `/login` — ログインページ

**保護されたルート（認証必要）:**
- `/mypage` 以下 — マイページ、注文履歴、プロフィール、配送先
- `/cart`, `/checkout` — カート、決済
- `/admin` 以下 — 管理画面（管理者権限も必要）

**matcher の設定:**
- `/((?!_next/static|_next/image|favicon.ico).*)` は「`_next/static`（静的ファイル）、`_next/image`（最適化画像）、`favicon.ico` **以外の** すべてのリクエスト」にproxyを適用する
- 静的ファイルにまでプロキシを適用すると無駄な処理が走るため、除外している
</details>

**Q29.** スケルトンUIコンポーネントを、実際の商品カードと同じレイアウトになるように設計するためのポイントを3つ挙げてください。

<details><summary>回答</summary>

1. **同じグリッド設定を使う:**
```tsx
// 実際の商品一覧
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// スケルトンも同じグリッド
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
```
レスポンシブの列数とギャップが一致していれば、データ読み込み後にレイアウトがズレない

2. **各要素の高さを合わせる:**
```tsx
// 実際の商品カード
<img className="h-48" />         // 画像: 192px
<h3 className="text-lg">名前</h3> // テキスト: 約28px
<p className="text-sm">¥1,800</p> // テキスト: 約20px

// スケルトン
<div className="bg-gray-200 h-48 rounded" />      // 画像と同じ高さ
<div className="bg-gray-200 h-5 rounded w-3/4" />  // テキスト行と近い高さ
<div className="bg-gray-200 h-4 rounded w-1/2" />  // テキスト行と近い高さ
```

3. **同じ数の要素を表示する:**
```tsx
// 実際は最大8商品 → スケルトンも8個
Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
```
表示件数が異なると、ページ全体の高さが変わってCLSが発生する
</details>

**Q30.** 以下のヒーローセクションに、スクロールでおすすめ商品セクションに移動する「スムーズスクロール」を実装してください。

```tsx
function HeroSection() {
  return (
    <section className="py-20 text-center">
      <h1>最高のコーヒー豆を、あなたに</h1>
      <div className="flex gap-4 justify-center mt-8">
        <Link href="/products">商品を見る</Link>
        {/* ??? おすすめ商品セクションにスクロール */}
      </div>
    </section>
  );
}
```

<details><summary>回答</summary>

```tsx
function HeroSection() {
  return (
    <section className="py-20 text-center">
      <h1>最高のコーヒー豆を、あなたに</h1>
      <div className="flex gap-4 justify-center mt-8">
        <Link href="/products">商品を見る</Link>
        <a
          href="#recommended"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("recommended")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
          className="border-2 border-amber-800 text-amber-800 px-8 py-3 rounded-lg hover:bg-amber-50"
        >
          おすすめを見る
        </a>
      </div>
    </section>
  );
}

// おすすめ商品セクションにidを付ける
<section id="recommended">
  <h2>おすすめ商品</h2>
  ...
</section>
```

**ポイント:**
- `href="#recommended"` でJSが無効でも動作する（プログレッシブエンハンスメント）
- `scrollIntoView({ behavior: "smooth" })` でスムーズなスクロールアニメーション
- `e.preventDefault()` でURLに `#recommended` が付くのを防ぐ（ページジャンプの代わりにスムーズスクロール）
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q31.** Next.jsのStreaming SSRを使って、トップページの各セクションを段階的に表示する実装を示してください。

<details><summary>回答</summary>

```tsx
import { Suspense } from "react";

export default function HomePage() {
  return (
    <main>
      {/* ヒーローは静的コンテンツなのですぐ表示 */}
      <HeroSection />

      {/* おすすめ商品はDB問い合わせが必要 → Suspenseで分離 */}
      <Suspense fallback={<RecommendedSkeleton />}>
        <RecommendedProducts />
      </Suspense>

      {/* ストーリーは静的コンテンツなのですぐ表示 */}
      <StorySection />

      {/* こだわりは静的コンテンツなのですぐ表示 */}
      <FeaturesSection />
    </main>
  );
}

// データ取得を含むServer Component
async function RecommendedProducts() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <section id="recommended">
      <h2>おすすめ商品</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products?.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

function RecommendedSkeleton() {
  return (
    <section>
      <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg" />
            <div className="mt-3 bg-gray-200 h-4 rounded w-3/4" />
          </div>
        ))}
      </div>
    </section>
  );
}
```

**動作の流れ:**
1. ユーザーがアクセス → ヒーロー・ストーリー・こだわり（静的部分）が即座に表示
2. おすすめ商品部分にはスケルトンが表示
3. DB問い合わせが完了 → スケルトンが商品カードに置き換わる
4. ユーザーは静的部分を先に読める（待ち時間の有効活用）
</details>

**Q32.** 以下の `error.tsx` に、エラーの種類に応じて異なるメッセージを表示する改善と、エラートラッキング（Sentry等）への報告を追加してください。

```tsx
"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>問題が発生しました</h2>
      <button onClick={reset}>もう一度試す</button>
    </div>
  );
}
```

<details><summary>回答</summary>

```tsx
"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // エラートラッキングに報告
  useEffect(() => {
    // Sentry, Datadog等への報告
    console.error("Unhandled error:", error);
    // Sentry.captureException(error); // 本番環境
  }, [error]);

  // エラーの種類に応じたメッセージ
  const errorInfo = getErrorInfo(error);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
      <div className="text-6xl mb-4">{errorInfo.icon}</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">{errorInfo.title}</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">{errorInfo.description}</p>

      <div className="flex gap-4">
        <button
          onClick={reset}
          className="bg-amber-800 text-white px-6 py-2 rounded-lg hover:bg-amber-900"
        >
          もう一度試す
        </button>
        <Link
          href="/"
          className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50"
        >
          トップページに戻る
        </Link>
      </div>

      {/* 開発環境のみエラー詳細を表示 */}
      {process.env.NODE_ENV === "development" && (
        <details className="mt-8 max-w-lg w-full">
          <summary className="cursor-pointer text-gray-500 text-sm">エラー詳細</summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
            {error.message}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}

function getErrorInfo(error: Error) {
  if (error.message.includes("fetch") || error.message.includes("network")) {
    return {
      icon: "🌐",
      title: "通信エラー",
      description: "ネットワーク接続を確認して、もう一度お試しください。",
    };
  }
  if (error.message.includes("auth") || error.message.includes("unauthorized")) {
    return {
      icon: "🔒",
      title: "認証エラー",
      description: "セッションが切れた可能性があります。再度ログインしてください。",
    };
  }
  return {
    icon: "⚠️",
    title: "問題が発生しました",
    description: "一時的な問題が発生しています。時間をおいて再度お試しください。",
  };
}
```
</details>

**Q33.** レスポンシブ対応で、モバイルとPCでヘッダーのナビゲーションを切り替える（モバイルはハンバーガーメニュー、PCは横並びリンク）実装を示してください。

<details><summary>回答</summary>

```tsx
"use client";
import { useState } from "react";
import Link from "next/link";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">コーヒー豆ストア</Link>

        {/* PC: 横並びリンク */}
        <nav className="hidden md:flex gap-6">
          <Link href="/products" className="hover:text-amber-800">商品一覧</Link>
          <Link href="/story" className="hover:text-amber-800">ストーリー</Link>
          <Link href="/cart" className="hover:text-amber-800">カート</Link>
        </nav>

        {/* モバイル: ハンバーガーボタン */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="メニューを開く"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* モバイルメニュー（開いたときだけ表示） */}
      {isMenuOpen && (
        <nav className="md:hidden border-t px-4 py-4 space-y-3">
          <Link
            href="/products"
            className="block py-2 hover:text-amber-800"
            onClick={() => setIsMenuOpen(false)}
          >
            商品一覧
          </Link>
          <Link
            href="/story"
            className="block py-2 hover:text-amber-800"
            onClick={() => setIsMenuOpen(false)}
          >
            ストーリー
          </Link>
          <Link
            href="/cart"
            className="block py-2 hover:text-amber-800"
            onClick={() => setIsMenuOpen(false)}
          >
            カート
          </Link>
        </nav>
      )}
    </header>
  );
}
```

**ポイント:**
- `hidden md:flex`: モバイルでは非表示、タブレット以上で表示（PCナビ）
- `md:hidden`: タブレット以上で非表示（ハンバーガーボタン）
- リンクをクリックしたらメニューを閉じる（`setIsMenuOpen(false)`）
- `aria-label`, `aria-expanded` でアクセシビリティ対応
</details>

**Q34.** OGP（Open Graph Protocol）タグとは何か説明し、Next.js App Routerでの設定方法を示してください。

<details><summary>回答</summary>

**OGPとは:**
SNS（Twitter, Facebook, LINE等）でURLを共有したときに表示されるプレビュー（タイトル、画像、説明文）を制御するためのmetaタグです。

**設定なし**: URLだけが表示される（味気ない）
**設定あり**: タイトル、説明、画像がカード形式で表示される（クリック率が上がる）

**Next.js App Routerでの設定:**

```typescript
// app/layout.tsx（サイト全体のデフォルト）
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | コーヒー豆ストア",
    default: "コーヒー豆ストア - コロンビアコーヒー専門店",
  },
  description: "コロンビア産シングルオリジンコーヒー豆を農園直送でお届け",
  openGraph: {
    type: "website",
    siteName: "コーヒー豆ストア",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

// app/products/[id]/page.tsx（商品ごとの動的OGP）
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [{ url: product.image_url ?? "/og-image.png" }],
    },
  };
}
```

**ポイント:**
- `generateMetadata` で動的にメタデータを生成（商品ごとに異なるOGP）
- `template: "%s | コーヒー豆ストア"` で「商品名 | コーヒー豆ストア」形式のタイトルを自動生成
- OGP画像は 1200x630px が推奨サイズ
</details>

**Q35.** `loading.tsx` を配置する場所によって、ローディングUIの表示範囲が変わります。以下のディレクトリ構造でどのように動作するか説明してください。

```
app/
  loading.tsx          ← A
  products/
    loading.tsx        ← B
    page.tsx
    [id]/
      page.tsx
  admin/
    page.tsx
```

<details><summary>回答</summary>

**A: `app/loading.tsx`（ルートレベル）**
- **適用範囲**: サイト全体のデフォルトローディングUI
- **表示される場面**: 個別のloading.tsxがないページのデータ読み込み中
- **対象ページ**: `/admin/page.tsx`, `/products/[id]/page.tsx`（個別のloading.tsxがないため）

**B: `app/products/loading.tsx`（商品一覧レベル）**
- **適用範囲**: `/products` ページのみ
- **表示される場面**: 商品一覧ページのデータ読み込み中
- **対象ページ**: `/products/page.tsx` のみ

**各ページのローディング動作:**

| ページ | 使用されるloading.tsx | 理由 |
|--------|---------------------|------|
| `/products` | B（products/loading.tsx） | 同じディレクトリにあるため優先 |
| `/products/[id]` | A（app/loading.tsx） | [id]ディレクトリにloading.tsxがないため、上位を探索 |
| `/admin` | A（app/loading.tsx） | adminディレクトリにloading.tsxがないため |

**ポイント:** Next.jsは最も近いloading.tsxを探し、見つからなければ親ディレクトリを辿ります。商品一覧にはスケルトンUIを表示し、それ以外のページにはコーヒーカップの回転アニメーションを表示する、といった使い分けができます。
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q36.** Server ComponentとClient Componentの使い分けの判断基準を、本アプリの具体例を5つ挙げて説明してください。

<details><summary>回答</summary>

**判断基準:** デフォルトはServer Component。以下の条件に当てはまる場合のみClient Componentにする。

| # | コンポーネント | SC/CC | 理由 |
|---|--------------|-------|------|
| 1 | トップページ（page.tsx） | **Server** | DBからおすすめ商品を取得するだけ。インタラクションなし。SEOに有利 |
| 2 | ヘッダーのナビゲーション | **Client** | ハンバーガーメニューの開閉にuseStateが必要。ログイン状態によるUIの切り替え |
| 3 | レビュー一覧（ReviewSection） | **Server** | DBからレビューを取得して表示するだけ。星の表示は静的 |
| 4 | レビュー投稿フォーム（ReviewForm） | **Client** | 星のクリック（useState）、フォーム送信のローディング状態（useTransition）が必要 |
| 5 | error.tsx | **Client** | Error BoundaryはReactのクライアント機能。reset()のonClickが必要 |

**追加の判断基準:**
- `useState`, `useEffect`, `useTransition` を使う → Client Component
- イベントハンドラ（`onClick`, `onChange`）が必要 → Client Component
- データ取得だけ → Server Component
- 表示だけ（インタラクションなし） → Server Component
- ブラウザAPI（`window`, `localStorage`）を使う → Client Component

**原則:** 「インタラクティブな部分」だけをClient Componentとして切り出し、Server Componentの中に埋め込む。ページ全体をClient Componentにしない。
</details>

**Q37.** アクセシビリティ（a11y）の観点から、スケルトンUIとローディングスピナーのそれぞれの注意点を述べてください。

<details><summary>回答</summary>

**スケルトンUIのアクセシビリティ注意点:**

1. **`aria-busy="true"`**: スケルトンを含む領域に設定し、スクリーンリーダーに「読み込み中」を伝える
```tsx
<div aria-busy="true" aria-label="商品を読み込み中">
  <SkeletonCard />
</div>
```

2. **`aria-hidden="true"`**: スケルトン自体は装飾要素なので、スクリーンリーダーに読み上げさせない
```tsx
<div aria-hidden="true" className="animate-pulse">
  <div className="bg-gray-200 h-48 rounded" />
</div>
```

3. **アニメーションの制御**: `prefers-reduced-motion` メディアクエリで、アニメーションを無効化
```css
@media (prefers-reduced-motion: reduce) {
  .animate-pulse { animation: none; }
}
```

**ローディングスピナーのアクセシビリティ注意点:**

1. **`role="status"`**: スピナーに設定し、ステータス変更をスクリーンリーダーに通知
```tsx
<div role="status">
  <span className="animate-spin">☕</span>
  <span className="sr-only">読み込み中</span> {/* 視覚的に非表示だが読み上げられる */}
</div>
```

2. **`aria-live="polite"`**: 読み込み完了時にスクリーンリーダーが通知
```tsx
<div aria-live="polite">
  {isLoading ? "読み込み中..." : "読み込み完了"}
</div>
```

3. **フォーカス管理**: 読み込み完了後、メインコンテンツにフォーカスを移す

**共通:** テキストによる状態説明（「読み込み中」）を必ず含める。視覚的なアニメーションだけでは、スクリーンリーダーユーザーに状態が伝わりません。
</details>

**Q38.** Next.jsのISR（Incremental Static Regeneration）をトップページに適用する場合の設計と、適用すべきかどうかの判断基準を述べてください。

<details><summary>回答</summary>

**ISRの設計:**
```typescript
// app/page.tsx
export const revalidate = 3600; // 1時間ごとにデータを再取得

export default async function HomePage() {
  const products = await getRecommendedProducts();
  return (
    <main>
      <HeroSection />
      <RecommendedProducts products={products} />
      <StorySection />
    </main>
  );
}
```

**動作:**
1. 最初のリクエスト → SSRでHTMLを生成してキャッシュ
2. 1時間以内のリクエスト → キャッシュされたHTMLを即座に返す（DB問い合わせなし）
3. 1時間経過後のリクエスト → キャッシュを返しつつ、バックグラウンドでデータを再取得して更新
4. 次のリクエスト → 更新されたHTMLを返す

**適用すべきかの判断基準:**

| 要素 | ISR適用 | SSR（毎回取得） |
|------|---------|---------------|
| データの更新頻度 | 低い（商品は1日に数回追加程度） | 高い（リアルタイム在庫表示等） |
| アクセス頻度 | 高い（トップページ） | 低い（管理画面） |
| パーソナライズ | 不要（全ユーザー共通） | 必要（ログインユーザーごとに異なる） |
| 正確性の要件 | 多少古くてもOK | 常に最新でなければならない |

**本アプリのトップページへの適用:**
- おすすめ商品（最新4件）は頻繁に変わらない → ISR適用可
- `revalidate = 3600`（1時間）で、新商品が追加されても最大1時間で反映
- 即時反映が必要な場合は `revalidatePath("/")` をServer Actionから呼ぶ

**注意:** ISRはパーソナライズされたコンテンツ（ログインユーザー名の表示等）には適用できません。パーソナライズ部分はClient Componentとして分離します。
</details>

**Q39.** デザインシステム（コンポーネントライブラリ）の導入判断について、shadcn/ui, Chakra UI, Material UIを比較し、本アプリに最適な選択肢を論じてください。

<details><summary>回答</summary>

| 観点 | shadcn/ui | Chakra UI | Material UI |
|------|-----------|-----------|-------------|
| **設計思想** | コンポーネントをコードとしてプロジェクトにコピー | テーマ変更可能なライブラリ | Googleのマテリアルデザイン準拠 |
| **カスタマイズ性** | 非常に高い（コードが手元にある） | テーマで調整 | テーマで調整（独自デザインは難しい） |
| **バンドルサイズ** | 使うコンポーネントだけ | 中程度（ツリーシェイキング対応） | 大きい |
| **Tailwind CSS** | ネイティブ対応 | CSS-in-JS（Tailwindとは別系統） | CSS-in-JS（emotionベース） |
| **RSC対応** | 対応 | 部分対応 | 部分対応 |
| **学習コスト** | 低い（Tailwind CSS + Radix） | 中程度 | 高い |

**本アプリに最適: shadcn/ui**

理由:
1. **Tailwind CSSと自然に統合**: 既にTailwindを使っているプロジェクトと最も相性が良い
2. **RSC対応**: Server ComponentとClient Componentの使い分けに対応
3. **コピー方式**: node_modulesに依存しないため、自由にカスタマイズできる
4. **ECサイトのブランドイメージ**: Materialデザインの「Googleっぽさ」ではなく、コーヒー豆ストアに合った温かみのあるデザインに調整しやすい
5. **必要なものだけ**: ボタン、フォーム、ダイアログなど必要なコンポーネントだけ追加できる

**ただし:** MVPの規模（10画面程度）では、ライブラリなしでTailwind CSSだけで実装しても問題ありません。コンポーネントの数が20以上に増えた段階で導入を検討するのが適切です。
</details>

**Q40.** パフォーマンスバジェット（性能予算）の考え方を説明し、本アプリのトップページに対して具体的なバジェットを設定してください。

<details><summary>回答</summary>

**パフォーマンスバジェットとは:**
Webサイトの性能指標に「これ以上悪化させない」という上限値（予算）を設定し、開発中に予算を超えたら対処するアプローチです。

**本アプリのトップページに対するバジェット:**

| 指標 | バジェット | 根拠 |
|------|---------|------|
| **LCP** | 2.5秒以内 | Core Web Vitalsの「良好」基準 |
| **INP** | 200ms以内 | Core Web Vitalsの「良好」基準 |
| **CLS** | 0.1以下 | Core Web Vitalsの「良好」基準 |
| **JSバンドルサイズ** | 150KB以下（gzip後） | モバイルの3G回線で3秒以内にロード |
| **画像の合計サイズ** | 500KB以下 | おすすめ商品4枚 × 最大125KB/枚 |
| **フォントサイズ** | 100KB以下 | Noto Sans JPのサブセット |
| **総ページサイズ** | 1MB以下 | モバイルのデータ通信量を考慮 |
| **サーバーレスポンス（TTFB）** | 600ms以内 | Vercelのエッジ + ISRで実現可能 |

**予算を守るための施策:**

1. **計測の自動化**: Lighthouseスコアをデプロイパイプラインで自動計測
2. **画像最適化**: `<Image>` コンポーネントでWebPに自動変換。アップロード時にリサイズ
3. **コード分割**: 動的インポート（`dynamic()`）で必要なときだけコンポーネントを読み込む
4. **サードパーティスクリプトの監視**: Google Analytics等の外部スクリプトのサイズを監視
5. **Bundle Analyzer**: `@next/bundle-analyzer` で定期的にバンドル構成を確認

**予算超過時のアクション:**
- 画像サイズが超過 → 圧縮率を上げる or 解像度を下げる
- JSバンドルが超過 → 使っていないライブラリを削除 or 動的インポートに変更
- LCPが超過 → ヒーロー画像に `priority` を追加 or ISRを適用
</details>
