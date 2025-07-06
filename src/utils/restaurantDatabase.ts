
import { createClient } from '@supabase/supabase-js';

// Get restaurant database connection from session storage
export const getRestaurantSupabase = () => {
  const restaurantInfo = sessionStorage.getItem('restaurant_info');
  if (!restaurantInfo) {
    throw new Error('Restaurant information not found. Please login again.');
  }
  
  const { supabase_url, supabase_anon_key } = JSON.parse(restaurantInfo);
  
  return createClient(supabase_url, supabase_anon_key, {
    auth: {
      storage: sessionStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
};

export const getRestaurantInfo = () => {
  const restaurantInfo = sessionStorage.getItem('restaurant_info');
  if (!restaurantInfo) {
    return null;
  }
  return JSON.parse(restaurantInfo);
};
