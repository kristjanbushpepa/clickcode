
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Star, X } from 'lucide-react';

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

interface MenuItemSize {
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  name_sq?: string;
  name_en?: string;
  name_it?: string;
  name_de?: string;
  name_fr?: string;
  name_zh?: string;
  description?: string;
  description_sq?: string;
  description_en?: string;
  description_it?: string;
  description_de?: string;
  description_fr?: string;
  description_zh?: string;
  price: number;
  currency: string;
  image_url?: string;
  image_path?: string;
  is_available: boolean;
  is_featured: boolean;
  allergens: string[];
  preparation_time?: number;
  display_order: number;
  sizes?: MenuItemSize[];
  sizes_sq?: MenuItemSize[];
  sizes_en?: MenuItemSize[];
  sizes_it?: MenuItemSize[];
  sizes_de?: MenuItemSize[];
  sizes_fr?: MenuItemSize[];
  sizes_zh?: MenuItemSize[];
}

interface MenuItemDetailPopupProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  formatPrice: (price: number, currency: string) => string;
  getLocalizedText: (item: any, field: string) => string;
  getMenuItemImageUrl: (item: MenuItem) => string | null;
  categoryName?: string;
  customTheme?: MenuTheme;
  currentLanguage?: string;
}

export const MenuItemDetailPopup = ({
  item,
  isOpen,
  onClose,
  formatPrice,
  getLocalizedText,
  getMenuItemImageUrl,
  categoryName,
  customTheme,
  currentLanguage = 'sq'
}: MenuItemDetailPopupProps) => {
  if (!item) return null;

  const itemImageUrl = getMenuItemImageUrl(item);
  
  // Get localized sizes based on current language
  const getLocalizedSizes = (): MenuItemSize[] => {
    const sizesField = `sizes_${currentLanguage}` as keyof MenuItem;
    const localizedSizes = item[sizesField] as MenuItemSize[];
    
    // If localized sizes exist, use them; otherwise fall back to default sizes
    if (localizedSizes && localizedSizes.length > 0) {
      return localizedSizes;
    }
    
    return item.sizes || [];
  };

  const localizedSizes = getLocalizedSizes();
  const hasSizes = localizedSizes && localizedSizes.length > 0;

  const contentStyles = customTheme ? {
    backgroundColor: customTheme.cardBackground,
    color: customTheme.textColor
  } : {};

  const headingStyles = customTheme ? {
    color: customTheme.itemNameColor || customTheme.textColor
  } : {};

  const descriptionStyles = customTheme ? {
    color: customTheme.descriptionColor || customTheme.mutedTextColor
  } : {};

  const priceStyles = customTheme ? {
    color: customTheme.priceColor || customTheme.accentColor
  } : {};

  const mutedTextStyles = customTheme ? {
    color: customTheme.mutedTextColor
  } : {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-sm mx-auto max-h-[90vh] overflow-y-auto p-0"
        style={contentStyles}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 h-8 w-8 p-0 rounded-full bg-black/50 hover:bg-black/70 text-white"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Image */}
        {itemImageUrl && (
          <div className="relative w-full h-48 overflow-hidden bg-muted flex items-center justify-center">
            <img
              src={itemImageUrl}
              alt={getLocalizedText(item, 'name')}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            
            {/* Featured badge */}
            {item.is_featured && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-yellow-500/90 text-black text-xs font-medium">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Featured
                </Badge>
              </div>
            )}

            {/* Price badge */}
            <div className="absolute top-3 right-12">
              <Badge 
                className="text-sm font-semibold backdrop-blur-sm bg-white/90 text-gray-900"
              >
                {formatPrice(item.price, item.currency)}
              </Badge>
            </div>
          </div>
        )}

        <div className="p-4">
          {/* Header */}
          <DialogHeader className="space-y-3 mb-4">
            <div className="flex items-start justify-between gap-2">
              <DialogTitle 
                className="text-lg font-bold text-left leading-tight"
                style={headingStyles}
              >
                {getLocalizedText(item, 'name')}
              </DialogTitle>
              
              {!itemImageUrl && (
                <div className="flex items-center gap-2">
                  {item.is_featured && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                  <Badge 
                    variant="secondary" 
                    className="text-sm font-medium"
                    style={{ 
                      backgroundColor: customTheme?.accentColor + '20',
                      color: priceStyles.color 
                    }}
                  >
                    {formatPrice(item.price, item.currency)}
                  </Badge>
                </div>
              )}
            </div>

            {/* Category and timing info */}
            <div className="flex items-center gap-3 flex-wrap">
              {categoryName && (
                <Badge 
                  variant="outline" 
                  className="text-xs px-2 py-1"
                  style={{
                    borderColor: customTheme?.borderColor,
                    color: customTheme?.mutedTextColor
                  }}
                >
                  {categoryName}
                </Badge>
              )}
              {item.preparation_time && (
                <div className="flex items-center gap-1 text-xs" style={mutedTextStyles}>
                  <Clock className="h-3 w-3" />
                  {item.preparation_time} min
                </div>
              )}
              {!item.is_available && (
                <Badge variant="destructive" className="text-xs">
                  Unavailable
                </Badge>
              )}
            </div>
          </DialogHeader>

          {/* Description */}
          {getLocalizedText(item, 'description') && (
            <div className="mb-4">
              <p className="text-sm leading-relaxed" style={descriptionStyles}>
                {getLocalizedText(item, 'description')}
              </p>
            </div>
          )}

          {/* Available Sizes Display */}
          {hasSizes && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-3" style={headingStyles}>
                Available Sizes:
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {localizedSizes.map((size, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 px-3 border rounded-lg"
                    style={{
                      borderColor: customTheme?.borderColor || '#e5e7eb',
                      backgroundColor: customTheme?.cardBackground || 'transparent'
                    }}
                  >
                    <span className="font-medium" style={{ color: customTheme?.textColor }}>
                      {size.name}
                    </span>
                    <span className="font-bold text-base" style={priceStyles}>
                      {formatPrice(size.price, item.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Allergens */}
          {item.allergens && item.allergens.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2" style={headingStyles}>
                Allergens:
              </h4>
              <div className="flex flex-wrap gap-1">
                {item.allergens.map((allergen, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs"
                    style={{
                      backgroundColor: customTheme?.mutedTextColor + '20',
                      color: customTheme?.mutedTextColor
                    }}
                  >
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Base Price Display */}
          <div className="pt-3 border-t" style={{ borderColor: customTheme?.borderColor }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={mutedTextStyles}>
                Base Price:
              </span>
              <span className="text-2xl font-bold" style={priceStyles}>
                {formatPrice(item.price, item.currency)}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
