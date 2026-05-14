import { createClient } from "@supabase/supabase-js";

/**
 * service_role key を使うSupabaseクライアント
 * RLSをバイパスするため、サーバーサイド（Webhook等）でのみ使用する
 * フロントエンドやクライアントコンポーネントからは絶対に呼ばないこと
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
