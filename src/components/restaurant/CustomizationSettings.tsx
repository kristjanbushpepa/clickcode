import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, Palette, Layout, Save, Moon, Sun } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getRestaurantInfo, getRestaurantSupabase } from '@/utils/restaurantDatabase';

interface MenuTheme {
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
}

const defaultThemes = {
  light: {
    mode: 'light' as const,
    primaryColor: '#1f2937',
    accentColor: '#3b82f6'
  },
  dark: {
    mode: 'dark' as const,
    primaryColor: '#f8fafc',
    accentColor: '#60a5fa'
  }
};

export function CustomizationSettings() {
  const { toast } = useToast();
  const [selectedLayout, setSelectedLayout] = useState<'categories' | 'items'>('categories');
  const [customTheme, setCustomTheme] = useState<MenuTheme>(defaultThemes.light);
  const [selectedPreset, setSelectedPreset] = useState<string>('light');

  // Load existing customization on component mount
  useEffect(() => {
    const loadCustomization = async () => {
      try {
        const supabase = getRestaurantSupabase();
        const { data, error } = await supabase
          .from('restaurant_customization')
          .select('*')
          .single();

        if (data && !error) {
          if (data.theme) {
            setCustomTheme(data.theme);
            setSelectedPreset(data.preset || 'light');
          }
          if (data.layout) {
            setSelectedLayout(data.layout);
          }
        }
      } catch (error) {
        console.log('No existing customization found, using defaults');
      }
    };

    loadCustomization();
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
    try {
      const supabase = getRestaurantSupabase();
      
      const customizationData = {
        theme: customTheme,
        layout: selectedLayout,
        preset: selectedPreset,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('restaurant_customization')
        .upsert(customizationData, { 
          onConflict: 'id'
        });

      if (error) {
        console.error('Database save error:', error);
        localStorage.setItem('menu_theme', JSON.stringify(customTheme));
        localStorage.setItem('menu_layout', selectedLayout);
        
        toast({
          title: 'Personalizimi u ruajt lokalisht',
          description: 'Ndryshimet tuaja janë ruajtur në pajisjen tuaj.',
        });
      } else {
        toast({
          title: 'Personalizimi u ruajt',
          description: 'Ndryshimet tuaja janë ruajtur me sukses.',
        });
      }
    } catch (error) {
      console.error('Error saving customization:', error);
      localStorage.setItem('menu_theme', JSON.stringify(customTheme));
      localStorage.setItem('menu_layout', selectedLayout);
      
      toast({
        title: 'Personalizimi u ruajt lokalisht',
        description: 'Ndryshimet tuaja janë ruajtur në pajisjen tuaj.',
      });
    }
  };

  const getPreviewUrl = () => {
    const restaurantInfo = getRestaurantInfo();
    if (!restaurantInfo) return '#';
    
    const { id } = restaurantInfo;
    return `/menu/${id}?layout=${selectedLayout}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Personalizimi i Menusë</h1>
          <p className="text-muted-foreground">Personalizoni pamjen dhe ngjyrat e menusë suaj dixhitale</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open(getPreviewUrl(), '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Shiko Parapamjen
          </Button>
          <Button onClick={saveCustomization}>
            <Save className="h-4 w-4 mr-2" />
            Ruaj Ndryshimet
          </Button>
        </div>
      </div>

      <Tabs defaultValue="layout" className="space-y-6">
        <TabsList>
          <TabsTrigger value="layout">
            <Layout className="h-4 w-4 mr-2" />
            Dizajni
          </TabsTrigger>
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Ngjyrat
          </TabsTrigger>
        </TabsList>

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
                      <div className="w-6 h-6 rounded bg-gray-800"></div>
                      <div className="w-6 h-6 rounded bg-blue-500"></div>
                      <div className="w-6 h-6 rounded bg-white border"></div>
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
                      <div className="w-6 h-6 rounded bg-gray-900"></div>
                      <div className="w-6 h-6 rounded bg-blue-400"></div>
                      <div className="w-6 h-6 rounded bg-gray-100"></div>
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
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 rounded-lg border">
                <div className="space-y-3">
                  <div 
                    className="text-white p-3 rounded"
                    style={{ backgroundColor: customTheme.primaryColor }}
                  >
                    <h3 className="font-bold">Restoranti Juaj</h3>
                    <p className="text-sm opacity-90">Shembull i header-it të menusë</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Antipastet</h4>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                      <div>
                        <p className="font-medium">Sallatë Cezar</p>
                        <p className="text-sm text-muted-foreground">Sallatë e freskët me parmezan</p>
                      </div>
                      <span 
                        className="font-bold px-2 py-1 rounded"
                        style={{ 
                          color: customTheme.accentColor,
                          backgroundColor: customTheme.accentColor + '20' 
                        }}
                      >
                        800 ALL
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
