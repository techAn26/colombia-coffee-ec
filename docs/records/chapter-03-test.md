# Chapter 3: ログインを作ろう — 理解度テスト

> OAuth、認証、セッション、認証ガード、ミドルウェア(proxy)

---

## IT知識・概念理解

### 初級（絶対に抑えてほしい基礎知識）

**Q1.** 「認証（Authentication）」と「認可（Authorization）」の違いを説明してください。

<details><summary>回答</summary>

- **認証（Authentication）** — 「あなたは誰ですか？」を確認する。ユーザーの身元を証明するプロセス（例: ログイン）
- **認可（Authorization）** — 「あなたは何ができますか？」を確認する。認証済みユーザーにどの操作を許可するかの制御（例: 管理者だけが商品を編集できる）

順序: 認証 → 認可（まず誰かを確認してから、何を許可するか判断する）
</details>

**Q2.** OAuthとは何ですか？なぜパスワードを直接扱わずにOAuthを使うのですか？

<details><summary>回答</summary>

OAuthは、第三者のサービス（Google、GitHubなど）に**ユーザー認証を委託**する仕組みです。

パスワードを直接扱わない理由:
1. **セキュリティリスクの軽減** — パスワードを保存しないため、漏洩リスクがない
2. **ユーザーの利便性** — 新規アカウント作成が不要、ワンクリックでログイン
3. **パスワード管理の負担軽減** — ハッシュ化、リセット機能、強度チェックなどの実装が不要
4. **信頼性** — GoogleやGitHubのセキュリティ基盤を利用できる
</details>

**Q3.** セッションとは何ですか？HTTPがステートレスであることと、どう関係しますか？

<details><summary>回答</summary>

セッションは、ユーザーのログイン状態を**リクエスト間で維持する**仕組みです。

HTTPはステートレス（各リクエストが独立、前のリクエストの情報を覚えていない）なので、そのままでは「ログイン済みかどうか」を判別できません。

セッションの仕組み:
1. ログイン成功時にサーバーが**セッションID**（またはトークン）を発行
2. ブラウザがCookieにセッションIDを保存
3. 以降のリクエストで自動的にCookieが送信される
4. サーバーがセッションIDを検証し、ユーザーを識別する
</details>

**Q4.** Cookieとは何ですか？ブラウザの `localStorage` と何が違いますか？

<details><summary>回答</summary>

| 項目 | Cookie | localStorage |
|------|--------|-------------|
| **サーバー送信** | 自動でHTTPリクエストに付与 | 送信されない（JS手動） |
| **容量** | 約4KB | 約5〜10MB |
| **有効期限** | 設定可能（`Expires`/`Max-Age`） | 永続（手動削除まで） |
| **セキュリティ** | `HttpOnly`, `Secure`, `SameSite` 属性 | JSから常にアクセス可能 |
| **用途** | セッション管理、認証トークン | UIの状態保存、キャッシュ |

認証トークンは**Cookie（HttpOnly設定）**に保存すべきです。`localStorage` に保存するとXSS攻撃でトークンを盗まれるリスクがあります。
</details>

**Q5.** JWTとは何ですか？3つの構成要素を説明してください。

<details><summary>回答</summary>

JWT（JSON Web Token）は、ユーザー情報を**署名付きのJSONデータ**として表現するトークン形式です。

3つの構成要素（`.`で区切られる）:

1. **Header（ヘッダー）** — アルゴリズム情報（例: HS256）とトークンの種類
2. **Payload（ペイロード）** — ユーザー情報（ユーザーID、有効期限など）。Base64エンコードされているだけで**暗号化されていない**
3. **Signature（署名）** — Header + Payload + 秘密鍵 からの署名。改ざん検知用

```
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMjMifQ.XXXXX
|--- Header ---|.|----- Payload ------|.|- Sig -|
```

重要: JWTのPayloadは**誰でも読める**（Base64デコードするだけ）。機密情報は入れない。
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q6.** OAuth 2.0の認証フロー（Authorization Code Flow）を、ユーザー・アプリ・認証プロバイダの3者間の流れで説明してください。

<details><summary>回答</summary>

1. **ユーザー** がアプリの「Googleでログイン」ボタンをクリック
2. **アプリ** がユーザーを**Googleの認証画面**にリダイレクト（client_id、redirect_uri付き）
3. **ユーザー** がGoogleでログインし、アプリへの権限を許可
4. **Google** が `authorization_code` をアプリの `redirect_uri` に返す
5. **アプリのサーバー** が `authorization_code` + `client_secret` をGoogleに送信
6. **Google** が `access_token`（+ `refresh_token`）を返す
7. **アプリ** が `access_token` でGoogleのAPIからユーザー情報を取得
8. **アプリ** がユーザー情報を元にセッションを作成し、ログイン完了

ポイント: `client_secret` はサーバー間通信でのみ使い、ブラウザには露出しません。
</details>

