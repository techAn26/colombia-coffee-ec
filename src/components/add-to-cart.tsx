"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart-actions";
import type { ProductVariant } from "@/lib/products";

interface AddToCartProps {
  variants: ProductVariant[];
  isLoggedIn: boolean;
}

export function AddToCart({ variants, isLoggedIn }: AddToCartProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? "");
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setIsAdding(true);
    setMessage(null);

    try {
      await addToCart(selectedVariantId);
      setMessage("カートに追加しました");
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage("追加に失敗しました");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* バリエーション選択 */}
      <div className="flex gap-2">
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => setSelectedVariantId(variant.id)}
            disabled={variant.stock <= 0}
            className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
              selectedVariantId === variant.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary"
            } ${variant.stock <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="font-medium">{variant.label}</div>
            <div className="text-xs">¥{variant.price.toLocaleString()}</div>
          </button>
        ))}
      </div>

      {/* 在庫状況 */}
      {selectedVariant && selectedVariant.stock <= 0 && (
        <p className="text-sm text-destructive">品切れ中です</p>
      )}
      {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
        <p className="text-sm text-orange-600">残り{selectedVariant.stock}点</p>
      )}

      {/* カートに入れるボタン */}
      <Button
        size="lg"
        className="w-full"
        onClick={handleAddToCart}
        disabled={isAdding || !selectedVariant || selectedVariant.stock <= 0}
      >
        {isAdding ? "追加中..." : "カートに入れる"}
      </Button>

      {/* フィードバックメッセージ */}
      {message && (
        <p className="text-sm text-center text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
