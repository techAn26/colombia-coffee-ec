import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/profile";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/mypage" className="hover:text-foreground">
          マイページ
        </Link>
        <span className="mx-2">/</span>
        <span>プロフィール編集</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">プロフィール編集</h1>

      <ProfileForm profile={profile} />
    </div>
  );
}
