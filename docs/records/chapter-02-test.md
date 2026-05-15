# Chapter 2: データの置き場所を作ろう — 理解度テスト

> DB、テーブル設計、リレーション、RLS、マイグレーション

---

## IT知識・概念理解

### 初級（絶対に抑えてほしい基礎知識）

**Q1.** リレーショナルデータベース（RDB）とは何ですか？データをどのように管理しますか？

<details><summary>回答</summary>

リレーショナルデータベースは、データを**テーブル（表）**の形で管理するデータベースです。

- データは**行（レコード）**と**列（カラム）**で構成される
- テーブル同士を**リレーション（関連付け）**で結びつける
- SQL（Structured Query Language）でデータを操作する

例: PostgreSQL, MySQL, SQLite
</details>

**Q2.** プライマリキー（PRIMARY KEY）とは何ですか？なぜ必要ですか？

<details><summary>回答</summary>

プライマリキーは、テーブル内の各行を**一意に識別**するためのカラム（または複合カラム）です。

必要な理由:
- 各レコードを確実に特定できる（重複・NULLは許可されない）
- 他テーブルからの参照（外部キー）の基点になる
- データベースが自動的にインデックスを作成し、検索が高速化する

一般的に `id` カラム（UUIDや連番）を使用します。
</details>

**Q3.** 外部キー（FOREIGN KEY）とは何ですか？具体例を挙げて説明してください。

<details><summary>回答</summary>

外部キーは、あるテーブルのカラムが**別テーブルのプライマリキーを参照**することで、テーブル間の関連を定義するものです。

例:
- `orders` テーブルの `user_id` が `users` テーブルの `id` を参照
- これにより「この注文はどのユーザーのものか」が明確になる

```
users テーブル: id | name
orders テーブル: id | user_id (FK → users.id) | total
```

外部キー制約により、存在しないユーザーの注文を作成することを防げます（参照整合性）。
</details>

**Q4.** Supabaseとは何ですか？どのような機能を提供しますか？

<details><summary>回答</summary>

Supabaseは**オープンソースのBaaS（Backend as a Service）**で、Firebaseの代替として位置づけられています。

主な機能:
- **PostgreSQLデータベース** — フルマネージドのRDB
- **認証（Auth）** — メール/パスワード、OAuth（Google、GitHub等）
- **ストレージ** — ファイル/画像のアップロード・管理
- **Realtime** — データ変更のリアルタイム通知
- **Edge Functions** — サーバーレス関数
- **RLS（Row Level Security）** — 行レベルのアクセス制御
</details>

**Q5.** マイグレーションとは何ですか？なぜ直接SQLでテーブルを変更するのではなくマイグレーションを使うのですか？

<details><summary>回答</summary>

マイグレーションは、データベースのスキーマ変更を**バージョン管理された手順書（スクリプト）**として記録・適用する仕組みです。

直接SQLで変更しない理由:
1. **再現性** — 同じ手順を別環境（開発/本番）に正確に適用できる
2. **履歴管理** — いつ・どんな変更をしたか追跡できる
3. **ロールバック** — 問題があれば前の状態に戻せる
4. **チーム共有** — 他の開発者が同じDB構造を再現できる
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q6.** テーブル設計で「正規化」とは何ですか？第1〜第3正規形をそれぞれ簡潔に説明してください。

<details><summary>回答</summary>

正規化は、データの**重複を排除**し、**整合性を保つ**ためにテーブル構造を整理する手法です。

- **第1正規形（1NF）** — 各カラムが**原子的な値**のみを持つ（1セルに1値。カンマ区切りの複数値はNG）
- **第2正規形（2NF）** — 1NF + 主キーの**一部**にだけ依存するカラムがない（部分関数従属の排除）
- **第3正規形（3NF）** — 2NF + 主キー以外のカラムに依存するカラムがない（推移的関数従属の排除）

例: 「注文テーブルに商品名と商品カテゴリがある」→ 商品カテゴリは商品に依存（注文に直接依存しない）→ 商品テーブルに分離して3NFに。
</details>

**Q7.** 1対多（One-to-Many）と多対多（Many-to-Many）のリレーションの違いを、ECサイトの例で説明してください。

<details><summary>回答</summary>

**1対多（One-to-Many）:**
- 1人のユーザーは複数の注文を持つが、1つの注文は1人のユーザーに属する
- 実装: `orders` テーブルに `user_id`（外部キー）を持たせる

**多対多（Many-to-Many）:**
- 1つの注文は複数の商品を含み、1つの商品は複数の注文に含まれる
- 実装: **中間テーブル**（`order_items`）を作成して実現する

```
users ─1:N─ orders ─N:M─ products
                ↓
          order_items（中間テーブル）
          order_id | product_id | quantity
```