**Q7.** Supabase Authの認証フローにおいて、`access_token` と `refresh_token` の役割の違いを説明してください。

<details><summary>回答</summary>

| | access_token | refresh_token |
|---|---|---|
| **目的** | APIリクエストの認証 | access_tokenの更新 |
| **有効期限** | 短い（デフォルト1時間） | 長い（デフォルト7日間等） |
| **含まれる情報** | ユーザーID、メール、ロール等 | トークン更新用の識別子のみ |
| **送信先** | 毎リクエストでSupabaseに送信 | access_token失効時のみ使用 |

**フロー:**
1. ログイン → `access_token` + `refresh_token` を取得
2. 通常のAPI呼び出しは `access_token` で認証
3. `access_token` が期限切れ → `refresh_token` で新しい `access_token` を取得
4. `refresh_token` も期限切れ → 再ログインが必要

短い有効期限の `access_token` を使うことで、トークン漏洩時の被害を最小化します。
</details>

**Q8.** Next.jsのミドルウェア（`middleware.ts`）とは何ですか？認証における役割を説明してください。

<details><summary>回答</summary>

Next.jsのミドルウェアは、**リクエストがページ/APIに到達する前に実行される関数**です。プロジェクトルートの `middleware.ts` に定義します。

認証における役割:
1. **認証ガード** — 未ログインユーザーを保護ページからログインページにリダイレクト
2. **セッション更新** — `access_token` の有効期限チェックと自動更新
3. **ルーティング制御** — ログイン済みユーザーがログインページにアクセスしたらダッシュボードにリダイレクト

**特徴:**
- Edge Runtimeで実行（高速だがNode.js APIの一部が使えない）
- `matcher` で対象パスを限定できる
- レスポンスの書き換え、リダイレクト、ヘッダー追加が可能
</details>

**Q9.** CSRF（Cross-Site Request Forgery）攻撃とは何ですか？認証済みユーザーがなぜ狙われるのですか？

<details><summary>回答</summary>

CSRF攻撃は、**認証済みユーザーのブラウザに、意図しないリクエストを送信させる**攻撃です。

**攻撃の流れ:**
1. ユーザーがECサイトにログイン済み（Cookieにセッションあり）
2. 攻撃者が罠サイトにユーザーを誘導
3. 罠サイトがECサイトへのリクエスト（例: 商品購入）を自動送信
4. ブラウザがCookieを自動付与 → ECサイトは正規リクエストと判断して処理

**なぜ認証済みユーザーが狙われるか:**
CookieがリクエストのOriginに関係なく自動送信されるため、認証が必要な操作を第三者サイトから実行できてしまう。

**対策:**
- `SameSite=Strict` / `Lax` Cookie属性
- CSRFトークンの検証
- `Origin` / `Referer` ヘッダーの検証
</details>

**Q10.** 「プロキシ（Proxy）」とは何ですか？Next.jsの `rewrites` でプロキシを設定する目的を説明してください。

<details><summary>回答</summary>

プロキシは、クライアントとサーバーの**間に立って通信を中継する**仕組みです。

Next.jsの `rewrites` でプロキシを設定する目的:

1. **CORS回避** — ブラウザから外部APIに直接リクエストするとCORSエラーになる場合、Next.jsサーバー経由で中継
2. **APIキーの隠蔽** — サーバー側でAPIキーを付与してから外部APIに転送
3. **URL統一** — フロントとAPIで異なるドメインでも、ユーザーから見ると同一ドメインに見せる

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/external/:path*",
        destination: "https://external-api.com/:path*",
      },
    ];
  },
};
```

ブラウザからは `/api/external/users` にアクセス → Next.jsサーバーが `https://external-api.com/users` に中継します。
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q11.** Supabase Authで、メール/パスワード認証とOAuth（Google）認証の両方を提供する場合、同じメールアドレスで異なる認証方法を使ったときに何が起きますか？

<details><summary>回答</summary>

Supabaseでは、デフォルトで**同じメールアドレスのアカウントは自動リンク**されます。

**シナリオ:**
1. ユーザーが `tanaka@gmail.com` でメール/パスワード登録
2. 同じ `tanaka@gmail.com` でGoogleログインを試みる

**デフォルト動作（Auto Linking有効時）:**
- 同一ユーザーとして扱い、Googleプロバイダーが追加される
- ユーザーは両方の方法でログイン可能

**リスク:**
- 攻撃者がメール認証で先にアカウントを作成 → 本来のGoogleユーザーがログインすると攻撃者のアカウントにリンクされる可能性（アカウント乗っ取り）

**対策:**
- メール確認（email verification）を必須にする
- Auto Linkingを無効にし、手動でアカウント紐付けする
- Supabaseの設定: `GOTRUE_MAILER_AUTOCONFIRM=false`
</details>

