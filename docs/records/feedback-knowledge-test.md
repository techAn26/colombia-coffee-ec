# フレームワークへのフィードバック: 理解度テスト問題

記録日: 2026-05-15

---

## 課題

「ただ作った」ではなく「理解して作った」ことを証明するには、理解度チェック（自己申告）だけでは不十分。客観的にテスト可能な問題が必要。

## 改善提案: 各Chapterの最後に理解度テストを追加

各Chapterの完了時に、以下2種類のテスト問題を出題する:

### 1. IT知識・開発の理解を問う問題（概念理解）

「なぜそうするのか」「どう動いているのか」を問う。

### 2. コーディングに関する理解を問う問題（実装理解）

「このコードは何をしているか」「どう書くか」を問う。

### 難易度4段階

| レベル | 対象者 | 期待される回答レベル |
|--------|--------|-------------------|
| 初級 | 完全初心者 | 基本用語の意味を説明できる |
| 中級 | 教材を完了した人 | 仕組みを自分の言葉で説明できる |
| 上級 | 実務応用レベル | エッジケースや代替案を議論できる |
| 玄人 | 深い理解 | 設計判断の根拠やトレードオフを語れる |

---

## フレームワークへの反映案

`development-framework.md` の「タスク進行テンプレート」に Step 7 を追加:

```
Step 1. 理解
Step 2. 判断
Step 3. 実装
Step 4. 確認
Step 5. 記録
Step 6. レビュー
Step 7. テスト ← NEW: 理解度テスト問題に回答し、知識を定着させる
```

各Chapterの `振り返り` セクションに「理解度テスト」を追加する。

---

## 具体例: Chapter 2（データベース）のテスト問題

### IT知識・開発の理解

**初級:**
- Q: データベースとは何ですか？一言で説明してください
- A: 情報を整理して保存する場所。Excelのスプレッドシートのようなもの

**中級:**
- Q: RLS（行レベルセキュリティ）がないと何が起きますか？具体例で説明してください
- A: Aさんのカートの中身がBさんに見えてしまう。注文履歴も全員のものが見えてしまう

**上級:**
- Q: order_itemsテーブルにproduct_nameやpriceを「スナップショット」として保存する理由を、具体的なシナリオで説明してください
- A: 商品の値上げ後も、注文時の価格が記録として残る必要がある。参照方式だと過去の注文金額が変わってしまう

**玄人:**
- Q: productsのRLSで `is_published = true OR is_admin()` としていますが、`is_admin()` をSECURITY DEFINERで定義している理由は何ですか？
- A: SECURITY DEFINERにしないと、RLSのポリシー評価中にprofilesテーブルのRLSも適用されてしまい、再帰的なRLSチェックが発生する可能性がある

### コーディングの理解

**初級:**
- Q: 以下のSQLは何をしますか？
  ```sql
  SELECT * FROM products WHERE is_published = true;
  ```
- A: 公開されている商品を全件取得する

**中級:**
- Q: 以下のコードで `revalidatePath("/products")` は何をしていますか？
  ```ts
  await supabase.from("products").update({...}).eq("id", productId);
  revalidatePath("/products");
  ```
- A: 商品データを更新した後、商品一覧ページのキャッシュを無効化して再描画させる

**上級:**
- Q: 以下のRLSポリシーが防いでいる攻撃を説明してください
  ```sql
  CREATE POLICY "profiles: users can update own profile (except role)"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
  ```
- A: ユーザーが自分のroleカラムを 'admin' に変更する権限昇格攻撃を防いでいる

**玄人:**
- Q: Stripe Webhookの処理でservice_role keyを使う理由と、そのセキュリティ上のリスクを説明してください。リスクを軽減するために実装すべき対策は何ですか？
- A: ordersのINSERTにRLSポリシーがないため、anon keyでは挿入できない。service_role keyはRLSをバイパスするが、漏洩すると全データにアクセスされる。対策: Webhook署名検証（実装済み）、service_role keyの環境変数管理、Webhookエンドポイントのレート制限

---

## 次回のプロジェクトで試すこと

- 各Chapter完了時に4段階の理解度テストを出題
- ユーザーが回答し、自己採点する
- 間違えた問題はAIと壁打ちして理解を深める
- 回答と採点結果をChapter記録に残す
