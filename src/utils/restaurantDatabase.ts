
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache for restaurant Supabase client to prevent multiple instances
let restaurantSupabaseClient: SupabaseClient | null = null;
let cachedRestaurantUrl: string | null = null;

// Get restaurant database connection from session storage
export const getRestaurantSupabase = () => {
  const restaurantInfo = sessionStorage.getItem('restaurant_info');
  if (!restaurantInfo) {
    throw new Error('Restaurant information not found. Please login again.');
  }
  
  const { supabase_url, supabase_anon_key } = JSON.parse(restaurantInfo);
  
  // Return cached client if URL matches
  if (restaurantSupabaseClient && cachedRestaurantUrl === supabase_url) {
    return restaurantSupabaseClient;
  }
  
  // Create new client and cache it
  restaurantSupabaseClient = createClient(supabase_url, supabase_anon_key, {
    auth: {
      storage: sessionStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
  
  cachedRestaurantUrl = supabase_url;
  return restaurantSupabaseClient;
};

export const getRestaurantInfo = () => {
  const restaurantInfo = sessionStorage.getItem('restaurant_info');
  if (!restaurantInfo) {
    return null;
  }
  return JSON.parse(restaurantInfo);
};

// Helper function to create restaurant supabase client from restaurant data
export const createRestaurantSupabase = (supabase_url: string, supabase_anon_key: string) => {
  return createClient(supabase_url, supabase_anon_key, {
    auth: {
      storage: sessionStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
};
