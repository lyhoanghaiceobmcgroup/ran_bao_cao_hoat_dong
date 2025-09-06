-- Create storage bucket for shift reports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ran-shift', 
  'ran-shift', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Create RLS policies for the bucket
CREATE POLICY "Allow public uploads to ran-shift bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'ran-shift');

CREATE POLICY "Allow public access to ran-shift bucket" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'ran-shift');