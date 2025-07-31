
import { useQuery } from '@tanstack/react-query';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';

export const useTranslationData = () => {
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories_translation'],
    queryFn: async () => {
      console.log('Fetching categories for translation...');
      try {
        const restaurantSupabase = getRestaurantSupabase();
        const { data, error } = await restaurantSupabase
          .from('categories')
          .select('*')
          .order('display_order');
        
        if (error) {
          console.error('Categories fetch error:', error);
          throw error;
        }
        console.log('Fetched categories:', data);
        return data || [];
      } catch (error) {
        console.error('Error in categories query function:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000
  });

  const { data: menuItems = [], isLoading: itemsLoading, error: itemsError } = useQuery({
    queryKey: ['menu_items_translation'],
    queryFn: async () => {
      console.log('Fetching menu items for translation...');
      try {
        const restaurantSupabase = getRestaurantSupabase();
        const { data, error } = await restaurantSupabase
          .from('menu_items')
          .select('*')
          .order('display_order');
        
        if (error) {
          console.error('Menu items fetch error:', error);
          throw error;
        }
        console.log('Fetched menu items:', data);
        return data || [];
      } catch (error) {
        console.error('Error in menu items query function:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000
  });

  return {
    categories,
    menuItems,
    isLoading: categoriesLoading || itemsLoading,
    error: categoriesError || itemsError
  };
};
