import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';

const RestaurantLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Detect if running in PWA mode
    const checkPWA = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone === true;
    setIsPWA(checkPWA);

    // Handle viewport for PWA
    if (checkPWA) {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First, get all restaurants to find which one this user belongs to
      const mainSupabase = createClient(
        'https://zijfbnubzfonpxngmqqz.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppamZibnViemZvbnB4bmdtcXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MjQwMjcsImV4cCI6MjA2NzQwMDAyN30.8Xa-6lpOYD15W4JLU0BqGBdr1zZF3wL2vjR07yJJZKQ'
      );

      const { data: restaurants, error: restaurantError } = await mainSupabase
        .from('restaurants')
        .select('*');

      if (restaurantError || !restaurants) {
        toast({
          title: "Error",
          description: "Failed to fetch restaurant information. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Try to authenticate with each restaurant until we find a match
      let authenticatedRestaurant = null;
      let authData = null;

      for (const restaurant of restaurants) {
        try {
          const restaurantSupabase = createClient(
            restaurant.supabase_url,
            restaurant.supabase_anon_key,
            {
              auth: {
                storage: keepLoggedIn ? localStorage : sessionStorage,
                persistSession: true,
                autoRefreshToken: true,
              }
            }
          );

          const { data: authResponse, error: authError } = await restaurantSupabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (!authError && authResponse.user) {
            authenticatedRestaurant = restaurant;
            authData = authResponse;
            break;
          }
        } catch (error) {
          // Continue to next restaurant if authentication fails
          continue;
        }
      }

      if (!authenticatedRestaurant || !authData) {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please check your credentials and try again.",
          variant: "destructive",
        });
        return;
      }

      // Store restaurant info in the appropriate storage based on keepLoggedIn preference
      const storage = keepLoggedIn ? localStorage : sessionStorage;
      storage.setItem('restaurant_info', JSON.stringify({
        id: authenticatedRestaurant.id,
        name: authenticatedRestaurant.name,
        supabase_url: authenticatedRestaurant.supabase_url,
        supabase_anon_key: authenticatedRestaurant.supabase_anon_key,
        user: authData.user,
        keepLoggedIn: keepLoggedIn
      }));

      // Also store the preference for future logins
      localStorage.setItem('keep_logged_in_preference', keepLoggedIn.toString());

      toast({
        title: "Success",
        description: `Welcome to ${authenticatedRestaurant.name}!`,
      });

      navigate('/restaurant/dashboard');
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

  // Load the saved preference on component mount
  useEffect(() => {
    const savedPreference = localStorage.getItem('keep_logged_in_preference');
    if (savedPreference === 'true') {
      setKeepLoggedIn(true);
    }
  }, []);

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden",
      isPWA && "min-h-[100dvh] pt-safe-top pb-safe-bottom"
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
      <Card className="w-full max-w-md relative bg-card/80 backdrop-blur-md border-border shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary" style={{ filter: 'drop-shadow(0 0 10px hsl(var(--primary) / 0.3))' }} />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Restaurant Login</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to access your restaurant's digital menu dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
                inputMode="email"
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
                  autoComplete="current-password"
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="keep-logged-in"
                checked={keepLoggedIn}
                onCheckedChange={(checked) => setKeepLoggedIn(checked as boolean)}
              />
              <Label
                htmlFor="keep-logged-in"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Keep me logged in
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isLoading}
              style={{ boxShadow: 'var(--glow-primary)' }}
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
