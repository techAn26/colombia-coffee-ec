# Chapter 6: 注文を届けよう — 理解度テスト

---

## IT知識・概念理解

### 初級（絶対に抑えてほしい基礎知識）

**Q1.** 「ステータス」とは何ですか？注文管理における役割を説明してください。

<details><summary>回答</summary>

ステータスとは、注文が現在どの段階にあるかを示す「状態」のことです。注文管理では「受注→発送準備中→発送済み→完了」のように、注文の進捗を段階的に表します。ステータスがあることで、運営者は「どの注文を次に処理すべきか」がわかり、お客さんは「自分の注文が今どうなっているか」を確認できます。
</details>

**Q2.** 注文ステータスを色分けする目的は何ですか？

<details><summary>回答</summary>

一目で注文の状態を判別するためです。例えば「受注（黄色）」は注意が必要、「完了（緑）」はすべて終わった、「キャンセル（赤）」は異常系、といった具合に色で直感的に状態を把握できます。テキストだけでは一覧から目的の注文を探すのに時間がかかりますが、色があればパッと見て判断できます。
</details>

**Q3.** 「管理者」と「一般ユーザー」で、注文に対してできる操作の違いを述べてください。

<details><summary>回答</summary>

一般ユーザーは自分の注文の閲覧（注文履歴・注文詳細の確認）のみ可能です。管理者は全ユーザーの注文を閲覧でき、さらにステータスの更新（受注→発送準備中→発送済み→完了、またはキャンセル）が可能です。
</details>

**Q4.** 「スナップショット」とは何ですか？日常生活の例を1つ挙げて説明してください。

<details><summary>回答</summary>

スナップショットとは、ある時点のデータをコピーして保存することです。注文では、注文時の商品名・価格・配送先を注文データにコピーして保存します。日常の例：写真を撮ること。風景は日々変わっても、撮った写真は撮影時のまま残ります。同様に、商品が値上げされても注文時の価格は変わりません。
</details>

**Q5.** このアプリの注文ステータスを5つすべて挙げてください。

<details><summary>回答</summary>

1. 受注（pending）
2. 発送準備中（preparing）
3. 発送済み（shipped）
4. 完了（completed）
5. キャンセル（cancelled）
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q6.** キャンセルが「受注（pending）」の時だけ可能な理由を、ビジネス的な観点から説明してください。

<details><summary>回答</summary>

発送準備に入った後のキャンセルは、梱包作業の無駄・配送手配の取り消し・在庫の戻し処理など、複雑な巻き戻し処理が必要になるためです。MVPでは、まだ何も動き始めていない「受注」段階でのみキャンセルを許可し、運営コストを最小化しています。実務では返品・返金ポリシーとして段階的に対応を広げていきます。
</details>

**Q7.** 「三重ガード」（UI・ミドルウェア・RLS）それぞれの役割と、なぜ3つ必要なのかを説明してください。

<details><summary>回答</summary>

- **UI**: ヘッダーの「管理画面」リンクを管理者にだけ表示 → 一般ユーザーの目に触れないようにする（利便性）
- **ミドルウェア（proxy）**: `/admin/*` へのアクセス時にroleをチェックし、非adminをリダイレクト → URLを直接入力しても入れない（サーバー側の入口防御）
- **RLS**: ordersのUPDATEを`is_admin()`がtrueの場合のみ許可 → たとえAPIを直叩きされてもデータ変更不可（データベース層の最終防衛）

UIだけでは「見えないだけ」でURLを知っていれば突破可能。ミドルウェアだけではAPI直叩きに対応できない。RLSがデータベース層で最終的に守ります。層ごとに守ることで、どこか1つに穴があっても他の層がカバーします。
</details>

**Q8.** order_items（注文明細）テーブルにproduct_nameやpriceを保存する理由を、保存しなかった場合に何が起きるか含めて説明してください。

<details><summary>回答</summary>

保存しなかった場合、order_itemsからproductsテーブルを参照して商品名や価格を取得することになります。しかし、商品名が変更されたり、価格が改定されたりすると、過去の注文履歴にも変更後のデータが表示されてしまいます。お客さんが「1,800円で買ったのに2,000円と表示される」事態や、販売終了で商品が削除された場合に注文明細が表示できなくなる問題が発生します。注文時点のデータをスナップショットとして保存することで、元データの変更に影響されない正確な注文記録を維持できます。
</details>

**Q9.** `revalidatePath` はどのような場面で使い、何をしているのですか？

<details><summary>回答</summary>

Server Actionでデータを更新した後に使います。Next.jsはページをキャッシュしているため、データが変わってもページが古いまま表示されることがあります。`revalidatePath` を呼ぶと、指定したパスのキャッシュを無効化し、次回アクセス時に最新データで再描画させます。例えば管理者がステータスを更新した後、ユーザー側の注文履歴ページも最新のステータスで表示されるように、複数のパスに対して呼び出します。
</details>

