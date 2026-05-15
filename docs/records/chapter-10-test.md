# Chapter 10: 品質を確かめよう — 理解度テスト

---

## IT知識・概念理解

### 初級（絶対に抑えてほしい基礎知識）

**Q1.** 「テスト」とは何ですか？なぜソフトウェアにテストが必要なのか説明してください。

<details><summary>回答</summary>

テストとは、ソフトウェアが「期待通りに動くか」を確認する作業です。

テストが必要な理由:
1. **バグの早期発見**: リリース前に問題を見つけることで、お客さんに迷惑をかけない
2. **品質の保証**: 「ちゃんと動く」ことを客観的に証明できる
3. **変更の安全性**: コードを変更した後、他の部分が壊れていないことを確認できる
4. **ドキュメント代わり**: テストコードを読めば「このコードはこう動くべき」が分かる
5. **コスト削減**: 本番でバグが見つかると修正コストが数倍〜数十倍になる

テストなしでリリースするのは、「健康診断なしで手術する」ようなものです。
</details>

**Q2.** 「手動テスト」と「自動テスト」の違いを説明してください。

<details><summary>回答</summary>

**手動テスト:**
- 人間がブラウザを操作して確認する
- 例: 「商品を検索して→カートに入れて→決済する」を実際に操作
- メリット: UIの見た目や使い心地（UX）を確認できる。テストコードを書く必要がない
- デメリット: 時間がかかる。人による見落としがある。変更のたびに繰り返す必要がある

**自動テスト:**
- プログラムが自動で確認する
- 例: `npm test` で全テストを一括実行
- メリット: 一瞬で完了。漏れがない。何度でも繰り返せる。CI/CDに組み込める
- デメリット: テストコードを書く手間がある。UIの「見た目」は確認しにくい

**結論:** 両方必要。自動テストで「ロジックが正しいか」を保証し、手動テストで「使い心地が良いか」を確認します。
</details>

**Q3.** 「ユニットテスト」とは何ですか？テスト対象の「ユニット（単位）」とは具体的に何ですか？

<details><summary>回答</summary>

ユニットテストとは、プログラムの最小単位（関数やモジュール）が正しく動作するかを検証するテストです。

**「ユニット」とは:**
- 1つの関数（例: `getNextStatuses("pending")` が `["preparing", "cancelled"]` を返すか）
- 1つのクラスのメソッド
- 1つの純粋な変換ロジック

**ユニットテストの特徴:**
- 外部に依存しない（DBやAPI呼び出しを含まない）
- 実行が高速（数ミリ秒で完了）
- 入力と出力がはっきりしている
- 失敗したとき、問題の場所がすぐ分かる

**例:**
```typescript
// テスト対象の関数
function getRoastLabel(roast: string): string { ... }

// ユニットテスト
expect(getRoastLabel("light")).toBe("浅煎り");
expect(getRoastLabel("dark")).toBe("深煎り");
```
</details>

**Q4.** テストの3つの種類（ユニットテスト、インテグレーションテスト、E2Eテスト）の違いを説明してください。

<details><summary>回答</summary>

| 種類 | テスト対象 | 範囲 | 速度 | 例 |
|------|---------|------|------|-----|
| **ユニットテスト** | 関数・モジュール単体 | 最小 | 最速 | `getNextStatuses("pending")` が正しい値を返すか |
| **インテグレーションテスト** | 複数のモジュールの連携 | 中 | 中 | Server Actionが正しくDBを更新するか |
| **E2E（エンドツーエンド）テスト** | アプリ全体の動作 | 最大 | 最遅 | ブラウザで「商品を探す→カートに入れる→購入する」の一連の操作 |

**テストピラミッド:**
```
      /  E2E  \     ← 少なく（遅い・高コスト）
     /  結合   \    ← 中程度
    / ユニット  \   ← 多く（速い・低コスト）
```

下に行くほどテスト数を多く、上に行くほど少なくするのがバランスの良い構成です。
</details>

**Q5.** vitestとは何ですか？`npm test` を実行すると何が起きますか？

<details><summary>回答</summary>

vitestは、JavaScriptのテストを実行するツール（テストランナー）です。Viteをベースにしており、高速に動作します。

**`npm test` を実行すると:**
1. vitestがプロジェクト内の `.test.ts` または `.spec.ts` ファイルを探す
2. 各テストファイルを読み込み、`describe` / `it` / `expect` で定義されたテストを実行
3. 各テストの結果（成功/失敗）を表示
4. 全テストの集計結果（通過数/失敗数）を表示

```
 ✓ src/lib/__tests__/order-utils.test.ts (6 tests)
 ✓ src/lib/__tests__/product-utils.test.ts (4 tests)

 Test Files  2 passed (2)
      Tests  10 passed (10)
```

テストが1つでも失敗すると、終了コードが0以外になり、CI/CDパイプラインではビルドが失敗として扱われます。
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q6.** 「純粋関数」とは何ですか？なぜ純粋関数はテストしやすいのか説明してください。

<details><summary>回答</summary>

**純粋関数とは:**
1. 同じ入力に対して常に同じ出力を返す
2. 副作用（外部の状態変更、DB操作、ファイル書き込み等）がない

**例:**
```typescript
// 純粋関数 ✓
function getStatusLabel(status: string): string {
  const labels = { pending: "受注", preparing: "発送準備中" };
  return labels[status] ?? "不明";
}

// 非純粋関数 ✗
async function updateOrderStatus(orderId: string, status: string) {
  await supabase.from("orders").update({ status }).eq("id", orderId); // DB操作（副作用）
}
```

**テストしやすい理由:**
1. **セットアップ不要**: DBの準備やモックの設定なしでテストできる
2. **決定的**: 同じ引数なら必ず同じ結果 → テストが安定する（flaky testにならない）
3. **独立**: 他のテストの実行順序に影響されない
4. **高速**: 外部通信がないのでミリ秒で完了

非純粋関数のテストは、DBのモック設定や環境構築が必要で、テストの保守コストが高くなります。
</details>

**Q7.** `"use server"` ファイルから純粋関数を分離する理由と方法を説明してください。

<details><summary>回答</summary>

**理由:**
`"use server"` が付いたファイルは、Next.jsが「サーバー専用」と判断します。テスト環境（vitest）はサーバー環境ではないため、このファイルを直接importするとエラーが発生します。純粋なロジック関数はサーバーに依存しないので、別ファイルに分離することでテスト可能になります。

**分離前:**
```typescript
// src/lib/orders.ts
"use server";

// 純粋関数（DBに依存しない）
export function getNextStatuses(status: string): string[] { ... }
export const STATUS_LABELS = { ... };

// Server Action（DBに依存する）
export async function updateOrderStatus(orderId: string, status: string) {
  await supabase.from("orders").update({ status });
}
```

**分離後:**
```typescript
// src/lib/order-utils.ts ← テスト対象
export function getNextStatuses(status: string): string[] { ... }
export const STATUS_LABELS = { ... };

// src/lib/orders.ts ← Server Action
"use server";
export { getNextStatuses, STATUS_LABELS } from "./order-utils"; // re-export
export async function updateOrderStatus(orderId: string, status: string) { ... }
```

**ポイント:** 既存のコードからの import パスは変わらない（re-exportしているため）。テストからは `order-utils.ts` を直接importする。
</details>

**Q8.** テストの「AAA パターン」（Arrange-Act-Assert）とは何ですか？具体例で説明してください。

<details><summary>回答</summary>

AAAパターンは、テストコードを3つのステップで構造化する書き方です。

