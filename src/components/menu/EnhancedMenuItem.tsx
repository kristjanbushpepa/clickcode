import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface EnhancedMenuItemProps {
  item: MenuItem;
  layoutStyle: 'compact' | 'card-grid' | 'image-focus' | 'minimal' | 'magazine';
  customTheme?: MenuTheme;
  formatPrice: (price: number, currency: string) => string;
  getLocalizedText: (item: any, field: string) => string;
  getMenuItemImageUrl: (item: MenuItem) => string | null;
  categoryName?: string;
  isCompact?: boolean;
  index?: number;
  onClick?: (item: MenuItem) => void;
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
    <div ref={imgRef} className={`${className} bg-muted overflow-hidden`}>
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`menu-image ${loaded ? 'loaded' : 'blur-load'}`}
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

  const renderItemContent = () => {
    switch (layoutStyle) {
      case 'compact':
        return (
          <Card 
            className="menu-card cursor-pointer hover:shadow-md transition-shadow"
            style={cardStyles}
            onClick={() => onClick?.(item)}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-1" style={itemNameStyles}>
                        {getLocalizedText(item, 'name')}
                      </h3>
                      {item.is_featured && (
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="text-xs flex-shrink-0 font-medium"
                      style={{ 
                        backgroundColor: customTheme?.accentColor + '20',
                        color: priceStyles.color 
                      }}
                    >
                      {formatPrice(item.price, item.currency)}
                    </Badge>
                  </div>
                  {getLocalizedText(item, 'description') && (
                    <p className="text-xs mb-2 line-clamp-2 leading-relaxed" style={descriptionStyles}>
                      {getLocalizedText(item, 'description')}
                    </p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    {!isCompact && categoryName && (
                      <Badge variant="outline" className="text-xs">
                        {categoryName}
                      </Badge>
                    )}
                    {item.preparation_time && (
                      <div className="flex items-center gap-1 text-xs" style={mutedTextStyles}>
                        <Clock className="h-3 w-3" />
                        {item.preparation_time}min
                      </div>
                    )}
                  </div>
                </div>
                {itemImageUrl && (
                  <LazyImage
                    src={itemImageUrl}
                    alt={getLocalizedText(item, 'name')}
                    className="w-14 h-14 rounded-lg flex-shrink-0"
                  />
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
            onClick={() => onClick?.(item)}
          >
            {itemImageUrl && (
              <div className="relative">
                <LazyImage
                  src={itemImageUrl}
                  alt={getLocalizedText(item, 'name')}
                  className="w-full h-32"
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
                <h3 className="font-semibold text-sm leading-tight line-clamp-1" style={itemNameStyles}>
                  {getLocalizedText(item, 'name')}
                </h3>
                {item.is_featured && !itemImageUrl && (
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                )}
              </div>
              {getLocalizedText(item, 'description') && (
                <p className="text-xs mb-2 line-clamp-2 leading-relaxed" style={descriptionStyles}>
                  {getLocalizedText(item, 'description')}
                </p>
              )}
              <div className="flex items-center justify-between">
                <Badge 
                  variant="secondary" 
                  className="text-xs font-medium"
                  style={{ 
                    backgroundColor: customTheme?.accentColor + '20',
                    color: priceStyles.color 
                  }}
                >
                  {formatPrice(item.price, item.currency)}
                </Badge>
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

      case 'image-focus':
        return (
          <Card 
            className="menu-card cursor-pointer hover:shadow-md transition-shadow"
            style={cardStyles}
            onClick={() => onClick?.(item)}
          >
            {itemImageUrl && (
              <div className="relative">
                <LazyImage
                  src={itemImageUrl}
                  alt={getLocalizedText(item, 'name')}
                  className="w-full h-40"
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
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base leading-tight line-clamp-1" style={itemNameStyles}>
                    {getLocalizedText(item, 'name')}
                  </h3>
                  {item.is_featured && !itemImageUrl && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
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
                  {formatPrice(item.price, item.currency)}
                </Badge>
              </div>
              {getLocalizedText(item, 'description') && (
                <p className="text-sm mb-3 leading-relaxed" style={descriptionStyles}>
                  {getLocalizedText(item, 'description')}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                {!isCompact && categoryName && (
                  <Badge variant="outline" className="text-xs">
                    {categoryName}
                  </Badge>
                )}
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
            onClick={() => onClick?.(item)}
          >
            <div className="flex items-start justify-between mb-1 gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm leading-tight" style={itemNameStyles}>
                  {getLocalizedText(item, 'name')}
                </h3>
                {item.is_featured && (
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                )}
              </div>
              <span className="text-sm font-medium flex-shrink-0" style={priceStyles}>
                {formatPrice(item.price, item.currency)}
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
              {!isCompact && categoryName && (
                <Badge variant="outline" className="text-xs">
                  {categoryName}
                </Badge>
              )}
            </div>
          </div>
        );

      case 'magazine':
        return (
          <Card 
            className="menu-card cursor-pointer hover:shadow-md transition-shadow"
            style={cardStyles}
            onClick={() => onClick?.(item)}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-base leading-tight" style={itemNameStyles}>
                      {getLocalizedText(item, 'name')}
                    </h3>
                    {item.is_featured && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  {getLocalizedText(item, 'description') && (
                    <p className="text-sm mb-3 leading-relaxed" style={descriptionStyles}>
                      {getLocalizedText(item, 'description')}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.preparation_time && (
                        <div className="flex items-center gap-1 text-xs" style={mutedTextStyles}>
                          <Clock className="h-3 w-3" />
                          {item.preparation_time}min
                        </div>
                      )}
                      {!isCompact && categoryName && (
                        <Badge variant="outline" className="text-xs">
                          {categoryName}
                        </Badge>
                      )}
                    </div>
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
                </div>
                {itemImageUrl && (
                  <div className="relative">
                    <LazyImage
                      src={itemImageUrl}
                      alt={getLocalizedText(item, 'name')}
                      className="w-20 h-20 rounded-lg flex-shrink-0"
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

      default:
        return null;
    }
  };

  return renderItemContent();
};