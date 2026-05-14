import { createClient } from "@/lib/supabase/client";

export async function signInWithGoogle(redirectTo?: string) {
  const supabase = createClient();
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  if (redirectTo) {
    callbackUrl.searchParams.set("next", redirectTo);
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    throw error;
  }
}

/**
 * LINEログイン
 *
 * SupabaseはLINEをネイティブサポートしていないため、
 * Third-party Auth (カスタムOIDCプロバイダー) として設定する。
 *
 * 設定手順:
 * 1. LINE Developers Console でチャネルを作成
 * 2. Supabase ダッシュボード > Authentication > Providers で
 *    Third-party Auth Provider を追加（LINE OIDC）
 * 3. 環境変数にプロバイダー名を設定
 *
 * 詳細は docs/records/line-login-setup.md を参照
 */
export async function signInWithLine(redirectTo?: string) {
  const supabase = createClient();
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  if (redirectTo) {
    callbackUrl.searchParams.set("next", redirectTo);
  }

  // TODO: LINE OIDC設定後に正しいプロバイダー名に変更する
  // Supabaseで Third-party Auth を設定すると、プロバイダー名が確定する
  const lineProvider = process.env.NEXT_PUBLIC_LINE_OIDC_PROVIDER ?? "line-login";

  const { error } = await supabase.auth.signInWithOAuth({
    // @ts-expect-error -- カスタムOIDCプロバイダー名は型定義に含まれない
    provider: lineProvider,
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    throw error;
  }
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}
