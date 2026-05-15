# Chapter 7: お店を回そう — 理解度テスト

---

## IT知識・概念理解

### 初級（絶対に抑えてほしい基礎知識）

**Q1.** CRUDとは何ですか？4つの操作を英語と日本語で答えてください。

<details><summary>回答</summary>

CRUDは、ほぼすべてのWebアプリケーションの基本操作を表す4文字です。

| 英語 | 日本語 | 例（コーヒー豆ECサイト） |
|------|--------|----------------------|
| **C**reate | 作成 | 新しいコーヒー豆を登録する |
| **R**ead | 読み取り | 商品一覧・詳細を表示する |
| **U**pdate | 更新 | 価格や説明を修正する |
| **D**elete | 削除 | 販売終了した商品を消す |
</details>

**Q2.** なぜ画像をデータベースに直接保存せず、ストレージ（Supabase Storage）に保存するのですか？

<details><summary>回答</summary>

画像ファイルは数MBと大きいため、DBに保存すると以下の問題が発生します。

1. **DBサイズが急激に大きくなる** → クエリが遅くなる
2. **バックアップのサイズも増える** → バックアップに時間がかかる
3. **画像の配信が遅くなる** → DBはデータ処理に最適化されており、ファイル配信には向いていない

代わりに、ファイル専用の「ストレージ」に保存し、DBにはその画像のURL（場所）だけを保存します。ブラウザが画像を表示するときはストレージから直接取得するため、高速に配信できます。
</details>

**Q3.** 「在庫管理」で、在庫数をバリエーション（200g/500g/1kg）ごとに管理する理由は何ですか？

<details><summary>回答</summary>

同じコーヒー豆でもバリエーションごとに在庫状況が異なるためです。例えば「ウィラ エル・パライソ」の200gは品切れだが500gはまだある、という状況が発生します。商品単位で在庫を管理すると、一部のバリエーションだけ品切れの場合に正確な在庫状況を反映できません。バリエーション単位の管理により、お客さんに正確な在庫情報を提供できます。
</details>

**Q4.** 「公開バケット」と「非公開バケット」の違いは何ですか？商品画像にはどちらが適切ですか？

<details><summary>回答</summary>

- **公開バケット**: 誰でもURLを知っていればファイルにアクセスできる
- **非公開バケット**: 認証されたユーザーのみアクセスできる（署名付きURLが必要）

商品画像には**公開バケット**が適切です。商品画像はすべてのサイト訪問者（未ログインユーザーを含む）に表示する必要があるため、認証なしでアクセスできる必要があります。一方、ユーザーの個人書類や請求書などのプライベートなファイルは非公開バケットに保存します。
</details>

**Q5.** `ON DELETE CASCADE` とは何ですか？商品削除時にどう働きますか？

<details><summary>回答</summary>

`ON DELETE CASCADE` は、親テーブルの行が削除されたときに、関連する子テーブルの行も自動的に削除される設定です。

商品（products）を削除すると、そのバリエーション（product_variants）も自動的に削除されます。CASCADE がなければ、バリエーションが残ったまま親の商品だけ消えてしまい、孤立したデータ（orphan records）が発生します。

ただし、注文済みの商品を削除する場合は、注文明細（order_items）にスナップショットが保存されているため、注文記録には影響しません。
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q6.** 商品の追加フォームと編集フォームを1つのコンポーネントで共用するメリットは何ですか？実装上のポイントも説明してください。

<details><summary>回答</summary>

**メリット:**
- コードの重複を防げる（追加・編集の入力欄は同じ）
- デザインや項目を変更するときに1箇所だけ修正すれば済む
- バリデーションロジックも共通化できる

**実装上のポイント:**
- `mode` プロパティで `"create"` と `"edit"` を切り替える
- `"create"` の場合: フォームの初期値は空。送信先は `createProduct` Server Action
- `"edit"` の場合: 既存データを初期値に設定。送信先は `updateProduct` Server Action
- 編集モードでは削除ボタンを表示（追加モードでは不要）
</details>

**Q7.** Server Actionsを使ってCRUD操作を行うメリットを、従来のREST APIと比較して説明してください。

<details><summary>回答</summary>

**Server Actions のメリット:**
- APIルート（`/api/products` など）を別途作成する必要がない
- フォームから直接サーバーの関数を呼び出せるため、コードがシンプル
- TypeScriptの型が呼び出し元と共有されるため、型安全
- `"use server"` を付けるだけでサーバー専用関数になる

**REST APIとの比較:**
- REST API: エンドポイント定義、HTTPメソッド選択、リクエスト/レスポンスの型変換が必要
- Server Actions: 関数を直接呼ぶだけ。Next.jsがHTTP通信を裏側で処理する

**注意点:** Server Actionsは内部的にはPOSTリクエストなので、外部からの呼び出しやキャッシュの仕組みはREST APIと異なります。
</details>

**Q8.** ストレージポリシーとRLS（Row Level Security）の考え方の共通点を説明してください。

<details><summary>回答</summary>

両方とも「誰が何をできるか」をデータベース層で制御する仕組みです。

| 観点 | RLS | ストレージポリシー |
|------|-----|-----------------|
| 対象 | テーブルの行（データ） | バケットのファイル |
| 制御 | SELECT/INSERT/UPDATE/DELETE | SELECT(閲覧)/INSERT(アップロード)/DELETE(削除) |
| ポリシー | `auth.uid() = user_id` 等 | `is_admin()` 等 |
| 効果 | アプリコードにバグがあってもデータ漏洩を防ぐ | アプリコードにバグがあっても不正アップロードを防ぐ |

共通の考え方は「アプリケーション側を信頼せず、データベース層で最終防御する」ことです。
</details>

**Q9.** 商品一覧で在庫が少ない商品を色分け表示（0=赤、10以下=オレンジ）する目的を、運営者の視点で説明してください。

