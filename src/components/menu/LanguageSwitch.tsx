import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
interface LanguageSettings {
  id: string;
  main_ui_language: string;
  supported_ui_languages: string[];
  content_languages: string[];
  auto_translate: boolean;
}
const LANGUAGE_OPTIONS = [{
  code: 'sq',
  name: 'Shqip',
  flag: '🇦🇱'
}, {
  code: 'en',
  name: 'English',
  flag: '🇬🇧'
}, {
  code: 'it',
  name: 'Italiano',
  flag: '🇮🇹'
}, {
  code: 'de',
  name: 'Deutsch',
  flag: '🇩🇪'
}, {
  code: 'fr',
  name: 'Français',
  flag: '🇫🇷'
}, {
  code: 'zh',
  name: '中文',
  flag: '🇨🇳'
}];
interface LanguageSwitchProps {
  restaurantSupabase: any;
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}
export function LanguageSwitch({
  restaurantSupabase,
  currentLanguage,
  onLanguageChange
}: LanguageSwitchProps) {
  // Fetch language settings
  const {
    data: languageSettings
  } = useQuery({
    queryKey: ['language_settings_menu'],
    queryFn: async () => {
      if (!restaurantSupabase) return null;
      const {
        data,
        error
      } = await restaurantSupabase.from('language_settings').select('*').maybeSingle();
      if (error) {
        console.error('Language settings fetch error:', error);
        return null;
      }
      return data as LanguageSettings | null;
    },
    enabled: !!restaurantSupabase
  });
  const supportedLanguages = languageSettings?.supported_ui_languages || ['sq', 'en'];
  const currentLangData = LANGUAGE_OPTIONS.find(lang => lang.code === currentLanguage);
  return <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 border-border px-2 h-8 font-normal text-slate-950 bg-slate-50">
          <span className="text-sm text-black">{currentLangData?.flag}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40" align="end">
        <div className="space-y-1">
          <h4 className="font-medium text-xs mb-2">Language</h4>
          {supportedLanguages.map(langCode => {
          const lang = LANGUAGE_OPTIONS.find(l => l.code === langCode);
          if (!lang) return null;
          return <Button key={lang.code} variant={currentLanguage === lang.code ? "default" : "ghost"} size="sm" className="w-full justify-start gap-2 h-8 text-xs" onClick={() => onLanguageChange(lang.code)}>
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </Button>;
        })}
        </div>
      </PopoverContent>
    </Popover>;
}