import Link from "next/link";
import { getAddresses } from "@/lib/address-actions";
import { AddressList } from "@/components/address-list";

export default async function AddressesPage() {
  const addresses = await getAddresses();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/mypage" className="hover:text-foreground">
          マイページ
        </Link>
        <span className="mx-2">/</span>
        <span>配送先管理</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">配送先管理</h1>

      <AddressList addresses={addresses} />
    </div>
  );
}