| ステップ | 意味 | やること |
|---------|------|---------|
| **Arrange（準備）** | テストの前提条件を整える | テストデータの作成、変数の初期化 |
| **Act（実行）** | テスト対象の関数を呼び出す | 関数の実行、メソッドの呼び出し |
| **Assert（検証）** | 結果が期待通りか確認する | `expect()` で値を検証 |

**具体例:**
```typescript
it("pendingから遷移可能なステータスは preparing と cancelled", () => {
  // Arrange（準備）
  const currentStatus = "pending";

  // Act（実行）
  const result = getNextStatuses(currentStatus);

  // Assert（検証）
  expect(result).toEqual(["preparing", "cancelled"]);
});
```

**シンプルなテストでは Arrange と Act を1行にまとめることもあります:**
```typescript
it("lightは浅煎り", () => {
  expect(getRoastLabel("light")).toBe("浅煎り"); // Act + Assert
});
```

AAAパターンに従うことで、テストコードが読みやすくなり、「何をテストしているか」が一目で分かります。
</details>

**Q9.** テストシナリオ（手動テスト項目）を作成する目的と、良いテストシナリオの特徴を説明してください。

<details><summary>回答</summary>

**目的:**
1. テストの漏れを防ぐ（チェックリスト化で体系的に確認）
2. テスト結果を記録として残す（「いつ、何を、どう確認したか」）
3. 他の人でも同じテストを再現できる（属人化防止）
4. リグレッション防止（新機能追加後に既存機能を確認）

**良いテストシナリオの特徴:**

| 特徴 | 良い例 | 悪い例 |
|------|--------|--------|
| 具体的な操作手順 | 「商品一覧で『ウィラ』を検索 → 2件表示される」 | 「検索が動く」 |
| 期待結果が明確 | 「カートに2個追加すると合計¥3,600になる」 | 「カートが正しい」 |
| 前提条件がある | 「ログイン済みユーザーとして」 | （条件の記載なし） |
| 独立している | 他のシナリオに依存しない | 「Q3の後に実行すること」 |
| 正常系と異常系 | 「在庫0の商品はカートに追加できない」 | 正常系のみ |

本アプリでは43項目のテストシナリオを10カテゴリに分類し、1項目30秒〜1分で確認できるように設計されています。
</details>

**Q10.** テストカバレッジとは何ですか？カバレッジ100%を目指すべきですか？

<details><summary>回答</summary>

**テストカバレッジとは:**
コード全体のうち、テストによって実行（通過）された行の割合です。

```
カバレッジ = テストで実行された行数 / 全行数 × 100%
```

例: 全100行のコードのうち、テストで80行が実行された → カバレッジ80%

**100%を目指すべきか: いいえ**

| カバレッジ | 評価 | 実態 |
|-----------|------|------|
| 0% | テストなし | 危険 |
| 40-60% | 最低限 | 重要なロジックはカバー |
| 60-80% | 良好 | ほとんどのプロジェクトの目標 |
| 80-90% | 十分 | コスト対効果が最も良い |
| 100% | 過剰 | テスト保守コストが高い。すべての行をテストする意味がない場合がある |

**100%を目指すべきでない理由:**
- 単純なgetter/setterまでテストするのは無駄
- UIの表示テストはE2Eで行うべきで、ユニットテストでは困難
- カバレッジが100%でもバグがないとは限らない（テストの質が重要）

**目指すべきこと:** カバレッジの数字よりも、**ビジネスロジックの重要な部分**（ステータス遷移、価格計算、在庫チェック等）が確実にテストされていることが重要です。
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q11.** テストダブル（モック、スタブ、スパイ）の違いを説明し、それぞれの使い所を具体例で示してください。

<details><summary>回答</summary>

**テストダブル:** テスト中に本物のオブジェクトの代わりに使う「代役」の総称。

| 種類 | 役割 | 使い所 |
|------|------|--------|
| **スタブ（Stub）** | 決まった値を返す代役 | 外部APIの応答を固定したい |
| **モック（Mock）** | 呼び出されたことを検証する代役 | 関数が正しく呼ばれたか確認したい |
| **スパイ（Spy）** | 本物の関数を呼びつつ、呼び出しを記録 | 関数の呼び出し回数や引数を確認したい |

**具体例:**

```typescript
// スタブ: Supabaseのレスポンスを固定
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => ({ data: { id: "1", status: "pending" }, error: null }),
        }),
      }),
    }),
  }),
}));

// モック: revalidatePathが呼ばれたことを検証
const revalidateMock = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: revalidateMock }));

// テスト後に検証
expect(revalidateMock).toHaveBeenCalledWith("/admin/orders");

// スパイ: console.errorが呼ばれたか確認
const consoleSpy = vi.spyOn(console, "error");
// ... テスト実行
expect(consoleSpy).toHaveBeenCalledTimes(1);
consoleSpy.mockRestore(); // 元に戻す
```

**本アプリでのアプローチ:** 純粋関数を分離してモックなしでテストするのが最もシンプル。モックが必要なテストは実装・保守コストが高いため、インテグレーションテストで対応する方が効率的な場合が多いです。
</details>

**Q12.** 「フレイキーテスト（Flaky Test）」とは何ですか？原因と対策を3つ以上挙げてください。

<details><summary>回答</summary>

**フレイキーテストとは:**
同じコードに対して、ある時は成功し、ある時は失敗する不安定なテストです。「フレイキー（flaky = 薄片のように不安定）」。

**原因と対策:**

| # | 原因 | 例 | 対策 |
|---|------|-----|------|
| 1 | **タイミング依存** | setTimeout, setInterval, アニメーション完了待ち | `vi.useFakeTimers()` で時間を制御 |
| 2 | **実行順序依存** | テストAの副作用がテストBに影響 | 各テストで状態をリセット。テストは独立に |
| 3 | **外部サービス依存** | DBやAPIの応答速度に左右される | モック/スタブで外部依存を排除 |
| 4 | **ランダムデータ** | `Math.random()` やUUID生成を含む処理 | テスト時にシードを固定。または決定的な値を注入 |
| 5 | **環境依存** | OSやNode.jsバージョンの違い | CIと同じ環境でローカルテストを実行 |
| 6 | **日時依存** | `new Date()` を使う処理 | `vi.setSystemTime()` で日時を固定 |

**フレイキーテストの対処原則:**
- 発見次第すぐ修正する（放置するとテスト全体の信頼性が下がる）
- 「もう一回実行すれば通る」は解決策ではない
- 純粋関数のテストはフレイキーになりにくい（外部依存がないため）
</details>

**Q13.** Server ActionやDBアクセスを含む関数のテスト方法を3つ挙げ、それぞれのメリット・デメリットを比較してください。

<details><summary>回答</summary>

**方法1: モックを使ったユニットテスト**
```typescript
vi.mock("@/lib/supabase/server", () => ({ ... }));
```
- メリット: 高速。外部依存なし。CIで安定して動く
- デメリット: モックの設定が複雑。実際のDBの挙動と乖離する可能性
- 適用: ビジネスロジックの分岐テスト

**方法2: テスト用DBを使ったインテグレーションテスト**
```typescript
// テスト前にテスト用DBにデータを投入
// テスト後にクリーンアップ
```
- メリット: 実際のDBの挙動をテストできる。RLSも含めて検証可能
- デメリット: セットアップが複雑。テストが遅い。テストデータの管理が必要
- 適用: RLSポリシーの検証、複雑なクエリのテスト

