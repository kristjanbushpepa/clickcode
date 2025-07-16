import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { createRestaurantSupabase } from '@/utils/restaurantDatabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Clock, Tag, Utensils, AlertCircle, Search, Phone, Globe, Instagram, Facebook, ArrowLeft, Star, MapPin } from 'lucide-react';
import { convertUrlToRestaurantName, generatePossibleNames } from '@/utils/nameConversion';
import { LanguageSwitch } from '@/components/menu/LanguageSwitch';
import { CurrencySwitch } from '@/components/menu/CurrencySwitch';
import { MenuFooter } from '@/components/menu/MenuFooter';
import { PopupModal } from '@/components/menu/PopupModal';
import { EnhancedMenuItem } from '@/components/menu/EnhancedMenuItem';
import { MenuLoadingSkeleton, CategorySkeleton } from '@/components/menu/MenuSkeleton';
import MenuItemPopup from '@/components/menu/MenuItemPopup';
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
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardBackground: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  headingColor?: string;
  categoryNameColor?: string;
  itemNameColor?: string;
  descriptionColor?: string;
  priceColor?: string;
}
interface Restaurant {
  id: string;
  name: string;
  supabase_url: string;
  supabase_anon_key: string;
}
const EnhancedMenu = () => {
  const {
    restaurantName
  } = useParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customTheme, setCustomTheme] = useState<MenuTheme | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('sq');
  const [currentCurrency, setCurrentCurrency] = useState('ALL');
  const [restaurantSupabase, setRestaurantSupabase] = useState<any>(null);
  const [layoutPreference, setLayoutPreference] = useState<'categories' | 'items'>('items');
  const [layoutStyle, setLayoutStyle] = useState<'compact' | 'card-grid' | 'image-focus' | 'minimal' | 'magazine'>('compact');
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

  // Restaurant lookup query
  const {
    data: restaurant,
    isLoading: restaurantLoading,
    error: restaurantError
  } = useQuery({
    queryKey: ['restaurant-lookup', restaurantName],
    queryFn: async () => {
      if (!restaurantName) throw new Error('Restaurant name not provided');
      const possibleNames = generatePossibleNames(restaurantName);
      for (const name of possibleNames) {
        const {
          data,
          error
        } = await supabase.from('restaurants').select('id, name, supabase_url, supabase_anon_key').eq('name', name).maybeSingle();
        if (data && !error) {
          return data as Restaurant;
        }
      }
      const convertedName = convertUrlToRestaurantName(restaurantName);
      const {
        data,
        error
      } = await supabase.from('restaurants').select('id, name, supabase_url, supabase_anon_key').ilike('name', `%${convertedName}%`).maybeSingle();
      if (error || !data) {
        throw new Error(`Restaurant "${restaurantName}" not found`);
      }
      return data as Restaurant;
    },
    enabled: !!restaurantName,
    retry: 1,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Create restaurant supabase client
  useEffect(() => {
    if (restaurant) {
      const client = createRestaurantSupabase(restaurant.supabase_url, restaurant.supabase_anon_key);
      setRestaurantSupabase(client);
    }
  }, [restaurant]);

  // Profile query
  const {
    data: profile,
    isLoading: profileLoading
  } = useQuery({
    queryKey: ['restaurant-profile', restaurant?.supabase_url],
    queryFn: async () => {
      if (!restaurantSupabase) throw new Error('Restaurant database not available');
      const {
        data,
        error
      } = await restaurantSupabase.from('restaurant_profile').select('*').single();
      if (error) throw error;
      return data as RestaurantProfile;
    },
    enabled: !!restaurantSupabase,
    retry: 1,
    staleTime: 5 * 60 * 1000
  });

  // Categories query
  const {
    data: categories = [],
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['categories', restaurant?.supabase_url],
    queryFn: async () => {
      if (!restaurantSupabase) return [];
      const {
        data,
        error
      } = await restaurantSupabase.from('categories').select('*').eq('is_active', true).order('display_order');
      if (error) return [];
      return data as Category[];
    },
    enabled: !!restaurantSupabase,
    retry: 1,
    staleTime: 2 * 60 * 1000
  });

  // Menu items query
  const {
    data: menuItems = [],
    isLoading: itemsLoading
  } = useQuery({
    queryKey: ['menu-items', restaurant?.supabase_url, selectedCategory],
    queryFn: async () => {
      if (!restaurantSupabase) return [];
      let query = restaurantSupabase.from('menu_items').select('*').eq('is_available', true).order('is_featured', {
        ascending: false
      }).order('display_order');
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }
      const {
        data,
        error
      } = await query;
      if (error) return [];
      return data as MenuItem[];
    },
    enabled: !!restaurantSupabase,
    retry: 1,
    staleTime: 2 * 60 * 1000
  });

  // Customization query
  const {
    data: customization
  } = useQuery({
    queryKey: ['customization', restaurant?.supabase_url],
    queryFn: async () => {
      if (!restaurantSupabase) return null;
      const {
        data,
        error
      } = await restaurantSupabase.from('restaurant_customization').select('*').order('updated_at', {
        ascending: false
      }).limit(1).maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!restaurantSupabase,
    retry: 0,
    staleTime: 5 * 60 * 1000
  });

  // Currency settings query
  const {
    data: currencySettings
  } = useQuery({
    queryKey: ['currency_settings_menu', restaurant?.supabase_url],
    queryFn: async () => {
      if (!restaurantSupabase) return null;
      const {
        data,
        error
      } = await restaurantSupabase.from('currency_settings').select('*').maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!restaurantSupabase,
    staleTime: 5 * 60 * 1000
  });

  // Popup settings query
  const {
    data: popupSettings
  } = useQuery({
    queryKey: ['popup_settings_menu', restaurant?.supabase_url],
    queryFn: async () => {
      if (!restaurantSupabase) return null;
      const {
        data,
        error
      } = await restaurantSupabase.from('restaurant_customization').select('popup_settings').single();
      if (error) return null;
      return data?.popup_settings;
    },
    enabled: !!restaurantSupabase,
    staleTime: 5 * 60 * 1000
  });

  // Apply theme and layout when customization loads
  useEffect(() => {
    if (customization) {
      if (customization.theme) {
        setCustomTheme(customization.theme);
      }
      if (customization.layout) {
        setLayoutPreference(customization.layout);
      }
      if (customization.layout_style) {
        setLayoutStyle(customization.layout_style);
      }
    }
    if (!customization?.theme) {
      setCustomTheme({
        mode: 'light',
        primaryColor: '#1f2937',
        accentColor: '#3b82f6',
        backgroundColor: '#ffffff',
        cardBackground: '#ffffff',
        textColor: '#1f2937',
        mutedTextColor: '#6b7280',
        borderColor: '#e5e7eb',
        headingColor: '#111827',
        categoryNameColor: '#1f2937',
        itemNameColor: '#111827',
        descriptionColor: '#6b7280',
        priceColor: '#059669'
      });
    }
  }, [customization]);

  // Image URL helpers
  const getImageUrl = useCallback((imagePath: string) => {
    if (!imagePath || !restaurantSupabase) return null;
    const {
      data
    } = restaurantSupabase.storage.from('restaurant-images').getPublicUrl(imagePath);
    return data.publicUrl;
  }, [restaurantSupabase]);
  const getDisplayImageUrl = useCallback((imagePath?: string, imageUrl?: string) => {
    if (imagePath) {
      return getImageUrl(imagePath);
    }
    return imageUrl || null;
  }, [getImageUrl]);
  const getMenuItemImageUrl = useCallback((item: MenuItem) => {
    return getDisplayImageUrl(item.image_path, item.image_url);
  }, [getDisplayImageUrl]);

  // Memoized computed values
  const bannerImageUrl = useMemo(() => profile ? getDisplayImageUrl(profile.banner_path, profile.banner_url) : null, [profile, getDisplayImageUrl]);
  const logoImageUrl = useMemo(() => profile ? getDisplayImageUrl(profile.logo_path, profile.logo_url) : null, [profile, getDisplayImageUrl]);
  const filteredMenuItems = useMemo(() => menuItems.filter(item => (item.name_sq || item.name).toLowerCase().includes(searchTerm.toLowerCase()) || (item.description_sq || item.description || '').toLowerCase().includes(searchTerm.toLowerCase())), [menuItems, searchTerm]);
  const filteredCategories = useMemo(() => categories.filter(category => (category.name_sq || category.name).toLowerCase().includes(searchTerm.toLowerCase())), [categories, searchTerm]);

  // Utility functions
  const formatPrice = useCallback((price: number, originalCurrency: string) => {
    if (!currencySettings || currentCurrency === originalCurrency) {
      return `${price.toFixed(2)} ${currentCurrency}`;
    }
    const exchangeRates = currencySettings.exchange_rates || {};
    const originalRate = exchangeRates[originalCurrency] || 1;
    const targetRate = exchangeRates[currentCurrency] || 1;
    const convertedPrice = price / originalRate * targetRate;
    const symbols: Record<string, string> = {
      'ALL': 'L',
      'EUR': '€',
      'USD': '$',
      'GBP': '£',
      'CHF': 'CHF'
    };
    const symbol = symbols[currentCurrency] || currentCurrency;
    return `${convertedPrice.toFixed(2)} ${symbol}`;
  }, [currencySettings, currentCurrency]);
  const getLocalizedText = useCallback((item: any, field: string) => {
    const languageField = `${field}_${currentLanguage}`;
    return item[languageField] || item[field] || '';
  }, [currentLanguage]);
  const handleMenuItemClick = useCallback((item: MenuItem) => {
    setSelectedMenuItem(item);
  }, []);

  // Theme styles
  const themeStyles = useMemo(() => customTheme ? {
    backgroundColor: customTheme.backgroundColor,
    color: customTheme.textColor
  } : {}, [customTheme]);
  const cardStyles = useMemo(() => customTheme ? {
    backgroundColor: customTheme.cardBackground,
    borderColor: customTheme.borderColor,
    color: customTheme.textColor
  } : {}, [customTheme]);
  const headingStyles = useMemo(() => customTheme ? {
    color: customTheme.headingColor || customTheme.textColor
  } : {}, [customTheme]);
  const categoryNameStyles = useMemo(() => customTheme ? {
    color: customTheme.categoryNameColor || customTheme.textColor
  } : {}, [customTheme]);
  const mutedTextStyles = useMemo(() => customTheme ? {
    color: customTheme.mutedTextColor
  } : {}, [customTheme]);

  // Loading states
  if (!restaurantName) {
    return <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto fade-in">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold mb-3">Invalid Menu Link</h1>
          <p className="text-sm text-muted-foreground">This menu link is not valid or has expired.</p>
        </div>
      </div>;
  }
  if (restaurantLoading) {
    return <MenuLoadingSkeleton layoutStyle={layoutStyle} />;
  }
  if (restaurantError || !restaurant) {
    return <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto fade-in">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold mb-3">Restaurant Not Found</h1>
          <p className="text-sm text-muted-foreground mb-3">
            Could not find restaurant matching "{restaurantName}".
          </p>
          <p className="text-xs text-muted-foreground">
            Please check the URL or contact the restaurant.
          </p>
        </div>
      </div>;
  }
  if (profileLoading || categoriesLoading) {
    return <MenuLoadingSkeleton layoutStyle={layoutStyle} />;
  }

  // Enhanced header component
  const MenuHeader = () => <div className="relative">
      {bannerImageUrl && <div className="absolute inset-0 bg-cover bg-center" style={{
      backgroundImage: `url(${bannerImageUrl})`
    }}>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>}
      
      <div className="relative px-3 py-4 safe-area-top text-white" style={{
      backgroundColor: bannerImageUrl ? 'transparent' : customTheme?.primaryColor
    }}>
        <div className="max-w-sm mx-auto">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              {selectedCategory && layoutPreference === 'categories' && <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)} className="text-white hover:bg-white/20 p-2 h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>}
              {logoImageUrl && <img src={logoImageUrl} alt={profile?.name} className="h-10 w-10 rounded-full object-cover bg-white/10 backdrop-blur-sm p-1" />}
            </div>
            <div className="flex gap-1">
              <LanguageSwitch restaurantSupabase={restaurantSupabase} currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />
              <CurrencySwitch restaurantSupabase={restaurantSupabase} currentCurrency={currentCurrency} onCurrencyChange={setCurrentCurrency} />
            </div>
          </div>
          
          <div className="text-center slide-up">
            <h1 className="text-lg font-bold mb-1 uppercase tracking-wide" style={headingStyles}>
              {selectedCategory && layoutPreference === 'categories' ? getLocalizedText(categories.find(cat => cat.id === selectedCategory), 'name') : profile?.name || 'Restaurant Menu'}
            </h1>
            {profile?.address && !selectedCategory && <div className="flex items-center justify-center gap-1 text-xs opacity-80 uppercase tracking-wide mb-2">
                <MapPin className="h-3 w-3" />
                {profile.address.split(',')[0] || profile.address}
              </div>}
            
            {!selectedCategory && <div className="flex justify-center gap-3 mb-1">
                {profile?.social_media_links?.instagram && <a href={profile.social_media_links.instagram} target="_blank" rel="noopener noreferrer" className="hover-lift">
                    <Instagram className="h-4 w-4 opacity-80 hover:opacity-100" />
                  </a>}
                {profile?.phone && <a href={`tel:${profile.phone}`} className="hover-lift">
                    <Phone className="h-4 w-4 opacity-80 hover:opacity-100" />
                  </a>}
                {profile?.social_media_links?.facebook && <a href={profile.social_media_links.facebook} target="_blank" rel="noopener noreferrer" className="hover-lift">
                    <Facebook className="h-4 w-4 opacity-80 hover:opacity-100" />
                  </a>}
                {profile?.social_media_links?.google_maps || profile?.email}
              </div>}
          </div>
        </div>
      </div>
    </div>;

  // Enhanced search component
  const SearchBar = () => <div className="px-3 py-3">
      <div className="max-w-sm mx-auto relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 z-10" style={mutedTextStyles} />
        <Input placeholder="Search ingredients & dishes" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 h-10 border backdrop-blur-sm" style={{
        ...cardStyles,
        borderColor: customTheme?.borderColor
      }} />
      </div>
    </div>;

  // Categories layout
  if (layoutPreference === 'categories') {
    if (selectedCategory) {
      return <div className="min-h-screen smooth-scroll" style={themeStyles}>
          <MenuHeader />
          <div className="px-3 py-3">
            <div className="max-w-sm mx-auto">
              {filteredMenuItems.length === 0 ? <div className="text-center py-8 fade-in">
                  <Utensils className="h-10 w-10 mx-auto mb-3" style={mutedTextStyles} />
                  <p className="text-sm" style={mutedTextStyles}>No items found in this category.</p>
                </div> : <div className={layoutStyle === 'card-grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                  {filteredMenuItems.map((item, index) => <EnhancedMenuItem key={item.id} item={item} layoutStyle={layoutStyle} customTheme={customTheme} formatPrice={formatPrice} getLocalizedText={getLocalizedText} getMenuItemImageUrl={getMenuItemImageUrl} categoryName={categories.find(cat => cat.id === item.category_id)?.name_sq || categories.find(cat => cat.id === item.category_id)?.name} isCompact={true} index={index} onClick={handleMenuItemClick} />)}
                </div>}
            </div>
          </div>
          <MenuFooter profile={profile} customTheme={customTheme} showFullContent={false} />
        </div>;
    }
    return <div className="min-h-screen smooth-scroll" style={themeStyles}>
        <MenuHeader />
        <SearchBar />
        <div className="px-3 pb-6">
          <div className="max-w-sm mx-auto">
            {filteredCategories.length === 0 ? <div className="text-center py-8 fade-in">
                <Utensils className="h-10 w-10 mx-auto mb-3" style={mutedTextStyles} />
                <h3 className="text-base font-semibold mb-2" style={headingStyles}>Menu Coming Soon</h3>
                <p className="text-sm" style={mutedTextStyles}>The menu is being prepared and will be available shortly.</p>
              </div> : <div className="grid grid-cols-2 gap-3">
                {filteredCategories.map((category, index) => {
              const categoryItems = menuItems.filter(item => item.category_id === category.id);
              return <div key={category.id}>
                      <Card className="category-card h-28 border" style={{
                  ...cardStyles,
                  borderColor: customTheme?.accentColor + '40'
                }} onClick={() => setSelectedCategory(category.id)}>
                        <CardContent className="p-3 h-full flex flex-col">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm mb-1" style={categoryNameStyles}>
                              {getLocalizedText(category, 'name')}
                            </h3>
                            <p className="text-xs line-clamp-2 leading-relaxed" style={categoryNameStyles}>
                              {categoryItems.slice(0, 2).map(item => getLocalizedText(item, 'name')).join(', ')}
                              {categoryItems.length > 2 && '...'}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs" style={mutedTextStyles}>
                              {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
                            </div>
                            {categoryItems.some(item => item.is_featured) && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                          </div>
                        </CardContent>
                      </Card>
                    </div>;
            })}
              </div>}
          </div>
        </div>
        <MenuFooter profile={profile} customTheme={customTheme} showFullContent={true} />
      </div>;
  }

  // Items layout (default)
  return <div className="min-h-screen smooth-scroll" style={themeStyles}>
      <MenuHeader />
      <div className="px-3 py-3">
        <div className="max-w-sm mx-auto">
          <Tabs defaultValue="all" className="w-full">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="inline-flex h-9 w-max min-w-full gap-1 p-1 backdrop-blur-sm" style={{
              backgroundColor: customTheme?.accentColor + '20',
              borderColor: customTheme?.accentColor
            }}>
                <TabsTrigger value="all" className="text-xs h-7 px-3 flex-shrink-0">
                  All
                </TabsTrigger>
                {filteredCategories.map(category => <TabsTrigger key={category.id} value={category.id} className="text-xs h-7 px-3 flex-shrink-0">
                    {getLocalizedText(category, 'name')}
                  </TabsTrigger>)}
              </TabsList>
              <ScrollBar orientation="horizontal" className="mt-2" />
            </ScrollArea>

            <TabsContent value="all" className="space-y-3 mt-4">
              <h3 className="text-base font-semibold mb-3" style={categoryNameStyles}>
                All Items
              </h3>
              {menuItems.length === 0 ? <div className="text-center py-8 fade-in">
                  <Utensils className="h-10 w-10 mx-auto mb-3" style={mutedTextStyles} />
                  <p className="text-sm" style={mutedTextStyles}>No items available.</p>
                </div> : <div className={layoutStyle === 'card-grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                  {filteredMenuItems.map((item, index) => <EnhancedMenuItem key={item.id} item={item} layoutStyle={layoutStyle} customTheme={customTheme} formatPrice={formatPrice} getLocalizedText={getLocalizedText} getMenuItemImageUrl={getMenuItemImageUrl} categoryName={categories.find(cat => cat.id === item.category_id)?.name_sq || categories.find(cat => cat.id === item.category_id)?.name} index={index} onClick={handleMenuItemClick} />)}
                </div>}
            </TabsContent>

            {filteredCategories.map(category => {
            const categoryItems = menuItems.filter(item => item.category_id === category.id);
            return <TabsContent key={category.id} value={category.id} className="space-y-3 mt-4">
                  <h3 className="text-base font-semibold mb-3" style={categoryNameStyles}>
                    {getLocalizedText(category, 'name')}
                  </h3>
                  {categoryItems.length === 0 ? <div className="text-center py-8 fade-in">
                      <Utensils className="h-10 w-10 mx-auto mb-3" style={mutedTextStyles} />
                      <p className="text-sm" style={mutedTextStyles}>No items in this category.</p>
                    </div> : <div className={layoutStyle === 'card-grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                      {categoryItems.map((item, index) => <EnhancedMenuItem key={item.id} item={item} layoutStyle={layoutStyle} customTheme={customTheme} formatPrice={formatPrice} getLocalizedText={getLocalizedText} getMenuItemImageUrl={getMenuItemImageUrl} categoryName={getLocalizedText(category, 'name')} isCompact={true} index={index} onClick={handleMenuItemClick} />)}
                    </div>}
                </TabsContent>;
          })}
          </Tabs>
        </div>
      </div>

      <MenuFooter profile={profile} customTheme={customTheme} showFullContent={true} />
      
      {/* Popup Modal */}
      {popupSettings && restaurant && <PopupModal settings={popupSettings} restaurantName={restaurant.name} />}

      {/* Menu Item Detail Popup */}
      {selectedMenuItem && <MenuItemPopup item={selectedMenuItem} isOpen={!!selectedMenuItem} onClose={() => setSelectedMenuItem(null)} formatPrice={formatPrice} getLocalizedText={getLocalizedText} getMenuItemImageUrl={getMenuItemImageUrl} categoryName={categories.find(cat => cat.id === selectedMenuItem.category_id)?.name_sq || categories.find(cat => cat.id === selectedMenuItem.category_id)?.name} customTheme={customTheme} />}
    </div>;
};
export default EnhancedMenu;