**Q10.** RLS（Row Level Security）が注文データに対してどう機能しているか、「一般ユーザーが他人の注文を見られない」仕組みを説明してください。

<details><summary>回答</summary>

ordersテーブルのSELECTポリシーに `auth.uid() = user_id` という条件が設定されています。これにより、ログインユーザーのIDと注文のuser_idが一致する行だけが返されます。たとえ他人の注文IDを知っていてURLに入力しても、RLSがDB層で自動的にフィルタリングするため、データ自体が取得できません。コード側で特別なフィルタリングを書かなくても、DBが自動的に「自分の注文だけ」を返します。
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q11.** ステータス遷移を「コード側の条件分岐」で制御する方法と、「DBのCHECK制約やトリガー」で制御する方法の、それぞれのメリット・デメリットを挙げてください。

<details><summary>回答</summary>

**コード側で制御:**
- メリット: 柔軟にルールを変更できる。UIとロジックが近いので開発しやすい。エラーメッセージを細かくカスタマイズできる
- デメリット: DBを直接操作された場合は制御が効かない。複数のアプリから同じDBを使う場合、全アプリに同じロジックを実装する必要がある

**DB側で制御:**
- メリット: どんな経路（アプリ・直接SQL・管理ツール）からでも必ずルールが適用される。データの整合性が最も強く保証される
- デメリット: DBのトリガーやCHECK制約はデバッグしにくい。ロジック変更のたびにマイグレーションが必要。エラーメッセージがDB由来で分かりにくい

実務では両方を組み合わせ、コード側で利便性の高いバリデーション、DB側で最終防衛の制約を設けるのが一般的です。
</details>

**Q12.** もし「発送準備中」からもキャンセルできるようにする要件が追加された場合、どのような変更が必要ですか？考えられる影響範囲を挙げてください。

<details><summary>回答</summary>

1. **ステータス遷移ルール**: `getNextStatuses("preparing")` の返り値に `"cancelled"` を追加
2. **UIの変更**: 発送準備中の注文詳細画面にキャンセルボタンを表示
3. **在庫の巻き戻し**: キャンセル時に確保していた在庫を戻すロジックの追加（`decrement_stock` の逆処理）
4. **決済の取り消し**: 決済済みの場合は返金処理が必要（決済プロバイダのAPI呼び出し）
5. **通知**: ユーザーへのキャンセル確認メール送信
6. **管理画面**: キャンセル理由の入力欄の追加（運用上の記録のため）
7. **テスト**: 既存のステータス遷移テストの修正と、新しいキャンセルフローのテスト追加
</details>

**Q13.** 管理者権限チェックをフロントエンド（UI）だけで行った場合、具体的にどのような攻撃が可能ですか？

<details><summary>回答</summary>

1. **URLの直接入力**: `/admin/orders` に直接アクセスすれば管理画面が表示される
2. **ブラウザの開発者ツール**: 非表示にされた要素のCSSを変更してリンクを表示させる
3. **API直叩き**: Server ActionのエンドポイントにHTTPリクエストを直接送信し、ステータス更新を実行
4. **cURLやPostman**: ブラウザを使わずにAPIリクエストを送信し、任意の注文のステータスを変更

これらはすべて「フロントを迂回」する攻撃であり、サーバー側（ミドルウェア）とDB側（RLS）のチェックがなければ防げません。
</details>

**Q14.** スナップショット方式ではなく、「履歴テーブル（products_history）」を別途作成して商品の変更履歴を保持する方法と比較した場合のトレードオフを述べてください。

<details><summary>回答</summary>

**スナップショット方式（order_itemsにコピー）:**
- メリット: シンプル。注文に必要なデータだけ保存するので無駄がない。JOINなしで注文情報が完結する
- デメリット: 商品の変更履歴を追跡できない（「いつ値上げしたか」は分からない）。データの重複が発生する

**履歴テーブル方式:**
- メリット: 商品の変更履歴を完全に追跡できる。変更の監査（audit）に使える。データの正規化が保たれる
- デメリット: 複雑。注文表示時にorder_items→products_history のJOINが必要。「注文時点のバージョン」を正しく参照するロジックが必要。テーブルが増え、クエリが複雑になる

ECサイトのMVPではスナップショット方式が一般的です。履歴テーブルは、商品変更の監査が必要な場合や、多くのテーブルが同じ商品情報を参照する場合に有効です。
</details>

**Q15.** ミドルウェア（proxy）でのリダイレクト vs Server Component内でのリダイレクト、それぞれいつ使うべきですか？

<details><summary>回答</summary>

