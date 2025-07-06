-- SQL to be run in each restaurant's individual Supabase database
-- This creates the restaurant profile management tables

-- Create restaurant profile table
CREATE TABLE public.restaurant_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  working_hours JSONB DEFAULT '{}',
  social_media_links JSONB DEFAULT '{}',
  logo_url TEXT,
  banner_url TEXT,
  google_reviews_embed TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on restaurant_profile
ALTER TABLE public.restaurant_profile ENABLE ROW LEVEL SECURITY;

-- Create policies for restaurant profile
CREATE POLICY "Authenticated users can view restaurant profile" ON public.restaurant_profile
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage restaurant profile" ON public.restaurant_profile
  FOR ALL TO authenticated USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_restaurant_profile_updated_at 
  BEFORE UPDATE ON public.restaurant_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default profile if none exists
INSERT INTO public.restaurant_profile (name, description) 
SELECT 'My Restaurant', 'Welcome to our restaurant!'
WHERE NOT EXISTS (SELECT 1 FROM public.restaurant_profile);