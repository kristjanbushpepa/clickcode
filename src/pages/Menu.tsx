import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Tag, Utensils, AlertCircle, Search, Phone, Globe, Instagram, Facebook, MessageCircle, ArrowLeft } from 'lucide-react';
import { convertUrlToRestaurantName, generatePossibleNames } from '@/utils/nameConversion';
import { LanguageSwitch } from '@/components/menu/LanguageSwitch';
import { CurrencySwitch } from '@/components/menu/CurrencySwitch';
import { MenuFooter } from '@/components/menu/MenuFooter';

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
  image_path?: string;
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
  logo_path?: string;
  banner_path?: string;
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
  const [currentLanguage, setCurrentLanguage] = useState('sq');
  const [currentCurrency, setCurrentCurrency] = useState('ALL');

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

  // Helper function to get image URL from path
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    const restaurantSupabase = getRestaurantSupabase();
    if (!restaurantSupabase) return null;
    
    const { data } = restaurantSupabase.storage
      .from('restaurant-images')
      .getPublicUrl(imagePath);
    
    return data.publicUrl;
  };

  // Helper function to get the display image URL (prioritizing uploaded images)
  const getDisplayImageUrl = (imagePath?: string, imageUrl?: string) => {
    if (imagePath) {
      return getImageUrl(imagePath);
    }
    return imageUrl || null;
  };

  // Helper function to get menu item image URL
  const getMenuItemImageUrl = (item: MenuItem) => {
    return getDisplayImageUrl(item.image_path, item.image_url);
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

  // Set up real-time updates for customization changes
  useEffect(() => {
    const restaurantSupabase = getRestaurantSupabase();
    if (!restaurantSupabase) return;

    const channel = restaurantSupabase
      .channel('customization-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restaurant_customization'
        },
        (payload) => {
          console.log('Customization updated:', payload);
          // Refetch customization data
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      restaurantSupabase.removeChannel(channel);
    };
  }, [restaurant]);

  // Filter menu items based on search
  const filteredMenuItems = menuItems.filter(item => 
    (item.name_sq || item.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description_sq || item.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    (category.name_sq || category.name).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch currency settings for conversion
  const { data: currencySettings } = useQuery({
    queryKey: ['currency_settings_menu'],
    queryFn: async () => {
      const restaurantSupabase = getRestaurantSupabase();
      if (!restaurantSupabase) return null;
      
      const { data, error } = await restaurantSupabase
        .from('currency_settings')
        .select('*')
        .maybeSingle();
      
      if (error) return null;
      return data;
    },
    enabled: !!restaurant
  });

  const formatPrice = (price: number, originalCurrency: string) => {
    if (!currencySettings || currentCurrency === originalCurrency) {
      return `${price.toFixed(2)} ${currentCurrency}`;
    }
    
    const exchangeRates = currencySettings.exchange_rates || {};
    const originalRate = exchangeRates[originalCurrency] || 1;
    const targetRate = exchangeRates[currentCurrency] || 1;
    
    // Convert to base currency (ALL) first, then to target currency
    const convertedPrice = (price / originalRate) * targetRate;
    
    const symbols: Record<string, string> = {
      'ALL': 'L',
      'EUR': '€',
      'USD': '$',
      'GBP': '£',
      'CHF': 'CHF'
    };
    
    const symbol = symbols[currentCurrency] || currentCurrency;
    return `${convertedPrice.toFixed(2)} ${symbol}`;
  };

  const getLocalizedText = (item: any, field: string) => {
    const languageField = `${field}_${currentLanguage}`;
    return item[languageField] || item[field] || '';
  };

  // Get the final banner and logo URLs (prioritizing uploaded images)
  const bannerImageUrl = profile ? getDisplayImageUrl(profile.banner_path, profile.banner_url) : null;
  const logoImageUrl = profile ? getDisplayImageUrl(profile.logo_path, profile.logo_url) : null;

  // Loading states
  if (!restaurantName) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold mb-3">Invalid Menu Link</h1>
          <p className="text-sm text-muted-foreground">This menu link is not valid or has expired.</p>
        </div>
      </div>
    );
  }

  if (restaurantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-sm">Looking up restaurant...</p>
          <p className="text-xs text-muted-foreground mt-2">
            Searching for: {convertUrlToRestaurantName(restaurantName)}
          </p>
        </div>
      </div>
    );
  }

  if (restaurantError || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold mb-3">Restaurant Not Found</h1>
          <p className="text-sm text-muted-foreground mb-3">
            Could not find restaurant matching "{restaurantName}".
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Searched for: {generatePossibleNames(restaurantName).join(', ')}
          </p>
          <p className="text-xs text-muted-foreground">
            Please check the URL or contact the restaurant.
          </p>
          {restaurantError && (
            <details className="mt-3 text-left">
              <summary className="text-xs cursor-pointer">Error Details</summary>
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-sm">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Categories layout (similar to left image in reference)
  if (layout === 'categories') {
    // If a category is selected, show its items
    if (selectedCategory) {
      const currentCategory = categories.find(cat => cat.id === selectedCategory);
      
      return (
        <div className="min-h-screen" style={{ backgroundColor: customTheme?.backgroundColor || '#ffffff' }}>
          {/* Header */}
          <div className="relative">
            {/* Background Image/Banner */}
            {bannerImageUrl && (
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bannerImageUrl})` }}
              >
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
            )}
            
            <div 
              className="relative px-3 py-4 safe-area-top"
              style={{ 
                backgroundColor: bannerImageUrl ? 'transparent' : (customTheme?.primaryColor || '#1f2937'),
                color: 'white' 
              }}
            >
              <div className="max-w-sm mx-auto">
                {/* Back button and category title */}
                <div className="flex items-center gap-2 mb-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedCategory(null)}
                    className="text-white hover:bg-white/20 p-2 h-8 w-8"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h1 className="text-lg font-bold uppercase tracking-wide">
                    {getLocalizedText(currentCategory, 'name')}
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-3 py-3">
            <div className="max-w-sm mx-auto space-y-3">
              {filteredMenuItems.length === 0 ? (
                <div className="text-center py-8">
                  <Utensils className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No items found in this category.</p>
                </div>
              ) : (
                filteredMenuItems.map((item) => {
                  const itemImageUrl = getMenuItemImageUrl(item);
                  
                  return (
                    <Card key={item.id} className="p-3 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm mb-1 leading-tight" style={{ color: customTheme?.textColor }}>
                            {getLocalizedText(item, 'name')}
                          </h3>
                          {getLocalizedText(item, 'description') && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {getLocalizedText(item, 'description')}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {formatPrice(item.price, item.currency)}
                            </Badge>
                            {item.preparation_time && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {item.preparation_time}min
                              </div>
                            )}
                          </div>
                        </div>
                        {itemImageUrl && (
                          <img 
                            src={itemImageUrl} 
                            alt={item.name_sq || item.name}
                            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* Add Footer - Only show basic version for category pages */}
          <MenuFooter profile={profile} customTheme={customTheme} showFullContent={false} />
        </div>
      );
    }

    // Show categories grid
    return (
      <div className="min-h-screen" style={{ backgroundColor: customTheme?.backgroundColor || '#ffffff' }}>
        {/* Header */}
        <div className="relative">
          {/* Background Image/Banner */}
          {bannerImageUrl && (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${bannerImageUrl})` }}
            >
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          )}
          
          <div 
            className="relative px-3 py-4 safe-area-top"
            style={{ 
              backgroundColor: bannerImageUrl ? 'transparent' : (customTheme?.primaryColor || '#1f2937'),
              color: 'white' 
            }}
          >
            <div className="max-w-sm mx-auto">
              {/* Top section with logo */}
              <div className="flex justify-between items-start mb-3">
                {logoImageUrl && (
                  <img 
                    src={logoImageUrl} 
                    alt={profile?.name} 
                    className="h-8 w-8 rounded-full object-cover bg-white/10 backdrop-blur-sm p-1"
                  />
                )}
                <div className="flex gap-1">
                  <LanguageSwitch 
                    restaurantSupabase={getRestaurantSupabase()} 
                    currentLanguage={currentLanguage}
                    onLanguageChange={setCurrentLanguage}
                  />
                  <CurrencySwitch 
                    restaurantSupabase={getRestaurantSupabase()} 
                    currentCurrency={currentCurrency}
                    onCurrencyChange={setCurrentCurrency}
                  />
                </div>
              </div>
              
              {/* Restaurant info centered */}
              <div className="text-center">
                <h1 className="text-lg font-bold mb-1 uppercase tracking-wide">
                  {profile?.name || 'Restaurant Menu'}
                </h1>
                {profile?.address && (
                  <p className="text-xs opacity-80 uppercase tracking-wide mb-2">
                    {profile.address.split(',')[0] || profile.address}
                  </p>
                )}
                
                {/* Social Media Icons */}
                <div className="flex justify-center gap-3 mb-1">
                  {profile?.social_media_links?.instagram && (
                    <a href={profile.social_media_links.instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-4 w-4 opacity-80 hover:opacity-100" />
                    </a>
                  )}
                  {profile?.phone && (
                    <a href={`tel:${profile.phone}`}>
                      <Phone className="h-4 w-4 opacity-80 hover:opacity-100" />
                    </a>
                  )}
                  {profile?.social_media_links?.facebook && (
                    <a href={profile.social_media_links.facebook} target="_blank" rel="noopener noreferrer">
                      <Facebook className="h-4 w-4 opacity-80 hover:opacity-100" />
                    </a>
                  )}
                  <Globe className="h-4 w-4 opacity-80" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-3 py-3">
          <div className="max-w-sm mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ingredients & dishes"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="px-3 pb-6">
          <div className="max-w-sm mx-auto">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-8">
                <Utensils className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-semibold mb-2">Menu Coming Soon</h3>
                <p className="text-sm text-muted-foreground">The menu is being prepared and will be available shortly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredCategories.map((category) => {
                  const categoryItems = menuItems.filter(item => item.category_id === category.id);
                  
                  return (
                    <Card 
                      key={category.id} 
                      className="hover:shadow-md transition-all cursor-pointer h-28"
                      style={{ borderColor: customTheme?.accentColor }}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <CardContent className="p-3 h-full flex flex-col">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1" style={{ color: customTheme?.textColor }}>
                            {getLocalizedText(category, 'name')}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {categoryItems.slice(0, 2).map(item => getLocalizedText(item, 'name')).join(', ')}
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

        {/* Add Footer - Show full content on front page */}
        <MenuFooter profile={profile} customTheme={customTheme} showFullContent={true} />
      </div>
    );
  }

  // Items layout - Lista e artikujve (list of items with category tabs)
  return (
    <div className="min-h-screen" style={{ backgroundColor: customTheme?.backgroundColor || '#ffffff' }}>
      {/* Header */}
      <div className="relative">
        {/* Background Image/Banner */}
        {bannerImageUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bannerImageUrl})` }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        )}
        
        <div 
          className="relative px-3 py-4 safe-area-top"
          style={{ 
            backgroundColor: bannerImageUrl ? 'transparent' : (customTheme?.primaryColor || '#1f2937'),
            color: 'white' 
          }}
        >
          <div className="max-w-sm mx-auto">
            {/* Top section with logo */}
            <div className="flex justify-between items-start mb-3">
              {logoImageUrl && (
                <img 
                  src={logoImageUrl} 
                  alt={profile?.name} 
                  className="h-8 w-8 rounded-full object-cover bg-white/10 backdrop-blur-sm p-1"
                />
              )}
              <div className="flex gap-1">
                <LanguageSwitch 
                  restaurantSupabase={getRestaurantSupabase()} 
                  currentLanguage={currentLanguage}
                  onLanguageChange={setCurrentLanguage}
                />
                <CurrencySwitch 
                  restaurantSupabase={getRestaurantSupabase()} 
                  currentCurrency={currentCurrency}
                  onCurrencyChange={setCurrentCurrency}
                />
              </div>
            </div>
            
            {/* Restaurant info centered */}
            <div className="text-center">
              <h1 className="text-lg font-bold mb-1 uppercase tracking-wide">
                {profile?.name || 'Restaurant Menu'}
              </h1>
              {profile?.address && (
                <p className="text-xs opacity-80 uppercase tracking-wide mb-2">
                  {profile.address.split(',')[0] || profile.address}
                </p>
              )}
              
              {/* Social Media Icons */}
              <div className="flex justify-center gap-3 mb-1">
                {profile?.social_media_links?.instagram && (
                  <a href={profile.social_media_links.instagram} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4 opacity-80 hover:opacity-100" />
                  </a>
                )}
                {profile?.phone && (
                  <a href={`tel:${profile.phone}`}>
                    <Phone className="h-4 w-4 opacity-80 hover:opacity-100" />
                  </a>
                )}
                {profile?.social_media_links?.facebook && (
                  <a href={profile.social_media_links.facebook} target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-4 w-4 opacity-80 hover:opacity-100" />
                  </a>
                )}
                <Globe className="h-4 w-4 opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Categories and Items */}
      <div className="px-3 py-3">
        <div className="max-w-sm mx-auto">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-3 h-9" style={{ 
              backgroundColor: customTheme?.secondaryColor + '20' || undefined,
              borderColor: customTheme?.accentColor || undefined 
            }}>
              <TabsTrigger value="all" className="text-xs h-7">
                All
              </TabsTrigger>
              {filteredCategories.slice(0, 3).map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs h-7">
                  {(category.name_sq || category.name).length > 8 
                    ? (category.name_sq || category.name).substring(0, 8) + '...'
                    : (category.name_sq || category.name)
                  }
                </TabsTrigger>
              ))}
            </TabsList>

            {/* All Items Tab */}
            <TabsContent value="all" className="space-y-3">
              <h3 className="text-base font-semibold mb-3" style={{ color: customTheme?.textColor }}>
                Lista e Artikujve
              </h3>
              {menuItems.length === 0 ? (
                <div className="text-center py-8">
                  <Utensils className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No items available.</p>
                </div>
              ) : (
                filteredMenuItems.map((item) => {
                  const itemImageUrl = getMenuItemImageUrl(item);
                  
                  return (
                    <Card key={item.id} className="p-3 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1 gap-2">
                            <h3 className="font-semibold text-sm leading-tight" style={{ color: customTheme?.textColor }}>
                              {getLocalizedText(item, 'name')}
                            </h3>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {formatPrice(item.price, item.currency)}
                            </Badge>
                          </div>
                          {getLocalizedText(item, 'description') && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {getLocalizedText(item, 'description')}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {categories.find(cat => cat.id === item.category_id)?.name_sq || 
                               categories.find(cat => cat.id === item.category_id)?.name}
                            </Badge>
                            {item.preparation_time && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {item.preparation_time}min
                              </div>
                            )}
                          </div>
                        </div>
                        {itemImageUrl && (
                          <img 
                            src={itemImageUrl} 
                            alt={item.name_sq || item.name}
                            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            {/* Category-specific tabs */}
            {filteredCategories.slice(0, 3).map((category) => {
              const categoryItems = menuItems.filter(item => item.category_id === category.id);
              
              return (
                <TabsContent key={category.id} value={category.id} className="space-y-3">
                  <h3 className="text-base font-semibold mb-3" style={{ color: customTheme?.textColor }}>
                    {getLocalizedText(category, 'name')}
                  </h3>
                  {categoryItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Utensils className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No items in this category.</p>
                    </div>
                  ) : (
                    categoryItems.map((item) => {
                      const itemImageUrl = getMenuItemImageUrl(item);
                      
                      return (
                        <Card key={item.id} className="p-3 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1 gap-2">
                                <h3 className="font-semibold text-sm leading-tight" style={{ color: customTheme?.textColor }}>
                                  {getLocalizedText(item, 'name')}
                                </h3>
                                <Badge variant="secondary" className="text-xs flex-shrink-0">
                                  {formatPrice(item.price, item.currency)}
                                </Badge>
                              </div>
                              {getLocalizedText(item, 'description') && (
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                  {getLocalizedText(item, 'description')}
                                </p>
                              )}
                              {item.preparation_time && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {item.preparation_time}min
                                </div>
                              )}
                            </div>
                            {itemImageUrl && (
                              <img 
                                src={itemImageUrl} 
                                alt={item.name_sq || item.name}
                                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                          </div>
                        </Card>
                      );
                    })
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>

      {/* Add Footer - Show full content on items layout front page */}
      <MenuFooter profile={profile} customTheme={customTheme} showFullContent={true} />
    </div>
  );
};

export default Menu;
