
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Languages, Wand2, Loader2, Save, Edit3, CheckCircle } from 'lucide-react';
import { TranslatableItem, TranslationStatus, LANGUAGE_OPTIONS } from '../types';

interface TranslationCardProps {
  item: TranslatableItem;
  selectedLanguage: string;
  editingTranslations: Record<string, Record<string, string>>;
  translatingItems: Set<string>;
  onTranslationChange: (itemId: string, field: string, value: string) => void;
  onAutoTranslateItem: (item: TranslatableItem, language: string) => void;
  onSaveTranslations: (item: TranslatableItem) => void;
  isUpdating: boolean;
}

export function TranslationCard({
  item,
  selectedLanguage,
  editingTranslations,
  translatingItems,
  onTranslationChange,
  onAutoTranslateItem,
  onSaveTranslations,
  isUpdating
}: TranslationCardProps) {
  const getTranslationStatus = (item: TranslatableItem, field: string): TranslationStatus | null => {
    return item.translation_metadata?.[field] || null;
  };

  const getTranslationValue = (item: TranslatableItem, field: string) => {
    const editingValue = editingTranslations[item.id]?.[field];
    if (editingValue !== undefined) return editingValue;
    return (item as any)[field] || '';
  };

  const renderTranslationStatus = (item: TranslatableItem, field: string) => {
    const status = getTranslationStatus(item, field);
    const value = getTranslationValue(item, field);
    
    if (!value || !status) return null;
    
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

  const selectedLanguageInfo = LANGUAGE_OPTIONS.find(l => l.code === selectedLanguage);

  return (
    <Card>
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
              onClick={() => onAutoTranslateItem(item, selectedLanguage)}
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
              <Label>Emri në {selectedLanguageInfo?.name}</Label>
              {renderTranslationStatus(item, `name_${selectedLanguage}`)}
            </div>
            <Input
              value={getTranslationValue(item, `name_${selectedLanguage}`)}
              onChange={(e) => onTranslationChange(item.id, `name_${selectedLanguage}`, e.target.value)}
              placeholder={`Përktheni "${item.name}" në ${selectedLanguageInfo?.name}`}
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
                <Label>Përshkrimi në {selectedLanguageInfo?.name}</Label>
                {renderTranslationStatus(item, `description_${selectedLanguage}`)}
              </div>
              <Textarea
                value={getTranslationValue(item, `description_${selectedLanguage}`)}
                onChange={(e) => onTranslationChange(item.id, `description_${selectedLanguage}`, e.target.value)}
                placeholder={`Përktheni përshkrimin në ${selectedLanguageInfo?.name}`}
                rows={3}
              />
            </div>
          </div>
        )}

        {editingTranslations[item.id] && Object.keys(editingTranslations[item.id]).length > 0 && (
          <div className="flex justify-end">
            <Button 
              onClick={() => onSaveTranslations(item)}
              disabled={isUpdating}
            >
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? 'Duke ruajtur...' : 'Ruaj Përkthimet'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
