
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RestaurantPingData {
  id: string;
  name: string;
  supabase_url: string;
  supabase_anon_key: string;
  connection_status: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin Supabase client using service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching active restaurants for ping...');

    // Fetch all active restaurants
    const { data: restaurants, error } = await supabaseAdmin
      .from('restaurants')
      .select('id, name, supabase_url, supabase_anon_key, connection_status')
      .in('connection_status', ['connected', 'pending'])
      .order('name');

    if (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }

    console.log(`Found ${restaurants?.length || 0} restaurants to ping`);

    // Format the data for GitHub Actions matrix
    const restaurantMatrix = restaurants?.map((restaurant: RestaurantPingData) => ({
      id: restaurant.id,
      name: restaurant.name.replace(/[^a-zA-Z0-9]/g, '_'), // Sanitize name for GitHub Actions
      url: restaurant.supabase_url,
      key: restaurant.supabase_anon_key,
      status: restaurant.connection_status
    })) || [];

    return new Response(
      JSON.stringify({
        success: true,
        count: restaurantMatrix.length,
        restaurants: restaurantMatrix
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in get-restaurants-for-ping:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
