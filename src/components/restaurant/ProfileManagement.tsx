
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js';
import { Building2, Clock, Instagram, Facebook, Upload, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RestaurantProfile {
  id?: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  working_hours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  social_media_links: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    whatsapp?: string;
  };
  logo_url?: string;
  banner_url?: string;
  google_reviews_embed?: string;
}

export function ProfileManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RestaurantProfile>();

  // Get restaurant info from session storage and create client
  const getRestaurantClient = () => {
    try {
      const restaurantInfo = sessionStorage.getItem('restaurant_info');
      if (!restaurantInfo) {
        setConnectionError('Restaurant connection not found. Please login again.');
        return null;
      }
      
      const info = JSON.parse(restaurantInfo);
      if (!info.supabase_url || !info.supabase_anon_key) {
        setConnectionError('Invalid restaurant connection data. Please login again.');
        return null;
      }
      
      return createClient(info.supabase_url, info.supabase_anon_key);
    } catch (error) {
      setConnectionError('Failed to parse restaurant connection data. Please login again.');
      return null;
    }
  };

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const supabase = getRestaurantClient();
    if (!supabase) return;

    try {
      setConnectionError(null);
      const { data, error } = await supabase
        .from('restaurant_profile')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        reset(data);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setConnectionError('Failed to load restaurant profile from your database.');
      toast({
        title: "Error",
        description: "Failed to load restaurant profile.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: RestaurantProfile) => {
    const supabase = getRestaurantClient();
    if (!supabase) return;

    setIsLoading(true);
    try {
      setConnectionError(null);
      const profileData = {
        ...data,
        working_hours: data.working_hours || {},
        social_media_links: data.social_media_links || {},
      };

      let result;
      if (profile?.id) {
        result = await supabase
          .from('restaurant_profile')
          .update(profileData)
          .eq('id', profile.id);
      } else {
        result = await supabase
          .from('restaurant_profile')
          .insert([profileData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: "Restaurant profile updated successfully in your database!",
      });

      loadProfile();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setConnectionError('Failed to save profile to your restaurant database.');
      toast({
        title: "Error",
        description: "Failed to save restaurant profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  if (connectionError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {connectionError}
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.location.href = '/restaurant/login'}>
          Return to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Restaurant Profile</h1>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This data is stored in your individual restaurant database and is completely separate from the admin system.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update your restaurant's basic details and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  {...register("name", { required: "Restaurant name is required" })}
                  placeholder="Enter restaurant name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="restaurant@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="+355 69 123 4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describe your restaurant..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...register("address")}
                placeholder="Enter full address..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Working Hours
            </CardTitle>
            <CardDescription>
              Set your opening hours for each day of the week.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {daysOfWeek.map((day) => (
                <div key={day} className="space-y-2">
                  <Label htmlFor={day} className="capitalize">{day}</Label>
                  <Input
                    id={day}
                    {...register(`working_hours.${day}` as keyof RestaurantProfile)}
                    placeholder="e.g., 9:00 AM - 10:00 PM"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media & Online Presence</CardTitle>
            <CardDescription>
              Add your social media links and Google Reviews embed code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  {...register("social_media_links.instagram")}
                  placeholder="https://instagram.com/yourrestaurant"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  {...register("social_media_links.facebook")}
                  placeholder="https://facebook.com/yourrestaurant"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok</Label>
                <Input
                  id="tiktok"
                  {...register("social_media_links.tiktok")}
                  placeholder="https://tiktok.com/@yourrestaurant"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  {...register("social_media_links.whatsapp")}
                  placeholder="+355 69 123 4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="google_reviews_embed">Google Reviews Embed Code</Label>
              <Textarea
                id="google_reviews_embed"
                {...register("google_reviews_embed")}
                placeholder="Paste your Google Reviews embed code here..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Media Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Images
            </CardTitle>
            <CardDescription>
              Upload your restaurant logo and banner image. (File upload functionality will be implemented in the next phase)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Logo URL (temporary)</Label>
                <Input
                  {...register("logo_url")}
                  placeholder="https://example.com/logo.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label>Banner URL (temporary)</Label>
                <Input
                  {...register("banner_url")}
                  placeholder="https://example.com/banner.jpg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>
    </div>
  );
}
