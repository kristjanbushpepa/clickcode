
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Instagram, Phone, Facebook, Globe, MapPin } from 'lucide-react';
import { LanguageSwitch } from './LanguageSwitch';
import { CurrencySwitch } from './CurrencySwitch';

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
  badgeBackgroundColor?: string;
  badgeTextColor?: string;
  languageSwitchBackground?: string;
  languageSwitchBorder?: string;
  languageSwitchText?: string;
  currencySwitchBackground?: string;
  currencySwitchBorder?: string;
  currencySwitchText?: string;
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

interface RestaurantProfile {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  banner_url?: string;
  logo_path?: string;
  banner_path?: string;
  social_media_links?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    whatsapp?: string;
  };
}

interface Category {
  id: string;
  name: string;
  name_sq?: string;
  description?: string;
  description_sq?: string;
  display_order: number;
  is_active: boolean;
  image_path?: string;
  image_url?: string;
}

interface MenuHeaderProps {
  profile: RestaurantProfile | undefined;
  bannerImageUrl: string | null;
  logoImageUrl: string | null;
  selectedCategory: string | null;
  layoutPreference: 'categories' | 'items';
  categories: Category[];
  customTheme: MenuTheme | null;
  currentLanguage: string;
  currentCurrency: string;
  restaurantSupabase: any;
  hasAnimated: boolean;
  onBackClick: () => void;
  onLanguageChange: (language: string) => void;
  onCurrencyChange: (currency: string) => void;
  getLocalizedText: (item: any, field: string) => string;
}

export const MenuHeader = React.memo<MenuHeaderProps>(({
  profile,
  bannerImageUrl,
  logoImageUrl,
  selectedCategory,
  layoutPreference,
  categories,
  customTheme,
  currentLanguage,
  currentCurrency,
  restaurantSupabase,
  hasAnimated,
  onBackClick,
  onLanguageChange,
  onCurrencyChange,
  getLocalizedText
}) => {
  const headingStyles = customTheme ? {
    color: customTheme.headingColor || customTheme.textColor
  } : {};

  return (
    <div className="relative">
      {bannerImageUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${bannerImageUrl})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      )}
      
      <div 
        className="relative px-3 py-15 safe-area-top text-white" 
        style={{
          backgroundColor: bannerImageUrl ? 'transparent' : customTheme?.primaryColor
        }}
      >
        <div className="max-w-sm mx-auto">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              {selectedCategory && layoutPreference === 'categories' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onBackClick} 
                  className="text-white hover:bg-white/20 p-2 h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              {logoImageUrl && (
                <img 
                  src={logoImageUrl} 
                  alt={profile?.name} 
                  className="h-10 w-10 rounded-full object-cover bg-white/10 backdrop-blur-sm p-1" 
                  loading="lazy" 
                />
              )}
            </div>
            <div className="flex gap-1">
              <LanguageSwitch 
                restaurantSupabase={restaurantSupabase} 
                currentLanguage={currentLanguage} 
                onLanguageChange={onLanguageChange} 
                customTheme={customTheme ? {
                  languageSwitchBackground: customTheme.languageSwitchBackground,
                  languageSwitchBorder: customTheme.languageSwitchBorder,
                  languageSwitchText: customTheme.languageSwitchText
                } : undefined}
              />
              <CurrencySwitch 
                restaurantSupabase={restaurantSupabase} 
                currentCurrency={currentCurrency} 
                onCurrencyChange={onCurrencyChange}
                customTheme={customTheme ? {
                  currencySwitchBackground: customTheme.currencySwitchBackground,
                  currencySwitchBorder: customTheme.currencySwitchBorder,
                  currencySwitchText: customTheme.currencySwitchText
                } : undefined}
              />
            </div>
          </div>
          
          <div className={`text-center ${!hasAnimated ? 'slide-up' : ''}`}>
            <h1 className="text-lg font-bold mb-1 uppercase tracking-wide" style={headingStyles}>
              {selectedCategory && layoutPreference === 'categories' 
                ? getLocalizedText(categories.find(cat => cat.id === selectedCategory), 'name') 
                : profile?.name || 'Restaurant Menu'
              }
            </h1>
            {profile?.address && !selectedCategory && (
              <div className="flex items-center justify-center gap-1 text-xs opacity-80 uppercase tracking-wide mb-2">
                <MapPin className="h-3 w-3" />
                {profile.address.split(',')[0] || profile.address}
              </div>
            )}
            
            {!selectedCategory && (
              <div className="flex justify-center gap-3 mb-1">
                {profile?.social_media_links?.instagram && (
                  <a 
                    href={profile.social_media_links.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover-lift"
                  >
                    <Instagram className="h-4 w-4 opacity-80 hover:opacity-100" />
                  </a>
                )}
                {profile?.phone && (
                  <a href={`tel:${profile.phone}`} className="hover-lift">
                    <Phone className="h-4 w-4 opacity-80 hover:opacity-100" />
                  </a>
                )}
                {profile?.social_media_links?.facebook && (
                  <a 
                    href={profile.social_media_links.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover-lift"
                  >
                    <Facebook className="h-4 w-4 opacity-80 hover:opacity-100" />
                  </a>
                )}
                {profile?.website && (
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover-lift"
                  >
                    <Globe className="h-4 w-4 opacity-80 hover:opacity-100" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

MenuHeader.displayName = 'MenuHeader';
