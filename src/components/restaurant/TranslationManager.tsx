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
import { Languages, Edit3, Save, RefreshCw } from 'lucide-react';

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
  type: 'category' | 'menu_item';
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

  // Fetch categories and menu items for translation
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories_translation'],
    queryFn: async () => {
      const restaurantSupabase = getRestaurantSupabase();
      const { data, error } = await restaurantSupabase
        .from('categories')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: menuItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['menu_items_translation'],
    queryFn: async () => {
      const restaurantSupabase = getRestaurantSupabase();
      const { data, error } = await restaurantSupabase
        .from('menu_items')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Update translation mutation
  const updateTranslationMutation = useMutation({
    mutationFn: async ({ id, type, translations }: { id: string; type: 'category' | 'menu_item'; translations: Record<string, string> }) => {
      const restaurantSupabase = getRestaurantSupabase();
      const tableName = type === 'category' ? 'categories' : 'menu_items';
      
      const { data, error } = await restaurantSupabase
        .from(tableName)
        .update(translations)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: [`${type === 'category' ? 'categories' : 'menu_items'}_translation`] });
      toast({ title: 'Përkthimi u përditësua me sukses' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Gabim në përditësimin e përkthimit', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

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
      updateTranslationMutation.mutate({
        id: item.id,
        type: item.type,
        translations
      });
      setEditingTranslations(prev => {
        const newState = { ...prev };
        delete newState[item.id];
        return newState;
      });
    }
  };

  const getTranslationValue = (item: TranslatableItem, field: string) => {
    const editingValue = editingTranslations[item.id]?.[field];
    if (editingValue !== undefined) return editingValue;
    return (item as any)[field] || '';
  };

  const allItems: TranslatableItem[] = [
    ...categories.map(cat => ({ ...cat, type: 'category' as const })),
    ...menuItems.map(item => ({ ...item, type: 'menu_item' as const }))
  ];

  if (categoriesLoading || itemsLoading) {
    return <div className="flex justify-center p-8">Duke ngarkuar...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Menaxhimi i Përkthimeve</h2>
          <p className="text-muted-foreground">Ndrysho dhe përditëso përkthimet për çdo gjuhë</p>
        </div>
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

      <div className="grid gap-6">
        {allItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  <span>{item.name} ({item.type === 'category' ? 'Kategori' : 'Artikull'})</span>
                </div>
                <Badge variant={item.type === 'category' ? 'default' : 'secondary'}>
                  {item.type === 'category' ? 'Kategori' : 'Artikull Menuje'}
                </Badge>
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
                  <Label>Emri në {LANGUAGE_OPTIONS.find(l => l.code === selectedLanguage)?.name}</Label>
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
                    <Label>Përshkrimi në {LANGUAGE_OPTIONS.find(l => l.code === selectedLanguage)?.name}</Label>
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