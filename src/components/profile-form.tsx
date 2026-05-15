"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile, type Profile } from "@/lib/profile";

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);

    try {
      await updateProfile({
        name: formData.get("name") as string,
        avatar_url: (formData.get("avatar_url") as string) || undefined,
      });
      setMessage("プロフィールを更新しました");
    } catch {
      setMessage("更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">表示名 *</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={profile.name}
            />
          </div>
          <div>
            <Label htmlFor="avatar_url">アバターURL</Label>
            <Input
              id="avatar_url"
              name="avatar_url"
              type="url"
              placeholder="https://..."
              defaultValue={profile.avatar_url ?? ""}
            />
            <p className="text-xs text-muted-foreground mt-1">
              プロフィール画像のURLを入力してください
            </p>
          </div>

          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "変更を保存"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
