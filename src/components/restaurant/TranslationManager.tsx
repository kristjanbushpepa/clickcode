
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { TranslatableItem, LANGUAGE_OPTIONS } from './translation/types';
import { useTranslationData } from './translation/hooks/useTranslationData';
import { useAutoTranslate } from './translation/hooks/useAutoTranslate';
import { TranslationHeader } from './translation/components/TranslationHeader';
import { TranslationCard } from './translation/components/TranslationCard';
import { ErrorState } from './translation/components/ErrorState';
import { EmptyState } from './translation/components/EmptyState';

export function TranslationManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState('sq');
  const [editingTranslations, setEditingTranslations] = useState<Record<string, Record<string, string>>>({});
  const [translatingItems, setTranslatingItems] = useState<Set<string>>(new Set());
  const [bulkTranslating, setBulkTranslating] = useState(false);

  const { categories, menuItems, isLoading, error } = useTranslationData();
  const { autoTranslateItem, updateTranslationMutation } = useAutoTranslate();

  const allItems: TranslatableItem[] = [
    ...categories.map(cat => ({ ...cat, type: 'category' as const })),
    ...menuItems.map(item => ({ ...item, type: 'menu_item' as const }))
  ];

  const autoTranslateAll = async () => {
    console.log(`Starting bulk translation to ${selectedLanguage}`);
    setBulkTranslating(true);
    
    try {
      console.log(`Found ${allItems.length} items to potentially translate`);
      
      let translated = 0;
      for (const item of allItems) {
        const nameField = `name_${selectedLanguage}` as keyof TranslatableItem;
        const descField = `description_${selectedLanguage}` as keyof TranslatableItem;
        const hasNameTranslation = item[nameField];
        const hasDescTranslation = !item.description || item[descField];
        
        if (!hasNameTranslation || !hasDescTranslation) {
          console.log(`Translating item: ${item.name}`);
          await autoTranslateItem(item, selectedLanguage, translatingItems, setTranslatingItems);
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

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['categories_translation'] });
    queryClient.invalidateQueries({ queryKey: ['menu_items_translation'] });
  };

  if (error) {
    return <ErrorState onRetry={handleRetry} />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Duke ngarkuar...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TranslationHeader
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        onAutoTranslateAll={autoTranslateAll}
        bulkTranslating={bulkTranslating}
        itemsCount={allItems.length}
      />

      <div className="grid gap-6">
        {allItems.map((item) => (
          <TranslationCard
            key={item.id}
            item={item}
            selectedLanguage={selectedLanguage}
            editingTranslations={editingTranslations}
            translatingItems={translatingItems}
            onTranslationChange={handleTranslationChange}
            onAutoTranslateItem={(item, language) => autoTranslateItem(item, language, translatingItems, setTranslatingItems)}
            onSaveTranslations={saveTranslations}
            isUpdating={updateTranslationMutation.isPending}
          />
        ))}
      </div>

      {allItems.length === 0 && <EmptyState />}
    </div>
  );
}
