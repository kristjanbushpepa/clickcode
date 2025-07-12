import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Languages, Edit3, Save, RefreshCw, Wand2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface TranslatableItem {
  id: string;
  name: string;
  name_sq?: string;
  name_it?: string;
  name_de?: string;
  name_fr?: string;
  name_zh?: string;
  description?: string;
  description_sq?: string;
  description_it?: string;
  description_de?: string;
  description_fr?: string;
  description_zh?: string;
  translation_metadata?: any;
  type: 'category' | 'menu_item';
}

interface TranslationStatus {
  status: 'original' | 'auto_translated' | 'manually_edited' | 'approved';
  timestamp: string;
  source?: string;
}

const LANGUAGE_OPTIONS = [
  { code: 'sq', name: 'Shqip', flag: '🇦🇱' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
];

export function TranslationManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState('sq');
  const [editingTranslations, setEditingTranslations] = useState<Record<string, Record<string, string>>>({});
  const [translatingItems, setTranslatingItems] = useState<Set<string>>(new Set());
  const [bulkTranslating, setBulkTranslating] = useState(false);

  // Fetch categories and menu items for translation
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories_translation'],
    queryFn: async () => {
      console.log('Fetching categories for translation...');
      try {
        const restaurantSupabase = getRestaurantSupabase();
        const { data, error } = await restaurantSupabase
          .from('categories')
          .select('*')
          .order('display_order');
        
        if (error) {
          console.error('Categories fetch error:', error);
          throw error;
        }
        console.log('Fetched categories:', data);
        return data || [];
      } catch (error) {
        console.error('Error in categories query function:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000
  });

  const { data: menuItems = [], isLoading: itemsLoading, error: itemsError } = useQuery({
    queryKey: ['menu_items_translation'],
    queryFn: async () => {
      console.log('Fetching menu items for translation...');
      try {
        const restaurantSupabase = getRestaurantSupabase();
        const { data, error } = await restaurantSupabase
          .from('menu_items')
          .select('*')
          .order('display_order');
        
        if (error) {
          console.error('Menu items fetch error:', error);
          throw error;
        }
        console.log('Fetched menu items:', data);
        return data || [];
      } catch (error) {
        console.error('Error in menu items query function:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000
  });

  // Auto-translate function with better error handling
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

  // Update translation mutation with better error handling
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

  // Auto-translate single item with better error handling
  const autoTranslateItem = async (item: TranslatableItem, targetLang: string) => {
    console.log(`Auto-translating item ${item.id} to ${targetLang}`);
    setTranslatingItems(prev => new Set(prev).add(item.id));
    
    try {
      const translations: Record<string, string> = {};
      const metadata = item.translation_metadata || {};
      
      // Check if name needs translation
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
      
      // Check if description needs translation
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

  // Auto-translate all items for selected language
  const autoTranslateAll = async () => {
    console.log(`Starting bulk translation to ${selectedLanguage}`);
    setBulkTranslating(true);
    
    try {
      const allItems = [
        ...categories.map(cat => ({ ...cat, type: 'category' as const })),
        ...menuItems.map(item => ({ ...item, type: 'menu_item' as const }))
      ];
      
      console.log(`Found ${allItems.length} items to potentially translate`);
      
      let translated = 0;
      for (const item of allItems) {
        const nameField = `name_${selectedLanguage}` as keyof TranslatableItem;
        const descField = `description_${selectedLanguage}` as keyof TranslatableItem;
        const hasNameTranslation = item[nameField];
        const hasDescTranslation = !item.description || item[descField];
        
        if (!hasNameTranslation || !hasDescTranslation) {
          console.log(`Translating item: ${item.name}`);
          await autoTranslateItem(item, selectedLanguage);
          translated++;
        }
      }
      
      toast({
        title: 'Përkthimi automatik u përfundua',
        description: `U përkthyen ${translated} artikuj në ${LANGUAGE_OPTIONS.find(l => l.code === selectedLanguage)?.name}`
      });
    } catch (error: any) {
      console.error('Bulk translation error:', error);
      toast({
        title: 'Gabim në përkthimin automatik',
        description: error.message || 'Ka ndodhur një gabim',
        variant: 'destructive'
      });
    } finally {
      setBulkTranslating(false);
    }
  };

  const handleTranslationChange = (itemId: string, field: string, value: string) => {
    setEditingTranslations(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const saveTranslations = (item: TranslatableItem) => {
    const translations = editingTranslations[item.id] || {};
    if (Object.keys(translations).length > 0) {
      // Mark as manually edited
      const metadata = item.translation_metadata || {};
      Object.keys(translations).forEach(field => {
        metadata[field] = {
          status: 'manually_edited',
          timestamp: new Date().toISOString(),
          source: 'manual'
        };
      });
      
      updateTranslationMutation.mutate({
        id: item.id,
        type: item.type,
        translations,
        metadata
      });
      setEditingTranslations(prev => {
        const newState = { ...prev };
        delete newState[item.id];
        return newState;
      });
    }
  };

  // Get translation status
  const getTranslationStatus = (item: TranslatableItem, field: string): TranslationStatus | null => {
    return item.translation_metadata?.[field] || null;
  };

  const getTranslationValue = (item: TranslatableItem, field: string) => {
    const editingValue = editingTranslations[item.id]?.[field];
    if (editingValue !== undefined) return editingValue;
    return (item as any)[field] || '';
  };

  // Render translation status badge
  const renderTranslationStatus = (item: TranslatableItem, field: string) => {
    const status = getTranslationStatus(item, field);
    const value = getTranslationValue(item, field);
    
    if (!value) return null;
    
    if (!status) return null;
    
    switch (status.status) {
      case 'auto_translated':
        return <Badge variant="secondary" className="text-xs"><Wand2 className="h-3 w-3 mr-1" />Auto</Badge>;
      case 'manually_edited':
        return <Badge variant="default" className="text-xs"><Edit3 className="h-3 w-3 mr-1" />Manual</Badge>;
      case 'approved':
        return <Badge variant="default" className="text-xs bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      default:
        return null;
    }
  };

  const allItems: TranslatableItem[] = [
    ...categories.map(cat => ({ ...cat, type: 'category' as const })),
    ...menuItems.map(item => ({ ...item, type: 'menu_item' as const }))
  ];

  // Show error state if there are connection issues
  if (categoriesError || itemsError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Gabim në Lidhjen me Bazën e të Dhënave</h3>
          <p className="text-muted-foreground text-center mb-4">
            Nuk mund të lidhem me bazën e të dhënave të restorantit. Kontrolloni lidhjen tuaj.
          </p>
          <Button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['categories_translation'] });
              queryClient.invalidateQueries({ queryKey: ['menu_items_translation'] });
            }}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Rifresko
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (categoriesLoading || itemsLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Duke ngarkuar...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Menaxhimi i Përkthimeve</h2>
          <p className="text-muted-foreground">Ndrysho dhe përditëso përkthimet për çdo gjuhë</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={autoTranslateAll}
            disabled={bulkTranslating || allItems.length === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            {bulkTranslating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {bulkTranslating ? 'Duke përkthyer...' : 'Përkthe të Gjitha'}
          </Button>
          <div className="flex items-center gap-2">
            <Label htmlFor="language-select">Gjuha:</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {allItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  <span>{item.name} ({item.type === 'category' ? 'Kategori' : 'Artikull'})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => autoTranslateItem(item, selectedLanguage)}
                    disabled={translatingItems.has(item.id)}
                  >
                    {translatingItems.has(item.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Badge variant={item.type === 'category' ? 'default' : 'secondary'}>
                    {item.type === 'category' ? 'Kategori' : 'Artikull Menuje'}
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>
                Redaktoni përkthimin për gjuhën e zgjedhur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Emri në Anglisht (Burimi)</Label>
                  <Input
                    value={item.name}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Emri në {LANGUAGE_OPTIONS.find(l => l.code === selectedLanguage)?.name}</Label>
                    {renderTranslationStatus(item, `name_${selectedLanguage}`)}
                  </div>
                  <Input
                    value={getTranslationValue(item, `name_${selectedLanguage}`)}
                    onChange={(e) => handleTranslationChange(item.id, `name_${selectedLanguage}`, e.target.value)}
                    placeholder={`Përktheni "${item.name}" në ${LANGUAGE_OPTIONS.find(l => l.code === selectedLanguage)?.name}`}
                  />
                </div>
              </div>

              {item.description && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Përshkrimi në Anglisht (Burimi)</Label>
                    <Textarea
                      value={item.description}
                      disabled
                      className="bg-muted"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Përshkrimi në {LANGUAGE_OPTIONS.find(l => l.code === selectedLanguage)?.name}</Label>
                      {renderTranslationStatus(item, `description_${selectedLanguage}`)}
                    </div>
                    <Textarea
                      value={getTranslationValue(item, `description_${selectedLanguage}`)}
                      onChange={(e) => handleTranslationChange(item.id, `description_${selectedLanguage}`, e.target.value)}
                      placeholder={`Përktheni përshkrimin në ${LANGUAGE_OPTIONS.find(l => l.code === selectedLanguage)?.name}`}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {editingTranslations[item.id] && Object.keys(editingTranslations[item.id]).length > 0 && (
                <div className="flex justify-end">
                  <Button 
                    onClick={() => saveTranslations(item)}
                    disabled={updateTranslationMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateTranslationMutation.isPending ? 'Duke ruajtur...' : 'Ruaj Përkthimet'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {allItems.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Languages className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nuk ka artikuj për përkthim</h3>
            <p className="text-muted-foreground text-center">
              Shtoni kategori dhe artikuj menuje për t'i përkthyer në gjuhë të ndryshme
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