中間テーブルは両方のテーブルのIDを外部キーとして持ちます。
</details>

**Q8.** RLS（Row Level Security）とは何ですか？認証（Auth）とRLSの関係を説明してください。

<details><summary>回答</summary>

RLSはPostgreSQLの機能で、**行単位でアクセス権限を制御**する仕組みです。

- テーブルに**ポリシー（条件式）**を設定し、「誰が」「どの行を」「読み書きできるか」を定義
- ポリシーを満たさない行はクエリ結果から自動的に除外される

**認証との関係:**
1. Supabase Authがユーザーを認証し、JWTトークンを発行
2. データベースへのリクエストにJWTが付与される
3. RLSポリシーで `auth.uid()` を使い、**ログインユーザーのIDと行のuser_idを比較**
4. 一致する行のみアクセス許可

これにより「ユーザーは自分のデータだけ見える」をデータベースレベルで保証できます。
</details>

**Q9.** `UUID` と `連番ID（SERIAL/BIGSERIAL）` のメリット・デメリットを比較してください。

<details><summary>回答</summary>

| 観点 | UUID | 連番ID |
|------|------|--------|
| **一意性** | グローバルに一意（衝突ほぼなし） | テーブル内で一意 |
| **推測可能性** | 推測困難（セキュリティ的に有利） | 連番なので推測容易（`/users/1`, `/users/2`...） |
| **サイズ** | 16バイト（長い） | 4〜8バイト（短い） |
| **インデックス効率** | ランダムなため挿入時のB-Tree効率が低い | 連番なので挿入が高速 |
| **分散環境** | DBに問い合わせずにクライアントで生成可能 | DBのシーケンスに依存 |

Supabaseでは `gen_random_uuid()` でUUIDを自動生成するのが一般的です。
</details>

**Q10.** データベースの「インデックス」とは何ですか？作成するとなぜ検索が速くなるのですか？デメリットはありますか？

<details><summary>回答</summary>

インデックスは、テーブルの特定カラムに対する**検索用のデータ構造**（主にB-Tree）です。本の索引と同じ役割です。

**なぜ速くなるか:**
- インデックスなし: テーブル全行を順番に走査（フルスキャン）→ O(N)
- インデックスあり: B-Treeで対象行に直接アクセス → O(log N)

**デメリット:**
1. **書き込み速度の低下** — INSERT/UPDATE/DELETE時にインデックスも更新が必要
2. **ストレージ消費** — インデックス分のディスク容量が必要
3. **メンテナンスコスト** — 不要なインデックスが溜まると逆効果

よく検索・JOINに使うカラム（外部キーなど）にインデックスを張り、WHERE句で使わないカラムには不要です。
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q11.** 「論理削除」と「物理削除」の違い、それぞれのメリット・デメリットを説明してください。どちらをいつ選ぶべきですか？

<details><summary>回答</summary>

**物理削除:** `DELETE FROM users WHERE id = 1` — 行を実際に削除
**論理削除:** `UPDATE users SET deleted_at = NOW() WHERE id = 1` — フラグで削除扱い

| 観点 | 物理削除 | 論理削除 |
|------|----------|----------|
| データ復元 | 不可能（バックアップからのみ） | `deleted_at = NULL` で簡単に復元 |
| クエリの複雑さ | シンプル | 全クエリに `WHERE deleted_at IS NULL` が必要 |
| ストレージ | 解放される | 蓄積し続ける |
| 外部キー制約 | CASCADE DELETEで整合性保持 | 参照先が論理削除でも外部キーは有効 |
| 監査/法令対応 | 履歴が消える | 履歴が残る |

**使い分け:**
- 法令でデータ保持が求められる場合 → 論理削除
- ユーザーの「元に戻す」機能が必要 → 論理削除
- シンプルさ優先、データ量を抑えたい → 物理削除
</details>

**Q12.** Supabaseでテーブル設計する際、`created_at` と `updated_at` カラムにデフォルト値を設定する意味と方法を説明してください。

<details><summary>回答</summary>

**意味:**
- `created_at`: レコードの作成日時を自動記録。デバッグ・監査・並べ替えに必須
- `updated_at`: 最終更新日時を自動記録。楽観的ロック・キャッシュ制御に利用

