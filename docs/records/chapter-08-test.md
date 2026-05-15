# Chapter 8: お客さんとつながろう — 理解度テスト

---

## IT知識・概念理解

### 初級（絶対に抑えてほしい基礎知識）

**Q1.** 「バリデーション」とは何ですか？なぜフォームにバリデーションが必要なのか説明してください。

<details><summary>回答</summary>

バリデーションとは、ユーザーが入力したデータが正しい形式・内容かを検証する仕組みです。

フォームにバリデーションが必要な理由:
1. **ユーザーへのフィードバック**: 名前が空欄のまま送信しようとしたとき、「名前は必須です」と教える
2. **データの品質維持**: 不正なデータがDBに保存されるのを防ぐ
3. **エラーの予防**: DBのNOT NULL制約に引っかかる前に、分かりやすいメッセージで案内する
4. **セキュリティ**: SQLインジェクションやXSSなどの攻撃を防ぐ入口になる

バリデーションがなければ、DBのエラーメッセージがそのまま表示されてしまい、技術的で分かりにくい表示になります。
</details>

**Q2.** 「デフォルト配送先」とは何ですか？なぜ設定する機能があるのですか？

<details><summary>回答</summary>

デフォルト配送先とは、複数の配送先（自宅・職場など）の中から「いつも使う配送先」として設定されたものです。

設定する理由:
- 決済時に毎回配送先を選ぶ手間を省くため
- 最もよく使う配送先が自動的に選ばれていれば、ワンクリックで注文できる
- UX（ユーザー体験）の向上: 操作ステップが減ると購入完了率が上がる

本アプリでは、最初に登録した配送先が自動的にデフォルトに設定されます（1つしかない場合に毎回選ぶ手間を省くため）。
</details>

**Q3.** レビュー機能で「星評価（1-5）」を使う目的を、買い手と売り手の両方の視点で説明してください。

<details><summary>回答</summary>

**買い手（お客さん）の視点:**
- 他のお客さんの評価を見て、購入の判断材料にできる
- 星の数で直感的に商品の評判がわかる（レビューの文章を全部読まなくてもよい）
- 平均評価が高い商品を選ぶことで、失敗のリスクを減らせる

**売り手（田中さん）の視点:**
- お客さんの満足度を定量的に把握できる
- 評価が低い商品は改善のヒントになる
- 高評価のレビューは新しいお客さんへの信頼材料になる（社会的証明）
- コメント付きのレビューから、商品の良い点・悪い点を具体的に知れる
</details>

**Q4.** RLSで「購入済み商品のみレビュー投稿可能」にする目的は何ですか？

<details><summary>回答</summary>

買っていない人が偽のレビューを投稿するのを防ぐためです。

具体的に防げる問題:
1. **やらせレビュー**: 購入せずに高評価レビューを大量投稿する
2. **嫌がらせレビュー**: 購入せずに低評価レビューで商品を攻撃する
3. **レビューの信頼性**: 実際に使った人の感想だけが掲載されるので、他のお客さんが信頼できる

RLSで制御する利点は、アプリコードにバグがあっても、DB層で必ずチェックされることです。フロントのボタンを非表示にするだけでは、開発者ツールやAPI直叩きで迂回できます。
</details>

**Q5.** UNIQUE制約とは何ですか？レビューテーブルでどのように使われていますか？

<details><summary>回答</summary>

UNIQUE制約とは、テーブル内で特定のカラム（または組み合わせ）の値が重複しないことを保証するデータベースの制約です。

レビューテーブルでは `(user_id, product_id)` の組み合わせにUNIQUE制約が設定されています。これにより:
- 同じユーザーが同じ商品に2つ以上のレビューを投稿できない
- 1ユーザー1商品1レビューのルールがDB層で強制される
- 既にレビューを投稿した商品に再度投稿しようとすると、DBがエラーを返す

これはAmazonなどの一般的なECサイトと同じ仕組みです。レビューを変更したい場合は「編集」で対応します。
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q6.** フォームバリデーションを「クライアント側」で行う場合と「サーバー側」で行う場合の違いを、ユーザー体験とセキュリティの観点から説明してください。

<details><summary>回答</summary>

**クライアント側バリデーション:**
- **ユーザー体験**: 即座にフィードバックが返る（サーバーへの通信なし）。入力中にリアルタイムでエラーを表示できる
- **セキュリティ**: ブラウザのJavaScriptを無効化するだけで迂回可能。セキュリティにはならない
- **例**: `<input required />`, HTMLの `pattern` 属性, JavaScriptでの検証

**サーバー側バリデーション:**
- **ユーザー体験**: フォーム送信後にサーバーからエラーが返るため、若干の遅延がある
- **セキュリティ**: クライアントを迂回しても必ず実行される。信頼できるバリデーション
- **例**: Server Actionでzodスキーマを使った検証

**結論**: 両方行うのがベストプラクティス。クライアント側は「UXのため」、サーバー側は「セキュリティのため」。サーバー側のバリデーションを省略してはいけません。
</details>

**Q7.** 配送先データを注文テーブルにスナップショット（コピー）する理由を、Chapter 6のスナップショットと関連づけて説明してください。

<details><summary>回答</summary>

Chapter 6で商品のスナップショット（注文時の商品名・価格をorder_itemsにコピー）を学びましたが、配送先も同じ考え方です。

**なぜコピーするか:**
- ユーザーが引っ越して配送先を変更しても、過去の注文の配送先は「当時の住所」のまま残る必要がある
- ユーザーが配送先を削除しても、過去の注文の記録は消えてはいけない
- 配送トラブルが発生した際に「あの注文はどこに送ったか」を正確に確認できる

**共通の原則:** 「注文に関連するデータは注文時点の状態を保存する」。商品名・価格・配送先は時間とともに変わりうるものなので、注文レコードに直接コピーして「スナップショット」として保持します。

Chapter 6: 商品のスナップショット → order_items に product_name, unit_price
Chapter 8: 配送先のスナップショット → orders に shipping_name, shipping_address, shipping_phone
</details>

**Q8.** レビューのINSERTポリシーで使われている「サブクエリによる購入チェック」の仕組みを説明してください。

<details><summary>回答</summary>

```sql
EXISTS (
  SELECT 1 FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  JOIN product_variants pv ON pv.id = oi.variant_id
  WHERE o.user_id = auth.uid()
  AND pv.product_id = reviews.product_id
  AND o.status IN ('shipped', 'completed')
)
```

このサブクエリは以下のロジックを表しています:

1. `order_items` → `orders` → ログインユーザーの注文を特定
2. `order_items` → `product_variants` → 注文明細から商品を特定
3. `pv.product_id = reviews.product_id` → レビュー対象の商品が注文に含まれるか確認
4. `o.status IN ('shipped', 'completed')` → 発送済みまたは完了の注文のみ対象（受注直後のレビューは許可しない）

