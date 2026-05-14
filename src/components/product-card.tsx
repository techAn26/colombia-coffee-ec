import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRoastLabel, type ProductWithMinPrice } from "@/lib/products";

interface ProductCardProps {
  product: ProductWithMinPrice;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <div className="aspect-[4/3] bg-muted rounded-t-lg flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover rounded-t-lg"
            />
          ) : (
            <span className="text-4xl">☕</span>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-base line-clamp-2">
            {product.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-1">
            <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-xs">
              {getRoastLabel(product.roast_level)}
            </span>
            {product.process && (
              <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-xs">
                {product.process}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {product.origin}
          </p>
          {product.flavor_notes && product.flavor_notes.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {product.flavor_notes.slice(0, 3).join(" / ")}
            </p>
          )}
          {product.min_price !== null && (
            <p className="text-lg font-bold">
              ¥{product.min_price.toLocaleString()}〜
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
