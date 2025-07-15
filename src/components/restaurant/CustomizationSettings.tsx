
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CurrencySettings } from './CurrencySettings';
import { LanguageSettings } from './LanguageSettings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, Palette, Layout, Save, Moon, Sun, Leaf, Coins, Waves, Grape, Sunset } from 'lucide-react';
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
  },
  green: {
    mode: 'light' as const,
    primaryColor: '#166534',
    accentColor: '#22c55e',
    backgroundColor: '#f0fdf4',
    cardBackground: '#ffffff',
    textColor: '#166534',
    mutedTextColor: '#15803d',
    borderColor: '#dcfce7',
    headingColor: '#14532d',
    categoryNameColor: '#166534',
    itemNameColor: '#14532d',
    descriptionColor: '#15803d',
    priceColor: '#16a34a',
    contactSectionTitleColor: '#166534',
    contactLabelColor: '#14532d',
    contactValueColor: '#15803d',
    openingHoursSectionTitleColor: '#166534',
    openingHoursLabelColor: '#14532d',
    openingHoursValueColor: '#15803d',
    socialMediaSectionTitleColor: '#166534',
    socialMediaLinkColor: '#15803d',
    footerBrandingColor: '#22c55e',
    footerDescriptionColor: '#65a30d'
  },
  gold: {
    mode: 'light' as const,
    primaryColor: '#92400e',
    accentColor: '#f59e0b',
    backgroundColor: '#fffbeb',
    cardBackground: '#ffffff',
    textColor: '#92400e',
    mutedTextColor: '#d97706',
    borderColor: '#fef3c7',
    headingColor: '#78350f',
    categoryNameColor: '#92400e',
    itemNameColor: '#78350f',
    descriptionColor: '#d97706',
    priceColor: '#ea580c',
    contactSectionTitleColor: '#92400e',
    contactLabelColor: '#78350f',
    contactValueColor: '#d97706',
    openingHoursSectionTitleColor: '#92400e',
    openingHoursLabelColor: '#78350f',
    openingHoursValueColor: '#d97706',
    socialMediaSectionTitleColor: '#92400e',
    socialMediaLinkColor: '#d97706',
    footerBrandingColor: '#f59e0b',
    footerDescriptionColor: '#a16207'
  },
  ocean: {
    mode: 'light' as const,
    primaryColor: '#075985',
    accentColor: '#0ea5e9',
    backgroundColor: '#f0f9ff',
    cardBackground: '#ffffff',
    textColor: '#075985',
    mutedTextColor: '#0284c7',
    borderColor: '#e0f2fe',
    headingColor: '#0c4a6e',
    categoryNameColor: '#075985',
    itemNameColor: '#0c4a6e',
    descriptionColor: '#0284c7',
    priceColor: '#0891b2',
    contactSectionTitleColor: '#075985',
    contactLabelColor: '#0c4a6e',
    contactValueColor: '#0284c7',
    openingHoursSectionTitleColor: '#075985',
    openingHoursLabelColor: '#0c4a6e',
    openingHoursValueColor: '#0284c7',
    socialMediaSectionTitleColor: '#075985',
    socialMediaLinkColor: '#0284c7',
    footerBrandingColor: '#0ea5e9',
    footerDescriptionColor: '#0369a1'
  },
  purple: {
    mode: 'light' as const,
    primaryColor: '#6b21a8',
    accentColor: '#a855f7',
    backgroundColor: '#faf5ff',
    cardBackground: '#ffffff',
    textColor: '#6b21a8',
    mutedTextColor: '#9333ea',
    borderColor: '#f3e8ff',
    headingColor: '#581c87',
    categoryNameColor: '#6b21a8',
    itemNameColor: '#581c87',
    descriptionColor: '#9333ea',
    priceColor: '#c026d3',
    contactSectionTitleColor: '#6b21a8',
    contactLabelColor: '#581c87',
    contactValueColor: '#9333ea',
    openingHoursSectionTitleColor: '#6b21a8',
    openingHoursLabelColor: '#581c87',
    openingHoursValueColor: '#9333ea',
    socialMediaSectionTitleColor: '#6b21a8',
    socialMediaLinkColor: '#9333ea',
    footerBrandingColor: '#a855f7',
    footerDescriptionColor: '#7c3aed'
  },
  sunset: {
    mode: 'light' as const,
    primaryColor: '#dc2626',
    accentColor: '#f97316',
    backgroundColor: '#fff7ed',
    cardBackground: '#ffffff',
    textColor: '#dc2626',
    mutedTextColor: '#ea580c',
    borderColor: '#fed7aa',
    headingColor: '#b91c1c',
    categoryNameColor: '#dc2626',
    itemNameColor: '#b91c1c',
    descriptionColor: '#ea580c',
    priceColor: '#f59e0b',
    contactSectionTitleColor: '#dc2626',
    contactLabelColor: '#b91c1c',
    contactValueColor: '#ea580c',
    openingHoursSectionTitleColor: '#dc2626',
    openingHoursLabelColor: '#b91c1c',
    openingHoursValueColor: '#ea580c',
    socialMediaSectionTitleColor: '#dc2626',
    socialMediaLinkColor: '#ea580c',
    footerBrandingColor: '#f97316',
    footerDescriptionColor: '#d97706'
  }
};