**Q12.** Next.jsのミドルウェアで認証チェックを行う場合と、各ページのServer Component内で認証チェックを行う場合の違いは何ですか？

<details><summary>回答</summary>

| 観点 | ミドルウェア | Server Component |
|------|-------------|-----------------|
| **実行タイミング** | リクエスト到達前（Edge） | ページレンダリング時（Node.js） |
| **パフォーマンス** | ページのレンダリング前に弾けるため高速 | ページ処理後にリダイレクトするため遅い |
| **粒度** | パスパターンで一括制御 | ページごとに個別制御 |
| **データアクセス** | DB直接アクセス不可（Edge制限） | DB/外部APIアクセス可 |
| **エラー表示** | リダイレクトのみ | カスタムエラーUI表示可能 |

**推奨アプローチ:**
- **ミドルウェア**: セッションの存在チェック、トークンリフレッシュ、大まかなルート保護
- **Server Component**: 詳細な権限チェック（「この注文の所有者か？」「管理者か？」）

両方を組み合わせるのがベスト。ミドルウェアで粗く、Server Componentで細かくチェック。
</details>

**Q13.** `HttpOnly` Cookie と `Secure` Cookie と `SameSite` Cookie の違いを説明し、認証トークンに最適な設定を述べてください。

<details><summary>回答</summary>

| 属性 | 効果 |
|------|------|
| **HttpOnly** | JavaScriptからのアクセスを禁止（XSS対策） |
| **Secure** | HTTPS通信でのみCookieを送信（盗聴防止） |
| **SameSite=Strict** | 同一サイトからのリクエストのみCookieを送信（CSRF対策・最厳格） |
| **SameSite=Lax** | トップレベルナビゲーション（リンククリック）は許可、POSTは拒否（CSRF対策・推奨） |
| **SameSite=None** | 全てのクロスサイトリクエストで送信（Secureが必須） |

**認証トークンの最適な設定:**
```
Set-Cookie: session=xxx;
  HttpOnly;        ← XSSでの窃取防止
  Secure;          ← HTTPS必須
  SameSite=Lax;    ← CSRF防止（OAuthリダイレクトと互換）
  Path=/;          ← 全パスで有効
  Max-Age=604800;  ← 7日間
```

`SameSite=Strict` ではなく `Lax` を選ぶ理由: OAuth認証のリダイレクト時にCookieが送信されないと、ログインフローが壊れるため。
</details>

**Q14.** ロールベースアクセス制御（RBAC）とは何ですか？ECサイトでの具体的なロール設計例を示してください。

<details><summary>回答</summary>

RBACは、ユーザーに**ロール（役割）**を割り当て、ロール単位でアクセス権限を管理する方式です。

**ECサイトのロール設計例:**

| ロール | 権限 |
|--------|------|
| **guest** | 商品閲覧、検索 |
| **customer** | guest + カート操作、購入、注文履歴閲覧、プロフィール編集 |
| **admin** | customer + 商品CRUD、注文管理、ユーザー管理、売上閲覧 |
| **super_admin** | admin + ロール変更、システム設定、データ削除 |

**Supabase/PostgreSQLでの実装:**
```sql
-- ユーザーテーブルにロールカラム
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'customer'
  CHECK (role IN ('guest', 'customer', 'admin', 'super_admin'));

-- RLSポリシーでロールチェック
CREATE POLICY "admin_manage_products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );
```
</details>

**Q15.** セッションハイジャック攻撃とは何ですか？どのような対策がありますか？

<details><summary>回答</summary>

セッションハイジャックは、**他人のセッションIDを盗んでなりすます**攻撃です。

**攻撃手法:**
1. **XSS（Cross-Site Scripting）** — 悪意あるJSでCookieを読み取る
2. **中間者攻撃（MITM）** — 暗号化されていない通信でCookieを盗聴
3. **セッション固定攻撃** — 攻撃者が事前に用意したセッションIDをユーザーに使わせる

**対策:**
| 対策 | 効果 |
|------|------|
| `HttpOnly` Cookie | XSSでのCookie窃取を防止 |
| `Secure` Cookie | HTTPS強制で盗聴防止 |
| セッションID再生成 | ログイン成功時にID更新（固定攻撃対策） |
| 有効期限の短縮 | 盗まれても利用可能時間が限定的 |
| IPアドレス/UAの検証 | 異なる環境からのアクセスを検知 |
| CSP（Content Security Policy）ヘッダー | XSS攻撃のリスク軽減 |
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q16.** JWTベースの認証とセッションベース（サーバーサイドセッション）の認証のトレードオフを詳しく比較してください。Supabaseがなぜ JWTを採用しているか推測してください。

<details><summary>回答</summary>

