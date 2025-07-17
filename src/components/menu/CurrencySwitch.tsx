
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CurrencySettings {
  id: string;
  default_currency: string;
  enabled_currencies: string[];
  exchange_rates: Record<string, number>;
}

const CURRENCY_OPTIONS = [{
  code: 'ALL',
  name: 'Albanian Lek',
  symbol: 'L',
  flag: '🇦🇱'
}, {
  code: 'EUR',
  name: 'Euro',
  symbol: '€',
  flag: '🇪🇺'
}, {
  code: 'USD',
  name: 'US Dollar',
  symbol: '$',
  flag: '🇺🇸'
}, {
  code: 'GBP',
  name: 'British Pound',
  symbol: '£',
  flag: '🇬🇧'
}, {
  code: 'CHF',
  name: 'Swiss Franc',
  symbol: 'CHF',
  flag: '🇨🇭'
}];

interface CurrencySwitchProps {
  restaurantSupabase: any;
  currentCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

export function CurrencySwitch({
  restaurantSupabase,
  currentCurrency,
  onCurrencyChange
}: CurrencySwitchProps) {
  // Fetch currency settings with shorter stale time for better reactivity
  const {
    data: currencySettings
  } = useQuery({
    queryKey: ['currency_settings_menu'],
    queryFn: async () => {
      if (!restaurantSupabase) return null;
      const {
        data,
        error
      } = await restaurantSupabase.from('currency_settings').select('*').maybeSingle();
      if (error) {
        console.error('Currency settings fetch error:', error);
        return null;
      }
      return data as CurrencySettings | null;
    },
    enabled: !!restaurantSupabase,
    staleTime: 30 * 1000, // Reduced to 30 seconds for faster updates
    refetchInterval: 60 * 1000 // Refetch every minute to catch dashboard changes
  });

  const enabledCurrencies = currencySettings?.enabled_currencies || ['ALL', 'EUR'];
  const currentCurrencyData = CURRENCY_OPTIONS.find(curr => curr.code === currentCurrency);

  // Auto-switch to default currency if current currency is not enabled
  useEffect(() => {
    if (currencySettings?.default_currency && 
        !enabledCurrencies.includes(currentCurrency)) {
      onCurrencyChange(currencySettings.default_currency);
    }
  }, [currencySettings, enabledCurrencies, currentCurrency, onCurrencyChange]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 bg-muted/50 border-border hover:bg-muted text-foreground rounded-md flex items-center gap-1"
        >
          <span className="text-sm">{currentCurrencyData?.flag}</span>
          <span className="text-xs font-medium">{currentCurrency}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="end">
        <div className="space-y-0">
          {enabledCurrencies.map(currCode => {
            const currency = CURRENCY_OPTIONS.find(c => c.code === currCode);
            if (!currency) return null;
            return (
              <Button 
                key={currency.code} 
                variant={currentCurrency === currency.code ? "default" : "ghost"} 
                size="sm" 
                className="w-full justify-start gap-2 h-8 text-xs rounded-sm"
                onClick={() => onCurrencyChange(currency.code)}
              >
                <span>{currency.flag}</span>
                <span>{currency.code}</span>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
