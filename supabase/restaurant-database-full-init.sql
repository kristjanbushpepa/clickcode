
-- =====================================================================================
-- RESTAURANT DATABASE INITIALIZATION SCRIPT
-- =====================================================================================
-- This script initializes a complete restaurant database with all necessary tables,
-- policies, triggers, and seed data for the restaurant management system.
-- =====================================================================================

-- === BEGIN: CORE FUNCTIONS ===
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- === END: CORE FUNCTIONS ===

-- === CLEANUP: Drop untracked tables ===
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN (
            'restaurant_profile', 'categories', 'menu_items', 'restaurant_customization',
            'user_profiles', 'analytics_events', 'connection_config',
            'currency_settings', 'language_settings'
        )
    ) LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- =====================================================================================
-- TABLES, POLICIES, AND TRIGGERS
-- =====================================================================================

-- 1. CONNECTION CONFIG
-- Stores the Supabase connection details for this restaurant's database
DROP TABLE IF EXISTS public.connection_config CASCADE;
CREATE TABLE public.connection_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_url VARCHAR(500) NOT NULL,
    supabase_anon_key TEXT NOT NULL,
    restaurant_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.connection_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view connection config" ON public.connection_config FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage connection config" ON public.connection_config FOR ALL TO authenticated USING (true);
CREATE TRIGGER update_connection_config_updated_at BEFORE UPDATE ON public.connection_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. RESTAURANT PROFILE
-- Main restaurant information and settings
DROP TABLE IF EXISTS public.restaurant_profile CASCADE;
CREATE TABLE public.restaurant_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    working_hours JSONB DEFAULT '{}',
    social_media_links JSONB DEFAULT '{}',
    logo_url TEXT,
    banner_url TEXT,
    logo_path TEXT,
    banner_path TEXT,
    google_reviews_embed TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.restaurant_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on restaurant_profile" ON public.restaurant_profile FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_restaurant_profile_updated_at BEFORE UPDATE ON public.restaurant_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. CATEGORIES
-- Menu categories with multi-language support
DROP TABLE IF EXISTS public.categories CASCADE;
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_sq VARCHAR(255),
    name_it VARCHAR(255),
    name_de VARCHAR(255),
    name_fr VARCHAR(255),
    name_zh VARCHAR(255),
    description TEXT,
    description_sq TEXT,
    description_it TEXT,
    description_de TEXT,
    description_fr TEXT,
    description_zh TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    image_path TEXT,
    translation_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage categories" ON public.categories FOR ALL TO authenticated USING (true);
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_categories_translation_metadata ON categories USING GIN (translation_metadata);

-- 4. MENU ITEMS
-- Individual menu items with multi-language support
DROP TABLE IF EXISTS public.menu_items CASCADE;
CREATE TABLE public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_sq VARCHAR(255),
    name_it VARCHAR(255),
    name_de VARCHAR(255),
    name_fr VARCHAR(255),
    name_zh VARCHAR(255),
    description TEXT,
    description_sq TEXT,
    description_it TEXT,
    description_de TEXT,
    description_fr TEXT,
    description_zh TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ALL',
    image_url TEXT,
    image_path TEXT,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    allergens JSONB DEFAULT '[]',
    nutritional_info JSONB DEFAULT '{}',
    preparation_time INT,
    display_order INT DEFAULT 0,
    translation_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view available menu items" ON public.menu_items FOR SELECT USING (is_available = true);
CREATE POLICY "Authenticated users can manage menu items" ON public.menu_items FOR ALL TO authenticated USING (true);
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_menu_items_translation_metadata ON menu_items USING GIN (translation_metadata);

-- 5. RESTAURANT CUSTOMIZATION
-- Theme, layout, and popup settings
DROP TABLE IF EXISTS public.restaurant_customization CASCADE;
CREATE TABLE public.restaurant_customization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme JSONB DEFAULT NULL,
    layout VARCHAR(50) DEFAULT 'categories' CHECK (layout IN ('categories', 'all-items')),
    preset VARCHAR(50) DEFAULT 'light',
    popup_settings JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.restaurant_customization ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view restaurant customization" ON public.restaurant_customization FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage restaurant customization" ON public.restaurant_customization FOR ALL TO authenticated USING (true);
CREATE TRIGGER update_restaurant_customization_updated_at BEFORE UPDATE ON public.restaurant_customization FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. USER PROFILES
-- Restaurant staff profiles
DROP TABLE IF EXISTS public.user_profiles CASCADE;
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'staff',
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can view all profiles" ON public.user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage profiles" ON public.user_profiles FOR ALL TO authenticated USING (true);
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. ANALYTICS EVENTS
-- Basic analytics tracking
DROP TABLE IF EXISTS public.analytics_events CASCADE;
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage analytics" ON public.analytics_events FOR ALL TO authenticated USING (true);

-- 8. CURRENCY SETTINGS
-- Multi-currency support settings
DROP TABLE IF EXISTS public.currency_settings CASCADE;
CREATE TABLE public.currency_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    default_currency VARCHAR(3) DEFAULT 'ALL' NOT NULL,
    supported_currencies JSONB DEFAULT '["ALL", "EUR", "USD", "GBP", "CHF"]'::jsonb,
    exchange_rates JSONB DEFAULT '{
        "ALL": 1.0,
        "EUR": 0.0092,
        "USD": 0.010,
        "GBP": 0.0082,
        "CHF": 0.0093
    }'::jsonb,
    last_updated TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.currency_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view currency settings" ON public.currency_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage currency settings" ON public.currency_settings FOR ALL TO authenticated USING (true);
