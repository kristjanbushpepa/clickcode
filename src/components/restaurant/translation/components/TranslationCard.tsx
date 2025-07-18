
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, Languages, Save } from 'lucide-react';
import { TranslatableItem, LANGUAGE_OPTIONS } from '../types';

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
  const currentTranslations = editingTranslations[item.id] || {};
  const isTranslating = translatingItems.has(item.id);
  const languageData = LANGUAGE_OPTIONS.find(l => l.code === selectedLanguage);

  const nameField = `name_${selectedLanguage}` as keyof TranslatableItem;
  const descField = `description_${selectedLanguage}` as keyof TranslatableItem;
  const sizesField = `sizes_${selectedLanguage}` as keyof TranslatableItem;

  const currentName = currentTranslations[`name_${selectedLanguage}`] ?? (item[nameField] as string) ?? '';
  const currentDesc = currentTranslations[`description_${selectedLanguage}`] ?? (item[descField] as string) ?? '';
  
  // Parse sizes from translations or get existing localized sizes
  let currentSizes: any[] = [];
  try {
    if (currentTranslations[`sizes_${selectedLanguage}`]) {
      currentSizes = typeof currentTranslations[`sizes_${selectedLanguage}`] === 'string' 
        ? JSON.parse(currentTranslations[`sizes_${selectedLanguage}`])
        : currentTranslations[`sizes_${selectedLanguage}`];
    } else {
      currentSizes = (item[sizesField] as any[]) || [];
    }
  } catch (error) {
    console.error('Error parsing sizes:', error);
    currentSizes = [];
  }

  const hasUnsavedChanges = Object.keys(currentTranslations).length > 0;

  const handleSizeChange = (index: number, name: string) => {
    const updatedSizes = [...currentSizes];
    if (!updatedSizes[index]) {
      // If size doesn't exist, create it with price from original sizes
      const originalSize = item.sizes?.[index];
      updatedSizes[index] = {
        name: name,
        price: originalSize?.price || 0
      };
    } else {
      updatedSizes[index] = {
        ...updatedSizes[index],
        name: name
      };
    }
    onTranslationChange(item.id, `sizes_${selectedLanguage}`, JSON.stringify(updatedSizes));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{item.name}</CardTitle>
            <Badge variant={item.type === 'category' ? 'default' : 'secondary'}>
              {item.type === 'category' ? 'Kategori' : 'Artikull'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {languageData?.flag} {languageData?.name}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAutoTranslateItem(item, selectedLanguage)}
              disabled={isTranslating || isUpdating}
            >
              {isTranslating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Languages className="h-4 w-4 mr-2" />
              )}
              Përkthe Automatikisht
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name Translation */}
        <div className="space-y-2">
          <Label htmlFor={`name-${item.id}`}>Emri në {languageData?.name}</Label>
          <Input
            id={`name-${item.id}`}
            value={currentName}
            onChange={(e) => onTranslationChange(item.id, `name_${selectedLanguage}`, e.target.value)}
            placeholder={`Shkruani emrin në ${languageData?.name}...`}
          />
          {item.name && (
            <p className="text-xs text-muted-foreground">
              Origjinali: {item.name}
            </p>
          )}
        </div>

        {/* Description Translation */}
        {item.description && (
          <div className="space-y-2">
            <Label htmlFor={`desc-${item.id}`}>Përshkrimi në {languageData?.name}</Label>
            <Textarea
              id={`desc-${item.id}`}
              value={currentDesc}
              onChange={(e) => onTranslationChange(item.id, `description_${selectedLanguage}`, e.target.value)}
              placeholder={`Shkruani përshkrimin në ${languageData?.name}...`}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Origjinali: {item.description}
            </p>
          </div>
        )}

        {/* Sizes Translation */}
        {item.type === 'menu_item' && item.sizes && item.sizes.length > 0 && (
          <div className="space-y-2">
            <Label>Madhësitë në {languageData?.name}</Label>
            <div className="grid grid-cols-1 gap-3">
              {item.sizes.map((originalSize, index) => {
                const translatedSize = currentSizes[index];
                return (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Origjinali: <strong>{originalSize.name}</strong></span>
                      <span>{originalSize.price} ALL</span>
                    </div>
                    <Input
                      value={translatedSize?.name || ''}
                      onChange={(e) => handleSizeChange(index, e.target.value)}
                      placeholder={`Përktheni "${originalSize.name}" në ${languageData?.name}`}
                      className="text-sm"
                    />
                    <div className="text-xs text-muted-foreground">
                      Çmimi: {originalSize.price} ALL
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Save Button */}
        {hasUnsavedChanges && (
          <Button
            onClick={() => onSaveTranslations(item)}
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Ruaj Përkthimet
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
