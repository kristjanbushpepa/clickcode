import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { MenuHeader } from '@/components/menu/MenuHeader';
import { EnhancedMenuItem } from '@/components/menu/EnhancedMenuItem';
import { MenuLoadingSkeleton, CategorySkeleton } from '@/components/menu/MenuSkeleton';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';

// Import components directly to avoid Suspense issues
import { PopupModal } from '@/components/menu/PopupModal';
import { MenuItemDetailPopup } from '@/components/menu/MenuItemDetailPopup';
import MenuItemPopup from '@/components/menu/MenuItemPopup';

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
  const [hasAnimated, setHasAnimated] = useState(false);
  const [userHasChangedLanguage, setUserHasChangedLanguage] = useState(false);
  
  // Add ref for search input to maintain focus
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Simple debounce utility function
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);
  
  // Debounced language change handler
  const debouncedLanguageChange = useCallback(
    debounce((newLanguage: string) => {
      setCurrentLanguage(newLanguage);
      setUserHasChangedLanguage(true);
    }, 150),
    [debounce]
  );

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
    staleTime: 30 * 60 * 1000, // 30 minutes - longer cache
    gcTime: 60 * 60 * 1000, // 1 hour cache
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  // Create restaurant supabase client
  useEffect(() => {
    if (restaurant) {
      const client = createRestaurantSupabase(restaurant.supabase_url, restaurant.supabase_anon_key);
      setRestaurantSupabase(client);
    }
  }, [restaurant]);

  // Simplified mobile optimization - remove aggressive viewport manipulation
  useEffect(() => {
    // Only set basic mobile-friendly viewport
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=yes');
    }
  }, []);

  // Combined data query for better performance
  const {
    data: restaurantData,
    isLoading: dataLoading,
    error: dataError
  } = useQuery({
    queryKey: ['restaurant-data', restaurant?.supabase_url],
    queryFn: async () => {
      if (!restaurantSupabase) throw new Error('Restaurant database not available');
      
      // Fetch all data in parallel
      const [profileRes, categoriesRes, menuItemsRes, customizationRes, languageRes, currencyRes, popupRes] = await Promise.allSettled([
        restaurantSupabase.from('restaurant_profile').select('*').single(),
        restaurantSupabase.from('categories').select('*').eq('is_active', true).order('display_order'),
        restaurantSupabase.from('menu_items').select('*').eq('is_available', true).order('is_featured', { ascending: false }).order('display_order'),
        restaurantSupabase.from('restaurant_customization').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
        restaurantSupabase.from('language_settings').select('*').maybeSingle(),
        restaurantSupabase.from('currency_settings').select('*').maybeSingle(),
        restaurantSupabase.from('popup_settings').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle()
      ]);

      return {
        profile: profileRes.status === 'fulfilled' ? profileRes.value.data : null,
        categories: categoriesRes.status === 'fulfilled' ? (categoriesRes.value.data || []).filter(cat => cat.is_active) : [],
        menuItems: menuItemsRes.status === 'fulfilled' ? (menuItemsRes.value.data || []).filter(item => item.is_available) : [],
        customization: customizationRes.status === 'fulfilled' ? customizationRes.value.data : null,
        languageSettings: languageRes.status === 'fulfilled' ? languageRes.value.data : null,
        currencySettings: currencyRes.status === 'fulfilled' ? currencyRes.value.data : null,
        popupSettings: popupRes.status === 'fulfilled' ? popupRes.value.data : null
      };
    },
    enabled: !!restaurantSupabase,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
    refetchInterval: false,
    select: (data) => data,
    notifyOnChangeProps: ['data', 'error']
  });

  // Extract individual data from combined query
  const profile = restaurantData?.profile as RestaurantProfile;
  const categories = restaurantData?.categories as Category[] || [];
  const menuItems = restaurantData?.menuItems as MenuItem[] || [];
  const customization = restaurantData?.customization;
  const languageSettings = restaurantData?.languageSettings;
  const currencySettings = restaurantData?.currencySettings;
  const rawPopupSettings = restaurantData?.popupSettings;

  // Process popup settings
  const popupSettings = useMemo(() => {
    if (!rawPopupSettings) return null;
    
    return {
      enabled: rawPopupSettings.enabled,
      type: rawPopupSettings.type,
      title: rawPopupSettings.title,
      description: rawPopupSettings.description,
      link: rawPopupSettings.link || '',
      buttonText: rawPopupSettings.button_text,
      showAfterSeconds: rawPopupSettings.show_after_seconds || 3,
      dailyLimit: rawPopupSettings.daily_limit || 1,
      socialMedia: rawPopupSettings.social_media || [],
      reviewOptions: rawPopupSettings.review_options || [],
      wheelSettings: {
        enabled: rawPopupSettings.wheel_enabled,
        unlockType: rawPopupSettings.wheel_unlock_type || 'free',
        unlockText: rawPopupSettings.wheel_unlock_text,
        unlockButtonText: rawPopupSettings.wheel_unlock_button_text,
        unlockLink: rawPopupSettings.wheel_unlock_link || '',
        rewards: rawPopupSettings.wheel_rewards || []
      }
    } as PopupSettings;
  }, [rawPopupSettings]);

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
    // Disabled: Don't switch to items layout on swipe left
    // This prevents accidental layout changes when swiping on the menu page
  }, []);

  const swipeRef = useSwipeGestures({
    onSwipeRight: handleSwipeRight,
    // onSwipeLeft: removed to prevent any layout switching on right-to-left swipe
    threshold: 80,
    preventScroll: true
  });

  // Filter menu items by category when needed
  const filteredMenuItemsByCategory = useMemo(() => {
    if (!selectedCategory) return menuItems;
    return menuItems.filter(item => item.category_id === selectedCategory);
  }, [menuItems, selectedCategory]);


  // Initialize language and currency from settings (only if user hasn't manually changed it)
  useEffect(() => {
    if (!userHasChangedLanguage && 
        languageSettings?.main_ui_language && 
        languageSettings.supported_ui_languages?.includes(languageSettings.main_ui_language)) {
      setCurrentLanguage(languageSettings.main_ui_language);
    }
  }, [languageSettings, userHasChangedLanguage]);

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

  // Set animation flag on initial load
  useEffect(() => {
    if (!hasAnimated && profile && categories.length > 0) {
      setHasAnimated(true);
    }
  }, [profile, categories, hasAnimated]);

  // Optimized image URL helpers - now stable and memoized properly
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

  // Stable memoized image URLs that don't depend on search state
  const bannerImageUrl = useMemo(() => {
    return profile ? getDisplayImageUrl(profile.banner_path, profile.banner_url) : null;
  }, [profile, getDisplayImageUrl]);

  const logoImageUrl = useMemo(() => {
    return profile ? getDisplayImageUrl(profile.logo_path, profile.logo_url) : null;
  }, [profile, getDisplayImageUrl]);
  
  // Optimized search with debouncing
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Simplified filtered items with better search logic - isolated from header rendering
  const filteredMenuItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return menuItems;
    
    const searchLower = debouncedSearchTerm.toLowerCase().trim();
    
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
  }, [menuItems, debouncedSearchTerm, currentLanguage, categories]);

  // Filter items by category for tabs
  const getFilteredItemsByCategory = useCallback((categoryId: string | null) => {
    const baseItems = debouncedSearchTerm ? filteredMenuItems : menuItems;
    
    if (!categoryId) return baseItems;
    
    return baseItems.filter(item => item.category_id === categoryId);
  }, [menuItems, filteredMenuItems, debouncedSearchTerm]);

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

  // Simplified search handler - clean implementation
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    console.log('Search term updated:', value);
  }, []);

  // Clear search function
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    console.log('Search cleared');
  }, []);

  // Updated SearchBar component with custom theme support
  const SearchBar = useMemo(() => {
    const searchBarStyles = {
      backgroundColor: customTheme?.searchBarBackground || customTheme?.cardBackground || '#ffffff',
      borderColor: customTheme?.searchBarBorder || customTheme?.borderColor || '#e5e7eb',
      color: customTheme?.searchBarText || customTheme?.textColor || '#1f2937',
      '--placeholder-color': customTheme?.searchBarPlaceholder || customTheme?.mutedTextColor || '#6b7280'
    } as React.CSSProperties;

    const iconColor = customTheme?.searchBarText || customTheme?.mutedTextColor || '#6b7280';

    return (
      <div className="px-3 py-3">
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" 
            style={{ color: iconColor }}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full h-10 pl-10 pr-10 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              ...searchBarStyles,
              '::placeholder': {
                color: 'var(--placeholder-color)'
              }
            } as React.CSSProperties}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <style>
            {`
              input[type="text"]::placeholder {
                color: ${customTheme?.searchBarPlaceholder || customTheme?.mutedTextColor || '#6b7280'};
              }
            `}
          </style>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:opacity-60 cursor-pointer"
              style={{ color: iconColor }}
              aria-label="Clear search"
              type="button"
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  }, [searchTerm, handleSearchChange, clearSearch, customTheme]);

  // Header callback handlers
  const handleBackClick = useCallback(() => {
    setSelectedCategory(null);
  }, []);

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
  if (dataLoading) {
    return <MenuLoadingSkeleton layoutStyle={layoutStyle} />;
  }

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
          
          <MenuHeader
            profile={profile}
            bannerImageUrl={bannerImageUrl}
            logoImageUrl={logoImageUrl}
            selectedCategory={selectedCategory}
            layoutPreference={layoutPreference}
            categories={categories}
            customTheme={customTheme}
            currentLanguage={currentLanguage}
            currentCurrency={currentCurrency}
            restaurantSupabase={restaurantSupabase}
            hasAnimated={hasAnimated}
            onBackClick={handleBackClick}
            onLanguageChange={debouncedLanguageChange}
            onCurrencyChange={setCurrentCurrency}
            getLocalizedText={getLocalizedText}
          />
          {SearchBar}
          <div className="px-3 py-3">
            <div className="max-w-sm mx-auto">
              {categoryItems.length === 0 ? (
                <div className="text-center py-8 fade-in">
                  <Utensils className="h-10 w-10 mx-auto mb-3" style={mutedTextStyles} />
                  <p className="text-sm" style={mutedTextStyles}>
                    {debouncedSearchTerm ? 'No items found matching your search in this category.' : 'No items found in this category.'}
                  </p>
                  {debouncedSearchTerm && (
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
          {popupSettings && popupSettings.enabled && restaurant && (
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
    
    // Categories layout - show search results when searching
    if (searchTerm) {
      return <div ref={swipeRef} className="viewport-fill smooth-scroll" style={themeStyles}>
          {/* Viewport background fill */}
          <div 
            className="fixed inset-0 -z-10" 
            style={{ backgroundColor: customTheme?.backgroundColor || '#ffffff' }}
          />
          
          <MenuHeader
            profile={profile}
            bannerImageUrl={bannerImageUrl}
            logoImageUrl={logoImageUrl}
            selectedCategory={selectedCategory}
            layoutPreference={layoutPreference}
            categories={categories}
            customTheme={customTheme}
            currentLanguage={currentLanguage}
            currentCurrency={currentCurrency}
            restaurantSupabase={restaurantSupabase}
            hasAnimated={hasAnimated}
            onBackClick={handleBackClick}
            onLanguageChange={debouncedLanguageChange}
            onCurrencyChange={setCurrentCurrency}
            getLocalizedText={getLocalizedText}
          />
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
          {popupSettings && popupSettings.enabled && restaurant && (
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
        
        <MenuHeader
          profile={profile}
          bannerImageUrl={bannerImageUrl}
          logoImageUrl={logoImageUrl}
          selectedCategory={selectedCategory}
          layoutPreference={layoutPreference}
          categories={categories}
          customTheme={customTheme}
          currentLanguage={currentLanguage}
          currentCurrency={currentCurrency}
          restaurantSupabase={restaurantSupabase}
          hasAnimated={hasAnimated}
          onBackClick={handleBackClick}
            onLanguageChange={debouncedLanguageChange}
          onCurrencyChange={setCurrentCurrency}
          getLocalizedText={getLocalizedText}
        />
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
        {popupSettings && popupSettings.enabled && restaurant && (
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
      
      <MenuHeader
        profile={profile}
        bannerImageUrl={bannerImageUrl}
        logoImageUrl={logoImageUrl}
        selectedCategory={selectedCategory}
        layoutPreference={layoutPreference}
        categories={categories}
        customTheme={customTheme}
        currentLanguage={currentLanguage}
        currentCurrency={currentCurrency}
        restaurantSupabase={restaurantSupabase}
        hasAnimated={hasAnimated}
        onBackClick={handleBackClick}
        onLanguageChange={debouncedLanguageChange}
        onCurrencyChange={setCurrentCurrency}
        getLocalizedText={getLocalizedText}
      />
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
      {popupSettings && popupSettings.enabled && restaurant && (
        <PopupModal 
          settings={popupSettings} 
          restaurantName={restaurant.name} 
          customTheme={customTheme}
        />
      )}

      {/* Menu Item Detail Popup - Updated */}
      {selectedMenuItem && (
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
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(EnhancedMenu);
