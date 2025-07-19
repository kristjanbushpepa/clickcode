
import { useQuery } from '@tanstack/react-query';

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
  tabActiveBackground?: string;
  tabActiveText?: string;
  tabHoverBackground?: string;
}

export const useThemeCustomization = (restaurantSupabase: any) => {
  return useQuery({
    queryKey: ['theme_customization'],
    queryFn: async () => {
      if (!restaurantSupabase) return null;
      
      const { data, error } = await restaurantSupabase
        .from('restaurant_customization')
        .select('theme')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Theme customization fetch error:', error);
        return null;
      }

      return data?.[0]?.theme as Theme | null;
    },
    enabled: !!restaurantSupabase,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000
  });
};