**設定方法（PostgreSQL/Supabase）:**
```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

Supabaseでは `moddatetime` 拡張を有効にして同様のことを簡単に実現できます。
</details>

**Q13.** テーブル設計で「カラム追加」は比較的安全ですが、「カラム削除」や「型変更」が危険な理由を説明してください。安全に行うにはどうしますか？

<details><summary>回答</summary>

**カラム追加が安全な理由:**
- 既存のクエリやアプリケーションコードに影響しない（新カラムを参照していないため）
- `DEFAULT` 値を設定すれば既存行も問題なし

**カラム削除が危険な理由:**
- そのカラムを参照しているアプリケーションコード・クエリ・ビューが壊れる
- 外部キーで参照されている場合、制約違反になる
- データが永久に失われる

**型変更が危険な理由:**
- 既存データが新しい型に変換できない可能性がある（例: 文字列→数値で `"abc"` は変換不可）
- 大きなテーブルではテーブルロックが発生し、ダウンタイムが生じる

**安全な方法:**
1. 新カラムを追加 → アプリケーションを新カラム対応に更新 → 旧カラムを削除（3段階デプロイ）
2. 十分なテスト環境で事前検証
3. バックアップを取ってから実行
</details>

**Q14.** SupabaseのRLSポリシーで「サービスロールキー」と「匿名キー（anon key）」の違いは何ですか？それぞれどの場面で使いますか？

<details><summary>回答</summary>

| | anon key | service_role key |
|---|---|---|
| **RLS** | ポリシーが**適用される** | ポリシーを**バイパス**（全データにアクセス） |
| **権限** | 匿名ユーザー or 認証ユーザーの権限 | 管理者権限（全操作可能） |
| **使用場所** | クライアントサイド（ブラウザ） | サーバーサイドのみ |
| **公開可否** | 公開OK（RLSで保護） | **絶対に公開NG**（漏洩=全データ流出） |

**使い分け:**
- **anon key**: フロントエンドのSupabaseクライアント初期化に使用。RLSポリシーでアクセス制御
- **service_role key**: Webhook処理、バッチ処理、管理者向けAPIなど、サーバーサイドでRLSを迂回したい場合のみ使用
</details>

**Q15.** データベースのトランザクションとは何ですか？ACID特性を説明してください。

<details><summary>回答</summary>

トランザクションは、複数のデータベース操作を**ひとまとまりの処理単位**として扱う仕組みです。全て成功するか、全て取り消される（All or Nothing）。

**ACID特性:**
| 特性 | 意味 | 例 |
|------|------|-----|
| **Atomicity（原子性）** | 全操作が成功するか、全て取り消されるか | 送金: 引き落とし成功 + 入金失敗 → 両方取り消し |
| **Consistency（一貫性）** | 制約違反のデータは保存されない | 残高がマイナスになる操作は拒否 |
| **Isolation（独立性）** | 同時実行中のトランザクション同士が干渉しない | 同じ口座への同時送金が競合しない |
| **Durability（耐久性）** | コミットされたデータは障害後も失われない | サーバークラッシュ後もデータが保持される |
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q16.** ECサイトの「注文」テーブル設計で、商品価格をどう扱うべきですか？「商品テーブルの価格を参照する」vs「注文時の価格をコピーして保存する」のトレードオフを議論してください。

<details><summary>回答</summary>

**商品テーブルの価格を参照する場合:**
- メリット: データの重複がない、正規化されている
- デメリット: 商品価格が変更されると、**過去の注文の金額も変わってしまう**（致命的）

**注文時の価格をコピーする場合:**
- メリット: 注文時の正確な金額が永続的に残る。法的・会計的に正しい
- デメリット: データの重複（非正規化）

**結論: 注文時の価格をコピーすべき。**

これは「非正規化が正しい」典型例です。注文は「その時点のスナップショット」であり、後から商品価格が変わっても過去の注文に影響してはいけません。

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  price_at_purchase INTEGER NOT NULL,  -- 注文時の価格をコピー
  quantity INTEGER NOT NULL
);
```
</details>

**Q17.** RLSのポリシー設計で「許可リスト方式（デフォルト拒否）」と「拒否リスト方式（デフォルト許可）」のどちらを採用すべきですか？理由を説明してください。

<details><summary>回答</summary>

**許可リスト方式（ホワイトリスト）を採用すべきです。**

**デフォルト拒否 + 許可ポリシーを追加:**
```sql
-- RLSを有効にした時点で、全アクセスが拒否される
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 必要なアクセスだけ明示的に許可
CREATE POLICY "users_read_own_orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);
```

**理由:**
1. **安全側に倒れる** — ポリシーの書き忘れ＝アクセス不可（データ漏洩より安全）
2. **拒否リスト方式の危険性** — ポリシーの書き忘れ＝全データ公開（致命的）
3. **監査しやすい** — 「何が許可されているか」が明示的に列挙されている
4. **セキュリティの原則** — 最小権限の原則（Principle of Least Privilege）に合致

Supabase/PostgreSQLのRLSはデフォルトで許可リスト方式（RLS有効時に全拒否）です。
</details>

**Q18.** マイグレーションファイルを手動で編集してはいけないのはなぜですか？もしマイグレーション適用後にスキーマの間違いに気づいた場合、どう対処しますか？

<details><summary>回答</summary>

