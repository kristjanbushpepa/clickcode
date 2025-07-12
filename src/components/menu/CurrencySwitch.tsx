
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CurrencySettings {
  id: string;
  default_currency: string;
  enabled_currencies: string[];
  exchange_rates: Record<string, number>;
}

const CURRENCY_OPTIONS = [
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' }
];

interface CurrencySwitchProps {
  restaurantSupabase: any;
  currentCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

export function CurrencySwitch({ restaurantSupabase, currentCurrency, onCurrencyChange }: CurrencySwitchProps) {
  // Fetch currency settings
  const { data: currencySettings } = useQuery({
    queryKey: ['currency_settings_menu'],
    queryFn: async () => {
      if (!restaurantSupabase) return null;
      
      const { data, error } = await restaurantSupabase
        .from('currency_settings')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('Currency settings fetch error:', error);
        return null;
      }
      return data as CurrencySettings | null;
    },
    enabled: !!restaurantSupabase
  });

  const enabledCurrencies = currencySettings?.enabled_currencies || ['ALL', 'EUR'];
  const currentCurrencyData = CURRENCY_OPTIONS.find(curr => curr.code === currentCurrency);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-foreground bg-background border-border hover:bg-accent hover:text-accent-foreground">
          <DollarSign className="h-4 w-4" />
          <span>{currentCurrencyData?.symbol}</span>
          <span className="hidden sm:inline">{currentCurrency}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="end">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Choose Currency</h4>
          {enabledCurrencies.map((currCode) => {
            const currency = CURRENCY_OPTIONS.find(c => c.code === currCode);
            if (!currency) return null;
            
            return (
              <Button
                key={currency.code}
                variant={currentCurrency === currency.code ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => onCurrencyChange(currency.code)}
              >
                <span>{currency.symbol}</span>
                <span>{currency.code} - {currency.name}</span>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
