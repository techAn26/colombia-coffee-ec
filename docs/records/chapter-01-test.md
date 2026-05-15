# Chapter 1: 全体像を掴もう — 理解度テスト

> Web基礎、Next.js、TypeScript、Git、画面設計

---

## IT知識・概念理解

### 初級（絶対に抑えてほしい基礎知識）

**Q1.** HTTPリクエストの代表的なメソッドを4つ挙げ、それぞれの用途を一言で説明してください。

<details><summary>回答</summary>

- **GET** — リソースの取得
- **POST** — リソースの新規作成
- **PUT** / **PATCH** — リソースの更新（PUTは全体置換、PATCHは部分更新）
- **DELETE** — リソースの削除

これらはCRUD操作（Create/Read/Update/Delete）に対応しています。
</details>

**Q2.** URLの `https://example.com:3000/products?category=coffee#top` を構成要素に分解してください。

<details><summary>回答</summary>

| 要素 | 値 |
|------|-----|
| プロトコル | `https` |
| ホスト | `example.com` |
| ポート | `3000` |
| パス | `/products` |
| クエリパラメータ | `category=coffee` |
| フラグメント | `#top` |
</details>

**Q3.** HTMLにおけるセマンティックタグとは何ですか？`<div>` と `<section>` の違いを説明してください。

<details><summary>回答</summary>

セマンティックタグは文書構造に**意味（セマンティクス）**を持たせるタグです。`<div>` は汎用的なコンテナで意味を持ちませんが、`<section>` は「テーマ的にまとまったセクション」という意味を持ちます。セマンティックタグを使うことでアクセシビリティやSEOが向上します。
</details>

**Q4.** TypeScriptはJavaScriptと何が違いますか？TypeScriptを使うメリットを2つ挙げてください。

<details><summary>回答</summary>

TypeScriptはJavaScriptに**静的型付け**を追加した上位互換言語です。

メリット:
1. **コンパイル時に型エラーを検出**できるため、実行前にバグを発見できる
2. **エディタの補完・リファクタリング支援**が強力になり、開発効率が向上する
</details>

**Q5.** Gitの「リポジトリ」「コミット」「ブランチ」をそれぞれ一言で説明してください。

<details><summary>回答</summary>

- **リポジトリ** — プロジェクトの全ファイルと変更履歴を保管する場所
- **コミット** — ある時点のファイル状態を記録したスナップショット
- **ブランチ** — コミット履歴の分岐点。並行して作業するための仕組み
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q6.** CSR（Client Side Rendering）とSSR（Server Side Rendering）の違いを、ユーザーがページを表示するまでの流れで説明してください。

<details><summary>回答</summary>

**CSR**: ブラウザが空のHTMLを受け取り → JavaScriptをダウンロード → ブラウザ上でJSが実行されてDOMを構築 → 画面が表示される。初回表示が遅いが、以降のページ遷移は高速。

**SSR**: サーバー側でHTMLを生成 → 完成したHTMLをブラウザに送信 → 画面がすぐ表示される → JSが読み込まれて操作可能（Hydration）。初回表示が速く、SEOにも有利。
</details>

**Q7.** Next.jsの App Router において、`page.tsx` と `layout.tsx` の役割の違いを説明してください。

<details><summary>回答</summary>

- **`page.tsx`** — そのルート（URL）にアクセスしたときに表示される**ページ本体**のコンポーネント。各ルートに1つ必要。
- **`layout.tsx`** — ページを**ラップする共通レイアウト**。ヘッダー・フッター・サイドバーなどを定義する。ネストでき、子ルートに自動適用される。レイアウトは再レンダリングされず状態が保持される。
</details>

**Q8.** `npm install` と `npm install --save-dev` の違いは何ですか？それぞれどのような場面で使いますか？

<details><summary>回答</summary>

- **`npm install`** — `dependencies` に追加。本番環境でも必要なパッケージ（例: React, Next.js）
- **`npm install --save-dev`** — `devDependencies` に追加。開発時のみ必要なパッケージ（例: TypeScript, ESLint, テストツール）

本番ビルドでは `devDependencies` は含まれないため、適切に分けることでデプロイサイズを最小化できます。
</details>

**Q9.** TypeScriptの `interface` と `type` の違いを説明してください。どちらを使うべきですか？

<details><summary>回答</summary>