**手動編集してはいけない理由:**
- マイグレーションは「適用済み」としてDBに記録されている
- ファイルを書き換えても、DBは「もう適用済み」と認識しているため再実行されない
- 開発環境と本番環境でスキーマの不整合が発生する
- チームメンバーの環境でも不整合が生じる

**正しい対処法:**

1. **新しいマイグレーションで修正する（推奨）:**
```sql
-- 20240201_fix_products_table.sql
ALTER TABLE products ALTER COLUMN price TYPE INTEGER;
ALTER TABLE products ADD COLUMN description TEXT;
```

2. **開発環境のみリセットが許される場合:**
```bash
supabase db reset  # ローカルDBを初期化して全マイグレーション再適用
```

3. **本番環境での対処:**
- 必ず新しいマイグレーションを作成
- バックアップ→適用→確認の手順
- ロールバック用の逆マイグレーションも準備
</details>

**Q19.** テーブル設計で「多態的関連（ポリモーフィック・アソシエーション）」とは何ですか？なぜアンチパターンとされることがあるのですか？代替案を提示してください。

<details><summary>回答</summary>

**多態的関連とは:**
1つのテーブルが複数の異なるテーブルを参照する設計。`commentable_type` と `commentable_id` の組み合わせで参照先を切り替える。

```
comments テーブル:
id | body | commentable_type | commentable_id
1  | "良い" | "Product"      | 10
2  | "速い" | "Article"      | 5
```

**アンチパターンとされる理由:**
1. **外部キー制約が使えない** — `commentable_id` がどのテーブルを参照するか不定なため、DBレベルの整合性保証ができない
2. **JOINが複雑** — 条件分岐が必要
3. **型安全性がない** — `commentable_type` に不正な値が入りうる

**代替案:**

1. **テーブル分割（推奨）:**
```sql
CREATE TABLE product_comments (
  id UUID PRIMARY KEY, product_id UUID REFERENCES products(id), body TEXT
);
CREATE TABLE article_comments (
  id UUID PRIMARY KEY, article_id UUID REFERENCES articles(id), body TEXT
);
```

2. **共通の親テーブル + 外部キー:**
```sql
CREATE TABLE commentable_entities (id UUID PRIMARY KEY, entity_type TEXT);
-- products, articles がこのテーブルのIDを共有
CREATE TABLE comments (
  id UUID PRIMARY KEY, entity_id UUID REFERENCES commentable_entities(id), body TEXT
);
```
</details>

**Q20.** Supabaseのリアルタイム機能（Realtime）の仕組みを説明してください。全テーブルに有効にすべきですか？パフォーマンスへの影響は？

<details><summary>回答</summary>

**仕組み:**
- PostgreSQLの **レプリケーション（WAL: Write-Ahead Log）** を監視
- データ変更を検知すると、WebSocket経由で接続中のクライアントに通知
- `INSERT`, `UPDATE`, `DELETE` のイベントをサブスクライブ可能

**全テーブルに有効にすべきか: NO**

**パフォーマンスへの影響:**
1. **WALの増加** — Realtime対象テーブルの全変更がWALに詳細記録される
2. **WebSocket接続数** — 同時接続数が増えるとサーバーリソースを消費
3. **ブロードキャスト負荷** — 大量のINSERT/UPDATEがあるテーブルでは通知が膨大になる

**推奨:**
- チャット、通知、ダッシュボードなど**リアルタイム性が必要なテーブルのみ**有効化
- 注文履歴やログなど、ポーリングや画面遷移で十分なテーブルは無効
- `supabase_realtime` publication に追加するテーブルを厳選する

```sql
-- 特定テーブルのみRealtime有効化
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
```
</details>

---

## コーディング・操作理解

### 初級（絶対に抑えてほしい基礎知識）

**Q1.** 以下のSQLで `users` テーブルを作成してください。カラムは `id`（UUID、主キー）、`name`（テキスト、必須）、`email`（テキスト、必須、ユニーク）、`created_at`（タイムスタンプ、デフォルト現在時刻）。

<details><summary>回答</summary>

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```
</details>

**Q2.** 以下のSQLの結果を答えてください。

```sql
SELECT * FROM products WHERE price > 1000 ORDER BY price DESC LIMIT 5;
```

<details><summary>回答</summary>

`products` テーブルから:
1. `price` が 1000 より大きい行を抽出（`WHERE`）
2. `price` の降順（高い順）に並べ替え（`ORDER BY ... DESC`）
3. 上位5件だけ返す（`LIMIT`）

つまり「価格が1000円超の商品を、高い順に5件取得する」クエリです。
</details>

**Q3.** Supabaseのクライアントライブラリで `products` テーブルから全件取得するコードを書いてください。

<details><summary>回答</summary>

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const { data, error } = await supabase
  .from("products")
  .select("*");

if (error) {
  console.error("Error:", error.message);
} else {
  console.log(data);
}
```
</details>

