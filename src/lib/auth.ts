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

export async function signInWithLine(redirectTo?: string) {
  const supabase = createClient();
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  if (redirectTo) {
    callbackUrl.searchParams.set("next", redirectTo);
  }

  // LINEはSupabaseのカスタムOIDCプロバイダーとして設定
  // Supabaseダッシュボード > Authentication > Providers > LINE (OIDC) で設定が必要
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "kakao", // placeholder: LINEはOIDC設定後にプロバイダー名が決まる
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