- **`interface`** — オブジェクトの構造を定義。`extends` で拡張可能。同名で宣言すると自動マージされる（Declaration Merging）。
- **`type`** — より汎用的。ユニオン型 (`A | B`) やタプル型など複雑な型表現が可能。

使い分けの目安: オブジェクトの形状を定義するなら `interface`、ユニオン型やユーティリティ型を使うなら `type`。プロジェクト内で統一するのが重要。
</details>

**Q10.** Gitで `main` ブランチから `feature/login` ブランチを作って作業する意味は何ですか？直接 `main` で作業しない理由を説明してください。

<details><summary>回答</summary>

ブランチを分ける理由:
1. **mainの安定性を保つ** — mainは常に動作する状態を維持し、壊れたコードが混入するのを防ぐ
2. **並行作業が可能** — 複数人が別機能を同時開発できる
3. **変更の単位が明確** — Pull Requestでレビューしやすく、問題があればブランチごと破棄できる
4. **ロールバックが容易** — 機能単位でマージ/取り消しができる
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q11.** Next.jsの Server Components と Client Components の使い分け基準を3つ挙げてください。それぞれの制約も含めて説明してください。

<details><summary>回答</summary>

| 基準 | Server Components | Client Components |
|------|-------------------|-------------------|
| データ取得 | サーバーで直接DB/API呼び出し可 | `useEffect` やSWRでクライアントから取得 |
| インタラクション | `useState`, `useEffect` 使用不可 | ユーザー操作（クリック、入力）が必要な場合 |
| バンドルサイズ | JSがクライアントに送信されない | JSバンドルに含まれる |

使い分け基準:
1. **状態管理やイベントハンドラが必要** → Client Component (`"use client"`)
2. **機密情報（APIキーなど）を扱う** → Server Component
3. **重い依存ライブラリを使う** → Server Componentにして、クライアントバンドルを軽くする
</details>

**Q12.** `tsconfig.json` の `strict: true` を有効にすると何が変わりますか？主要なチェック項目を3つ挙げてください。

<details><summary>回答</summary>

`strict: true` は複数の厳格チェックをまとめて有効化するフラグです。

主要なチェック:
1. **`strictNullChecks`** — `null` / `undefined` を明示的に扱う必要がある。`string` 型に `null` を代入できない
2. **`noImplicitAny`** — 型推論できない場合に暗黙の `any` を禁止。明示的な型注釈が必要
3. **`strictFunctionTypes`** — 関数の引数の型チェックが厳密になる（共変→反変チェック）

本番プロジェクトでは `strict: true` が推奨。途中から有効にすると大量のエラーが出るため、プロジェクト開始時から設定するのがベスト。
</details>

**Q13.** `git rebase` と `git merge` の違いを、コミット履歴の観点から説明してください。どちらをいつ使うべきですか？

<details><summary>回答</summary>

- **`git merge`** — 2つのブランチの履歴を統合し、**マージコミット**を作成。履歴が分岐・合流の形で残る。
- **`git rebase`** — 自分のコミットを相手ブランチの先端に**付け替え**る。履歴が一直線になる。

使い分け:
- **merge**: チーム開発でmainへの統合時。履歴の正確性を重視する場合
- **rebase**: featureブランチをmainの最新に追従させるとき。PR前に履歴を整理するとき

注意: **pushした後のrebaseは危険**。他の人の作業を壊す可能性がある。
</details>

**Q14.** ワイヤーフレームとモックアップとプロトタイプの違いを説明してください。画面設計のどの段階で使いますか？

<details><summary>回答</summary>

| 種類 | 目的 | 詳細度 | 段階 |
|------|------|--------|------|
| **ワイヤーフレーム** | 画面の構造・要素配置 | 低（白黒・枠線のみ） | 初期設計 |
| **モックアップ** | ビジュアルデザインの確認 | 高（色・フォント・画像あり） | デザイン確定段階 |
| **プロトタイプ** | 画面遷移・操作感の検証 | 中〜高（クリック可能） | ユーザーテスト段階 |

流れ: ワイヤーフレーム → モックアップ → プロトタイプ → 実装
</details>

**Q15.** Next.jsの `next.config.js` で設定できる主要な項目を3つ挙げ、それぞれの用途を説明してください。

<details><summary>回答</summary>

