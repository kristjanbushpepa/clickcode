import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Phone, Globe, Star, Utensils, ChefHat } from 'lucide-react';
import { MenuSkeleton } from '@/components/menu/MenuSkeleton';
import { EnhancedMenuItem } from '@/components/menu/EnhancedMenuItem';
import { MenuItemDetailPopup } from '@/components/menu/MenuItemDetailPopup';
import { LanguageSwitch } from '@/components/menu/LanguageSwitch';
import { CurrencySwitch } from '@/components/menu/CurrencySwitch';
import { MenuFooter } from '@/components/menu/MenuFooter';
import { SpinWheel } from '@/components/menu/SpinWheel';
import { PopupModal } from '@/components/menu/PopupModal';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';

interface Restaurant {
  id: string;
  name: string;
  name_sq: string;
  description: string;
  description_sq: string;
  address: string;
  phone: string;
  website: string;
  opening_hours: string;
  rating: number;
  logo_path: string;
  banner_image_path: string;
  currency: string;
  available_languages: string[];
  available_currencies: string[];
  popup_id: string | null;
}

interface Category {
  id: string;
  name: string;
  name_sq: string;
  display_order: number;
  is_active: boolean;
}

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  name_sq: string;
  description: string;
  description_sq: string;
  price: number;
  currency: string;
  image_path: string;
  is_available: boolean;
  is_featured: boolean;
  allergens: string[];
  preparation_time: number;
  display_order: number;
  sizes: MenuItemSize[];
}

interface MenuItemSize {
  name: string;
  price: number;
}

interface Popup {
  id: string;
  title: string;
  title_sq: string;
  content: string;
  content_sq: string;
  image_path: string;
  start_date: string;
  end_date: string;
}

