import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Restaurant } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface Category {
  id: string;
  name: string;
  name_sq?: string;
  name_it?: string;
  name_de?: string;
  name_fr?: string;
  name_zh?: string;
  description?: string;
  description_sq?: string;
  description_it?: string;
  description_de?: string;
  description_fr?: string;
  description_zh?: string;
  display_order: number;
  is_active: boolean;
  image_path?: string;
}

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  name_sq?: string;
  name_it?: string;
  name_de?: string;
  name_fr?: string;
  name_zh?: string;
  description?: string;
  description_sq?: string;
  description_it?: string;
  description_de?: string;
  description_fr?: string;
  description_zh?: string;
  price: number;
  currency: string;
  image_path?: string;
  is_available: boolean;
  is_featured: boolean;
  allergens: string[];
  preparation_time?: number;
  display_order: number;
}

export default function EnhancedMenu() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentLanguage } = useLanguage();
  const [restaurantSupabase, setRestaurantSupabase] = useState(getRestaurantSupabase());

  useEffect(() => {
    setRestaurantSupabase(getRestaurantSupabase());
  }, []);

  const { isLoading: restaurantLoading, error: restaurantError } = useQuery({
    queryKey: ['restaurant'],
    queryFn: async () => {
      if (!restaurantSupabase) return null;
      const { data, error } = await restaurantSupabase
        .from('restaurants')
        .select('*')
        .single();

      if (error) {
        console.error('Restaurant fetch error:', error);
        throw error;
      }
      setRestaurant(data);
      return data;
    },
    retry: false,
  });

  const { isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!restaurantSupabase) return null;
      const { data, error } = await restaurantSupabase
        .from('categories')
        .select('*')
        .order('display_order');

      if (error) {
        console.error('Categories fetch error:', error);
        throw error;
      }
      setCategories(data || []);
      return data || [];
    },
    retry: false,
  });

  const { isLoading: menuItemsLoading, error: menuItemsError } = useQuery({
    queryKey: ['menu_items'],
    queryFn: async () => {
      if (!restaurantSupabase) return null;
      const { data, error } = await restaurantSupabase
        .from('menu_items')
        .select('*')
        .order('display_order');

      if (error) {
        console.error('Menu items fetch error:', error);
        throw error;
      }
      setMenuItems(data || []);
      return data || [];
    },
    retry: false,
  });

  const getImageUrl = (imagePath: string | null): string | null => {
    if (!imagePath || !restaurantSupabase) return null;
    const { data } = restaurantSupabase.storage
      .from('restaurant-images')
      .getPublicUrl(imagePath);
    return data.publicUrl;
  };

  if (restaurantLoading || categoriesLoading || menuItemsLoading) {
    return <div className="flex justify-center p-8">Duke ngarkuar...</div>;
  }

  if (restaurantError || categoriesError || menuItemsError) {
    return (
      <div className="flex justify-center p-8">
        Gabim: {restaurantError?.message || categoriesError?.message || menuItemsError?.message}
      </div>
    );
  }

  const getLocalizedText = (item: any, field: string, language: string): string => {
    const localizedField = `${field}_${language}`;
    return item[localizedField] || item[field] || '';
  };

  const filteredCategories = categories.filter((category) =>
    getLocalizedText(category, 'name', currentLanguage).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMenuItems = menuItems.filter((item) =>
    (selectedCategory ? item.category_id === selectedCategory : true)
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{restaurant?.name}</h2>
        <p className="text-muted-foreground mb-6">{restaurant?.description}</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Kërko kategoritë..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => {
          const categoryImageUrl = getImageUrl(category.image_path);
          
          return (
            <Card
              key={category.id}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              onClick={() => setSelectedCategory(category.id)}
            >
              {categoryImageUrl ? (
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src={categoryImageUrl}
                    alt={getLocalizedText(category, 'name', currentLanguage)}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 w-full bg-card"></div>
              )}
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">
                  {getLocalizedText(category, 'name', currentLanguage)}
                </h3>
                {getLocalizedText(category, 'description', currentLanguage) && (
                  <p className="text-sm text-muted-foreground">
                    {getLocalizedText(category, 'description', currentLanguage)}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderMenuItems = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {selectedCategory
            ? getLocalizedText(
                categories.find((cat) => cat.id === selectedCategory) || {},
                'name',
                currentLanguage
              )
            : 'Të gjitha Artikujt'}
        </h2>
        <p className="text-muted-foreground mb-6">
          {selectedCategory
            ? getLocalizedText(
                categories.find((cat) => cat.id === selectedCategory) || {},
                'description',
                currentLanguage
              )
            : 'Shfleto të gjitha artikujt e restorantit'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMenuItems.map((item) => {
          const itemImageUrl = getImageUrl(item.image_path);
          return (
            <Card key={item.id}>
              {itemImageUrl ? (
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src={itemImageUrl}
                    alt={getLocalizedText(item, 'name', currentLanguage)}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 w-full bg-muted"></div>
              )}
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">
                  {getLocalizedText(item, 'name', currentLanguage)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getLocalizedText(item, 'description', currentLanguage)}
                </p>
                <p className="text-xl font-bold">{item.price} ALL</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-12">
      {selectedCategory ? (
        <>
          <button onClick={() => setSelectedCategory(null)} className="mb-4 text-sm text-blue-500">
            Kthehu te Kategoritë
          </button>
          {renderMenuItems()}
        </>
      ) : (
        renderCategories()
      )}
    </div>
  );
}