1. **`images.remotePatterns`** — 外部ドメインの画像を `<Image>` コンポーネントで最適化して表示するための許可リスト設定
2. **`redirects` / `rewrites`** — URLのリダイレクトやリライトルールを定義。旧URLから新URLへの転送や、APIプロキシに利用
3. **`env`** — ビルド時に埋め込む環境変数を定義。`NEXT_PUBLIC_` プレフィックスでクライアント側にも公開可能

その他: `webpack` カスタマイズ、`experimental` フラグ、`headers` でセキュリティヘッダー追加など。
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q16.** モノレポ（Turborepo等）とポリレポのトレードオフを3つの観点で比較してください。小規模チームにはどちらを推奨しますか？

<details><summary>回答</summary>

| 観点 | モノレポ | ポリレポ |
|------|----------|----------|
| **コード共有** | パッケージ間で容易に共有・再利用 | npm公開やgit submoduleが必要 |
| **CI/CD** | 変更検知・キャッシュが複雑だが一元管理 | リポジトリ単位で独立しシンプル |
| **依存管理** | バージョン統一しやすいが影響範囲が大きい | 各リポジトリで独立管理 |

小規模チーム（1〜3人）への推奨: **ポリレポ（単一リポジトリ）** で十分。モノレポの恩恵を受けるのは共有ライブラリが多い中〜大規模チーム。小規模では運用の複雑さがメリットを上回る。
</details>

**Q17.** TypeScriptで `any` 型を使うべき場面と避けるべき場面を、具体例を交えて説明してください。`unknown` との使い分けも含めてください。

<details><summary>回答</summary>

**`any` を避けるべき場面（ほとんどの場合）:**
- ビジネスロジック、API レスポンスの型定義 → 型安全性が失われバグの温床になる

**`any` が許容される場面:**
- レガシーJSからの段階的移行時のつなぎ
- 型定義が提供されないサードパーティライブラリの一時的な回避

**`unknown` との違い:**
- `any` — 何でもできる（型チェックを完全に放棄）
- `unknown` — 型が不明だが、**型ガード（narrowing）しないと使えない**

```typescript
// any: 危険 — ランタイムエラーになりうる
const data: any = fetchData();
data.foo.bar; // コンパイル通るが実行時に爆発する可能性

// unknown: 安全 — 型チェック必須
const data: unknown = fetchData();
if (typeof data === 'object' && data !== null && 'foo' in data) {
  // 安全にアクセス
}
```
</details>

**Q18.** Gitの `.gitignore` に入れるべきファイル/ディレクトリと、その理由をカテゴリ別に5つ挙げてください。

<details><summary>回答</summary>

| カテゴリ | 対象 | 理由 |
|----------|------|------|
| **機密情報** | `.env`, `.env.local` | APIキー・DB接続情報の漏洩防止 |
| **依存パッケージ** | `node_modules/` | サイズが巨大でpackage.jsonから再現可能 |
| **ビルド成果物** | `.next/`, `dist/`, `build/` | ソースから再生成可能。差分が膨大になる |
| **OS/エディタ固有** | `.DS_Store`, `.vscode/settings.json` | 個人環境依存で共有不要 |
| **ログ/キャッシュ** | `*.log`, `.cache/` | 一時的なデータで共有不要 |

設計判断: `.vscode/` は `extensions.json`（推奨拡張）だけ共有し、`settings.json` は `.gitignore` に入れるパターンが多い。
</details>

**Q19.** コンポーネント設計において「Presentational / Container パターン」と「カスタムフック抽出パターン」の違いを説明し、React Server Components時代にはどちらがフィットするか議論してください。

<details><summary>回答</summary>

**Presentational / Container パターン:**
- Container がデータ取得・ロジックを担当し、Presentational は受け取ったpropsを表示するだけ
- クラスコンポーネント時代に流行。関心の分離が明確

**カスタムフック抽出パターン:**
- ロジックをカスタムフック (`useXxx`) に切り出し、コンポーネントはフックを呼ぶだけ
- Hooks登場後の主流。ロジックの再利用性が高い

**RSC時代の考察:**
Server Components がデータ取得を担当し、Client Componentsがインタラクションを担当する構造は、実質的に **Container/Presentational パターンの進化形**。サーバー側でデータを取得し、クライアントコンポーネントにpropsで渡す。カスタムフックはClient Components内のロジック整理に引き続き有用。両パターンは排他ではなく**補完関係**。
</details>

**Q20.** Next.js プロジェクトの初期セットアップで `src/` ディレクトリを使う場合と使わない場合のトレードオフを述べてください。あなたの推奨とその理由は？