<details><summary>回答</summary>

運営者（田中さん）が管理画面を開いたとき、一目で「どの商品の在庫が危険な状態か」を判断できるようにするためです。

- **赤（0個）**: 品切れ中。お客さんが購入できない状態。至急補充が必要
- **オレンジ（10以下）**: 在庫僅少。このまま放置すると品切れになる。発注を検討すべき
- **通常表示**: 十分な在庫あり

色分けがなければ、すべてのバリエーションの在庫数を一つずつ確認する必要があり、見落としや対応の遅れにつながります。在庫管理は「気づいたときには遅い」ことが多いため、視覚的なアラートが重要です。
</details>

**Q10.** バリエーション（200g/500gなど）を動的に追加・削除できるフォームUIは、なぜ通常の固定フォームより実装が複雑になるのですか？

<details><summary>回答</summary>

**複雑になる理由:**

1. **入力欄の数が可変**: 固定フォームなら `name`, `price` のように決まったフィールドだが、動的フォームでは「何番目のバリエーションか」をインデックスで管理する必要がある
2. **状態管理**: 配列で管理する必要があり、追加・削除時に配列のインデックスがずれる
3. **バリデーション**: 各バリエーションごとにバリデーション（名前が空でないか、価格が正の数か）が必要
4. **編集時の既存データ**: 既存バリエーションの更新、新規追加、既存の削除を区別する必要がある
5. **キーの管理**: Reactの `key` に配列インデックスを使うと、削除時に再レンダリングの問題が起きる（一意のIDを使うべき）
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q11.** 商品削除時に「本当に削除しますか？」の確認ダイアログを出す場合、`window.confirm()` とカスタムモーダルのどちらが適切ですか？それぞれの特徴を述べてください。

<details><summary>回答</summary>

**`window.confirm()`:**
- メリット: 実装が1行（`if (!confirm("削除しますか？")) return`）。ブラウザネイティブで安定
- デメリット: デザインをカスタマイズできない。ブランドイメージと一致しない。削除対象の詳細を表示できない

**カスタムモーダル:**
- メリット: サイトのデザインに合わせたUIにできる。「この商品名: ○○を削除します」のように詳細情報を表示できる。「削除」ボタンを赤くするなど、危険な操作を視覚的に強調できる
- デメリット: 実装コストが高い。状態管理（モーダルの開閉）が必要。アクセシビリティ（フォーカストラップ、ESCキーで閉じる等）の考慮が必要

**判断基準:** MVPでは `window.confirm()` で十分。ユーザー向け機能（レビュー削除等）やデザインの一貫性が重要な場合はカスタムモーダルを検討します。管理画面の内部ツールなら confirm で問題ありません。
</details>

**Q12.** 商品画像アップロード時にファイルサイズやファイル形式のバリデーションを行わなかった場合、どのような問題が発生しますか？

<details><summary>回答</summary>

1. **巨大ファイルのアップロード**: 100MBの画像がアップロードされるとストレージ容量を圧迫し、ユーザーの表示時に読み込みが遅くなる
2. **不正なファイル形式**: `.exe` や `.pdf` がアップロードされる可能性。画像として表示できないだけでなく、セキュリティリスクになる
3. **ストレージコストの増大**: 不要に大きなファイルが蓄積し、月額コストが膨張する
4. **ブラウザの表示エラー**: 非対応フォーマット（`.bmp`, `.tiff` 等）の場合、`<img>` タグで表示できない

**対策:**
```typescript
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

if (file.size > MAX_SIZE) throw new Error("5MB以下の画像を選択してください");
if (!ALLOWED_TYPES.includes(file.type)) throw new Error("JPEG, PNG, WebPのみ対応しています");
```

クライアント側でもサーバー側でもバリデーションを行うのが理想です。
</details>

**Q13.** 商品のフォームで `flavor_notes` をカンマ区切りテキストで入力し、配列に変換してDB保存する設計について、代替案を2つ挙げ、それぞれのトレードオフを述べてください。

<details><summary>回答</summary>

**現在の設計:** テキスト入力 → カンマ区切りで分割 → 配列として保存

**代替案1: タグ入力UI（チップUI）**
- 入力するとタグとして追加され、×ボタンで個別削除できるUI
- メリット: ユーザーに分かりやすい。カンマの付け方を間違えない。重複チェックがしやすい
- デメリット: 実装が複雑。ライブラリの追加が必要になる場合がある

**代替案2: プルダウン選択式（事前定義リストから選択）**
- 「チョコレート」「フルーティ」「ナッツ」等の定義済みリストから選択
- メリット: 表記揺れがなくなる（「チョコ」と「チョコレート」の混在を防げる）。フィルタリングや検索が正確になる
- デメリット: 新しいフレーバーノートを追加するたびにリストの更新が必要。自由度が下がる

**判断基準:** MVPではカンマ区切りテキストが最もシンプル。商品数が増えてフレーバーノートでの検索・フィルタリングが重要になったら、プルダウン選択式への移行を検討します。
</details>

**Q14.** 商品画像を削除した場合、ストレージ上のファイルも削除すべきですか？削除しない場合のリスクと、削除する場合の実装上の注意点を説明してください。

<details><summary>回答</summary>

**削除しない場合のリスク:**
- ストレージに孤立ファイル（orphaned files）が蓄積し、容量とコストが増え続ける
- 不要なファイルのURLが外部に流出した場合、削除済み商品の画像が閲覧可能な状態で残る

**削除する場合の実装上の注意点:**

1. **削除順序**: DBの `image_url` を先にnullにし、その後ストレージのファイルを削除する。逆にするとDBにはURLがあるのにファイルが存在しない状態（リンク切れ）が一時的に発生する

2. **画像の共有**: 同じ画像URLが複数の商品で使われている場合、1つの商品を削除したときに他の商品の画像も消えてしまう。参照カウントまたはユニークなファイル名を使うべき

