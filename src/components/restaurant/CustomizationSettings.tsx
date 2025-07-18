import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ColorPicker } from '@/components/ui/color-picker';
import { Palette, Layout, Monitor, Smartphone, Tablet, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ThemePreview from './customization/ThemePreview';
import LayoutPreview from './customization/LayoutPreview';
import { useDashboardForm } from '@/contexts/DashboardFormContext';

interface CustomizationSettingsData {
  themeId: string;
  selectedLayout: string;
  selectedDevice: string;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typographySettings: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
  };
  customCss: string;
}

interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
  };
}

const predefinedThemes: Theme[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Një temë moderne me ngjyra të pastra dhe tipografi të thjeshtë',
    colors: {
      primary: '#2563EB',
      secondary: '#6B7280',
      accent: '#F59E0B',
      background: '#FFFFFF',
      text: '#000000',
    },
    typography: {
      fontFamily: 'Inter',
      fontSize: 'medium',
      fontWeight: 'normal',
    },
  },
  {
    id: 'classic',
    name: 'Klasike',
    description: 'Një temë klasike me ngjyra të ngrohta dhe tipografi tradicionale',
    colors: {
      primary: '#A85530',
      secondary: '#71717A',
      accent: '#DC2626',
      background: '#F9FAFA',
      text: '#1E293B',
    },
    typography: {
      fontFamily: 'Roboto',
      fontSize: 'medium',
      fontWeight: 'normal',
    },
  },
  {
    id: 'minimalist',
    name: 'Minimaliste',
    description: 'Një temë minimaliste me ngjyra neutrale dhe tipografi të lehtë',
    colors: {
      primary: '#4B5563',
      secondary: '#9CA3AF',
      accent: '#64748B',
      background: '#F3F4F6',
      text: '#111827',
    },
    typography: {
      fontFamily: 'Open Sans',
      fontSize: 'medium',
      fontWeight: 'normal',
    },
  },
];

const CustomizationSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setFormData, getFormData } = useDashboardForm();
  
  const [selectedLayout, setSelectedLayout] = useState('grid');
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [customColors, setCustomColors] = useState({
    primary: '#000000',
    secondary: '#666666',
    accent: '#3B82F6',
    background: '#FFFFFF',
    text: '#000000'
  });
  const [typographySettings, setTypographySettings] = useState({
    fontFamily: 'Inter',
    fontSize: 'medium',
    fontWeight: 'normal'
  });
  const [customCss, setCustomCss] = useState('');

  // Load saved theme selection from context
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return getFormData('customizationTheme') || 'modern';
  });

  const { data: customizationSettings, isLoading, error } = useQuery({
    queryKey: ['customizationSettings'],
    queryFn: async () => {
      const restaurantSupabase = getRestaurantSupabase();
      const { data, error } = await restaurantSupabase
        .from('customization_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Failed to fetch customization settings:', error);
        throw error;
      }

      return data;
    },
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<CustomizationSettingsData>) => {
      const restaurantSupabase = getRestaurantSupabase();
      const { data, error } = await restaurantSupabase
        .from('customization_settings')
        .update(updates)
        .eq('id', customizationSettings?.id)
        .select()
        .single();

      if (error) {
        console.error('Failed to update customization settings:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customizationSettings'] });
      toast({ title: 'Ndryshimet u ruajtën me sukses!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Gabim',
        description: `Gabim në ruajtjen e ndryshimeve: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Save theme selection to context when it changes
  useEffect(() => {
    setFormData('customizationTheme', selectedTheme);
  }, [selectedTheme, setFormData]);

  // Load saved customization data on component mount
  useEffect(() => {
    const savedCustomization = getFormData('customizationSettings');
    if (savedCustomization) {
      setSelectedLayout(savedCustomization.selectedLayout || 'grid');
      setSelectedDevice(savedCustomization.selectedDevice || 'desktop');
      setCustomColors(savedCustomization.customColors || {
        primary: '#000000',
        secondary: '#666666',
        accent: '#3B82F6',
        background: '#FFFFFF',
        text: '#000000'
      });
      setTypographySettings(savedCustomization.typographySettings || {
        fontFamily: 'Inter',
        fontSize: 'medium',
        fontWeight: 'normal'
      });
      setCustomCss(savedCustomization.customCss || '');
    }
  }, [getFormData]);

  // Save customization data to context when it changes
  const saveToContext = (field, value) => {
    const currentData = getFormData('customizationSettings') || {};
    setFormData('customizationSettings', { ...currentData, [field]: value });
  };

  const handleSaveCustomization = async () => {
    const updates: Partial<CustomizationSettingsData> = {
      themeId: selectedTheme,
      selectedLayout: selectedLayout,
      selectedDevice: selectedDevice,
      customColors: customColors,
      typographySettings: typographySettings,
      customCss: customCss,
    };

    updateMutation.mutate(updates);
  };

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
    setFormData('customizationTheme', themeId);
  };

  const handleLayoutChange = (layout) => {
    setSelectedLayout(layout);
    saveToContext('selectedLayout', layout);
  };

  const handleDeviceChange = (device) => {
    setSelectedDevice(device);
    saveToContext('selectedDevice', device);
  };

  const handleColorChange = (colorKey, color) => {
    const newColors = { ...customColors, [colorKey]: color };
    setCustomColors(newColors);
    saveToContext('customColors', newColors);
  };

  const handleTypographyChange = (field, value) => {
    const newTypography = { ...typographySettings, [field]: value };
    setTypographySettings(newTypography);
    saveToContext('typographySettings', newTypography);
  };

  const handleCustomCssChange = (css) => {
    setCustomCss(css);
    saveToContext('customCss', css);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Duke ngarkuar...</div>;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Personalizimi</h1>
            <p className="text-muted-foreground">Personalizoni pamjen dhe stilin e menusë së restorantit tuaj</p>
          </div>
          <Button onClick={handleSaveCustomization} disabled={updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
          </Button>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Tabela e personalizimit nuk është e disponueshme</h3>
              <p className="text-muted-foreground mb-4">
                Duket se tabela e personalizimit nuk është krijuar ende në databazën tuaj. 
                Kontaktoni administratorin për të konfiguruar databazën e restorantit.
              </p>
              <p className="text-sm text-muted-foreground">
                Gabim: {error.message}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Personalizimi</h1>
          <p className="text-muted-foreground">Personalizoni pamjen dhe stilin e menusë së restorantit tuaj</p>
        </div>
        <Button onClick={handleSaveCustomization} disabled={updateMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateMutation.isPending ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
        </Button>
      </div>

      <Tabs defaultValue="themes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Temat
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Ngjyrat
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Tipografia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Zgjidhni një Temë</CardTitle>
              <CardDescription>
                Zgjidhni një temë të paracaktuar për menunë tuaj
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {predefinedThemes.map((theme) => (
                  <Card 
                    key={theme.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTheme === theme.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleThemeSelect(theme.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{theme.name}</h3>
                          {selectedTheme === theme.id && (
                            <Badge>E zgjedhur</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{theme.description}</p>
                        <ThemePreview theme={theme} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout dhe Pamja</CardTitle>
              <CardDescription>
                Konfiguroni layout-in dhe pamjen e menusë
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Stili i Layout-it</Label>
                    <Select value={selectedLayout} onValueChange={handleLayoutChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid (Rrjetë)</SelectItem>
                        <SelectItem value="list">List (Listë)</SelectItem>
                        <SelectItem value="cards">Cards (Karta)</SelectItem>
                        <SelectItem value="masonry">Masonry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Pajisja për Pamje</Label>
                    <div className="flex gap-2">
                      {[
                        { id: 'mobile', label: 'Mobile', icon: Smartphone },
                        { id: 'tablet', label: 'Tablet', icon: Tablet },
                        { id: 'desktop', label: 'Desktop', icon: Monitor },
                      ].map(({ id, label, icon: Icon }) => (
                        <Button
                          key={id}
                          variant={selectedDevice === id ? 'default' : 'outline'}
                          onClick={() => handleDeviceChange(id)}
                          className="flex items-center gap-2"
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pamja e Layout-it</Label>
                  <LayoutPreview 
                    layout={selectedLayout} 
                    device={selectedDevice} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ngjyrat e Personalizuara</CardTitle>
              <CardDescription>
                Personalizoni ngjyrat e menusë së restorantit tuaj
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(customColors).map(([key, color]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">
                      {key === 'primary' && 'Ngjyra Kryesore'}
                      {key === 'secondary' && 'Ngjyra Dytësore'}
                      {key === 'accent' && 'Ngjyra Theksimi'}
                      {key === 'background' && 'Ngjyra e Sfondit'}
                      {key === 'text' && 'Ngjyra e Tekstit'}
                    </Label>
                    <ColorPicker
                      color={color}
                      onColorChange={(newColor) => handleColorChange(key, newColor)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tipografia</CardTitle>
              <CardDescription>
                Konfiguroni fontin dhe stilin e tekstit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Familja e Fontit</Label>
                  <Select 
                    value={typographySettings.fontFamily} 
                    onValueChange={(value) => handleTypographyChange('fontFamily', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Madhësia e Fontit</Label>
                  <Select 
                    value={typographySettings.fontSize} 
                    onValueChange={(value) => handleTypographyChange('fontSize', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">I vogël</SelectItem>
                      <SelectItem value="medium">Mesatar</SelectItem>
                      <SelectItem value="large">I madh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Pesha e Fontit</Label>
                  <Select 
                    value={typographySettings.fontWeight} 
                    onValueChange={(value) => handleTypographyChange('fontWeight', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">I lehtë</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="medium">Mesatar</SelectItem>
                      <SelectItem value="bold">I trashë</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Label>CSS i Personalizuar</Label>
                <Textarea
                  value={customCss}
                  onChange={(e) => handleCustomCssChange(e.target.value)}
                  rows={6}
                  placeholder="/* Shkruani CSS-në tuaj të personalizuar këtu */
.menu-item {
  border-radius: 12px;
}

.category-title {
  font-size: 1.5rem;
}"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomizationSettings;