<details><summary>回答</summary>

| 観点 | `src/` あり | `src/` なし |
|------|-------------|-------------|
| **ルートの整理** | 設定ファイルとソースが分離され見通しが良い | ルートにファイルが混在 |
| **パス設定** | `@/` エイリアスが `src/` を指す | `@/` がプロジェクトルートを指す |
| **慣習** | 大規模プロジェクトで一般的 | Next.js公式チュートリアルはなし |
| **設定の手間** | ほぼなし（create-next-appで選択可能） | なし |

**推奨: `src/` あり**。理由は設定ファイル（`next.config.js`, `tsconfig.json`, `.env` 等）とアプリケーションコードが明確に分離され、プロジェクトが成長しても構造が破綻しにくい。create-next-appのプロンプトで選択するだけなのでコストもゼロ。
</details>

---

## コーディング・操作理解

### 初級（絶対に抑えてほしい基礎知識）

**Q1.** 以下のGitコマンドの実行順序を正しく並べ替えてください。

```
A. git push origin main
B. git add .
C. git commit -m "初回コミット"
D. git init
```

<details><summary>回答</summary>

**D → B → C → A**

1. `git init` — リポジトリを初期化
2. `git add .` — 全ファイルをステージング
3. `git commit -m "初回コミット"` — コミット作成
4. `git push origin main` — リモートにプッシュ

※ 実際には `git remote add origin <URL>` も必要です。
</details>

**Q2.** 以下のTypeScriptコードにはエラーがあります。原因と修正方法を答えてください。

```typescript
function greet(name: string) {
  return "Hello, " + name;
}

greet(123);
```

<details><summary>回答</summary>

**原因:** `greet` 関数は `name: string` を期待しているが、`123`（number型）を渡している。

**修正:**
```typescript
greet("123");    // 文字列に変更
// または
greet(String(123)); // 明示的に文字列変換
```
</details>

**Q3.** Next.jsプロジェクトを新規作成するコマンドを書いてください。TypeScript、ESLint、App Routerを有効にする前提です。

<details><summary>回答</summary>

```bash
npx create-next-app@latest my-app --typescript --eslint --app
```

対話式プロンプトでも設定可能:
```bash
npx create-next-app@latest my-app
# TypeScript? Yes
# ESLint? Yes
# App Router? Yes
# 等の質問に回答
```
</details>

**Q4.** 以下の `package.json` の `scripts` を見て、`npm run dev` で何が実行されるか答えてください。

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

<details><summary>回答</summary>

`next dev` が実行されます。Next.jsの**開発サーバー**がデフォルトで `http://localhost:3000` で起動します。

- ホットリロード（Fast Refresh）が有効
- エラーオーバーレイが表示される
- ソースマップが有効でデバッグしやすい

本番環境では `npm run build` → `npm run start` を使用します。
</details>

**Q5.** 以下のディレクトリ構造で、`/about` にアクセスしたとき表示されるファイルはどれですか？

```
app/
├── layout.tsx
├── page.tsx
└── about/
    └── page.tsx
```

<details><summary>回答</summary>

**`app/about/page.tsx`** が表示されます。

ただし、`app/layout.tsx` が**ラップ**するため、実際の画面はレイアウトの中に `about/page.tsx` の内容が埋め込まれた形になります。

App Routerでは、ディレクトリ構造がそのままURLパスに対応します（ファイルベースルーティング）。
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q6.** 以下のTypeScriptコードの型を推論してください。`result` の型は何になりますか？

```typescript
function fetchUser(id: number) {
  if (id <= 0) return null;
  return { name: "田中", age: 30 };
}

const result = fetchUser(1);
```

<details><summary>回答</summary>

`result` の型は `{ name: string; age: number } | null` です。

TypeScriptは関数の全ての `return` パスから戻り値の型を推論します。この関数は `null` を返すパスと、オブジェクトを返すパスがあるため、**ユニオン型**になります。

`result` を安全に使うには:
```typescript
if (result) {
  console.log(result.name); // OK: null が除外される
}
```
</details>

**Q7.** `git stash` は何をするコマンドですか？以下のシナリオでどう使いますか？

> featureブランチで作業中に、急ぎのバグ修正のためmainブランチに切り替える必要がある。ただしfeatureの変更はまだコミットしたくない。

<details><summary>回答</summary>