3. **エラーハンドリング**: ストレージ削除が失敗した場合にDB更新をロールバックするか、バックグラウンドでリトライするかの設計が必要

4. **非同期クリーンアップ**: 商品削除時にすぐストレージ削除するのではなく、定期的なバッチ処理で孤立ファイルを検出・削除する方が安全
</details>

**Q15.** 楽観的ロック（Optimistic Locking）を在庫更新に適用する理由と、悲観的ロック（Pessimistic Locking）との違いを説明してください。

<details><summary>回答</summary>

**楽観的ロック:** 「競合は滅多に起きない」と楽観的に考え、更新時に競合を検出する
- `UPDATE ... WHERE id = ? AND version = ?` のように、読み取り時のバージョンと更新時のバージョンが一致する場合のみ更新する
- 一致しなければ「誰かが先に変更した」と判断し、エラーにする

**悲観的ロック:** 「競合が起きるかもしれない」と悲観的に考え、読み取り時にロックする
- `SELECT ... FOR UPDATE` で行をロックし、他のトランザクションがその行を読み書きできなくする
- 処理完了後にロック解除

**在庫更新に楽観的ロックが適する理由:**
- ECサイトでは同じバリエーションを同時に更新する頻度が低い（管理者は通常1人）
- 悲観的ロックはロック中に他のリクエストが待たされるため、高トラフィック時にボトルネックになる
- 楽観的ロックは「ロック待ち」が発生しないため、通常時のパフォーマンスが良い
- 競合が発生した場合は「再読み込みしてやり直してください」で十分対処可能
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q16.** Supabase Storageの代わりにCloudflare R2やAWS S3を使う場合、どのような設計変更が必要ですか？また、ストレージサービスを切り替えやすい設計にするにはどうすればよいですか？

<details><summary>回答</summary>

**必要な設計変更:**
1. アップロードAPI: Supabase Storageの `upload()` の代わりにS3のPutObject APIやR2のWorkers APIを使用
2. 公開URL: Supabase Storageの公開URLの代わりにCDN経由のURLを使用
3. 認証: SupabaseのセッションではなくAWS IAMやCloudflareのAPI Keyで認証
4. ストレージポリシー: RLS的なポリシーの代わりにIAMポリシーやバケットポリシーで制御

**切り替えやすい設計（ストレージアダプターパターン）:**
```typescript
// インターフェースを定義
interface StorageAdapter {
  upload(path: string, file: File): Promise<string>; // 公開URLを返す
  delete(path: string): Promise<void>;
  getPublicUrl(path: string): string;
}

// Supabase用の実装
class SupabaseStorageAdapter implements StorageAdapter { ... }

// S3用の実装
class S3StorageAdapter implements StorageAdapter { ... }

// 環境変数で切り替え
const storage: StorageAdapter =
  process.env.STORAGE_PROVIDER === "s3"
    ? new S3StorageAdapter()
    : new SupabaseStorageAdapter();
```

これにより、ストレージサービスの切り替え時にアプリケーションコードの変更を最小限に抑えられます。
</details>

**Q17.** 商品データのバリデーションを「クライアント側」「Server Action側」「DB制約」の3層で行うべき理由と、それぞれの層で検証すべき項目の違いを説明してください。

<details><summary>回答</summary>

**3層バリデーションの理由:**
各層は異なる攻撃ベクトルに対する防御であり、1つの層だけでは不十分です。

**クライアント側（React/フォーム）:**
- 目的: 即座のフィードバックでUXを向上させる
- 検証項目: 必須フィールドの空チェック、文字数制限、価格が正の数か、ファイルサイズ・形式
- 特徴: JavaScriptを無効化すれば迂回可能 → セキュリティにはならない

**Server Action側（サーバー）:**
- 目的: ビジネスロジックの検証。クライアントを信頼しない
- 検証項目: 管理者権限の確認、商品名の重複チェック、在庫数が負でないか、画像URLの形式
- 特徴: zodなどのスキーマバリデーションライブラリで型安全に検証

**DB制約（PostgreSQL）:**
- 目的: データの整合性の最終保証。アプリコードのバグがあっても守る
- 検証項目: NOT NULL、UNIQUE、CHECK（`price > 0`、`stock >= 0`）、外部キー制約
- 特徴: 直接SQLを実行しても制約違反は弾かれる

**まとめ:** クライアント側は「UXのため」、Server Actionは「ビジネスロジックのため」、DB制約は「データの最終防衛のため」。
</details>

**Q18.** 商品データを「論理削除（is_active = false）」にするか「物理削除（DELETE）」にするかの設計判断について、ECサイトの文脈で論じてください。

<details><summary>回答</summary>

**物理削除が適する場合:**
- テスト中に作った不要な商品データの掃除
- 個人情報保護法に基づくデータ削除要求（GDPR等）
- ON DELETE CASCADEで子データも含めて完全に消したい場合

**論理削除が適する場合（ECサイトでは主にこちら）:**
- 販売終了商品でも過去の注文履歴から参照される可能性がある
- 季節限定商品を「非公開→公開」で再度販売したい場合
- 誤削除時に復旧できる
- 売上分析で過去に販売した全商品のデータが必要

**本アプリの設計:**
`is_published` カラムで公開/非公開を切り替える設計になっており、これは事実上の論理削除と同じ効果です。「削除」ボタンによる物理削除は残していますが、注文明細にはスナップショットがあるため、注文記録への影響はありません。

**トレードオフ:** 論理削除はテーブルサイズが増え続ける。定期的なアーカイブ処理や、`WHERE is_active = true` の付け忘れ防止（RLSやビューで対応）が必要です。
</details>

**Q19.** 画像アップロードで「クライアントから直接Storageにアップロード」する方式と「サーバーを経由してアップロード」する方式の、それぞれの特徴とセキュリティ上の考慮点を比較してください。

