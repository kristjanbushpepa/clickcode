import React from 'react';
import { MapPin, Phone, Instagram, Globe, ChevronDown } from 'lucide-react';

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
  languageSwitchBackground?: string;
  languageSwitchBorder?: string;
  languageSwitchText?: string;
  currencySwitchBackground?: string;
  currencySwitchBorder?: string;
  currencySwitchText?: string;
}

interface MenuHeaderProps {
  restaurantName: string;
  restaurantLocation?: string;
  restaurantPhone?: string;
  restaurantInstagram?: string;
  restaurantWebsite?: string;
  logoUrl?: string;
  bannerLayout?: 'classic' | 'modern' | 'minimal' | 'gradient' | 'image-overlay';
  logoLayout?: 'left' | 'center' | 'right' | 'top-center' | 'overlay';
  theme?: MenuTheme;
  currentLanguage?: string;
  currentCurrency?: string;
  onLanguageChange?: () => void;
  onCurrencyChange?: () => void;
}

const MenuHeader: React.FC<MenuHeaderProps> = ({
  restaurantName,
  restaurantLocation,
  restaurantPhone,
  restaurantInstagram,
  restaurantWebsite,
  logoUrl,
  bannerLayout = 'classic',
  logoLayout = 'left',
  theme,
  currentLanguage = 'SQ',
  currentCurrency = 'EUR',
  onLanguageChange,
  onCurrencyChange,
}) => {
  const getHeaderStyles = () => {
    switch (bannerLayout) {
      case 'modern':
        return {
          background: `linear-gradient(135deg, ${theme?.primaryColor || '#3b82f6'}, ${theme?.accentColor || '#8b5cf6'})`,
          color: theme?.headingColor || '#ffffff',
        };
      case 'minimal':
        return {
          backgroundColor: theme?.backgroundColor || '#ffffff',
          color: theme?.textColor || '#000000',
          borderBottom: `1px solid ${theme?.borderColor || '#e5e7eb'}`,
        };
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${theme?.accentColor || '#f97316'}, ${theme?.primaryColor || '#ea580c'})`,
          color: theme?.headingColor || '#ffffff',
        };
      case 'image-overlay':
        return {
          background: `linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url('/lovable-uploads/a549e5dd-e147-49c7-a729-6ba836ceff1c.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#ffffff',
        };
      default: // classic
        return {
          backgroundColor: theme?.primaryColor || '#1f2937',
          color: theme?.headingColor || '#ffffff',
        };
    }
  };

  const getLogoPosition = () => {
    switch (logoLayout) {
      case 'center':
        return 'justify-center';
      case 'right':
        return 'justify-end';
      case 'top-center':
        return 'justify-center flex-col';
      case 'overlay':
        return 'justify-center absolute top-2 left-2 z-10';
      default: // left
        return 'justify-start';
    }
  };

  const languageSwitchStyles = {
    backgroundColor: theme?.languageSwitchBackground || theme?.primaryColor || '#1f2937',
    borderColor: theme?.languageSwitchBorder || theme?.borderColor || '#e5e7eb',
    color: theme?.languageSwitchText || '#ffffff',
  };

  const currencySwitchStyles = {
    backgroundColor: theme?.currencySwitchBackground || theme?.primaryColor || '#1f2937',
    borderColor: theme?.currencySwitchBorder || theme?.borderColor || '#e5e7eb',
    color: theme?.currencySwitchText || '#ffffff',
  };

  return (
    <div className="relative" style={getHeaderStyles()}>
      {/* Top Controls */}
      <div className="flex justify-between items-start p-4">
        {/* Logo Section */}
        <div className={`flex items-center ${getLogoPosition()}`}>
          {logoUrl && (
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
              <img 
                src={logoUrl} 
                alt={restaurantName} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {!logoUrl && logoLayout !== 'overlay' && (
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-lg font-bold">
                {restaurantName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Language & Currency Switches */}
        <div className="flex gap-2">
          <button 
            onClick={onLanguageChange}
            className="h-8 px-3 rounded-md flex items-center gap-2 text-sm border transition-colors hover:opacity-80"
            style={languageSwitchStyles}
          >
            <span>🇦🇱</span>
            <span>{currentLanguage}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          <button 
            onClick={onCurrencyChange}
            className="h-8 px-3 rounded-md flex items-center gap-2 text-sm border transition-colors hover:opacity-80"
            style={currencySwitchStyles}
          >
            <span>🇪🇺</span>
            <span>{currentCurrency}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="text-center pb-6">
        <h1 
          className="text-2xl md:text-3xl font-bold mb-2 uppercase tracking-wide"
          style={{ color: theme?.headingColor || '#ffffff' }}
        >
          {restaurantName}
        </h1>
        {restaurantLocation && (
          <div className="flex items-center justify-center gap-2 text-sm opacity-90 mb-4">
            <MapPin className="h-4 w-4" />
            <span>{restaurantLocation}</span>
          </div>
        )}
        
        {/* Contact Info */}
        <div className="flex justify-center gap-6 text-sm opacity-80">
          {restaurantPhone && (
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              <span>{restaurantPhone}</span>
            </div>
          )}
          {restaurantInstagram && (
            <div className="flex items-center gap-1">
              <Instagram className="h-4 w-4" />
              <span>@{restaurantInstagram}</span>
            </div>
          )}
          {restaurantWebsite && (
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span>Website</span>
            </div>
          )}
        </div>
      </div>

      {/* Gradient overlay for image-overlay style */}
      {bannerLayout === 'image-overlay' && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 pointer-events-none" />
      )}
    </div>
  );
};

export default MenuHeader;