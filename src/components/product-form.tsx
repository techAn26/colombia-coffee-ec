"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createProduct,
  updateProduct,
  type ProductFormData,
} from "@/lib/product-actions";

type VariantInput = {
  id?: string;
  label: string;
  weight_g: string;
  price: string;
  stock: string;
  sort_order: number;
};

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  defaultValues?: {
    name: string;
    description: string;
    origin: string;
    farm_name: string;
    farm_story: string;
    roast_level: string;
    process: string;
    altitude: string;
    flavor_notes: string[];
    is_published: boolean;
    category_id: string | null;
    variants: {
      id: string;
      label: string;
      weight_g: number;
      price: number;
      stock: number;
      sort_order: number;
    }[];
  };
  categoryId: string;
}

export function ProductForm({
  mode,
  productId,
  defaultValues,
  categoryId,
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [variants, setVariants] = useState<VariantInput[]>(
    defaultValues?.variants.map((v) => ({
      id: v.id,
      label: v.label,
      weight_g: String(v.weight_g),
      price: String(v.price),
      stock: String(v.stock),
      sort_order: v.sort_order,
    })) ?? [
      { label: "200g", weight_g: "200", price: "", stock: "0", sort_order: 1 },
    ]
  );

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        label: "",
        weight_g: "",
        price: "",
        stock: "0",
        sort_order: variants.length + 1,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (
    index: number,
    field: keyof VariantInput,
    value: string
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data: ProductFormData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      origin: formData.get("origin") as string,
      farm_name: formData.get("farm_name") as string,
      farm_story: formData.get("farm_story") as string,
      roast_level: formData.get("roast_level") as string,
      process: formData.get("process") as string,
      altitude: formData.get("altitude") as string,
      flavor_notes_text: formData.get("flavor_notes_text") as string,
      is_published: formData.get("is_published") === "on",
      category_id: categoryId,
      variants: variants
        .filter((v) => v.label && v.weight_g && v.price)
        .map((v) => ({
          id: v.id,
          label: v.label,
          weight_g: parseInt(v.weight_g, 10),
          price: parseInt(v.price, 10),
          stock: parseInt(v.stock, 10) || 0,
          sort_order: v.sort_order,
        })),
    };

    try {
      if (mode === "create") {
        await createProduct(data);
      } else if (productId) {
        await updateProduct(productId, data);
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">商品名 *</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={defaultValues?.name}
            />
          </div>
          <div>
            <Label htmlFor="description">商品説明 *</Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={3}
              defaultValue={defaultValues?.description}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origin">産地 *</Label>
              <Input
                id="origin"
                name="origin"
                required
                defaultValue={defaultValues?.origin}
              />
            </div>
            <div>
              <Label htmlFor="roast_level">焙煎度 *</Label>
              <select
                id="roast_level"
                name="roast_level"
                required
                defaultValue={defaultValues?.roast_level ?? "medium"}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="light">浅煎り</option>
                <option value="medium">中煎り</option>
                <option value="dark">深煎り</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="process">精製方法</Label>
              <Input
                id="process"
                name="process"
                defaultValue={defaultValues?.process ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="altitude">標高</Label>
              <Input
                id="altitude"
                name="altitude"
                defaultValue={defaultValues?.altitude ?? ""}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="flavor_notes_text">
              フレーバーノート（カンマ区切り）
            </Label>
            <Input
              id="flavor_notes_text"
              name="flavor_notes_text"
              placeholder="チョコレート, ナッツ, 柑橘"
              defaultValue={defaultValues?.flavor_notes?.join(", ") ?? ""}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_published"
              name="is_published"
              defaultChecked={defaultValues?.is_published ?? false}
              className="rounded border-border"
            />
            <Label htmlFor="is_published">公開する</Label>
          </div>
        </CardContent>
      </Card>

      {/* 農園情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">農園情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="farm_name">農園名</Label>
            <Input
              id="farm_name"
              name="farm_name"
              defaultValue={defaultValues?.farm_name ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="farm_story">農園のストーリー</Label>
            <Textarea
              id="farm_story"
              name="farm_story"
              rows={5}
              defaultValue={defaultValues?.farm_story ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      {/* バリエーション */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>バリエーション（容量・価格）</span>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              + 追加
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {variants.map((variant, index) => (
            <div
              key={index}
              className="grid grid-cols-5 gap-2 items-end border-b pb-3 last:border-0"
            >
              <div>
                <Label className="text-xs">ラベル</Label>
                <Input
                  value={variant.label}
                  onChange={(e) =>
                    updateVariant(index, "label", e.target.value)
                  }
                  placeholder="200g"
                />
              </div>
              <div>
                <Label className="text-xs">重量(g)</Label>
                <Input
                  type="number"
                  value={variant.weight_g}
                  onChange={(e) =>
                    updateVariant(index, "weight_g", e.target.value)
                  }
                  placeholder="200"
                />
              </div>
              <div>
                <Label className="text-xs">価格(円)</Label>
                <Input
                  type="number"
                  value={variant.price}
                  onChange={(e) =>
                    updateVariant(index, "price", e.target.value)
                  }
                  placeholder="1500"
                />
              </div>
              <div>
                <Label className="text-xs">在庫</Label>
                <Input
                  type="number"
                  value={variant.stock}
                  onChange={(e) =>
                    updateVariant(index, "stock", e.target.value)
                  }
                  placeholder="0"
                />
              </div>
              <div>
                {variants.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariant(index)}
                    className="text-destructive"
                  >
                    削除
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 送信 */}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? "保存中..."
          : mode === "create"
          ? "商品を追加"
          : "変更を保存"}
      </Button>
    </form>
  );
}