つまり「この商品のバリエーションを含む、発送済みまたは完了の注文がある」場合のみレビュー投稿が許可されます。注文が「受注」「発送準備中」の段階ではまだ商品を受け取っていないため、レビューは書けません。
</details>

**Q9.** プロフィール編集で、OAuthログイン（LINE等）で自動設定された名前をユーザーが変更できるようにしている理由は何ですか？

<details><summary>回答</summary>

OAuthログインで取得される名前は、LINEやGoogleのアカウント名がそのまま使われます。しかし:

1. **表示名の自由度**: LINEの名前が「たなか」だけど、ECサイトでは「田中太郎」と表示したい場合がある
2. **プライバシー**: SNSのニックネーム（あだ名等）がレビューの投稿者名として公開されるのを避けたい
3. **ビジネス利用**: 個人名ではなく屋号や店名で表示したい場合がある
4. **名前の変更**: 結婚等で名前が変わった場合に対応

OAuthは「認証（誰であるか）」の手段であり、「表示名」はユーザーが自由に設定できるべきです。profilesテーブルの `display_name` を分けて管理することで、認証情報と表示情報を分離しています。
</details>

**Q10.** 「平均評価をDB側で計算する」方式と「アプリケーション側で計算する」方式の違いを説明してください。

<details><summary>回答</summary>

**DB側で計算:**
```sql
SELECT AVG(rating) as average_rating
FROM reviews
WHERE product_id = 'xxx';
```
- メリット: 常に正確な値が得られる。アプリ側のロジック不要
- デメリット: レビュー数が多い場合、毎回集計クエリが走るためパフォーマンスに影響する可能性

**アプリケーション側で計算:**
```typescript
const reviews = await getReviews(productId);
const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
```
- メリット: DB負荷が軽い（レビューデータをそのまま取得するだけ）
- デメリット: 全レビューをメモリに載せる必要がある。ページネーションと相性が悪い

**ハイブリッド方式（大規模サイト）:**
- productsテーブルに `average_rating` カラムを持ち、レビュー投稿・更新時に再計算して保存
- 表示時はこの事前計算済みの値を使うので高速
- トリガーまたはServer Actionで更新のたびに再計算

本アプリはMVPなのでDB側でSELECT時に計算する方式で十分です。
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q11.** レビューの「編集」機能を追加する場合、どのようなRLSポリシーが必要ですか？また、編集履歴を残すべきかどうかについて意見を述べてください。

<details><summary>回答</summary>

**必要なRLSポリシー:**
```sql
-- 自分のレビューのみ編集可能
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**USINGとWITH CHECKの違い:**
- `USING`: 更新対象の行を絞る（自分のレビューだけ対象）
- `WITH CHECK`: 更新後のデータを検証（user_idを他人に変更できないようにする）

**編集履歴を残すべきか:**

残すべきです。理由:
1. **不正防止**: 高評価レビューを書いた後に低評価に変更し、また戻すといった操作を追跡できる
2. **信頼性**: 「このレビューは編集されました」の表示がないと、最初から今の内容だったと誤解される
3. **紛争解決**: 商品購入者と運営者の間でトラブルが起きた際、元のレビュー内容を確認できる

実装:
- `review_edits` テーブルを作り、編集前の内容・編集日時を記録
- または `reviews` テーブルに `edited_at` カラムを追加し、「(編集済み)」の表示に使う
</details>

**Q12.** 配送先のバリデーションで、郵便番号の形式チェック（xxx-xxxx）をクライアント側とサーバー側の両方で行う実装を示してください。

<details><summary>回答</summary>

**クライアント側（HTMLの `pattern` 属性）:**
```html
<input
  name="postal_code"
  pattern="\d{3}-\d{4}"
  title="郵便番号は「000-0000」の形式で入力してください"
  placeholder="000-0000"
  required
/>
```

**サーバー側（zodスキーマ）:**
```typescript
import { z } from "zod";

const addressSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  postal_code: z
    .string()
    .regex(/^\d{3}-\d{4}$/, "郵便番号は「000-0000」の形式で入力してください"),
  address: z.string().min(1, "住所は必須です"),
  phone: z
    .string()
    .regex(/^0\d{9,10}$/, "電話番号は「0」から始まる10-11桁の数字で入力してください"),
});

export async function createAddress(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const result = addressSchema.safeParse(raw);

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  // DB保存処理
}
```

**ポイント:**
- クライアント側は即座のフィードバック用（UX）
- サーバー側はセキュリティ用（クライアントを迂回しても検証される）
- 正規表現は同じものを両方で使い、一貫性を保つ
</details>

**Q13.** レビューのスパム対策として、どのような仕組みを導入できますか？3つ以上の方法を挙げてください。

<details><summary>回答</summary>

1. **レート制限（Rate Limiting）:**
   - 1ユーザーが短時間に大量のレビューを投稿できないようにする
   - 例: 1時間に5件まで。Supabase Edge Functionでリクエスト頻度をチェック

2. **購入済みチェック（既に実装済み）:**
   - RLSで購入済み商品のみレビュー可能に制限
   - 購入なしのスパムレビューを構造的に排除

3. **投稿後の待機期間:**
   - 商品受取から一定期間（例: 24時間）経過後にレビュー可能にする
   - 感情的なレビューや、使用前のレビューを減らす

4. **テキスト分析:**
   - URLを含むレビューを自動フラグ
   - 過度に短い（「良い」だけ）や意味不明なレビューをフラグ
   - AI活用で不自然なレビューを検出

5. **管理者による承認制:**
   - レビュー投稿後、管理者が承認するまで非公開
   - 手間がかかるが、品質を担保できる

6. **通報機能:**
   - 他のユーザーが不適切なレビューを通報できるボタン
   - 通報が一定数に達したら自動非表示 + 管理者レビュー

MVPでは「購入済みチェック + UNIQUE制約」が最低限のスパム対策として機能しています。
</details>

**Q14.** `is_default` カラムでデフォルト配送先を管理する場合、「1ユーザーにつきデフォルトは1つだけ」を保証するにはどうすればよいですか？

<details><summary>回答</summary>

**方法1: アプリケーション層で制御（現在の方式）**
```typescript
// 新しいデフォルトを設定する前に、既存のデフォルトを解除
await supabase
  .from("shipping_addresses")
  .update({ is_default: false })
  .eq("user_id", userId)
  .eq("is_default", true);

// 新しいデフォルトを設定
await supabase
  .from("shipping_addresses")
  .update({ is_default: true })
  .eq("id", addressId);
