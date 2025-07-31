
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Database, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  connection_status: string;
  last_connected_at: string | null;
  supabase_url: string;
  supabase_anon_key: string;
}

interface ActivityLog {
  id: string;
  restaurant_id: string;
  action: string;
  details: any;
  created_at: string;
}

export function DatabaseMonitoring() {
  const queryClient = useQueryClient();

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['restaurants-monitoring'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, connection_status, last_connected_at, supabase_url, supabase_anon_key')
        .order('name');
      
      if (error) throw error;
      return data as Restaurant[];
    },
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['keep-alive-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('action', 'keep_alive_ping')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as ActivityLog[];
    },
  });

  const pingRestaurantMutation = useMutation({
    mutationFn: async (restaurant: Restaurant) => {
      const response = await supabase.functions.invoke('keep-alive-restaurant', {
        body: {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          supabaseUrl: restaurant.supabase_url,
          supabaseKey: restaurant.supabase_anon_key
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data, restaurant) => {
      queryClient.invalidateQueries({ queryKey: ['restaurants-monitoring'] });
      queryClient.invalidateQueries({ queryKey: ['keep-alive-activity'] });
      toast({
        title: "Success",
        description: `Successfully pinged ${restaurant.name}`,
      });
    },
    onError: (error: any, restaurant) => {
      toast({
        title: "Error",
        description: `Failed to ping ${restaurant.name}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string, lastConnected: string | null) => {
    const daysSinceLastPing = lastConnected 
      ? Math.floor((Date.now() - new Date(lastConnected).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    if (status === 'connected' && daysSinceLastPing !== null && daysSinceLastPing < 6) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (status === 'error' || (daysSinceLastPing !== null && daysSinceLastPing >= 6)) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string, lastConnected: string | null) => {
    const daysSinceLastPing = lastConnected 
      ? Math.floor((Date.now() - new Date(lastConnected).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    if (status === 'connected' && daysSinceLastPing !== null && daysSinceLastPing < 6) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    } else if (status === 'error' || (daysSinceLastPing !== null && daysSinceLastPing >= 6)) {
      return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Database Monitoring</h2>
          <p className="text-gray-600">Monitor restaurant database activity and prevent timeouts</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restaurants?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Databases</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {restaurants?.filter(r => {
                const daysSince = r.last_connected_at 
                  ? Math.floor((Date.now() - new Date(r.last_connected_at).getTime()) / (1000 * 60 * 60 * 24))
                  : null;
                return r.connection_status === 'connected' && daysSince !== null && daysSince < 6;
              }).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {restaurants?.filter(r => {
                const daysSince = r.last_connected_at 
                  ? Math.floor((Date.now() - new Date(r.last_connected_at).getTime()) / (1000 * 60 * 60 * 24))
                  : null;
                return r.connection_status === 'error' || (daysSince !== null && daysSince >= 6);
              }).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Restaurant Status List */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Database Status</CardTitle>
          <CardDescription>Current status and last ping times for all restaurant databases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {restaurants?.map((restaurant) => {
              const daysSinceLastPing = restaurant.last_connected_at 
                ? Math.floor((Date.now() - new Date(restaurant.last_connected_at).getTime()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <div key={restaurant.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(restaurant.connection_status, restaurant.last_connected_at)}
                    <div>
                      <h4 className="font-medium">{restaurant.name}</h4>
                      <p className="text-sm text-gray-600">
                        {restaurant.last_connected_at 
                          ? `Last ping: ${daysSinceLastPing} days ago`
                          : 'Never pinged'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(restaurant.connection_status, restaurant.last_connected_at)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => pingRestaurantMutation.mutate(restaurant)}
                      disabled={pingRestaurantMutation.isPending}
                    >
                      {pingRestaurantMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Activity className="h-4 w-4" />
                      )}
                      Ping Now
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Keep-Alive Activity</CardTitle>
          <CardDescription>Latest database ping results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentActivity?.map((activity) => {
              const restaurant = restaurants?.find(r => r.id === activity.restaurant_id);
              const details = activity.details || {};
              
              return (
                <div key={activity.id} className="flex items-center justify-between p-2 border-l-4 border-l-gray-200">
                  <div className="flex items-center space-x-3">
                    {details.result === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {restaurant?.name || 'Unknown Restaurant'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {details.details || 'No details available'}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(activity.created_at).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