**方法3: 純粋関数を分離してテスト（本アプリの方式）**
```typescript
// order-utils.ts に純粋関数を分離
// orders.ts（"use server"）からre-export
```
- メリット: モック不要。高速。テストコードがシンプル。保守しやすい
- デメリット: Server Action自体の動作（DB操作の結果）はテストできない
- 適用: ステータス遷移ロジック、ラベル変換、計算ロジック

**推奨:** 方法3を基本とし、ビジネスロジックが正しいことをユニットテストで保証する。DB操作の確認は手動テストまたはインテグレーションテストで行う。
</details>

**Q14.** テストの「境界値分析」とは何ですか？在庫管理のテストに適用する場合の具体例を示してください。

<details><summary>回答</summary>

**境界値分析とは:**
バグは値の境界（切り替わり点）で発生しやすいため、境界値とその前後の値を重点的にテストする手法です。

**在庫管理の境界値:**

```typescript
describe("在庫チェック", () => {
  // 境界: stock = 0（品切れの閾値）
  it("stock=0 → 品切れ表示", () => {
    expect(getStockStatus(0)).toBe("out_of_stock");
  });
  it("stock=1 → 在庫あり", () => {
    expect(getStockStatus(1)).toBe("in_stock");
  });
  it("stock=-1 → 異常値（発生しないはずだが防御）", () => {
    expect(getStockStatus(-1)).toBe("out_of_stock");
  });

  // 境界: stock = 10（在庫僅少の閾値）
  it("stock=10 → 在庫僅少", () => {
    expect(getStockStatus(10)).toBe("low_stock");
  });
  it("stock=11 → 在庫あり", () => {
    expect(getStockStatus(11)).toBe("in_stock");
  });
  it("stock=9 → 在庫僅少", () => {
    expect(getStockStatus(9)).toBe("low_stock");
  });
});

describe("在庫減算", () => {
  // 境界: 在庫ちょうど分の購入
  it("stock=5, qty=5 → 成功（stock=0になる）", () => {
    expect(() => decrementStock(5, 5)).not.toThrow();
  });
  it("stock=5, qty=6 → 失敗（在庫不足）", () => {
    expect(() => decrementStock(5, 6)).toThrow("Insufficient stock");
  });

  // 境界: 数量0
  it("qty=0 → エラー（0個購入は不正）", () => {
    expect(() => decrementStock(5, 0)).toThrow();
  });
});
```

**一般的な境界値:** 0, 1, -1, 最大値, 最大値+1, 空文字, null, undefined
</details>

**Q15.** CI/CD（継続的インテグレーション/継続的デリバリー）パイプラインにテストを組み込む方法と、そのメリットを説明してください。

<details><summary>回答</summary>

**CI/CDパイプラインへのテスト組み込み:**

```yaml
# .github/workflows/test.yml
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
      - run: npx tsc --noEmit        # 型チェック
      - run: npm test                  # ユニットテスト
      - run: npx next lint            # リントチェック
```

**メリット:**

1. **自動チェック**: コードをpushするたびに自動でテストが走る。手動実行を忘れる心配がない
2. **品質のゲートキーパー**: テストが失敗するとマージをブロック。壊れたコードがmainに入らない
3. **チーム全体での品質維持**: 誰がコードを書いても同じ基準でチェックされる
4. **早期発見**: ローカルでテストし忘れても、CIが検出する
5. **信頼のバッジ**: PRに「テスト通過」のバッジが表示され、レビュアーが安心してマージできる

**テスト実行の順序（高速→低速）:**
1. `tsc --noEmit`（型チェック） → 最も高速
2. `next lint`（リントチェック） → 数秒
3. `npm test`（ユニットテスト） → 数秒〜数十秒
4. E2Eテスト（Playwright等） → 数分（必要に応じて）
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q16.** テスト駆動開発（TDD）のプロセスを説明し、本アプリのようなMVP開発でTDDを採用するかどうかの判断基準を述べてください。

<details><summary>回答</summary>

**TDDのプロセス（Red-Green-Refactor）:**

1. **Red（失敗するテストを書く）:**
   ```typescript
   it("pendingからpreparing, cancelledに遷移できる", () => {
     expect(getNextStatuses("pending")).toEqual(["preparing", "cancelled"]);
   });
   // → テスト失敗（関数がまだ存在しない）
   ```

2. **Green（テストを通す最小限のコードを書く）:**
   ```typescript
   function getNextStatuses(status: string): string[] {
     if (status === "pending") return ["preparing", "cancelled"];
     return [];
   }
   // → テスト成功
   ```

3. **Refactor（コードを整理する）:**
   ```typescript
   const TRANSITIONS = { pending: ["preparing", "cancelled"], ... };
   function getNextStatuses(status: string): string[] {
     return TRANSITIONS[status] ?? [];
   }
   ```

4. **繰り返す**

**MVP開発でTDDを採用すべきか:**

| 場面 | TDD推奨度 | 理由 |
|------|----------|------|
| ビジネスロジック（ステータス遷移、価格計算） | 高 | ルールが明確。テストが仕様書になる |
| UI/デザイン | 低 | 見た目の試行錯誤が多く、テストが頻繁に壊れる |
| プロトタイプ段階 | 低 | 要件が不確定。コードごと捨てる可能性がある |
| 外部API連携 | 中 | モックの設計は有用だが、セットアップコストが高い |

**結論:** MVPでは「全面TDD」ではなく、**ビジネスロジックの核心部分にのみTDDを適用**し、UIや探索的な部分は「コード先行 → 後からテスト追加」が現実的です。
</details>

**Q17.** テストを「書くべき関数」と「書かなくてよい関数」の判断基準を、本アプリの具体例とともに説明してください。

<details><summary>回答</summary>

**テストを書くべき関数:**

| 関数 | 理由 |
|------|------|
| `getNextStatuses()` | ステータス遷移のビジネスルール。間違えると運用に直結 |
| `getStatusLabel()` | 表示ラベルの変換。未知の値に対する安全なフォールバック |
| `getRoastLabel()` | 焙煎度の変換。ドメイン知識の正確性が必要 |
| `calculateCartTotal()` | 金額計算。1円でもずれると問題 |
| `getStockColor()` | 在庫アラートの閾値判定。色分けのミスは在庫管理に影響 |

**テストを書かなくてよい関数:**

| 関数 | 理由 |
|------|------|
| `createClient()` | Supabaseのラッパー。外部ライブラリのテストをする意味がない |
| 単純なgetter（`product.name`） | 言語機能のテスト。TypeScriptの型で保証される |
| UIコンポーネントのレンダリング | ユニットテストよりE2Eテストが適切 |
| `revalidatePath()` の呼び出し | Next.jsの内部機能。フレームワークのテストをする必要はない |

**判断基準:**
1. **ビジネスロジックか？** → 書く
2. **分岐が3つ以上あるか？** → 書く（全分岐をカバー）
3. **バグの影響が大きいか？** → 書く（金額計算、権限チェック等）
4. **外部ライブラリのラッパーか？** → 書かない
5. **将来変更される可能性が高いか？** → 書く（変更時のリグレッション防止）
</details>

**Q18.** Snapshot Testing（スナップショットテスト）とは何ですか？メリット・デメリットと、適用すべき場面を述べてください。

<details><summary>回答</summary>

**スナップショットテストとは:**
コンポーネントやオブジェクトの出力結果を「スナップショット」として保存し、次回テスト時に前回の結果と比較する手法です。

```typescript
import { render } from "@testing-library/react";

it("商品カードが正しくレンダリングされる", () => {
  const { container } = render(<ProductCard product={mockProduct} />);
  expect(container).toMatchSnapshot();
});
```

