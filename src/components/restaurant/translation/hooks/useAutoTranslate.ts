import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';
import { useToast } from '@/components/ui/use-toast';
import { TranslatableItem, MenuItemSize } from '../types';

export const useAutoTranslate = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Client-side translation using Google Translate's free API
  const translateWithGoogle = async (text: string, targetLang: string): Promise<string> => {
    try {
      console.log(`Translating with Google: "${text}" to ${targetLang}`);
      
      // Use Google Translate's free endpoint
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Google Translate API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Google Translate response:', data);
      
      // Google Translate returns an array structure
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0];
      }
      
      throw new Error('Invalid response format from Google Translate');
    } catch (error) {
      console.error('Google Translate error:', error);
      throw error;
    }
  };

  // Fallback to MyMemory API
  const translateWithMyMemory = async (text: string, targetLang: string): Promise<string> => {
    try {
      console.log(`Translating with MyMemory: "${text}" to ${targetLang}`);
      const encodedText = encodeURIComponent(text);
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|${targetLang}`
      );

      if (!response.ok) {
        throw new Error(`MyMemory API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('MyMemory response:', data);
      
      if (data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }
      
      throw new Error('Invalid response from MyMemory');
    } catch (error) {
      console.error('MyMemory error:', error);
      throw error;
    }
  };

  const autoTranslate = async (text: string, targetLang: string): Promise<string> => {
    console.log(`Auto-translating "${text}" to ${targetLang}`);
    
    // Skip translation if target language is the same as source
    if (targetLang === 'en') {
      console.log('Target language is English, returning original text');
      return text;
    }

    try {
      // First try the edge function
      const restaurantSupabase = getRestaurantSupabase();
      const { data, error } = await restaurantSupabase.functions.invoke('auto-translate', {
        body: {
          text,
          fromLang: 'en',
          toLang: targetLang
        }
      });

      console.log('Edge function response:', data, error);
      
      if (!error && data?.success) {
        return data.translatedText;
      }
      
      console.log('Edge function failed, trying client-side translation');
    } catch (edgeFunctionError) {
      console.log('Edge function not available, using client-side translation:', edgeFunctionError);
    }

    // Fallback to client-side translation
    try {
      // Try Google Translate first
      return await translateWithGoogle(text, targetLang);
    } catch (googleError) {
      console.log('Google Translate failed, trying MyMemory:', googleError);
      try {
        // Fallback to MyMemory
        return await translateWithMyMemory(text, targetLang);
      } catch (myMemoryError) {
        console.error('All translation services failed:', googleError, myMemoryError);
        throw new Error('Translation service temporarily unavailable. Please try again later.');
      }
    }
  };

  const translateSizes = async (sizes: MenuItemSize[], targetLang: string): Promise<MenuItemSize[]> => {
    if (!sizes || sizes.length === 0) return [];
    
    const translatedSizes = [];
    for (const size of sizes) {
      try {
        const translatedName = await autoTranslate(size.name, targetLang);
        translatedSizes.push({
          name: translatedName,
          price: size.price
        });
      } catch (error) {
        console.error(`Error translating size "${size.name}":`, error);
        // Keep original if translation fails
        translatedSizes.push(size);
      }
    }
    return translatedSizes;
  };

  const updateTranslationMutation = useMutation({
    mutationFn: async ({ id, type, translations, metadata }: { 
      id: string; 
      type: 'category' | 'menu_item'; 
      translations: Record<string, any>;
      metadata?: any;
    }) => {
      console.log(`Updating translations for ${type} ${id}:`, translations);
      try {
        const restaurantSupabase = getRestaurantSupabase();
        const tableName = type === 'category' ? 'categories' : 'menu_items';
        
        const updateData = { ...translations };
        if (metadata) {
          updateData.translation_metadata = metadata;
        }
        
        console.log(`Updating ${tableName} with:`, updateData);
        
        const { data, error } = await restaurantSupabase
          .from(tableName)
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error(`Update error for ${tableName}:`, error);
          throw error;
        }
        
        console.log(`Successfully updated ${tableName}:`, data);
        return data;
      } catch (error) {
        console.error('Update translation mutation error:', error);
        throw error;
      }
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: [`${type === 'category' ? 'categories' : 'menu_items'}_translation`] });
      toast({ title: 'Përkthimi u përditësua me sukses' });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({ 
        title: 'Gabim në përditësimin e përkthimit', 
        description: error.message || 'Ka ndodhur një gabim', 
        variant: 'destructive' 
      });
    }
  });

  const autoTranslateItem = async (item: TranslatableItem, targetLang: string, translatingItems: Set<string>, setTranslatingItems: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    console.log(`Auto-translating item ${item.id} to ${targetLang}`);
    setTranslatingItems(prev => new Set(prev).add(item.id));
    
    try {
      const translations: Record<string, any> = {};
      const metadata = item.translation_metadata || {};
      
      const nameField = `name_${targetLang}` as keyof TranslatableItem;
      if (item.name && !item[nameField]) {
        console.log(`Translating name: "${item.name}"`);
        const translatedName = await autoTranslate(item.name, targetLang);
        translations[`name_${targetLang}`] = translatedName;
        metadata[`name_${targetLang}`] = {
          status: 'auto_translated',
          timestamp: new Date().toISOString(),
          source: 'client-side'
        };
      }
      
      const descField = `description_${targetLang}` as keyof TranslatableItem;
      if (item.description && !item[descField]) {
        console.log(`Translating description: "${item.description}"`);
        const translatedDescription = await autoTranslate(item.description, targetLang);
        translations[`description_${targetLang}`] = translatedDescription;
        metadata[`description_${targetLang}`] = {
          status: 'auto_translated',
          timestamp: new Date().toISOString(),
          source: 'client-side'
        };
      }

      // Translate sizes if they exist
      if (item.type === 'menu_item' && item.sizes && item.sizes.length > 0) {
        const sizesField = `sizes_${targetLang}` as keyof TranslatableItem;
        if (!item[sizesField]) {
          console.log(`Translating sizes for item ${item.id}`);
          const translatedSizes = await translateSizes(item.sizes, targetLang);
          translations[`sizes_${targetLang}`] = translatedSizes;
          metadata[`sizes_${targetLang}`] = {
            status: 'auto_translated',
            timestamp: new Date().toISOString(),
            source: 'client-side'
          };
        }
      }
      
      if (Object.keys(translations).length > 0) {
        console.log(`Saving translations for item ${item.id}:`, translations);
        await updateTranslationMutation.mutateAsync({
          id: item.id,
          type: item.type,
          translations,
          metadata
        });
      } else {
        console.log(`No translations needed for item ${item.id}`);
        toast({
          title: 'Nuk ka nevojë për përkthim',
          description: 'Ky artikull është tashmë i përkthyer'
        });
      }
    } catch (error: any) {
      console.error(`Error translating item ${item.id}:`, error);
      toast({
        title: 'Gabim në përkthim automatik',
        description: error.message || 'Ka ndodhur një gabim gjatë përkthimit',
        variant: 'destructive'
      });
    } finally {
      setTranslatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  return {
    autoTranslate,
    updateTranslationMutation,
    autoTranslateItem
  };
};
