
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache for restaurant Supabase client to prevent multiple instances
let restaurantSupabaseClient: SupabaseClient | null = null;
let cachedRestaurantUrl: string | null = null;

// Get restaurant database connection from appropriate storage
export const getRestaurantSupabase = () => {
  // Check both storages for restaurant info
  let restaurantInfo = sessionStorage.getItem('restaurant_info');
  let storage = sessionStorage;
  
  if (!restaurantInfo) {
    restaurantInfo = localStorage.getItem('restaurant_info');
    storage = localStorage;
  }
  
  if (!restaurantInfo) {
    throw new Error('Restaurant information not found. Please login again.');
  }
  
  const { supabase_url, supabase_anon_key, keepLoggedIn } = JSON.parse(restaurantInfo);
  
  // Return cached client if URL matches
  if (restaurantSupabaseClient && cachedRestaurantUrl === supabase_url) {
    return restaurantSupabaseClient;
  }
  
  // Create new client with appropriate storage
  const authStorage = keepLoggedIn ? localStorage : sessionStorage;
  
  restaurantSupabaseClient = createClient(supabase_url, supabase_anon_key, {
    auth: {
      storage: authStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
  
  cachedRestaurantUrl = supabase_url;
  return restaurantSupabaseClient;
};

export const getRestaurantInfo = () => {
  // Check both storages for restaurant info
  let restaurantInfo = sessionStorage.getItem('restaurant_info');
  if (!restaurantInfo) {
    restaurantInfo = localStorage.getItem('restaurant_info');
  }
  
  if (!restaurantInfo) {
    return null;
  }
  return JSON.parse(restaurantInfo);
};

// Check if user is logged in and session is valid
export const isRestaurantUserLoggedIn = async () => {
  try {
    const restaurantInfo = getRestaurantInfo();
    if (!restaurantInfo) return false;
    
    const supabase = getRestaurantSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    return !!session?.user;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};

// Helper function to create restaurant supabase client from restaurant data
export const createRestaurantSupabase = (supabase_url: string, supabase_anon_key: string, keepLoggedIn = false) => {
  const storage = keepLoggedIn ? localStorage : sessionStorage;
  
  return createClient(supabase_url, supabase_anon_key, {
    auth: {
      storage: storage,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
};

// Clear login data from both storages
export const clearRestaurantLogin = () => {
  sessionStorage.removeItem('restaurant_info');
  localStorage.removeItem('restaurant_info');
  
  // Reset cached client
  restaurantSupabaseClient = null;
  cachedRestaurantUrl = null;
};
