-- product-images バケット作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 誰でも画像を閲覧可能
CREATE POLICY "product-images: anyone can view" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- admin のみアップロード可能
CREATE POLICY "product-images: admin can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- admin のみ削除可能
CREATE POLICY "product-images: admin can delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