**Q4.** 以下のSQLで何が行われますか？

```sql
ALTER TABLE products ADD COLUMN description TEXT DEFAULT '';
```

<details><summary>回答</summary>

`products` テーブルに新しいカラム `description` を追加します。

- 型: `TEXT`（文字列）
- デフォルト値: 空文字 `''`
- 既存の行には自動的にデフォルト値 `''` が設定される
- `NOT NULL` がないため、`NULL` も許可される
</details>

**Q5.** `INSERT`, `SELECT`, `UPDATE`, `DELETE` のSQL文をそれぞれ1行ずつ書いてください。対象テーブルは `users`（カラム: `id`, `name`, `email`）。

<details><summary>回答</summary>

```sql
-- INSERT: 新しいユーザーを追加
INSERT INTO users (name, email) VALUES ('田中太郎', 'tanaka@example.com');

-- SELECT: 全ユーザーを取得
SELECT id, name, email FROM users;

-- UPDATE: 特定ユーザーのメールを更新
UPDATE users SET email = 'new@example.com' WHERE id = '対象のUUID';

-- DELETE: 特定ユーザーを削除
DELETE FROM users WHERE id = '対象のUUID';
```

重要: `UPDATE` と `DELETE` には必ず `WHERE` 句をつけること。なければ全行が対象になります。
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q6.** 以下のSupabaseクエリを、等価なSQLに変換してください。

```typescript
const { data } = await supabase
  .from("products")
  .select("id, name, price")
  .eq("category", "coffee")
  .gte("price", 500)
  .order("price", { ascending: true })
  .limit(10);
```

<details><summary>回答</summary>

```sql
SELECT id, name, price
FROM products
WHERE category = 'coffee'
  AND price >= 500
ORDER BY price ASC
LIMIT 10;
```

対応関係:
- `.select("id, name, price")` → `SELECT id, name, price`
- `.eq("category", "coffee")` → `WHERE category = 'coffee'`
- `.gte("price", 500)` → `AND price >= 500`
- `.order("price", { ascending: true })` → `ORDER BY price ASC`
- `.limit(10)` → `LIMIT 10`
</details>

**Q7.** 以下のマイグレーションSQLにはいくつかの問題があります。問題を指摘して修正してください。

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  total FLOAT,
  status TEXT,
  created_at TIMESTAMP
);
```

<details><summary>回答</summary>

**問題点と修正:**

1. **`id SERIAL`** → UUIDを使うべき（推測可能性、分散環境での衝突リスク）
2. **`user_id` に外部キー制約がない** → 存在しないユーザーの注文が作れてしまう
3. **`FLOAT`で金額** → 浮動小数点の丸め誤差。金額は `INTEGER`（銭単位）か `NUMERIC` を使う
4. **`status TEXT`** → 不正な値が入りうる。CHECK制約を追加
5. **`NOT NULL` がない** → 必須カラムが NULL になりうる
6. **`created_at` にデフォルト値がない**

```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  total INTEGER NOT NULL,  -- 円単位の整数
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```
</details>

**Q8.** リレーションを含むSupabaseクエリを書いてください。`orders` テーブルから、関連する `users` のname と `order_items` の一覧を含めて取得してください。

<details><summary>回答</summary>

```typescript
const { data, error } = await supabase
  .from("orders")
  .select(`
    id,
    total,
    status,
    created_at,
    users ( name ),
    order_items (
      id,
      product_id,
      quantity,
      price_at_purchase
    )
  `)
  .eq("user_id", userId)
  .order("created_at", { ascending: false });
```

これはPostgRESTの**埋め込み（Embedding）**機能を利用しています。外部キー関係があるテーブルを括弧内に記述すると、自動的にJOINしてネストされたJSONとして返します。

等価SQL:
```sql
SELECT o.*, u.name, oi.*
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.user_id = :userId
ORDER BY o.created_at DESC;
```
</details>

**Q9.** 以下のRLSポリシーが何を許可しているか説明してください。

```sql
CREATE POLICY "users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

<details><summary>回答</summary>

**1つ目のポリシー（SELECT）:**
- `orders` テーブルの**読み取り**を制御
- `auth.uid()`（ログイン中ユーザーのID）と行の `user_id` が一致する行**のみ**表示
- つまり「ユーザーは自分の注文だけ閲覧できる」

**2つ目のポリシー（INSERT）:**
- `orders` テーブルへの**挿入**を制御
- `WITH CHECK` で挿入しようとする行の `user_id` が自分のIDと一致する場合のみ許可
- つまり「ユーザーは自分のユーザーIDを持つ注文だけ作成できる」（他人になりすましての注文作成を防止）