| 観点 | JWT | サーバーサイドセッション |
|------|-----|------------------------|
| **状態管理** | ステートレス（サーバーに保存不要） | ステートフル（サーバーにセッション保存） |
| **スケーラビリティ** | サーバー間でセッション共有不要 | Redis等でセッション共有が必要 |
| **即時無効化** | 困難（有効期限まで有効） | 容易（サーバー側で削除） |
| **データサイズ** | ペイロードが大きいとCookieサイズ増加 | セッションIDのみ（小さい） |
| **DB負荷** | 検証時にDB問い合わせ不要 | 毎リクエストでDB参照 |

**SupabaseがJWTを採用する理由の推測:**
1. **RLSとの統合** — JWT内の `auth.uid()` をPostgreSQLのRLSポリシーで直接参照できる
2. **エッジ対応** — Edge FunctionsやCDNでもDBなしで検証可能
3. **マイクロサービス連携** — 複数サービスがJWTを独立検証できる
4. **BaaSの設計思想** — サーバーレスアーキテクチャではステートレスが理想

JWTの弱点（即時無効化不可）は、短い有効期限 + refresh_tokenで緩和しています。
</details>

**Q17.** OAuth認証でよくある「アカウント乗っ取り」の攻撃パターンを2つ挙げ、それぞれの対策を説明してください。

<details><summary>回答</summary>

**パターン1: メールベースのアカウント乗っ取り**
- 攻撃: 攻撃者が被害者のメールアドレスで**メール/パスワード認証**のアカウントを先に作成
- 被害者がGoogleログインすると、攻撃者が作ったアカウントに自動リンクされる
- 攻撃者はメール/パスワードでログインし、被害者のデータにアクセス

対策:
- メール確認を必須にする（未確認アカウントは自動リンクしない）
- Auto Linkingを無効にする
- ログイン方法の変更時に既存セッションを全て無効化

**パターン2: OAuthの`state`パラメータ欠落によるCSRF**
- 攻撃: 攻撃者が自分のOAuth認可コードをリダイレクトURLに仕込む
- 被害者がそのURLにアクセスすると、攻撃者のアカウントでログインしてしまう
- 被害者が入力した個人情報が攻撃者のアカウントに紐づく

対策:
- OAuthフローで `state` パラメータ（ランダムトークン）を使い、リクエストの正当性を検証
- PKCE（Proof Key for Code Exchange）を使用（SPAでは必須）
- Supabase Authはこれらを内部的に処理してくれる
</details>

**Q18.** Next.jsのミドルウェアでSupabaseのセッションリフレッシュを行う設計について、なぜこれが重要なのか、やらないとどうなるかを説明してください。

<details><summary>回答</summary>

**なぜ重要か:**
Supabaseの `access_token` は有効期限が短い（デフォルト1時間）。ミドルウェアでリフレッシュしないと:

1. **ユーザーが突然ログアウトする** — 1時間操作を続けると期限切れでAPIが401エラー
2. **Server Componentでセッション取得不可** — `supabase.auth.getUser()` が失敗する
3. **RLSが機能しない** — 期限切れトークンでは `auth.uid()` が取得できず、全データが返らない

**ミドルウェアでの処理内容:**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient(/* cookies設定 */);

  // これがaccess_tokenの自動リフレッシュを行う
  await supabase.auth.getUser();

  return response;
}
```

**仕組み:**
- `getUser()` が内部で `access_token` の有効期限をチェック
- 期限切れなら `refresh_token` で新しい `access_token` を取得
- 新しいトークンをCookieにセットしてレスポンスに含める
- この処理がページのレンダリング**前**に行われるため、Server Componentは常に有効なセッションを使える
</details>

**Q19.** マルチファクター認証（MFA/2FA）の実装方式（TOTP、SMS、WebAuthn）を比較し、それぞれのセキュリティレベルと実装コストを評価してください。

<details><summary>回答</summary>

| 方式 | セキュリティ | 実装コスト | ユーザー体験 |
|------|-------------|-----------|-------------|
| **TOTP（Google Authenticator等）** | 高い | 低い | アプリのインストールが必要 |
| **SMS** | 中程度 | 中程度（SMS API費用） | 誰でも使えるが遅い |
| **WebAuthn（生体認証/セキュリティキー）** | 最高 | 高い | シームレス（指紋など） |

**詳細比較:**

**TOTP:**
- 30秒ごとにワンタイムパスワードを生成
- オフラインで動作。通信不要
- SIMスワップ攻撃に強い
- Supabase Authが標準サポート

**SMS:**
- SIMスワップ攻撃に脆弱（NIST非推奨）
- 国際SMS配信の信頼性が低い
- 最も馴染みがある方式
- Twilioなどの外部サービス必要

**WebAuthn/FIDO2:**
- フィッシング耐性が最も高い（ドメインバインド）
- デバイス依存（紛失リスク）
- ブラウザ対応が必要
- 実装が最も複雑

**推奨:** TOTPをベースに導入し、将来的にWebAuthnを追加。SMSは避けるか補助的な位置づけに。
</details>

**Q20.** 認証機能を「自作する」場合と「Supabase Auth等のマネージドサービスを使う」場合のトレードオフを議論してください。自作が正当化されるケースはありますか？

<details><summary>回答</summary>

| 観点 | 自作 | マネージドサービス |
|------|------|-------------------|
| **開発速度** | 数週間〜数ヶ月 | 数時間〜数日 |
| **セキュリティ** | 脆弱性を自分で発見・修正 | 専門チームが継続的に対応 |
| **カスタマイズ性** | 完全自由 | サービスの仕様に制約 |
| **保守コスト** | 永続的に自己責任 | サービス側が更新 |
| **コンプライアンス** | 自分で証明が必要 | SOC2等の認証取得済み |
| **ベンダーロック** | なし | あり（移行コスト） |

**自作が正当化されるケース:**
1. **特殊な認証要件** — 独自のMFA方式、特定の企業内認証基盤との統合
2. **法規制による制約** — データを特定のリージョン/オンプレミスに保持する必要がある
3. **超大規模** — 数億ユーザーでマネージドサービスのコスト/性能限界を超える場合

**現実的な結論:**
小〜中規模プロジェクトで認証を自作する正当な理由はほぼない。セキュリティの専門知識がない状態で自作すると、パスワードの平文保存、SQLインジェクション、タイミング攻撃など重大な脆弱性を生みやすい。
</details>

---

## コーディング・操作理解

### 初級（絶対に抑えてほしい基礎知識）

**Q1.** Supabase Authでメール/パスワードによるサインアップのコードを書いてください。

<details><summary>回答</summary>

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "securePassword123",
});

if (error) {
  console.error("サインアップエラー:", error.message);
} else {
  console.log("ユーザー作成:", data.user);
  // メール確認が必要な場合、確認メールが送信される
}
```
</details>

