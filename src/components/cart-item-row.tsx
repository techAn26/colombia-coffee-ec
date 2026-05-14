"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  updateCartQuantity,
  removeFromCart,
  type CartItemWithDetails,
} from "@/lib/cart-actions";

interface CartItemRowProps {
  item: CartItemWithDetails;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    setIsUpdating(true);
    try {
      await updateCartQuantity(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await removeFromCart(item.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const subtotal = item.variant.price * item.quantity;

  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4 px-4">
        {/* 商品画像 */}
        <Link
          href={`/products/${item.variant.product.id}`}
          className="shrink-0"
        >
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
            {item.variant.product.image_url ? (
              <img
                src={item.variant.product.image_url}
                alt={item.variant.product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-2xl">☕</span>
            )}
          </div>
        </Link>

        {/* 商品情報 */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/products/${item.variant.product.id}`}
            className="font-medium text-sm hover:underline line-clamp-1"
          >
            {item.variant.product.name}
          </Link>
          <p className="text-xs text-muted-foreground">{item.variant.label}</p>
          <p className="text-sm">¥{item.variant.price.toLocaleString()}</p>
        </div>

        {/* 数量変更 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 1}
          >
            −
          </Button>
          <span className="w-8 text-center text-sm">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isUpdating || item.quantity >= item.variant.stock}
          >
            +
          </Button>
        </div>

        {/* 小計 */}
        <div className="text-right shrink-0">
          <p className="font-bold">¥{subtotal.toLocaleString()}</p>
          <Button
            variant="ghost"
            size="xs"
            onClick={handleRemove}
            disabled={isUpdating}
            className="text-destructive hover:text-destructive"
          >
            削除
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