```
- リスク: 2つの操作の間にクラッシュすると、デフォルトが0個になる可能性

**方法2: DB関数でアトミックに処理**
```sql
CREATE OR REPLACE FUNCTION set_default_address(p_user_id UUID, p_address_id UUID)
RETURNS VOID AS $$
BEGIN
  -- 既存のデフォルトを解除
  UPDATE shipping_addresses SET is_default = false
  WHERE user_id = p_user_id AND is_default = true;
  -- 新しいデフォルトを設定
  UPDATE shipping_addresses SET is_default = true
  WHERE id = p_address_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```
- メリット: 1トランザクション内で実行されるため、中間状態が発生しない

**方法3: 部分ユニークインデックス**
```sql
CREATE UNIQUE INDEX one_default_per_user
  ON shipping_addresses (user_id) WHERE is_default = true;
```
- `is_default = true` の行に対してのみ `user_id` のUNIQUE制約を適用
- 2つ目のデフォルトを設定しようとするとDB側でエラーになる

方法2+3の組み合わせが最も堅牢です。
</details>

**Q15.** レビューに「いいね」機能を追加する場合の設計（テーブル構造、RLS、UIの更新方法）を概説してください。

<details><summary>回答</summary>

**テーブル構造:**
```sql
CREATE TABLE review_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id) -- 1ユーザー1レビュー1いいね
);
```

**RLSポリシー:**
```sql
-- 誰でも閲覧可
CREATE POLICY "Anyone can view likes" ON review_likes
  FOR SELECT USING (true);

-- 自分のいいねのみ追加・削除可
CREATE POLICY "Users can toggle own likes" ON review_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own likes" ON review_likes
  FOR DELETE USING (auth.uid() = user_id);
```

**UIの更新方法:**
```typescript
// 楽観的UI更新が効果的
function LikeButton({ reviewId, initialCount, initialLiked }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  async function handleToggle() {
    // 楽観的に即座にUIを更新
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    // バックグラウンドでサーバーに反映
    const result = liked
      ? await unlikeReview(reviewId)
      : await likeReview(reviewId);

    if (result.error) {
      // 失敗時はロールバック
      setLiked(liked);
      setCount(count);
    }
  }
}
```

**ポイント:** いいねは頻繁に押される操作なので、楽観的UI更新が特に効果的です。サーバーの応答を待たずにUIが変わることで、レスポンシブな操作感を実現します。
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q16.** フォームの状態管理で「制御コンポーネント（Controlled）」と「非制御コンポーネント（Uncontrolled）」の違いと、それぞれの適用場面を説明してください。

<details><summary>回答</summary>

**制御コンポーネント:**
```typescript
const [name, setName] = useState("");
<input value={name} onChange={(e) => setName(e.target.value)} />
```
- Reactのstateが入力値を管理。valueとonChangeで同期
- メリット: 入力値をリアルタイムで検証・変換できる。他のUIと連動しやすい（例: 文字数カウント）
- デメリット: 入力フィールドが多いとstateが増える。再レンダリングが頻繁に発生

**非制御コンポーネント:**
```typescript
<input name="name" defaultValue={initialName} />
// 送信時: new FormData(formElement)
```
- DOMが入力値を管理。Reactはタッチしない
- メリット: シンプル。パフォーマンスが良い（re-renderが最小限）。Server Actionsとの相性が良い
- デメリット: リアルタイムバリデーションが難しい。入力値をReact側で参照しにくい

**適用場面:**
- **プロフィール編集**: 非制御で十分（送信時にまとめてバリデーション）
- **検索フォーム**: 制御が適切（入力に応じてリアルタイムで検索結果を更新）
- **動的フォーム（バリエーション追加）**: 制御が必須（配列stateで管理し、追加・削除を制御）
- **Server Actions + FormData**: 非制御が自然（`formData.get("name")` で取得）

Next.jsのServer Actionsとの連携では非制御コンポーネントが推奨されますが、リアルタイムバリデーションが必要な場面では制御コンポーネントを使います。
</details>

**Q17.** RLSで複雑なビジネスルール（「購入済み + 発送済み以降のみレビュー可」）を実装することのメリットとデメリットを、アプリケーション層で実装する場合と比較して論じてください。

<details><summary>回答</summary>

**RLSで実装する場合:**

メリット:
1. **確実性**: どのクライアント（Web, モバイル, API）からアクセスしてもルールが適用される
2. **一元管理**: ルールがDBに集約されるため、「どこでチェックしているか」が明確
3. **アプリコードのシンプル化**: Server Actionではinsertを呼ぶだけ。チェックロジックが不要
4. **セキュリティ**: アプリコードにバグがあっても、不正なデータの挿入を防げる

デメリット:
1. **複雑なサブクエリ**: 購入チェックのJOINが複雑で、パフォーマンスへの影響が読みにくい
2. **エラーメッセージ**: RLSに違反した場合、「permission denied」という汎用エラーしか返らない。「この商品はまだ購入されていません」のような具体的なメッセージが出せない
3. **テストの難しさ**: RLSポリシーのテストにはDBのセットアップが必要
4. **デバッグの難しさ**: 「なぜinsertが失敗したか」を追跡するのが困難

**アプリケーション層で実装する場合:**
```typescript
// Server Action
const hasPurchased = await checkPurchase(userId, productId);
if (!hasPurchased) {
  return { error: "この商品を購入していないためレビューを投稿できません" };
}
```
- メリット: 具体的なエラーメッセージが返せる。テストが容易。ロジックの変更がデプロイだけで完了
- デメリット: チェックを忘れると不正データが入る。複数のクライアントで同じロジックを書く必要がある

**ベストプラクティス:** 両方で実装する。アプリケーション層で分かりやすいエラーメッセージを返しつつ、RLSを最終防衛ラインとして設定。
</details>

**Q18.** 配送先の「住所自動入力（郵便番号から住所を補完）」機能を実装する場合の設計と、外部APIへの依存リスクについて説明してください。

<details><summary>回答</summary>

**設計:**
```typescript
"use client";

