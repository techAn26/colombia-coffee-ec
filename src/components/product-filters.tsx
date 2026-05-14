"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";

interface ProductFiltersProps {
  origins: string[];
  flavors: string[];
}

const ROAST_OPTIONS = [
  { value: "light", label: "浅煎り" },
  { value: "medium", label: "中煎り" },
  { value: "dark", label: "深煎り" },
];

export function ProductFilters({ origins, flavors }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentOrigin = searchParams.get("origin") ?? "";
  const currentRoast = searchParams.get("roast") ?? "";
  const currentFlavor = searchParams.get("flavor") ?? "";
  const currentQ = searchParams.get("q") ?? "";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/products");
  }, [router]);

  const hasFilters = currentOrigin || currentRoast || currentFlavor || currentQ;

  return (
    <div className="space-y-4">
      {/* キーワード検索 */}
      <div>
        <input
          type="text"
          placeholder="商品名・農園名で検索..."
          defaultValue={currentQ}
          onChange={(e) => {
            // debounce: 入力が止まって300ms後に検索
            const value = e.target.value;
            const timer = setTimeout(() => updateFilter("q", value), 300);
            return () => clearTimeout(timer);
          }}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* フィルター */}
      <div className="flex flex-wrap gap-4">
        {/* 産地 */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            産地
          </label>
          <select
            value={currentOrigin}
            onChange={(e) => updateFilter("origin", e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">すべて</option>
            {origins.map((origin) => (
              <option key={origin} value={origin}>
                {origin}
              </option>
            ))}
          </select>
        </div>

        {/* 焙煎度 */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            焙煎度
          </label>
          <select
            value={currentRoast}
            onChange={(e) => updateFilter("roast", e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">すべて</option>
            {ROAST_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* フレーバー */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            フレーバー
          </label>
          <select
            value={currentFlavor}
            onChange={(e) => updateFilter("flavor", e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">すべて</option>
            {flavors.map((flavor) => (
              <option key={flavor} value={flavor}>
                {flavor}
              </option>
            ))}
          </select>
        </div>

        {/* クリアボタン */}
        {hasFilters && (
          <div className="flex items-end">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              フィルターをクリア
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
