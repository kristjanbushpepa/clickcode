
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { DollarSign, RefreshCw } from 'lucide-react';

interface CurrencySettings {
  id: string;
  default_currency: string;
  supported_currencies: string[];
  enabled_currencies: string[];
  exchange_rates: Record<string, number>;
  last_updated: string;
}

export function CurrencySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // Default currency configuration - this would come from admin database in the future
  const CURRENCY_OPTIONS = [
    { code: 'ALL', name: 'Albanian Lek', symbol: 'L', flag: '🇦🇱' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' }
  ];

  // Fetch restaurant's currency settings from individual restaurant database
  const { data: currencySettings, isLoading, error: queryError } = useQuery({
    queryKey: ['currency_settings'],
    queryFn: async () => {
      const restaurantSupabase = getRestaurantSupabase();
      console.log('Fetching currency settings...');
      
      const { data, error } = await restaurantSupabase
        .from('currency_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error) {
        console.error('Currency settings query error:', error);
        throw error;
      }
      
      console.log('Currency settings fetched:', data);
      return data as CurrencySettings | null;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 3
  });

  // Update currency settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<CurrencySettings>) => {
      const restaurantSupabase = getRestaurantSupabase();
      console.log('Updating currency settings:', updates);
      
      if (currencySettings?.id) {
        // Update existing record
        const { data, error } = await restaurantSupabase
          .from('currency_settings')
          .update({ ...updates, last_updated: new Date().toISOString() })
          .eq('id', currencySettings.id)
          .select()
          .maybeSingle();
        
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Updated currency settings:', data);
        return data;
      } else {
        // Insert new record with default values
        const defaultValues = {
          default_currency: 'ALL',
          supported_currencies: ['ALL', 'EUR', 'USD', 'GBP', 'CHF'],
          enabled_currencies: ['ALL', 'EUR', 'USD', 'GBP', 'CHF'],
          exchange_rates: {
            'ALL': 1,
            'EUR': 95,   // 1 EUR = 95 ALL
            'USD': 90,   // 1 USD = 90 ALL  
            'GBP': 115,  // 1 GBP = 115 ALL
            'CHF': 100   // 1 CHF = 100 ALL
          },
          ...updates
        };
        
        const { data, error } = await restaurantSupabase
          .from('currency_settings')
          .insert([{ ...defaultValues, last_updated: new Date().toISOString() }])
          .select()
          .maybeSingle();
        
        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        console.log('Inserted currency settings:', data);
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currency_settings'] });
      toast({ title: 'Cilësimet e monedhës u përditësuan me sukses' });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({ 
        title: 'Gabim në përditësimin e cilësimeve', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  React.useEffect(() => {
    if (currencySettings?.exchange_rates) {
      setExchangeRates(currencySettings.exchange_rates);
      // Initialize input values with the actual exchange rates
      const initialInputValues: Record<string, string> = {};
      Object.entries(currencySettings.exchange_rates).forEach(([currency, rate]) => {
        initialInputValues[currency] = rate.toString();
      });
      setInputValues(initialInputValues);
    }
  }, [currencySettings]);

  const handleDefaultCurrencyChange = (currency: string) => {
    updateSettingsMutation.mutate({ 
      default_currency: currency,
      supported_currencies: currencySettings?.supported_currencies || ['ALL', 'EUR', 'USD', 'GBP', 'CHF'],
      enabled_currencies: currencySettings?.enabled_currencies || ['ALL', 'EUR', 'USD', 'GBP', 'CHF'],
      exchange_rates: exchangeRates
    });
  };

  const handleCurrencyToggle = (currency: string) => {
    const currentEnabled = currencySettings?.enabled_currencies || ['ALL', 'EUR', 'USD', 'GBP', 'CHF'];
    const newEnabled = currentEnabled.includes(currency)
      ? currentEnabled.filter(c => c !== currency)
      : [...currentEnabled, currency];
    
    updateSettingsMutation.mutate({
      default_currency: currencySettings?.default_currency || 'ALL',
      supported_currencies: currencySettings?.supported_currencies || ['ALL', 'EUR', 'USD', 'GBP', 'CHF'],
      enabled_currencies: newEnabled,
      exchange_rates: exchangeRates
    });
  };

  const handleExchangeRateInputChange = (currency: string, value: string) => {
    // Update the input value immediately for better UX
    setInputValues(prev => ({ ...prev, [currency]: value }));
    
    // Only update the actual exchange rate if it's a valid number
    const numericRate = parseFloat(value);
    if (!isNaN(numericRate) && numericRate > 0) {
      setExchangeRates(prev => ({ ...prev, [currency]: numericRate }));
    }
  };

  const handleSaveRates = () => {
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

    updateSettingsMutation.mutate({
      default_currency: currencySettings?.default_currency || 'ALL',
      supported_currencies: currencySettings?.supported_currencies || ['ALL', 'EUR', 'USD', 'GBP', 'CHF'],
      enabled_currencies: currencySettings?.enabled_currencies || ['ALL', 'EUR', 'USD', 'GBP', 'CHF'],
      exchange_rates: validatedRates
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Duke ngarkuar...</div>;
  }

  if (queryError) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <p className="text-destructive">Gabim në ngarkimin e cilësimeve të monedhës</p>
          <p className="text-sm text-muted-foreground mt-2">{(queryError as Error).message}</p>
          <Button 
            variant="outline" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['currency_settings'] })}
            className="mt-4"
          >
            Provo përsëri
          </Button>
        </div>
      </div>
    );
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
                value={currencySettings?.default_currency || 'ALL'}
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
              Të gjitha çmimet e menusë ruhen në {currencySettings?.default_currency || 'ALL'} dhe shfaqen në monedhat e tjera sipas kurseve të këmbimit.
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
              Vendosni sa lek albanë vlen 1 njësi e secilit monedhë (p.sh. 1 EUR = 95 ALL)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {CURRENCY_OPTIONS.map((currency) => {
              const isBaseCurrency = currency.code === (currencySettings?.default_currency || 'ALL');
              const isEnabled = currencySettings?.enabled_currencies?.includes(currency.code) ?? true;
              const inputValue = isBaseCurrency ? '1' : (inputValues[currency.code] || '0');
              
              return (
                <div key={currency.code} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isEnabled}
                      onCheckedChange={() => handleCurrencyToggle(currency.code)}
                      disabled={isBaseCurrency}
                      className="w-4 h-4"
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currency.symbol}</span>
                      <span className="text-sm">{currency.code}</span>
                      <span className="text-xs text-muted-foreground">{currency.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">1 {currency.code} =</span>
                    <Input
                      type="text"
                      step="any"
                      className="w-28"
                      value={inputValue}
                      onChange={(e) => handleExchangeRateInputChange(currency.code, e.target.value)}
                      disabled={isBaseCurrency || !isEnabled}
                      placeholder="1"
                    />
                    <span className="text-sm font-medium">{currencySettings?.default_currency || 'ALL'}</span>
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
