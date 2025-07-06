
-- SQL to initialize a new restaurant's individual Supabase database
-- This file should be run when setting up a new restaurant's database

-- Create the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

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

-- Create categories table for menu organization
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Authenticated users can manage categories" ON public.categories
  FOR ALL TO authenticated USING (true);

-- Create trigger for categories updated_at
CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create menu items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  allergens JSONB DEFAULT '[]',
  nutritional_info JSONB DEFAULT '{}',
  preparation_time INTEGER, -- in minutes
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies for menu_items
CREATE POLICY "Public can view available menu items" ON public.menu_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "Authenticated users can manage menu items" ON public.menu_items
  FOR ALL TO authenticated USING (true);

-- Create trigger for menu_items updated_at
CREATE TRIGGER update_menu_items_updated_at 
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create user profiles table for restaurant staff
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'staff',
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view all profiles" ON public.user_profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage profiles" ON public.user_profiles
  FOR ALL TO authenticated USING (true);

-- Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create analytics table for basic tracking
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics_events
CREATE POLICY "Authenticated users can manage analytics" ON public.analytics_events
  FOR ALL TO authenticated USING (true);

-- Insert default profile if none exists
INSERT INTO public.restaurant_profile (name, description) 
SELECT 'My Restaurant', 'Welcome to our restaurant!'
WHERE NOT EXISTS (SELECT 1 FROM public.restaurant_profile);

-- Insert default categories
INSERT INTO public.categories (name, description, display_order) VALUES
  ('Appetizers', 'Start your meal with our delicious appetizers', 1),
  ('Main Courses', 'Our signature main dishes', 2),
  ('Desserts', 'Sweet endings to your meal', 3),
  ('Beverages', 'Refreshing drinks and beverages', 4)
WHERE NOT EXISTS (SELECT 1 FROM public.categories);
