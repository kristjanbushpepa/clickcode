import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Languages, Globe } from 'lucide-react';

interface LanguageSettings {
  id: string;
  main_ui_language: string;
  supported_ui_languages: string[];
  content_languages: string[];
  auto_translate: boolean;
}

const LANGUAGE_OPTIONS = [
  { code: 'sq', name: 'Shqip', flag: '🇦🇱' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
];

export function LanguageSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch language settings
  const { data: languageSettings, isLoading } = useQuery({
    queryKey: ['language_settings'],
    queryFn: async () => {
      const restaurantSupabase = getRestaurantSupabase();
      const { data, error } = await restaurantSupabase
        .from('language_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as LanguageSettings | null;
    }
  });

  // Update language settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<LanguageSettings>) => {
      const restaurantSupabase = getRestaurantSupabase();
      
      if (languageSettings?.id) {
        const { data, error } = await restaurantSupabase
          .from('language_settings')
          .update(updates)
          .eq('id', languageSettings.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await restaurantSupabase
          .from('language_settings')
          .insert([updates])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['language_settings'] });
      toast({ title: 'Cilësimet e gjuhës u përditësuan me sukses' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Gabim në përditësimin e cilësimeve', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const handleMainLanguageChange = (language: string) => {
    updateSettingsMutation.mutate({
      main_ui_language: language,
      supported_ui_languages: languageSettings?.supported_ui_languages || ['sq', 'en', 'it', 'de', 'fr', 'zh'],
      content_languages: languageSettings?.content_languages || ['sq', 'en', 'it', 'de', 'fr', 'zh'],
      auto_translate: languageSettings?.auto_translate ?? true
    });
  };

  const handleAutoTranslateChange = (enabled: boolean) => {
    updateSettingsMutation.mutate({
      main_ui_language: languageSettings?.main_ui_language || 'sq',
      supported_ui_languages: languageSettings?.supported_ui_languages || ['sq', 'en', 'it', 'de', 'fr', 'zh'],
      content_languages: languageSettings?.content_languages || ['sq', 'en', 'it', 'de', 'fr', 'zh'],
      auto_translate: enabled
    });
  };

  const getLanguageName = (code: string) => {
    return LANGUAGE_OPTIONS.find(lang => lang.code === code)?.name || code;
  };

  const getLanguageFlag = (code: string) => {
    return LANGUAGE_OPTIONS.find(lang => lang.code === code)?.flag || '🏳️';
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Duke ngarkuar...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Kontrolli i Gjuhës</h2>
        <p className="text-muted-foreground">Menaxho gjuhën kryesore dhe përkthimet automatike</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Gjuha Kryesore e Ndërfaqes
            </CardTitle>
            <CardDescription>
              Zgjidhni gjuhën kryesore për ndërfaqen e restorantit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="main-language">Gjuha Kryesore</Label>
              <Select
                value={languageSettings?.main_ui_language || 'sq'}
                onValueChange={handleMainLanguageChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Zgjidhni gjuhën" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      <div className="flex items-center gap-2">
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Kjo gjuhë do të përdoret si gjuhë kryesore për ndërfaqen e menaxhimit të restorantit.
            </div>
          </CardContent>
        </Card>

        {/* Translation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Cilësimet e Përkthimit
            </CardTitle>
            <CardDescription>
              Konfiguro përkthimin automatik dhe gjuhët e mbështetura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auto-translate">Përkthim Automatik</Label>
                <p className="text-sm text-muted-foreground">
                  Përkthen automatikisht përmbajtjen nga gjuha angleze
                </p>
              </div>
              <Switch
                id="auto-translate"
                checked={languageSettings?.auto_translate ?? true}
                onCheckedChange={handleAutoTranslateChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Gjuhët e Mbështetura për Përmbajtje</Label>
              <div className="flex flex-wrap gap-2">
                {(languageSettings?.content_languages || ['sq', 'en', 'it', 'de', 'fr', 'zh']).map((langCode) => (
                  <Badge key={langCode} variant="secondary" className="flex items-center gap-1">
                    <span>{getLanguageFlag(langCode)}</span>
                    <span>{getLanguageName(langCode)}</span>
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Përmbajtja e menusë dhe kategorive mund të përkthehet në këto gjuhë
              </p>
            </div>

            <div className="space-y-2">
              <Label>Gjuhët e Mbështetura për Ndërfaqe</Label>
              <div className="flex flex-wrap gap-2">
                {(languageSettings?.supported_ui_languages || ['sq', 'en', 'it', 'de', 'fr', 'zh']).map((langCode) => (
                  <Badge key={langCode} variant="outline" className="flex items-center gap-1">
                    <span>{getLanguageFlag(langCode)}</span>
                    <span>{getLanguageName(langCode)}</span>
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Klientët mund të zgjedhin midis këtyre gjuhëve për të parë menunë
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informacion shtesë</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            • Kur krijoni artikuj të rinj menuje, shkruani emrat dhe përshkrimet në anglisht për përkthim automatik optimal
          </p>
          <p className="text-sm text-muted-foreground">
            • Mund të modifikoni manualisht çdo përkthim automatik nëse dëshironi
          </p>
          <p className="text-sm text-muted-foreground">
            • Gjuha shqipe është gjuha kryesore dhe do të shfaqet gjithmonë si opsion i parë
          </p>
        </CardContent>
      </Card>
    </div>
  );
}