初回実行時に `.snap` ファイルが生成され、以降のテストでは出力がこのスナップショットと一致するか確認されます。

**メリット:**
1. テストコードが簡潔（`toMatchSnapshot()` の1行）
2. UIの意図しない変更を検出できる
3. 大量のプロパティを持つオブジェクトの検証に便利

**デメリット:**
1. **何をテストしているか不明確**: スナップショットが大きいと、どの変更が意図的でどれがバグか判断しにくい
2. **メンテナンス負担**: UIを少し変更するたびにスナップショットの更新が必要（`npm test -- -u`）
3. **テストの質が低い**: 「出力が変わった」ことは分かるが、「正しいか」は判断しない
4. **レビューしにくい**: 差分が大きいスナップショットの変更をコードレビューで確認するのは困難

**適用すべき場面:**
- 安定したAPIレスポンスの形状確認
- 設定オブジェクトの変更検出
- CSSクラスの意図しない変更の検出

**避けるべき場面:**
- 頻繁に変更されるUIコンポーネント
- 動的な値（日時、ランダムID等）を含むコンポーネント

**結論:** スナップショットテストは「変更検出ツール」であり、「品質保証ツール」ではありません。重要なロジックには通常のアサーション（`expect(x).toBe(y)`）を使うべきです。
</details>

**Q19.** テスト戦略を策定する際に考慮すべき「テストのROI（投資対効果）」について、コスト要素と効果要素を具体的に挙げてください。

<details><summary>回答</summary>

**コスト要素（投資）:**

| コスト | 内容 | 例 |
|--------|------|-----|
| **作成コスト** | テストコードを書く時間 | 純粋関数のテスト: 数分。E2Eテスト: 数時間 |
| **保守コスト** | コード変更時のテスト修正 | UIリファクタリング時にスナップショットを全更新 |
| **実行コスト** | テストの実行時間 | ユニットテスト: 数秒。E2E: 数分 |
| **インフラコスト** | CI/CDの実行環境 | GitHub Actions の無料枠を超える場合 |
| **学習コスト** | チームのテストスキル習得 | vitest, Playwright等のツール学習 |

**効果要素（リターン）:**

| 効果 | 内容 | 例 |
|------|------|-----|
| **バグ防止** | 本番でのバグ発生を防ぐ | ステータス遷移バグが本番で発生 → 全注文に影響 |
| **修正コスト削減** | 早期発見でコスト低減 | 本番バグの修正コストは開発時の10-100倍 |
| **開発速度** | リファクタリングへの自信 | テストがあれば大胆な変更が可能 |
| **ドキュメント** | コードの仕様が分かる | テストを読めば期待動作が分かる |
| **信頼性** | チーム・顧客への品質証明 | 「テスト全通過」のレポート |

**ROIが高いテスト（優先して書くべき）:**
1. ビジネスロジックのユニットテスト（コスト: 低、効果: 高）
2. 型チェック（`tsc --noEmit`）（コスト: ほぼゼロ、効果: 高）
3. クリティカルパスの手動テストシナリオ（コスト: 低、効果: 中）

**ROIが低いテスト（後回しでよい）:**
1. 全UIコンポーネントのスナップショットテスト（コスト: 高、効果: 低）
2. サードパーティライブラリのテスト（コスト: 中、効果: ゼロ）
</details>

**Q20.** 「テスタビリティ（テスト容易性）」を高める設計原則を、本アプリの具体例とともに3つ以上説明してください。

<details><summary>回答</summary>

**1. 関心の分離（Separation of Concerns）**
```typescript
// 悪い例: DB操作とロジックが混在
async function updateOrderStatus(orderId: string, newStatus: string) {
  const transitions = { pending: ["preparing", "cancelled"], ... };
  if (!transitions[currentStatus]?.includes(newStatus)) throw new Error("Invalid");
  await supabase.from("orders").update({ status: newStatus });
}

// 良い例: ロジックを分離
function getNextStatuses(status: string): string[] { ... }  // テスト容易
async function updateOrderStatus(orderId: string, newStatus: string) {
  if (!getNextStatuses(currentStatus).includes(newStatus)) throw new Error("Invalid");
  await supabase.from("orders").update({ status: newStatus });
}
```

**2. 依存性の注入（Dependency Injection）**
```typescript
// 悪い例: 内部でクライアントを生成
async function getOrders() {
  const supabase = await createClient(); // テスト時に差し替えられない
  return supabase.from("orders").select("*");
}

// 良い例: 外部から注入可能
async function getOrders(supabase: SupabaseClient) {
  return supabase.from("orders").select("*");
}
// テスト時: getOrders(mockSupabase)
```

**3. 純粋関数の優先（Pure Functions First）**
```typescript
// 本アプリの例: order-utils.ts に純粋関数を集約
export function getNextStatuses(status: string): string[] { ... }
export function getStatusLabel(status: string): string { ... }
export function getRoastLabel(roast: string): string { ... }
// → DB依存なし、モック不要、テスト最速
```

**4. 単一責任の原則（Single Responsibility Principle）**
```typescript
// 悪い例: 1つの関数が複数の責任を持つ
async function processOrder(orderId: string) {
  await validateOrder(orderId);   // バリデーション
  await chargePayment(orderId);    // 決済
  await updateStatus(orderId);     // ステータス更新
  await sendEmail(orderId);        // メール送信
}

// 良い例: 責任を分割
// 各関数が独立してテスト可能
async function processOrder(orderId: string) {
  await validateOrder(orderId);   // 個別テスト可能
  await chargePayment(orderId);   // 個別テスト可能
  await updateStatus(orderId);    // 個別テスト可能
  await sendEmail(orderId);       // 個別テスト可能
}
```

**5. 設定の外部化**
```typescript
// 悪い例: マジックナンバー
if (stock <= 10) return "low_stock";

// 良い例: 定数として外部化
const LOW_STOCK_THRESHOLD = 10;
if (stock <= LOW_STOCK_THRESHOLD) return "low_stock";
// テスト時に閾値を変えてテストできる
```
</details>

---

## コーディング・操作理解

### 初級（絶対に抑えてほしい基礎知識）

**Q21.** 以下のテストコードを読んで、何をテストしているか説明してください。

```typescript
import { describe, it, expect } from "vitest";
import { getStatusLabel } from "../order-utils";

describe("getStatusLabel", () => {
  it("全5ステータスの日本語ラベルが正しい", () => {
    expect(getStatusLabel("pending")).toBe("受注");
    expect(getStatusLabel("preparing")).toBe("発送準備中");
    expect(getStatusLabel("shipped")).toBe("発送済み");
    expect(getStatusLabel("completed")).toBe("完了");
    expect(getStatusLabel("cancelled")).toBe("キャンセル");
  });
});
```

<details><summary>回答</summary>

`getStatusLabel` 関数が、英語のステータスキーを正しい日本語ラベルに変換できるかをテストしています。

- `describe("getStatusLabel", ...)`: テスト対象の関数名でテストをグルーピング
- `it("全5ステータスの...", ...)`: テストケースの説明（何をテストしているか）
- `expect(getStatusLabel("pending")).toBe("受注")`: 「`"pending"` を渡したら `"受注"` が返るはず」という検証
- 5つの `expect` で、全5ステータスの変換を網羅的にチェック

1つでも `.toBe()` の期待値と実際の戻り値が異なれば、テストが失敗します。例えば `getStatusLabel("pending")` が `"注文受付"` を返したら、テストは失敗します。
</details>

