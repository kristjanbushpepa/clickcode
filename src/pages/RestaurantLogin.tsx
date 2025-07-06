
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js';

const RestaurantLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    restaurantId: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First, get restaurant details from the main database
      const mainSupabase = createClient(
        'https://zijfbnubzfonpxngmqqz.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppamZibnViemZvbnB4bmdtcXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MjQwMjcsImV4cCI6MjA2NzQwMDAyN30.8Xa-6lpOYD15W4JLU0BqGBdr1zZF3wL2vjR07yJJZKQ'
      );

      const { data: restaurant, error: restaurantError } = await mainSupabase
        .from('restaurants')
        .select('supabase_url, supabase_anon_key, name')
        .eq('id', formData.restaurantId)
        .single();

      if (restaurantError || !restaurant) {
        toast({
          title: "Error",
          description: "Restaurant not found. Please check your Restaurant ID.",
          variant: "destructive",
        });
        return;
      }

      // Create client for restaurant's database
      const restaurantSupabase = createClient(
        restaurant.supabase_url,
        restaurant.supabase_anon_key
      );

      // Attempt to sign in
      const { data: authData, error: authError } = await restaurantSupabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        toast({
          title: "Login Failed",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (authData.user) {
        // Store restaurant info in sessionStorage for the dashboard
        sessionStorage.setItem('restaurant_info', JSON.stringify({
          id: formData.restaurantId,
          name: restaurant.name,
          supabase_url: restaurant.supabase_url,
          supabase_anon_key: restaurant.supabase_anon_key,
          user: authData.user
        }));

        toast({
          title: "Success",
          description: `Welcome to ${restaurant.name}!`,
        });

        navigate('/restaurant/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Restaurant Login</CardTitle>
          <CardDescription>
            Sign in to access your restaurant's digital menu dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restaurantId">Restaurant ID</Label>
              <Input
                id="restaurantId"
                type="text"
                value={formData.restaurantId}
                onChange={(e) => handleInputChange('restaurantId', e.target.value)}
                placeholder="Enter your restaurant ID"
                required
              />
              <p className="text-xs text-gray-500">
                Your Restaurant ID was provided by your administrator
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact your administrator for login credentials.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantLogin;
