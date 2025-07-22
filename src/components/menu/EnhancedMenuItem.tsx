import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Star } from 'lucide-react';

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

interface EnhancedMenuItemProps {
  item: MenuItem;
  layoutStyle: 'compact' | 'card-grid' | 'image-focus' | 'minimal' | 'magazine' | 'modern-card' | 'elegant-list' | 'photo-focus';
  customTheme?: MenuTheme;
  formatPrice: (price: number, currency: string) => string;
  getLocalizedText: (item: any, field: string) => string;
  getMenuItemImageUrl: (item: MenuItem) => string | null;
  categoryName?: string;
  isCompact?: boolean;
  index?: number;
  onClick?: (item: MenuItem, selectedSize?: MenuItemSize) => void;
}

const LazyImage = ({ src, alt, className, onLoad }: { 
  src: string; 
  alt: string; 
  className: string; 
  onLoad?: () => void; 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  return (
    <div ref={imgRef} className={`${className} bg-muted overflow-hidden flex items-center justify-center`}>
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover object-center ${loaded ? 'loaded' : 'blur-load'}`}
          onLoad={handleLoad}
          loading="lazy"
        />
      )}
    </div>
  );
};

export const EnhancedMenuItem = ({
  item,
  layoutStyle,
  customTheme,
  formatPrice,
  getLocalizedText,
  getMenuItemImageUrl,
  categoryName,
  isCompact = false,
  index = 0,
  onClick
}: EnhancedMenuItemProps) => {
  const itemImageUrl = getMenuItemImageUrl(item);
  
  const cardStyles = customTheme ? {
    backgroundColor: customTheme.cardBackground,
    borderColor: customTheme.borderColor,
    color: customTheme.textColor
  } : {};

  const itemNameStyles = customTheme ? {
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

  const handleClick = () => {
    onClick?.(item);
  };

  const hasSizes = item.sizes && item.sizes.length > 0;
  const displayPrice = hasSizes 
    ? Math.max(...item.sizes.map(size => size.price))
    : item.price;

  const renderItemContent = () => {
    switch (layoutStyle) {
      case 'compact':
        return (
          <Card 
            className="menu-card cursor-pointer hover:shadow-md transition-shadow"
            style={cardStyles}
            onClick={handleClick}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-1" style={itemNameStyles}>
                        {getLocalizedText(item, 'name')}
                      </h3>
                      {item.is_featured && (
                        <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" />
                      )}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="text-xs flex-shrink-0 font-medium ml-2"
                      style={{ 
                        backgroundColor: customTheme?.accentColor + '20',
                        color: priceStyles.color 
                      }}
                    >
                      {formatPrice(displayPrice, item.currency)}
                    </Badge>
                  </div>
                  {getLocalizedText(item, 'description') && (
                    <p className="text-xs mb-2 line-clamp-2 leading-relaxed" style={descriptionStyles}>
                      {getLocalizedText(item, 'description')}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.preparation_time && (
                      <div className="flex items-center gap-1 text-xs" style={mutedTextStyles}>
                        <Clock className="h-3 w-3" />
                        {item.preparation_time}min
                      </div>
                    )}
                  </div>
                </div>
                {itemImageUrl && (
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                    <LazyImage
                      src={itemImageUrl}
                      alt={getLocalizedText(item, 'name')}
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'card-grid':
        return (
          <Card 
            className="menu-card cursor-pointer hover:shadow-md transition-shadow"
            style={cardStyles}
            onClick={handleClick}
          >
            {itemImageUrl && (
              <div className="relative w-full h-32 overflow-hidden bg-muted flex items-center justify-center">
                <LazyImage
                  src={itemImageUrl}
                  alt={getLocalizedText(item, 'name')}
                  className="w-full h-full"
                />
                {item.is_featured && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-yellow-500/90 text-black text-xs font-medium">
                      Featured
                    </Badge>
                  </div>
                )}
              </div>
            )}
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm leading-tight" style={itemNameStyles}>
                  {getLocalizedText(item, 'name')}
                </h3>
                {item.is_featured && !itemImageUrl && (
                  <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" />
                )}
              </div>
              {getLocalizedText(item, 'description') && (
                <p className="text-xs mb-2 line-clamp-2 leading-relaxed" style={descriptionStyles}>
                  {getLocalizedText(item, 'description')}
                </p>
              )}
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  {item.preparation_time && (
                    <div className="flex items-center gap-1 text-xs" style={mutedTextStyles}>
                      <Clock className="h-3 w-3" />
                      {item.preparation_time}min
                    </div>
                  )}
                </div>
                <Badge 
                  variant="secondary" 
                  className="text-xs font-medium"
                  style={{ 
                    backgroundColor: customTheme?.accentColor + '20',
                    color: priceStyles.color 
                  }}
                >
                  {formatPrice(displayPrice, item.currency)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );

      case 'image-focus':
        return (
          <Card 
            className="menu-card cursor-pointer hover:shadow-md transition-shadow"
            style={cardStyles}
            onClick={handleClick}
          >
            {itemImageUrl && (
              <div className="relative w-full h-40 overflow-hidden bg-muted flex items-center justify-center">
                <LazyImage
                  src={itemImageUrl}
                  alt={getLocalizedText(item, 'name')}
                  className="w-full h-full"
                />
                {item.is_featured && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-yellow-500/90 text-black text-xs font-medium">
                      Featured
                    </Badge>
                  </div>
                )}
              </div>
            )}
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <h3 className="font-semibold text-base leading-tight line-clamp-1" style={itemNameStyles}>
                    {getLocalizedText(item, 'name')}
                  </h3>
                  {item.is_featured && !itemImageUrl && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                  )}
                </div>
                <Badge 
                  variant="secondary" 
                  className="text-sm flex-shrink-0 font-medium"
                  style={{ 
                    backgroundColor: customTheme?.accentColor + '20',
                    color: priceStyles.color 
                  }}
                >
                  {formatPrice(displayPrice, item.currency)}
                </Badge>
              </div>
              {getLocalizedText(item, 'description') && (
                <p className="text-sm mb-3 leading-relaxed" style={descriptionStyles}>
                  {getLocalizedText(item, 'description')}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                {item.preparation_time && (
                  <div className="flex items-center gap-1 text-xs" style={mutedTextStyles}>
                    <Clock className="h-3 w-3" />
                    {item.preparation_time}min
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'minimal':
        return (
          <div 
            className="border-b pb-3 mb-3 hover:bg-muted/20 transition-colors px-2 -mx-2 rounded cursor-pointer"
            onClick={handleClick}
          >
            <div className="flex items-center justify-between mb-1 gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-tight line-clamp-1" style={itemNameStyles}>
                  {getLocalizedText(item, 'name')}
                </h3>
                {item.is_featured && (
                  <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" />
                )}
              </div>
              <span className="text-sm font-medium flex-shrink-0" style={priceStyles}>
                {formatPrice(displayPrice, item.currency)}
              </span>
            </div>
            {getLocalizedText(item, 'description') && (
              <p className="text-xs mb-2 leading-relaxed" style={descriptionStyles}>
                {getLocalizedText(item, 'description')}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {item.preparation_time && (
                <div className="flex items-center gap-1 text-xs" style={mutedTextStyles}>
                  <Clock className="h-3 w-3" />
                  {item.preparation_time}min
                </div>
              )}
            </div>
          </div>
        );

      case 'magazine':
        return (
          <Card 
            className="menu-card cursor-pointer hover:shadow-md transition-shadow"
            style={cardStyles}
            onClick={handleClick}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h3 className="font-semibold text-base leading-tight line-clamp-1" style={itemNameStyles}>
                        {getLocalizedText(item, 'name')}
                      </h3>
                      {item.is_featured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                      )}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="text-sm font-medium flex-shrink-0"
                      style={{ 
                        backgroundColor: customTheme?.accentColor + '20',
                        color: priceStyles.color 
                      }}
                    >
                      {formatPrice(displayPrice, item.currency)}
                    </Badge>
                  </div>
                  {getLocalizedText(item, 'description') && (
                    <p className="text-sm mb-3 leading-relaxed" style={descriptionStyles}>
                      {getLocalizedText(item, 'description')}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    {item.preparation_time && (
                      <div className="flex items-center gap-1 text-xs" style={mutedTextStyles}>
                        <Clock className="h-3 w-3" />
                        {item.preparation_time}min
                      </div>
                    )}
                  </div>
                </div>
                {itemImageUrl && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                    <LazyImage
                      src={itemImageUrl}
                      alt={getLocalizedText(item, 'name')}
                      className="w-full h-full"
                    />
                    {item.is_featured && (
                      <div className="absolute -top-1 -right-1">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Star className="h-2 w-2 text-black fill-current" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'modern-card':
        return (
          <div 
            className={`group relative overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
              !item.is_available ? 'opacity-60' : ''
            }`}
            style={{
              backgroundColor: customTheme?.cardBackground || '#ffffff',
              borderColor: customTheme?.borderColor || '#e5e7eb',
              transform: index !== undefined ? `translateY(${index * 10}px)` : 'none',
            }}
            onClick={handleClick}
          >
            <div className="relative">
              <div className="w-full h-48 overflow-hidden bg-muted flex items-center justify-center">
                {itemImageUrl ? (
                  <LazyImage 
                    src={itemImageUrl} 
                    alt={getLocalizedText(item, 'name')}
                    className="w-full h-full"
                    onLoad={() => {}}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <span className="text-slate-400 text-sm">No Image</span>
                  </div>
                )}
              </div>
              <div className="absolute top-3 right-3">
                <div 
                  className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm"
                  style={{
                    backgroundColor: customTheme?.accentColor || '#3b82f6',
                    color: '#ffffff'
                  }}
                >
                  {formatPrice(displayPrice, item.currency)}
                </div>
              </div>
              {!item.is_available && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Unavailable</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 
                className="font-semibold text-base mb-2 line-clamp-1"
                style={{ color: customTheme?.itemNameColor || '#1f2937' }}
              >
                {getLocalizedText(item, 'name')}
              </h3>
              <p 
                className="text-sm mb-3 line-clamp-2"
                style={{ color: customTheme?.descriptionColor || '#6b7280' }}
              >
                {getLocalizedText(item, 'description') || 'No description available'}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  {item.preparation_time && (
                    <span 
                      className="flex items-center gap-1"
                      style={{ color: customTheme?.mutedTextColor || '#6b7280' }}
                    >
                      <Clock className="h-3 w-3" />
                      {item.preparation_time}min
                    </span>
                  )}
                </div>
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: customTheme?.accentColor || '#3b82f6' }}
                />
              </div>
            </div>
          </div>
        );

      case 'elegant-list':
        return (
          <div 
            className={`group flex items-center gap-4 p-4 rounded-lg border-l-4 hover:shadow-md transition-all duration-200 cursor-pointer ${
              !item.is_available ? 'opacity-60' : ''
            }`}
            style={{
              backgroundColor: customTheme?.cardBackground || '#ffffff',
              borderLeftColor: customTheme?.accentColor || '#3b82f6',
              borderColor: customTheme?.borderColor || '#e5e7eb'
            }}
            onClick={handleClick}
          >
            <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              {itemImageUrl ? (
                <LazyImage 
                  src={itemImageUrl} 
                  alt={getLocalizedText(item, 'name')}
                  className="w-full h-full"
                  onLoad={() => {}}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <span className="text-slate-400 text-xs">No Image</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-1">
                <h3 
                  className="font-medium text-base line-clamp-1"
                  style={{ color: customTheme?.itemNameColor || '#1f2937' }}
                >
                  {getLocalizedText(item, 'name')}
                </h3>
                <span 
                  className="text-base font-semibold ml-2 flex-shrink-0"
                  style={{ color: customTheme?.priceColor || '#3b82f6' }}
                >
                  {formatPrice(displayPrice, item.currency)}
                </span>
              </div>
              <p 
                className="text-sm mb-2 line-clamp-1"
                style={{ color: customTheme?.descriptionColor || '#6b7280' }}
              >
                {getLocalizedText(item, 'description') || 'No description available'}
              </p>
              <div className="flex items-center gap-3 text-xs">
                {item.preparation_time && (
                  <span 
                    className="flex items-center gap-1"
                    style={{ color: customTheme?.mutedTextColor || '#6b7280' }}
                  >
                    <Clock className="h-3 w-3" />
                    {item.preparation_time}min
                  </span>
                )}
                {!item.is_available && (
                  <span className="text-red-500 font-medium">Unavailable</span>
                )}
              </div>
            </div>
          </div>
        );

      case 'photo-focus':
        return (
          <div 
            className={`group relative overflow-hidden rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300 ${
              !item.is_available ? 'opacity-60' : ''
            }`}
            style={{
              backgroundColor: customTheme?.cardBackground || '#ffffff',
              borderColor: customTheme?.borderColor || '#e5e7eb',
            }}
            onClick={handleClick}
          >
            <div className="relative">
              <div className="w-full h-40 overflow-hidden bg-muted flex items-center justify-center">
                {itemImageUrl ? (
                  <LazyImage 
                    src={itemImageUrl} 
                    alt={getLocalizedText(item, 'name')}
                    className="w-full h-full"
                    onLoad={() => {}}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <span className="text-slate-400 text-sm">No Image</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
                <h3 className="font-semibold text-base mb-1 line-clamp-1">
                  {getLocalizedText(item, 'name')}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    {item.preparation_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.preparation_time}min
                      </span>
                    )}
                  </div>
                  <span className="text-base font-semibold">{formatPrice(displayPrice, item.currency)}</span>
                </div>
              </div>
              {!item.is_available && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Unavailable</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <p 
                className="text-sm line-clamp-2"
                style={{ color: customTheme?.descriptionColor || '#6b7280' }}
              >
                {getLocalizedText(item, 'description') || 'No description available'}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderItemContent();
};
