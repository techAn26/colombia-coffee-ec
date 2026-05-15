"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="text-center space-y-4 px-4">
        <div className="text-4xl">😓</div>
        <h2 className="text-xl font-bold">問題が発生しました</h2>
        <p className="text-muted-foreground max-w-md">
          申し訳ございません。ページの表示中にエラーが発生しました。
          しばらくしてからもう一度お試しください。
        </p>
        <Button onClick={reset}>もう一度試す</Button>
      </div>
    </div>
  );
}