**Q22.** 以下のコマンドはそれぞれ何をしますか？

```bash
npm test
npx tsc --noEmit
npx vitest run
npx vitest watch
```

<details><summary>回答</summary>

| コマンド | 動作 |
|---------|------|
| `npm test` | `package.json` の `scripts.test` に定義されたコマンドを実行（通常は `vitest run`） |
| `npx tsc --noEmit` | TypeScriptの型チェックのみ実行。JavaScriptファイルは出力しない（`--noEmit`）。型エラーがあれば表示 |
| `npx vitest run` | 全テストを1回実行して終了。CI/CDで使用 |
| `npx vitest watch` | ファイルの変更を監視し、変更があるたびに関連テストを再実行。開発中に使用 |

使い分け:
- **開発中**: `npx vitest watch` でリアルタイムにテスト結果を確認
- **コミット前**: `npm test` + `npx tsc --noEmit` で全チェック
- **CI/CD**: `npx vitest run` で1回実行
</details>

**Q23.** 以下のテストで `toEqual` と `toBe` の違いは何ですか？

```typescript
// toBe
expect(getStatusLabel("pending")).toBe("受注");

// toEqual
expect(getNextStatuses("pending")).toEqual(["preparing", "cancelled"]);
```

<details><summary>回答</summary>

**`toBe`（厳密等価 `===`）:**
- プリミティブ値（文字列、数値、boolean）の比較に使用
- 参照が同じかどうかを比較
- `"受注" === "受注"` → true

**`toEqual`（深い等価比較）:**
- オブジェクトや配列の中身の比較に使用
- 参照ではなく、構造と値が同じかどうかを比較
- `["preparing", "cancelled"]` と `["preparing", "cancelled"]` → 参照は異なるが中身は同じなのでtrue

```typescript
// toBe で配列を比較すると失敗する
const a = [1, 2, 3];
const b = [1, 2, 3];
expect(a).toBe(b);    // ✗ 失敗（参照が異なる）
expect(a).toEqual(b);  // ✓ 成功（中身が同じ）
```

**使い分け:**
- 文字列、数値 → `toBe`
- 配列、オブジェクト → `toEqual`
- null, undefined → `toBe` または `toBeNull()`, `toBeUndefined()`
</details>

**Q24.** テストファイルの配置場所について、以下の2つのパターンの違いを説明してください。

```
パターンA:
  src/lib/__tests__/order-utils.test.ts
  src/lib/order-utils.ts

パターンB:
  src/lib/order-utils.test.ts
  src/lib/order-utils.ts
```

<details><summary>回答</summary>

**パターンA: `__tests__` ディレクトリに集約**
- テストファイルが専用ディレクトリにまとまる
- `src/lib/` ディレクトリがスッキリする
- テストが多い場合に管理しやすい
- メリット: 本番コードとテストコードが明確に分離される
- デメリット: テスト対象のファイルとテストファイルの距離が遠い

**パターンB: テスト対象と同じディレクトリに配置**
- テスト対象のファイルの隣にテストファイルがある
- メリット: 対応関係が一目で分かる。ファイル探しが楽
- デメリット: ディレクトリにファイルが増える

**どちらが良いか:**
プロジェクトやチームの好みによりますが、どちらの場合もvitestは `.test.ts` や `.spec.ts` を自動検出するため、設定は同じです。本アプリではパターンAを採用しています。

**重要:** `vitest.config.ts` の `include` 設定でテストファイルのパターンを指定します:
```typescript
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
  },
});
```
</details>

**Q25.** 以下のテストに、`getRoastLabel` に未知の値を渡した場合のテストケースを追加してください。

```typescript
describe("getRoastLabel", () => {
  it("lightは浅煎り", () => {
    expect(getRoastLabel("light")).toBe("浅煎り");
  });
  it("mediumは中煎り", () => {
    expect(getRoastLabel("medium")).toBe("中煎り");
  });
  it("darkは深煎り", () => {
    expect(getRoastLabel("dark")).toBe("深煎り");
  });
  // ← ここに追加
});
```

<details><summary>回答</summary>

```typescript
it("未知の値にはデフォルト値を返す", () => {
  expect(getRoastLabel("unknown")).toBe("不明");
});

it("空文字にはデフォルト値を返す", () => {
  expect(getRoastLabel("")).toBe("不明");
});
```

エッジケースとして「未知の値」と「空文字」をテストします。関数が未知の入力に対して安全にフォールバック値（`"不明"`）を返すことを確認します。

これは「防御的プログラミング」のテストであり、予期しないデータが来てもアプリがクラッシュしないことを保証します。
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q26.** 以下のvitest設定ファイルの各項目が何を意味するか説明してください。

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

<details><summary>回答</summary>

| 項目 | 意味 |
|------|------|
| `environment: "node"` | テスト実行環境をNode.jsに設定（デフォルト）。`"jsdom"` にするとブラウザ環境をシミュレートできる |
| `include: ["src/**/*.test.ts"]` | `src` フォルダ以下の `.test.ts` ファイルをテスト対象として検出 |
| `coverage.reporter: ["text", "html"]` | テストカバレッジの出力形式。`text` はターミナルに表、`html` はHTMLレポートを生成 |
| `resolve.alias: { "@": ... }` | `@/lib/order-utils` のようなインポートパスを解決。Next.jsの `tsconfig.json` のパスエイリアスに合わせる |

**補足:**
- `environment: "node"` は純粋関数のテストに適している（DOM操作が不要）
- Reactコンポーネントのテストには `environment: "jsdom"` が必要
- `coverage` はオプション。`npx vitest run --coverage` で実行するとカバレッジが計測される
</details>

**Q27.** テストの `describe` のネストを使って、以下の `getNextStatuses` のテストを整理してください。

```typescript
// 整理前: フラットな構造
it("pending → preparing, cancelled", () => { ... });
it("preparing → shipped", () => { ... });
it("shipped → completed", () => { ... });
it("completed → 遷移先なし", () => { ... });
it("cancelled → 遷移先なし", () => { ... });
it("unknown → 空配列", () => { ... });
```

<details><summary>回答</summary>

```typescript
describe("getNextStatuses", () => {
  describe("遷移先があるステータス", () => {
    it("pending → preparing, cancelled", () => {
      expect(getNextStatuses("pending")).toEqual(["preparing", "cancelled"]);
    });

    it("preparing → shipped", () => {
      expect(getNextStatuses("preparing")).toEqual(["shipped"]);
    });

    it("shipped → completed", () => {
      expect(getNextStatuses("shipped")).toEqual(["completed"]);
    });
  });

  describe("遷移先がないステータス（終端）", () => {
    it("completed → 空配列", () => {
      expect(getNextStatuses("completed")).toEqual([]);
    });

    it("cancelled → 空配列", () => {
      expect(getNextStatuses("cancelled")).toEqual([]);
    });
  });

  describe("エッジケース", () => {
    it("未知のステータス → 空配列", () => {
      expect(getNextStatuses("unknown")).toEqual([]);
    });

    it("空文字 → 空配列", () => {
      expect(getNextStatuses("")).toEqual([]);
    });
  });
});
```

**ネストのメリット:**
- テストの意図がグルーピングで明確になる
- 失敗時に「どのカテゴリのテストが失敗したか」が分かりやすい
- `beforeEach` を使う場合、スコープを限定できる
</details>

**Q28.** 以下の関数のテストを書いてください。全分岐をカバーすること。

```typescript
function formatPrice(price: number): string {
  if (price < 0) return "価格エラー";
  if (price === 0) return "無料";
  return `¥${price.toLocaleString()}`;
}
```

