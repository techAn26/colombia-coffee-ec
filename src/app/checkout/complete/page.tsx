import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CheckoutCompletePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🎉</div>
          <CardTitle className="text-2xl">ご注文ありがとうございます！</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            ご注文を承りました。発送準備が整い次第、ステータスを更新いたします。
          </p>

          {sessionId && (
            <p className="text-xs text-muted-foreground">
              決済ID: {sessionId.slice(0, 20)}...
            </p>
          )}

          <div className="flex flex-col gap-2 pt-4">
            <Link
              href="/mypage/orders"
              className={buttonVariants({ variant: "default" })}
            >
              注文履歴を確認する
            </Link>
            <Link
              href="/products"
              className={buttonVariants({ variant: "outline" })}
            >
              買い物を続ける
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
