"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadProps {
  currentImageUrl: string | null;
  productId: string;
  onUploaded: (url: string) => void;
}

export function ImageUpload({
  currentImageUrl,
  productId,
  onUploaded,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // プレビュー表示
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    // アップロード
    setIsUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const filePath = `${productId}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      onUploaded(urlData.publicUrl);
    } catch (err) {
      console.error("Upload failed:", err);
      setPreviewUrl(currentImageUrl);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="w-full aspect-[4/3] bg-muted rounded-lg flex items-center justify-center overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="商品画像プレビュー"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl">☕</span>
        )}
      </div>
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
          id="image-upload"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById("image-upload")?.click()}
          disabled={isUploading}
        >
          {isUploading ? "アップロード中..." : "画像を選択"}
        </Button>
      </div>
    </div>
  );
}
