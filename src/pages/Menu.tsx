import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, Tag, Utensils, AlertCircle, Search, Phone, Globe, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { convertUrlToRestaurantName, generatePossibleNames } from '@/utils/nameConversion';

interface Category {
  id: string;
  name: string;
  name_sq?: string;
  description?: string;
  description_sq?: string;
  display_order: number;
  is_active: boolean;
}

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  name_sq?: string;
  description?: string;
  description_sq?: string;
  price: number;
  currency: string;
  image_url?: string;
  is_available: boolean;
  is_featured: boolean;
  allergens: string[];
  preparation_time?: number;
  display_order: number;
}

interface RestaurantProfile {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  banner_url?: string;
  social_media_links?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    whatsapp?: string;
  };
}

interface MenuTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

interface Restaurant {
  id: string;
  name: string;
  supabase_url: string;
  supabase_anon_key: string;
}

const Menu = () => {
  const { restaurantName } = useParams();
  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout') || 'categories';
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customTheme, setCustomTheme] = useState<MenuTheme | null>(null);

  console.log('Menu component loaded with restaurantName:', restaurantName);

  // Enhanced restaurant lookup with multiple matching strategies
  const { data: restaurant, isLoading: restaurantLoading, error: restaurantError } = useQuery({
    queryKey: ['restaurant-lookup', restaurantName],
    queryFn: async () => {
      if (!restaurantName) throw new Error('Restaurant name not provided');
      
      console.log('Looking up restaurant in admin database:', restaurantName);
      
      // Generate possible name variations
      const possibleNames = generatePossibleNames(restaurantName);
      console.log('Trying these name variations:', possibleNames);
      
      // First, try exact matches with all variations
      for (const name of possibleNames) {
        console.log('Trying exact match for:', name);
        const { data, error } = await supabase
          .from('restaurants')
          .select('id, name, supabase_url, supabase_anon_key')
          .eq('name', name)
          .maybeSingle();

        if (data && !error) {
          console.log('Found restaurant with exact match:', data);
          return data as Restaurant;
        }
      }
      
      // If no exact match, try case-insensitive search
      console.log('No exact match found, trying case-insensitive search...');
      const convertedName = convertUrlToRestaurantName(restaurantName);
      console.log('Converted name for case-insensitive search:', convertedName);
      
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, supabase_url, supabase_anon_key')
        .ilike('name', `%${convertedName}%`)
        .maybeSingle();

      if (error) {
        console.error('Restaurant lookup error:', error);
        
        // Get all restaurants for debugging
        const { data: allRestaurants } = await supabase
          .from('restaurants')
          .select('name')
          .limit(10);
        
        console.log('Available restaurants in database:', allRestaurants?.map(r => r.name));
        console.log('Searched for variations:', possibleNames);
        
        throw new Error(`Restaurant not found. Searched for: ${possibleNames.join(', ')}`);
      }
      
      if (!data) {
        // Get all restaurants for debugging
        const { data: allRestaurants } = await supabase
          .from('restaurants')
          .select('name')
          .limit(10);
        
        console.log('Available restaurants in database:', allRestaurants?.map(r => r.name));
        console.log('Searched for variations:', possibleNames);
        
        throw new Error(`Restaurant "${restaurantName}" not found in database`);
      }
      
      console.log('Found restaurant with case-insensitive match:', data);
      return data as Restaurant;
    },
    enabled: !!restaurantName,
    retry: 1
  });

  // Create restaurant-specific supabase client
  const getRestaurantSupabase = () => {
    if (!restaurant) return null;
    console.log('Creating restaurant supabase client with URL:', restaurant.supabase_url);
    return createClient(restaurant.supabase_url, restaurant.supabase_anon_key);
  };

  // Fetch restaurant profile from individual database
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['restaurant-profile', restaurant?.supabase_url],
    queryFn: async () => {
      const restaurantSupabase = getRestaurantSupabase();
      if (!restaurantSupabase) throw new Error('Restaurant database not available');

      console.log('Fetching restaurant profile from individual database...');
      const { data, error } = await restaurantSupabase
        .from('restaurant_profile')
        .select('*')
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }
      
      console.log('Profile data:', data);
      return data as RestaurantProfile;
    },
    enabled: !!restaurant,
    retry: 1
  });

  // Fetch categories from individual database
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', restaurant?.supabase_url],
    queryFn: async () => {
      const restaurantSupabase = getRestaurantSupabase();
      if (!restaurantSupabase) return [];

      console.log('Fetching categories from individual database...');
      const { data, error } = await restaurantSupabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        console.error('Categories fetch error:', error);
        return [];
      }
      
      console.log('Categories data:', data);
      return data as Category[];
    },
    enabled: !!restaurant,
    retry: 1
  });

  // Fetch menu items from individual database
  const { data: menuItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['menu-items', restaurant?.supabase_url, selectedCategory],
    queryFn: async () => {
      const restaurantSupabase = getRestaurantSupabase();
      if (!restaurantSupabase) return [];

      console.log('Fetching menu items from individual database for category:', selectedCategory);
      let query = restaurantSupabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('display_order');

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Menu items fetch error:', error);
        return [];
      }
      
      console.log('Menu items data:', data);
      return data as MenuItem[];
    },
    enabled: !!restaurant,
    retry: 1
  });

  // Fetch customization settings
  const { data: customization } = useQuery({
    queryKey: ['customization', restaurant?.supabase_url],
    queryFn: async () => {
      const restaurantSupabase = getRestaurantSupabase();
      if (!restaurantSupabase) return null;

      const { data, error } = await restaurantSupabase
        .from('restaurant_customization')
        .select('*')
        .single();

      if (error) {
        console.log('No customization found, using defaults');
        return null;
      }
      
      return data;
    },
    enabled: !!restaurant,
    retry: 0
  });

  // Apply custom theme when available
  useEffect(() => {
    if (customization?.theme) {
      setCustomTheme(customization.theme);
      // Apply CSS custom properties for dynamic theming
      const root = document.documentElement;
      root.style.setProperty('--menu-primary', customization.theme.primaryColor);
      root.style.setProperty('--menu-secondary', customization.theme.secondaryColor);
      root.style.setProperty('--menu-background', customization.theme.backgroundColor);
      root.style.setProperty('--menu-text', customization.theme.textColor);
      root.style.setProperty('--menu-accent', customization.theme.accentColor);
    }
  }, [customization]);

  // Filter menu items based on search
  const filteredMenuItems = menuItems.filter(item => 
    (item.name_sq || item.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description_sq || item.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    (category.name_sq || category.name).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number, currency: string) => {
    return `${price.toFixed(2)} ${currency}`;
  };

  // Loading states
  if (!restaurantName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Invalid Menu Link</h1>
          <p className="text-muted-foreground">This menu link is not valid or has expired.</p>
        </div>
      </div>
    );
  }

  if (restaurantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Looking up restaurant...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Searching for: {convertUrlToRestaurantName(restaurantName)}
          </p>
        </div>
      </div>
    );
  }

  if (restaurantError || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Restaurant Not Found</h1>
          <p className="text-muted-foreground mb-4">
            Could not find restaurant matching "{restaurantName}".
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Searched for: {generatePossibleNames(restaurantName).join(', ')}
          </p>
          <p className="text-sm text-muted-foreground">
            Please check the URL or contact the restaurant.
          </p>
          {restaurantError && (
            <details className="mt-4 text-left">
              <summary className="text-sm cursor-pointer">Error Details</summary>
              <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">
                {restaurantError.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  if (profileLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading menu...</p>
        </div>
      </div>
    );
  }

  // Categories layout (similar to left image in reference)
  if (layout === 'categories') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: customTheme?.backgroundColor || '#ffffff' }}>
        {/* Header */}
        <div className="px-4 py-6" style={{ backgroundColor: customTheme?.primaryColor || '#1f2937', color: 'white' }}>
          <div className="max-w-md mx-auto text-center">
            {profile?.logo_url && (
              <img 
                src={profile.logo_url} 
                alt={profile.name} 
                className="h-12 w-12 mx-auto mb-3 rounded-full object-cover"
              />
            )}
            <h1 className="text-xl font-bold mb-1">{profile?.name || 'Restaurant Menu'}</h1>
            {profile?.address && (
              <p className="text-sm opacity-80">{profile.address}</p>
            )}
            
            {/* Social Media Icons */}
            {profile?.social_media_links && (
              <div className="flex justify-center gap-3 mt-3">
                {profile.social_media_links.instagram && (
                  <a href={profile.social_media_links.instagram} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-5 w-5 opacity-80 hover:opacity-100" />
                  </a>
                )}
                {profile.social_media_links.facebook && (
                  <a href={profile.social_media_links.facebook} target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-5 w-5 opacity-80 hover:opacity-100" />
                  </a>
                )}
                {profile.social_media_links.whatsapp && (
                  <a href={profile.social_media_links.whatsapp} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5 opacity-80 hover:opacity-100" />
                  </a>
                )}
                {profile?.phone && (
                  <a href={`tel:${profile.phone}`}>
                    <Phone className="h-5 w-5 opacity-80 hover:opacity-100" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-4">
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ingredients & dishes"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="px-4 pb-8">
          <div className="max-w-md mx-auto">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Menu Coming Soon</h3>
                <p className="text-muted-foreground">The menu is being prepared and will be available shortly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredCategories.map((category) => {
                  const categoryItems = menuItems.filter(item => item.category_id === category.id);
                  
                  return (
                    <Card 
                      key={category.id} 
                      className="hover:shadow-md transition-all cursor-pointer h-32"
                      style={{ borderColor: customTheme?.accentColor }}
                    >
                      <CardContent className="p-4 h-full flex flex-col">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1" style={{ color: customTheme?.textColor }}>
                            {category.name_sq || category.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {categoryItems.slice(0, 2).map(item => item.name_sq || item.name).join(', ')}
                            {categoryItems.length > 2 && '...'}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Items layout (similar to right image in reference)
  return (
    <div className="min-h-screen" style={{ backgroundColor: customTheme?.backgroundColor || '#ffffff' }}>
      {/* Header */}
      <div className="px-4 py-6" style={{ backgroundColor: customTheme?.primaryColor || '#1f2937', color: 'white' }}>
        <div className="max-w-md mx-auto text-center">
          {profile?.logo_url && (
            <img 
              src={profile.logo_url} 
              alt={profile.name} 
              className="h-12 w-12 mx-auto mb-3 rounded-full object-cover"
            />
          )}
          <h1 className="text-xl font-bold mb-1">{profile?.name || 'Restaurant Menu'}</h1>
          {profile?.address && (
            <p className="text-sm opacity-80">{profile.address}</p>
          )}
          
          {/* Social Media Icons */}
          {profile?.social_media_links && (
            <div className="flex justify-center gap-3 mt-3">
              {profile.social_media_links.instagram && (
                <a href={profile.social_media_links.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5 opacity-80 hover:opacity-100" />
                </a>
              )}
              {profile.social_media_links.facebook && (
                <a href={profile.social_media_links.facebook} target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5 opacity-80 hover:opacity-100" />
                </a>
              )}
              {profile.social_media_links.whatsapp && (
                <a href={profile.social_media_links.whatsapp} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 opacity-80 hover:opacity-100" />
                </a>
              )}
              {profile?.phone && (
                <a href={`tel:${profile.phone}`}>
                  <Phone className="h-5 w-5 opacity-80 hover:opacity-100" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Categories Title */}
      <div className="px-4 py-4">
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-center" style={{ color: customTheme?.textColor }}>
            Categories
          </h2>
        </div>
      </div>

      {/* Categories List */}
      <div className="px-4 pb-8">
        <div className="max-w-md mx-auto space-y-3">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Menu Coming Soon</h3>
              <p className="text-muted-foreground">The menu is being prepared and will be available shortly.</p>
            </div>
          ) : (
            filteredCategories.map((category) => {
              const categoryItems = menuItems.filter(item => item.category_id === category.id);
              
              return (
                <div key={category.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                        <Tag className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium" style={{ color: customTheme?.textColor }}>
                          {category.name_sq || category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      </div>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
