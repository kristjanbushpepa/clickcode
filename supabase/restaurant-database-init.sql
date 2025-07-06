
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

-- Drop existing tables that are not part of our schema (cleanup)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Get all tables in public schema that are not in our allowed list
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN (
            'restaurant_profile',
            'categories', 
            'menu_items',
            'menu_customization',
            'user_profiles',
            'analytics_events',
            'connection_config'
        )
    ) LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- Create connection configuration table to store Supabase connection details
DROP TABLE IF EXISTS public.connection_config CASCADE;
CREATE TABLE public.connection_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supabase_url VARCHAR(500) NOT NULL,
  supabase_anon_key TEXT NOT NULL,
  restaurant_id VARCHAR(255), -- Optional reference to main admin database
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on connection_config
ALTER TABLE public.connection_config ENABLE ROW LEVEL SECURITY;

-- Create policies for connection_config (public read access for menu API)
CREATE POLICY "Public can view connection config" ON public.connection_config
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage connection config" ON public.connection_config
  FOR ALL TO authenticated USING (true);

-- Create trigger for connection_config updated_at
CREATE TRIGGER update_connection_config_updated_at 
  BEFORE UPDATE ON public.connection_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create or replace restaurant profile table
DROP TABLE IF EXISTS public.restaurant_profile CASCADE;
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view restaurant profile" ON public.restaurant_profile;
DROP POLICY IF EXISTS "Authenticated users can manage restaurant profile" ON public.restaurant_profile;

-- Create policies for restaurant profile
CREATE POLICY "Authenticated users can view restaurant profile" ON public.restaurant_profile
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage restaurant profile" ON public.restaurant_profile
  FOR ALL TO authenticated USING (true);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_restaurant_profile_updated_at ON public.restaurant_profile;

-- Create trigger for updated_at
CREATE TRIGGER update_restaurant_profile_updated_at 
  BEFORE UPDATE ON public.restaurant_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create or replace categories table for menu organization
DROP TABLE IF EXISTS public.categories CASCADE;
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_sq VARCHAR(255), -- Albanian translation (primary)
  name_it VARCHAR(255), -- Italian translation
  name_de VARCHAR(255), -- German translation
  name_fr VARCHAR(255), -- French translation
  name_zh VARCHAR(255), -- Chinese translation
  description TEXT,
  description_sq TEXT, -- Albanian description (primary)
  description_it TEXT,
  description_de TEXT,
  description_fr TEXT,
  description_zh TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;

-- Create policies for categories (public read access for menu API)
CREATE POLICY "Public can view active categories" ON public.categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage categories" ON public.categories
  FOR ALL TO authenticated USING (true);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;

-- Create trigger for categories updated_at
CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create or replace menu items table
DROP TABLE IF EXISTS public.menu_items CASCADE;
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_sq VARCHAR(255), -- Albanian translation (primary)
  name_it VARCHAR(255), -- Italian translation
  name_de VARCHAR(255), -- German translation
  name_fr VARCHAR(255), -- French translation
  name_zh VARCHAR(255), -- Chinese translation
  description TEXT,
  description_sq TEXT, -- Albanian description (primary)
  description_it TEXT,
  description_de TEXT,
  description_fr TEXT,
  description_zh TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ALL', -- Albanian Lek as default currency
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view available menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Authenticated users can manage menu items" ON public.menu_items;

-- Create policies for menu_items (public read access for menu API)
CREATE POLICY "Public can view available menu items" ON public.menu_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "Authenticated users can manage menu items" ON public.menu_items
  FOR ALL TO authenticated USING (true);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON public.menu_items;