**Q2.** Supabase AuthでGoogleログインを開始するコードを書いてください。

<details><summary>回答</summary>

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});

if (error) {
  console.error("OAuthエラー:", error.message);
}
// 成功するとGoogleの認証画面にリダイレクトされる
```

`redirectTo` はGoogleの認証後に戻ってくるURLです。Supabaseダッシュボードの「Redirect URLs」にも同じURLを登録する必要があります。
</details>

**Q3.** 現在ログイン中のユーザー情報を取得するコードを書いてください。

<details><summary>回答</summary>

```typescript
// サーバーサイド（推奨）
const { data: { user }, error } = await supabase.auth.getUser();

if (user) {
  console.log("ユーザーID:", user.id);
  console.log("メール:", user.email);
} else {
  console.log("未ログイン");
}

// クライアントサイド（セッションから取得、検証なし）
const { data: { session } } = await supabase.auth.getSession();
console.log(session?.user);
```

**`getUser()` vs `getSession()`:**
- `getUser()` — サーバーに問い合わせてJWTを検証する（セキュア）
- `getSession()` — ローカルのセッション情報を返す（高速だが未検証）

認可判断には `getUser()` を使うべきです。
</details>

**Q4.** ログアウト処理のコードを書いてください。

<details><summary>回答</summary>

```typescript
const { error } = await supabase.auth.signOut();

if (error) {
  console.error("ログアウトエラー:", error.message);
} else {
  console.log("ログアウト成功");
  // ログインページにリダイレクト
  window.location.href = "/login";
}
```

`signOut()` は:
- ローカルのセッション（Cookie/ストレージ）を削除
- サーバーの `refresh_token` を無効化
- 以降のAPIリクエストは認証なし扱いになる
</details>

**Q5.** 以下のNext.jsのページコンポーネントに、「未ログインならログインページにリダイレクト」する処理を追加してください。

```typescript
// app/dashboard/page.tsx
export default function DashboardPage() {
  return <h1>ダッシュボード</h1>;
}
```

<details><summary>回答</summary>

```typescript
// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <h1>ダッシュボード</h1>;
}
```

Server Componentなので `async` を使い、サーバーサイドで認証チェックを行います。`redirect()` はサーバーサイドリダイレクトです。
</details>

### 中級（仕組みを自分の言葉で説明できるレベル）

**Q6.** Next.jsの `middleware.ts` でSupabaseのセッションリフレッシュを行うコードを書いてください。

<details><summary>回答</summary>

```typescript
// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // セッションリフレッシュ（重要）
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

ポイント: `getUser()` を呼ぶことで、期限切れの `access_token` が自動的にリフレッシュされ、新しいCookieがレスポンスにセットされます。
</details>

**Q7.** OAuthのコールバック処理（`/auth/callback`）で `code` を `session` に交換するコードを書いてください。

<details><summary>回答</summary>

```typescript
// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // エラー時はログインページにリダイレクト
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
```

