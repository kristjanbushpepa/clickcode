import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Clock, Phone, Instagram, Globe, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getRestaurantSupabase, createRestaurantSupabase } from '@/utils/restaurantDatabase';
import { EnhancedMenuItem } from '@/components/menu/EnhancedMenuItem';
import { MenuLoadingSkeleton } from '@/components/menu/MenuSkeleton';
import { PopupModal } from '@/components/menu/PopupModal';
import { LanguageSwitch } from '@/components/menu/LanguageSwitch';
import { CurrencySwitch } from '@/components/menu/CurrencySwitch';
import { MenuFooter } from '@/components/menu/MenuFooter';
import { useThemeCustomization } from '@/hooks/useThemeCustomization';

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  instagram?: string;
  website?: string;
  logo_url?: string;
  background_image_url?: string;
  working_hours?: any;
}

interface MenuCategory {
  id: string;
  name: string;
  name_en?: string;
  name_it?: string;
  name_de?: string;
  name_fr?: string;
  name_zh?: string;
  display_order: number;
}

interface MenuItem {
  id: string;
  name: string;
  name_en?: string;
  name_it?: string;
  name_de?: string;
  name_fr?: string;
  name_zh?: string;
  description?: string;
  description_en?: string;
  description_it?: string;
  description_de?: string;
  description_fr?: string;
  description_zh?: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_available: boolean;
  display_order: number;
  allergens?: string[];
  currency?: string;
  is_featured?: boolean;
}

interface PopupSettings {
  id: string;
  is_active: boolean;
  popup_type: 'image' | 'wheel';
  popup_content?: any;
  wheel_prizes?: any[];
  display_frequency: number;
  created_at: string;
  updated_at: string;
  enabled?: boolean;
  type?: string;
  title?: string;
  description?: string;
}

interface CurrencySettings {
  id: string;
  main_currency: string;
  supported_currencies: string[];
  exchange_rates: { [key: string]: number };
}

interface LanguageSettings {
  id: string;
  main_ui_language: string;
  supported_ui_languages: string[];
  content_languages: string[];
  auto_translate: boolean;
}

const CURRENCY_SYMBOLS: { [key: string]: string } = {
  'EUR': '€',
  'USD': '$',
  'GBP': '£',
  'ALL': 'L',
  'CHF': 'Fr'
};

const LANGUAGE_NAMES: { [key: string]: string } = {
  'sq': 'Shqip',
  'en': 'English',
  'it': 'Italiano',
  'de': 'Deutsch',
  'fr': 'Français',
  'zh': '中文'
};