**`USING` vs `WITH CHECK`:**
- `USING`: 既存の行に対するフィルタ（SELECT/UPDATE/DELETE）
- `WITH CHECK`: 新しい/変更後の行に対する検証（INSERT/UPDATE）
</details>

**Q10.** Supabaseのマイグレーションファイルを作成するコマンドと、適用するコマンドを書いてください。

<details><summary>回答</summary>

```bash
# マイグレーションファイルを作成
supabase migration new create_products_table
# → supabase/migrations/20240101000000_create_products_table.sql が作成される

# マイグレーションファイルにSQLを記述後、ローカルDBに適用
supabase db reset
# → 全マイグレーションを最初から再適用（開発環境向け）

# または差分のみ適用
supabase migration up

# リモート（本番）に適用
supabase db push
```

ファイル名の先頭のタイムスタンプ（`20240101000000`）が適用順序を決定します。
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q11.** Supabaseで型安全にクエリを実行するために、TypeScriptの型をどう生成・活用しますか？

<details><summary>回答</summary>

**型の自動生成:**
```bash
# Supabase CLIで型定義を生成
supabase gen types typescript --local > src/types/database.types.ts
# リモートから生成する場合
supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
```

**Supabaseクライアントに型を適用:**
```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 型安全なクエリ — 存在しないカラム名はコンパイルエラー
const { data } = await supabase
  .from("products")    // テーブル名が補完される
  .select("id, name, price")  // カラム名が補完される
  .eq("category", "coffee");  // 型に合わない値はエラー

// data の型が自動推論される
// data: { id: string; name: string; price: number }[] | null
```

スキーマ変更のたびに型を再生成し、コミットに含めるワークフローが推奨です。
</details>

**Q12.** 以下の要件でテーブル設計をしてください: 「ユーザーは複数の配送先住所を持てる。デフォルトの配送先を1つ設定できる。」

<details><summary>回答</summary>

**方法1: フラグカラム方式**
```sql
CREATE TABLE addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,          -- "自宅", "会社" 等
  postal_code TEXT NOT NULL,
  prefecture TEXT NOT NULL,
  city TEXT NOT NULL,
  street TEXT NOT NULL,
  building TEXT,
  is_default BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ユーザーごとにデフォルトは1つだけ（部分ユニーク制約）
CREATE UNIQUE INDEX unique_default_address
  ON addresses (user_id) WHERE is_default = true;
```

**方法2: ユーザーテーブルに参照を持たせる方式**
```sql
ALTER TABLE users ADD COLUMN default_address_id UUID REFERENCES addresses(id);
```

方法1が推奨。部分ユニーク制約により、DBレベルで「デフォルトは1つだけ」を保証できます。方法2は循環参照になりやすいデメリットがあります。
</details>

**Q13.** `ON DELETE CASCADE` と `ON DELETE SET NULL` と `ON DELETE RESTRICT` の違いを説明し、それぞれ適切な使用場面を挙げてください。

<details><summary>回答</summary>

| 動作 | 親レコード削除時の振る舞い | 使用場面 |
|------|---------------------------|----------|
| **CASCADE** | 子レコードも一緒に削除 | ユーザー削除 → そのユーザーのカート内容も削除 |
| **SET NULL** | 子レコードの外部キーを NULL に設定 | 担当者削除 → 案件の担当者欄を空欄に |
| **RESTRICT** | 子レコードがあれば親の削除を拒否 | 商品削除 → 注文履歴がある商品は削除させない |

```sql
-- CASCADE: ユーザー削除時にカートも削除
CREATE TABLE cart_items (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- SET NULL: カテゴリ削除時に商品のカテゴリをNULLに
CREATE TABLE products (
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL
);

-- RESTRICT: 注文に含まれる商品は削除不可
CREATE TABLE order_items (
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT
);
```

デフォルト（未指定時）は `NO ACTION` で、RESTRICT とほぼ同じ（チェックのタイミングが異なる）。
</details>

**Q14.** PostgreSQLの `CHECK` 制約と `ENUM` 型、どちらを使うべきですか？トレードオフを議論してください。

<details><summary>回答</summary>

| 観点 | CHECK制約 | ENUM型 |
|------|-----------|--------|
| **値の追加** | ALTER TABLE不要（制約を再定義） | `ALTER TYPE ... ADD VALUE` が必要 |
| **値の削除** | 制約の付け替えで可能 | **ENUMから値を削除できない**（PostgreSQLの制限） |
| **型安全性** | TEXT型のまま（アプリ側で管理） | 独自の型として扱える |
| **マイグレーション** | 柔軟 | 厳格（変更が困難） |
| **可読性** | 制約定義を見ないとわからない | 型名で意図が伝わる |