**ミドルウェア（proxy）でのリダイレクト:**
- リクエストがページコンポーネントに到達する前に処理される
- 適している場面: 認証チェック（ログインしていなければ/loginへ）、権限チェック（管理者でなければ/へ）、URLのリライト
- メリット: ページのレンダリング自体が発生しないので高速。全ページに一括適用できる

**Server Component内でのリダイレクト:**
- ページのレンダリング中にデータを取得し、条件に応じてリダイレクト
- 適している場面: 特定のデータの存在チェック（注文が見つからなければ404）、ビジネスロジックに基づくリダイレクト
- メリット: データベースの情報に基づく細かい制御が可能

一般的に、認証・認可の一括制御にはミドルウェア、データに依存する個別のリダイレクトにはServer Componentを使います。
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q16.** ステータス遷移を「ステートマシン（有限状態機械）」として設計するメリットは何ですか？また、xstateのようなライブラリを導入する判断基準は？

<details><summary>回答</summary>

**ステートマシンとして設計するメリット:**
- 「どの状態からどの状態に遷移できるか」が明確に定義され、不正な遷移が構造的に防がれる
- 遷移時のアクション（副作用）を状態と紐づけて管理できる
- 図として可視化でき、ビジネスサイドとの認識合わせが容易

**xstateなどの導入判断基準:**
- ステータスが7個以上、遷移パターンが複雑になる場合
- 遷移にガード条件（「在庫ありの場合のみ」等）が多い場合
- 並行状態（注文ステータスと決済ステータスが独立して遷移）がある場合
- チームメンバーが多く、遷移ルールの認識統一が必要な場合

今回のようにステータスが5つで遷移がほぼ直線的な場合は、シンプルなMap（`getNextStatuses`）で十分であり、ライブラリ導入はオーバーエンジニアリングです。
</details>

**Q17.** 注文データの設計で、ordersテーブルとorder_itemsテーブルを分ける（正規化する）理由は何ですか？1つのテーブルにまとめた場合と比較してください。

<details><summary>回答</summary>

**分ける（正規化する）理由:**
- 1つの注文に複数の商品が含まれる「1対多」の関係を正しく表現できる
- 注文全体の情報（ステータス・合計金額・配送先）と明細の情報（商品名・数量・単価）を分離できる
- ステータス更新時にordersだけ更新すればよい（明細は変わらない）

**1テーブルにまとめた場合:**
- 注文ステータスが明細行ごとに重複する（3商品なら同じステータスが3行）
- ステータス更新時に全明細行を更新する必要がある（更新漏れのリスク）
- 注文全体の合計金額を求めるのに集計が必要になる
- 配送先情報が明細行ごとに重複する

正規化により、データの一貫性が保たれ、更新時の不整合リスクが低減します。
</details>

**Q18.** 「楽観的UI更新（Optimistic Update）」をステータス更新に適用する場合、どのような設計になりますか？成功・失敗の両方のシナリオを説明してください。

<details><summary>回答</summary>

**楽観的UI更新の設計:**
1. 管理者がステータス更新ボタンを押した瞬間、UIだけ先に新しいステータスに変更する（サーバー応答を待たない）
2. バックグラウンドでServer Actionを呼び出す
3-a. **成功の場合**: そのまま確定。revalidatePathでページを最新化
3-b. **失敗の場合**: UIを元のステータスに戻し、エラーメッセージを表示

**考慮点:**
- React（Next.js）の`useOptimistic`フックを使って実装できる
- ネットワークが遅い環境での体感速度が大幅に向上する
- 失敗時のロールバックUIが必要になるため、実装の複雑度が上がる
- ステータス更新は頻度が低いため、ステータス更新よりも「カート追加」のような頻繁な操作に対して恩恵が大きい
</details>

**Q19.** 本アプリではRLSで「自分の注文だけ見える」を実現していますが、もしRLSを使わずにアプリケーション層だけで同じ制御を実現する場合、どのようなリスクがありますか？

<details><summary>回答</summary>

**アプリケーション層だけで制御する場合のリスク:**

1. **WHERE句の付け忘れ**: 新しいクエリを書くたびに `WHERE user_id = ?` を忘れずに付ける必要がある。1箇所でも漏れれば全ユーザーのデータが漏洩する
2. **APIエンドポイントの増加**: 管理画面用と一般ユーザー用で別々のクエリを書く必要がある
3. **直接DB接続への脆弱性**: Supabaseのクライアントライブラリを介さず直接DBに接続された場合、フィルタリングが効かない
4. **コードレビューの負担**: すべてのクエリでフィルタリングが正しいか人的チェックが必要
5. **マイクロサービス化時の問題**: 別のサービスが同じDBにアクセスする場合、同じフィルタリングロジックを再実装する必要がある

