
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Tag, Utensils, AlertCircle } from 'lucide-react';

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
}

const Menu = () => {
  const { restaurantName } = useParams();
  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout') || 'categories';
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  console.log('Menu component loaded with restaurantName:', restaurantName);

  // Fetch restaurant info by name
  const { data: restaurantInfo, isLoading: restaurantLoading, error: restaurantError } = useQuery({
    queryKey: ['restaurant-info', restaurantName],
    queryFn: async () => {
      if (!restaurantName) {
        throw new Error('Restaurant name is required');
      }
      
      console.log('Fetching restaurant info for:', restaurantName);
      
      // Main admin database
      const mainSupabase = createClient(
        'https://zijfbnubzfonpxngmqqz.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppamZibnViemZvbnB4bmdtcXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MjQwMjcsImV4cCI6MjA2NzQwMDAyN30.8Xa-6lpOYD15W4JLU0BqGBdr1zZF3wL2vjR07yJJZKQ'
      );

      // Try multiple search strategies to find the restaurant
      const searchTerms = [
        restaurantName,
        restaurantName.replace(/-/g, ' '),
        restaurantName.replace(/-/g, ' ').toLowerCase(),
        decodeURIComponent(restaurantName),
        decodeURIComponent(restaurantName.replace(/-/g, ' '))
      ];

      console.log('Trying search terms:', searchTerms);

      let restaurant = null;
      
      for (const term of searchTerms) {
        const { data, error } = await mainSupabase
          .from('restaurants')
          .select('id, supabase_url, supabase_anon_key, name')
          .or(`name.ilike.%${term}%,name.eq.${term}`)
          .limit(1);

        console.log(`Search for "${term}":`, { data, error });

        if (data && data.length > 0) {
          restaurant = data[0];
          break;
        }
      }

      if (!restaurant) {
        console.error('Restaurant not found with any search term');
        throw new Error(`Restaurant "${restaurantName}" not found`);
      }

      console.log('Found restaurant:', restaurant);
      return restaurant;
    },
    enabled: !!restaurantName,
    retry: 1
  });

  // Create restaurant-specific supabase client
  const getRestaurantSupabase = () => {
    if (!restaurantInfo) return null;
    console.log('Creating restaurant supabase client with URL:', restaurantInfo.supabase_url);
    return createClient(restaurantInfo.supabase_url, restaurantInfo.supabase_anon_key);
  };

  // Fetch restaurant profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['restaurant-profile', restaurantInfo?.id],
    queryFn: async () => {
      const supabase = getRestaurantSupabase();
      if (!supabase) throw new Error('Restaurant database not available');

      console.log('Fetching restaurant profile...');
      const { data, error } = await supabase
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
    enabled: !!restaurantInfo,
    retry: 1
  });

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', restaurantInfo?.id],
    queryFn: async () => {
      const supabase = getRestaurantSupabase();
      if (!supabase) return [];

      console.log('Fetching categories...');
      const { data, error } = await supabase
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
    enabled: !!restaurantInfo,
    retry: 1
  });

  // Fetch menu items
  const { data: menuItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['menu-items', restaurantInfo?.id, selectedCategory],
    queryFn: async () => {
      const supabase = getRestaurantSupabase();
      if (!supabase) return [];

      console.log('Fetching menu items for category:', selectedCategory);
      let query = supabase
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
    enabled: !!restaurantInfo,
    retry: 1
  });

  const formatPrice = (price: number, currency: string) => {
    return `${price.toFixed(2)} ${currency}`;
  };

  // Loading states
  if (!restaurantName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Invalid Restaurant Link</h1>
          <p className="text-muted-foreground">This menu link is not valid.</p>
        </div>
      </div>
    );
  }

  if (restaurantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Finding restaurant...</p>
        </div>
      </div>
    );
  }

  if (restaurantError || !restaurantInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Restaurant Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The restaurant "{restaurantName}" could not be found.
          </p>
          <p className="text-sm text-muted-foreground">
            Error: {restaurantError?.message}
          </p>
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

  // Categories layout
  if (layout === 'categories') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-8">
          <div className="container mx-auto px-4 text-center">
            {profile?.logo_url && (
              <img 
                src={profile.logo_url} 
                alt={profile.name} 
                className="h-16 w-16 mx-auto mb-4 rounded-full object-cover"
              />
            )}
            <h1 className="text-3xl font-bold mb-2">{profile?.name || restaurantInfo.name}</h1>
            {profile?.description && (
              <p className="text-primary-foreground/80 max-w-2xl mx-auto">{profile.description}</p>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="container mx-auto px-4 py-8">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Menu Coming Soon</h3>
              <p className="text-muted-foreground">The menu is being prepared and will be available shortly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const categoryItems = menuItems.filter(item => item.category_id === category.id);
                
                return (
                  <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        {category.name_sq || category.name}
                      </CardTitle>
                      {(category.description_sq || category.description) && (
                        <CardDescription>{category.description_sq || category.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {categoryItems.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name_sq || item.name}</h4>
                              {(item.description_sq || item.description) && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {item.description_sq || item.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-2">
                              <p className="font-semibold">{formatPrice(item.price, item.currency)}</p>
                            </div>
                          </div>
                        ))}
                        {categoryItems.length > 3 && (
                          <p className="text-sm text-muted-foreground text-center">
                            +{categoryItems.length - 3} më shumë artikuj
                          </p>
                        )}
                        {categoryItems.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center italic">
                            Asnjë artikull i disponueshëm
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // All items layout
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4 text-center">
          {profile?.logo_url && (
            <img 
              src={profile.logo_url} 
              alt={profile.name} 
              className="h-12 w-12 mx-auto mb-2 rounded-full object-cover"
            />
          )}
          <h1 className="text-2xl font-bold mb-1">{profile?.name || restaurantInfo.name}</h1>
          {profile?.description && (
            <p className="text-primary-foreground/80 text-sm">{profile.description}</p>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-4 overflow-x-auto">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Të gjitha
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.name_sq || category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-6">
        {itemsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading items...</p>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-12">
            <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nuk ka artikuj të disponueshëm</h3>
            <p className="text-muted-foreground">
              {selectedCategory ? 'Nuk ka artikuj në këtë kategori.' : 'Menuja është ende në përgatitje.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{item.name_sq || item.name}</h3>
                        {item.is_featured && (
                          <Badge variant="secondary" className="text-xs">E veçantë</Badge>
                        )}
                      </div>
                      
                      {(item.description_sq || item.description) && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description_sq || item.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {item.preparation_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.preparation_time} min
                          </div>
                        )}
                      </div>
                      
                      {item.allergens && item.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.allergens.map((allergen) => (
                            <Badge key={allergen} variant="outline" className="text-xs">
                              {allergen}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatPrice(item.price, item.currency)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