`git stash` は作業中の変更を**一時的に退避**するコマンドです。

```bash
# 1. 現在の変更を退避
git stash

# 2. mainに切り替えてバグ修正
git checkout main
# ... バグ修正 & コミット ...

# 3. featureブランチに戻る
git checkout feature/xxx

# 4. 退避した変更を復元
git stash pop
```

- `git stash list` — 退避一覧を確認
- `git stash pop` — 最新の退避を復元して削除
- `git stash apply` — 復元するが退避は残す
</details>

**Q8.** 次のNext.jsのコードで、`"use client"` を付ける必要があるのはどちらですか？理由も答えてください。

```typescript
// ComponentA
export default function ProductList({ products }) {
  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}

// ComponentB
export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

<details><summary>回答</summary>

**ComponentB** に `"use client"` が必要です。

理由:
- `useState`（React Hook）を使用している
- `onClick` イベントハンドラを使用している

これらはブラウザ側で動作する機能であり、Server Componentでは使えません。

ComponentA はpropsを受け取って表示するだけなので、Server Componentのままで問題ありません（むしろSCの方がJSバンドルに含まれず軽量）。
</details>

**Q9.** 以下の `.gitignore` の記法の意味をそれぞれ説明してください。

```
node_modules/
*.log
!important.log
.env*
build/
```

<details><summary>回答</summary>

| パターン | 意味 |
|----------|------|
| `node_modules/` | `node_modules` ディレクトリとその中身全体を無視 |
| `*.log` | 拡張子が `.log` のファイルを全て無視 |
| `!important.log` | `*.log` のルールの**例外**として `important.log` は追跡する |
| `.env*` | `.env` で始まる全ファイルを無視（`.env`, `.env.local`, `.env.production` 等） |
| `build/` | `build` ディレクトリとその中身全体を無視 |

`!` は否定パターンで、先に定義された無視ルールを上書きします。
</details>

**Q10.** TypeScriptで以下のように配列をmapする際、型安全に書くにはどうしますか？

```typescript
const items = ["apple", "banana", "cherry"];
// 各アイテムを { name: string, length: number } に変換したい
```

<details><summary>回答</summary>

```typescript
const items = ["apple", "banana", "cherry"];

const result = items.map((item) => ({
  name: item,
  length: item.length,
}));
// result の型: { name: string; length: number }[]
```

TypeScriptが自動推論するため、明示的な型注釈は不要ですが、明示する場合:

```typescript
type FruitInfo = {
  name: string;
  length: number;
};

const result: FruitInfo[] = items.map((item) => ({
  name: item,
  length: item.length,
}));
```
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q11.** 以下のTypeScriptコードでジェネリクスを使って型安全にしてください。

```typescript
function getFirst(arr: any[]): any {
  return arr[0];
}
```

<details><summary>回答</summary>

```typescript
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

// 使用例
const num = getFirst([1, 2, 3]);       // num: number | undefined
const str = getFirst(["a", "b"]);      // str: string | undefined
const empty = getFirst([]);             // empty: undefined
```

ポイント:
- `any` を排除し型パラメータ `T` で型安全に
- 空配列の場合 `undefined` を返すため、戻り値は `T | undefined`
- 呼び出し側で型が自動推論される
</details>

**Q12.** Next.jsで動的なメタデータ（SEO用のtitle/description）を設定する方法を2つ書いてください。

<details><summary>回答</summary>

**方法1: 静的な `metadata` オブジェクト**
```typescript
// app/about/page.tsx
export const metadata = {
  title: "会社概要 | My Shop",
  description: "私たちのショップについて",
};
```

**方法2: 動的な `generateMetadata` 関数**
```typescript
// app/products/[id]/page.tsx
export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  return {
    title: `${product.name} | My Shop`,
    description: product.description,
  };
}
```

方法2はデータベースやAPIからデータを取得して動的にメタデータを生成する場合に使います。
</details>

**Q13.** `git cherry-pick` とは何ですか？どのような場面で使いますか？具体的なコマンド例を示してください。

<details><summary>回答</summary>

`git cherry-pick` は、**特定のコミットだけ**を現在のブランチに取り込むコマンドです。

**使用場面:** featureブランチのバグ修正コミットだけをmainに先に適用したい場合など。

```bash
# 1. 取り込みたいコミットのハッシュを確認
git log --oneline feature/login
# abc1234 ログインバグ修正
# def5678 ログイン画面UI変更

