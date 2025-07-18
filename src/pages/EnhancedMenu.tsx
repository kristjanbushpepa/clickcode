
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedMenuItem } from '@/components/menu/EnhancedMenuItem';
import { CurrencySwitch } from '@/components/menu/CurrencySwitch';
import { LanguageSwitch } from '@/components/menu/LanguageSwitch';
import { MenuFooter } from '@/components/menu/MenuFooter';
import { MenuLoadingSkeleton } from '@/components/menu/MenuSkeleton';
import { ThemedPopupModal } from '@/components/menu/ThemedPopupModal';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';
import { useToast } from '@/hooks/use-toast';

interface Restaurant {
  id: string;
  name: string;
  owner_full_name: string;
  owner_email: string;
  owner_phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  supabase_url: string;
  supabase_anon_key: string;
  created_at: string;
  updated_at: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image_url: string;
  category: string;
  options?: MenuOption[];
}

interface MenuOption {
  name: string;
  price: number;
}

interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
  email?: string;
}

interface Customization {
  id: string;
  restaurant_id: string;
  primary_color: string;
  secondary_color: string;
  logo_url: string;
  theme: string;
}

interface SocialMediaOption {
  platform: string;
  url: string;
  enabled: boolean;
}

interface ReviewOption {
  platform: string;
  url: string;
  enabled: boolean;
}

interface PopupSettings {
  enabled: boolean;
  type: 'review' | 'wheel' | 'social';
  title: string;
  description: string;
  link: string;
  buttonText: string;
  showAfterSeconds: number;
  dailyLimit: number;
  socialMedia?: SocialMediaOption[];
  reviewOptions?: ReviewOption[];
  wheelSettings: {
    enabled: boolean;
    unlockType: 'free' | 'link';
    unlockText: string;
    unlockButtonText: string;
    unlockLink: string;
    rewards: Array<{
      text: string;
      chance: number;
      color: string;
    }>;
  };
}

