
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Phone, Instagram, Globe } from 'lucide-react';

interface Theme {
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

interface ThemePreviewProps {
  theme: Theme;
}

const ThemePreview = ({ theme }: ThemePreviewProps) => {
  const themeStyles = {
    backgroundColor: theme.backgroundColor,
    color: theme.textColor
  };

  const cardStyles = {
    backgroundColor: theme.cardBackground,
    borderColor: theme.borderColor,
    color: theme.textColor
  };

  const headingStyles = {
    color: theme.headingColor || theme.textColor
  };

  const categoryNameStyles = {
    color: theme.categoryNameColor || theme.textColor
  };

  const itemNameStyles = {
    color: theme.itemNameColor || theme.textColor
  };

  const descriptionStyles = {
    color: theme.descriptionColor || theme.mutedTextColor
  };

  const priceStyles = {
    color: theme.priceColor || theme.accentColor
  };

  const mutedTextStyles = {
    color: theme.mutedTextColor
  };

  return (
    <div className="w-full max-w-sm mx-auto border rounded-lg overflow-hidden" style={cardStyles}>
      {/* Header */}
      <div 
        className="relative px-3 py-4 text-white"
        style={{ backgroundColor: theme.primaryColor }}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm"></div>
          <div className="flex gap-3">
            <Instagram className="h-4 w-4 opacity-80" />
            <Phone className="h-4 w-4 opacity-80" />
            <Globe className="h-4 w-4 opacity-80" />
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="text-lg font-bold mb-1 uppercase tracking-wide" style={headingStyles}>
            Sample Restaurant
          </h1>
          <p className="text-xs opacity-80 uppercase tracking-wide">
            DOWNTOWN LOCATION
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-3" style={themeStyles}>
        {/* Category Name */}
        <h3 className="text-base font-semibold mb-3" style={categoryNameStyles}>
          Popular Items
        </h3>

        {/* Menu Items */}
        <div className="space-y-3">
          {/* Item 1 */}
          <Card className="p-3 border" style={cardStyles}>
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1 gap-2">
                  <h3 className="font-semibold text-sm leading-tight" style={itemNameStyles}>
                    Grilled Salmon
                  </h3>
                  <Badge 
                    variant="secondary" 
                    className="text-xs flex-shrink-0"
                    style={{ 
                      backgroundColor: theme.accentColor + '20',
                      color: priceStyles.color 
                    }}
                  >
                    €18.50
                  </Badge>
                </div>
                <p className="text-xs mb-2 line-clamp-2" style={descriptionStyles}>
                  Fresh Atlantic salmon grilled to perfection with herbs and lemon
                </p>
                <div className="flex items-center gap-1 text-xs" style={mutedTextStyles}>
                  <Clock className="h-3 w-3" />
                  15min
                </div>
              </div>
              <div className="w-14 h-14 rounded-lg bg-gray-200 flex-shrink-0"></div>
            </div>
          </Card>

          {/* Item 2 */}
          <Card className="p-3 border" style={cardStyles}>
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1 gap-2">
                  <h3 className="font-semibold text-sm leading-tight" style={itemNameStyles}>
                    Margherita Pizza
                  </h3>
                  <Badge 
                    variant="secondary" 
                    className="text-xs flex-shrink-0"
                    style={{ 
                      backgroundColor: theme.accentColor + '20',
                      color: priceStyles.color 
                    }}
                  >
                    €12.00
                  </Badge>
                </div>
                <p className="text-xs mb-2 line-clamp-2" style={descriptionStyles}>
                  Classic pizza with fresh mozzarella, tomatoes and basil
                </p>
                <div className="flex items-center gap-1 text-xs" style={mutedTextStyles}>
                  <Clock className="h-3 w-3" />
                  20min
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t text-center" style={{ borderColor: theme.borderColor }}>
          <div className="flex justify-center gap-4 text-xs" style={mutedTextStyles}>
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              +355 69 123 4567
            </div>
            <div className="flex items-center gap-1">
              <Instagram className="h-3 w-3" />
              @restaurant
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemePreview;
