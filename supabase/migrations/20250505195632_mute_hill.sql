/*
  # Create storage buckets for user uploads

  1. New Storage Buckets
    - `avatars`: For user profile pictures and avatars
    - `progress-photos`: For user progress tracking photos
  
  2. Security
    - Enable public access for viewing avatars
    - Restrict progress photos to authenticated users
    - Allow authenticated users to upload to both buckets
*/

-- Create avatars bucket with public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Create progress-photos bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', false);

-- Policy for uploading to avatars bucket
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- Policy for reading avatars (public)
CREATE POLICY "Allow public to view avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

-- Policy for uploading progress photos
CREATE POLICY "Allow authenticated users to upload progress photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'progress-photos' AND
  auth.role() = 'authenticated'
);

-- Policy for viewing own progress photos
CREATE POLICY "Users can view own progress photos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'progress-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);