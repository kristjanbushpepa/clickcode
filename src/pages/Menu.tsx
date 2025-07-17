
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MenuLoadingSkeleton } from '@/components/menu/MenuSkeleton';
import { EnhancedMenuItem } from '@/components/menu/EnhancedMenuItem';
import { MenuFooter } from '@/components/menu/MenuFooter';
import { LanguageSwitch } from '@/components/menu/LanguageSwitch';
import { CurrencySwitch } from '@/components/menu/CurrencySwitch';
import { PopupModal } from '@/components/menu/PopupModal';
import { usePopupSettings } from '@/hooks/usePopupSettings';
import { createRestaurantSupabase } from '@/utils/restaurantDatabase';

const Menu = () => {
  const { id } = useParams();
  const [restaurantData, setRestaurantData] = useState(null);
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurantSupabase, setRestaurantSupabase] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('sq');
  const [currentCurrency, setCurrentCurrency] = useState('ALL');

  // Popup settings hook
  const { settings: popupSettings } = usePopupSettings(
    restaurantData?.supabase_url || '',
    restaurantData?.supabase_anon_key || ''
  );

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        // First, get restaurant connection info from admin database
        const { data: restaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .select('supabase_url, supabase_anon_key, name')
          .eq('id', id)
          .single();

        if (restaurantError) throw restaurantError;
        if (!restaurant) throw new Error('Restaurant not found');

        setRestaurantData(restaurant);

        // Connect to restaurant's database
        const restaurantSupabaseClient = createRestaurantSupabase(
          restaurant.supabase_url,
          restaurant.supabase_anon_key
        );
        setRestaurantSupabase(restaurantSupabaseClient);

        // Fetch restaurant profile and menu data
        const [profileResponse, categoriesResponse, menuItemsResponse] = await Promise.all([
          restaurantSupabaseClient.from('restaurant_profile').select('*').single(),
          restaurantSupabaseClient.from('categories').select('*').order('display_order'),
          restaurantSupabaseClient.from('menu_items').select('*').order('display_order')
        ]);

        if (profileResponse.error) throw profileResponse.error;
        if (categoriesResponse.error) throw categoriesResponse.error;
        if (menuItemsResponse.error) throw menuItemsResponse.error;

        setMenuData({
          profile: profileResponse.data,
          categories: categoriesResponse.data || [],
          menuItems: menuItemsResponse.data || []
        });

      } catch (err) {
        console.error('Error fetching menu:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurantAndMenu();
    }
  }, [id]);

  const formatPrice = (price, currency) => {
    const symbols = {
      'ALL': 'L',
      'EUR': '€',
      'USD': '$',
      'GBP': '£',
      'CHF': 'CHF'
    };
    return `${symbols[currency] || currency} ${price.toFixed(2)}`;
  };

  const getLocalizedText = (item, field) => {
    if (currentLanguage === 'sq' && item[`${field}_sq`]) {
      return item[`${field}_sq`];
    }
    return item[field] || '';
  };

  const getMenuItemImageUrl = (item) => {
    return item.image_url || item.image_path || null;
  };

  if (loading) return <MenuLoadingSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Menu Not Found</h2>
          <p className="text-gray-600">The requested menu could not be found.</p>
        </div>
      </div>
    );
  }

  const { profile, categories, menuItems } = menuData;

  return (
    <div className="min-h-screen bg-background">
      {/* Popup Modal */}
      {popupSettings && (
        <PopupModal 
          settings={popupSettings} 
          restaurantName={restaurantData.name}
        />
      )}

      {/* Header */}
      <div className="relative h-64 bg-gradient-to-br from-primary to-primary/80">
        {profile.banner_url && (
          <img
            src={profile.banner_url}
            alt="Restaurant banner"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end gap-4">
            {profile.logo_url && (
              <img
                src={profile.logo_url}
                alt="Restaurant logo"
                className="w-20 h-20 rounded-full border-4 border-white object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
              {profile.description && (
                <p className="text-white/90 mt-1">{profile.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Language and Currency Controls */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Menu</h2>
          <div className="flex gap-3">
            <LanguageSwitch 
              restaurantSupabase={restaurantSupabase}
              currentLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
            />
            <CurrencySwitch 
              restaurantSupabase={restaurantSupabase}
              currentCurrency={currentCurrency}
              onCurrencyChange={setCurrentCurrency}
            />
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="container mx-auto px-4 py-8">
        {categories.map((category) => {
          const categoryItems = menuItems.filter(
            (item) => item.category_id === category.id && item.is_available
          );

          if (categoryItems.length === 0) return null;

          return (
            <div key={category.id} className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-muted-foreground">{category.description}</p>
                )}
              </div>

              <div className="grid gap-4">
                {categoryItems.map((item) => (
                  <EnhancedMenuItem 
                    key={item.id} 
                    item={item}
                    layoutStyle="compact"
                    formatPrice={formatPrice}
                    getLocalizedText={getLocalizedText}
                    getMenuItemImageUrl={getMenuItemImageUrl}
                    categoryName={category.name}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <MenuFooter profile={profile} />
    </div>
  );
};

export default Menu;
