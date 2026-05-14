import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeaderAuth } from "@/components/header-auth";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold tracking-tight">
        Colombia Coffee
      </Link>
      <nav className="flex gap-4 text-sm items-center">
        <Link
          href="/products"
          className="text-muted-foreground hover:text-foreground"
        >
          商品一覧
        </Link>
        {user && (
          <Link
            href="/cart"
            className="text-muted-foreground hover:text-foreground"
          >
            カート
          </Link>
        )}
        <HeaderAuth user={user} />
      </nav>
    </header>
  );
}
