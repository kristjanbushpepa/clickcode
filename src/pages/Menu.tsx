import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MenuFooter } from '@/components/menu/MenuFooter';
import { CurrencySwitch } from '@/components/menu/CurrencySwitch';
import { LanguageSwitch } from '@/components/menu/LanguageSwitch';
import { Share2, Star, Clock } from 'lucide-react';

interface MenuTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

interface CustomizationSettings {
  theme: MenuTheme;
  layout: 'categories' | 'items';
  preset: string;
}

const Menu = () => {
  const { restaurantName } = useParams();
  const [searchParams] = useSearchParams();
  const layoutParam = searchParams.get('layout') as 'categories' | 'items' | null;
  
  const [selectedLanguage, setSelectedLanguage] = useState('sq');
  const [selectedCurrency, setSelectedCurrency] = useState('ALL');
  const [restaurantSupabase, setRestaurantSupabase] = useState<any>(null);
  const [customTheme, setCustomTheme] = useState<MenuTheme | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<'categories' | 'items'>('categories');

  // Get restaurant info
  const { data: restaurantInfo } = useQuery({
    queryKey: ['restaurant_info', restaurantName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('name', restaurantName)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!restaurantName
  });

  // Initialize restaurant Supabase client
  useEffect(() => {
    if (restaurantInfo?.supabase_url && restaurantInfo?.supabase_anon_key) {
      const client = createClient(restaurantInfo.supabase_url, restaurantInfo.supabase_anon_key);
      setRestaurantSupabase(client);
    }
  }, [restaurantInfo]);

  // Load customization settings
  const { data: customizationSettings } = useQuery({
    queryKey: ['customization_settings', restaurantInfo?.id],
    queryFn: async () => {
      if (!restaurantSupabase) return null;
      
      const { data, error } = await restaurantSupabase
        .from('restaurant_customization')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('Error loading customization:', error);
        return null;
      }
      return data as CustomizationSettings | null;
    },
    enabled: !!restaurantSupabase
  });

  // Apply customization when loaded
  useEffect(() => {
    if (customizationSettings) {
      setCustomTheme(customizationSettings.theme);
      setSelectedLayout(layoutParam || customizationSettings.layout || 'categories');
    } else {
      // Fallback to localStorage if database settings not found
      const savedTheme = localStorage.getItem('menu_theme');
      const savedLayout = localStorage.getItem('menu_layout');
      
      if (savedTheme) {
        try {
          setCustomTheme(JSON.parse(savedTheme));
        } catch (e) {
          console.error('Error parsing saved theme:', e);
        }
      }
      
      if (savedLayout) {
        setSelectedLayout(layoutParam || savedLayout as 'categories' | 'items');
      }
    }
  }, [customizationSettings, layoutParam]);

  // Get restaurant profile
  const { data: profile } = useQuery({
    queryKey: ['restaurant_profile', restaurantInfo?.id],
    queryFn: async () => {
      if (!restaurantSupabase) return null;
      
      const { data, error } = await restaurantSupabase
        .from('restaurant_profile')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!restaurantSupabase
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', restaurantInfo?.id],
    queryFn: async () => {
      if (!restaurantSupabase) return [];
      
      const { data, error } = await restaurantSupabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!restaurantSupabase
  });

  const { data: menuItems } = useQuery({
    queryKey: ['menu_items', restaurantInfo?.id],
    queryFn: async () => {
      if (!restaurantSupabase) return [];
      
      const { data, error } = await restaurantSupabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      console.log('Fetched menu items:', data);
      return data || [];
    },
    enabled: !!restaurantSupabase
  });

  const { data: currencySettings } = useQuery({
    queryKey: ['currency_settings', restaurantInfo?.id],
    queryFn: async () => {
      if (!restaurantSupabase) return null;
      
      const { data, error } = await restaurantSupabase
        .from('currency_settings')
        .select('*')
        .maybeSingle();
      
      if (error) return null;
      return data;
    },
    enabled: !!restaurantSupabase
  });

  // Apply custom theme to document
  useEffect(() => {
    if (customTheme) {
      const style = document.createElement('style');
      style.id = 'custom-menu-theme';
      style.textContent = `
        :root {
          --menu-primary: ${customTheme.primaryColor};
          --menu-secondary: ${customTheme.secondaryColor};
          --menu-background: ${customTheme.backgroundColor};
          --menu-text: ${customTheme.textColor};
          --menu-accent: ${customTheme.accentColor};
        }
        .menu-themed {
          background-color: var(--menu-background);
          color: var(--menu-text);
        }
        .menu-themed .menu-header {
          background-color: var(--menu-primary);
          color: white;
        }
        .menu-themed .menu-price {
          color: var(--menu-accent);
        }
        .menu-themed .menu-category-title {
          color: var(--menu-primary);
        }
      `;
      
      // Remove existing theme
      const existingStyle = document.getElementById('custom-menu-theme');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      document.head.appendChild(style);
      
      return () => {
        const styleElement = document.getElementById('custom-menu-theme');
        if (styleElement) {
          styleElement.remove();
        }
      };
    }
  }, [customTheme]);

  const convertPrice = (price: number, fromCurrency: string) => {
    if (selectedCurrency === fromCurrency) return price;
    
    const exchangeRates = currencySettings?.exchange_rates || {};
    const rate = exchangeRates[selectedCurrency] || 1;
    const baseRate = exchangeRates[fromCurrency] || 1;
    
    return Math.round((price / baseRate) * rate);
  };

  const formatPrice = (price: number, currency: string) => {
    const convertedPrice = convertPrice(price, currency);
    
    switch (selectedCurrency) {
      case 'EUR': return `€${convertedPrice}`;
      case 'USD': return `$${convertedPrice}`;
      case 'GBP': return `£${convertedPrice}`;
      case 'CHF': return `CHF ${convertedPrice}`;
      default: return `${convertedPrice} ALL`;
    }
  };

  if (!restaurantInfo) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const getFieldValue = (item: any, field: string) => {
    const langField = `${field}_${selectedLanguage}`;
    return item[langField] || item[field] || '';
  };

  const groupedItems = categories?.reduce((acc: any, category: any) => {
    const categoryItems = menuItems?.filter((item: any) => item.category_id === category.id) || [];
    if (categoryItems.length > 0) {
      acc[category.id] = {
        category,
        items: categoryItems
      };
    }
    return acc;
  }, {}) || {};

  return (
    <div className={`min-h-screen ${customTheme ? 'menu-themed' : 'bg-background'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-50 border-b ${customTheme ? 'menu-header' : 'bg-background'}`}>
        <div className="max-w-sm mx-auto px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-lg font-bold">{profile?.name || 'Menu'}</h1>
              {profile?.description && (
                <p className="text-xs opacity-80 line-clamp-1">{profile.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <CurrencySwitch 
                restaurantSupabase={restaurantSupabase}
                currentCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
              />
              <LanguageSwitch 
                currentLanguage={selectedLanguage} 
                onLanguageChange={setSelectedLanguage}
              />
              <Button variant="outline" size="sm" className="gap-1 px-2 h-8">
                <Share2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-sm mx-auto px-3 py-4">
        {selectedLayout === 'categories' ? (
          // Categories Layout
          <div className="space-y-6">
            {Object.values(groupedItems).map(({ category, items }: any) => (
              <div key={category.id} className="space-y-3">
                <div className="space-y-1">
                  <h2 className={`text-lg font-semibold ${customTheme ? 'menu-category-title' : ''}`}>
                    {getFieldValue(category, 'name')}
                  </h2>
                  {getFieldValue(category, 'description') && (
                    <p className="text-sm text-muted-foreground">
                      {getFieldValue(category, 'description')}
                    </p>
                  )}
                </div>
                
                <div className="space-y-3">
                  {items.map((item: any) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex">
                          {item.image_path && (
                            <div className="w-20 h-20 flex-shrink-0">
                              <img 
                                src={`${restaurantInfo.supabase_url}/storage/v1/object/public/menu-images/${item.image_path}`}
                                alt={getFieldValue(item, 'name')}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1 p-3 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-sm line-clamp-1">
                                    {getFieldValue(item, 'name')}
                                  </h3>
                                  {item.is_featured && (
                                    <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" fill="currentColor" />
                                  )}
                                </div>
                                
                                {getFieldValue(item, 'description') && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                    {getFieldValue(item, 'description')}
                                  </p>
                                )}
                                
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {item.preparation_time && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{item.preparation_time} min</span>
                                    </div>
                                  )}
                                  
                                  {item.allergens && item.allergens.length > 0 && (
                                    <div className="flex gap-1">
                                      {item.allergens.slice(0, 2).map((allergen: string) => (
                                        <Badge key={allergen} variant="outline" className="text-xs px-1 py-0">
                                          {allergen}
                                        </Badge>
                                      ))}
                                      {item.allergens.length > 2 && (
                                        <span className="text-muted-foreground">+{item.allergens.length - 2}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right flex-shrink-0">
                                <p className={`font-semibold text-sm ${customTheme ? 'menu-price' : 'text-primary'}`}>
                                  {formatPrice(item.price, item.currency || 'ALL')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <Separator className="my-6" />
              </div>
            ))}
          </div>
        ) : (
          // Items Layout
          <div className="space-y-4">
            {/* Category filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="whitespace-nowrap text-xs px-3 h-7"
              >
                All
              </Button>
              {categories?.map((category: any) => (
                <Button 
                  key={category.id}
                  variant="outline" 
                  size="sm" 
                  className="whitespace-nowrap text-xs px-3 h-7"
                >
                  {getFieldValue(category, 'name')}
                </Button>
              ))}
            </div>
            
            {/* All items list */}
            <div className="space-y-3">
              {menuItems?.map((item: any) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      {item.image_path && (
                        <div className="w-20 h-20 flex-shrink-0">
                          <img 
                            src={`${restaurantInfo.supabase_url}/storage/v1/object/public/menu-images/${item.image_path}`}
                            alt={getFieldValue(item, 'name')}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 p-3 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-sm line-clamp-1">
                                {getFieldValue(item, 'name')}
                              </h3>
                              {item.is_featured && (
                                <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" fill="currentColor" />
                              )}
                            </div>
                            
                            {getFieldValue(item, 'description') && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {getFieldValue(item, 'description')}
                              </p>
                            )}
                          </div>
                          
                          <div className="text-right flex-shrink-0">
                            <p className={`font-semibold text-sm ${customTheme ? 'menu-price' : 'text-primary'}`}>
                              {formatPrice(item.price, item.currency || 'ALL')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        <MenuFooter 
          profile={profile} 
          customTheme={customTheme}
          showFullContent={true}
        />
      </div>
    </div>
  );
};

export default Menu;