const EnhancedMenu = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [restaurantSupabase, setRestaurantSupabase] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('sq');
  const [currentCurrency, setCurrentCurrency] = useState('EUR');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (slug) {
      const supabase = createRestaurantSupabase(slug);
      setRestaurantSupabase(supabase);
      console.log('Restaurant supabase client created for:', slug);
    }
  }, [slug]);

  const { data: restaurant, isLoading: restaurantLoading } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: async () => {
      if (!restaurantSupabase) return null;
      const { data, error } = await restaurantSupabase
        .from('restaurant_profile')
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data as Restaurant | null;
    },
    enabled: !!restaurantSupabase,
  });

  // Add theme customization with proper arguments
  const { data: customTheme } = useThemeCustomization(restaurantSupabase, slug || '');

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', slug],
    queryFn: async () => {
      if (!restaurantSupabase) return [];
      const { data, error } = await restaurantSupabase
        .from('menu_categories')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as MenuCategory[];
    },
    enabled: !!restaurantSupabase,
  });

  const { data: menuItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['menu_items', slug],
    queryFn: async () => {
      if (!restaurantSupabase) return [];
      const { data, error } = await restaurantSupabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('display_order');
      if (error) throw error;
      return data as MenuItem[];
    },
    enabled: !!restaurantSupabase,
  });

  const { data: popupSettings } = useQuery({
    queryKey: ['popup_settings', slug],
    queryFn: async () => {
      if (!restaurantSupabase) return null;
      const { data, error } = await restaurantSupabase
        .from('popup_settings')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();
      if (error) {
        console.error('Popup settings fetch error:', error);
        return null;
      }
      return data as PopupSettings | null;
    },
    enabled: !!restaurantSupabase,
  });

  const { data: currencySettings } = useQuery({
    queryKey: ['currency_settings', slug],
    queryFn: async () => {
      if (!restaurantSupabase) return null;
      const { data, error } = await restaurantSupabase
        .from('currency_settings')
        .select('*')
        .maybeSingle();
      if (error) {
        console.error('Currency settings fetch error:', error);
        return null;
      }
      return data as CurrencySettings | null;
    },
    enabled: !!restaurantSupabase,
  });

  const { data: languageSettings } = useQuery({
    queryKey: ['language_settings', slug],
    queryFn: async () => {
      if (!restaurantSupabase) return null;
      const { data, error } = await restaurantSupabase
        .from('language_settings')
        .select('*')
        .maybeSingle();
      if (error) {
        console.error('Language settings fetch error:', error);
        return null;
      }
      return data as LanguageSettings | null;
    },
    enabled: !!restaurantSupabase,
  });

  useEffect(() => {
    if (popupSettings && popupSettings.is_active) {
      const lastShown = localStorage.getItem(`popup_${slug}_last_shown`);
      const now = Date.now();
      
      if (!lastShown || (now - parseInt(lastShown)) > (popupSettings.display_frequency * 60 * 1000)) {
        const timer = setTimeout(() => {
          setShowPopup(true);
          localStorage.setItem(`popup_${slug}_last_shown`, now.toString());
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [popupSettings, slug]);

  useEffect(() => {
    if (languageSettings?.main_ui_language) {
      setCurrentLanguage(languageSettings.main_ui_language);
    }
  }, [languageSettings]);

  useEffect(() => {
    if (currencySettings?.main_currency) {
      setCurrentCurrency(currencySettings.main_currency);
    }
  }, [currencySettings]);

  const getLocalizedText = (item: any, field: string): string => {
    const langSuffix = currentLanguage === 'sq' ? '' : `_${currentLanguage}`;
    const localizedField = `${field}${langSuffix}`;
    return item[localizedField] || item[field] || '';
  };

  const convertPrice = (price: number): number => {
    if (!currencySettings?.exchange_rates || currentCurrency === currencySettings.main_currency) {
      return price;
    }
    const rate = currencySettings.exchange_rates[currentCurrency];
    return rate ? price * rate : price;
  };

  const formatPrice = (price: number): string => {
    const convertedPrice = convertPrice(price);
    const symbol = CURRENCY_SYMBOLS[currentCurrency] || currentCurrency;
    return `${symbol}${convertedPrice.toFixed(2)}`;
  };

  const filteredItems = useMemo(() => {
    if (!menuItems) return [];
    
    let filtered = menuItems;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category_id === selectedCategory);
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        getLocalizedText(item, 'name').toLowerCase().includes(searchLower) ||
        getLocalizedText(item, 'description').toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [menuItems, selectedCategory, searchTerm, currentLanguage]);

  if (restaurantLoading || categoriesLoading || itemsLoading) {
    return <MenuLoadingSkeleton />;
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Restaurant not found</h1>
          <p className="text-muted-foreground">The restaurant you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const backgroundStyle = restaurant.background_image_url 
    ? { 
        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%), url(${restaurant.background_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }
    : customTheme 
    ? { backgroundColor: customTheme.primaryColor }
    : { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: customTheme?.backgroundColor || '#ffffff' }}>
      {/* Header */}
      <div 
        className="relative px-4 py-8 text-white"
        style={backgroundStyle}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            {restaurant.logo_url && (
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                <img 
                  src={restaurant.logo_url} 
                  alt={`${restaurant.name} logo`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex gap-3">
              {/* Language Switch */}
              {languageSettings && (
                <div style={{
                  backgroundColor: customTheme?.languageSwitchBackground || customTheme?.primaryColor || '#000000',
                  borderColor: customTheme?.languageSwitchBorder || customTheme?.borderColor || '#e5e5e5',
                  color: customTheme?.languageSwitchText || '#ffffff'
                }} className="rounded-md border">
                  <LanguageSwitch
                    restaurantSupabase={restaurantSupabase}
                    currentLanguage={currentLanguage}
                    onLanguageChange={setCurrentLanguage}
                    customTheme={customTheme}
                  />
                </div>
              )}
              
              {/* Currency Switch */}
              {currencySettings && (
                <div style={{
                  backgroundColor: customTheme?.currencySwitchBackground || customTheme?.primaryColor || '#000000',
                  borderColor: customTheme?.currencySwitchBorder || customTheme?.borderColor || '#e5e5e5',
                  color: customTheme?.currencySwitchText || '#ffffff'
                }} className="rounded-md border">
                  <CurrencySwitch
                    restaurantSupabase={restaurantSupabase}
                    currentCurrency={currentCurrency}
                    onCurrencyChange={setCurrentCurrency}
                    customTheme={customTheme}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 uppercase tracking-wide" style={{ color: customTheme?.headingColor || '#ffffff' }}>
              {restaurant.name}
            </h1>
            {restaurant.description && (
              <p className="text-lg opacity-90 mb-4 uppercase tracking-wide">
                {restaurant.description}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {restaurant.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {restaurant.address}
                </div>
              )}
              {restaurant.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {restaurant.phone}
                </div>
              )}
              {restaurant.instagram && (
                <div className="flex items-center gap-1">
                  <Instagram className="h-4 w-4" />
                  @{restaurant.instagram}
                </div>
              )}
              {restaurant.website && (
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  Website
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6" style={{ color: customTheme?.textColor || '#1f2937' }}>
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={currentLanguage === 'en' ? 'Search menu...' : 'Kërko në menu...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
              style={{ 
                backgroundColor: customTheme?.cardBackground || '#ffffff',
                borderColor: customTheme?.borderColor || '#e5e5e5',
                color: customTheme?.textColor || '#1f2937'
              }}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <div className="mb-6">
            <ScrollArea className="w-full">
              <TabsList 
                className="inline-flex h-auto p-1 bg-transparent"
                style={{ backgroundColor: 'transparent' }}
              >
                <TabsTrigger 
                  value="all" 
                  className="text-xs h-7 px-3 flex-shrink-0"
                  style={{
                    '--tab-active-bg': customTheme?.tabActiveBackground || '#1f2937',
                    '--tab-active-text': customTheme?.tabActiveText || '#ffffff',
                    '--tab-hover-bg': customTheme?.tabHoverBackground || '#111827'
                  } as React.CSSProperties}
                >
                  All
                </TabsTrigger>
                {categories?.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id} 
                    className="text-xs h-7 px-3 flex-shrink-0"
                    style={{
                      '--tab-active-bg': customTheme?.tabActiveBackground || '#1f2937',
                      '--tab-active-text': customTheme?.tabActiveText || '#ffffff',
                      '--tab-hover-bg': customTheme?.tabHoverBackground || '#111827'
                    } as React.CSSProperties}
                  >
                    {getLocalizedText(category, 'name')}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
          </div>

          <TabsContent value={selectedCategory} className="mt-0">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? (currentLanguage === 'en' ? 'No items found matching your search.' : 'Nuk u gjetën artikuj që përputhen me kërkimin tuaj.')
                    : (currentLanguage === 'en' ? 'No items available in this category.' : 'Nuk ka artikuj të disponueshëm në këtë kategori.')
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredItems.map((item) => (
                  <EnhancedMenuItem
                    key={item.id}
                    item={{
                      ...item,
                      currency: item.currency || currentCurrency,
                      is_featured: item.is_featured || false,
                      allergens: item.allergens || []
                    }}
                    getLocalizedText={getLocalizedText}
                    formatPrice={formatPrice}
                    customTheme={customTheme}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <MenuFooter customTheme={customTheme} profile={restaurant} />

      {/* Popup Modal */}
      {showPopup && popupSettings && (
        <PopupModal
          settings={{
            ...popupSettings,
            enabled: popupSettings.is_active,
            type: popupSettings.popup_type === 'image' ? 'review' : popupSettings.popup_type,
            title: popupSettings.popup_content?.title || '',
            description: popupSettings.popup_content?.description || ''
          }}
          restaurantName={restaurant.name}
          customTheme={customTheme}
        />
      )}
    </div>
  );
};

export default EnhancedMenu;