**フロー:**
1. Google認証完了 → `/auth/callback?code=xxx` にリダイレクト
2. `exchangeCodeForSession(code)` で認可コードをセッションに交換
3. Supabaseが `access_token` + `refresh_token` をCookieに保存
4. ダッシュボード等にリダイレクト
</details>

**Q8.** 認証状態によって表示を切り替えるクライアントコンポーネントを書いてください（ログイン中: ユーザー名+ログアウトボタン、未ログイン: ログインリンク）。

<details><summary>回答</summary>

```typescript
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <span>読み込み中...</span>;

  if (user) {
    return (
      <div>
        <span>{user.email}</span>
        <button onClick={() => supabase.auth.signOut()}>
          ログアウト
        </button>
      </div>
    );
  }

  return <a href="/login">ログイン</a>;
}
```

`onAuthStateChange` を使うことで、他のタブでのログイン/ログアウトもリアルタイムで反映されます。
</details>

**Q9.** 環境変数を安全に管理するために、`.env.local` ファイルに何を書き、何を書いてはいけないかを示してください。

<details><summary>回答</summary>

```bash
# .env.local

# ✅ クライアントに公開しても安全な値（NEXT_PUBLIC_ プレフィックス）
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# ✅ サーバーサイドのみで使用する値（プレフィックスなし）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ❌ 絶対に書いてはいけないもの（直接コードに書くのも禁止）
# DATABASE_URL=postgresql://postgres:パスワード@直接DB接続情報
# GOOGLE_CLIENT_SECRET=... ← これはSupabaseダッシュボードに設定
```

**ルール:**
- `NEXT_PUBLIC_` → ブラウザに露出する。公開情報のみ
- プレフィックスなし → サーバーサイドのみ。機密情報はこちら
- `.env.local` は `.gitignore` に含める
- `.env.example` にキー名（値なし）を作成し、Git管理する
</details>

**Q10.** Supabaseのサーバーサイドクライアントを作成するユーティリティ関数を書いてください（Next.js App Router用）。

<details><summary>回答</summary>

```typescript
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component から呼ばれた場合、
            // Cookie の書き込みはできないが読み取りは可能
          }
        },
      },
    }
  );
}
```

**使い方:**
```typescript
// Server Component内
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
```
</details>

### 上級（エッジケースや代替案を議論できるレベル）

**Q11.** 認証ガードを再利用可能な高階コンポーネント（HOCまたはラッパーコンポーネント）として実装してください。

<details><summary>回答</summary>

```typescript
// components/auth-guard.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = {
  children: React.ReactNode;
  requiredRole?: string;
  fallbackUrl?: string;
};

export async function AuthGuard({
  children,
  requiredRole,
  fallbackUrl = "/login",
}: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(fallbackUrl);
  }

  // ロールチェック（オプション）
  if (requiredRole) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== requiredRole) {
      redirect("/unauthorized");
    }
  }

  return <>{children}</>;
}
```

**使い方:**
```typescript
// app/admin/page.tsx
export default function AdminPage() {
  return (
    <AuthGuard requiredRole="admin" fallbackUrl="/login">
      <h1>管理画面</h1>
    </AuthGuard>
  );
}
```

Server Componentとして動作するため、クライアントにJSを送信せず、セキュアに認証チェックできます。
</details>

**Q12.** Next.jsのミドルウェアで、パスごとに異なる認証ルールを適用するコードを書いてください（公開ページ、認証必須ページ、管理者専用ページ）。

<details><summary>回答</summary>

```typescript
// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/products"];
const ADMIN_PATHS = ["/admin"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // 公開ページはスルー
  if (PUBLIC_PATHS.some(p => path === p || path.startsWith(p + "/"))) {
    return response;
  }

  // 未ログインは全てログインページへ
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  // 管理者ページのチェック
  if (ADMIN_PATHS.some(p => path.startsWith(p))) {
    // JWT claims からロールを取得（DB問い合わせ不要）
    const role = user.app_metadata?.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return response;
}
```
</details>

**Q13.** Supabase Authのメール認証で、メール確認リンクのカスタマイズ方法と、確認後のリダイレクト処理を実装してください。

<details><summary>回答</summary>

**1. Supabaseダッシュボードでメールテンプレートを設定:**
```html
<!-- Authentication > Email Templates > Confirm signup -->
<h2>メールアドレスの確認</h2>
<p>以下のリンクをクリックして、メールアドレスを確認してください。</p>
<a href="{{ .ConfirmationURL }}">メールアドレスを確認する</a>
```

**2. Redirect URLsに確認後のURLを登録:**
Supabaseダッシュボード → Authentication → URL Configuration
- `http://localhost:3000/auth/callback`
- `https://yourdomain.com/auth/callback`