**推奨: CHECK制約**（Supabase/PostgreSQL環境では特に）

理由:
- ENUM型は値の削除ができず、マイグレーションの柔軟性が大幅に低い
- TypeScriptの型生成でもTEXT + CHECK の方が扱いやすい
- アプリケーション側のユニオン型で型安全性を確保できる

```sql
-- CHECK制約（推奨）
status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'shipped'))

-- TypeScript側
type OrderStatus = 'pending' | 'paid' | 'shipped';
```
</details>

**Q15.** Supabaseで外部キーの関連先データを取得する際、N+1問題はどのように回避されていますか？

<details><summary>回答</summary>

Supabaseは内部的に**PostgREST**を使用しており、リレーションの取得を**単一のSQLクエリ（JOIN）**に変換します。

```typescript
// これは N+1 にならない
const { data } = await supabase
  .from("orders")
  .select(`
    id, total,
    order_items ( id, quantity, products ( name, price ) )
  `);
```

**PostgRESTが生成するSQL（イメージ）:**
```sql
SELECT o.id, o.total,
  COALESCE(
    json_agg(json_build_object(
      'id', oi.id, 'quantity', oi.quantity,
      'products', json_build_object('name', p.name, 'price', p.price)
    )),
    '[]'
  )
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN products p ON oi.product_id = p.id
GROUP BY o.id;
```

1リクエスト = 1 SQLクエリで完結するため、N+1問題は発生しません。

**注意:** ただしアプリケーション側でループ内に `.from().select()` を書くと、アプリレベルのN+1が発生するので注意が必要です。
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q16.** テーブル設計で「集約テーブル（サマリーテーブル）」を作る判断基準は何ですか？ECサイトの売上集計を例に説明してください。

<details><summary>回答</summary>

**集約テーブルとは:**
大量のトランザクションデータから事前に集計結果を保存しておくテーブル。

**判断基準:**
1. **クエリ頻度が高い** — ダッシュボードで毎回表示する売上合計
2. **計算コストが高い** — 数百万行のJOIN + GROUP BY + SUM
3. **リアルタイム性が不要** — 数分〜数時間の遅延が許容される
4. **データの変更頻度** — 過去データが不変（注文確定後は変わらない）

**ECサイトの例:**
```sql
-- 日次売上集約テーブル
CREATE TABLE daily_sales_summary (
  date DATE PRIMARY KEY,
  total_orders INTEGER NOT NULL,
  total_revenue INTEGER NOT NULL,
  avg_order_value INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 定期的にバッチ処理で更新
INSERT INTO daily_sales_summary (date, total_orders, total_revenue, avg_order_value)
SELECT
  DATE(created_at),
  COUNT(*),
  SUM(total),
  AVG(total)
FROM orders
WHERE status = 'paid'
GROUP BY DATE(created_at)
ON CONFLICT (date) DO UPDATE SET
  total_orders = EXCLUDED.total_orders,
  total_revenue = EXCLUDED.total_revenue,
  avg_order_value = EXCLUDED.avg_order_value,
  updated_at = now();
```

**トレードオフ:** データの鮮度 vs クエリ性能。PostgreSQLの `MATERIALIZED VIEW` を使えばテーブル管理の手間を減らせる。
</details>

**Q17.** Supabaseでマルチテナント設計をする場合、RLSベースのアプローチと、スキーマ分離のアプローチを比較してください。

<details><summary>回答</summary>

| 観点 | RLSベース | スキーマ分離 |
|------|-----------|-------------|
| **実装** | 全テーブルに `tenant_id` を追加し、RLSポリシーで制御 | テナントごとに別スキーマ（or 別DB） |
| **データ分離度** | 論理的分離（同一テーブルに共存） | 物理的分離（完全に別テーブル） |
| **スケーラビリティ** | テナント数に制限なし | テナント数 × テーブル数のスキーマが必要 |
| **マイグレーション** | 1回で全テナントに適用 | テナントごとに実行が必要 |
| **パフォーマンス** | 大量データでインデックス効率が低下しうる | テナントごとのデータが小さく高速 |
| **バックアップ/復元** | テナント単位の復元が困難 | テナント単位で容易 |

**Supabaseでの推奨: RLSベース**

理由:
- Supabaseの設計思想と合致（RLSファースト）
- マイグレーション・メンテナンスが圧倒的に楽
- 小〜中規模SaaSなら性能問題は発生しにくい
- `tenant_id` + インデックスで十分な性能

スキーマ分離は、法規制で物理的なデータ分離が求められる場合や、テナントごとにスキーマが異なる場合に検討。
</details>

**Q18.** データベース設計で「楽観的ロック」と「悲観的ロック」の違いを、ECサイトの在庫管理を例に説明してください。どちらを推奨しますか？

<details><summary>回答</summary>

