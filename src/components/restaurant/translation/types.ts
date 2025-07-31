
export interface MenuItemSize {
  name: string;
  price: number;
}

export interface TranslatableItem {
  id: string;
  type: 'category' | 'menu_item';
  name: string;
  name_sq?: string;
  name_en?: string;
  name_it?: string;
  name_de?: string;
  name_fr?: string;
  name_zh?: string;
  description?: string;
  description_sq?: string;
  description_en?: string;
  description_it?: string;
  description_de?: string;
  description_fr?: string;
  description_zh?: string;
  sizes?: MenuItemSize[];
  sizes_sq?: MenuItemSize[];
  sizes_en?: MenuItemSize[];
  sizes_it?: MenuItemSize[];
  sizes_de?: MenuItemSize[];
  sizes_fr?: MenuItemSize[];
  sizes_zh?: MenuItemSize[];
  translation_metadata?: Record<string, any>;
}

// Language options for translation (English and Albanian are read-only for viewing)
export const LANGUAGE_OPTIONS = [
  { code: 'sq', name: 'Shqip', flag: '🇦🇱', readonly: true },
  { code: 'en', name: 'English', flag: '🇬🇧', readonly: true },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', readonly: false },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', readonly: false },
  { code: 'fr', name: 'Français', flag: '🇫🇷', readonly: false },
  { code: 'zh', name: '中文', flag: '🇨🇳', readonly: false }
];
