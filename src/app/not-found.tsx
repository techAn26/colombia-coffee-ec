import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="text-center space-y-4 px-4">
        <div className="text-6xl font-bold text-muted-foreground">404</div>
        <h2 className="text-xl font-bold">ページが見つかりません</h2>
        <p className="text-muted-foreground max-w-md">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          トップページに戻る
        </Link>
      </div>
    </div>
  );
}
