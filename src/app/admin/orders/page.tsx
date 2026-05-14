import Link from "next/link";
import { getAllOrders, STATUS_LABELS, STATUS_COLORS, type OrderStatus } from "@/lib/orders";
import { Card, CardContent } from "@/components/ui/card";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "pending", label: "受注" },
  { value: "preparing", label: "発送準備中" },
  { value: "shipped", label: "発送済み" },
  { value: "completed", label: "完了" },
  { value: "cancelled", label: "キャンセル" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const statusFilter = params.status ?? "all";
  const orders = await getAllOrders(statusFilter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/admin" className="hover:text-foreground">
          管理画面
        </Link>
        <span className="mx-2">/</span>
        <span>注文管理</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">注文管理</h1>

      {/* ステータスフィルター */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/admin/orders${opt.value === "all" ? "" : `?status=${opt.value}`}`}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              statusFilter === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* 注文件数 */}
      <p className="text-sm text-muted-foreground mb-4">
        {orders.length}件の注文
      </p>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">該当する注文がありません。</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer mb-3">
                <CardContent className="flex items-center justify-between py-4 px-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      配送先: {order.shipping_name}
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
