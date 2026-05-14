import Link from "next/link";
import { getUserOrders, STATUS_LABELS, STATUS_COLORS, type OrderStatus } from "@/lib/orders";
import { Card, CardContent } from "@/components/ui/card";

export default async function OrdersPage() {
  const orders = await getUserOrders();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/mypage" className="hover:text-foreground">
          マイページ
        </Link>
        <span className="mx-2">/</span>
        <span>注文履歴</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">注文履歴</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            まだ注文がありません。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/mypage/orders/${order.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer mb-4">
                <CardContent className="flex items-center justify-between py-4 px-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[order.status as OrderStatus]
                      }`}
                    >
                      {STATUS_LABELS[order.status as OrderStatus]}
                    </span>
                    <span className="font-bold">
                      ¥{order.total.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
