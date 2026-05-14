import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrder, STATUS_LABELS, STATUS_COLORS, type OrderStatus } from "@/lib/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusUpdater } from "@/components/order-status-updater";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/admin" className="hover:text-foreground">
          管理画面
        </Link>
        <span className="mx-2">/</span>
        <Link href="/admin/orders" className="hover:text-foreground">
          注文管理
        </Link>
        <span className="mx-2">/</span>
        <span>{order.order_number}</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">注文詳細（管理者）</h1>

      {/* ステータス更新 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>ステータス</span>
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                STATUS_COLORS[order.status as OrderStatus]
              }`}
            >
              {STATUS_LABELS[order.status as OrderStatus]}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderStatusUpdater
            orderId={order.id}
            currentStatus={order.status as OrderStatus}
          />
        </CardContent>
      </Card>

      {/* 注文情報 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">注文情報</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">注文番号</dt>
            <dd>{order.order_number}</dd>
            <dt className="text-muted-foreground">注文日</dt>
            <dd>
              {new Date(order.created_at).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </dd>
            <dt className="text-muted-foreground">合計金額</dt>
            <dd className="font-bold">¥{order.total.toLocaleString()}</dd>
            <dt className="text-muted-foreground">配送先</dt>
            <dd>
              {order.shipping_name}
              <br />
              〒{order.shipping_postal_code}
              <br />
              {order.shipping_address}
              <br />
              {order.shipping_phone}
            </dd>
          </dl>
        </CardContent>
      </Card>

      {/* 注文明細 */}
      <h2 className="text-lg font-bold mb-4">注文内容</h2>
      <div className="space-y-3">
        {order.order_items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center justify-between py-3 px-4">
              <div>
                <p className="font-medium text-sm">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.variant_label} × {item.quantity}
                </p>
              </div>
              <p className="font-bold">
                ¥{(item.price * item.quantity).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
