import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrder, STATUS_LABELS, STATUS_COLORS, type OrderStatus } from "@/lib/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OrderDetailPage({
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
        <Link href="/mypage" className="hover:text-foreground">
          マイページ
        </Link>
        <span className="mx-2">/</span>
        <Link href="/mypage/orders" className="hover:text-foreground">
          注文履歴
        </Link>
        <span className="mx-2">/</span>
        <span>{order.order_number}</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">注文詳細</h1>

      {/* 注文サマリー */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>{order.order_number}</span>
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
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">注文日</dt>
            <dd>{new Date(order.created_at).toLocaleDateString("ja-JP")}</dd>
            <dt className="text-muted-foreground">合計金額</dt>
            <dd className="font-bold">¥{order.total.toLocaleString()}</dd>
            <dt className="text-muted-foreground">配送先</dt>
            <dd>
              {order.shipping_name === "未設定" ? (
                <span className="text-muted-foreground">未設定</span>
              ) : (
                <>
                  {order.shipping_name}
                  <br />
                  〒{order.shipping_postal_code}
                  <br />
                  {order.shipping_address}
                  <br />
                  {order.shipping_phone}
                </>
              )}
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

      {/* 合計 */}
      <div className="border-t mt-4 pt-4 flex justify-between items-center text-lg font-bold">
        <span>合計</span>
        <span>¥{order.total.toLocaleString()}</span>
      </div>
    </div>
  );
}
