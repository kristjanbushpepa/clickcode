
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { MenuFooter } from '@/components/menu/MenuFooter';
import {
  Clock,
  Phone,
} from 'lucide-react';

// Helper function to get image URL from path
const getImageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `https://zijfbnubzfonpxngmqqz.supabase.co/storage/v1/object/public/${path}`;
};

// Helper function to get display image URL with fallback
const getDisplayImageUrl = (path: string | null, url: string | null, fallback: string) => {
  if (path) {
    const imageUrl = getImageUrl(path);
    if (imageUrl) return imageUrl;
  }
  return url || fallback;
};

// Function to fetch restaurant profile from the restaurant's own database
const fetchRestaurantProfile = async (restaurantId: string) => {
  try {
    // First get restaurant connection info from main database
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();
    
    if (restaurantError) throw restaurantError;
    if (!restaurant) throw new Error('Restaurant not found');

    // Store restaurant info in session storage for getRestaurantSupabase
    sessionStorage.setItem('restaurant_info', JSON.stringify({
      supabase_url: restaurant.supabase_url,
      supabase_anon_key: restaurant.supabase_anon_key,
      restaurant_id: restaurant.id
    }));

    // Now fetch from restaurant's own database
    const restaurantSupabase = getRestaurantSupabase();
    const { data: profile, error: profileError } = await restaurantSupabase
      .from('restaurant_profile')
      .select('*')
      .maybeSingle();
    
    if (profileError) {
      console.error('Profile fetch error:', profileError);
      // Return basic restaurant info if no profile exists
      return {
        id: restaurant.id,
        name: restaurant.name,
        description: '',
        address: restaurant.address,
        phone: restaurant.owner_phone,
        email: restaurant.owner_email,
        working_hours: {},
        social_media_links: {},
        logo_url: null,
        banner_url: null,
        logo_path: null,
        banner_path: null,
        google_reviews_embed: null,
        tripadvisor_embed: null,
        yelp_embed: null,
        google_maps_embed: null
      };
    }

    return profile || {
      id: restaurant.id,
      name: restaurant.name,
      description: '',
      address: restaurant.address,
      phone: restaurant.owner_phone,
      email: restaurant.owner_email,
      working_hours: {},
      social_media_links: {},
      logo_url: null,
      banner_url: null,
      logo_path: null,
      banner_path: null,
      google_reviews_embed: null,
      tripadvisor_embed: null,
      yelp_embed: null,
      google_maps_embed: null
    };
  } catch (error) {
    console.error('Error in fetchRestaurantProfile:', error);
    throw error;
  }
};

export default function Menu() {
  const { restaurantId } = useParams();
  const [activeTab, setActiveTab] = useState('menu');

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['restaurantProfile', restaurantId],
    queryFn: () => fetchRestaurantProfile(restaurantId as string),
    enabled: !!restaurantId,
  });

  const displayLogoUrl = getDisplayImageUrl(profile?.logo_path, profile?.logo_url, '/placeholder-logo.png');
  const displayBannerUrl = getDisplayImageUrl(profile?.banner_path, profile?.banner_url, '');

  if (isError) {
    return <div>Error loading restaurant profile.</div>;
  }

  const getCurrentDayHours = () => {
    if (!profile?.working_hours) return null;
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    return profile.working_hours[today as keyof typeof profile.working_hours];
  };

  const todayHours = getCurrentDayHours();

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logo and Banner */}
      <div className="relative">
        {/* Banner Image */}
        {displayBannerUrl && (
          <div className="h-48 sm:h-64 md:h-80 overflow-hidden">
            <img
              src={displayBannerUrl}
              alt={`${profile?.name} banner`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Logo and Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
          <div className="max-w-4xl mx-auto flex items-end gap-4">
            {/* Logo */}
            {displayLogoUrl && (
              <div className="flex-shrink-0">
                <img
                  src={displayLogoUrl}
                  alt={`${profile?.name} logo`}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm object-cover"
                />
              </div>
            )}

            {/* Restaurant Info */}
            <div className="flex-1 text-white">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
                {profile?.name}
              </h1>
              
              {/* Description */}
              {profile?.description && (
                <p className="text-sm sm:text-base text-white/90 mb-2 line-clamp-2">
                  {profile.description}
                </p>
              )}

              {/* Contact Info */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-white/80">
                {todayHours && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Today: {todayHours}</span>
                  </div>
                )}
                {profile?.phone && (
                  <a href={`tel:${profile.phone}`} className="flex items-center gap-1 hover:text-white transition-colors">
                    <Phone className="h-3 w-3" />
                    <span>{profile.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fallback header when no banner */}
        {!displayBannerUrl && (
          <div className="bg-muted/30 border-b p-4">
            <div className="max-w-4xl mx-auto flex items-center gap-4">
              {displayLogoUrl && (
                <img
                  src={displayLogoUrl}
                  alt={`${profile?.name} logo`}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  {profile?.name}
                </h1>
                
                {/* Description */}
                {profile?.description && (
                  <p className="text-sm text-muted-foreground mt-1 mb-2">
                    {profile.description}
                  </p>
                )}

                {/* Contact Info */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {todayHours && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Today: {todayHours}</span>
                    </div>
                  )}
                  {profile?.phone && (
                    <a href={`tel:${profile.phone}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
                      <Phone className="h-3 w-3" />
                      <span>{profile.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex">
              <TabsTrigger value="menu" className="data-[state=active]:text-foreground">Menu</TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:text-foreground">Reviews</TabsTrigger>
              <TabsTrigger value="about" className="data-[state=active]:text-foreground">About</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto py-6 px-4">
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}
        {profile && (
          <>
            <div className={activeTab === 'menu' ? 'block' : 'hidden'}>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Menu</h2>
                <p>Menu items will be displayed here.</p>
              </div>
            </div>

            <div className={activeTab === 'reviews' ? 'block' : 'hidden'}>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Reviews</h2>
                {profile.google_reviews_embed ? (
                  <div dangerouslySetInnerHTML={{ __html: profile.google_reviews_embed }} />
                ) : (
                  <p>No reviews available.</p>
                )}
              </div>
            </div>

            <div className={activeTab === 'about' ? 'block' : 'hidden'}>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">About Us</h2>
                <p>{profile.description}</p>
                <Separator className="my-4" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      {profile && (
        <MenuFooter profile={profile} showFullContent={true} />
      )}
    </div>
  );
}