**3. コールバック処理の実装:**
```typescript
// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // "signup", "recovery" 等

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 確認の種類に応じてリダイレクト先を変える
      switch (type) {
        case "signup":
          return NextResponse.redirect(`${origin}/welcome`);
        case "recovery":
          return NextResponse.redirect(`${origin}/reset-password`);
        default:
          return NextResponse.redirect(`${origin}/`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_code`);
}
```
</details>

**Q14.** パスワードリセット機能の全フローを実装してください（リクエスト送信 → メール受信 → 新パスワード設定）。

<details><summary>回答</summary>

```typescript
// 1. リセットメール送信（ログインページ）
// app/login/page.tsx の一部
async function handlePasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
  });

  if (error) {
    alert("エラー: " + error.message);
  } else {
    alert("パスワードリセットメールを送信しました");
  }
}
```

```typescript
// 2. コールバック処理（既にQ13で実装済み）
// /auth/callback が type=recovery を受け取り /reset-password にリダイレクト
```

```typescript
// 3. 新パスワード設定ページ
// app/reset-password/page.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage("エラー: " + error.message);
    } else {
      setMessage("パスワードを更新しました");
      router.push("/login");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="新しいパスワード"
        minLength={8}
        required
      />
      <button type="submit">パスワードを更新</button>
      {message && <p>{message}</p>}
    </form>
  );
}
```

**セキュリティ上の注意:**
- パスワード強度バリデーションを追加（最低8文字、英数字混在など）
- リセットリンクは一度使用したら無効にする（Supabaseが自動対応）
- リセットメールの送信レート制限を設定する
</details>

**Q15.** ログインフォームにバリデーションとエラーハンドリングを含めた完全な実装を書いてください。

<details><summary>回答</summary>

```typescript
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type FormErrors = {
  email?: string;
  password?: string;
  general?: string;
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = "メールアドレスを入力してください";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }

    if (!password) {
      newErrors.password = "パスワードを入力してください";
    } else if (password.length < 8) {
      newErrors.password = "パスワードは8文字以上です";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setErrors({ general: "メールアドレスまたはパスワードが正しくありません" });
      } else if (error.message.includes("Email not confirmed")) {
        setErrors({ general: "メールアドレスの確認が完了していません" });
      } else {
        setErrors({ general: "ログインに失敗しました。時間をおいて再度お試しください" });
      }
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.general && (
        <div role="alert">{errors.general}</div>
      )}

      <div>
        <label htmlFor="email">メールアドレス</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && <p id="email-error">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password">パスワード</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password && <p id="password-error">{errors.password}</p>}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
}
```
</details>

### 玄人（設計判断の根拠やトレードオフ）

**Q16.** Supabase AuthのJWTにカスタムクレーム（ユーザーのrole等）を含める方法と、その設計上のトレードオフを説明してください。

<details><summary>回答</summary>

**カスタムクレームの追加方法（PostgreSQL関数を使用）:**
```sql
-- カスタムクレームをJWTに追加するフック関数
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- ユーザーのロールを取得
  SELECT role INTO user_role FROM public.users WHERE id = (event->>'user_id')::uuid;

  -- クレームにロールを追加
  claims := event->'claims';
  claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$$;
```

**メリット:**
- ミドルウェアやRLSでDBクエリなしにロール判定できる（高速）
- Edge Runtimeでもロール情報が利用可能

**トレードオフ:**
1. **即時反映されない** — ロール変更後、JWTが更新されるまで旧ロールのまま（最大1時間）
2. **JWTサイズ増加** — クレームが増えるとCookieサイズが増加
3. **セキュリティリスク** — クライアントが受け取ったJWTのペイロードは改ざんできないが**閲覧可能**

**対策:**
- 重要な権限チェックはJWTクレームに加えてDB確認も行う（二重チェック）
- ロール変更後にセッションを強制リフレッシュする仕組みを入れる
- JWTに含めるのは最小限の情報に留める
</details>

**Q17.** `middleware.ts` でのセッション検証と、API Route（`route.ts`）での検証を両方行うべき理由を、多層防御の観点から説明してください。

<details><summary>回答</summary>

**多層防御（Defense in Depth）の原則:**
単一の防御層が突破されても、他の層で防ぐ。

**各層の役割:**

| 層 | 場所 | 目的 | 検出する脅威 |
|----|------|------|-------------|
| 第1層 | middleware.ts | セッションの存在確認・リフレッシュ | 未認証アクセスの早期排除 |
| 第2層 | Server Component | ユーザー情報取得・権限チェック | 権限不足のアクセス |
| 第3層 | API Route (route.ts) | リクエストごとの認証・認可検証 | 直接APIアクセス（curl等） |
| 第4層 | RLS (PostgreSQL) | 行レベルのアクセス制御 | アプリケーションのバグ |

**なぜ両方必要か:**

```
ミドルウェアだけの場合の脆弱性:
- APIエンドポイントにcurlで直接アクセスされた場合
- ミドルウェアのmatcherパターンの設定漏れ
- ミドルウェアのロジックバグ

