-- Bucket Storage 'gallery' untuk foto galeri dan kebijakan aksesnya.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('gallery', 'gallery', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view gallery files" ON storage.objects;

DROP POLICY IF EXISTS "Admins can upload gallery files" ON storage.objects;

DROP POLICY IF EXISTS "Admins can update gallery files" ON storage.objects;

DROP POLICY IF EXISTS "Admins can delete gallery files" ON storage.objects;

CREATE POLICY "Public can view gallery files" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'gallery');

CREATE POLICY "Admins can upload gallery files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery' AND public.is_admin());

CREATE POLICY "Admins can update gallery files" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'gallery' AND public.is_admin())
  WITH CHECK (bucket_id = 'gallery' AND public.is_admin());

CREATE POLICY "Admins can delete gallery files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND public.is_admin());
