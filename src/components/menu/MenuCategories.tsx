
import React from 'react';
import { Category, MenuItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MenuCategoriesProps {
  categories: Category[];
  items: MenuItem[];
}

const MenuCategories: React.FC<MenuCategoriesProps> = ({ categories, items }) => {
  const getItemsByCategory = (categoryId: string) => {
    return items.filter(item => item.category_id === categoryId && item.is_available);
  };

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryItems = getItemsByCategory(category.id);
        
        if (categoryItems.length === 0) return null;
        
        return (
          <div key={category.id}>
            <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
            {category.description && (
              <p className="text-muted-foreground mb-6">{category.description}</p>
            )}
            
            <div className="grid gap-4">
              {categoryItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <span className="text-lg font-semibold text-primary">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  </CardHeader>
                  {item.description && (
                    <CardContent>
                      <p className="text-muted-foreground">{item.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MenuCategories;