RLSはDB層で「デフォルトで安全」な状態を作るため、アプリケーション側のミスがあってもデータ漏洩を防げます。
</details>

**Q20.** 注文システムにおいて「冪等性（べきとうせい）」が重要な理由と、ステータス更新における冪等性の実現方法を説明してください。

<details><summary>回答</summary>

**冪等性とは:** 同じ操作を何回実行しても結果が変わらない性質。

**なぜ重要か:**
- ネットワークエラーでリトライが発生した場合、同じリクエストが2回届く可能性がある
- ユーザーがボタンを連打する可能性がある
- 冪等でなければ、「発送準備中→発送済み」の操作が2回送られたとき、2回目が意図しない遷移（発送済み→完了）を引き起こす可能性がある

**実現方法:**
1. **現在の状態チェック**: 更新前に「現在のステータスが期待値と一致するか」を確認する（`WHERE status = '現在の値'`）
2. **トランザクション**: 読み取りと更新をトランザクションで囲み、他の操作と競合しないようにする
3. **リクエストID**: 各操作に一意のIDを付与し、同じIDの操作は2回目以降無視する
4. **UIでの二重送信防止**: ボタン押下後はdisabledにして連打を防ぐ（ただしこれだけでは不十分）
</details>

---

## コーディング・操作理解

### 初級（絶対に抑えてほしい基礎知識）

**Q21.** 以下のステータス遷移の定義を見て、`pending` から遷移できるステータスをすべて答えてください。

```typescript
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["preparing", "cancelled"],
  preparing: ["shipped"],
  shipped: ["completed"],
  completed: [],
  cancelled: [],
};
```

<details><summary>回答</summary>

`preparing`（発送準備中）と `cancelled`（キャンセル）の2つです。

`STATUS_TRANSITIONS["pending"]` は `["preparing", "cancelled"]` を返すので、受注状態からは「発送準備に進む」か「キャンセルする」のどちらかに遷移できます。
</details>

**Q22.** 以下のコードは何をしていますか？

```typescript
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? "不明";
}
```

<details><summary>回答</summary>

ステータスの英語キー（例: `"pending"`）を日本語ラベル（例: `"受注"`）に変換する関数です。`??`（Null合体演算子）により、`STATUS_LABELS` に該当するキーがない場合は `"不明"` を返します。未知のステータスが来てもエラーにならない安全な設計です。
</details>

**Q23.** 注文一覧ページで、ステータスバッジの色を切り替えるために以下のようなマッピングを使っています。`shipped` の場合、どのCSSクラスが適用されますか？

```typescript
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  preparing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};
```

<details><summary>回答</summary>

`"bg-purple-100 text-purple-800"` が適用されます。紫色の背景と紫色のテキストで、「発送済みだがまだ届いていない」状態を示します。
</details>

**Q24.** 以下のServer Actionで `revalidatePath` を2つのパスに対して呼んでいる理由は何ですか？

```typescript
"use server";

export async function updateOrderStatus(orderId: string, newStatus: string) {
  // ... ステータス更新処理 ...
  revalidatePath("/admin/orders");
  revalidatePath("/mypage/orders");
}
```

<details><summary>回答</summary>

管理者がステータスを更新した後、管理画面（`/admin/orders`）とユーザーのマイページ（`/mypage/orders`）の両方のキャッシュを無効化するためです。管理者側だけ更新しても、ユーザー側のページが古いステータスのまま表示されてしまいます。両方のパスを再検証することで、どちらのページを見ても最新のステータスが表示されます。
</details>

**Q25.** 以下のSQLで取得されるデータはどのようなものですか？

```sql
SELECT o.id, o.status, o.total_amount, o.created_at
FROM orders o
WHERE o.user_id = auth.uid()
ORDER BY o.created_at DESC;
```

<details><summary>回答</summary>

現在ログインしているユーザー（`auth.uid()`）の注文を、新しい順に取得しています。取得される列は、注文ID、ステータス、合計金額、注文日時です。RLSが有効な場合、`WHERE o.user_id = auth.uid()` がなくても自分の注文だけが返されますが、明示的に書くことで意図が明確になります。
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q26.** 以下の `getNextStatuses` 関数にはバグがあります。バグを指摘し、修正してください。

```typescript
function getNextStatuses(currentStatus: string): string[] {
  const transitions: Record<string, string[]> = {
    pending: ["preparing", "cancelled"],
    preparing: ["shipped"],
    shipped: ["completed"],
    completed: [],
    cancelled: [],
  };
  return transitions[currentStatus]; // ← バグ
}
```

<details><summary>回答</summary>

`currentStatus` に未知の値（例: タイポや不正データ）が渡された場合、`transitions[currentStatus]` は `undefined` を返し、呼び出し元で配列として扱おうとするとエラーになります。

