-- Create the products table for storing product/program information
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    duration VARCHAR(100),
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy to allow admins/coaches to read all products
CREATE POLICY "Admins can read products" 
ON public.products FOR SELECT 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND (role = 'admin' OR role = 'coach')
    )
);

-- Policy to allow admins/coaches to insert products
CREATE POLICY "Admins can insert products" 
ON public.products FOR INSERT 
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND (role = 'admin' OR role = 'coach')
    )
);

-- Policy to allow admins/coaches to update products
CREATE POLICY "Admins can update products" 
ON public.products FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND (role = 'admin' OR role = 'coach')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND (role = 'admin' OR role = 'coach')
    )
);

-- Policy to allow admins/coaches to delete products
CREATE POLICY "Admins can delete products" 
ON public.products FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND (role = 'admin' OR role = 'coach')
    )
);

-- Policy to allow clients to view available products
CREATE POLICY "Clients can view available products" 
ON public.products FOR SELECT 
TO authenticated
USING (is_available = true);

-- Create a storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product_images', 'product_images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the product_images bucket
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product_images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product_images');

CREATE POLICY "Product image owners can update their images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product_images')
WITH CHECK (bucket_id = 'product_images');

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function before update
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
