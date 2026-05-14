import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import type { CartItemWithDetails } from "@/lib/cart-actions";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SUPABASE_URL));
  }

  // カートアイテムを取得
  const { data: cartItems, error } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      quantity,
      variant:product_variants (
        id,
        label,
        weight_g,
        price,
        stock,
        product:products (
          id,
          name,
          image_url
        )
      )
    `
    )
    .eq("user_id", user.id);

  if (error || !cartItems || cartItems.length === 0) {
    return NextResponse.redirect(new URL("/cart", process.env.NEXT_PUBLIC_SUPABASE_URL));
  }

  const items = cartItems as unknown as CartItemWithDetails[];

  // 在庫チェック
  for (const item of items) {
    if (item.variant.stock < item.quantity) {
      return NextResponse.redirect(
        new URL("/cart?error=stock", process.env.NEXT_PUBLIC_SUPABASE_URL)
      );
    }
  }

  // Stripe Checkout Session を作成
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    metadata: {
      user_id: user.id,
    },
    line_items: items.map((item) => ({
      price_data: {
        currency: "jpy",
        product_data: {
          name: `${item.variant.product.name} (${item.variant.label})`,
        },
        unit_amount: item.variant.price,
      },
      quantity: item.quantity,
    })),
    success_url: `${origin}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart`,
  });

  return NextResponse.redirect(session.url!, 303);
}