修正:
```typescript
return transitions[currentStatus] ?? [];
```

`??`（Null合体演算子）を使って、未知のステータスの場合は空配列を返すようにします。これにより、不正な値が来ても「遷移先なし」として安全に処理されます。
</details>

**Q27.** ステータス更新のServer Actionで、遷移ルールの検証を行うコードを書いてください。不正な遷移が試みられた場合はエラーを返すようにしてください。

<details><summary>回答</summary>

```typescript
"use server";

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = await createClient();

  // 現在のステータスを取得
  const { data: order, error } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return { error: "注文が見つかりません" };
  }

  // 遷移ルールを検証
  const allowedStatuses = getNextStatuses(order.status);
  if (!allowedStatuses.includes(newStatus)) {
    return {
      error: `${getStatusLabel(order.status)}から${getStatusLabel(newStatus)}への変更はできません`,
    };
  }

  // ステータス更新を実行
  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (updateError) {
    return { error: "ステータスの更新に失敗しました" };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/mypage/orders");
  return { success: true };
}
```
</details>

**Q28.** 以下の注文詳細取得クエリで、`order_items` のデータに `product_name` と `unit_price` が含まれている理由を、コードの観点から説明してください。

```typescript
const { data: order } = await supabase
  .from("orders")
  .select(`
    id, status, total_amount, created_at,
    shipping_name, shipping_address, shipping_phone,
    order_items (
      id, product_name, variant_name, quantity, unit_price
    )
  `)
  .eq("id", orderId)
  .single();
```

<details><summary>回答</summary>

`order_items` テーブルにスナップショットとして `product_name` と `unit_price` が保存されているため、`products` テーブルをJOINする必要がありません。これにより:

1. クエリがシンプルになる（余分なJOINが不要）
2. 商品が削除されても注文詳細が正しく表示される
3. 商品名や価格が変更されても注文時のデータが保持される
4. パフォーマンスが良い（テーブル結合が少ない）

同様に `shipping_name`, `shipping_address` も orders テーブルにスナップショットとして保存されており、配送先テーブルへの参照が不要になっています。
</details>

**Q29.** 管理者用の注文一覧にステータスフィルターを実装する場合、以下のコードの `???` 部分を埋めてください。

```typescript
export async function getAdminOrders(statusFilter?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("id, status, total_amount, created_at, profiles(display_name)")
    .order("created_at", { ascending: false });

  if (???) {
    ???
  }

  const { data, error } = await query;
  return data ?? [];
}
```

<details><summary>回答</summary>

```typescript
if (statusFilter) {
  query = query.eq("status", statusFilter);
}
```

`statusFilter` が渡された場合のみ `.eq("status", statusFilter)` でフィルタリングを追加します。渡されなかった場合は全ステータスの注文を返します。Supabaseのクエリビルダーはメソッドチェーンでフィルターを追加でき、条件付きでフィルターを組み立てることができます。
</details>

**Q30.** 以下のRLSポリシーを読んで、誰がどのような操作をできるか説明してください。

```sql
-- ordersテーブルのSELECTポリシー
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- ordersテーブルのUPDATEポリシー
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (is_admin());
```

<details><summary>回答</summary>

- **SELECT（閲覧）**: ログインユーザーは自分の注文（`user_id` が自分のID と一致する行）だけ閲覧できます。他のユーザーの注文は見えません。
- **UPDATE（更新）**: 管理者（`is_admin()` が true を返すユーザー）だけが注文を更新（ステータス変更）できます。一般ユーザーは自分の注文であっても更新できません。

注意点: 管理者のSELECTポリシーが別途ないと、管理者も自分の注文しか見えません。実際には管理者用のSELECTポリシー（`is_admin()` で全注文を閲覧可能）も必要です。
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q31.** 注文のステータス更新で競合状態（Race Condition）が発生するシナリオと、その対策を具体的なコードで示してください。

<details><summary>回答</summary>

**シナリオ:** 2人の管理者が同時に同じ注文のステータスを更新しようとした場合。
- 管理者Aが「受注→発送準備中」にしようとする
- 管理者Bが「受注→キャンセル」にしようとする
- 両方が現在のステータスを「受注」と読み取る
- 両方のUPDATEが実行され、後から実行された方で上書きされる

**対策: WHERE句で現在のステータスも条件に含める**

```typescript
const { data, error } = await supabase
  .from("orders")
  .update({ status: newStatus, updated_at: new Date().toISOString() })
  .eq("id", orderId)
  .eq("status", currentStatus)  // 現在のステータスが変わっていないことを確認
  .select()
  .single();

if (error || !data) {
  // 更新が0件 = 他の管理者が先に更新した
  return { error: "注文のステータスが変更されています。ページを再読み込みしてください。" };
}
```

