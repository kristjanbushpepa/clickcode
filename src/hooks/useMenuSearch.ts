
import { useMemo } from 'react';

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

export const useMenuSearch = (
  menuItems: MenuItem[],
  searchTerm: string,
  currentLanguage: string,
  categories: Category[]
) => {
  return useMemo(() => {
    if (!searchTerm.trim()) return menuItems;
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    return menuItems.filter(item => {
      // Get localized text for current language
      const itemName = (currentLanguage === 'sq' && item.name_sq) ? item.name_sq : item.name;
      const itemDescription = (currentLanguage === 'sq' && item.description_sq) ? item.description_sq : item.description;
      
      // Search in name
      if (itemName?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search in description
      if (itemDescription?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search in category name
      const category = categories.find(cat => cat.id === item.category_id);
      if (category) {
        const categoryName = (currentLanguage === 'sq' && category.name_sq) ? category.name_sq : category.name;
        if (categoryName?.toLowerCase().includes(searchLower)) {
          return true;
        }
      }
      
      return false;
    });
  }, [menuItems, searchTerm, currentLanguage, categories]);
};
