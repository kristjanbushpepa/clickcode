import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Phone, Instagram, Globe, ChevronDown } from 'lucide-react';

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
  languageSwitchBackground?: string;
  languageSwitchBorder?: string;
  languageSwitchText?: string;
  currencySwitchBackground?: string;
  currencySwitchBorder?: string;
  currencySwitchText?: string;
  badgeBackgroundColor?: string;
  badgeTextColor?: string;
  tabSwitcherBackground?: string;
  tabSwitcherBorder?: string;
  tabSwitcherText?: string;
  tabSwitcherActiveBackground?: string;
  tabSwitcherActiveText?: string;
  searchBarBackground?: string;
  searchBarBorder?: string;
  searchBarText?: string;
  searchBarPlaceholder?: string;
}

interface ThemePreviewProps {
  theme: Theme;
  layoutStyle?: 'compact' | 'card-grid' | 'image-focus' | 'minimal' | 'magazine' | 'modern-card' | 'elegant-list' | 'photo-focus';
}

const ThemePreview = ({ theme, layoutStyle = 'compact' }: ThemePreviewProps) => {
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

  const languageSwitchStyles = {
    backgroundColor: theme.languageSwitchBackground || theme.primaryColor,
    borderColor: theme.languageSwitchBorder || theme.borderColor,
    color: theme.languageSwitchText || '#ffffff'
  };

  const currencySwitchStyles = {
    backgroundColor: theme.currencySwitchBackground || theme.primaryColor,
    borderColor: theme.currencySwitchBorder || theme.borderColor,
    color: theme.currencySwitchText || '#ffffff'
  };

  const badgeStyles = {
    backgroundColor: theme.badgeBackgroundColor || theme.accentColor + '20',
    color: theme.badgeTextColor || theme.accentColor
  };

  const tabSwitcherStyles = {
    backgroundColor: theme.tabSwitcherBackground || theme.cardBackground,
    border: `1px solid ${theme.tabSwitcherBorder || theme.borderColor}`,
    borderRadius: '0.5rem',
    padding: '0.25rem',
    display: 'flex',
    gap: '0.25rem'
  };

  const tabStyles = {
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: theme.tabSwitcherText || theme.mutedTextColor,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const activeTabStyles = {
    backgroundColor: theme.tabSwitcherActiveBackground || theme.primaryColor,
    color: theme.tabSwitcherActiveText || '#ffffff'
  };

  const searchBarStyles = {
    backgroundColor: theme.searchBarBackground || theme.cardBackground,
    border: `1px solid ${theme.searchBarBorder || theme.borderColor}`,
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.75rem',
    color: theme.searchBarText || theme.textColor,
    width: '100%'
  };

  const renderLayoutStyle = () => {
    switch (layoutStyle) {
      case 'compact':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 border rounded" style={cardStyles}>
              <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-medium text-sm" style={itemNameStyles}>Grilled Salmon</h4>
                  <Badge variant="secondary" className="text-xs flex-shrink-0" style={badgeStyles}>
                    €18.50
                  </Badge>
                </div>
                <p className="text-xs line-clamp-1" style={descriptionStyles}>Fresh Atlantic salmon</p>
              </div>
            </div>
          </div>
        );

      case 'card-grid':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Card className="p-2" style={cardStyles}>
              <div className="w-full h-16 bg-gray-200 rounded mb-2"></div>
              <h4 className="font-medium text-xs mb-1" style={itemNameStyles}>Grilled Salmon</h4>
              <p className="text-xs mb-1 line-clamp-1" style={descriptionStyles}>Fresh Atlantic salmon</p>
              <Badge variant="secondary" className="text-xs" style={badgeStyles}>
                €18.50
              </Badge>
            </Card>
            <Card className="p-2" style={cardStyles}>
              <div className="w-full h-16 bg-gray-200 rounded mb-2"></div>
              <h4 className="font-medium text-xs mb-1" style={itemNameStyles}>Margherita Pizza</h4>
              <p className="text-xs mb-1 line-clamp-1" style={descriptionStyles}>Classic pizza</p>
              <Badge variant="secondary" className="text-xs" style={badgeStyles}>
                €12.00
              </Badge>
            </Card>
          </div>
        );

      case 'image-focus':
        return (
          <div className="space-y-3">
            <Card className="overflow-hidden" style={cardStyles}>
              <div className="w-full h-20 bg-gray-200"></div>
              <div className="p-2">
                <div className="flex justify-between items-start mb-1 gap-2">
                  <h4 className="font-medium text-sm" style={itemNameStyles}>Grilled Salmon</h4>
                  <Badge variant="secondary" className="text-xs flex-shrink-0" style={badgeStyles}>
                    €18.50
                  </Badge>
                </div>
                <p className="text-xs mb-2 line-clamp-2" style={descriptionStyles}>Fresh Atlantic salmon grilled to perfection</p>
                <div className="flex items-center gap-1 text-xs" style={mutedTextStyles}>
                  <Clock className="h-3 w-3" />
                  15min
                </div>
              </div>
            </Card>
          </div>
        );

      case 'minimal':
        return (
          <div className="space-y-3">
            <div className="border-b pb-2" style={{ borderColor: theme.borderColor }}>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium text-sm" style={itemNameStyles}>Grilled Salmon</h4>
                <span className="text-sm font-medium" style={priceStyles}>€18.50</span>
              </div>
              <p className="text-xs" style={descriptionStyles}>Fresh Atlantic salmon grilled to perfection</p>
            </div>
          </div>
        );

      case 'magazine':
        return (
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1" style={itemNameStyles}>Grilled Salmon</h4>
                <p className="text-xs mb-2 line-clamp-2" style={descriptionStyles}>Fresh Atlantic salmon grilled to perfection with herbs and lemon.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs" style={mutedTextStyles}>
                    <Clock className="h-3 w-3" />
                    15min
                  </div>
                  <Badge variant="secondary" className="text-xs" style={badgeStyles}>
                    €18.50
                  </Badge>
                </div>
              </div>
              <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0"></div>
            </div>
          </div>
        );

      case 'modern-card':
        return (
          <div className="space-y-4">
            <Card className="overflow-hidden border-0 shadow-lg" style={{...cardStyles, borderRadius: '16px'}}>
              <div className="relative">
                <div className="w-full h-24 bg-gradient-to-br from-gray-100 to-gray-200"></div>
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs backdrop-blur-sm" style={{ backgroundColor: theme.accentColor + '90', color: '#ffffff' }}>
                    €18.50
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-sm mb-2" style={itemNameStyles}>Grilled Salmon</h4>
                <p className="text-xs mb-3 line-clamp-2" style={descriptionStyles}>Fresh Atlantic salmon grilled to perfection with herbs and lemon.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs" style={mutedTextStyles}>
                    <Clock className="h-3 w-3" />
                    15min
                  </div>
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: theme.accentColor}}></div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'elegant-list':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg border-l-4" style={{...cardStyles, borderLeftColor: theme.accentColor}}>
              <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm" style={itemNameStyles}>Grilled Salmon</h4>
                  <span className="text-sm font-semibold" style={priceStyles}>€18.50</span>
                </div>
                <p className="text-xs mb-2 line-clamp-1" style={descriptionStyles}>Fresh Atlantic salmon grilled to perfection</p>
                <div className="flex items-center gap-1 text-xs" style={mutedTextStyles}>
                  <Clock className="h-3 w-3" />
                  15min
                </div>
              </div>
            </div>
          </div>
        );

      case 'photo-focus':
        return (
          <div className="space-y-4">
            <Card className="overflow-hidden" style={cardStyles}>
              <div className="relative">
                <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200"></div>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white">
                  <h4 className="font-semibold text-sm mb-1">Grilled Salmon</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      15min
                    </div>
                    <span className="text-sm font-semibold">€18.50</span>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs line-clamp-2" style={descriptionStyles}>Fresh Atlantic salmon grilled to perfection with herbs and lemon.</p>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
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
          <div className="flex gap-2">
            {/* Language Switch Preview */}
            <div 
              className="h-6 px-2 rounded-md flex items-center gap-1 text-xs border"
              style={languageSwitchStyles}
            >
              <span>🇦🇱</span>
              <span>SQ</span>
              <ChevronDown className="h-2 w-2" />
            </div>
            {/* Currency Switch Preview */}
            <div 
              className="h-6 px-2 rounded-md flex items-center gap-1 text-xs border"
              style={currencySwitchStyles}
            >
              <span>🇪🇺</span>
              <span>EUR</span>
              <ChevronDown className="h-2 w-2" />
            </div>
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
        {/* Search Bar */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search menu items..."
            style={{
              ...searchBarStyles,
              outline: 'none'
            }}
          />
        </div>

        {/* Tab Switcher */}
        <div style={tabSwitcherStyles} className="mb-3">
          <div style={{ ...tabStyles, ...activeTabStyles }}>
            Appetizers
          </div>
          <div style={tabStyles}>
            Main
          </div>
          <div style={tabStyles}>
            Desserts
          </div>
        </div>

        {/* Category Name */}
        <h3 className="text-base font-semibold mb-3" style={categoryNameStyles}>
          Popular Items
        </h3>

        {/* Menu Items - Using selected layout style */}
        {renderLayoutStyle()}

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