<details><summary>回答</summary>

**クライアント直接アップロード（現在の方式）:**
```
ブラウザ → Supabase Storage（直接）
```
- メリット: サーバーの負荷がない。大きなファイルもサーバーのメモリを消費しない。アップロード速度が速い
- デメリット: クライアントにSupabaseの認証情報が公開される（anon key）。ストレージポリシーで権限制御が必須
- セキュリティ: ストレージポリシーでadminのみアップロード可能にする。ファイル名にUUIDを使い推測を防ぐ

**サーバー経由アップロード:**
```
ブラウザ → Next.js API Route → Supabase Storage
```
- メリット: サーバー側でファイルの検証（ウイルススキャン、リサイズ等）が可能。service_roleキーを使えるので、ストレージポリシーをより厳格にできる
- デメリット: サーバーのメモリとCPUを消費する。大きなファイルのアップロードでサーバーがボトルネックに。Vercelの関数はペイロードサイズに制限がある（4.5MB）

**判断基準:** MVPではクライアント直接アップロードが適切（シンプルでパフォーマンスが良い）。ファイルの加工（リサイズ・サムネイル生成）やウイルススキャンが必要な場合はサーバー経由を検討します。
</details>

**Q20.** 商品管理システムをマルチテナント対応（複数の店舗が同じシステムを使う）にする場合、どのような設計変更が必要ですか？

<details><summary>回答</summary>

**主な設計変更:**

1. **テナントIDの追加:**
   - `products`, `orders`, `product_variants` 等のすべてのテーブルに `tenant_id` カラムを追加
   - RLSで `tenant_id` によるデータ分離を強制

2. **認証・認可の拡張:**
   - ユーザーが所属するテナントの管理。1ユーザーが複数テナントに所属する場合のテナント切り替え
   - 管理者権限もテナントスコープに（テナントAの管理者がテナントBの商品を操作できない）

3. **ストレージの分離:**
   - バケットをテナントごとに分けるか、ファイルパスにテナントIDを含める（`/{tenant_id}/products/{image}`）
   - ストレージポリシーもテナントIDで制御

4. **RLSの強化:**
   ```sql
   CREATE POLICY "Tenant isolation"
     ON products FOR ALL
     USING (tenant_id = get_current_tenant_id());
   ```

5. **ドメイン/サブドメイン:**
   - `shop-a.example.com` のようなサブドメインでテナントを識別
   - または `example.com/shop-a` のようなパスベースのルーティング

**トレードオフ:** マルチテナントは設計の複雑度が大幅に上がるため、MVPでは単一テナントで構築し、需要が生まれてから拡張すべきです。
</details>

---

## コーディング・操作理解

### 初級（絶対に抑えてほしい基礎知識）

**Q21.** 以下のServer Actionは何をしていますか？

```typescript
"use server";

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) throw new Error("商品の削除に失敗しました");

  revalidatePath("/admin/products");
  redirect("/admin/products");
}
```

<details><summary>回答</summary>

指定されたIDの商品をデータベースから削除するServer Actionです。

1. `"use server"` でサーバー専用関数であることを宣言
2. Supabaseクライアントを作成
3. `products` テーブルから指定IDの行を削除（`ON DELETE CASCADE` でバリエーションも自動削除される）
4. エラーがあればエラーをスロー
5. `revalidatePath` で管理画面の商品一覧ページのキャッシュを無効化
6. `redirect` で商品一覧ページに遷移（削除した商品の編集ページにいる場合、そこに留まっても意味がないため）
</details>

**Q22.** 以下のコードで画像をSupabase Storageにアップロードしています。`uuidv4()` を使う理由は何ですか？

```typescript
const fileName = `${uuidv4()}.${file.name.split(".").pop()}`;
const { error } = await supabase.storage
  .from("product-images")
  .upload(fileName, file);
```

<details><summary>回答</summary>

ファイル名の衝突を防ぐためです。ユーザーが `coffee.jpg` という名前で何度もアップロードすると、同じファイル名で上書きされてしまいます。`uuidv4()` で一意のID（例: `550e8400-e29b-41d4-a716-446655440000.jpg`）を生成することで、毎回異なるファイル名になり、衝突が起きません。

また、セキュリティ面でも、ファイル名からファイル内容を推測されることを防ぎます（`product-photo-secret.jpg` のような名前だと推測されやすい）。
</details>

**Q23.** 商品フォームのバリエーション部分で、以下のような状態管理をしています。「バリエーションを追加」ボタンの `onClick` ハンドラを書いてください。

```typescript
const [variants, setVariants] = useState([
  { name: "", price: 0, stock: 0 },
]);
```

<details><summary>回答</summary>

```typescript
function handleAddVariant() {
  setVariants([...variants, { name: "", price: 0, stock: 0 }]);
}
```

スプレッド演算子（`...variants`）で既存のバリエーション配列をコピーし、新しい空のバリエーションオブジェクトを末尾に追加した新しい配列をセットします。Reactの状態更新は不変（immutable）に行う必要があるため、`variants.push()` ではなくスプレッドで新しい配列を作成します。
</details>

**Q24.** 管理画面の商品一覧で、在庫数に応じた色分けを行う関数を完成させてください。

```typescript
function getStockColor(stock: number): string {
  // ??? を埋めてください
}
// 期待: stock === 0 → "text-red-600", stock <= 10 → "text-orange-500", それ以外 → "text-green-600"
```

<details><summary>回答</summary>

```typescript
function getStockColor(stock: number): string {
  if (stock === 0) return "text-red-600";
  if (stock <= 10) return "text-orange-500";
  return "text-green-600";
}
```

条件の順序が重要です。`stock === 0` を先にチェックしないと、`stock <= 10` の条件に含まれてしまいます（0は10以下でもあるため）。狭い条件から順にチェックするのが鉄則です。
</details>

