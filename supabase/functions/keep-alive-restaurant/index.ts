import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { restaurantId, restaurantName, supabaseUrl, supabaseKey } = await req.json();

    if (!restaurantId || !supabaseUrl || !supabaseKey) {
      throw new Error('Missing required parameters');
    }

    console.log(`Starting keep-alive ping for restaurant: ${restaurantName} (${restaurantId})`);

    // Create restaurant Supabase client
    const restaurantSupabase = createClient(supabaseUrl, supabaseKey);

    // Perform a simple query to keep the database active
    // Try to check if restaurant_profile table exists and get count
    let pingResult = 'success';
    let pingDetails = '';

    try {
      const { data, error } = await restaurantSupabase
        .from('restaurant_profile')
        .select('id')
        .limit(1);

      if (error) {
        // If restaurant_profile doesn't exist, try a basic query
        console.log('restaurant_profile not found, trying basic connection test');
        const { error: basicError } = await restaurantSupabase
          .rpc('version'); // This should always work if DB is accessible

        if (basicError) {
          throw basicError;
        }
        pingDetails = 'Connected via basic query';
      } else {
        pingDetails = `Connected via restaurant_profile, found ${data?.length || 0} records`;
      }
    } catch (dbError) {
      console.error(`Database ping failed for ${restaurantName}:`, dbError);
      pingResult = 'failed';
      pingDetails = dbError.message;
    }

    // Update last_connected_at in admin database
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabaseAdmin
      .from('restaurants')
      .update({ 
        last_connected_at: new Date().toISOString(),
        connection_status: pingResult === 'success' ? 'connected' : 'error'
      })
      .eq('id', restaurantId);

    if (updateError) {
      console.error('Error updating last_connected_at:', updateError);
    }

    // Log the activity
    const { error: logError } = await supabaseAdmin
      .from('activity_logs')
      .insert({
        restaurant_id: restaurantId,
        action: 'keep_alive_ping',
        details: {
          result: pingResult,
          details: pingDetails,
          timestamp: new Date().toISOString()
        }
      });

    if (logError) {
      console.error('Error logging activity:', logError);
    }

    console.log(`Keep-alive ping completed for ${restaurantName}: ${pingResult}`);

    return new Response(
      JSON.stringify({
        success: pingResult === 'success',
        restaurantId,
        restaurantName,
        result: pingResult,
        details: pingDetails,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: pingResult === 'success' ? 200 : 500,
      }
    );

  } catch (error) {
    console.error('Error in keep-alive-restaurant:', error);
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
