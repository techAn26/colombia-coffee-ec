import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeaderAuth } from "@/components/header-auth";
import { MobileMenu } from "@/components/mobile-menu";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <header className="border-b px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold tracking-tight">
        Colombia Coffee
      </Link>
      <nav className="hidden md:flex gap-4 text-sm items-center">
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
        <HeaderAuth user={user} isAdmin={isAdmin} />
      </nav>
      <div className="md:hidden">
        <MobileMenu user={user} isAdmin={isAdmin} />
      </div>
    </header>
  );
}