# 2. mainブランチに切り替え
git checkout main

# 3. 特定のコミットだけ取り込む
git cherry-pick abc1234

# 複数コミットを連続で取り込む
git cherry-pick abc1234 def5678
```

**注意:** cherry-pickはコミットを複製するため、後でブランチをマージすると重複コミットが生じる可能性があります。
</details>

**Q14.** TypeScriptのユーティリティ型 `Partial<T>`, `Required<T>`, `Pick<T, K>`, `Omit<T, K>` の使い方をそれぞれコード例で示してください。

<details><summary>回答</summary>

```typescript
type User = {
  id: number;
  name: string;
  email: string;
  age: number;
};

// Partial<T> — 全プロパティをオプショナルに
type UpdateUser = Partial<User>;
// { id?: number; name?: string; email?: string; age?: number }
const update: UpdateUser = { name: "新しい名前" }; // OK

// Required<T> — 全プロパティを必須に
type StrictUser = Required<Partial<User>>;
// 元に戻る: { id: number; name: string; email: string; age: number }

// Pick<T, K> — 特定のプロパティだけ抽出
type UserSummary = Pick<User, "id" | "name">;
// { id: number; name: string }

// Omit<T, K> — 特定のプロパティを除外
type CreateUser = Omit<User, "id">;
// { name: string; email: string; age: number }
```
</details>

**Q15.** 以下のNext.jsプロジェクト構成にはいくつかの問題があります。指摘して修正案を出してください。

```
app/
├── components/
│   └── Header.tsx
├── api/
│   └── route.ts       ← /api でアクセスしたい
├── product/
│   └── [id].tsx        ← /product/123 でアクセスしたい
└── page.tsx
```

<details><summary>回答</summary>

**問題点と修正:**

1. **`api/route.ts`** — `app/api/` 直下に `route.ts` があるのは正しいが、App Router では Route Handler のファイル名は `route.ts` で合っている。問題なし。

2. **`product/[id].tsx`** — App Router では動的ルートは**ディレクトリ名**に `[id]` を使い、中に `page.tsx` を置く必要がある。

3. **`components/`** — `app/` 内に置くとルーティング対象になりうる（`page.tsx` がなければ無視されるが紛らわしい）。`app/` の外か `_components/` にすべき。

**修正後:**
```
app/
├── api/
│   └── route.ts
├── product/
│   └── [id]/
│       └── page.tsx      ← ディレクトリに変更
└── page.tsx
components/               ← app/ の外に移動
└── Header.tsx
```
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q16.** Next.jsの `app/` ディレクトリ内でのコロケーション（関連ファイルを近くに配置する戦略）のメリット・デメリットを議論してください。大規模化した場合にどう破綻しますか？

<details><summary>回答</summary>

**メリット:**
- 関連するコンポーネント・型・テストが同じディレクトリにあり、見つけやすい
- 機能追加・削除がディレクトリ単位で完結する
- `page.tsx` 以外のファイルはルーティングに影響しない（App Router）

**デメリット:**
- 共通コンポーネントの置き場所が曖昧になる
- 深いネストで可読性が低下する
- 同名ファイル（`types.ts`, `utils.ts`）が散在しエディタのタブで区別しにくい

**大規模化での破綻パターン:**
- 機能横断的なロジック（認証、ログ、エラーハンドリング）がどこにも属さなくなる
- 複数ルートで使う共通型やユーティリティの重複が発生
- 「このコンポーネントはどのルートに属するのか」の判断が困難になる

**対策:** `app/` はルーティングに専念させ、ビジネスロジックは `src/features/` や `src/lib/` に分離するフィーチャーベース構成がスケールしやすい。
</details>

**Q17.** TypeScriptの `as` キャスト（型アサーション）が危険な理由をコード例で示してください。安全な代替手段も提案してください。

<details><summary>回答</summary>

**危険な例:**
```typescript
type User = { name: string; email: string };

// APIレスポンスを無検証でキャスト
const user = JSON.parse(response) as User;
console.log(user.email.toUpperCase()); // emailがundefinedならランタイムエラー
```

`as` はコンパイラに「私を信じて」と言うだけで、**実行時の検証は一切行わない**。データが想定外の形状ならランタイムエラーになる。

**安全な代替手段:**

```typescript
// 方法1: 型ガード関数
function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    "email" in data
  );
}