<details><summary>回答</summary>

```typescript
import { describe, it, expect } from "vitest";

describe("formatPrice", () => {
  it("正の価格はカンマ区切りで表示", () => {
    expect(formatPrice(1800)).toBe("¥1,800");
  });

  it("大きい金額もカンマ区切りで表示", () => {
    expect(formatPrice(10000)).toBe("¥10,000");
  });

  it("小さい金額（カンマなし）", () => {
    expect(formatPrice(500)).toBe("¥500");
  });

  it("0は無料", () => {
    expect(formatPrice(0)).toBe("無料");
  });

  it("負の値は価格エラー", () => {
    expect(formatPrice(-100)).toBe("価格エラー");
  });

  it("1円", () => {
    expect(formatPrice(1)).toBe("¥1");
  });
});
```

**カバーしている分岐:**
1. `price < 0` → `"価格エラー"`
2. `price === 0` → `"無料"`
3. `price > 0` → `"¥..."` 形式
4. 境界値: 0, 1, -100, 大きい値（10000）

全3分岐をカバーし、境界値（0の前後）もテストしています。
</details>

**Q29.** vitest の `beforeEach` と `afterEach` の使い方を説明し、テストの独立性を保つための具体例を示してください。

<details><summary>回答</summary>

**`beforeEach`**: 各テストケースの実行前に呼ばれる。テストの前提条件を整える。
**`afterEach`**: 各テストケースの実行後に呼ばれる。テストの後片付け。

```typescript
describe("在庫管理のテスト", () => {
  let mockStock: Map<string, number>;

  beforeEach(() => {
    // 各テスト前にモックの在庫を初期化
    mockStock = new Map([
      ["variant-1", 10],
      ["variant-2", 0],
      ["variant-3", 5],
    ]);
  });

  afterEach(() => {
    // 各テスト後にモックをクリア（他のテストに影響しないように）
    vi.restoreAllMocks();
  });

  it("在庫がある場合は購入可能", () => {
    const stock = mockStock.get("variant-1")!;
    expect(stock).toBeGreaterThan(0);
    // variant-1 の在庫を1つ減らす
    mockStock.set("variant-1", stock - 1);
    expect(mockStock.get("variant-1")).toBe(9);
  });

  it("前のテストの影響を受けない", () => {
    // beforeEach で初期化されるため、variant-1 は 10 のまま
    expect(mockStock.get("variant-1")).toBe(10);
  });

  it("在庫0の場合は購入不可", () => {
    expect(mockStock.get("variant-2")).toBe(0);
  });
});
```

**重要:** `beforeEach` がないと、テストAで在庫を減らした影響がテストBに残り、テストの実行順序によって結果が変わる（フレイキーテスト）。各テストは独立して実行できるべきです。
</details>

**Q30.** テストのエラーメッセージを改善するために、以下のテストにカスタムメッセージを追加してください。

```typescript
it("全ステータスにラベルが定義されている", () => {
  const allStatuses = ["pending", "preparing", "shipped", "completed", "cancelled"];
  for (const status of allStatuses) {
    expect(getStatusLabel(status)).not.toBe("不明");
  }
});
```

<details><summary>回答</summary>

```typescript
it("全ステータスにラベルが定義されている", () => {
  const allStatuses = ["pending", "preparing", "shipped", "completed", "cancelled"];
  for (const status of allStatuses) {
    expect(
      getStatusLabel(status),
      `ステータス "${status}" のラベルが定義されていません（"不明" が返されました）`
    ).not.toBe("不明");
  }
});

// もしくは、it.each で個別テストにする
it.each([
  ["pending", "受注"],
  ["preparing", "発送準備中"],
  ["shipped", "発送済み"],
  ["completed", "完了"],
  ["cancelled", "キャンセル"],
])("ステータス %s のラベルは %s", (status, expectedLabel) => {
  expect(getStatusLabel(status)).toBe(expectedLabel);
});
```

**改善点:**
1. `expect()` の第2引数にカスタムメッセージを追加。失敗時に「どのステータスで失敗したか」が分かる
2. `it.each` でパラメータ化テストにすると、失敗した行が個別に表示される

**デフォルトのエラーメッセージ:** `Expected "不明" not to be "不明"`（どのステータスか分からない）
**改善後:** `ステータス "preparing" のラベルが定義されていません`（問題の箇所が明確）
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q31.** テーブル駆動テスト（Table-Driven Test / Parameterized Test）のパターンを使って、`getNextStatuses` のテストをリファクタリングしてください。

<details><summary>回答</summary>

```typescript
import { describe, it, expect } from "vitest";
import { getNextStatuses } from "../order-utils";

describe("getNextStatuses", () => {
  const testCases = [
    // [入力, 期待出力, 説明]
    { input: "pending",    expected: ["preparing", "cancelled"], desc: "受注 → 準備 or キャンセル" },
    { input: "preparing",  expected: ["shipped"],                desc: "準備中 → 発送済み" },
    { input: "shipped",    expected: ["completed"],              desc: "発送済み → 完了" },
    { input: "completed",  expected: [],                         desc: "完了 → 遷移なし" },
    { input: "cancelled",  expected: [],                         desc: "キャンセル → 遷移なし" },
    { input: "unknown",    expected: [],                         desc: "不明 → 空配列" },
    { input: "",           expected: [],                         desc: "空文字 → 空配列" },
  ];

  it.each(testCases)(
    "$desc: $input → $expected",
    ({ input, expected }) => {
      expect(getNextStatuses(input)).toEqual(expected);
    }
  );
});
```

**メリット:**
1. **新しいテストケースの追加が容易**: 配列に1行追加するだけ
2. **テストコードの重複排除**: ロジックは1箇所
3. **出力が見やすい**: テスト名にパラメータが表示される
4. **全パターンの一覧性**: テーブルを見るだけで全テストケースが把握できる

**出力例:**
```
 ✓ 受注 → 準備 or キャンセル: pending → ["preparing","cancelled"]
 ✓ 準備中 → 発送済み: preparing → ["shipped"]
 ✓ 完了 → 遷移なし: completed → []
 ...
```
</details>

**Q32.** 以下の関数のテストを書く際に、日時に依存するテストの問題とその解決方法を示してください。

```typescript
function isRecentOrder(orderDate: string): boolean {
  const now = new Date();
  const order = new Date(orderDate);
  const diffDays = (now.getTime() - order.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 30;
}
```

<details><summary>回答</summary>

**問題:** `new Date()` が現在日時を返すため、テストの実行日によって結果が変わる。例えば `"2026-05-01"` が30日以内かどうかは、テスト実行日に依存する。

