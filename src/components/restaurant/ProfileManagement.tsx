
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Building2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BasicInformation } from './profile/BasicInformation';
import { WorkingHours } from './profile/WorkingHours';
import { SocialMediaLinks } from './profile/SocialMediaLinks';
import { MediaUpload } from './profile/MediaUpload';
import { ConnectionError } from './profile/ConnectionError';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';

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

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const supabase = getRestaurantSupabase();
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
    setIsLoading(true);
    try {
      const supabase = getRestaurantSupabase();
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

  if (connectionError) {
    return <ConnectionError connectionError={connectionError} />;
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
        <BasicInformation register={register} errors={errors} />
        <WorkingHours register={register} />
        <SocialMediaLinks register={register} />
        <MediaUpload register={register} />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>
    </div>
  );
}
