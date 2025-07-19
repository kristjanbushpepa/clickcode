import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense, lazy } from 'react';
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
import { Clock, Tag, Utensils, AlertCircle, Search, Phone, Globe, Instagram, Facebook, ArrowLeft, Star, MapPin, ChefHat } from 'lucide-react';
import { convertUrlToRestaurantName, generatePossibleNames } from '@/utils/nameConversion';
import { LanguageSwitch } from '@/components/menu/LanguageSwitch';
import { CurrencySwitch } from '@/components/menu/CurrencySwitch';
import { MenuFooter } from '@/components/menu/MenuFooter';
import { EnhancedMenuItem } from '@/components/menu/EnhancedMenuItem';
import { MenuLoadingSkeleton, CategorySkeleton } from '@/components/menu/MenuSkeleton';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';

// Lazy load non-critical components for better initial load
const PopupModal = lazy(() => import('@/components/menu/PopupModal').then(module => ({ default: module.PopupModal })));
const MenuItemDetailPopup = lazy(() => import('@/components/menu/MenuItemDetailPopup').then(module => ({ default: module.MenuItemDetailPopup })));

// Preload critical components
const MenuItemPopup = lazy(() => import('@/components/menu/MenuItemPopup'));

interface SocialMediaOption {
  platform: string;
  url: string;
  enabled: boolean;
}

interface ReviewOption {
  platform: string;
  url: string;
  enabled: boolean;
}

interface PopupSettings {
  enabled: boolean;
  type: 'review' | 'wheel' | 'social';
  title: string;
  description: string;
  link: string;
  buttonText: string;
  showAfterSeconds: number;
  dailyLimit: number;
  socialMedia?: SocialMediaOption[];
  reviewOptions?: ReviewOption[];
  wheelSettings: {
    enabled: boolean;
    unlockType: 'free' | 'link';
    unlockText: string;
    unlockButtonText: string;
    unlockLink: string;
    rewards: Array<{
      text: string;
      chance: number;
      color: string;
    }>;
  };
}

interface Category {
  id: string;
  name: string;
  name_sq?: string;
  description?: string;
  description_sq?: string;
  display_order: number;
  is_active: boolean;
  image_path?: string;
  image_url?: string;
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
  website?: string;
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
  badgeBackgroundColor?: string;
  badgeTextColor?: string;
  languageSwitchBackground?: string;
  languageSwitchBorder?: string;
  languageSwitchText?: string;
  currencySwitchBackground?: string;
  currencySwitchBorder?: string;
  currencySwitchText?: string;
  tabSwitcherBackground?: string;
  tabSwitcherBorder?: string;
  tabSwitcherText?: string;
  tabSwitcherActiveBackground?: string;
  tabSwitcherActiveText?: string;
  searchBarBackground?: string;
  searchBarBorder?: string;
  searchBarText?: string;
  searchBarPlaceholder?: string;
}

interface Restaurant {
  id: string;
  name: string;
  supabase_url: string;
  supabase_anon_key: string;
}