-- Create trigger for menu_items updated_at
CREATE TRIGGER update_menu_items_updated_at 
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create or replace menu customization settings table
DROP TABLE IF EXISTS public.menu_customization CASCADE;
CREATE TABLE public.menu_customization (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  layout VARCHAR(50) DEFAULT 'categories' CHECK (layout IN ('categories', 'all-items')),
  primary_color VARCHAR(7) DEFAULT '#8B5CF6',
  secondary_color VARCHAR(7) DEFAULT '#A855F7',
  background_color VARCHAR(7) DEFAULT '#FFFFFF',
  text_color VARCHAR(7) DEFAULT '#1F2937',
  accent_color VARCHAR(7) DEFAULT '#EC4899',
  font_family VARCHAR(100) DEFAULT 'Inter',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on menu_customization
ALTER TABLE public.menu_customization ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view menu customization" ON public.menu_customization;
DROP POLICY IF EXISTS "Authenticated users can manage menu customization" ON public.menu_customization;

-- Create policies for menu_customization
CREATE POLICY "Public can view menu customization" ON public.menu_customization
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage menu customization" ON public.menu_customization
  FOR ALL TO authenticated USING (true);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_menu_customization_updated_at ON public.menu_customization;

-- Create trigger for menu_customization updated_at
CREATE TRIGGER update_menu_customization_updated_at 
  BEFORE UPDATE ON public.menu_customization
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create or replace user profiles table for restaurant staff
DROP TABLE IF EXISTS public.user_profiles CASCADE;
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Authenticated users can manage profiles" ON public.user_profiles;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view all profiles" ON public.user_profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage profiles" ON public.user_profiles
  FOR ALL TO authenticated USING (true);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;

-- Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create or replace analytics table for basic tracking
DROP TABLE IF EXISTS public.analytics_events CASCADE;
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can manage analytics" ON public.analytics_events;

-- Create policies for analytics_events
CREATE POLICY "Authenticated users can manage analytics" ON public.analytics_events
  FOR ALL TO authenticated USING (true);

-- Insert default connection config (will need to be updated manually with actual values)
INSERT INTO public.connection_config (supabase_url, supabase_anon_key, restaurant_id) 
SELECT 'https://your-restaurant-project.supabase.co', 'your-anon-key-here', 'restaurant-id-here'
WHERE NOT EXISTS (SELECT 1 FROM public.connection_config);

-- Insert default profile if none exists
INSERT INTO public.restaurant_profile (name, description) 
SELECT 'Restoranti Im', 'Mirësevini në restorantin tonë!'
WHERE NOT EXISTS (SELECT 1 FROM public.restaurant_profile);

-- Insert default categories with Albanian as primary language
INSERT INTO public.categories (name, name_sq, description, description_sq, display_order) VALUES
  ('Appetizers', 'Antipastet', 'Start your meal with our delicious appetizers', 'Filloni vaktin tuaj me antipastet tona të shijshme', 1),
  ('Main Courses', 'Pjatat Kryesore', 'Our signature main dishes', 'Pjatat tona kryesore të veçanta', 2),
  ('Desserts', 'Ëmbëlsirat', 'Sweet endings to your meal', 'Mbarimi i ëmbël i vaktit tuaj', 3),
  ('Beverages', 'Pijet', 'Refreshing drinks and beverages', 'Pije fresknguese dhe të tjera', 4)
ON CONFLICT DO NOTHING;

-- Insert default menu customization settings
INSERT INTO public.menu_customization (layout, primary_color, secondary_color, background_color, text_color, accent_color, font_family)
SELECT 'categories', '#8B5CF6', '#A855F7', '#FFFFFF', '#1F2937', '#EC4899', 'Inter'
WHERE NOT EXISTS (SELECT 1 FROM public.menu_customization);

-- Insert sample menu items for demonstration
INSERT INTO public.menu_items (category_id, name, name_sq, description, description_sq, price, currency, is_available, display_order) 
SELECT 
  c.id,
  'Bruschetta Tradicionale',
  'Brusketa Tradicionale',
  'Crispy bread topped with fresh tomatoes, basil, and garlic',
  'Bukë e krokur me domate të freskëta, borzilok dhe hudër',
  850.00,
  'ALL',
  true,
  1
FROM public.categories c
WHERE c.name = 'Appetizers'
LIMIT 1;

INSERT INTO public.menu_items (category_id, name, name_sq, description, description_sq, price, currency, is_available, display_order) 
SELECT 
  c.id,
  'Pasta Carbonara',
  'Pasta Karbonara',
  'Classic Italian pasta with eggs, cheese, pancetta, and black pepper',
  'Pasta klasike italiane me vezë, djathë, panceta dhe piper të zi',
  1450.00,
  'ALL',
  true,
  1
FROM public.categories c
WHERE c.name = 'Main Courses'
LIMIT 1;

INSERT INTO public.menu_items (category_id, name, name_sq, description, description_sq, price, currency, is_available, display_order) 
SELECT 
  c.id,
  'Tiramisu',
  'Tiramisu',
  'Traditional Italian dessert with coffee-soaked ladyfingers and mascarpone',
  'Ëmbëlsirë tradicionale italiane me gishta zonje të lagur me kafe dhe maskarpone',
  750.00,
  'ALL',
  true,
  1
FROM public.categories c
WHERE c.name = 'Desserts'
LIMIT 1;

INSERT INTO public.menu_items (category_id, name, name_sq, description, description_sq, price, currency, is_available, display_order) 
SELECT 
  c.id,
  'Espresso',
  'Espreso',
  'Strong Italian coffee served in a small cup',
  'Kafe e fortë italiane e shërbyer në filxhan të vogël',
  200.00,
  'ALL',
  true,
  1
FROM public.categories c
WHERE c.name = 'Beverages'
LIMIT 1;
