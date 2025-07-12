import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CurrencySettings } from './CurrencySettings';
import { LanguageSettings } from './LanguageSettings';
import { PopupSettings } from './PopupSettings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, Palette, Layout, Save, Moon, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getRestaurantSupabase, getRestaurantInfo } from '@/utils/restaurantDatabase';

interface MenuTheme {
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardBackground: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
}

const defaultThemes = {
  light: {
    mode: 'light' as const,
    primaryColor: '#1f2937',
    accentColor: '#3b82f6',
    backgroundColor: '#ffffff',
    cardBackground: '#ffffff',
    textColor: '#1f2937',
    mutedTextColor: '#6b7280',
    borderColor: '#e5e7eb'
  },
  dark: {
    mode: 'dark' as const,
    primaryColor: '#1e293b',
    accentColor: '#60a5fa',
    backgroundColor: '#0f172a',
    cardBackground: '#1e293b',
    textColor: '#f8fafc',
    mutedTextColor: '#94a3b8',
    borderColor: '#334155'
  }
};

export function CustomizationSettings() {
  const { toast } = useToast();
  const [selectedLayout, setSelectedLayout] = useState<'categories' | 'items'>('categories');
  const [customTheme, setCustomTheme] = useState<MenuTheme>(defaultThemes.light);
  const [selectedPreset, setSelectedPreset] = useState<string>('light');
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Load existing customization and restaurant info on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get restaurant name from admin database (same as QR code)
        const restaurantInfo = getRestaurantInfo();
        if (restaurantInfo?.name) {
          setRestaurantName(restaurantInfo.name);
        }

        const supabase = getRestaurantSupabase();

        // Load customization settings from individual restaurant database
        const { data, error } = await supabase
          .from('restaurant_customization')
          .select('*')
          .maybeSingle();

        if (data && !error) {
          console.log('Loaded customization data:', data);
          if (data.theme) {
            setCustomTheme(data.theme);
            setSelectedPreset(data.preset || 'light');
          }
          if (data.layout) {
            setSelectedLayout(data.layout);
          }
        } else if (error) {
          console.error('Error loading customization:', error);
        }
      } catch (error) {
        console.error('Error in loadData:', error);
      }
    };

    loadData();
  }, []);

  const handleThemeChange = (key: keyof MenuTheme, value: string) => {
    setCustomTheme(prev => ({ ...prev, [key]: value }));
    setSelectedPreset('custom');
  };

  const applyPresetTheme = (preset: string) => {
    if (preset !== 'custom' && defaultThemes[preset as keyof typeof defaultThemes]) {
      setCustomTheme(defaultThemes[preset as keyof typeof defaultThemes]);
      setSelectedPreset(preset);
    }
  };

  const saveCustomization = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const supabase = getRestaurantSupabase();
      
      const customizationData = {
        theme: customTheme,
        layout: selectedLayout,
        preset: selectedPreset,
        updated_at: new Date().toISOString()
      };

      console.log('Saving customization data:', customizationData);

      // First try to get existing record
      const { data: existingData, error: fetchError } = await supabase
        .from('restaurant_customization')
        .select('id')
        .maybeSingle();

      let result;
      if (existingData?.id) {
        // Update existing record
        result = await supabase
          .from('restaurant_customization')
          .update(customizationData)
          .eq('id', existingData.id);
      } else {
        // Insert new record
        result = await supabase
          .from('restaurant_customization')
          .insert([customizationData]);
      }

      const { error } = result;

      if (error) {
        console.error('Database save error:', error);
        // Fallback to localStorage
        localStorage.setItem('menu_theme', JSON.stringify(customTheme));
        localStorage.setItem('menu_layout', selectedLayout);
        localStorage.setItem('menu_preset', selectedPreset);
        
        toast({
          title: 'Personalizimi u ruajt lokalisht',
          description: 'Ndryshimet tuaja janë ruajtur në pajisjen tuaj.',
        });
      } else {
        console.log('Successfully saved to database');
        toast({
          title: 'Personalizimi u ruajt',
          description: 'Ndryshimet tuaja janë ruajtur me sukses.',
        });
      }
    } catch (error) {
      console.error('Error saving customization:', error);
      // Fallback to localStorage
      localStorage.setItem('menu_theme', JSON.stringify(customTheme));
      localStorage.setItem('menu_layout', selectedLayout);
      localStorage.setItem('menu_preset', selectedPreset);
      
      toast({
        title: 'Personalizimi u ruajt lokalisht',
        description: 'Ndryshimet tuaja janë ruajtur në pajisjen tuaj.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPreviewUrl = () => {
    if (!restaurantName) return '#';
    
    // Convert restaurant name to URL-friendly format (same as QR code)
    const urlFriendlyName = restaurantName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    return `/menu/${urlFriendlyName}?layout=${selectedLayout}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Personalizimi i Menusë</h1>
          <p className="text-muted-foreground">Personalizoni pamjen dhe ngjyrat e menusë suaj dixhitale</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open(getPreviewUrl(), '_blank')} disabled={!restaurantName}>
            <Eye className="h-4 w-4 mr-2" />
            Shiko Parapamjen
          </Button>
          <Button onClick={saveCustomization} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Ngjyrat & Tema
          </TabsTrigger>
          <TabsTrigger value="layout">
            <Layout className="h-4 w-4 mr-2" />
            Dizajni
          </TabsTrigger>
          <TabsTrigger value="popup">
            Popup & Wheel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tema e Ngjyrave</CardTitle>
              <CardDescription>
                Zgjidhni një temë ngjyrash për menunë tuaj
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPreset === 'light' ? 'border-primary' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => applyPresetTheme('light')}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sun className="h-5 w-5 text-yellow-500" />
                      <h3 className="font-semibold">Light Mode</h3>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-6 h-6 rounded bg-white border"></div>
                      <div className="w-6 h-6 rounded bg-gray-100"></div>
                      <div className="w-6 h-6 rounded bg-gray-800"></div>
                      <div className="w-6 h-6 rounded bg-blue-500"></div>
                    </div>
                    <p className="text-sm text-muted-foreground">Sfond i bardhë me tekst të errët</p>
                  </div>
                </div>

                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPreset === 'dark' ? 'border-primary' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => applyPresetTheme('dark')}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Moon className="h-5 w-5 text-blue-400" />
                      <h3 className="font-semibold">Dark Mode</h3>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-6 h-6 rounded bg-slate-900"></div>
                      <div className="w-6 h-6 rounded bg-slate-700"></div>
                      <div className="w-6 h-6 rounded bg-slate-100"></div>
                      <div className="w-6 h-6 rounded bg-blue-400"></div>
                    </div>
                    <p className="text-sm text-muted-foreground">Sfond i errët me tekst të bardhë</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ngjyrat e Personalizuara</CardTitle>
              <CardDescription>
                Personalizoni ngjyrat për temën e zgjedhur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Ngjyra Kryesore</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={customTheme.primaryColor}
                      onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.primaryColor}
                      onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                      placeholder="#1f2937"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">Ngjyra e Theksuar</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={customTheme.accentColor}
                      onChange={(e) => handleThemeChange('accentColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.accentColor}
                      onChange={(e) => handleThemeChange('accentColor', e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Ngjyra e Sfondit</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={customTheme.backgroundColor}
                      onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.backgroundColor}
                      onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardBackground">Ngjyra e Kartave</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cardBackground"
                      type="color"
                      value={customTheme.cardBackground}
                      onChange={(e) => handleThemeChange('cardBackground', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.cardBackground}
                      onChange={(e) => handleThemeChange('cardBackground', e.target.value)}
                      placeholder="#f8fafc"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="mt-6 p-4 rounded-lg border overflow-hidden">
                <h4 className="font-semibold mb-3">Parapamja e Menusë</h4>
                <div 
                  className="rounded-lg p-4 space-y-3"
                  style={{ 
                    backgroundColor: customTheme.backgroundColor,
                    color: customTheme.textColor,
                    border: `1px solid ${customTheme.borderColor}`
                  }}
                >
                  {/* Header Preview */}
                  <div 
                    className="text-white p-3 rounded-lg"
                    style={{ backgroundColor: customTheme.primaryColor }}
                  >
                    <h3 className="font-bold">{restaurantName || 'Restoranti Juaj'}</h3>
                    <p className="text-sm opacity-90">Adresa, Qyteti</p>
                  </div>
                  
                  {/* Menu Items Preview */}
                  <div className="space-y-2">
                    <h4 className="font-semibold" style={{ color: customTheme.textColor }}>
                      Antipastet
                    </h4>
                    <div 
                      className="p-3 rounded-lg"
                      style={{ 
                        backgroundColor: customTheme.cardBackground,
                        border: `1px solid ${customTheme.borderColor}`
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium" style={{ color: customTheme.textColor }}>
                            Sallatë Cezar
                          </p>
                          <p className="text-sm" style={{ color: customTheme.mutedTextColor }}>
                            Sallatë e freskët me parmezan dhe kroton
                          </p>
                        </div>
                        <span 
                          className="font-bold px-2 py-1 rounded text-sm"
                          style={{ 
                            color: customTheme.accentColor,
                            backgroundColor: customTheme.accentColor + '20' 
                          }}
                        >
                          800 ALL
                        </span>
                      </div>
                    </div>
                    
                    <div 
                      className="p-3 rounded-lg"
                      style={{ 
                        backgroundColor: customTheme.cardBackground,
                        border: `1px solid ${customTheme.borderColor}`
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium" style={{ color: customTheme.textColor }}>
                            Bruschetta
                          </p>
                          <p className="text-sm" style={{ color: customTheme.mutedTextColor }}>
                            Bukë e pjekur me domate dhe borzilok
                          </p>
                        </div>
                        <span 
                          className="font-bold px-2 py-1 rounded text-sm"
                          style={{ 
                            color: customTheme.accentColor,
                            backgroundColor: customTheme.accentColor + '20' 
                          }}
                        >
                          650 ALL
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Zgjidhni Layoutin e Menusë</CardTitle>
              <CardDescription>
                Zgjidhni se si dëshironi që menuja juaj të shfaqet për klientët
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedLayout === 'categories' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedLayout('categories')}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Shfaqje me Kategori</h3>
                      {selectedLayout === 'categories' && (
                        <Badge variant="default">E Zgjedhur</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Kategoritë shfaqen si karta të mëdha me një përshkrim të shkurtër të artikujve
                    </p>
                    
                    {/* Preview */}
                    <div className="bg-muted/30 rounded p-3 mt-3">
                      <div className="space-y-2">
                        <div className="bg-background rounded p-2">
                          <div className="h-2 bg-primary/20 rounded mb-1"></div>
                          <div className="space-y-1">
                            <div className="h-1 bg-muted rounded w-3/4"></div>
                            <div className="h-1 bg-muted rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="bg-background rounded p-2">
                          <div className="h-2 bg-primary/20 rounded mb-1"></div>
                          <div className="space-y-1">
                            <div className="h-1 bg-muted rounded w-2/3"></div>
                            <div className="h-1 bg-muted rounded w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedLayout === 'items' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedLayout('items')}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Lista e Artikujve</h3>
                      {selectedLayout === 'items' && (
                        <Badge variant="default">E Zgjedhur</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Të gjithë artikujt shfaqen në një listë me filtra kategorie në krye
                    </p>
                    
                    {/* Preview */}
                    <div className="bg-muted/30 rounded p-3 mt-3">
                      <div className="flex gap-1 mb-2">
                        <div className="h-1 bg-primary/30 rounded w-12"></div>
                        <div className="h-1 bg-muted rounded w-10"></div>
                        <div className="h-1 bg-muted rounded w-8"></div>
                      </div>
                      <div className="space-y-1">
                        <div className="bg-background rounded p-1 flex justify-between">
                          <div className="h-1 bg-muted rounded w-1/2"></div>
                          <div className="h-1 bg-primary/20 rounded w-8"></div>
                        </div>
                        <div className="bg-background rounded p-1 flex justify-between">
                          <div className="h-1 bg-muted rounded w-2/3"></div>
                          <div className="h-1 bg-primary/20 rounded w-8"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="popup">
          <PopupSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
