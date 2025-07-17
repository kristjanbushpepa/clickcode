
import { useState, useEffect } from 'react';
import { createRestaurantSupabase } from '@/utils/restaurantDatabase';

interface PopupSettings {
  enabled: boolean;
  type: 'cta' | 'wheel';
  title: string;
  description: string;
  link: string;
  button_text: string;
  wheel_enabled: boolean;
  wheel_unlock_text: string;
  wheel_unlock_button_text: string;
  wheel_rewards: Array<{
    text: string;
    chance: number;
    color: string;
  }>;
}

export const usePopupSettings = (supabaseUrl: string, supabaseAnonKey: string) => {
  const [settings, setSettings] = useState<PopupSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const restaurantSupabase = createRestaurantSupabase(supabaseUrl, supabaseAnonKey);
        
        const { data, error } = await restaurantSupabase
          .from('popup_settings')
          .select('*')
          .eq('enabled', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setSettings({
            enabled: data.enabled,
            type: data.type,
            title: data.title,
            description: data.description,
            link: data.link || '',
            button_text: data.button_text,
            wheel_enabled: data.wheel_enabled,
            wheel_unlock_text: data.wheel_unlock_text,
            wheel_unlock_button_text: data.wheel_unlock_button_text,
            wheel_rewards: data.wheel_rewards || []
          });
        }
      } catch (err) {
        console.error('Error fetching popup settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load popup settings');
      } finally {
        setLoading(false);
      }
    };

    if (supabaseUrl && supabaseAnonKey) {
      fetchSettings();
    }
  }, [supabaseUrl, supabaseAnonKey]);

  return { settings, loading, error };
};
