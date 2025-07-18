
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
  const currentSizes = item[sizesField] as any[] || [];

  const hasUnsavedChanges = Object.keys(currentTranslations).length > 0;

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
            <div className="grid grid-cols-2 gap-2">
              {item.sizes.map((size, index) => {
                const translatedSize = currentSizes[index];
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Origjinali: {size.name}</span>
                      <span>{size.price} ALL</span>
                    </div>
                    <Input
                      value={translatedSize?.name || ''}
                      onChange={(e) => {
                        const updatedSizes = [...currentSizes];
                        updatedSizes[index] = {
                          name: e.target.value,
                          price: size.price
                        };
                        onTranslationChange(item.id, `sizes_${selectedLanguage}`, JSON.stringify(updatedSizes));
                      }}
                      placeholder={`Përktheni "${size.name}"`}
                      className="text-xs"
                    />
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
