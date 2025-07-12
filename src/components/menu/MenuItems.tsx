
import React from 'react';
import { Category, MenuItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MenuItemsProps {
  categories: Category[];
  items: MenuItem[];
}

const MenuItems: React.FC<MenuItemsProps> = ({ categories, items }) => {
  const availableItems = items.filter(item => item.is_available);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">All Menu Items</h2>
      
      <div className="grid gap-4">
        {availableItems.map((item) => {
          const category = categories.find(cat => cat.id === item.category_id);
          
          return (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    {category && (
                      <p className="text-sm text-muted-foreground">{category.name}</p>
                    )}
                  </div>
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
          );
        })}
      </div>
    </div>
  );
};

export default MenuItems;
