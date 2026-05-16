"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import type { User } from "@supabase/supabase-js";

interface MobileMenuProps {
  user: User | null;
  isAdmin?: boolean;
}

export function MobileMenu({ user, isAdmin }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const close = () => setOpen(false);

  const handleSignOut = async () => {
    await signOut();
    close();
    router.refresh();
  };

  const linkClass =
    "rounded-md px-3 py-2 text-foreground hover:bg-muted transition-colors";

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label="メニューを開く"
        className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Menu className="size-5" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[80vw] flex-col bg-background shadow-xl outline-none transition-transform duration-200 data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Dialog.Title className="text-base font-semibold">
              メニュー
            </Dialog.Title>
            <Dialog.Close
              aria-label="メニューを閉じる"
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <nav className="flex flex-1 flex-col gap-1 px-4 py-4 text-sm">
            <Link href="/products" className={linkClass} onClick={close}>
              商品一覧
            </Link>
            {user && (
              <Link href="/cart" className={linkClass} onClick={close}>
                カート
              </Link>
            )}
            {user && isAdmin && (
              <Link href="/admin" className={linkClass} onClick={close}>
                管理画面
              </Link>
            )}
            {user && (
              <Link href="/mypage" className={linkClass} onClick={close}>
                マイページ
              </Link>
            )}
          </nav>
          <div className="border-t px-4 py-4">
            {user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="w-full"
              >
                ログアウト
              </Button>
            ) : (
              <Link
                href="/login"
                onClick={close}
                className="flex w-full items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                ログイン
              </Link>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