**Q25.** 以下のSupabaseクエリは何を取得していますか？

```typescript
const { data } = await supabase
  .from("products")
  .select(`
    id, name, is_published,
    product_variants (id, name, price, stock)
  `)
  .order("created_at", { ascending: false });
```

<details><summary>回答</summary>

全商品のリストを、作成日時の新しい順に取得しています。各商品に紐づくバリエーション（ID、バリエーション名、価格、在庫数）もリレーションを使って一緒に取得しています。

取得されるデータの構造例:
```json
[
  {
    "id": "xxx",
    "name": "ウィラ エル・パライソ",
    "is_published": true,
    "product_variants": [
      { "id": "v1", "name": "200g", "price": 1800, "stock": 15 },
      { "id": "v2", "name": "500g", "price": 3600, "stock": 0 }
    ]
  }
]
```

Supabaseのリレーションクエリにより、SQLのJOINに相当する処理が簡潔に書けます。
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q26.** 以下の `createProduct` Server Actionにバリデーションを追加してください。商品名が空の場合と、バリエーションが0個の場合にエラーを返すようにしてください。

```typescript
"use server";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const variants = JSON.parse(formData.get("variants") as string);

  // ここにバリデーションを追加

  const supabase = await createClient();
  // ... 保存処理
}
```

<details><summary>回答</summary>

```typescript
"use server";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const variants = JSON.parse(formData.get("variants") as string);

  // バリデーション
  if (!name || name.trim() === "") {
    return { error: "商品名は必須です" };
  }

  if (!Array.isArray(variants) || variants.length === 0) {
    return { error: "バリエーションを1つ以上追加してください" };
  }

  // 各バリエーションのバリデーション
  for (const variant of variants) {
    if (!variant.name || variant.name.trim() === "") {
      return { error: "バリエーション名は必須です" };
    }
    if (typeof variant.price !== "number" || variant.price <= 0) {
      return { error: "価格は正の数を指定してください" };
    }
    if (typeof variant.stock !== "number" || variant.stock < 0) {
      return { error: "在庫数は0以上を指定してください" };
    }
  }

  const supabase = await createClient();
  // ... 保存処理
}
```

サーバー側でもバリデーションを行う理由は、クライアント側のバリデーションはJavaScriptを無効化するだけで迂回できるためです。
</details>

**Q27.** 商品の更新処理で、商品テーブルの更新とバリエーションの更新を行う場合、以下の問題点を指摘し、改善案を示してください。

```typescript
// 問題のあるコード
await supabase.from("products").update({ name, description }).eq("id", productId);
await supabase.from("product_variants").delete().eq("product_id", productId);
for (const v of variants) {
  await supabase.from("product_variants").insert({ product_id: productId, ...v });
}
```

<details><summary>回答</summary>

**問題点:**

1. **N+1問題**: バリエーションを1つずつINSERTしているため、バリエーション数分のクエリが発行される
2. **アトミック性の欠如**: 商品の更新は成功したがバリエーションの削除・再挿入の途中で失敗した場合、データが不整合な状態になる
3. **全削除→再挿入のリスク**: 既存バリエーションに紐づく注文明細（variant_id）があった場合、参照先が消えて不整合が発生する可能性がある

**改善案:**

```typescript
// 1. バリエーションの一括INSERT
await supabase.from("products").update({ name, description }).eq("id", productId);

// 2. 既存バリエーションとの差分を計算して更新
// 既存のバリエーションを取得
const { data: existing } = await supabase
  .from("product_variants")
  .select("id")
  .eq("product_id", productId);

const existingIds = new Set(existing?.map((v) => v.id));
const newVariants = variants.filter((v) => !v.id); // IDなし = 新規
const updateVariants = variants.filter((v) => v.id && existingIds.has(v.id)); // 既存を更新
const deleteIds = [...existingIds].filter((id) => !variants.some((v) => v.id === id)); // 削除対象

// 3. 一括操作
if (newVariants.length > 0) {
  await supabase.from("product_variants").insert(
    newVariants.map((v) => ({ product_id: productId, ...v }))
  );
}
if (deleteIds.length > 0) {
  await supabase.from("product_variants").delete().in("id", deleteIds);
}
for (const v of updateVariants) {
  await supabase.from("product_variants").update(v).eq("id", v.id);
}
```
</details>

**Q28.** 画像アップロードコンポーネントで、プレビュー表示を実装してください。以下の `???` を埋めてください。

```typescript
function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // プレビュー表示: ???

    // アップロード処理（省略）
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && <img src={preview} alt="プレビュー" className="w-32 h-32 object-cover" />}
    </div>
  );
}
```

<details><summary>回答</summary>

```typescript
// プレビュー表示
const objectUrl = URL.createObjectURL(file);
setPreview(objectUrl);
```

`URL.createObjectURL(file)` は、ファイルオブジェクトからブラウザ内で参照可能な一時的なURLを生成します。このURLを `<img>` の `src` に設定することで、サーバーにアップロードする前にローカルでプレビュー表示できます。

注意: コンポーネントのアンマウント時やファイル変更時に `URL.revokeObjectURL(objectUrl)` を呼んでメモリを解放するのがベストプラクティスです。

```typescript
// クリーンアップ付きの完全版
useEffect(() => {
  return () => {
    if (preview) URL.revokeObjectURL(preview);
  };
}, [preview]);
```
</details>

**Q29.** 以下のストレージポリシーを読んで、「誰が何をできるか」を説明してください。

```sql
-- 閲覧ポリシー
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- アップロードポリシー
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND is_admin());

-- 削除ポリシー
CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND is_admin());
```

<details><summary>回答</summary>

