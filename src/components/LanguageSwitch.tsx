import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSwitch = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('en')}
        className="text-sm"
      >
        EN
      </Button>
      <Button
        variant={language === 'sq' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('sq')}
        className="text-sm"
      >
        SQ
      </Button>
    </div>
  );
};

export default LanguageSwitch;