**悲観的ロック:**
「競合が起きるだろう」と想定し、データを読み取る時点でロックする。
```sql
BEGIN;
SELECT stock FROM products WHERE id = 'xxx' FOR UPDATE;  -- ロック取得
-- 他のトランザクションはここで待たされる
UPDATE products SET stock = stock - 1 WHERE id = 'xxx';
COMMIT;  -- ロック解放
```

**楽観的ロック:**
「競合は稀だろう」と想定し、更新時にバージョン（`updated_at`）を確認する。
```sql
-- 読み取り時にバージョンを取得
SELECT stock, updated_at FROM products WHERE id = 'xxx';
-- → stock=10, updated_at='2024-01-01 12:00:00'

-- 更新時にバージョンが変わっていないか確認
UPDATE products
SET stock = stock - 1, updated_at = now()
WHERE id = 'xxx' AND updated_at = '2024-01-01 12:00:00';
-- → 0行更新の場合、他の人が先に変更した → リトライ or エラー
```

| 観点 | 悲観的ロック | 楽観的ロック |
|------|-------------|-------------|
| 競合頻度が高い場合 | 効率的（待つだけ） | リトライが多発 |
| 競合頻度が低い場合 | ロック取得のオーバーヘッド | 効率的 |
| デッドロック | リスクあり | リスクなし |
| スケーラビリティ | 低い（ロック待ち） | 高い |

**ECサイト推奨: 楽観的ロック。** 大半のユーザーは異なる商品を購入するため競合は稀。人気商品の在庫僅少時のみリトライが発生するが、全体のスループットは楽観的ロックが有利。
</details>

**Q19.** Supabaseで `storage` を使ったファイル（画像）管理のテーブル設計をしてください。商品画像を複数枚アップロードでき、表示順を管理でき、メイン画像を1枚指定できる要件です。

<details><summary>回答</summary>

```sql
CREATE TABLE product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,        -- Supabase Storage内のパス
  file_name TEXT NOT NULL,           -- 元のファイル名
  mime_type TEXT NOT NULL,           -- 'image/jpeg', 'image/png' 等
  file_size INTEGER NOT NULL,        -- バイト数
  display_order INTEGER NOT NULL DEFAULT 0,  -- 表示順
  is_primary BOOLEAN NOT NULL DEFAULT false, -- メイン画像フラグ
  alt_text TEXT DEFAULT '',          -- アクセシビリティ用の代替テキスト
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 商品ごとにメイン画像は1枚だけ
CREATE UNIQUE INDEX unique_primary_image
  ON product_images (product_id) WHERE is_primary = true;

-- 表示順での取得を高速化
CREATE INDEX idx_product_images_order
  ON product_images (product_id, display_order);

-- RLSポリシー
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- 誰でも閲覧可能（公開商品画像）
CREATE POLICY "product_images_select"
  ON product_images FOR SELECT USING (true);

-- 管理者のみ追加・更新・削除可能
CREATE POLICY "product_images_insert"
  ON product_images FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
```

**Supabase Storage側の設計:**
```
storage/
└── product-images/      ← バケット（公開設定）
    └── {product_id}/
        └── {uuid}.webp  ← 実ファイル
```

画像URLは `supabase.storage.from('product-images').getPublicUrl(storage_path)` で取得。
</details>

**Q20.** 本番環境のSupabaseデータベースで、安全にスキーマ変更をデプロイするためのベストプラクティスを5つ挙げてください。

<details><summary>回答</summary>

1. **ローカル開発環境で十分にテストする**
   ```bash
   supabase start         # ローカルDBを起動
   supabase db reset      # マイグレーションをクリーン適用
   supabase gen types typescript --local  # 型を再生成
   # アプリケーションの動作確認
   ```

2. **破壊的変更を避け、段階的にデプロイする**
   - カラム削除: 新カラム追加 → アプリ更新 → 旧カラム削除（最低2回のデプロイに分ける）
   - 型変更: 新カラムで置き換える方式に

3. **バックアップを取ってからデプロイする**
   ```bash
   # Supabaseダッシュボードからバックアップ作成
   # または pg_dump でローカルにバックアップ
   pg_dump -h <host> -U postgres -d postgres > backup_$(date +%Y%m%d).sql
   ```

4. **RLSポリシーを含めてテストする**
   - 新テーブルにRLSが有効か確認（デフォルト無効だと全データ公開）
   - anon key と service_role key の両方でアクセステスト
   - `supabase inspect db policies` でポリシー一覧を確認

5. **マイグレーションをコードレビューに含める**
   - `supabase/migrations/` ディレクトリをGit管理
   - PRにマイグレーションSQLを含め、レビューを受ける
   - CI/CDで `supabase db reset` を実行し、マイグレーションの整合性を自動検証
</details>