export default function EnhancedMenu() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentCurrency, setCurrentCurrency] = useState('USD');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [popup, setPopup] = useState<Popup | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const { swipeLeft, swipeRight } = useSwipeGestures(() => {
    const currentIndex = availableLanguages.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % availableLanguages.length;
    setCurrentLanguage(availableLanguages[nextIndex]);
  }, () => {
    const currentIndex = availableLanguages.indexOf(currentLanguage);
    const previousIndex = (currentIndex - 1 + availableLanguages.length) % availableLanguages.length;
    setCurrentLanguage(availableLanguages[previousIndex]);
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['restaurantData'],
    queryFn: async () => {
      const restaurantSupabase = getRestaurantSupabase();

      // Fetch restaurant
      const { data: restaurantData, error: restaurantError } = await restaurantSupabase
        .from('restaurants')
        .select('*')
        .single();

      if (restaurantError) {
        console.error("Error fetching restaurant:", restaurantError);
        throw restaurantError;
      }

      setRestaurant(restaurantData);
      setAvailableLanguages(restaurantData.available_languages);
      setAvailableCurrencies(restaurantData.available_currencies);
      setCurrentCurrency(restaurantData.currency);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await restaurantSupabase
        .from('categories')
        .select('*')
        .order('display_order');

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        throw categoriesError;
      }

      setCategories(categoriesData);

      // Fetch menu items
      const { data: menuItemsData, error: menuItemsError } = await restaurantSupabase
        .from('menu_items')
        .select('*')
        .order('display_order');

      if (menuItemsError) {
        console.error("Error fetching menu items:", menuItemsError);
        throw menuItemsError;
      }

      setMenuItems(menuItemsData);

      // Fetch popup
      if (restaurantData.popup_id) {
        const { data: popupData, error: popupError } = await restaurantSupabase
          .from('popups')
          .select('*')
          .eq('id', restaurantData.popup_id)
          .single();

        if (popupError) {
          console.error("Error fetching popup:", popupError);
        } else {
          const startDate = new Date(popupData.start_date);
          const endDate = new Date(popupData.end_date);
          const now = new Date();

          if (now >= startDate && now <= endDate) {
            setPopup(popupData);
            setShowPopup(true);
          }
        }
      }

      return restaurantData;
    },
  });

  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return '';
    const restaurantSupabase = getRestaurantSupabase();
    const { data } = restaurantSupabase.storage
      .from('restaurant-images')
      .getPublicUrl(imagePath);
    return data.publicUrl;
  };

  const getLocalizedText = useCallback((enText: string, sqText: string) => {
    return currentLanguage === 'sq' ? sqText || enText : enText;
  }, [currentLanguage]);

  const formatPrice = (price: number) => {
    const currencySymbol = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentCurrency,
    }).currencyDisplay;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentCurrency,
    }).format(price);
  };

  if (isLoading) {
    return <MenuSkeleton />;
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Restaurant Not Found</h2>
          <p className="text-muted-foreground">
            The restaurant you're looking for doesn't exist or is temporarily unavailable.
          </p>
        </Card>
      </div>
    );
  }

  const bannerImage = restaurant.banner_image_path 
    ? getImageUrl(restaurant.banner_image_path)
    : restaurant.logo_path 
      ? getImageUrl(restaurant.logo_path)
      : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className="relative h-80 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
        {bannerImage && (
          <img
            src={bannerImage}
            alt={getLocalizedText(restaurant.name, restaurant.name_sq)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Controls */}
        <div className="absolute top-6 right-6 flex gap-3 z-10">
          <LanguageSwitch 
            currentLanguage={currentLanguage} 
            onLanguageChange={setCurrentLanguage}
            availableLanguages={availableLanguages}
          />
          <CurrencySwitch 
            currentCurrency={currentCurrency} 
            onCurrencyChange={setCurrentCurrency}
            availableCurrencies={availableCurrencies}
          />
        </div>

        {/* Restaurant Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-end gap-6">
              {restaurant.logo_path && restaurant.banner_image_path && (
                <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                  <img
                    src={getImageUrl(restaurant.logo_path)}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {getLocalizedText(restaurant.name, restaurant.name_sq)}
                </h1>
                <p className="text-xl opacity-90 mb-4">
                  {getLocalizedText(restaurant.description, restaurant.description_sq)}
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  {restaurant.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{restaurant.address}</span>
                    </div>
                  )}
                  {restaurant.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{restaurant.phone}</span>
                    </div>
                  )}
                  {restaurant.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <div className="container mx-auto max-w-6xl">
          {/* Categories */}
          <div className="mb-10">
            <h2 className="text-3xl font-semibold mb-6">{getLocalizedText('Categories', 'Kategoritë')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.filter(cat => cat.is_active).map(category => (
                <div key={category.id} className="bg-card rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{getLocalizedText(category.name, category.name_sq)}</h3>
                    <p className="text-muted-foreground text-sm">
                      {menuItems.filter(item => item.category_id === category.id).length} {getLocalizedText('items', 'artikuj')}
                    </p>
                  </div>
                  <div className="bg-muted p-4 flex justify-end">
                    <Utensils className="h-5 w-5 text-primary" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          <div {...swipeLeft} {...swipeRight}>
            <h2 className="text-3xl font-semibold mb-6">{getLocalizedText('Menu', 'Menuja')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.filter(item => item.is_available).map(item => (
                <EnhancedMenuItem
                  key={item.id}
                  item={item}
                  currentLanguage={currentLanguage}
                  currentCurrency={currentCurrency}
                  getLocalizedText={getLocalizedText}
                  formatPrice={formatPrice}
                  getImageUrl={getImageUrl}
                  onSelect={() => setSelectedItem(item)}
                />
              ))}
            </div>
          </div>
          
          {/* Spin Wheel Button */}
          <div className="mt-12 text-center">
            <button
              onClick={() => setShowSpinWheel(true)}
              className="inline-flex items-center justify-center text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none data-[state=open]:bg-secondary data-[state=open]:text-secondary-foreground bg-primary text-primary-foreground h-10 py-2 px-4 rounded-md"
            >
              <ChefHat className="w-4 h-4 mr-2" />
              {getLocalizedText('Spin the Wheel!', 'Rrotullo rrotën!')}
            </button>
          </div>
        </div>
      </div>

      {/* Popups */}
      {selectedItem && (
        <MenuItemDetailPopup
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          currentLanguage={currentLanguage}
          currentCurrency={currentCurrency}
          getLocalizedText={getLocalizedText}
          formatPrice={formatPrice}
          getImageUrl={getImageUrl}
        />
      )}

      {/* Spin Wheel */}
      {showSpinWheel && (
        <SpinWheel
          menuItems={menuItems.filter(item => item.is_available)}
          onClose={() => setShowSpinWheel(false)}
          currentLanguage={currentLanguage}
          getLocalizedText={getLocalizedText}
          getImageUrl={getImageUrl}
        />
      )}

      {/* Popup Modal */}
      {popup && (
        <PopupModal
          popup={popup}
          onClose={() => setShowPopup(false)}
          currentLanguage={currentLanguage}
          getLocalizedText={getLocalizedText}
          getImageUrl={getImageUrl}
        />
      )}

      <MenuFooter restaurant={restaurant} currentLanguage={currentLanguage} getLocalizedText={getLocalizedText} />
    </div>
  );
}
