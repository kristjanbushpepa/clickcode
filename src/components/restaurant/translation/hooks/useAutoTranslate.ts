
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';
import { useToast } from '@/components/ui/use-toast';
import { TranslatableItem } from '../types';

export const useAutoTranslate = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const autoTranslate = async (text: string, targetLang: string): Promise<string> => {
    console.log(`Auto-translating "${text}" to ${targetLang}`);
    try {
      const restaurantSupabase = getRestaurantSupabase();
      const { data, error } = await restaurantSupabase.functions.invoke('auto-translate', {
        body: {
          text,
          fromLang: 'en',
          toLang: targetLang
        }
      });

      console.log('Translation response:', data);
      
      if (error) {
        console.error('Translation error:', error);
        throw error;
      }
      
      if (!data?.success) {
        console.error('Translation failed:', data?.error);
        throw new Error(data?.error || 'Translation failed');
      }
      
      return data.translatedText;
    } catch (error) {
      console.error('Auto-translate error:', error);
      throw error;
    }
  };

  const updateTranslationMutation = useMutation({
    mutationFn: async ({ id, type, translations, metadata }: { 
      id: string; 
      type: 'category' | 'menu_item'; 
      translations: Record<string, string>;
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
      const translations: Record<string, string> = {};
      const metadata = item.translation_metadata || {};
      
      const nameField = `name_${targetLang}` as keyof TranslatableItem;
      if (item.name && !item[nameField]) {
        console.log(`Translating name: "${item.name}"`);
        const translatedName = await autoTranslate(item.name, targetLang);
        translations[`name_${targetLang}`] = translatedName;
        metadata[`name_${targetLang}`] = {
          status: 'auto_translated',
          timestamp: new Date().toISOString(),
          source: 'auto-translate'
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
          source: 'auto-translate'
        };
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