function AddressForm() {
  const [postalCode, setPostalCode] = useState("");

  async function handlePostalCodeChange(value: string) {
    setPostalCode(value);

    // ハイフンなし7桁になったら自動検索
    const digits = value.replace("-", "");
    if (digits.length === 7) {
      try {
        const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`);
        const data = await res.json();
        if (data.results) {
          const addr = data.results[0];
          setPrefecture(addr.address1); // 都道府県
          setCity(addr.address2);       // 市区町村
          setStreet(addr.address3);     // 町域
          // 番地以降は手動入力
        }
      } catch {
        // APIエラーでも手動入力は可能
      }
    }
  }
}
```

**外部APIへの依存リスク:**

1. **サービス停止**: APIが落ちると住所補完が使えなくなる
   - 対策: 手動入力のフォールバックを必ず用意する。補完はあくまで補助機能

2. **レート制限**: 無料APIは1日のリクエスト上限がある
   - 対策: デバウンス（入力完了を待ってからリクエスト）。結果のキャッシュ

3. **データの鮮度**: 市町村合併等で住所が変わる場合がある
   - 対策: ユーザーが手動で修正できるようにする

4. **プライバシー**: 郵便番号を外部サーバーに送信する
   - 対策: プライバシーポリシーに記載。または郵便番号データをローカルにバンドル（ken_all.csv等）

**ローカルデータバンドルの方法:**
- 日本郵便のCSVデータ（約12万行）をJSONに変換してバンドル
- 外部API不要でオフラインでも動作
- デメリット: バンドルサイズが増加（約5MB）。更新が手動
</details>

**Q19.** レビューの「平均評価」を商品一覧で高速に表示するための、以下3つのアプローチを比較し、それぞれの適用場面を述べてください。

1. 商品取得時にSELECTサブクエリで毎回計算
2. productsテーブルに `average_rating` カラムを持つ
3. マテリアライズドビューを使う

<details><summary>回答</summary>

**1. SELECTサブクエリで毎回計算:**
```sql
SELECT p.*, (SELECT AVG(rating) FROM reviews r WHERE r.product_id = p.id) as avg_rating
FROM products p;
```
- メリット: 常に最新の値。追加のメンテナンス不要
- デメリット: 商品数 x レビュー数のスキャンが毎回発生。N+1問題に近い性能影響
- 適用場面: 商品数が少ない（100件以下）MVPステージ

**2. `average_rating` カラム（非正規化）:**
```sql
-- レビュー投稿・更新・削除時にトリガーで再計算
UPDATE products SET average_rating = (
  SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id
) WHERE id = NEW.product_id;
```
- メリット: 表示時は1カラムを読むだけなので超高速。ソートも簡単（ORDER BY average_rating DESC）
- デメリット: データの二重管理。トリガーの管理が必要。レビューの更新時に計算が走る
- 適用場面: 商品数が数百件以上で、一覧表示のパフォーマンスが重要

**3. マテリアライズドビュー:**
```sql
CREATE MATERIALIZED VIEW product_ratings AS
SELECT product_id, AVG(rating) as avg_rating, COUNT(*) as review_count
FROM reviews GROUP BY product_id;

-- 定期的にリフレッシュ
REFRESH MATERIALIZED VIEW product_ratings;
```
- メリット: テーブル設計を変更しない。複雑な集計も事前計算可能
- デメリット: リフレッシュするまで古いデータ。リフレッシュのタイミング管理が必要
- 適用場面: ダッシュボードや分析画面で、リアルタイム性が不要な集計値を表示する場合

**MVPには1番が適切。** パフォーマンスが問題になったら2番に移行します。
</details>

**Q20.** ECサイトのレビューシステムにおいて「偽レビュー（ステルスマーケティング）」を技術的・制度的にどう防ぐか、多角的に論じてください。

<details><summary>回答</summary>

**技術的対策:**

1. **購入認証（実装済み）**: RLSで購入済みユーザーのみレビュー投稿可能
2. **1商品1レビュー制限（実装済み）**: UNIQUE制約で同一商品への重複レビューを防止
3. **アカウント年齢チェック**: 作成直後のアカウントからのレビューを制限
4. **IPアドレス・デバイスフィンガープリント**: 同一IPから大量のレビューが投稿された場合にフラグ
5. **自然言語処理**: AIで不自然なレビュー（同じパターンの繰り返し等）を検出
6. **「購入済み」バッジ**: レビューに「この商品を購入したユーザー」バッジを表示し、信頼性を可視化

**制度的対策:**

1. **利用規約**: やらせレビューの禁止を明記。違反時のアカウント停止を規定
2. **ステマ規制**: 2023年10月施行の景品表示法改正で、ステルスマーケティングが違法に。「広告」「PR」の表示義務
3. **通報制度**: ユーザーが不審なレビューを通報できる仕組み
4. **管理者レビュー**: 高評価・低評価が集中した商品のレビューを人手で確認

**運営上のバランス:**
- 過度な制限はレビュー投稿のハードルを上げ、レビュー数が減る
- MVPでは「購入済みチェック + UNIQUE制約」で最低限のラインを守り、問題が発生したら段階的に対策を追加するのが現実的
</details>

---

## コーディング・操作理解

### 初級（絶対に抑えてほしい基礎知識）

**Q21.** 以下のServer Actionは何をしていますか？

```typescript
"use server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const displayName = formData.get("display_name") as string;

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", user.id);

  if (error) throw new Error("プロフィールの更新に失敗しました");

  revalidatePath("/mypage/profile");
}
```

<details><summary>回答</summary>

ログインユーザーのプロフィール（表示名）を更新するServer Actionです。

1. `"use server"` でサーバー専用関数を宣言
2. `supabase.auth.getUser()` で現在のログインユーザーを取得
3. ユーザーがいなければエラー（未ログインの場合）
4. フォームデータから `display_name` を取得
5. `profiles` テーブルの該当ユーザーの行を更新
6. エラーがあればエラーをスロー
7. `revalidatePath` でプロフィールページのキャッシュを無効化し、最新データを表示

ポイント: `.eq("id", user.id)` で自分の行のみ更新していますが、RLSも「自分のプロフィールのみ更新可能」というポリシーで二重に守っています。
</details>

**Q22.** 以下のフォームで `required` 属性がどのように機能するか説明してください。

```html
<form action={updateProfile}>
  <input name="display_name" required minLength={1} maxLength={50} />
  <button type="submit">保存</button>
</form>
```

<details><summary>回答</summary>

`required` 属性は、HTMLのフォームバリデーション機能です。

- フォーム送信時に入力欄が空だった場合、ブラウザが自動的に「このフィールドは必須です」というメッセージを表示し、送信をブロックする
- `minLength={1}` は1文字以上の入力を要求する
- `maxLength={50}` は50文字を超える入力を制限する

これはクライアント側のバリデーションであり、JavaScriptなしでもブラウザが自動で処理します。ただし、開発者ツールでHTML属性を削除すれば迂回できるため、サーバー側のバリデーションも必須です。
</details>

**Q23.** 配送先のデフォルト設定を切り替えるボタンのクリックハンドラを書いてください。

```typescript
// 前提: setDefaultAddress(addressId) というServer Actionがある
// 期待: ボタンを押すとデフォルトが切り替わる
```

<details><summary>回答</summary>

```typescript
"use client";
import { useTransition } from "react";
import { setDefaultAddress } from "@/lib/address-actions";

function SetDefaultButton({ addressId, isDefault }: { addressId: string; isDefault: boolean }) {
  const [isPending, startTransition] = useTransition();

  if (isDefault) {
    return <span className="text-green-600 text-sm">デフォルト</span>;
  }

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          await setDefaultAddress(addressId);
        });
      }}
      disabled={isPending}
      className="text-sm text-blue-600 hover:underline"
    >
      {isPending ? "設定中..." : "デフォルトに設定"}
    </button>
  );
}
```

ポイント:
- 既にデフォルトの場合はボタンではなく「デフォルト」のラベルを表示
- `useTransition` で非同期処理中の状態を管理
- 処理中はボタンを無効化して二重クリックを防止
</details>

**Q24.** 以下のレビュー投稿フォームで、星評価（1-5）を選択するUIのstateを管理するコードを書いてください。

```typescript
// 期待: 星をクリックすると評価が設定される。ホバーで仮の表示が変わる。
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  // ??? を実装
}
```

<details><summary>回答</summary>

```typescript
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          className="text-2xl"
        >
          {star <= (hoverValue || value) ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}
```

ポイント:
- `hoverValue` はマウスホバー中の仮の表示用。マウスを離すと0に戻る
- `hoverValue || value`: ホバー中はhoverValueを優先、ホバーしていないときはvalueを表示
- `type="button"` でフォームの送信を防止（デフォルトは`submit`）
</details>

**Q25.** 以下のRLSポリシーが設定されている場合、一般ユーザーが他人のレビューを削除できないことを確認するSQLを書いてください。

```sql
CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);
```

<details><summary>回答</summary>

```sql
-- テスト: ユーザーAとして、ユーザーBのレビューを削除しようとする

-- 1. ユーザーBのレビューを確認
SELECT id, user_id, product_id, rating
FROM reviews
WHERE user_id = 'ユーザーBのID';

-- 2. ユーザーAとしてログインした状態で、ユーザーBのレビューを削除しようとする
DELETE FROM reviews WHERE id = 'ユーザーBのレビューID';

-- 3. 結果: RLSの USING (auth.uid() = user_id) により、
--    auth.uid() = ユーザーA ≠ ユーザーB = user_id なので、
--    削除対象の行が0件になり、何も削除されない。
--    エラーにはならず、単に0行削除される。

-- 確認: レビューがまだ存在することを確認
SELECT COUNT(*) FROM reviews WHERE id = 'ユーザーBのレビューID';
-- → 1（まだ存在する）
```

RLSのポイント: DELETEポリシーの `USING` は「削除対象の行のフィルター」として機能します。自分のuser_idと一致しない行は、DELETE文の対象から自動的に除外されます。
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q26.** レビューの平均評価と件数を商品詳細ページで表示するためのクエリを、Supabaseのクライアントライブラリを使って書いてください。

<details><summary>回答</summary>

```typescript
// 方法1: 商品と一緒にレビューを取得し、アプリ側で計算
const { data: product } = await supabase
  .from("products")
  .select(`
    *,
    product_variants (*),
    reviews (id, rating, comment, created_at, profiles(display_name))
  `)
  .eq("id", productId)
  .single();

// アプリ側で平均計算
const reviews = product.reviews ?? [];
const averageRating = reviews.length > 0
  ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  : 0;
const reviewCount = reviews.length;

// 方法2: PostgreSQL関数を使ってDB側で計算
const { data } = await supabase.rpc("get_product_with_rating", {
  p_product_id: productId,
});
```

方法1のメリット: レビューの一覧も同時に取得できるので、平均評価 + レビュー一覧の両方を1クエリで表示できます。MVPではこれで十分です。
</details>

**Q27.** 配送先の追加Server Actionに、「最初の配送先は自動でデフォルトに設定」するロジックを実装してください。

<details><summary>回答</summary>

```typescript
"use server";

export async function createAddress(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  // 既存の配送先を確認
  const { data: existing } = await supabase
    .from("shipping_addresses")
    .select("id")
    .eq("user_id", user.id);

  // 最初の配送先なら自動でデフォルトに
  const isFirstAddress = !existing || existing.length === 0;

  const { error } = await supabase
    .from("shipping_addresses")
    .insert({
      user_id: user.id,
      name: formData.get("name") as string,
      postal_code: formData.get("postal_code") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      is_default: isFirstAddress, // 最初の1件は自動デフォルト
    });

  if (error) return { error: "配送先の追加に失敗しました" };

  revalidatePath("/mypage/addresses");
  return { success: true };
}
```

ポイント: `existing.length === 0` で既存の配送先が0件の場合にデフォルトに設定します。ユーザーが1つしか配送先を持たない場合に、毎回選択する手間を省きます。
</details>

**Q28.** レビューフォームで、ログインしていない場合と購入していない場合で異なるメッセージを表示するコンポーネントを書いてください。

<details><summary>回答</summary>

```typescript
// Server Component
async function ReviewSection({ productId }: { productId: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // レビュー一覧は常に表示
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(display_name)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  // ログインチェック
  if (!user) {
    return (
      <div>
        <ReviewList reviews={reviews ?? []} />
        <p className="text-gray-500 mt-4">
          レビューを投稿するには<a href="/login" className="text-blue-600">ログイン</a>してください
        </p>
      </div>
    );
  }

  // 購入チェック
  const { data: purchases } = await supabase
    .from("order_items")
    .select("id, orders!inner(user_id, status)")
    .eq("orders.user_id", user.id)
    .eq("variant.product_id", productId)
    .in("orders.status", ["shipped", "completed"]);

  const hasPurchased = purchases && purchases.length > 0;

  // 既にレビュー済みかチェック
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .single();

  return (
    <div>
      <ReviewList reviews={reviews ?? []} />
      {existingReview ? (
        <p className="text-gray-500 mt-4">この商品のレビューは投稿済みです</p>
      ) : hasPurchased ? (
        <ReviewForm productId={productId} />
      ) : (
        <p className="text-gray-500 mt-4">この商品を購入するとレビューを投稿できます</p>
      )}
    </div>
  );
}
```
</details>

**Q29.** 以下の配送先削除Server Actionには問題があります。問題点を指摘し、修正してください。

```typescript
"use server";

export async function deleteAddress(addressId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("shipping_addresses")
    .delete()
    .eq("id", addressId);

  if (error) throw new Error("削除に失敗しました");

  revalidatePath("/mypage/addresses");
}
```

<details><summary>回答</summary>

**問題点:**

1. **デフォルト配送先の削除**: デフォルトに設定されている配送先を削除した場合、デフォルトが0件になる
2. **他ユーザーの配送先の削除**: `addressId` だけで削除しているため、他人のIDを指定すると他人の配送先を削除できてしまう可能性（RLSがなければ）

**修正版:**

```typescript
"use server";

export async function deleteAddress(addressId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  // 削除対象の配送先を確認
  const { data: address } = await supabase
    .from("shipping_addresses")
    .select("id, is_default, user_id")
    .eq("id", addressId)
    .eq("user_id", user.id)  // 自分の配送先のみ
    .single();

  if (!address) return { error: "配送先が見つかりません" };

  // 削除実行
  const { error } = await supabase
    .from("shipping_addresses")
    .delete()
    .eq("id", addressId);

  if (error) return { error: "削除に失敗しました" };

  // デフォルトだった場合、残りの配送先から新しいデフォルトを設定
  if (address.is_default) {
    const { data: remaining } = await supabase
      .from("shipping_addresses")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1);

    if (remaining && remaining.length > 0) {
      await supabase
        .from("shipping_addresses")
        .update({ is_default: true })
        .eq("id", remaining[0].id);
    }
  }

  revalidatePath("/mypage/addresses");
  return { success: true };
}
```
</details>

**Q30.** zodを使ったバリデーションスキーマを書いてください。レビューのrating（1-5の整数）とcomment（10文字以上500文字以下）を検証するスキーマです。

<details><summary>回答</summary>

```typescript
import { z } from "zod";

const reviewSchema = z.object({
  rating: z
    .number()
    .int("評価は整数で入力してください")
    .min(1, "評価は1以上を選択してください")
    .max(5, "評価は5以下を選択してください"),
  comment: z
    .string()
    .min(10, "コメントは10文字以上で入力してください")
    .max(500, "コメントは500文字以内で入力してください"),
  product_id: z.string().uuid("不正な商品IDです"),
});

// Server Actionでの使用例
export async function submitReview(formData: FormData) {
  const raw = {
    rating: Number(formData.get("rating")),
    comment: formData.get("comment") as string,
    product_id: formData.get("product_id") as string,
  };

  const result = reviewSchema.safeParse(raw);

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      // 例: { rating: ["評価は1以上を選択してください"], comment: ["コメントは10文字以上..."] }
    };
  }

  // バリデーション通過後、DBに保存
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").insert({
    ...result.data,
    user_id: (await supabase.auth.getUser()).data.user!.id,
  });

  if (error) return { error: "レビューの投稿に失敗しました" };

  revalidatePath(`/products/${result.data.product_id}`);
  return { success: true };
}
```

ポイント: `safeParse` はエラー時に例外を投げず、結果オブジェクトを返します。`flatten()` でフィールドごとのエラーメッセージを取得し、フォームのUIに表示できます。
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q31.** フォームの「楽観的UI更新」をレビュー投稿に適用する場合のメリットと注意点を述べ、実装例を示してください。

<details><summary>回答</summary>

**メリット:**
- 投稿ボタンを押した瞬間にレビューが画面に表示されるため、レスポンスが速く感じる
- ネットワークが遅い環境でもストレスのない操作感

**注意点:**
- サーバーでバリデーションエラー（RLS違反等）が発生した場合、追加したレビューを元に戻す必要がある
- 平均評価の再計算も楽観的に行う必要があるが、他のユーザーのレビューがある場合は正確な値が分からない

**実装例:**
```typescript
"use client";
import { useOptimistic } from "react";

function ReviewList({ reviews, productId }: Props) {
  const [optimisticReviews, addOptimisticReview] = useOptimistic(
    reviews,
    (state, newReview: Review) => [newReview, ...state]
  );

  async function handleSubmit(formData: FormData) {
    const newReview = {
      id: crypto.randomUUID(), // 仮のID
      rating: Number(formData.get("rating")),
      comment: formData.get("comment") as string,
      created_at: new Date().toISOString(),
      profiles: { display_name: "自分" }, // 仮の表示名
    };

    // 楽観的にリストに追加
    addOptimisticReview(newReview);

    // 実際にサーバーに送信
    const result = await submitReview(formData);
    if (result?.error) {
      // エラー時: revalidatePathにより正しいデータで再描画される
      // トーストでエラーを通知
      toast.error(result.error);
    }
  }

  return (
    <div>
      {optimisticReviews.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
      <ReviewForm onSubmit={handleSubmit} />
    </div>
  );
}
```

`useOptimistic` はReactのフックで、サーバーの応答を待たずに仮のデータでUIを更新します。失敗時は `revalidatePath` によってサーバーから正しいデータが返され、自動的に元に戻ります。
</details>

**Q32.** 以下のコードで、配送先の編集フォームに既存データをセットしています。このパターンの問題点と、より良い実装方法を述べてください。

```typescript
// ページコンポーネント
async function EditAddressPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: address } = await supabase
    .from("shipping_addresses")
    .select("*")
    .eq("id", params.id)
    .single();

  return <AddressForm defaultValues={address} />;
}

// フォームコンポーネント
function AddressForm({ defaultValues }: { defaultValues?: Address }) {
  return (
    <form>
      <input name="name" defaultValue={defaultValues?.name} />
      <input name="postal_code" defaultValue={defaultValues?.postal_code} />
      <input name="address" defaultValue={defaultValues?.address} />
    </form>
  );
}
```

<details><summary>回答</summary>

**問題点:**

1. **認可チェックの欠如**: URLに任意のIDを入力すれば他人の配送先を取得できる可能性がある（RLSがなければ）
2. **データが取得できない場合の処理がない**: `address` が `null` の場合、フォームが空で表示される（404にすべき）
3. **型安全性の欠如**: `params.id` の型チェックがない
4. **エラーハンドリングがない**: DBエラー時の処理がない

**改善版:**

```typescript
import { notFound } from "next/navigation";

async function EditAddressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // ログインユーザーの確認
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 自分の配送先のみ取得（RLSでも守られるが明示的に）
  const { data: address, error } = await supabase
    .from("shipping_addresses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  // データがない場合は404
  if (!address || error) {
    notFound();
  }

  return <AddressForm defaultValues={address} mode="edit" />;
}
```

追加の改善:
- `user_id` チェックを明示的に追加（RLSに加えてアプリ層でも防御）
- `notFound()` で適切なHTTPステータスとUIを返す
- `params` を `Promise` として扱う（Next.js App Routerの仕様）
</details>

**Q33.** レビュー一覧のページネーションを実装する場合、「すべてのレビューを一度に取得する」方式と「無限スクロール」方式の違いと、実装のポイントを述べてください。

<details><summary>回答</summary>

**すべて一度に取得:**
```typescript
const { data } = await supabase
  .from("reviews")
  .select("*")
  .eq("product_id", productId)
  .order("created_at", { ascending: false });
```
- メリット: 実装がシンプル。レビューが少ない場合は問題ない
- デメリット: レビュー数が100件を超えると初回ロードが遅い。メモリを消費する

**無限スクロール:**
```typescript
"use client";

function ReviewList({ productId, initialReviews }: Props) {
  const [reviews, setReviews] = useState(initialReviews);
  const [cursor, setCursor] = useState(initialReviews.at(-1)?.created_at);
  const [hasMore, setHasMore] = useState(true);

  async function loadMore() {
    const moreReviews = await fetchMoreReviews(productId, cursor);
    if (moreReviews.length === 0) {
      setHasMore(false);
      return;
    }
    setReviews([...reviews, ...moreReviews]);
    setCursor(moreReviews.at(-1)?.created_at);
  }

  return (
    <div>
      {reviews.map((r) => <ReviewItem key={r.id} review={r} />)}
      {hasMore && (
        <button onClick={loadMore}>もっと見る</button>
      )}
    </div>
  );
}
```

**実装のポイント:**
1. **初回表示はServer Component**: 最初の10件はSSRで高速表示
2. **追加読み込みはClient Component**: 「もっと見る」ボタンまたはIntersection Observerで追加取得
3. **カーソルベース**: `created_at < cursor` で次のページを取得（OFFSETより効率的）
4. **ローディング状態**: 読み込み中はスケルトンUIを表示
5. **終端判定**: 取得件数が0またはlimit未満なら「これ以上なし」

ECサイトのレビューでは、10-20件ずつの「もっと見る」ボタンが一般的です。
</details>

**Q34.** フォームのアクセシビリティ（a11y）を改善するために、以下の配送先フォームにどのような修正を加えるべきですか？

```html
<form>
  <div>
    <span>名前</span>
    <input name="name" />
  </div>
  <div>
    <span>郵便番号</span>
    <input name="postal_code" />
    <span style="color: red">※必須</span>
  </div>
  <div class="error">名前を入力してください</div>
  <button>保存</button>
</form>
```

<details><summary>回答</summary>

```html
<form aria-label="配送先登録フォーム">
  <div>
    <!-- 1. span → label に変更。for/id で紐付け -->
    <label for="name">名前</label>
    <input
      id="name"
      name="name"
      required
      aria-required="true"
      aria-describedby="name-error"
      aria-invalid="true"
    />
  </div>
  <div>
    <label for="postal_code">
      郵便番号
      <!-- 2. 必須マークを label 内に。aria-hidden で二重読み上げ防止 -->
      <span aria-hidden="true" style="color: red">※必須</span>
    </label>
    <input
      id="postal_code"
      name="postal_code"
      required
      aria-required="true"
      inputmode="numeric"
      pattern="\d{3}-\d{4}"
      placeholder="000-0000"
    />
  </div>
  <!-- 3. エラーメッセージにidを付与し、aria-describedby で関連付け -->
  <div id="name-error" role="alert" class="error">
    名前を入力してください
  </div>
  <!-- 4. ボタンにtype指定 -->
  <button type="submit">保存</button>
</form>
```

**改善点:**
1. **`<label>` の使用**: `<span>` ではスクリーンリーダーが入力欄とラベルを関連付けられない
2. **`aria-required`**: スクリーンリーダーに「必須フィールド」を伝える
3. **`aria-describedby`**: エラーメッセージを入力欄と関連付ける
4. **`aria-invalid`**: バリデーションエラーがある入力欄を示す
5. **`role="alert"`**: エラーメッセージの変更をスクリーンリーダーが即時に読み上げる
6. **`inputmode="numeric"`**: モバイルでテンキーを表示する
</details>

**Q35.** レビューのソート機能（新着順・高評価順・低評価順）を実装する場合のServer ComponentとClient Componentの役割分担を設計してください。

<details><summary>回答</summary>

**設計方針:** URLのクエリパラメータでソート順を管理し、Server Componentでデータ取得を行う。

**Server Component（データ取得）:**
```typescript
// app/products/[id]/page.tsx
async function ProductPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { id } = await params;
  const { sort } = await searchParams;

  const supabase = await createClient();

  // ソート順の決定
  let orderColumn = "created_at";
  let ascending = false;

  switch (sort) {
    case "rating-high":
      orderColumn = "rating";
      ascending = false;
      break;
    case "rating-low":
      orderColumn = "rating";
      ascending = true;
      break;
    default: // "newest" or undefined
      orderColumn = "created_at";
      ascending = false;
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(display_name)")
    .eq("product_id", id)
    .order(orderColumn, { ascending });

  return (
    <div>
      <ReviewSortSelector currentSort={sort ?? "newest"} />
      <ReviewList reviews={reviews ?? []} />
    </div>
  );
}
```

**Client Component（ソート切り替えUI）:**
```typescript
"use client";
import { useRouter, useSearchParams } from "next/navigation";

function ReviewSortSelector({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSort(sort: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    router.push(`?${params.toString()}`);
  }

  return (
    <select
      value={currentSort}
      onChange={(e) => handleSort(e.target.value)}
    >
      <option value="newest">新着順</option>
      <option value="rating-high">高評価順</option>
      <option value="rating-low">低評価順</option>
    </select>
  );
}
```

**ポイント:**
- URLにソート順を持たせることで、ブックマークや共有が可能
- Server Componentでデータ取得するため、SEOにも有利
- Client ComponentはソートUIのみを担当し、ナビゲーションでServer Componentが再実行される
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q36.** フォームの状態管理ライブラリ（react-hook-form, formik等）を導入するかどうかの判断基準を、本アプリの文脈で論じてください。

<details><summary>回答</summary>

**導入が不要な場合（本アプリのMVP）:**
- フォームが少ない（プロフィール、配送先、レビューの3種類）
- 各フォームのフィールド数が少ない（5-6個程度）
- Server ActionsとFormDataで十分に機能する
- 追加の依存パッケージを増やしたくない

**導入を検討すべき場合:**
- フォームが10個以上に増える
- 1つのフォームに20個以上のフィールドがある
- ステップ形式のフォーム（ウィザード）が必要
- 条件付きフィールド（Aを選んだらBが表示される）が多い
- リアルタイムバリデーションの要件が厳しい
- フォームのパフォーマンス（再レンダリング）が問題になる

**各ライブラリの特徴:**

| ライブラリ | 特徴 | 適用場面 |
|-----------|------|---------|
| react-hook-form | 非制御コンポーネントベース。パフォーマンスが良い。zodと連携可能 | フィールド数が多い。パフォーマンス重視 |
| formik | 制御コンポーネントベース。学習しやすい | 中規模フォーム。チームの経験 |
| Next.js FormData | ライブラリ不要。Server Actionsと自然に統合 | シンプルなフォーム。MVP |

**結論:** 本アプリのMVPではNext.jsのFormData + zodで十分です。フォームの数や複雑度が増えたら、react-hook-form + zodの組み合わせを検討します。
</details>

**Q37.** レビューデータのGDPR（個人情報保護）対応について、ユーザーがアカウントを削除した場合のレビューの扱いを設計してください。

<details><summary>回答</summary>

**3つの選択肢:**

**1. レビューも完全削除（ON DELETE CASCADE）:**
```sql
ALTER TABLE reviews
  ADD CONSTRAINT fk_reviews_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```
- メリット: シンプル。ユーザーのデータが完全に消える
- デメリット: 有用なレビューが消え、他の購入者に影響。平均評価が変動する

**2. レビューを匿名化して残す:**
```sql
-- ユーザー削除時のトリガー
CREATE OR REPLACE FUNCTION anonymize_reviews()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reviews SET
    user_id = NULL, -- または匿名ユーザーIDに変更
  WHERE user_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;
```
- メリット: レビュー内容は残るので他のユーザーの参考になる。平均評価が保持される
- デメリット: レビュー内容に個人を特定できる情報が含まれている可能性がある

**3. 匿名化 + コンテンツ確認:**
```typescript
async function deleteUserAccount(userId: string) {
  // 1. レビューのuser_idを匿名化
  await supabase
    .from("reviews")
    .update({ user_id: ANONYMOUS_USER_ID })
    .eq("user_id", userId);

  // 2. 個人情報を含むプロフィールを削除
  await supabase.from("profiles").delete().eq("id", userId);

  // 3. 配送先を削除（住所は個人情報）
  await supabase.from("shipping_addresses").delete().eq("user_id", userId);

  // 4. 認証ユーザーを削除
  await supabase.auth.admin.deleteUser(userId);
}
```

**推奨:** GDPRの「忘れられる権利」に基づき、個人を特定できるデータ（プロフィール、配送先）は完全削除し、レビューは匿名化して残す方式が、法的要件とサービス品質のバランスが取れています。
</details>

**Q38.** 配送先のデータ設計で、日本の住所体系（都道府県・市区町村・番地・建物名）をどう正規化すべきか、1カラム方式と複数カラム方式の比較を述べてください。

<details><summary>回答</summary>

**1カラム方式（現在の設計）:**
```sql
address TEXT  -- "東京都渋谷区道玄坂1-2-3 ○○ビル5F"
```
- メリット: シンプル。ユーザーが自由に入力できる。データ移行が容易
- デメリット: 都道府県での集計ができない。住所検索が困難。表記揺れ（「東京都」vs「東京」）

**複数カラム方式:**
```sql
prefecture TEXT,     -- "東京都"（プルダウン選択）
city TEXT,           -- "渋谷区道玄坂"
street TEXT,         -- "1-2-3"
building TEXT,       -- "○○ビル5F"（任意）
```
- メリット: 都道府県別の集計・検索が可能。配送料計算（地域別）に活用できる。郵便番号からの自動入力と相性が良い
- デメリット: カラム数が増える。入力フォームのフィールドが増える。分割の境界が曖昧（「渋谷区」と「道玄坂」はどちらに？）

**ハイブリッド方式（推奨）:**
```sql
postal_code TEXT,     -- "150-0043"
prefecture TEXT,      -- "東京都"（プルダウン or 郵便番号自動入力）
city TEXT,            -- "渋谷区道玄坂"（郵便番号自動入力）
address_line TEXT,    -- "1-2-3 ○○ビル5F"（自由入力）
```
- 郵便番号から都道府県・市区町村は自動入力
- 番地以降はユーザーの自由入力（建物名の有無は人それぞれ）
- 都道府県は独立カラムなので集計・配送料計算に活用可能

**MVPでは1カラムで十分。** 配送料の地域別計算が必要になったら複数カラムに移行します。
</details>

**Q39.** Server Actionでフォームのエラー状態を返す場合、以下の2つのパターンの違いと適用場面を説明してください。

```typescript
// パターン1: throw でエラー
export async function submitReview(formData: FormData) {
  // ...
  if (!isValid) throw new Error("バリデーションエラー");
}

// パターン2: return でエラーオブジェクト
export async function submitReview(formData: FormData) {
  // ...
  if (!isValid) return { error: "バリデーションエラー", fields: { ... } };
}
```

<details><summary>回答</summary>

**パターン1: throw**
- Next.jsの `error.tsx` でキャッチされ、エラーページが表示される
- フォームの入力値がリセットされる（ページ全体がエラー状態になるため）
- 適用場面: 認証エラー（ログインしていない）、システムエラー（DB接続失敗）など、フォームの表示自体が不適切な場合

**パターン2: return**
- フォームコンポーネントが戻り値を受け取り、エラーメッセージをフィールドごとに表示できる
- フォームの入力値は保持される（ユーザーが修正して再送信できる）
- 適用場面: バリデーションエラー（入力値の不備）、ビジネスロジックエラー（既にレビュー済み等）

**具体的な使い分け:**
```typescript
export async function submitReview(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 認証エラー → throw（フォームを表示しても意味がない）
  if (!user) throw new Error("ログインが必要です");

  // バリデーションエラー → return（入力を修正してもらう）
  const result = reviewSchema.safeParse(raw);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  // DBエラー → return（リトライの機会を与える）
  const { error } = await supabase.from("reviews").insert(data);
  if (error) {
    return { error: "レビューの投稿に失敗しました。もう一度お試しください。" };
  }
}
```

**原則:** ユーザーが対処可能なエラーは `return`、対処不可能なエラーは `throw`。
</details>

**Q40.** マルチステップフォーム（例: 配送先入力→確認→完了）を実装する場合の状態管理戦略と、各ステップ間でのデータの持ち方について、3つのアプローチを比較してください。

<details><summary>回答</summary>

**アプローチ1: React State（Client Component）**
```typescript
function CheckoutWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ address: {}, payment: {} });

  return step === 1 ? (
    <AddressStep data={data.address} onNext={(addr) => { setData({...data, address: addr}); setStep(2); }} />
  ) : step === 2 ? (
    <ConfirmStep data={data} onSubmit={handleSubmit} onBack={() => setStep(1)} />
  ) : (
    <CompletionStep />
  );
}
```
- メリット: 全データがクライアントのメモリに保持され、ステップ間の遷移が高速
- デメリット: ページリロードでデータが消える。ブラウザバックで状態がずれる
- 適用場面: シンプルな2-3ステップのフォーム

**アプローチ2: URL SearchParams（Server Component互換）**
```typescript
// /checkout?step=1 → /checkout?step=2
// 各ステップのデータをhidden fieldまたはsessionStorageで保持
```
- メリット: URLで状態を表現できる。ブラウザバック対応。SSRと互換
- デメリット: URLにデータを含めるとセキュリティリスク（クレジットカード情報等）。データ量に制限
- 適用場面: ステップ数が多い。ブックマーク可能にしたい場合

**アプローチ3: サーバー側セッション / DB一時保存**
```typescript
// ステップ1完了時にDBに仮保存（status = 'draft'）
// ステップ2で仮保存データを読み込み
// 最終ステップでstatus = 'confirmed' に更新
```
- メリット: リロードしてもデータが消えない。別デバイスから再開可能。セキュリティが高い
- デメリット: DB操作が増える。一時データのクリーンアップが必要（放棄されたドラフトの削除）
- 適用場面: 決済フロー。入力量が多い。ユーザーが途中で離脱・再開する可能性がある場合

**本アプリの推奨:** カート→配送先選択→確認→決済の流れでは、アプローチ1（カート〜確認）+ アプローチ3（決済）の組み合わせが適切です。決済情報はサーバーサイドで管理し、クライアントに持たせません。
</details>