const EnhancedMenu = () => {
  const { restaurantName } = useParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customTheme, setCustomTheme] = useState<MenuTheme | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('sq');
  const [currentCurrency, setCurrentCurrency] = useState('ALL');
  const [restaurantSupabase, setRestaurantSupabase] = useState<any>(null);
  const [layoutPreference, setLayoutPreference] = useState<'categories' | 'items'>('items');
  const [layoutStyle, setLayoutStyle] = useState<'compact' | 'card-grid' | 'image-focus' | 'minimal' | 'magazine'>('compact');
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  
  // Add ref for search input to maintain focus
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    staleTime: 10 * 60 * 1000, // 10 minutes - longer cache for Cloudflare
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: false // Rely on cache when possible
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
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    select: (data) => data, // Enable structural sharing
    notifyOnChangeProps: ['data', 'error'] // Only re-render on data/error changes
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
    staleTime: 5 * 60 * 1000, // 5 minutes - categories change less frequently
    refetchOnWindowFocus: false,
    select: (data) => data?.filter(cat => cat.is_active) || [], // Filter in selector
    notifyOnChangeProps: ['data', 'error']
  });

  // Updated swipe gesture handling with improved logic for category navigation
  const handleSwipeRight = useCallback(() => {
    // Handle swipe right based on current state
    if (layoutPreference === 'categories' && selectedCategory) {
      // If we're viewing items in a category, go back to categories view
      setSelectedCategory(null);
    } else if (layoutPreference === 'items' && categories.length > 0) {
      // If we're in items layout, switch to categories layout
      setLayoutPreference('categories');
      setSelectedCategory(null);
    }
  }, [layoutPreference, selectedCategory, categories]);

  const handleSwipeLeft = useCallback(() => {
    // Handle swipe left - only switch from categories to items layout when not viewing a specific category
    if (layoutPreference === 'categories' && !selectedCategory) {
      // Only switch to items layout if we're in the main categories view (not viewing specific category items)
      setLayoutPreference('items');
    }
  }, [layoutPreference, selectedCategory]);

  const swipeRef = useSwipeGestures({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 80,
    preventScroll: true
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
    staleTime: 3 * 60 * 1000, // 3 minutes - menu items change more frequently
    refetchOnWindowFocus: false,
    select: (data) => data?.filter(item => item.is_available) || [],
    notifyOnChangeProps: ['data', 'error']
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
    staleTime: 2 * 60 * 1000, // 2 minutes for customization
    refetchOnWindowFocus: false,
    notifyOnChangeProps: ['data']
  });

  // Language settings query - now separate for better control
  const {
    data: languageSettings
  } = useQuery({
    queryKey: ['language_settings_menu', restaurant?.supabase_url],
    queryFn: async () => {
      if (!restaurantSupabase) return null;
      const {
        data,
        error
      } = await restaurantSupabase.from('language_settings').select('*').maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!restaurantSupabase,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes instead of 1
    refetchOnWindowFocus: false
  });

  // Currency settings query - now separate for better control
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes instead of 1
    refetchOnWindowFocus: false
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
      } = await restaurantSupabase.from('popup_settings').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
      
      if (error) {
        console.error('Error loading popup settings:', error);
        return null;
      }
      
      if (!data) return null;
      
      // Map database fields to component interface
      return {
        enabled: data.enabled,
        type: data.type,
        title: data.title,
        description: data.description,
        link: data.link || '',
        buttonText: data.button_text,
        showAfterSeconds: data.show_after_seconds || 3,
        dailyLimit: data.daily_limit || 1,
        socialMedia: data.social_media || [],
        reviewOptions: data.review_options || [],
        wheelSettings: {
          enabled: data.wheel_enabled,
          unlockType: data.wheel_unlock_type || 'free',
          unlockText: data.wheel_unlock_text,
          unlockButtonText: data.wheel_unlock_button_text,
          unlockLink: data.wheel_unlock_link || '',
          rewards: data.wheel_rewards || []
        }
      } as PopupSettings;
    },
    enabled: !!restaurantSupabase,
    staleTime: 10 * 60 * 1000 // 10 minutes - popup settings rarely change
  });

  // Initialize language and currency from settings
  useEffect(() => {
    if (languageSettings?.main_ui_language && 
        languageSettings.supported_ui_languages?.includes(languageSettings.main_ui_language)) {
      setCurrentLanguage(languageSettings.main_ui_language);
    }
  }, [languageSettings]);

  useEffect(() => {
    if (currencySettings?.default_currency && 
        currencySettings.enabled_currencies?.includes(currencySettings.default_currency)) {
      setCurrentCurrency(currencySettings.default_currency);
    }
  }, [currencySettings]);

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
        priceColor: '#059669',
        badgeBackgroundColor: '#f3f4f6',
        badgeTextColor: '#374151'
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
  
  // Optimized filtered items with better search logic
  const filteredMenuItems = useMemo(() => {
    if (!searchTerm.trim()) return menuItems;
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    return menuItems.filter(item => {
      // Get localized text for current language
      const itemName = (currentLanguage === 'sq' && item.name_sq) ? item.name_sq : item.name;
      const itemDescription = (currentLanguage === 'sq' && item.description_sq) ? item.description_sq : item.description;
      
      // Search in name
      if (itemName && itemName.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search in description
      if (itemDescription && itemDescription.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search in category name
      const category = categories.find(cat => cat.id === item.category_id);
      if (category) {
        const categoryName = (currentLanguage === 'sq' && category.name_sq) ? category.name_sq : category.name;
        if (categoryName && categoryName.toLowerCase().includes(searchLower)) {
          return true;
        }
      }
      
      return false;
    });
  }, [menuItems, searchTerm, currentLanguage, categories]);

  // Filter items by category for tabs
  const getFilteredItemsByCategory = useCallback((categoryId: string | null) => {
    const baseItems = searchTerm ? filteredMenuItems : menuItems;
    
    if (!categoryId) return baseItems;
    
    return baseItems.filter(item => item.category_id === categoryId);
  }, [menuItems, filteredMenuItems, searchTerm]);

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

  // Get localized category name
  const getLocalizedCategoryName = useCallback((categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return '';
    return getLocalizedText(category, 'name');
  }, [categories, getLocalizedText]);

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

  // Enhanced category card component - memoized for performance
  const CategoryCard = React.memo(({ category, categoryItems, index }: { 
    category: Category; 
    categoryItems: MenuItem[]; 
    index: number;
  }) => {
    const categoryImageUrl = category.image_path ? getImageUrl(category.image_path) : null;
    
    return (
      <Card 
        className="group relative h-40 border overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
        style={{
          borderColor: customTheme?.accentColor + '40',
          background: categoryImageUrl 
            ? 'transparent' 
            : customTheme?.cardBackground
        }}
        onClick={() => setSelectedCategory(category.id)}
      >
        {/* Category Image Background */}
        {categoryImageUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${categoryImageUrl})` }}
          >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
          </div>
        )}
        
        <CardContent className="relative p-4 h-full flex flex-col justify-between" style={{
          color: categoryImageUrl ? '#ffffff' : customTheme?.textColor
        }}>
          <div>
            <h3 className="font-bold text-lg mb-2 line-clamp-2" style={{
              color: categoryImageUrl ? '#ffffff' : customTheme?.headingColor
            }}>
              {getLocalizedText(category, 'name')}
            </h3>
            
            {category.description && (
              <p className="text-sm opacity-90 line-clamp-2 mb-3" style={{
                color: categoryImageUrl ? '#ffffff' : customTheme?.mutedTextColor
              }}>
                {getLocalizedText(category, 'description')}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className="text-xs backdrop-blur-sm"
                style={{
                  backgroundColor: customTheme?.badgeBackgroundColor || (categoryImageUrl ? 'rgba(255,255,255,0.9)' : customTheme?.accentColor + '20'),
                  color: customTheme?.badgeTextColor || (categoryImageUrl ? customTheme?.textColor : customTheme?.accentColor)
                }}
              >
                {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
              </Badge>
              
              {categoryItems.some(item => item.is_featured) && (
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
              )}
            </div>
            
            <div className="flex items-center text-sm opacity-75">
              <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </CardContent>
      </Card>
    );
  });

  // Memoized search handler to prevent re-renders
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Clear search function
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Memoized SearchBar component to prevent re-renders
  const SearchBar = useMemo(() => {
    const searchBarId = `search-bar-${Math.random().toString(36).substr(2, 9)}`;
    const placeholderColor = customTheme?.searchBarPlaceholder || customTheme?.mutedTextColor || '#6b7280';
    const backgroundColor = customTheme?.searchBarBackground || customTheme?.cardBackground || '#ffffff';
    const borderColor = customTheme?.searchBarBorder || customTheme?.borderColor || '#e5e7eb';
    const textColor = customTheme?.searchBarText || customTheme?.textColor || '#1f2937';
    
    return (
      <div className="px-3 py-3">
        <style>
          {`
            #${searchBarId} {
              background-color: ${backgroundColor} !important;
              border-color: ${borderColor} !important;
              color: ${textColor} !important;
            }
            #${searchBarId}::placeholder {
              color: ${placeholderColor} !important;
              opacity: 1 !important;
            }
            #${searchBarId}::-webkit-input-placeholder {
              color: ${placeholderColor} !important;
              opacity: 1 !important;
            }
            #${searchBarId}::-moz-placeholder {
              color: ${placeholderColor} !important;
              opacity: 1 !important;
            }
            #${searchBarId}:-ms-input-placeholder {
              color: ${placeholderColor} !important;
              opacity: 1 !important;
            }
            #${searchBarId}:-moz-placeholder {
              color: ${placeholderColor} !important;
              opacity: 1 !important;
            }
            #${searchBarId}:focus {
              background-color: ${backgroundColor} !important;
              border-color: ${borderColor} !important;
              color: ${textColor} !important;
            }
          `}
        </style>
        <div className="max-w-sm mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 z-10 pointer-events-none" style={{ color: placeholderColor }} />
          <Input 
            id={searchBarId}
            ref={searchInputRef}
            placeholder="Search menu items..." 
            value={searchTerm} 
            onChange={handleSearchChange}
            className="pl-10 pr-10 h-10 border backdrop-blur-sm text-sm" 
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center text-lg font-medium transition-colors z-10"
              style={{
                color: placeholderColor
              }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  }, [searchTerm, handleSearchChange, clearSearch, customTheme]);

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

  // Enhanced MenuHeader component - memoized for performance
  const MenuHeader = React.memo(() => <div className="relative">
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
              {logoImageUrl && <img src={logoImageUrl} alt={profile?.name} className="h-10 w-10 rounded-full object-cover bg-white/10 backdrop-blur-sm p-1" loading="lazy" />}
            </div>
            <div className="flex gap-1">
              <LanguageSwitch 
                restaurantSupabase={restaurantSupabase} 
                currentLanguage={currentLanguage} 
                onLanguageChange={setCurrentLanguage} 
                customTheme={customTheme ? {
                  languageSwitchBackground: customTheme.languageSwitchBackground,
                  languageSwitchBorder: customTheme.languageSwitchBorder,
                  languageSwitchText: customTheme.languageSwitchText
                } : undefined}
              />
              <CurrencySwitch 
                restaurantSupabase={restaurantSupabase} 
                currentCurrency={currentCurrency} 
                onCurrencyChange={setCurrentCurrency}
                customTheme={customTheme ? {
                  currencySwitchBackground: customTheme.currencySwitchBackground,
                  currencySwitchBorder: customTheme.currencySwitchBorder,
                  currencySwitchText: customTheme.currencySwitchText
                } : undefined}
              />
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
                {profile?.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover-lift">
                    <Globe className="h-4 w-4 opacity-80 hover:opacity-100" />
                  </a>}
              </div>}
          </div>
        </div>
      </div>
    </div>);

  // Categories layout
  if (layoutPreference === 'categories') {
    if (selectedCategory) {
      const categoryItems = getFilteredItemsByCategory(selectedCategory);
      
      return <div ref={swipeRef} className="viewport-fill smooth-scroll" style={themeStyles}>
          {/* Viewport background fill */}
          <div 
            className="fixed inset-0 -z-10" 
            style={{ backgroundColor: customTheme?.backgroundColor || '#ffffff' }}
          />
          
          <MenuHeader />
          {SearchBar}
          <div className="px-3 py-3">
            <div className="max-w-sm mx-auto">
              {categoryItems.length === 0 ? (
                <div className="text-center py-8 fade-in">
                  <Utensils className="h-10 w-10 mx-auto mb-3" style={mutedTextStyles} />
                  <p className="text-sm" style={mutedTextStyles}>
                    {searchTerm ? 'No items found matching your search in this category.' : 'No items found in this category.'}
                  </p>
                  {searchTerm && (
                    <Button variant="outline" onClick={clearSearch} className="mt-3">
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <div className={layoutStyle === 'card-grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                  {categoryItems.map((item, index) => (
                    <EnhancedMenuItem 
                      key={item.id} 
                      item={item} 
                      layoutStyle={layoutStyle} 
                      customTheme={customTheme} 
                      formatPrice={formatPrice} 
                      getLocalizedText={getLocalizedText} 
                      getMenuItemImageUrl={getMenuItemImageUrl} 
                      categoryName={categories.find(cat => cat.id === item.category_id)?.name_sq || categories.find(cat => cat.id === item.category_id)?.name} 
                      isCompact={true} 
                      index={index} 
                      onClick={handleMenuItemClick} 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <MenuFooter profile={profile} customTheme={customTheme} showFullContent={false} />
          
          {/* Popup Modal - Added here */}
          {popupSettings && restaurant && (
            <Suspense fallback={null}>
              <PopupModal 
                settings={popupSettings} 
                restaurantName={restaurant.name} 
                customTheme={customTheme}
              />
            </Suspense>
          )}
          
          {/* Menu Item Detail Popup */}
          {selectedMenuItem && (
            <Suspense fallback={null}>
              <MenuItemDetailPopup 
                item={selectedMenuItem} 
                isOpen={!!selectedMenuItem} 
                onClose={() => setSelectedMenuItem(null)} 
                formatPrice={formatPrice} 
                getLocalizedText={getLocalizedText} 
                getMenuItemImageUrl={getMenuItemImageUrl} 
                categoryName={categories.find(cat => cat.id === selectedMenuItem.category_id)?.name_sq || categories.find(cat => cat.id === selectedMenuItem.category_id)?.name} 
                customTheme={customTheme} 
              />
            </Suspense>
          )}
        </div>;
    }
    
    // Categories layout - show search results when searching
    if (searchTerm) {
      return <div ref={swipeRef} className="viewport-fill smooth-scroll" style={themeStyles}>
          {/* Viewport background fill */}
          <div 
            className="fixed inset-0 -z-10" 
            style={{ backgroundColor: customTheme?.backgroundColor || '#ffffff' }}
          />
          
          <MenuHeader />
          {SearchBar}
          <div className="px-3 py-3">
            <div className="max-w-sm mx-auto">
              <h3 className="text-base font-semibold mb-3" style={categoryNameStyles}>
                Search Results ({filteredMenuItems.length} found)
              </h3>
              {filteredMenuItems.length === 0 ? (
                <div className="text-center py-8 fade-in">
                  <Utensils className="h-10 w-10 mx-auto mb-3" style={mutedTextStyles} />
                  <p className="text-sm" style={mutedTextStyles}>
                    No items found matching your search.
                  </p>
                  <Button variant="outline" onClick={clearSearch} className="mt-3">
                    Clear search
                  </Button>
                </div>
              ) : (
                <div className={layoutStyle === 'card-grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                  {filteredMenuItems.map((item, index) => (
                    <EnhancedMenuItem 
                      key={item.id} 
                      item={item} 
                      layoutStyle={layoutStyle} 
                      customTheme={customTheme} 
                      formatPrice={formatPrice} 
                      getLocalizedText={getLocalizedText} 
                      getMenuItemImageUrl={getMenuItemImageUrl} 
                      categoryName={categories.find(cat => cat.id === item.category_id)?.name_sq || categories.find(cat => cat.id === item.category_id)?.name} 
                      isCompact={true} 
                      index={index} 
                      onClick={handleMenuItemClick} 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <MenuFooter profile={profile} customTheme={customTheme} showFullContent={false} />
          
          {/* Popup Modal - Added here */}
          {popupSettings && restaurant && (
            <PopupModal 
              settings={popupSettings} 
              restaurantName={restaurant.name} 
              customTheme={customTheme}
            />
          )}
          
          {/* Menu Item Detail Popup */}
          {selectedMenuItem && (
            <MenuItemDetailPopup 
              item={selectedMenuItem} 
              isOpen={!!selectedMenuItem} 
              onClose={() => setSelectedMenuItem(null)} 
              formatPrice={formatPrice} 
              getLocalizedText={getLocalizedText} 
              getMenuItemImageUrl={getMenuItemImageUrl} 
              categoryName={categories.find(cat => cat.id === selectedMenuItem.category_id)?.name_sq || categories.find(cat => cat.id === selectedMenuItem.category_id)?.name} 
              customTheme={customTheme} 
            />
          )}
        </div>;
    }
    
    return <div ref={swipeRef} className="viewport-fill smooth-scroll" style={themeStyles}>
        {/* Viewport background fill */}
        <div 
          className="fixed inset-0 -z-10" 
          style={{ backgroundColor: customTheme?.backgroundColor || '#ffffff' }}
        />
        
        <MenuHeader />
        {SearchBar}
        <div className="px-4 pb-6">
          <div className="max-w-2xl mx-auto">
            {categories.length === 0 ? (
              <div className="text-center py-12 fade-in">
                <Utensils className="h-12 w-12 mx-auto mb-4" style={mutedTextStyles} />
                <h3 className="text-xl font-semibold mb-3" style={headingStyles}>Menu Coming Soon</h3>
                <p className="text-base" style={mutedTextStyles}>The menu is being prepared and will be available shortly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category, index) => {
                  const categoryItems = getFilteredItemsByCategory(category.id);
                  
                  return (
                    <div 
                      key={category.id} 
                      className="fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CategoryCard 
                        category={category} 
                        categoryItems={categoryItems} 
                        index={index} 
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <MenuFooter profile={profile} customTheme={customTheme} showFullContent={true} />
        
        {/* Popup Modal - Added here */}
        {popupSettings && restaurant && (
          <PopupModal 
            settings={popupSettings} 
            restaurantName={restaurant.name} 
            customTheme={customTheme}
          />
        )}
      </div>;
  }

  // Items layout (default)
  return (
    <div ref={swipeRef} className="viewport-fill smooth-scroll" style={themeStyles}>
      {/* Viewport background fill */}
      <div 
        className="fixed inset-0 -z-10" 
        style={{ backgroundColor: customTheme?.backgroundColor || '#ffffff' }}
      />
      
      <MenuHeader />
      {SearchBar}
      <div className="px-3 py-3">
        <div className="max-w-sm mx-auto">
          <Tabs defaultValue="all" className="w-full">
            <style>
              {`
                [data-state="active"][data-tab-trigger] {
                  background-color: ${customTheme?.tabSwitcherActiveBackground || customTheme?.primaryColor || '#3b82f6'} !important;
                  color: ${customTheme?.tabSwitcherActiveText || '#ffffff'} !important;
                  border-color: ${customTheme?.tabSwitcherActiveBackground || customTheme?.primaryColor || '#3b82f6'} !important;
                }
                [data-tab-list] {
                  background-color: ${customTheme?.tabSwitcherBackground || customTheme?.cardBackground || '#f8f9fa'} !important;
                  border-color: ${customTheme?.tabSwitcherBorder || customTheme?.borderColor || '#e5e7eb'} !important;
                }
                [data-tab-trigger]:not([data-state="active"]) {
                  color: ${customTheme?.tabSwitcherText || customTheme?.mutedTextColor || '#6b7280'} !important;
                }
              `}
            </style>
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList 
                data-tab-list
                className="inline-flex h-9 w-max min-w-full gap-1 p-1 backdrop-blur-sm border" 
              >
                <TabsTrigger 
                  data-tab-trigger
                  value="all" 
                  className="text-xs h-7 px-3 flex-shrink-0 rounded-sm transition-all duration-200 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:font-medium"
                >
                  All
                </TabsTrigger>
                {categories.map(category => {
                  const categoryItems = getFilteredItemsByCategory(category.id);
                  
                  // Hide empty categories when searching
                  if (searchTerm && categoryItems.length === 0) {
                    return null;
                  }
                  
                  return (
                    <TabsTrigger 
                      data-tab-trigger
                      key={category.id} 
                      value={category.id} 
                      className="text-xs h-7 px-3 flex-shrink-0 rounded-sm transition-all duration-200 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:font-medium"
                    >
                      {getLocalizedText(category, 'name')}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <ScrollBar orientation="horizontal" className="mt-2" />
            </ScrollArea>

            <TabsContent value="all" className="space-y-3 mt-4">
              <h3 className="text-base font-semibold mb-3" style={categoryNameStyles}>
                All Items {searchTerm && `(${filteredMenuItems.length} found)`}
              </h3>
              {filteredMenuItems.length === 0 ? (
                <div className="text-center py-8 fade-in">
                  <Utensils className="h-10 w-10 mx-auto mb-3" style={mutedTextStyles} />
                  <p className="text-sm" style={mutedTextStyles}>
                    {searchTerm ? 'No items found matching your search.' : 'No items available.'}
                  </p>
                  {searchTerm && (
                    <Button variant="outline" onClick={clearSearch} className="mt-3">
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <div className={layoutStyle === 'card-grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                  {filteredMenuItems.map((item, index) => (
                    <EnhancedMenuItem 
                      key={item.id} 
                      item={item} 
                      layoutStyle={layoutStyle} 
                      customTheme={customTheme} 
                      formatPrice={formatPrice} 
                      getLocalizedText={getLocalizedText} 
                      getMenuItemImageUrl={getMenuItemImageUrl} 
                      categoryName={getLocalizedCategoryName(item.category_id)} 
                      index={index} 
                      onClick={handleMenuItemClick} 
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {categories.map(category => {
              const categoryItems = getFilteredItemsByCategory(category.id);
              
              // Hide empty categories when searching
              if (searchTerm && categoryItems.length === 0) {
                return null;
              }
              
              return (
                <TabsContent key={category.id} value={category.id} className="space-y-3 mt-4">
                  <h3 className="text-base font-semibold mb-3" style={categoryNameStyles}>
                    {getLocalizedText(category, 'name')} {searchTerm && `(${categoryItems.length} found)`}
                  </h3>
                  {categoryItems.length === 0 ? (
                    <div className="text-center py-8 fade-in">
                      <Utensils className="h-10 w-10 mx-auto mb-3" style={mutedTextStyles} />
                      <p className="text-sm" style={mutedTextStyles}>
                        {searchTerm ? 'No items found matching your search in this category.' : 'No items in this category.'}
                      </p>
                      {searchTerm && (
                        <Button variant="outline" onClick={clearSearch} className="mt-3">
                          Clear search
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className={layoutStyle === 'card-grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                      {categoryItems.map((item, index) => (
                        <EnhancedMenuItem 
                          key={item.id} 
                          item={item} 
                          layoutStyle={layoutStyle} 
                          customTheme={customTheme} 
                          formatPrice={formatPrice} 
                          getLocalizedText={getLocalizedText} 
                          getMenuItemImageUrl={getMenuItemImageUrl} 
                          categoryName={getLocalizedText(category, 'name')} 
                          isCompact={true} 
                          index={index} 
                          onClick={handleMenuItemClick} 
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>

      <MenuFooter profile={profile} customTheme={customTheme} showFullContent={true} />
      
      {/* Popup Modal with theme */}
      {popupSettings && restaurant && (
        <Suspense fallback={null}>
          <PopupModal 
            settings={popupSettings} 
            restaurantName={restaurant.name} 
            customTheme={customTheme}
          />
        </Suspense>
      )}

      {/* Menu Item Detail Popup - Updated */}
      {selectedMenuItem && (
        <Suspense fallback={null}>
          <MenuItemDetailPopup 
            item={selectedMenuItem} 
            isOpen={!!selectedMenuItem} 
            onClose={() => setSelectedMenuItem(null)} 
            formatPrice={formatPrice} 
            getLocalizedText={getLocalizedText} 
            getMenuItemImageUrl={getMenuItemImageUrl} 
            categoryName={getLocalizedCategoryName(selectedMenuItem.category_id)} 
            customTheme={customTheme} 
          />
        </Suspense>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(EnhancedMenu);
