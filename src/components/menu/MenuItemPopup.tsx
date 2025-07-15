
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuItemPopupProps {
  item: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    category?: string;
    ingredients?: string[];
    allergens?: string[];
    rating?: number;
    prep_time?: number;
    calories?: number;
    is_vegetarian?: boolean;
    is_vegan?: boolean;
    is_gluten_free?: boolean;
    is_spicy?: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  currencySymbol: string;
  exchangeRate: number;
}

const MenuItemPopup: React.FC<MenuItemPopupProps> = ({
  item,
  isOpen,
  onClose,
  currency,
  currencySymbol,
  exchangeRate
}) => {
  const convertPrice = (price: number) => {
    const convertedPrice = price * exchangeRate;
    return currency === 'ALL' ? Math.round(convertedPrice) : convertedPrice.toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{item.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Image */}
          {item.image_url && (
            <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden">
              <img 
                src={item.image_url} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Price and Basic Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg font-semibold">
                {currencySymbol}{convertPrice(item.price)}
              </Badge>
              {item.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{item.rating}</span>
                </div>
              )}
            </div>
            
            {item.prep_time && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {item.prep_time} min
              </div>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          )}

          {/* Ingredients */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Ingredients</h4>
              <div className="flex flex-wrap gap-2">
                {item.ingredients.map((ingredient, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Dietary Information */}
          <div className="flex flex-wrap gap-2">
            {item.is_vegetarian && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                🌿 Vegetarian
              </Badge>
            )}
            {item.is_vegan && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                🌱 Vegan
              </Badge>
            )}
            {item.is_gluten_free && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                🌾 Gluten Free
              </Badge>
            )}
            {item.is_spicy && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                🌶️ Spicy
              </Badge>
            )}
          </div>

          {/* Allergens */}
          {item.allergens && item.allergens.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Allergens</h4>
              <div className="flex flex-wrap gap-2">
                {item.allergens.map((allergen, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    ⚠️ {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Calories */}
          {item.calories && (
            <div className="text-sm text-muted-foreground">
              <strong>Calories:</strong> {item.calories} cal
            </div>
          )}

          {/* Category */}
          {item.category && (
            <div className="text-sm text-muted-foreground">
              <strong>Category:</strong> {item.category}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemPopup;
