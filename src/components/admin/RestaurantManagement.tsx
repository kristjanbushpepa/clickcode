
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { 
  Eye, 
  Trash2, 
  Globe, 
  Key, 
  Database,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Restaurant {
  id: string;
  name: string;
  owner_email: string;
  owner_full_name: string;
  city: string;
  country: string;
  connection_status: string;
  supabase_url: string;
  supabase_anon_key: string;
  created_at: string;
  last_connected_at: string | null;
}

export function RestaurantManagement() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const queryClient = useQueryClient();

  const { data: restaurants, isLoading, error } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      console.log('Fetching restaurants...');
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching restaurants:', error);
        throw error;
      }
      console.log('Restaurants fetched:', data);
      return data as Restaurant[];
    },
  });

  const deleteRestaurantMutation = useMutation({
    mutationFn: async (restaurantId: string) => {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', restaurantId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      toast({
        title: "Success",
        description: "Restaurant deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete restaurant",
        variant: "destructive",
      });
    },
  });

  const updateConnectionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('restaurants')
        .update({ 
          connection_status: status,
          last_connected_at: status === 'connected' ? new Date().toISOString() : null
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      toast({
        title: "Success",
        description: "Connection status updated",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResetPassword = async (restaurant: Restaurant) => {
    if (!newPassword) {
      toast({
        title: "Error",
        description: "Please enter a new password",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password Reset",
      description: `Password reset functionality would be implemented here for ${restaurant.name}`,
    });
    setNewPassword('');
    setSelectedRestaurant(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading restaurants:</p>
          <p className="text-sm text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600 mb-2">No restaurants found</p>
          <p className="text-sm text-gray-500">Add your first restaurant to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {restaurants?.map((restaurant) => (
          <Card key={restaurant.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                <CardDescription>
                  {restaurant.city}, {restaurant.country} • {restaurant.owner_full_name}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(restaurant.connection_status)}>
                {restaurant.connection_status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Owner: {restaurant.owner_email}
                  </p>
                  <p className="text-sm text-gray-600">
                    Database: {restaurant.supabase_url}
                  </p>
                  {restaurant.last_connected_at && (
                    <p className="text-sm text-gray-600">
                      Last connected: {new Date(restaurant.last_connected_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(restaurant.supabase_url, '_blank')}
                  >
                    <Database className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRestaurant(restaurant)}
                  >
                    <Key className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateConnectionMutation.mutate({
                      id: restaurant.id,
                      status: restaurant.connection_status === 'connected' ? 'suspended' : 'connected'
                    })}
                  >
                    <Globe className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          Delete Restaurant
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{restaurant.name}"? This action cannot be undone and will remove all restaurant data from the admin system.
                          <br /><br />
                          <strong>Note:</strong> This will not delete the restaurant's individual database - that must be handled separately in their Supabase project.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteRestaurantMutation.mutate(restaurant.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Restaurant
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Password Reset Dialog */}
      {selectedRestaurant && (
        <AlertDialog open={!!selectedRestaurant} onOpenChange={() => setSelectedRestaurant(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Password</AlertDialogTitle>
              <AlertDialogDescription>
                Reset the admin password for "{selectedRestaurant.name}" restaurant database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleResetPassword(selectedRestaurant)}>
                Reset Password
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