**解決方法: `vi.useFakeTimers()` で時間を固定**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("isRecentOrder", () => {
  beforeEach(() => {
    // 時間を固定: 2026年5月15日 12:00:00
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers(); // テスト後に実時間に戻す
  });

  it("30日以内の注文はtrue", () => {
    expect(isRecentOrder("2026-05-01")).toBe(true);  // 14日前
  });

  it("ちょうど30日前はtrue（境界値）", () => {
    expect(isRecentOrder("2026-04-15")).toBe(true);  // 30日前
  });

  it("31日前はfalse（境界値）", () => {
    expect(isRecentOrder("2026-04-14")).toBe(false); // 31日前
  });

  it("今日の注文はtrue", () => {
    expect(isRecentOrder("2026-05-15")).toBe(true);  // 0日前
  });

  it("1年前の注文はfalse", () => {
    expect(isRecentOrder("2025-05-15")).toBe(false); // 365日前
  });
});
```

**代替アプローチ: 関数設計の改善（依存性の注入）**
```typescript
// nowを引数として受け取れるようにする
function isRecentOrder(orderDate: string, now: Date = new Date()): boolean {
  const order = new Date(orderDate);
  const diffDays = (now.getTime() - order.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 30;
}

// テスト時: now を明示的に渡す
expect(isRecentOrder("2026-05-01", new Date("2026-05-15"))).toBe(true);
```

後者の方がモックなしでテストできるため、よりシンプルです。
</details>

**Q33.** テストで外部依存（Supabase等）をモックする場合の `vi.mock()` の使い方を、具体例で示してください。

<details><summary>回答</summary>

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Supabaseクライアントをモック
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// モジュールのインポート
import { createClient } from "@/lib/supabase/server";
import { getOrders } from "../orders";

describe("getOrders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("注文一覧を正しく取得する", async () => {
    // Supabaseのチェーンメソッドをモック
    const mockOrders = [
      { id: "1", status: "pending", total_amount: 1800 },
      { id: "2", status: "completed", total_amount: 3600 },
    ];

    const mockSingle = vi.fn().mockResolvedValue({ data: mockOrders, error: null });
    const mockOrder = vi.fn().mockReturnValue({ data: mockOrders, error: null });
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

    (createClient as any).mockResolvedValue({ from: mockFrom });

    // テスト実行
    const result = await getOrders();

    // 検証
    expect(mockFrom).toHaveBeenCalledWith("orders");
    expect(result).toEqual(mockOrders);
  });

  it("DBエラー時は空配列を返す", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({ data: null, error: new Error("DB error") }),
      }),
    });

    (createClient as any).mockResolvedValue({ from: mockFrom });

    const result = await getOrders();
    expect(result).toEqual([]);
  });
});
```

**注意点:**
- `vi.mock()` はファイルの先頭（importの前）に巻き上げられる
- Supabaseのチェーンメソッドのモックは複雑になりがち → 純粋関数を分離してモック不要にするのが望ましい
- `vi.clearAllMocks()` で各テスト間のモックの状態をリセット
</details>

**Q34.** E2Eテスト（Playwright）を導入する場合の設計を概説し、ユニットテストとの使い分けを示してください。

<details><summary>回答</summary>

**Playwrightの設定:**
```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: true,
  },
  use: {
    baseURL: "http://localhost:3000",
  },
});
```

**E2Eテストの例:**
```typescript
// e2e/purchase-flow.spec.ts
import { test, expect } from "@playwright/test";

test("商品を購入できる", async ({ page }) => {
  // 商品一覧ページにアクセス
  await page.goto("/products");
  await expect(page.getByText("ウィラ エル・パライソ")).toBeVisible();

  // 商品詳細に遷移
  await page.click("text=ウィラ エル・パライソ");
  await expect(page).toHaveURL(/\/products\//);

  // カートに追加
  await page.click("text=カートに入れる");
  await expect(page.getByText("カートに追加しました")).toBeVisible();

  // カートページに遷移して確認
  await page.goto("/cart");
  await expect(page.getByText("ウィラ エル・パライソ")).toBeVisible();
});
```

**ユニットテストとの使い分け:**

| テスト | ユニットテスト | E2Eテスト |
|--------|-------------|----------|
| 対象 | ロジック（関数単位） | ユーザーフロー（画面遷移） |
| 速度 | ミリ秒 | 秒〜分 |
| 信頼性 | 非常に安定 | ブラウザ依存で不安定な場合がある |
| 保守コスト | 低 | 高（UIの変更に敏感） |
| カバー範囲 | ビジネスロジック | フロントエンド〜バックエンド全体 |

**テストピラミッドの適用:**
- ユニットテスト: 12件以上（ビジネスロジック）
- E2Eテスト: 3-5件（クリティカルパスのみ）
  - 購入フロー、ログインフロー、管理画面のステータス更新
</details>

**Q35.** テスト結果のレポーティングとCI/CDでの活用方法を設計してください。

<details><summary>回答</summary>

**テスト結果のレポーティング:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    reporters: ["default", "json", "html"],
    outputFile: {
      json: "./test-results/results.json",
      html: "./test-results/index.html",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./test-results/coverage",
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

**CI/CDでの活用（GitHub Actions）:**

```yaml
name: Test & Quality
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci

      # 型チェック
      - name: Type Check
        run: npx tsc --noEmit

      # ユニットテスト + カバレッジ
      - name: Unit Tests
        run: npx vitest run --coverage

      # テスト結果をアーティファクトとして保存
      - name: Upload Test Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: test-results/

      # カバレッジをPRにコメント
      - name: Coverage Report
        uses: davelosert/vitest-coverage-report-action@v2
        if: github.event_name == 'pull_request'

      # カバレッジが閾値を下回ったら失敗
      # thresholds 設定で自動的に失敗する
```

**レポートの活用:**
1. **PRコメント**: カバレッジの変動をPRに自動コメント
2. **バッジ**: READMEに「テスト通過」バッジを表示
3. **トレンド**: カバレッジの推移をダッシュボードで監視
4. **ゲートキーパー**: テスト失敗 or カバレッジ低下でマージをブロック
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q36.** 以下の2つのテストアプローチを比較し、どちらがより良いテストか理由とともに答えてください。

```typescript
// アプローチA: 実装の詳細をテスト
it("STATUS_LABELSにpendingが含まれている", () => {
  expect(STATUS_LABELS).toHaveProperty("pending");
  expect(STATUS_LABELS.pending).toBe("受注");
});

// アプローチB: 公開APIをテスト
it("pendingのラベルは受注", () => {
  expect(getStatusLabel("pending")).toBe("受注");
});
```

<details><summary>回答</summary>

**アプローチBの方が良いテストです。**

**理由:**

1. **実装の詳細に依存しない**: アプローチAは `STATUS_LABELS` というオブジェクトの存在を前提にしている。リファクタリングで `STATUS_LABELS` をMapに変更したり、名前を変えたらテストが壊れる。アプローチBは「関数に"pending"を渡したら"受注"が返る」という**振る舞い**をテストしており、内部実装が変わっても影響を受けない

2. **テストの意図が明確**: アプローチBは「ユーザーにとっての期待動作」を表現している。アプローチAは「オブジェクトのプロパティが存在する」というテストで、なぜそれが重要かが分かりにくい

3. **リファクタリング耐性**: コードの内部構造を変えてもテストが壊れない = 安心してリファクタリングできる

**原則:** テストは「何をするか（What）」をテストし、「どうやるか（How）」はテストしない。公開API（関数のインターフェース）を通じてテストすることで、実装の詳細から独立した堅牢なテストになります。
</details>

**Q37.** テストの保守コストを最小化するための設計パターンを3つ挙げ、それぞれの具体例を示してください。

<details><summary>回答</summary>

**1. テストヘルパー/ファクトリーパターン:**
```typescript
// テストデータの生成を関数化
function createMockProduct(overrides?: Partial<Product>): Product {
  return {
    id: "test-product-1",
    name: "テスト商品",
    description: "テスト用の商品",
    is_published: true,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,  // 個別のテストで必要な値だけ上書き
  };
}

// 使用例
it("非公開商品は表示されない", () => {
  const product = createMockProduct({ is_published: false });
  expect(shouldDisplayProduct(product)).toBe(false);
});
```
- メリット: テストデータの変更が1箇所で済む。Productの型が変わっても影響が最小限

**2. カスタムマッチャー:**
```typescript
// カスタムマッチャーの定義
expect.extend({
  toBeValidStatus(received: string) {
    const validStatuses = ["pending", "preparing", "shipped", "completed", "cancelled"];
    const pass = validStatuses.includes(received);
    return {
      pass,
      message: () => `${received} は有効なステータスではありません`,
    };
  },
});

// 使用例（意図が明確）
expect(order.status).toBeValidStatus();
```
- メリット: ドメイン固有のアサーションを再利用可能に。エラーメッセージがわかりやすい

**3. テストフィクスチャ（共通のセットアップ）:**
```typescript
// fixtures/orders.ts
export const pendingOrder = {
  id: "order-1",
  status: "pending",
  total_amount: 1800,
};

export const completedOrder = {
  id: "order-2",
  status: "completed",
  total_amount: 3600,
};

// テストファイル
import { pendingOrder, completedOrder } from "./fixtures/orders";
```
- メリット: テストデータが一元管理される。複数のテストファイルで同じデータを共有できる

**保守コスト最小化の原則:**
- DRY（Don't Repeat Yourself）をテストにも適用
- ただし、テストの可読性を犠牲にしない（「このテストが何をしているか」は1ファイルで完結すべき）
</details>

**Q38.** プロパティベーステスト（Property-Based Testing）の概念を説明し、`getNextStatuses` に適用する場合の例を示してください。

<details><summary>回答</summary>

**プロパティベーステストとは:**
具体的な入力値を指定するのではなく、「入力がどんな値でも、この性質（プロパティ）が成り立つ」ことを検証するテスト手法。テストフレームワークがランダムな入力を大量に生成して検証します。

**通常のテスト vs プロパティベーステスト:**
```typescript
// 通常: 具体的な値をテスト
it("pendingの遷移先は2つ", () => {
  expect(getNextStatuses("pending")).toHaveLength(2);
});

// プロパティベース: 任意の入力に対する性質をテスト
it("どんな入力に対しても配列を返す", () => {
  // ランダムな文字列を1000個生成してテスト
  fc.assert(fc.property(fc.string(), (status) => {
    const result = getNextStatuses(status);
    expect(Array.isArray(result)).toBe(true);
  }));
});
```

**`getNextStatuses` に適用する例:**
```typescript
import { fc, test } from "@fast-check/vitest";

describe("getNextStatuses のプロパティ", () => {
  // プロパティ1: 戻り値は常に配列
  test.prop([fc.string()])("任意の文字列に対して配列を返す", ([status]) => {
    const result = getNextStatuses(status);
    expect(Array.isArray(result)).toBe(true);
  });

  // プロパティ2: 遷移先に自分自身を含まない
  test.prop([fc.constantFrom("pending", "preparing", "shipped", "completed", "cancelled")])(
    "遷移先に現在のステータスを含まない",
    ([status]) => {
      const nextStatuses = getNextStatuses(status);
      expect(nextStatuses).not.toContain(status);
    }
  );

  // プロパティ3: 遷移先はすべて有効なステータス
  const validStatuses = ["pending", "preparing", "shipped", "completed", "cancelled"];
  test.prop([fc.constantFrom(...validStatuses)])(
    "遷移先はすべて有効なステータスである",
    ([status]) => {
      const nextStatuses = getNextStatuses(status);
      for (const next of nextStatuses) {
        expect(validStatuses).toContain(next);
      }
    }
  );
});
```

**メリット:** 開発者が思いつかなかったエッジケースをランダム入力で発見できる。
**デメリット:** テストが非決定的（ランダム入力のため）。seed を固定して再現性を確保する必要がある。
**適用場面:** 入力の範囲が広い関数、数学的な性質を持つ関数（ソート、変換、バリデーション等）。
</details>

**Q39.** ミューテーションテスト（Mutation Testing）とは何ですか？テストの品質をどう測定できるか説明してください。

<details><summary>回答</summary>

**ミューテーションテストとは:**
テスト対象のコードに意図的に小さな変更（ミュータント）を加え、既存のテストがその変更を検出（kill）できるかを確認する手法です。テストがミュータントを検出できなければ、そのテストは不十分です。

**例:**
```typescript
// 元のコード
function getNextStatuses(status: string): string[] {
  return TRANSITIONS[status] ?? [];
}

// ミュータント1: ?? を || に変更
function getNextStatuses(status: string): string[] {
  return TRANSITIONS[status] || [];  // ← 変更
}

// ミュータント2: [] を ["pending"] に変更
function getNextStatuses(status: string): string[] {
  return TRANSITIONS[status] ?? ["pending"];  // ← 変更
}

// ミュータント3: 戻り値を常に空配列に
function getNextStatuses(status: string): string[] {
  return [];  // ← 変更
}
```

**テストの品質の測定:**
```
ミューテーションスコア = 検出されたミュータント数 / 生成されたミュータント数 × 100%
```

- ミュータント3は既存テストで検出される（pendingのテストが失敗するため）→ killed
- ミュータント1は `??` と `||` の違いが表れない場合、検出されない → survived

**ツール:** Stryker（JavaScript向けのミューテーションテストツール）
```bash
npx stryker run
```

**カバレッジとの違い:**
- カバレッジ: 「テストがコードを通過したか」→ 通過しただけで検証していない可能性がある
- ミューテーションスコア: 「テストがコードの変更を検出できるか」→ テストの実効性を測定

**結論:** ミューテーションテストはテストの品質を測る最も正確な方法ですが、実行時間が非常に長い（すべてのミュータントに対してテストスイート全体を実行）ため、重要なモジュールに限定して適用するのが現実的です。
</details>

**Q40.** テスト自動化の成熟度モデルを4段階で定義し、本アプリが現在どの段階にあり、次に目指すべき段階は何かを述べてください。

<details><summary>回答</summary>

**テスト自動化の成熟度モデル:**

| レベル | 名称 | 内容 | ツール・プラクティス |
|--------|------|------|-------------------|
| **1** | 手動テスト | テストシナリオに基づく手動確認 | チェックリスト、ブラウザ操作 |
| **2** | 基礎的な自動テスト | 純粋関数のユニットテスト + 型チェック | vitest, tsc --noEmit |
| **3** | CI/CD統合テスト | 自動テストがPR/デプロイのゲートに。E2Eテスト導入 | GitHub Actions, Playwright |
| **4** | 高度なテスト戦略 | カバレッジ目標、パフォーマンステスト、セキュリティテスト、ミューテーションテスト | Stryker, Lighthouse CI, OWASP ZAP |

**本アプリの現在地: レベル2**

- 43項目の手動テストシナリオ（レベル1 ✓）
- vitestで12件のユニットテスト（レベル2 ✓）
- 純粋関数の分離（テスタビリティの確保）
- `tsc --noEmit` での型チェック

**次に目指すべき: レベル3（CI/CD統合テスト）**

具体的なアクション:
1. **GitHub Actionsの設定**: push/PRで自動テスト実行
2. **テスト失敗時のマージブロック**: PRの品質ゲートとして設定
3. **E2Eテストの追加**: Playwrightで購入フロー等のクリティカルパスを自動化（3-5件）
4. **カバレッジの可視化**: PRにカバレッジレポートを自動コメント

**レベル4に進むタイミング:**
- チームが3人以上になったとき
- 本番障害が発生し、テスト不足が原因と判明したとき
- セキュリティ監査の要件が生じたとき

MVPのフェーズでは、レベル3（CI/CD統合）まで到達していれば十分な品質保証体制です。
</details>
