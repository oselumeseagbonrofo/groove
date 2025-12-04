-- Groove Vinyl Spotify Player - Storage Bucket Setup
-- This migration creates the storage bucket for custom vinyl images

-- Create storage bucket for vinyl images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vinyl-images',
  'vinyl-images',
  true, -- Public bucket so images can be displayed
  4194304, -- 4MB limit (4 * 1024 * 1024 bytes)
  ARRAY['image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for vinyl-images bucket
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload vinyl images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'vinyl-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to view all vinyl images (public bucket)
CREATE POLICY "Anyone can view vinyl images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vinyl-images');

-- Allow users to update their own uploaded images
CREATE POLICY "Users can update their own vinyl images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'vinyl-images' 
    AND auth.uid()::text = owner::text
  );

-- Allow users to delete their own uploaded images
CREATE POLICY "Users can delete their own vinyl images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'vinyl-images' 
    AND auth.uid()::text = owner::text
  );
