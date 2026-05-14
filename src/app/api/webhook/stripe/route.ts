import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutCompleted(session);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  if (!userId) {
    console.error("No user_id in session metadata");
    return;
  }

  const supabase = createAdminClient();

  // カートアイテムを取得
  const { data: cartItems, error: cartError } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      quantity,
      variant:product_variants (
        id,
        label,
        price,
        product:products (
          id,
          name
        )
      )
    `
    )
    .eq("user_id", userId);

  if (cartError || !cartItems || cartItems.length === 0) {
    console.error("Failed to get cart items:", cartError);
    return;
  }

  // 合計金額を計算
  const total = cartItems.reduce((sum, item) => {
    const variant = item.variant as unknown as { price: number };
    return sum + variant.price * item.quantity;
  }, 0);

  // 注文番号を生成
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const orderNumber = `ORD-${dateStr}-${random}`;

  // 注文を作成
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      order_number: orderNumber,
      status: "pending",
      total,
      shipping_name: "未設定",
      shipping_postal_code: "000-0000",
      shipping_address: "未設定",
      shipping_phone: "000-0000-0000",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Failed to create order:", orderError);
    return;
  }

  // 注文明細を作成
  const orderItems = cartItems.map((item) => {
    const variant = item.variant as unknown as {
      id: string;
      label: string;
      price: number;
      product: { name: string };
    };
    return {
      order_id: order.id,
      variant_id: variant.id,
      product_name: variant.product.name,
      variant_label: variant.label,
      price: variant.price,
      quantity: item.quantity,
    };
  });

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("Failed to create order items:", itemsError);
    return;
  }

  // 在庫を減らす
  for (const item of cartItems) {
    const variant = item.variant as unknown as { id: string };
    await supabase.rpc("decrement_stock", {
      p_variant_id: variant.id,
      p_quantity: item.quantity,
    });
  }

  // カートをクリア
  await supabase.from("cart_items").delete().eq("user_id", userId);
}
