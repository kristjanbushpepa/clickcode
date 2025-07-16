
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, Tag } from 'lucide-react';

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

interface MenuTheme {
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardBackground: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  headingColor?: string;
  categoryNameColor?: string;
  itemNameColor?: string;
  descriptionColor?: string;
  priceColor?: string;
}

interface MenuItemPopupProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  formatPrice: (price: number, currency: string) => string;
  getLocalizedText: (item: any, field: string) => string;
  getMenuItemImageUrl: (item: MenuItem) => string | null;
  categoryName?: string;
  customTheme?: MenuTheme | null;
}

const MenuItemPopup: React.FC<MenuItemPopupProps> = ({
  item,
  isOpen,
  onClose,
  formatPrice,
  getLocalizedText,
  getMenuItemImageUrl,
  categoryName,
  customTheme
}) => {
  const itemImageUrl = getMenuItemImageUrl(item);
  
  const dialogStyles = customTheme ? {
    backgroundColor: customTheme.cardBackground,
    color: customTheme.textColor,
    borderColor: customTheme.borderColor
  } : {};

  const titleStyles = customTheme ? {
    color: customTheme.headingColor || customTheme.textColor
  } : {};

  const descriptionStyles = customTheme ? {
    color: customTheme.descriptionColor || customTheme.mutedTextColor
  } : {};

  const priceStyles = customTheme ? {
    backgroundColor: customTheme.accentColor + '20',
    color: customTheme.priceColor || customTheme.accentColor
  } : {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto p-4 m-4" style={dialogStyles}>
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-bold flex items-center gap-2" style={titleStyles}>
            {getLocalizedText(item, 'name')}
            {item.is_featured && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {/* Image */}
          {itemImageUrl && (
            <div className="w-full h-48 rounded-lg overflow-hidden">
              <img 
                src={itemImageUrl} 
                alt={getLocalizedText(item, 'name')}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Price and Time Row */}
          <div className="flex items-center justify-between">
            <Badge 
              variant="secondary" 
              className="text-base font-semibold px-2 py-1"
              style={priceStyles}
            >
              {formatPrice(item.price, item.currency)}
            </Badge>
            
            <div className="flex items-center gap-3">
              {item.preparation_time && (
                <div className="flex items-center gap-1 text-sm" style={descriptionStyles}>
                  <Clock className="h-3 w-3" />
                  {item.preparation_time}min
                </div>
              )}
              {item.is_featured && (
                <Badge className="bg-yellow-500/90 text-black text-xs px-2">
                  Featured
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {getLocalizedText(item, 'description') && (
            <p className="text-sm leading-relaxed" style={descriptionStyles}>
              {getLocalizedText(item, 'description')}
            </p>
          )}

          {/* Allergens */}
          {item.allergens && item.allergens.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-1" style={titleStyles}>Allergens</div>
              <div className="flex flex-wrap gap-1">
                {item.allergens.map((allergen, index) => (
                  <Badge key={index} variant="destructive" className="text-xs px-1 py-0">
                    ⚠️ {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="pt-1 border-t" style={{ borderColor: customTheme?.borderColor }}>
            <Badge 
              variant={item.is_available ? "default" : "secondary"}
              className="text-xs"
            >
              {item.is_available ? "Available" : "Unavailable"}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemPopup;
