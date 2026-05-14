import Link from "next/link";
import { getCurrentProfile } from "@/lib/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MyPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">マイページ</h1>

      {profile && (
        <p className="text-muted-foreground mb-6">
          こんにちは、{profile.name}さん
        </p>
      )}

      <div className="grid gap-4">
        <Link href="/mypage/orders">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base">注文履歴</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                過去のご注文内容やステータスを確認できます
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/mypage/profile">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base">プロフィール編集</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                お名前やアバターを変更できます
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/mypage/addresses">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base">配送先管理</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                配送先住所の追加・編集・削除ができます
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