| 操作 | 誰ができるか | 条件 |
|------|------------|------|
| **閲覧（SELECT）** | 誰でも（未ログインユーザーを含む） | `product-images` バケットのファイルが対象 |
| **アップロード（INSERT）** | 管理者のみ | `is_admin()` が true を返すユーザー |
| **削除（DELETE）** | 管理者のみ | `is_admin()` が true を返すユーザー |

一般ユーザーは商品画像を閲覧できますが、アップロードや削除はできません。これにより、不正な画像のアップロードや、既存画像の削除を防いでいます。RLSと同様に、アプリコードのバグがあっても、ストレージポリシーがデータベース層で守ります。
</details>

**Q30.** 在庫数を個別に更新する `updateVariantStock` Server Actionを実装してください。在庫数が負の数にならないようにバリデーションを含めてください。

<details><summary>回答</summary>

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateVariantStock(variantId: string, newStock: number) {
  // バリデーション
  if (!Number.isInteger(newStock) || newStock < 0) {
    return { error: "在庫数は0以上の整数を指定してください" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("product_variants")
    .update({ stock: newStock })
    .eq("id", variantId);

  if (error) {
    return { error: "在庫数の更新に失敗しました" };
  }

  revalidatePath("/admin/products");
  return { success: true };
}
```

ポイント:
- `Number.isInteger()` で小数を弾く（在庫は整数のみ）
- `newStock < 0` で負の値を弾く
- DB側にも `CHECK (stock >= 0)` 制約を設けるのが理想的（二重防御）
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q31.** 商品画像のリサイズ（サムネイル生成）をアップロード時に行いたい場合、以下の3つのアプローチのうちどれが適切か、理由とともに答えてください。

1. クライアント（ブラウザ）でリサイズしてからアップロード
2. Server Action（Next.js）でリサイズ
3. Supabase Edge Functionでリサイズ（Storage Webhookをトリガー）

<details><summary>回答</summary>

**3. Supabase Edge Functionが最も適切です。**

**各アプローチの評価:**

| アプローチ | メリット | デメリット |
|-----------|---------|-----------|
| 1. クライアント | サーバー負荷ゼロ | Canvas APIの品質が低い。デバイスのスペックに依存。回避可能（DevToolsで元画像を直接アップ） |
| 2. Server Action | 柔軟な画像処理。sharp等のライブラリ使用可 | Vercelのサーバーレス関数はCPU・メモリに制約。大きな画像でタイムアウトの可能性 |
| 3. Edge Function | 非同期処理でユーザーを待たせない。ストレージにアップされたら自動実行 | 別サービスの管理が増える。デバッグが少し複雑 |

**3が適切な理由:**
- アップロード完了をトリガーに自動実行されるため、アプリコードの変更が不要
- 非同期なのでユーザーのアップロード体験に影響しない
- Edge Functionは画像処理に十分なリソースを割当可能
- オリジナル画像を保持したまま、サムネイルを別パスに保存できる
</details>

**Q32.** 以下のコードで、商品を更新する際に楽観的ロック（Optimistic Locking）を実装しています。`updated_at` を使った楽観的ロックの仕組みを説明してください。

```typescript
export async function updateProduct(productId: string, data: ProductUpdate) {
  const supabase = await createClient();

  const { data: updated, error } = await supabase
    .from("products")
    .update({
      name: data.name,
      description: data.description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .eq("updated_at", data.originalUpdatedAt)  // 楽観的ロック
    .select()
    .single();

  if (error || !updated) {
    return { error: "この商品は他のユーザーが変更しています。ページを再読み込みしてください。" };
  }

  return { success: true };
}
```

<details><summary>回答</summary>

**仕組み:**

1. 商品の編集画面を開いたとき、その時点の `updated_at`（最終更新日時）をフォームの隠しフィールド（`originalUpdatedAt`）に保存する
2. 保存ボタンを押したとき、`UPDATE ... WHERE id = ? AND updated_at = ?` で更新する
3. `updated_at` が一致 = 自分が読み取ってから誰も変更していない → 更新成功
4. `updated_at` が不一致 = 他の管理者が先に更新した → 0行更新 → エラーメッセージを表示

**なぜ `updated_at` を使うのか:**
- 専用の `version` カラム（整数をインクリメント）を使う方法もあるが、`updated_at` なら「いつ変更されたか」の情報も兼ねるため、カラムを追加せずに済む
- ただし、タイムスタンプの精度（ミリ秒まで一致するか）に依存するため、厳密には `version` カラムの方が安全

**注意点:**
- `updated_at` を新しい日時で上書きするため、次の楽観的ロックチェックも正しく機能する
- `.single()` を使っているため、0行更新の場合はエラーが返される
</details>

**Q33.** 商品のCSVインポート機能を実装する場合の設計を、エラーハンドリングを含めて概説してください。

<details><summary>回答</summary>

```typescript
"use server";

export async function importProductsFromCSV(formData: FormData) {
  const file = formData.get("csv") as File;
  const text = await file.text();
  const rows = parseCSV(text); // ヘッダー行を除いた行の配列

  const errors: { row: number; message: string }[] = [];
  const validProducts: ProductInsert[] = [];

  // 1. 全行をバリデーション（1行でもエラーなら全体をキャンセル）
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const product = validateRow(row); // zodスキーマ等で検証
      validProducts.push(product);
    } catch (e) {
      errors.push({ row: i + 2, message: e.message }); // +2: ヘッダー行 + 0始まり
    }
  }

  if (errors.length > 0) {
    return { errors }; // エラー一覧をUIに返す
  }

  // 2. トランザクション的に一括INSERT
  const supabase = await createClient();
  const { error } = await supabase.from("products").insert(validProducts);

  if (error) {
    return { error: "インポートに失敗しました: " + error.message };
  }

  // 3. バリエーションも挿入（商品IDが必要なので、上記で返されたIDを使う）

  revalidatePath("/admin/products");
  return { success: true, count: validProducts.length };
}
```

**設計のポイント:**
- **全件バリデーション → 一括挿入**: 一部だけ成功して中途半端な状態になることを防ぐ
- **エラーの行番号**: どの行にエラーがあるかをUIに表示し、ユーザーがCSVを修正できるようにする
- **重複チェック**: 既存の商品名と重複する場合の挙動（スキップ/上書き/エラー）を明確にする
- **文字コード**: 日本語CSVの場合、Shift_JISとUTF-8の対応が必要
</details>

**Q34.** 商品の「下書き保存」機能を追加したい場合、以下のアプローチの中でどれが最適か、理由とともに答えてください。

1. `is_published` カラムで制御（false = 下書き）
2. 別テーブル `product_drafts` を作成
3. `status` カラムを追加（draft / published / archived）

<details><summary>回答</summary>

**3. `status` カラムが最適です。**

**各アプローチの評価:**

**1. `is_published` で制御:**
- メリット: シンプル。既に存在するカラムを流用できる
- デメリット: 「公開/非公開」の2状態しか表現できない。将来的に「アーカイブ」「審査中」等の状態を追加しにくい

**2. 別テーブル `product_drafts`:**
- メリット: 下書きと公開済みのスキーマを分けられる
- デメリット: テーブル構造が重複する。下書き→公開の変換でデータの移動が必要。メンテナンスが2倍

**3. `status` カラム:**
- メリット: 複数の状態を表現できる（`draft`, `published`, `archived` 等）。1つのテーブルで管理。ステータス遷移ルールが適用しやすい
- デメリット: `is_published` よりクエリがやや複雑（`WHERE status = 'published'`）

**3が最適な理由:**
- Chapter 6のステータス遷移パターンを商品にも応用できる
- 将来の拡張（審査フロー、季節限定の自動公開/非公開など）に対応しやすい
- RLSで `WHERE status = 'published'` をデフォルトポリシーにすれば、下書き商品が顧客に見えない
</details>

**Q35.** 商品一覧の検索機能を実装する場合、Supabaseの全文検索（Full Text Search）とLIKE検索の違いを、パフォーマンスと機能の観点から比較してください。

<details><summary>回答</summary>

**LIKE検索:**
```typescript
const { data } = await supabase
  .from("products")
  .select("*")
  .ilike("name", `%${query}%`);
```
- **機能**: 部分一致検索。`%キーワード%` で名前にキーワードを含む商品を取得
- **パフォーマンス**: インデックスが効かない（先頭一致 `キーワード%` を除く）。テーブルの全行をスキャンするため、データ量に比例して遅くなる
- **日本語対応**: 問題なく動作
- **ランキング**: なし（一致するかしないか）

**全文検索（Full Text Search）:**
```typescript
const { data } = await supabase
  .from("products")
  .select("*")
  .textSearch("name", query, { type: "websearch" });
```
- **機能**: 形態素解析を使った本格的な検索。OR検索、NOT検索に対応。関連度によるランキング
- **パフォーマンス**: GINインデックスを使用して高速。データ量が増えても一定の速度
- **日本語対応**: PostgreSQLのデフォルトでは日本語対応が弱い。pg_bigmやpgroonga等の拡張が必要
- **ランキング**: `ts_rank` で関連度順にソートできる

**判断基準:** 商品数が100件以下のMVPではLIKE検索で十分です。商品数が増え、検索精度やパフォーマンスが問題になったら全文検索を導入します。日本語の全文検索はセットアップが必要なので、コスト対効果を見て判断します。
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q36.** 以下の商品フォームコンポーネントの設計について、改善点を3つ以上挙げてください。

```typescript
"use client";

export function ProductForm({ product }: { product?: Product }) {
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    if (product) {
      await updateProduct(product.id, formData);
    } else {
      await createProduct(formData);
    }

    alert("保存しました");
    window.location.href = "/admin/products";
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" defaultValue={product?.name} />
      <textarea name="description" defaultValue={product?.description} />
      <button type="submit">保存</button>
    </form>
  );
}
```

<details><summary>回答</summary>

1. **ローディング状態の欠如**: 保存ボタンを押した後にフィードバックがない。`useTransition` または `useState` でローディング状態を管理し、処理中はボタンをdisabledにすべき

2. **エラーハンドリングがない**: `updateProduct` / `createProduct` の戻り値（エラー）をチェックしていない。try-catchで囲み、エラー時にユーザーにメッセージを表示すべき

3. **`alert()` の使用**: ネイティブの `alert()` はUXが悪い。トースト通知や画面内のメッセージ表示に変更すべき

4. **`window.location.href` の使用**: Next.jsでは `useRouter().push()` を使うべき。フルリロードが発生し、Reactの状態がリセットされる

5. **バリデーションがない**: 名前が空でも送信できてしまう。クライアント側のバリデーション（`required` 属性やカスタムバリデーション）を追加すべき

6. **バリエーションのUIがない**: 実際の商品フォームにはバリエーション（名前・価格・在庫）の動的入力欄が必要

7. **`product` の判定方法**: `product` の有無で create/update を分岐しているが、`mode` プロパティで明示的に分ける方が意図が明確
</details>

**Q37.** 商品の「一括操作」（複数商品をまとめて公開/非公開/削除する）機能を設計する場合、UIとデータベース操作の両方で考慮すべきポイントを述べてください。

<details><summary>回答</summary>

**UI設計:**
1. **チェックボックス**: 各商品行にチェックボックス。ヘッダーに「全選択/全解除」
2. **アクションバー**: 選択中の件数と操作ボタン（「3件を公開する」「3件を削除する」）をフローティングバーで表示
3. **確認ダイアログ**: 削除は特に注意が必要。「3件の商品を削除します。この操作は取り消せません」
4. **進捗表示**: 大量の操作時は進捗バーを表示
5. **部分失敗の表示**: 10件中3件が失敗した場合、「7件成功、3件失敗」と詳細を表示

**データベース操作:**
1. **一括更新**: `.in("id", selectedIds)` で一度のクエリで更新（1件ずつではなく）
   ```typescript
   await supabase.from("products").update({ is_published: true }).in("id", selectedIds);
   ```
2. **件数上限**: 一度に処理する件数を制限（例: 最大100件）。大量操作によるDB負荷を防ぐ
3. **権限チェック**: RLSに加え、Server Action側でも管理者権限を検証
4. **トランザクション**: 全件成功か全件ロールバックか、部分成功を許容するかの設計判断
5. **削除時の参照整合性**: 注文済み商品を削除しようとした場合のエラーハンドリング
</details>

**Q38.** 大量の商品画像を管理する場合のCDN（Content Delivery Network）活用戦略と、Next.jsの `<Image>` コンポーネントとの組み合わせについて説明してください。

<details><summary>回答</summary>

**CDNの役割:**
CDNは世界各地のエッジサーバーに画像をキャッシュし、ユーザーに最も近いサーバーから配信します。Supabase Storageの東京リージョンからだけ配信する場合、海外ユーザーは遅延を感じますが、CDN経由なら最寄りのエッジから高速に配信されます。

**Next.js `<Image>` コンポーネントとの組み合わせ:**

```typescript
// next.config.ts
const config = {
  images: {
    remotePatterns: [
      { hostname: "your-project.supabase.co" },
    ],
  },
};

// コンポーネント
<Image
  src={product.image_url}
  width={400}
  height={300}
  alt={product.name}
  sizes="(max-width: 768px) 100vw, 25vw"
/>
```

**`<Image>` が自動的に行うこと:**
1. **リサイズ**: デバイスの画面幅に応じた最適なサイズを生成
2. **フォーマット変換**: WebP/AVIFに自動変換（ブラウザ対応に応じて）
3. **遅延読み込み**: viewport外の画像は表示範囲に入ったときに読み込み
4. **CLS防止**: `width`/`height` 指定でレイアウトシフトを防止

**CDN戦略:**
- Vercelデプロイの場合、Next.jsの画像最適化はVercelのEdge Networkで自動的にCDN配信される
- 自前ホスティングの場合、CloudflareやCloudFrontをSupabase Storageの前段に置く
- `Cache-Control` ヘッダーで適切なキャッシュ期間を設定（画像は内容が変わりにくいので長め）
</details>

**Q39.** 以下のコードは `product_variants` の在庫を減らすDB関数です。この設計の問題点と、より堅牢にする方法を説明してください。

```sql
CREATE OR REPLACE FUNCTION decrement_stock(p_variant_id UUID, p_qty INT)
RETURNS VOID AS $$
BEGIN
  UPDATE product_variants
  SET stock = stock - p_qty
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql;
```

<details><summary>回答</summary>

**問題点:**

1. **在庫が負になる可能性**: `stock - p_qty` が負になってもエラーにならない。在庫5のときに10個減らすと-5になる
2. **存在しないバリエーションIDの場合**: 0行更新でもエラーにならず、サイレントに成功してしまう
3. **p_qtyが0や負の場合**: 在庫を増やしてしまう可能性がある

**改善版:**

```sql
CREATE OR REPLACE FUNCTION decrement_stock(p_variant_id UUID, p_qty INT)
RETURNS VOID AS $$
BEGIN
  -- 数量のバリデーション
  IF p_qty <= 0 THEN
    RAISE EXCEPTION 'Quantity must be positive, got %', p_qty;
  END IF;

  -- 在庫チェック付きで更新（stock >= p_qty の行のみ更新）
  UPDATE product_variants
  SET stock = stock - p_qty
  WHERE id = p_variant_id AND stock >= p_qty;

  -- 更新が0行 = 在庫不足 or 存在しないID
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock or variant not found: %', p_variant_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

**追加の防御策:**
- `product_variants` テーブルに `CHECK (stock >= 0)` 制約を追加
- これにより、この関数以外の経路（直接SQL等）でも在庫が負になることを防げる
</details>

**Q40.** 商品管理システムで「変更履歴（Audit Log）」を実装するための3つのアプローチと、それぞれの適用場面を説明してください。

<details><summary>回答</summary>

**アプローチ1: アプリケーション層でログ記録**
```typescript
await supabase.from("audit_logs").insert({
  table_name: "products",
  record_id: productId,
  action: "update",
  changes: { name: { from: oldName, to: newName } },
  user_id: userId,
});
```
- メリット: 実装がシンプル。ビジネスロジックに沿った記録が可能
- デメリット: ログ記録を忘れる箇所が発生しうる。直接SQLでの変更は記録されない
- 適用場面: 特定の重要操作のみ記録したい場合（商品の価格変更、在庫調整等）

**アプローチ2: PostgreSQLトリガー**
```sql
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, changed_at)
  VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_audit
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```
- メリット: 全変更が自動的に記録される。直接SQLでの変更も対象。漏れがない
- デメリット: 全テーブルに適用するとログ量が膨大に。パフォーマンスへの影響。トリガーのメンテナンスが必要
- 適用場面: コンプライアンス要件で全変更の追跡が必要な場合（金融、医療等）

**アプローチ3: Supabase Realtime + 外部ログサービス**
- Supabase RealtimeのWebhookで変更イベントを外部サービス（Datadog, Sentry等）に送信
- メリット: ログの保管・検索・アラートが外部サービスに委任される。DB容量を消費しない
- デメリット: 外部サービスのコスト。リアルタイム性はあるが、Webhookが失敗した場合のリカバリが必要
- 適用場面: 大規模システムで、ログの分析・可視化が重要な場合

**MVP段階では** アプローチ1の「重要操作のみ記録」が適切です。全変更の記録が必要になったらアプローチ2を検討します。
</details>