これは「楽観的ロック」の一種で、更新対象を「IDとステータスの両方が一致する行」に限定することで、同時更新の競合を検出できます。
</details>

**Q32.** 以下のテストコードにテストケースを追加して、`getNextStatuses` のエッジケースを網羅してください。

```typescript
import { describe, it, expect } from "vitest";
import { getNextStatuses } from "./order-utils";

describe("getNextStatuses", () => {
  it("pending → preparing, cancelled", () => {
    expect(getNextStatuses("pending")).toEqual(["preparing", "cancelled"]);
  });

  // ここにテストケースを追加
});
```

<details><summary>回答</summary>

```typescript
describe("getNextStatuses", () => {
  it("pending → preparing, cancelled", () => {
    expect(getNextStatuses("pending")).toEqual(["preparing", "cancelled"]);
  });

  it("preparing → shipped", () => {
    expect(getNextStatuses("preparing")).toEqual(["shipped"]);
  });

  it("shipped → completed", () => {
    expect(getNextStatuses("shipped")).toEqual(["completed"]);
  });

  it("completed → 遷移先なし", () => {
    expect(getNextStatuses("completed")).toEqual([]);
  });

  it("cancelled → 遷移先なし", () => {
    expect(getNextStatuses("cancelled")).toEqual([]);
  });

  it("未知のステータス → 空配列（エラーにならない）", () => {
    expect(getNextStatuses("unknown")).toEqual([]);
  });

  it("空文字 → 空配列", () => {
    expect(getNextStatuses("")).toEqual([]);
  });

  it("大文字のPENDING → 空配列（大文字小文字は区別される）", () => {
    expect(getNextStatuses("PENDING")).toEqual([]);
  });
});
```

エッジケースとして「未知のステータス」「空文字」「大文字小文字の違い」をカバーし、いずれも空配列が返ることを確認しています。
</details>

**Q33.** 注文完了後にレビュー投稿を促すメール通知機能を追加する場合、ステータス更新のServer Actionにどのような処理を追加しますか？メール送信が失敗してもステータス更新は成功させたい場合の設計を示してください。

<details><summary>回答</summary>

```typescript
export async function updateOrderStatus(orderId: string, newStatus: string) {
  // 1. ステータス更新（必須処理）
  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) {
    return { error: "ステータス更新に失敗しました" };
  }

  // 2. 完了時のメール送信（ベストエフォート）
  if (newStatus === "completed") {
    // try-catchで囲み、失敗してもステータス更新の成功に影響させない
    try {
      const { data: order } = await supabase
        .from("orders")
        .select("user_id, profiles(email)")
        .eq("id", orderId)
        .single();

      await sendReviewPromptEmail(order.profiles.email, orderId);
    } catch (emailError) {
      // ログに記録するが、エラーは握りつぶす
      console.error("レビュー促進メールの送信に失敗:", emailError);
      // 将来的にはリトライキュー（Edge Functionのcron等）に入れる
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath("/mypage/orders");
  return { success: true };
}
```

ポイント: メール送信をtry-catchで囲み、失敗してもreturnしない。本格的にはメッセージキュー（Supabase Edge FunctionのDatabase Webhooks等）を使い、ステータス更新とメール送信を非同期に分離するのが望ましいです。
</details>

**Q34.** 注文データのページネーション（ページ分割）を実装する場合、オフセットベースとカーソルベースの2つの方法があります。それぞれの特徴を述べ、注文一覧にはどちらが適しているか理由とともに答えてください。

<details><summary>回答</summary>

**オフセットベース（OFFSET/LIMIT）:**
```typescript
const { data } = await supabase
  .from("orders")
  .select("*")
  .range(offset, offset + limit - 1);
```
- メリット: 実装が簡単。「N件目から」の指定が直感的。合計ページ数を算出しやすい
- デメリット: OFFSETが大きくなるとDBの性能が悪化（スキップする行を読み飛ばすため）。データ追加時にページがずれる

**カーソルベース:**
```typescript
const { data } = await supabase
  .from("orders")
  .select("*")
  .lt("created_at", cursor)
  .order("created_at", { ascending: false })
  .limit(limit);
```
- メリット: パフォーマンスが一定（インデックスを活用）。新しいデータが追加されてもずれない
- デメリット: 「N番目のページに直接ジャンプ」ができない。合計ページ数の算出に別クエリが必要

**注文一覧の場合:** 注文数が数百件程度のMVPならオフセットベースで十分です。数万件以上になる場合や、新しい注文が頻繁に追加される場合はカーソルベースが適しています。管理画面では「最新から順に処理する」使い方が主なので、カーソルベースとの相性が良いです。
</details>