const themeInfo = {
  light: { name: 'Light Mode', description: 'Sfond i bardhë me tekst të errët', icon: Sun },
  dark: { name: 'Dark Mode', description: 'Sfond i errët me tekst të bardhë', icon: Moon },
  green: { name: 'Green Nature', description: 'Tema natyrale me ngjyra të gjelbra', icon: Leaf },
  gold: { name: 'Golden Luxury', description: 'Tema luksoze me ngjyra ari', icon: Coins },
  ocean: { name: 'Ocean Blue', description: 'Tema qetësuese me blu oqeani', icon: Waves },
  purple: { name: 'Royal Purple', description: 'Tema mbretërore me vjollcë', icon: Grape },
  sunset: { name: 'Sunset Orange', description: 'Tema e ngrohtë me portokalli', icon: Sunset }
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

        // Clean up duplicate records and get the latest one
        const { data: allRecords, error: fetchAllError } = await supabase
          .from('restaurant_customization')
          .select('*')
          .order('updated_at', { ascending: false });

        if (fetchAllError) {
          console.error('Error fetching customization records:', fetchAllError);
          return;
        }

        if (allRecords && allRecords.length > 0) {
          console.log(`Found ${allRecords.length} customization records, using the latest one`);
          
          // Use the most recent record
          const latestRecord = allRecords[0];
          
          if (latestRecord.theme) {
            setCustomTheme(latestRecord.theme);
            setSelectedPreset(latestRecord.preset || 'light');
          }
          if (latestRecord.layout) {
            setSelectedLayout(latestRecord.layout);
          }

          // Delete older duplicate records if they exist
          if (allRecords.length > 1) {
            const recordsToDelete = allRecords.slice(1).map(record => record.id);
            console.log(`Cleaning up ${recordsToDelete.length} duplicate records`);
            
            const { error: deleteError } = await supabase
              .from('restaurant_customization')
              .delete()
              .in('id', recordsToDelete);
              
            if (deleteError) {
              console.error('Error cleaning up duplicate records:', deleteError);
            } else {
              console.log('Successfully cleaned up duplicate records');
            }
          }
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

      // First, get the most recent record
      const { data: existingRecords, error: fetchError } = await supabase
        .from('restaurant_customization')
        .select('id')
        .order('updated_at', { ascending: false })
        .limit(1);

      let result;
      if (existingRecords && existingRecords.length > 0) {
        // Update the most recent record
        const existingId = existingRecords[0].id;
        console.log('Updating existing record with ID:', existingId);
        
        result = await supabase
          .from('restaurant_customization')
          .update(customizationData)
          .eq('id', existingId);
      } else {
        // Insert new record
        console.log('Inserting new record');
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Ngjyrat & Tema
          </TabsTrigger>
          <TabsTrigger value="layout">
            <Layout className="h-4 w-4 mr-2" />
            Dizajni
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(themeInfo).map(([key, info]) => {
                  const IconComponent = info.icon;
                  const theme = defaultThemes[key as keyof typeof defaultThemes];
                  
                  return (
                    <div
                      key={key}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPreset === key ? 'border-primary' : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => applyPresetTheme(key)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5" style={{ color: theme.accentColor }} />
                          <h3 className="font-semibold">{info.name}</h3>
                        </div>
                        <div className="flex space-x-2">
                          <div 
                            className="w-6 h-6 rounded border" 
                            style={{ backgroundColor: theme.backgroundColor }}
                          ></div>
                          <div 
                            className="w-6 h-6 rounded" 
                            style={{ backgroundColor: theme.cardBackground }}
                          ></div>
                          <div 
                            className="w-6 h-6 rounded" 
                            style={{ backgroundColor: theme.primaryColor }}
                          ></div>
                          <div 
                            className="w-6 h-6 rounded" 
                            style={{ backgroundColor: theme.accentColor }}
                          ></div>
                        </div>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                  );
                })}
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
      </Tabs>
    </div>
  );
}
