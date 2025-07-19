
import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { DollarSign, RefreshCw } from 'lucide-react';

interface CurrencySettings {
  id: string;
  default_currency: string;
  supported_currencies: string[];
  enabled_currencies: string[];
  exchange_rates: Record<string, number>;
  last_updated: string;
}

const CURRENCY_OPTIONS = [
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' }
];

export function CurrencySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState<CurrencySettings | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch currency settings with stale time to avoid frequent refetches
  const { data: currencySettings, isLoading } = useQuery({
    queryKey: ['currency_settings'],
    queryFn: async () => {
      const restaurantSupabase = getRestaurantSupabase();
      const { data, error } = await restaurantSupabase
        .from('currency_settings')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      return data as CurrencySettings | null;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false // Don't refetch on window focus
  });

  // Update currency settings mutation with optimistic updates
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<CurrencySettings>) => {
      const restaurantSupabase = getRestaurantSupabase();
      
      if (currencySettings?.id) {
        // Update existing record
        const { data, error } = await restaurantSupabase
          .from('currency_settings')
          .update({ ...updates, last_updated: new Date().toISOString() })
          .eq('id', currencySettings.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert new record
        const { data, error } = await restaurantSupabase
          .from('currency_settings')
          .insert([{ ...updates, last_updated: new Date().toISOString() }])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onMutate: async (newSettings) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['currency_settings'] });
      
      // Snapshot previous value
      const previousSettings = queryClient.getQueryData(['currency_settings']);
      
      // Optimistically update
      queryClient.setQueryData(['currency_settings'], (old: CurrencySettings | null) => {
        return old ? { ...old, ...newSettings, last_updated: new Date().toISOString() } : null;
      });
      
      return { previousSettings };
    },
    onError: (error: any, variables, context) => {
      // Rollback on error
      if (context?.previousSettings) {
        queryClient.setQueryData(['currency_settings'], context.previousSettings);
      }
      toast({ 
        title: 'Gabim në përditësimin e cilësimeve', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
    onSuccess: () => {
      setHasChanges(false);
      toast({ title: 'Cilësimet e monedhës u përditësuan me sukses' });
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['currency_settings'] });
    }
  });

  // Initialize local state when data loads
  React.useEffect(() => {
    if (currencySettings && !localSettings) {
      setLocalSettings(currencySettings);
      const initialInputValues: Record<string, string> = {};
      Object.entries(currencySettings.exchange_rates || {}).forEach(([currency, rate]) => {
        initialInputValues[currency] = rate.toString();
      });
      setInputValues(initialInputValues);
    }
  }, [currencySettings, localSettings]);

  const handleDefaultCurrencyChange = useCallback((currency: string) => {
    const updates = { 
      default_currency: currency,
      supported_currencies: localSettings?.supported_currencies || ['ALL', 'EUR', 'USD', 'GBP', 'CHF'],
      enabled_currencies: localSettings?.enabled_currencies || ['ALL', 'EUR', 'USD', 'GBP', 'CHF'],
      exchange_rates: localSettings?.exchange_rates || {}
    };
    
    setLocalSettings(prev => prev ? { ...prev, ...updates } : null);
    updateSettingsMutation.mutate(updates);
  }, [localSettings, updateSettingsMutation]);

  const handleCurrencyToggle = useCallback((currency: string) => {
    const currentEnabled = localSettings?.enabled_currencies || ['ALL', 'EUR', 'USD', 'GBP', 'CHF'];
    const newEnabled = currentEnabled.includes(currency)
      ? currentEnabled.filter(c => c !== currency)
      : [...currentEnabled, currency];
    
    const updates = {
      default_currency: localSettings?.default_currency || 'ALL',
      supported_currencies: localSettings?.supported_currencies || ['ALL', 'EUR', 'USD', 'GBP', 'CHF'],
      enabled_currencies: newEnabled,
      exchange_rates: localSettings?.exchange_rates || {}
    };
    
    setLocalSettings(prev => prev ? { ...prev, ...updates } : null);
    updateSettingsMutation.mutate(updates);
  }, [localSettings, updateSettingsMutation]);

  const handleExchangeRateInputChange = useCallback((currency: string, value: string) => {
    // Update the input value immediately for better UX
    setInputValues(prev => ({ ...prev, [currency]: value }));
    setHasChanges(true);
    
    // Update local exchange rates if valid number
    const numericRate = parseFloat(value);
    if (!isNaN(numericRate) && numericRate > 0) {
      setLocalSettings(prev => prev ? {
        ...prev,
        exchange_rates: { ...prev.exchange_rates, [currency]: numericRate }
      } : null);
    }
  }, []);

  const handleSaveRates = useCallback(() => {
    // Validate all input values before saving
    const validatedRates: Record<string, number> = {};
    let hasInvalidRates = false;

    Object.entries(inputValues).forEach(([currency, value]) => {
      const numericRate = parseFloat(value);
      if (!isNaN(numericRate) && numericRate > 0) {
        validatedRates[currency] = numericRate;
      } else if (value.trim() !== '') {
        hasInvalidRates = true;
        toast({
          title: 'Gabim në kursin e këmbimit',
          description: `Kursi për ${currency} duhet të jetë një numër pozitiv`,
          variant: 'destructive'
        });
      }
    });

    if (hasInvalidRates) return;

    const updates = {
      default_currency: localSettings?.default_currency || 'ALL',
      supported_currencies: localSettings?.supported_currencies || ['ALL', 'EUR', 'USD', 'GBP', 'CHF'],
      enabled_currencies: localSettings?.enabled_currencies || ['ALL', 'EUR', 'USD', 'GBP', 'CHF'],
      exchange_rates: validatedRates
    };
    
    setLocalSettings(prev => prev ? { ...prev, ...updates } : null);
    updateSettingsMutation.mutate(updates);
  }, [inputValues, localSettings, updateSettingsMutation, toast]);

  if (isLoading) {
    return <div className="flex justify-center p-8">Duke ngarkuar...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Kontrolli i Monedhës</h2>
        <p className="text-muted-foreground">Menaxho monedhën kryesore dhe kurset e këmbimit</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Default Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Monedha Kryesore
            </CardTitle>
            <CardDescription>
              Zgjidhni monedhën kryesore për menunë tuaj
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-currency">Monedha Kryesore</Label>
              <Select
                value={localSettings?.default_currency || currencySettings?.default_currency || 'ALL'}
                onValueChange={handleDefaultCurrencyChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Zgjidhni monedhën" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Të gjitha çmimet e menusë ruhen në {localSettings?.default_currency || currencySettings?.default_currency || 'ALL'} dhe konvertohen automatikisht për monedhat e tjera.
            </div>
          </CardContent>
        </Card>

        {/* Exchange Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Kurset e Këmbimit
            </CardTitle>
            <CardDescription>
              Vendosni kurset manuale të këmbimit për monedhat e mbështetura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {CURRENCY_OPTIONS.map((currency) => {
              const defaultCurrency = localSettings?.default_currency || currencySettings?.default_currency || 'ALL';
              const isBaseCurrency = currency.code === defaultCurrency;
              const enabledCurrencies = localSettings?.enabled_currencies || currencySettings?.enabled_currencies || ['ALL', 'EUR', 'USD', 'GBP', 'CHF'];
              const isEnabled = enabledCurrencies.includes(currency.code);
              const inputValue = isBaseCurrency ? '1.000000' : (inputValues[currency.code] || '0');
              
              return (
                <div key={currency.code} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => handleCurrencyToggle(currency.code)}
                      disabled={isBaseCurrency}
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currency.symbol}</span>
                      <span className="text-sm">{currency.code}</span>
                      <span className="text-xs text-muted-foreground">{currency.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">1 {defaultCurrency} =</span>
                    <Input
                      type="text"
                      step="any"
                      className="w-28"
                      value={inputValue}
                      onChange={(e) => handleExchangeRateInputChange(currency.code, e.target.value)}
                      disabled={isBaseCurrency || !isEnabled}
                      placeholder="0.000000"
                    />
                    <span className="text-sm font-medium">{currency.code}</span>
                  </div>
                </div>
              );
            })}
            
            <div className="pt-4 border-t">
              <Button onClick={handleSaveRates} disabled={updateSettingsMutation.isPending}>
                {updateSettingsMutation.isPending ? 'Duke ruajtur...' : 'Ruaj Kurset'}
              </Button>
            </div>
            
            {currencySettings?.last_updated && (
              <div className="text-xs text-muted-foreground">
                Përditësuar së fundi: {new Date(currencySettings.last_updated).toLocaleString('sq-AL')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
