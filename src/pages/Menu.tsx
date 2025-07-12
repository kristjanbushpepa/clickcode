import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';
import { Menu as MenuType } from '@/types';
import MenuCategories from '@/components/menu/MenuCategories';
import MenuItems from '@/components/menu/MenuItems';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { RestaurantHeader } from '@/components/menu/RestaurantHeader';
import { PopupModal } from '@/components/menu/PopupModal';

export default function Menu() {
  const { restaurantName } = useParams<{ restaurantName: string }>();
  const [restaurantSupabase, setRestaurantSupabase] = React.useState(getRestaurantSupabase());

  React.useEffect(() => {
    setRestaurantSupabase(getRestaurantSupabase());
  }, [restaurantName]);

  const { data: menuData, isLoading: isMenuLoading, error: menuError } = useQuery({
    queryKey: ['menu', restaurantName],
    queryFn: async () => {
      if (!restaurantSupabase || !restaurantName) return null;

      const { data, error } = await restaurantSupabase
        .from('menus')
        .select('*')
        .eq('restaurant_name', restaurantName)
        .single();

      if (error) {
        console.error('Error fetching menu:', error);
        return null;
      }

      return data as MenuType;
    },
    enabled: !!restaurantSupabase && !!restaurantName,
  });

  const { data: restaurantData, isLoading: isRestaurantLoading, error: restaurantError } = useQuery({
    queryKey: ['restaurant', restaurantName],
    queryFn: async () => {
      if (!restaurantSupabase || !restaurantName) return null;

      const { data, error } = await restaurantSupabase
        .from('restaurants')
        .select('*')
        .eq('restaurant_name', restaurantName)
        .single();

      if (error) {
        console.error('Error fetching restaurant:', error);
        return null;
      }

      return data;
    },
    enabled: !!restaurantSupabase && !!restaurantName,
  });

  const { data: customizationData } = useQuery({
    queryKey: ['restaurant_customization', restaurantName],
    queryFn: async () => {
      if (!restaurantSupabase || !restaurantName) return null;

      const { data, error } = await restaurantSupabase
        .from('restaurant_customization')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching restaurant customization:', error);
        return null;
      }

      return data;
    },
    enabled: !!restaurantSupabase && !!restaurantName,
  });

  const { data: popupSettings } = useQuery({
    queryKey: ['popup-settings', restaurantName],
    queryFn: async () => {
      if (!restaurantSupabase || !restaurantName) return null;
      
      const { data, error } = await restaurantSupabase
        .from('restaurant_customization')
        .select('popup_settings')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching popup settings:', error);
        return null;
      }

      return data?.popup_settings || null;
    },
    enabled: !!restaurantSupabase && !!restaurantName,
  });

  if (isMenuLoading || isRestaurantLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="w-full h-16" />
        <div className="container py-6">
          <Skeleton className="w-52 h-8 mb-4" />
          <div className="grid gap-4">
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (menuError || restaurantError) {
    return <div className="text-red-500">Error loading menu.</div>;
  }

  if (!menuData || !restaurantData) {
    return <div className="text-gray-500">Menu not found.</div>;
  }

  const { categories, items } = menuData;
  const layout = customizationData?.layout || 'categories';

  return (
    <div className="min-h-screen bg-background">
      <RestaurantHeader restaurant={restaurantData} />

      <div className="container py-6">
        {layout === 'categories' ? (
          <MenuCategories categories={categories} items={items} />
        ) : (
          <MenuItems categories={categories} items={items} />
        )}
      </div>
      
      {/* Popup Modal */}
      {popupSettings && (
        <PopupModal 
          settings={popupSettings} 
          restaurantName={restaurantData?.name || ''} 
        />
      )}
    </div>
  );
}
