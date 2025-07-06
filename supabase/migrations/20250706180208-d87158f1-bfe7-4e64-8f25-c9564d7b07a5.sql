
-- Company Admin Database Setup
-- This handles the centralized management of all restaurants

-- Create restaurant registration table
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_full_name VARCHAR(255) NOT NULL,
  owner_email VARCHAR(255) NOT NULL UNIQUE,
  owner_phone VARCHAR(50),
  business_registration_number VARCHAR(100),
  business_registration_country VARCHAR(100),
  
  -- Supabase connection details for each restaurant
  supabase_url VARCHAR(500) NOT NULL,
  supabase_anon_key TEXT NOT NULL,
  supabase_service_role_key TEXT,
  
  -- Status and metadata
  connection_status VARCHAR(50) DEFAULT 'pending' CHECK (connection_status IN ('pending', 'connected', 'error', 'suspended')),
  webhook_url VARCHAR(500),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_connected_at TIMESTAMP WITH TIME ZONE,
  
  -- Additional business info
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  timezone VARCHAR(100) DEFAULT 'Europe/Tirane'
);

-- Enable RLS for restaurants table
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only (we'll implement admin roles later)
CREATE POLICY "Admin access only" ON public.restaurants
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create company admin users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS for admin users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy for admin users to manage themselves
CREATE POLICY "Admin users can view themselves" ON public.admin_users
  FOR SELECT USING (user_id = auth.uid());

-- Create activity logs table for audit trail
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id),
  admin_user_id UUID REFERENCES public.admin_users(id),
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for activity logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy for admin access to logs
CREATE POLICY "Admin access to logs" ON public.activity_logs
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Create currencies reference table
CREATE TABLE public.currencies (
  code VARCHAR(3) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  is_base_currency BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true
);

-- Insert supported currencies
INSERT INTO public.currencies (code, name, symbol, is_base_currency, is_active) VALUES
('ALL', 'Albanian Lek', 'L', true, true),
('EUR', 'Euro', '€', false, true),
('USD', 'US Dollar', '$', false, true),
('GBP', 'British Pound', '£', false, true),
('CHF', 'Swiss Franc', 'CHF', false, true);

-- Create languages reference table
CREATE TABLE public.languages (
  code VARCHAR(5) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  native_name VARCHAR(100) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true
);

-- Insert supported languages
INSERT INTO public.languages (code, name, native_name, is_primary, is_active) VALUES
('sq', 'Albanian', 'Shqip', true, true),
('en', 'English', 'English', false, true),
('it', 'Italian', 'Italiano', false, true),
('de', 'German', 'Deutsch', false, true),
('fr', 'French', 'Français', false, true),
('zh', 'Chinese', '中文', false, true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language plpgsql;

-- Add trigger for restaurants table
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