export default function EnhancedMenu() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [customization, setCustomization] = useState<Customization | null>(null);
  const [currency, setCurrency] = useState<string>('USD');
  const [language, setLanguage] = useState<string>('en');
  const [popupSettings, setPopupSettings] = useState<PopupSettings | null>(null);
  const [restaurantSupabase, setRestaurantSupabase] = useState<any>(null);
  const { toast } = useToast();

  const themeStyles = customization?.theme ? JSON.parse(customization.theme) : {};

  useEffect(() => {
    const fetchRestaurantData = async () => {
      console.log('Fetching restaurant data...');
      
      if (!slug) {
        console.error('No restaurant slug provided');
        setError('Restaurant not found');
        setLoading(false);
        return;
      }

      try {
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('slug', slug)
          .single();

        if (restaurantError) {
          console.error('Error fetching restaurant:', restaurantError);
          setError('Failed to load restaurant data');
          setLoading(false);
          return;
        }

        if (restaurantData) {
          // Map the database restaurant data to our Restaurant interface
          const mappedRestaurant: Restaurant = {
            id: restaurantData.id,
            name: restaurantData.name,
            owner_full_name: restaurantData.owner_full_name,
            owner_email: restaurantData.owner_email,
            owner_phone: restaurantData.owner_phone,
            address: restaurantData.address,
            city: restaurantData.city,
            country: restaurantData.country,
            postal_code: restaurantData.postal_code,
            supabase_url: restaurantData.supabase_url,
            supabase_anon_key: restaurantData.supabase_anon_key,
            created_at: restaurantData.created_at,
            updated_at: restaurantData.updated_at,
          };
          
          setRestaurant(mappedRestaurant);
          
          const restaurantSupabaseClient = getRestaurantSupabase(
            restaurantData.supabase_url,
            restaurantData.supabase_anon_key
          );
          setRestaurantSupabase(restaurantSupabaseClient);

          try {
            const { data: profileData, error: profileError } = await restaurantSupabaseClient
              .from('profiles')
              .select('*')
              .eq('id', restaurantData.owner_full_name) // Using owner_full_name as fallback
              .single();

            if (profileError) {
              console.error('Error fetching profile:', profileError);
            } else if (profileData) {
              setProfile(profileData);
            }
          } catch (profileFetchError) {
            console.error('Error fetching profile:', profileFetchError);
          }

          try {
            const { data: customizationData, error: customizationError } = await restaurantSupabaseClient
              .from('customizations')
              .select('*')
              .eq('restaurant_id', restaurantData.id)
              .single();

            if (customizationError) {
              console.error('Error fetching customization:', customizationError);
            } else if (customizationData) {
              setCustomization(customizationData);
            }
          } catch (customizationFetchError) {
            console.error('Error fetching customization:', customizationFetchError);
          }

          // Fetch popup settings
          try {
            const { data: popupData, error: popupError } = await restaurantSupabaseClient
              .from('popup_settings')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(1);

            if (popupError) {
              console.error('Error fetching popup settings:', popupError);
            } else if (popupData && popupData.length > 0) {
              const popupSettings = popupData[0];
              
              // Transform the database structure to match the component interface
              const transformedSettings = {
                enabled: Boolean(popupSettings.enabled),
                type: popupSettings.type || 'review',
                title: popupSettings.title || 'Leave us a Review!',
                description: popupSettings.description || '',
                link: popupSettings.link || '',
                buttonText: popupSettings.button_text || 'Leave Review',
                showAfterSeconds: Number(popupSettings.show_after_seconds) || 3,
                dailyLimit: Number(popupSettings.daily_limit) || 1,
                socialMedia: Array.isArray(popupSettings.social_media) ? popupSettings.social_media : [
                  { platform: 'instagram', url: '', enabled: true },
                  { platform: 'facebook', url: '', enabled: false },
                  { platform: 'tiktok', url: '', enabled: false },
                  { platform: 'youtube', url: '', enabled: false },
                ],
                reviewOptions: Array.isArray(popupSettings.review_options) ? popupSettings.review_options : [
                  { platform: 'google', url: '', enabled: true },
                  { platform: 'tripadvisor', url: '', enabled: false },
                  { platform: 'yelp', url: '', enabled: false },
                  { platform: 'facebook', url: '', enabled: false },
                ],
                wheelSettings: {
                  enabled: Boolean(popupSettings.wheel_enabled),
                  unlockType: popupSettings.wheel_unlock_type || 'free',
                  unlockText: popupSettings.wheel_unlock_text || 'Spin the wheel for your reward!',
                  unlockButtonText: popupSettings.wheel_unlock_button_text || 'Spin Wheel',
                  unlockLink: popupSettings.wheel_unlock_link || '',
                  rewards: Array.isArray(popupSettings.wheel_rewards) ? popupSettings.wheel_rewards : [
                    { text: '10% Off', chance: 20, color: '#ef4444' },
                    { text: 'Free Drink', chance: 15, color: '#3b82f6' },
                    { text: '5% Off', chance: 30, color: '#10b981' },
                    { text: 'Free Appetizer', chance: 10, color: '#f59e0b' },
                    { text: 'Try Again', chance: 25, color: '#6b7280' }
                  ]
                }
              };
              
              setPopupSettings(transformedSettings);
            }
          } catch (popupFetchError) {
            console.error('Error fetching popup settings:', popupFetchError);
          }

          try {
            const { data: menuData, error: menuError } = await restaurantSupabaseClient
              .from('menu_items')
              .select('*')
              .order('created_at', { ascending: true });

            if (menuError) {
              console.error('Error fetching menu:', menuError);
              toast({
                title: 'Error',
                description: 'Failed to load menu items.',
                variant: 'destructive',
              });
            } else if (menuData) {
              setMenu(menuData);
            }
          } catch (menuFetchError) {
            console.error('Error fetching menu:', menuFetchError);
            toast({
              title: 'Error',
              description: 'Failed to load menu items.',
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching restaurant:', error);
        setError('Failed to load restaurant data');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [slug, toast]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currencyParam = params.get('currency');
    const languageParam = params.get('lang');

    if (currencyParam) {
      setCurrency(currencyParam);
    }

    if (languageParam) {
      setLanguage(languageParam);
    }
  }, [location.search]);

  const getCategoryItems = (category: string) => {
    return menu.filter(item => item.category === category);
  };

  if (loading) return <MenuLoadingSkeleton />;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;
  if (!restaurant) return <div className="text-center p-4">Restaurant not found</div>;

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={themeStyles}
    >
      <header className="container mx-auto p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            <p className="text-sm text-muted-foreground">{restaurant.city}</p>
          </div>
          <div className="flex items-center space-x-4">
            {restaurantSupabase && (
              <>
                <CurrencySwitch 
                  restaurantSupabase={restaurantSupabase}
                  currentCurrency={currency}
                  onCurrencyChange={setCurrency}
                />
                <LanguageSwitch 
                  restaurantSupabase={restaurantSupabase}
                  currentLanguage={language}
                  onLanguageChange={setLanguage}
                />
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Menu Categories */}
        {Array.from(new Set(menu.map(item => item.category))).map(category => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold mb-2">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getCategoryItems(category).map(item => (
                <EnhancedMenuItem key={item.id} item={item} currency={currency} />
              ))}
            </div>
          </div>
        ))}
      </main>

      {/* Themed Popup Modal */}
      {popupSettings && (
        <ThemedPopupModal 
          settings={popupSettings}
          restaurantName={restaurant.name}
          theme={customization?.theme ? JSON.parse(customization.theme) : undefined}
        />
      )}

      {profile && (
        <MenuFooter 
          restaurant={{
            name: restaurant.name,
            address: restaurant.address || '',
            city: restaurant.city || '',
            country: restaurant.country || '',
            owner_email: restaurant.owner_email,
            owner_phone: restaurant.owner_phone || ''
          }} 
          profile={{
            name: profile.full_name || restaurant.owner_full_name,
            full_name: profile.full_name || restaurant.owner_full_name,
            avatar_url: profile.avatar_url || '',
            website: profile.website || '',
            email: profile.email || restaurant.owner_email
          }} 
        />
      )}
    </div>
  );
}
