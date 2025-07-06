
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, Palette, Layout, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MenuTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

const defaultThemes = {
  classic: {
    primaryColor: '#1f2937',
    secondaryColor: '#6b7280',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    accentColor: '#3b82f6'
  },
  warm: {
    primaryColor: '#dc2626',
    secondaryColor: '#f59e0b',
    backgroundColor: '#fef7ed',
    textColor: '#1c1917',
    accentColor: '#ea580c'
  },
  elegant: {
    primaryColor: '#1e293b',
    secondaryColor: '#64748b',
    backgroundColor: '#f8fafc',
    textColor: '#0f172a',
    accentColor: '#8b5cf6'
  },
  nature: {
    primaryColor: '#166534',
    secondaryColor: '#16a34a',
    backgroundColor: '#f0fdf4',
    textColor: '#14532d',
    accentColor: '#22c55e'
  }
};

export function CustomizationSettings() {
  const { toast } = useToast();
  const [selectedLayout, setSelectedLayout] = useState<'categories' | 'items'>('categories');
  const [customTheme, setCustomTheme] = useState<MenuTheme>(defaultThemes.classic);
  const [selectedPreset, setSelectedPreset] = useState<string>('classic');

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

  const saveCustomization = () => {
    // Here you would save the customization to the restaurant's database
    localStorage.setItem('menu_theme', JSON.stringify(customTheme));
    localStorage.setItem('menu_layout', selectedLayout);
    
    toast({
      title: 'Personalizimi u ruajt',
      description: 'Ndryshimet tuaja janë ruajtur me sukses.',
    });
  };

  const getPreviewUrl = () => {
    const restaurantInfo = sessionStorage.getItem('restaurant_info');
    if (!restaurantInfo) return '#';
    
    const { id } = JSON.parse(restaurantInfo);
    return `/menu/${id}?layout=${selectedLayout}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Personalizimi i Menusë</h1>
          <p className="text-muted-foreground">Personalizoni pamjen dhe ndjenjën e menusë suaj dixhitale</p>
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
                {/* Categories Layout */}
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

                {/* Items Layout */}
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
              <CardTitle>Tema të Paracaktuara</CardTitle>
              <CardDescription>
                Zgjidhni një nga temat e paracaktuara ose personalizoni ngjyrat tuaja
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(defaultThemes).map(([key, theme]) => (
                  <div
                    key={key}
                    className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      selectedPreset === key ? 'border-primary' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => applyPresetTheme(key)}
                  >
                    <div className="space-y-2">
                      <div className="flex space-x-1">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: theme.primaryColor }}
                        ></div>
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: theme.accentColor }}
                        ></div>
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: theme.secondaryColor }}
                        ></div>
                      </div>
                      <p className="text-sm font-medium capitalize">{key}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ngjyrat e Personalizuara</CardTitle>
              <CardDescription>
                Zgjidhni ngjyrat tuaja të personalizuara për menunë
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
                  <Label htmlFor="textColor">Ngjyra e Tekstit</Label>
                  <div className="flex gap-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={customTheme.textColor}
                      onChange={(e) => handleThemeChange('textColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.textColor}
                      onChange={(e) => handleThemeChange('textColor', e.target.value)}
                      placeholder="#111827"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Color Preview */}
              <div className="mt-6 p-4 rounded-lg border" style={{ 
                backgroundColor: customTheme.backgroundColor,
                color: customTheme.textColor 
              }}>
                <div 
                  className="text-white p-3 rounded mb-3"
                  style={{ backgroundColor: customTheme.primaryColor }}
                >
                  <h3 className="font-bold">Restoranti Juaj</h3>
                  <p className="text-sm opacity-90">Shembull i header-it të menusë</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Antipastet</h4>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Sallatë Cezar</p>
                      <p className="text-sm opacity-70">Sallatë e freskët me parmezan</p>
                    </div>
                    <span 
                      className="font-bold"
                      style={{ color: customTheme.accentColor }}
                    >
                      800 ALL
                    </span>
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