API Routeだけの場合の問題:
- 未認証リクエストでもページのレンダリングが走る（無駄）
- セッションリフレッシュが行われない
- ユーザーにエラーページが表示される（UX悪化）
```

**結論:** ミドルウェアでUXと基本的なガードを、API Route/RLSでセキュリティの最終防衛を担う。
</details>

**Q18.** 本番環境でのOAuth設定で忘れがちな設定項目を5つ挙げ、それぞれを忘れた場合の影響を説明してください。

<details><summary>回答</summary>

| 設定項目 | 忘れた場合の影響 |
|----------|-----------------|
| **1. Redirect URLsに本番URLを追加** | OAuth認証完了後に「redirect_uri_mismatch」エラーでログインできない |
| **2. Google Cloud ConsoleでOAuthの本番ドメインを登録** | Googleログインボタンが動かない、または「未確認アプリ」警告が出る |
| **3. Site URL を本番URLに変更** | パスワードリセットメールやメール確認リンクがlocalhostを指す |
| **4. Cookie のSecure属性とSameSite設定** | HTTPではCookieが送信されない、またはCross-Site問題でセッション維持不可 |
| **5. Googleの OAuth同意画面の本番公開申請** | テストユーザー以外がGoogleログインを使えない（100ユーザー制限） |

**追加で注意すべき項目:**
- `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が本番値になっているか
- カスタムドメイン使用時のDNS設定
- レート制限の設定（認証エンドポイントへのブルートフォース対策）
</details>

**Q19.** 認証のエラーハンドリングで、セキュリティとユーザー体験のバランスをどう取るべきですか？具体例を挙げて説明してください。

<details><summary>回答</summary>

**原則:** エラーメッセージは「ユーザーの次のアクション」を示すが、「攻撃者に有用な情報」は隠す。

**具体例:**

| シナリオ | NG（情報漏洩） | OK（安全+親切） |
|----------|---------------|----------------|
| メール未登録 | 「このメールアドレスは登録されていません」 | 「メールアドレスまたはパスワードが正しくありません」 |
| パスワード間違い | 「パスワードが間違っています」 | 同上（メール/PW のどちらが間違いか教えない） |
| アカウントロック | 「5回間違えたためロックしました」 | 「しばらく時間をおいて再度お試しください」 |
| OAuth失敗 | 「Googleアカウントが見つかりません」 | 「ログインに失敗しました。別の方法をお試しください」 |

**なぜNGか:**
- 「未登録」とわかると → メールアドレスの存在確認に使える（列挙攻撃）
- 「PW間違い」とわかると → メールアドレスは正しいと確定、PW総当たりに集中

**サインアップ時の特殊ケース:**
「このメールアドレスは既に使用されています」→ これも列挙攻撃に使えるが、UX上必要。対策: レート制限 + CAPTCHA で保護。

**パスワードリセット:**
「登録されていればメールを送信しました」→ メールアドレスの存在を明かさない。実際にメールが存在しなくても同じメッセージを返す。
</details>

**Q20.** SPAとSSRの混在アプリケーションで、認証状態の同期がずれる「セッション不整合問題」を説明し、解決方法を提示してください。

<details><summary>回答</summary>

**セッション不整合問題:**
サーバー側とクライアント側で認証状態の認識が異なる状況。

**発生パターン:**

1. **タブ間不整合:** タブAでログアウト → タブBは古いセッションのまま → タブBで操作すると401エラー
2. **SSR/CSR不整合:** サーバーではセッション有効 → クライアントでJSが読み込まれる間にトークン期限切れ → Hydration後に認証エラー
3. **Cookie/State不整合:** Cookieのトークンは更新済み → Reactの状態は旧トークン → APIリクエストが失敗

**解決方法:**

```typescript
// 1. onAuthStateChange でリアルタイム同期
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === "SIGNED_OUT") {
        // 全状態をクリアしてログインページへ
        router.push("/login");
        router.refresh(); // Server Component を再レンダリング
      }
      if (event === "TOKEN_REFRESHED") {
        // 状態を最新に更新
        setSession(session);
      }
    }
  );
  return () => subscription.unsubscribe();
}, []);

// 2. Server Component でのセッション検証を middleware で保証
// middleware.ts で getUser() を呼び、常に最新のセッションを保証

// 3. エラー発生時のグレースフルリカバリ
async function fetchWithAuth(url: string) {
  const res = await fetch(url);
  if (res.status === 401) {
    // セッションリフレッシュを試みる
    const { error } = await supabase.auth.refreshSession();
    if (error) {
      // リフレッシュ失敗 → ログアウト
      await supabase.auth.signOut();
      window.location.href = "/login";
      return;
    }
    // リトライ
    return fetch(url);
  }
  return res;
}
```

**根本対策:** ミドルウェアでのセッションリフレッシュ + `onAuthStateChange` リスナー + APIエラー時のリトライ/リダイレクト。これら3層で不整合を防ぐ。
</details>
