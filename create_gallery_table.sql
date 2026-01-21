-- Create property_images table
CREATE TABLE IF NOT EXISTS public.property_images (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    image_url text NOT NULL,
    caption text,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- Policies (Allow public access for demo purposes, similar to other tables)
CREATE POLICY "Enable read access for all users" ON public.property_images FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.property_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.property_images FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.property_images FOR DELETE USING (true);

-- Add 'images' column to properties view/query is not needed as we will join it.
-- But we should index the foreign key for performance
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON public.property_images(property_id);
