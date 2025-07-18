
import React, { useState } from 'react';
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
  sizes?: MenuItemSize[];
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
}

export const MenuItemDetailPopup = ({
  item,
  isOpen,
  onClose,
  formatPrice,
  getLocalizedText,
  getMenuItemImageUrl,
  categoryName,
  customTheme
}: MenuItemDetailPopupProps) => {
  const [selectedSize, setSelectedSize] = useState<MenuItemSize | undefined>(
    item?.sizes && item.sizes.length > 0 ? item.sizes[0] : undefined
  );

  if (!item) return null;

  const itemImageUrl = getMenuItemImageUrl(item);
  const hasSizes = item.sizes && item.sizes.length > 0;
  const displayPrice = selectedSize ? selectedSize.price : item.price;

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
          <div className="relative w-full h-48 overflow-hidden">
            <img
              src={itemImageUrl}
              alt={getLocalizedText(item, 'name')}
              className="w-full h-full object-cover"
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
                {formatPrice(displayPrice, item.currency)}
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
                    {formatPrice(displayPrice, item.currency)}
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

          {/* Size Selection */}
          {hasSizes && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-3" style={headingStyles}>
                Choose Size:
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {item.sizes!.map((size, index) => (
                  <Button
                    key={index}
                    variant={selectedSize?.name === size.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSize(size)}
                    className="h-auto py-3 px-4 flex justify-between items-center"
                    style={selectedSize?.name === size.name ? {
                      backgroundColor: customTheme?.accentColor || '#3b82f6',
                      borderColor: customTheme?.accentColor || '#3b82f6',
                      color: '#ffffff'
                    } : {
                      borderColor: customTheme?.borderColor,
                      backgroundColor: 'transparent',
                      color: customTheme?.textColor
                    }}
                  >
                    <span className="font-medium">{size.name}</span>
                    <span className="font-bold text-base">
                      {formatPrice(size.price, item.currency)}
                    </span>
                  </Button>
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

          {/* Final Price Display */}
          <div className="pt-3 border-t" style={{ borderColor: customTheme?.borderColor }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={mutedTextStyles}>
                {hasSizes && selectedSize ? `${selectedSize.name} - ` : ''}Total:
              </span>
              <span className="text-2xl font-bold" style={priceStyles}>
                {formatPrice(displayPrice, item.currency)}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
