
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={dialogStyles}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2" style={titleStyles}>
            {getLocalizedText(item, 'name')}
            {item.is_featured && (
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Image */}
          {itemImageUrl && (
            <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden">
              <img 
                src={itemImageUrl} 
                alt={getLocalizedText(item, 'name')}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Price and Basic Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className="text-lg font-semibold px-3 py-1"
                style={priceStyles}
              >
                {formatPrice(item.price, item.currency)}
              </Badge>
              {item.is_featured && (
                <Badge className="bg-yellow-500/90 text-black text-sm font-medium">
                  Featured
                </Badge>
              )}
            </div>
            
            {item.preparation_time && (
              <div className="flex items-center gap-1 text-sm" style={descriptionStyles}>
                <Clock className="h-4 w-4" />
                {item.preparation_time} min
              </div>
            )}
          </div>

          {/* Category */}
          {categoryName && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" style={descriptionStyles} />
              <Badge variant="outline" className="text-sm">
                {categoryName}
              </Badge>
            </div>
          )}

          {/* Description */}
          {getLocalizedText(item, 'description') && (
            <div>
              <h4 className="font-medium mb-2" style={titleStyles}>Description</h4>
              <p className="leading-relaxed" style={descriptionStyles}>
                {getLocalizedText(item, 'description')}
              </p>
            </div>
          )}

          {/* Allergens */}
          {item.allergens && item.allergens.length > 0 && (
            <div>
              <h4 className="font-medium mb-2" style={titleStyles}>Allergens</h4>
              <div className="flex flex-wrap gap-2">
                {item.allergens.map((allergen, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    ⚠️ {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Item Status */}
          <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: customTheme?.borderColor }}>
            <Badge 
              variant={item.is_available ? "default" : "secondary"}
              className="text-xs"
            >
              {item.is_available ? "Available" : "Currently Unavailable"}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemPopup;