**Q35.** スナップショットの代わりに「イベントソーシング」パターンで注文を管理する場合の設計を概説してください。どのような場面で検討すべきですか？

<details><summary>回答</summary>

**イベントソーシングの設計:**
現在の状態を保存するのではなく、発生したイベント（出来事）をすべて記録し、イベントを順に再生して現在の状態を導出する。

```
order_events テーブル:
| id | order_id | event_type        | payload               | created_at |
|----|----------|-------------------|-----------------------|------------|
| 1  | ord_001  | order_created     | {items: [...]}        | 10:00      |
| 2  | ord_001  | status_changed    | {to: "preparing"}     | 10:30      |
| 3  | ord_001  | shipping_updated  | {tracking: "xxx"}     | 11:00      |
| 4  | ord_001  | status_changed    | {to: "shipped"}       | 11:05      |
```

**メリット:**
- 完全な監査ログが自動的に残る（「誰が、いつ、何を変えたか」）
- 過去の任意の時点の状態を復元できる
- イベントから複数のビュー（注文一覧、分析データ、通知等）を生成できる

**デメリット:**
- 現在の状態を知るために全イベントの再生が必要（→ スナップショットテーブルを別途用意して高速化）
- 実装の複雑度が大幅に上がる
- チームの学習コストが高い

**検討すべき場面:**
- 監査要件が厳しい場合（金融、医療）
- 注文の変更履歴を完全に追跡する必要がある場合
- 複雑なワークフロー（部分キャンセル、分割配送等）がある場合

MVPのECサイトではオーバーエンジニアリングであり、スナップショット方式が適切です。
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q36.** 以下の `OrderStatusUpdater` コンポーネントの設計について、改善点を3つ以上挙げてください。

```typescript
"use client";

export function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const nextStatuses = getNextStatuses(currentStatus);

  async function handleClick(newStatus: string) {
    await updateOrderStatus(orderId, newStatus);
    window.location.reload();
  }

  return (
    <div>
      {nextStatuses.map((status) => (
        <button key={status} onClick={() => handleClick(status)}>
          {getStatusLabel(status)}にする
        </button>
      ))}
    </div>
  );
}
```

<details><summary>回答</summary>

1. **`window.location.reload()` の使用**: Next.jsでは `useRouter().refresh()` や `revalidatePath` を使うべき。フルリロードはUX悪化（全リソースの再読み込み）とReactの状態喪失を招く

2. **ローディング状態の欠如**: ボタン押下後にフィードバックがない。`useState` でローディング状態を管理し、処理中はボタンをdisabledにして二重送信を防ぐべき

3. **エラーハンドリングの欠如**: `updateOrderStatus` が失敗した場合の処理がない。try-catchでエラーを捕捉し、ユーザーにエラーメッセージを表示すべき

4. **確認ダイアログがない**: ステータス変更（特にキャンセル）は取り消しが困難な操作。`confirm()` か専用のモーダルで確認を求めるべき

5. **`useTransition` の未使用**: Server Actionの呼び出しには `useTransition` を使うことで、Reactが非同期遷移中の状態を適切に管理できる

改善版:
```typescript
"use client";
import { useTransition, useState } from "react";

export function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const nextStatuses = getNextStatuses(currentStatus);

  function handleClick(newStatus: string) {
    if (!confirm(`${getStatusLabel(newStatus)}に変更しますか？`)) return;
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      {error && <p className="text-red-600">{error}</p>}
      {nextStatuses.map((status) => (
        <button
          key={status}
          onClick={() => handleClick(status)}
          disabled={isPending}
        >
          {isPending ? "更新中..." : `${getStatusLabel(status)}にする`}
        </button>
      ))}
    </div>
  );
}
```
</details>

**Q37.** 注文データの「soft delete（論理削除）」と「hard delete（物理削除）」の違いと、注文テーブルにおいてどちらが適切か理由とともに答えてください。

<details><summary>回答</summary>

**物理削除（Hard Delete）:**
```sql
DELETE FROM orders WHERE id = 'xxx';
```
行がテーブルから完全に消える。

**論理削除（Soft Delete）:**
```sql
UPDATE orders SET deleted_at = NOW() WHERE id = 'xxx';
```
行は残るが `deleted_at` で「削除済み」をマーク。通常のクエリでは `WHERE deleted_at IS NULL` で除外。

**注文テーブルには論理削除が適切:**
1. **法的要件**: 取引記録は一定期間の保存義務がある（電子帳簿保存法等）
2. **会計**: 売上の計算に必要。物理削除すると過去の売上データが不整合になる
3. **カスタマーサポート**: 問い合わせ対応時に過去の注文を参照する必要がある
4. **復元可能性**: 誤って削除した場合に復元できる
5. **分析**: 過去のデータを含めた売上分析に必要