const parsed: unknown = JSON.parse(response);
if (isUser(parsed)) {
  console.log(parsed.email.toUpperCase()); // 安全
}

// 方法2: Zodなどのバリデーションライブラリ
import { z } from "zod";
const UserSchema = z.object({ name: z.string(), email: z.string() });
const user = UserSchema.parse(JSON.parse(response)); // 不正なら例外
```
</details>

**Q18.** `git bisect` の仕組みと使い方を説明してください。どのようなバグ調査に有効ですか？

<details><summary>回答</summary>

`git bisect` は**二分探索**でバグが混入したコミットを特定するコマンドです。

**仕組み:** 「正常なコミット」と「バグのあるコミット」の範囲を指定すると、中間のコミットをチェックアウトし、正常/異常を判定→範囲を半分に絞る、を繰り返します。

**使い方:**
```bash
# 1. bisect開始
git bisect start

# 2. 現在のコミットはバグあり
git bisect bad

# 3. 1週間前のコミットは正常だった
git bisect good abc1234

# 4. Gitが中間コミットをチェックアウトする
# テストして結果を報告
git bisect good   # このコミットは正常
# または
git bisect bad    # このコミットはバグあり

# 5. 繰り返すと原因コミットが特定される
# 6. 終了
git bisect reset
```

**有効な場面:** 「いつの間にか壊れていた」リグレッションバグ。100コミットあっても約7回の判定で特定可能（log2(100) ≈ 7）。
</details>

**Q19.** 画面設計で「ユーザーストーリーマッピング」を行う意味と、それがコンポーネント設計にどう繋がるかを説明してください。

<details><summary>回答</summary>

**ユーザーストーリーマッピングとは:**
ユーザーの行動を時系列に横軸に並べ、各行動の詳細度を縦軸に展開する手法。上段が「ユーザーの大きな活動」、下段が「具体的なタスク」になる。

**画面設計との関係:**
- 横軸の各活動 → **ページ/ルート** の候補
- 縦軸のタスク → **機能コンポーネント** の候補
- 水平方向の流れ → **画面遷移図** のベース

**コンポーネント設計への繋がり:**
1. ストーリーの「名詞」→ データモデル（型定義）
2. ストーリーの「動詞」→ アクション/イベントハンドラ
3. 繰り返し登場する要素 → 共通コンポーネント
4. MVPライン（横線）→ 初期リリースに含めるコンポーネントの判断基準

この手法により「なぜこのコンポーネントが必要か」がユーザー価値から逆算で説明できる。
</details>

**Q20.** 新規Next.jsプロジェクトの技術選定で、以下の選択肢についてトレードオフを述べ、あなたの推奨を理由付きで回答してください。

- パッケージマネージャ: npm vs pnpm vs yarn
- スタイリング: Tailwind CSS vs CSS Modules vs styled-components
- フォーマッター: Prettier + ESLint vs Biome

<details><summary>回答</summary>

**パッケージマネージャ:**
| | npm | pnpm | yarn |
|---|-----|------|------|
| 速度 | 普通 | 最速 | 速い |
| ディスク効率 | 各プロジェクトにコピー | ハードリンクで共有 | PnP or node_modules |
| 学習コスト | ゼロ（標準付属） | 低い | 低い |

→ **推奨: pnpm**。速度・ディスク効率に優れ、npmとコマンド互換性が高い。ただし1人開発なら npm で十分。

**スタイリング:**
| | Tailwind CSS | CSS Modules | styled-components |
|---|---|---|---|
| RSC対応 | 完全対応 | 完全対応 | 非対応（要"use client"） |
| バンドルサイズ | 未使用CSSを自動削除 | スコープ付きCSS | JS実行時にCSS生成 |
| 学習コスト | クラス名の暗記 | CSSの知識 | CSS-in-JS記法 |

→ **推奨: Tailwind CSS**。RSC完全対応、ゼロランタイム、エコシステムが充実。

**フォーマッター:**
| | Prettier + ESLint | Biome |
|---|---|---|
| 速度 | 遅い（JS実行） | 超高速（Rust製） |
| エコシステム | プラグイン豊富 | 発展途上 |
| 設定 | 2ツール分の設定が必要 | 1ファイルで完結 |

→ **推奨: Biome**（新規プロジェクト）。設定がシンプルで高速。ただしESLintプラグインに依存する場合は Prettier + ESLint。
</details>
