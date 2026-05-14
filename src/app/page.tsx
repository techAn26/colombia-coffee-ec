import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-4 px-4">
        <h2 className="text-4xl font-bold tracking-tight">
          コロンビアから届く、
          <br />
          農園の想いが詰まった一杯。
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          生産者の顔が見えるスペシャリティコーヒー豆を、
          農園から直接あなたのもとへ。
        </p>
        <Link href="/products" className={buttonVariants({ size: "lg" })}>
          商品を見る
        </Link>
      </div>
    </div>
  );
}