注意: 論理削除はRLSのポリシーに `deleted_at IS NULL` を含める必要があり、漏れると削除済みデータが見えてしまう。また、UNIQUEインデックスとの組み合わせに注意が必要です。
</details>

**Q38.** Supabase Realtimeを使って、管理者がステータスを更新したときにユーザーの注文詳細ページをリアルタイムで更新する実装の設計を示してください。

<details><summary>回答</summary>

```typescript
"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export function RealtimeOrderStatus({ orderId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setStatus(payload.new.status);
          // トースト通知を表示
          toast(`注文ステータスが「${getStatusLabel(payload.new.status)}」に更新されました`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, supabase]);

  return (
    <span className={STATUS_COLORS[status]}>
      {getStatusLabel(status)}
    </span>
  );
}
```

**設計上の考慮点:**
1. **RLSとの整合性**: Realtimeでもポリシーが適用されるため、ユーザーは自分の注文の変更のみ受信する
2. **クリーンアップ**: `useEffect` のクリーンアップ関数でチャネルを削除し、メモリリークを防ぐ
3. **初期値**: Server Componentで取得した `initialStatus` を初期値に使い、Realtimeで上書きする
4. **フォールバック**: WebSocket接続が切れた場合のポーリングフォールバックも検討すべき
</details>

**Q39.** 以下のようなSupabaseのRPCファンクション `decrement_stock` を注文確定時に呼ぶ設計になっています。この関数が「在庫の最終防衛ライン」として機能する理由と、アプリ側だけで在庫チェックした場合の問題を説明してください。

```sql
CREATE OR REPLACE FUNCTION decrement_stock(variant_id UUID, qty INT)
RETURNS VOID AS $$
BEGIN
  UPDATE product_variants
  SET stock = stock - qty
  WHERE id = variant_id AND stock >= qty;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock';
  END IF;
END;
$$ LANGUAGE plpgsql;
```

<details><summary>回答</summary>

**「最終防衛ライン」として機能する理由:**

この関数は `UPDATE ... WHERE stock >= qty` と `IF NOT FOUND THEN RAISE EXCEPTION` を1つのトランザクション内で実行します。PostgreSQLの行ロックにより、`UPDATE` 文は対象行を自動的にロックし、同時に別のリクエストが同じ行を更新しようとした場合は待たされます。これにより:

1. 在庫チェックと在庫減算が **アトミック**（分割不可能）に実行される
2. 同時に2人が最後の1個を買おうとしても、1人だけが成功する

**アプリ側だけで在庫チェックした場合の問題:**

```typescript
// 危険な例
const stock = await getStock(variantId); // → 1
if (stock >= quantity) {                 // → true
  await updateStock(variantId, stock - quantity); // → 0
}
```

2つのリクエストが同時に `getStock` を呼ぶと、両方が `stock = 1` を読み取り、両方が `if (stock >= 1)` を通過してしまう。結果として在庫が `-1` になる（オーバーセル）。読み取りと書き込みの間に他のリクエストが割り込む「TOCTOU（Time of Check to Time of Use）問題」です。
</details>

**Q40.** 大規模なECサイトで注文テーブルが数千万行になった場合を想定し、パフォーマンス劣化を防ぐためにどのようなDB設計上の工夫が必要ですか？3つ以上挙げてください。

<details><summary>回答</summary>

1. **適切なインデックス設計**:
   - `(user_id, created_at DESC)` — ユーザーの注文一覧用（複合インデックス）
   - `(status, created_at DESC)` — 管理画面のフィルタリング用
   - `(created_at DESC)` — 全体の時系列ソート用

2. **テーブルパーティショニング**:
   - `created_at` でレンジパーティション（月別・年別）を作成
   - 古い注文のクエリと新しい注文のクエリが別パーティションにアクセスし、互いに影響しない

3. **アーカイブ戦略**:
   - 完了から一定期間経過した注文を `orders_archive` テーブルに移動
   - メインテーブルのサイズを小さく保つ
   - 参照頻度の低い古いデータと頻繁にアクセスされる新しいデータを分離

4. **マテリアライズドビュー / キャッシュ**:
   - ダッシュボードの集計（ステータスごとの件数、売上集計）はマテリアライズドビューで事前計算
   - 毎回COUNT/SUMクエリを走らせない

5. **読み取りレプリカ**:
   - 注文一覧の表示（SELECT）はレプリカから読む
   - ステータス更新（UPDATE）はプライマリに書く
   - 読み書きの負荷を分散

6. **カーソルベースのページネーション**:
   - 前述の通り、OFFSETベースはデータ量が多いと性能劣化する
   - `WHERE created_at < :cursor` でインデックスを効率的に使う
</details>
