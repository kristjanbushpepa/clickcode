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
  // New specific text colors
  headingColor: string;
  categoryNameColor: string;
  itemNameColor: string;
  descriptionColor: string;
  priceColor: string;
  // Contact information colors
  contactSectionTitleColor: string;
  contactLabelColor: string;
  contactValueColor: string;
  // Opening hours colors
  openingHoursSectionTitleColor: string;
  openingHoursLabelColor: string;
  openingHoursValueColor: string;
  // Social media colors
  socialMediaSectionTitleColor: string;
  socialMediaLinkColor: string;
  // Footer colors
  footerBrandingColor: string;
  footerDescriptionColor: string;
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
    borderColor: '#e5e7eb',
    headingColor: '#111827',
    categoryNameColor: '#1f2937',
    itemNameColor: '#111827',
    descriptionColor: '#6b7280',
    priceColor: '#059669',
    contactSectionTitleColor: '#1f2937',
    contactLabelColor: '#111827',
    contactValueColor: '#6b7280',
    openingHoursSectionTitleColor: '#1f2937',
    openingHoursLabelColor: '#111827',
    openingHoursValueColor: '#6b7280',
    socialMediaSectionTitleColor: '#1f2937',
    socialMediaLinkColor: '#6b7280',
    footerBrandingColor: '#3b82f6',
    footerDescriptionColor: '#9ca3af'
  },
  dark: {
    mode: 'dark' as const,
    primaryColor: '#1e293b',
    accentColor: '#60a5fa',
    backgroundColor: '#0f172a',
    cardBackground: '#1e293b',
    textColor: '#f8fafc',
    mutedTextColor: '#94a3b8',
    borderColor: '#334155',
    headingColor: '#f1f5f9',
    categoryNameColor: '#e2e8f0',
    itemNameColor: '#f8fafc',
    descriptionColor: '#94a3b8',
    priceColor: '#34d399',
    contactSectionTitleColor: '#e2e8f0',
    contactLabelColor: '#f1f5f9',
    contactValueColor: '#94a3b8',
    openingHoursSectionTitleColor: '#e2e8f0',
    openingHoursLabelColor: '#f1f5f9',
    openingHoursValueColor: '#94a3b8',
    socialMediaSectionTitleColor: '#e2e8f0',
    socialMediaLinkColor: '#94a3b8',
    footerBrandingColor: '#60a5fa',
    footerDescriptionColor: '#64748b'
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
              <CardTitle>Ngjyrat e Përgjithshme</CardTitle>
              <CardDescription>
                Ngjyrat bazë të temës
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ngjyrat e Tekstit</CardTitle>
              <CardDescription>
                Personalizoni ngjyrat për lloje të ndryshme tekstesh
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="headingColor">Ngjyra e Titujve</Label>
                  <div className="flex gap-2">
                    <Input
                      id="headingColor"
                      type="color"
                      value={customTheme.headingColor}
                      onChange={(e) => handleThemeChange('headingColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.headingColor}
                      onChange={(e) => handleThemeChange('headingColor', e.target.value)}
                      placeholder="#111827"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryNameColor">Emrat e Kategorive</Label>
                  <div className="flex gap-2">
                    <Input
                      id="categoryNameColor"
                      type="color"
                      value={customTheme.categoryNameColor}
                      onChange={(e) => handleThemeChange('categoryNameColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.categoryNameColor}
                      onChange={(e) => handleThemeChange('categoryNameColor', e.target.value)}
                      placeholder="#1f2937"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemNameColor">Emrat e Artikujve</Label>
                  <div className="flex gap-2">
                    <Input
                      id="itemNameColor"
                      type="color"
                      value={customTheme.itemNameColor}
                      onChange={(e) => handleThemeChange('itemNameColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.itemNameColor}
                      onChange={(e) => handleThemeChange('itemNameColor', e.target.value)}
                      placeholder="#111827"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descriptionColor">Përshkrimet</Label>
                  <div className="flex gap-2">
                    <Input
                      id="descriptionColor"
                      type="color"
                      value={customTheme.descriptionColor}
                      onChange={(e) => handleThemeChange('descriptionColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.descriptionColor}
                      onChange={(e) => handleThemeChange('descriptionColor', e.target.value)}
                      placeholder="#6b7280"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceColor">Çmimet</Label>
                  <div className="flex gap-2">
                    <Input
                      id="priceColor"
                      type="color"
                      value={customTheme.priceColor}
                      onChange={(e) => handleThemeChange('priceColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.priceColor}
                      onChange={(e) => handleThemeChange('priceColor', e.target.value)}
                      placeholder="#059669"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ngjyrat e Informacionit për Kontakt</CardTitle>
              <CardDescription>
                Personalizoni ngjyrat për seksionin e kontaktit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactSectionTitleColor">Titulli i Seksionit</Label>
                  <div className="flex gap-2">
                    <Input
                      id="contactSectionTitleColor"
                      type="color"
                      value={customTheme.contactSectionTitleColor}
                      onChange={(e) => handleThemeChange('contactSectionTitleColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.contactSectionTitleColor}
                      onChange={(e) => handleThemeChange('contactSectionTitleColor', e.target.value)}
                      placeholder="#1f2937"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactLabelColor">Etiketat (Address, Phone)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="contactLabelColor"
                      type="color"
                      value={customTheme.contactLabelColor}
                      onChange={(e) => handleThemeChange('contactLabelColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.contactLabelColor}
                      onChange={(e) => handleThemeChange('contactLabelColor', e.target.value)}
                      placeholder="#111827"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactValueColor">Vlerat e Kontaktit</Label>
                  <div className="flex gap-2">
                    <Input
                      id="contactValueColor"
                      type="color"
                      value={customTheme.contactValueColor}
                      onChange={(e) => handleThemeChange('contactValueColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.contactValueColor}
                      onChange={(e) => handleThemeChange('contactValueColor', e.target.value)}
                      placeholder="#6b7280"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ngjyrat e Orareve</CardTitle>
              <CardDescription>
                Personalizoni ngjyrat për oraret e punës
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openingHoursSectionTitleColor">Titulli i Seksionit</Label>
                  <div className="flex gap-2">
                    <Input
                      id="openingHoursSectionTitleColor"
                      type="color"
                      value={customTheme.openingHoursSectionTitleColor}
                      onChange={(e) => handleThemeChange('openingHoursSectionTitleColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.openingHoursSectionTitleColor}
                      onChange={(e) => handleThemeChange('openingHoursSectionTitleColor', e.target.value)}
                      placeholder="#1f2937"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openingHoursLabelColor">Ditët e Javës</Label>
                  <div className="flex gap-2">
                    <Input
                      id="openingHoursLabelColor"
                      type="color"
                      value={customTheme.openingHoursLabelColor}
                      onChange={(e) => handleThemeChange('openingHoursLabelColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.openingHoursLabelColor}
                      onChange={(e) => handleThemeChange('openingHoursLabelColor', e.target.value)}
                      placeholder="#111827"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openingHoursValueColor">Oraret</Label>
                  <div className="flex gap-2">
                    <Input
                      id="openingHoursValueColor"
                      type="color"
                      value={customTheme.openingHoursValueColor}
                      onChange={(e) => handleThemeChange('openingHoursValueColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.openingHoursValueColor}
                      onChange={(e) => handleThemeChange('openingHoursValueColor', e.target.value)}
                      placeholder="#6b7280"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ngjyrat e Mediave Sociale</CardTitle>
              <CardDescription>
                Personalizoni ngjyrat për seksionin e mediave sociale
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="socialMediaSectionTitleColor">Titulli i Seksionit</Label>
                  <div className="flex gap-2">
                    <Input
                      id="socialMediaSectionTitleColor"
                      type="color"
                      value={customTheme.socialMediaSectionTitleColor}
                      onChange={(e) => handleThemeChange('socialMediaSectionTitleColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.socialMediaSectionTitleColor}
                      onChange={(e) => handleThemeChange('socialMediaSectionTitleColor', e.target.value)}
                      placeholder="#1f2937"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="socialMediaLinkColor">Linqet e Mediave Sociale</Label>
                  <div className="flex gap-2">
                    <Input
                      id="socialMediaLinkColor"
                      type="color"
                      value={customTheme.socialMediaLinkColor}
                      onChange={(e) => handleThemeChange('socialMediaLinkColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.socialMediaLinkColor}
                      onChange={(e) => handleThemeChange('socialMediaLinkColor', e.target.value)}
                      placeholder="#6b7280"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ngjyrat e Footer-it</CardTitle>
              <CardDescription>
                Personalizoni ngjyrat për seksionin e footer-it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="footerBrandingColor">Branding (CodeClick.cc)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="footerBrandingColor"
                      type="color"
                      value={customTheme.footerBrandingColor}
                      onChange={(e) => handleThemeChange('footerBrandingColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.footerBrandingColor}
                      onChange={(e) => handleThemeChange('footerBrandingColor', e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerDescriptionColor">Përshkrimi</Label>
                  <div className="flex gap-2">
                    <Input
                      id="footerDescriptionColor"
                      type="color"
                      value={customTheme.footerDescriptionColor}
                      onChange={(e) => handleThemeChange('footerDescriptionColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.footerDescriptionColor}
                      onChange={(e) => handleThemeChange('footerDescriptionColor', e.target.value)}
                      placeholder="#9ca3af"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Live Preview */}
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
                <h3 className="font-bold" style={{ color: customTheme.headingColor }}>
                  {restaurantName || 'Restoranti Juaj'}
                </h3>
                <p className="text-sm opacity-90">Adresa, Qyteti</p>
              </div>
              
              {/* Menu Items Preview */}
              <div className="space-y-2">
                <h4 className="font-bold text-lg" style={{ color: customTheme.categoryNameColor }}>
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
                      <p className="font-semibold" style={{ color: customTheme.itemNameColor }}>
                        Sallatë Cezar
                      </p>
                      <p className="text-sm" style={{ color: customTheme.descriptionColor }}>
                        Sallatë e freskët me parmezan dhe kroton
                      </p>
                    </div>
                    <span 
                      className="font-bold px-2 py-1 rounded text-sm"
                      style={{ 
                        color: customTheme.priceColor,
                        backgroundColor: customTheme.priceColor + '20' 
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
                      <p className="font-semibold" style={{ color: customTheme.itemNameColor }}>
                        Bruschetta
                      </p>
                      <p className="text-sm" style={{ color: customTheme.descriptionColor }}>
                        Bukë e pjekur me domate dhe borzilok
                      </p>
                    </div>
                    <span 
                      className="font-bold px-2 py-1 rounded text-sm"
                      style={{ 
                        color: customTheme.priceColor,
                        backgroundColor: customTheme.priceColor + '20' 
                      }}
                    >
                      650 ALL
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Preview */}
              <div className="mt-4 pt-3 border-t" style={{ borderColor: customTheme.borderColor }}>
                <div className="space-y-2">
                  <h5 className="text-sm font-medium" style={{ color: customTheme.contactSectionTitleColor }}>
                    Contact Information
                  </h5>
                  <div className="text-xs space-y-1">
                    <div>
                      <span className="font-medium" style={{ color: customTheme.contactLabelColor }}>Address: </span>
                      <span style={{ color: customTheme.contactValueColor }}>Lake View Residences</span>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: customTheme.contactLabelColor }}>Phone: </span>
                      <span style={{ color: customTheme.contactValueColor }}>+355 68 804 8347</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mt-3">
                  <h5 className="text-sm font-medium" style={{ color: customTheme.openingHoursSectionTitleColor }}>
                    Opening Hours
                  </h5>
                  <div className="text-xs">
                    <div className="flex justify-between">
                      <span style={{ color: customTheme.openingHoursLabelColor }}>Monday</span>
                      <span style={{ color: customTheme.openingHoursValueColor }}>8 AM – 12 AM</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-3">
                  <h5 className="text-sm font-medium" style={{ color: customTheme.socialMediaSectionTitleColor }}>
                    Follow Us
                  </h5>
                  <div className="text-xs">
                    <span style={{ color: customTheme.socialMediaLinkColor }}>Instagram • TikTok • WhatsApp</span>
                  </div>
                </div>

                <div className="text-center mt-3 pt-2 border-t" style={{ borderColor: customTheme.borderColor }}>
                  <div className="text-xs">
                    <span style={{ color: customTheme.footerBrandingColor }}>CodeClick.cc</span>
                  </div>
                  <div className="text-xs">
                    <span style={{ color: customTheme.footerDescriptionColor }}>Digital menus made simple</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
