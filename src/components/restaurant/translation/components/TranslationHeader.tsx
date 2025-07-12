
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2 } from 'lucide-react';
import { LANGUAGE_OPTIONS } from '../types';

interface TranslationHeaderProps {
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  onAutoTranslateAll: () => void;
  bulkTranslating: boolean;
  itemsCount: number;
}

export function TranslationHeader({
  selectedLanguage,
  setSelectedLanguage,
  onAutoTranslateAll,
  bulkTranslating,
  itemsCount
}: TranslationHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Menaxhimi i Përkthimeve</h2>
        <p className="text-muted-foreground">Ndrysho dhe përditëso përkthimet për çdo gjuhë</p>
      </div>
      <div className="flex items-center gap-4">
        <Button
          onClick={onAutoTranslateAll}
          disabled={bulkTranslating || itemsCount === 0}
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
  );
}