CREATE TRIGGER update_currency_settings_updated_at BEFORE UPDATE ON public.currency_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. LANGUAGE SETTINGS
-- Multi-language support settings
DROP TABLE IF EXISTS public.language_settings CASCADE;
CREATE TABLE public.language_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    main_ui_language VARCHAR(5) DEFAULT 'sq' NOT NULL,
    supported_ui_languages JSONB DEFAULT '["sq", "en", "it", "de", "fr", "zh"]'::jsonb,
    content_languages JSONB DEFAULT '["sq", "en", "it", "de", "fr", "zh"]'::jsonb,
    auto_translate BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.language_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view language settings" ON public.language_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage language settings" ON public.language_settings FOR ALL TO authenticated USING (true);
CREATE TRIGGER update_language_settings_updated_at BEFORE UPDATE ON public.language_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================================
-- SEED DATA
-- =====================================================================================

-- Insert connection config (update with actual values when deploying)
INSERT INTO public.connection_config (supabase_url, supabase_anon_key, restaurant_id) 
SELECT 'https://your-restaurant-project.supabase.co', 'your-anon-key-here', 'restaurant-id-here'
WHERE NOT EXISTS (SELECT 1 FROM public.connection_config);

-- Insert default restaurant profile
INSERT INTO public.restaurant_profile (name, description) 
SELECT 'Your Restaurant Name', 'Welcome to our restaurant!'
WHERE NOT EXISTS (SELECT 1 FROM public.restaurant_profile);

-- Insert default categories with Albanian as primary language
INSERT INTO public.categories (name, name_sq, description, description_sq, display_order) VALUES
    ('Appetizers', 'Antipastet', 'Start your meal with our delicious appetizers', 'Filloni vaktin tuaj me antipastet tona të shijshme', 1),
    ('Main Courses', 'Pjatat Kryesore', 'Our signature main dishes', 'Pjatat tona kryesore të veçanta', 2),
    ('Desserts', 'Ëmbëlsirat', 'Sweet endings to your meal', 'Mbarimi i ëmbël i vaktit tuaj', 3),
    ('Beverages', 'Pijet', 'Refreshing drinks and beverages', 'Pije fresknguese dhe të tjera', 4)
ON CONFLICT DO NOTHING;

-- Insert default restaurant customization with popup settings
INSERT INTO public.restaurant_customization (theme, layout, preset, popup_settings)
SELECT 
    '{
        "mode": "light",
        "primaryColor": "#1f2937",
        "accentColor": "#3b82f6",
        "backgroundColor": "#ffffff",
        "cardBackground": "#ffffff",
        "textColor": "#1f2937",
        "mutedTextColor": "#6b7280",
        "borderColor": "#e5e7eb"
    }'::jsonb,
    'categories',
    'light',
    '{
        "enabled": false,
        "type": "cta",
        "title": "Follow us on Instagram!",
        "description": "Get the latest updates and special offers",
        "link": "",
        "buttonText": "Follow Now",
        "wheelSettings": {
            "enabled": false,
            "unlockText": "Give us a 5-star review to spin the wheel!",
            "unlockButtonText": "Leave Review & Spin",
            "rewards": [
                {"text": "10% Off", "chance": 20, "color": "#ef4444"},
                {"text": "Free Drink", "chance": 15, "color": "#3b82f6"},
                {"text": "5% Off", "chance": 30, "color": "#10b981"},
                {"text": "Free Appetizer", "chance": 10, "color": "#f59e0b"},
                {"text": "Try Again", "chance": 25, "color": "#6b7280"}
            ]
        }
    }'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.restaurant_customization);

-- Insert default currency settings
INSERT INTO public.currency_settings (default_currency, supported_currencies, exchange_rates)
SELECT 'ALL', 
       '["ALL", "EUR", "USD", "GBP", "CHF"]'::jsonb,
       '{
         "ALL": 1.0,
         "EUR": 0.0092,
         "USD": 0.010,
         "GBP": 0.0082,
         "CHF": 0.0093
       }'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.currency_settings);

-- Insert default language settings
INSERT INTO public.language_settings (main_ui_language, supported_ui_languages, content_languages, auto_translate)
SELECT 'sq',
       '["sq", "en", "it", "de", "fr", "zh"]'::jsonb,
       '["sq", "en", "it", "de", "fr", "zh"]'::jsonb,
       true
WHERE NOT EXISTS (SELECT 1 FROM public.language_settings);

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

-- =====================================================================================
-- STORAGE SETUP
-- =====================================================================================

-- Note: Storage buckets should be created through the Supabase dashboard or via the 
-- application code. This script focuses on the database schema only.
-- 
-- Required storage bucket: 'restaurant-images'
-- - This bucket should be created with public access
-- - Allowed file types: image/jpeg, image/png, image/gif, image/webp
-- - File size limit: 5MB (5242880 bytes)

-- =====================================================================================
-- COMPLETION MESSAGE
-- =====================================================================================

DO $$
BEGIN
    RAISE NOTICE 'Restaurant database initialization completed successfully!';
    RAISE NOTICE 'Tables created: restaurant_profile, categories, menu_items, restaurant_customization, user_profiles, analytics_events, connection_config, currency_settings, language_settings';
    RAISE NOTICE 'Default data inserted for all tables';
    RAISE NOTICE 'All RLS policies and triggers configured';
    RAISE NOTICE 'Remember to:';
    RAISE NOTICE '1. Update connection_config with actual Supabase URL and keys';
    RAISE NOTICE '2. Update restaurant_profile with actual restaurant information';
    RAISE NOTICE '3. Create storage bucket "restaurant-images" with public access';
    RAISE NOTICE '4. Configure authentication if needed';
END $$;
