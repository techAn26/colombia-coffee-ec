"use client";

import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import type { User } from "@supabase/supabase-js";

interface HeaderAuthProps {
  user: User | null;
  isAdmin?: boolean;
}

export function HeaderAuth({ user, isAdmin }: HeaderAuthProps) {
  const router = useRouter();

  if (!user) {
    return (
      <a href="/login" className={buttonVariants({ variant: "outline", size: "sm" })}>
        ログイン
      </a>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      {isAdmin && (
        <a
          href="/admin"
          className="text-muted-foreground hover:text-foreground"
        >
          管理画面
        </a>
      )}
      <a
        href="/mypage"
        className="text-muted-foreground hover:text-foreground"
      >
        マイページ
      </a>
      <Button variant="outline" size="sm" onClick={handleSignOut}>
        ログアウト
      </Button>
    </div>
  );
}
