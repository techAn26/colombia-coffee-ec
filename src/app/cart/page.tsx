import Link from "next/link";
import { getCartItems } from "@/lib/cart-actions";
import { buttonVariants } from "@/components/ui/button";
import { CartItemRow } from "@/components/cart-item-row";

export default async function CartPage() {
  const items = await getCartItems();

  const total = items.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">カート</h1>

      {items.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <p className="text-muted-foreground text-lg">
            カートに商品がありません。
          </p>
          <Link
            href="/products"
            className={buttonVariants({ variant: "outline" })}
          >
            商品一覧を見る
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* カートアイテム一覧 */}
          <div className="space-y-4">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          {/* 合計金額 */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>合計</span>
              <span>¥{total.toLocaleString()}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              送料は別途計算されます
            </p>
          </div>

          {/* 購入ボタン */}
          <form action="/api/checkout" method="POST">
            <button
              type="submit"
              className={buttonVariants({ size: "lg" }) + " w-full"}
            >
              購入手続きへ
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
