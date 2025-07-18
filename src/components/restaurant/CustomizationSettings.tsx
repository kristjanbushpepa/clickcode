import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';
import { ColorPicker } from '@/components/ui/color-picker';
import ThemePreview from './customization/ThemePreview';
import LayoutPreview from './customization/LayoutPreview';

interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardBackground: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  headingColor?: string;
  categoryNameColor?: string;
  itemNameColor?: string;
  descriptionColor?: string;
  priceColor?: string;
  languageSwitchBackground?: string;
  languageSwitchBorder?: string;
  languageSwitchText?: string;
  currencySwitchBackground?: string;
  currencySwitchBorder?: string;
  currencySwitchText?: string;
  badgeBackgroundColor?: string;
  badgeTextColor?: string;
}

// Modern Theme Presets
const modernMinimalTheme: Theme = {
  mode: 'light',
  primaryColor: '#0c0c0c',
  accentColor: '#2563eb',
  backgroundColor: '#ffffff',
  cardBackground: '#fafafa',
  textColor: '#0c0c0c',
  mutedTextColor: '#666666',
  borderColor: '#e5e5e5',
  headingColor: '#ffffff',
  categoryNameColor: '#0c0c0c',
  itemNameColor: '#0c0c0c',
  descriptionColor: '#666666',
  priceColor: '#2563eb',
  languageSwitchBackground: '#0c0c0c',
  languageSwitchBorder: '#e5e5e5',
  languageSwitchText: '#ffffff',
  currencySwitchBackground: '#0c0c0c',
  currencySwitchBorder: '#e5e5e5',
  currencySwitchText: '#ffffff',
  badgeBackgroundColor: '#f3f4f6',
  badgeTextColor: '#374151'
};

const oceanBreezTheme: Theme = {
  mode: 'light',
  primaryColor: '#0369a1',
  accentColor: '#0ea5e9',
  backgroundColor: '#f0f9ff',
  cardBackground: '#ffffff',
  textColor: '#0c4a6e',
  mutedTextColor: '#64748b',
  borderColor: '#bae6fd',
  headingColor: '#ffffff',
  categoryNameColor: '#0369a1',
  itemNameColor: '#0c4a6e',
  descriptionColor: '#64748b',
  priceColor: '#0ea5e9',
  languageSwitchBackground: '#0369a1',
  languageSwitchBorder: '#0ea5e9',
  languageSwitchText: '#ffffff',
  currencySwitchBackground: '#0369a1',
  currencySwitchBorder: '#0ea5e9',
  currencySwitchText: '#ffffff',
  badgeBackgroundColor: '#dbeafe',
  badgeTextColor: '#1e3a8a'
};

const sunsetTheme: Theme = {
  mode: 'light',
  primaryColor: '#ea580c',
  accentColor: '#f97316',
  backgroundColor: '#fff7ed',
  cardBackground: '#ffffff',
  textColor: '#c2410c',
  mutedTextColor: '#78716c',
  borderColor: '#fed7aa',
  headingColor: '#ffffff',
  categoryNameColor: '#ea580c',
  itemNameColor: '#c2410c',
  descriptionColor: '#78716c',
  priceColor: '#f97316',
  languageSwitchBackground: '#ea580c',
  languageSwitchBorder: '#f97316',
  languageSwitchText: '#ffffff',
  currencySwitchBackground: '#ea580c',
  currencySwitchBorder: '#f97316',
  currencySwitchText: '#ffffff',
  badgeBackgroundColor: '#fed7aa',
  badgeTextColor: '#c2410c'
};

const forestGreenTheme: Theme = {
  mode: 'dark',
  primaryColor: '#2d4a3d',
  accentColor: '#f2e7c7',
  backgroundColor: '#1a2e25',
  cardBackground: '#2d4a3d',
  textColor: '#f2e7c7',
  mutedTextColor: '#c7b899',
  borderColor: '#3d5a4d',
  headingColor: '#f2e7c7',
  categoryNameColor: '#f2e7c7',
  itemNameColor: '#f2e7c7',
  descriptionColor: '#c7b899',
  priceColor: '#f2e7c7',
  languageSwitchBackground: '#2d4a3d',
  languageSwitchBorder: '#3d5a4d',
  languageSwitchText: '#f2e7c7',
  currencySwitchBackground: '#2d4a3d',
  currencySwitchBorder: '#3d5a4d',
  currencySwitchText: '#f2e7c7',
  badgeBackgroundColor: '#3d5a4d',
  badgeTextColor: '#f2e7c7'
};

const royalPurpleTheme: Theme = {
  mode: 'light',
  primaryColor: '#6b21a8',
  accentColor: '#8b5cf6',
  backgroundColor: '#faf5ff',
  cardBackground: '#ffffff',
  textColor: '#581c87',
  mutedTextColor: '#6b7280',
  borderColor: '#e9d5ff',
  headingColor: '#ffffff',
  categoryNameColor: '#6b21a8',
  itemNameColor: '#581c87',
  descriptionColor: '#6b7280',
  priceColor: '#8b5cf6',
  languageSwitchBackground: '#6b21a8',
  languageSwitchBorder: '#8b5cf6',
  languageSwitchText: '#ffffff',
  currencySwitchBackground: '#6b21a8',
  currencySwitchBorder: '#8b5cf6',
  currencySwitchText: '#ffffff',
  badgeBackgroundColor: '#e9d5ff',
  badgeTextColor: '#581c87'
};

const elegantDarkTheme: Theme = {
  mode: 'dark',
  primaryColor: '#1e293b',
  accentColor: '#3b82f6',
  backgroundColor: '#0f172a',
  cardBackground: '#1e293b',
  textColor: '#f1f5f9',
  mutedTextColor: '#94a3b8',
  borderColor: '#334155',
  headingColor: '#f1f5f9',
  categoryNameColor: '#f1f5f9',
  itemNameColor: '#f1f5f9',
  descriptionColor: '#94a3b8',
  priceColor: '#3b82f6',
  languageSwitchBackground: '#1e293b',
  languageSwitchBorder: '#334155',
  languageSwitchText: '#f1f5f9',
  currencySwitchBackground: '#1e293b',
  currencySwitchBorder: '#334155',
  currencySwitchText: '#f1f5f9',
  badgeBackgroundColor: '#334155',
  badgeTextColor: '#f1f5f9'
};

const rosePinkTheme: Theme = {
  mode: 'light',
  primaryColor: '#be185d',
  accentColor: '#ec4899',
  backgroundColor: '#fdf2f8',
  cardBackground: '#ffffff',
  textColor: '#9f1239',
  mutedTextColor: '#6b7280',
  borderColor: '#f9a8d4',
  headingColor: '#ffffff',
  categoryNameColor: '#be185d',
  itemNameColor: '#9f1239',
  descriptionColor: '#6b7280',
  priceColor: '#ec4899',
  languageSwitchBackground: '#be185d',
  languageSwitchBorder: '#ec4899',
  languageSwitchText: '#ffffff',
  currencySwitchBackground: '#be185d',
  currencySwitchBorder: '#ec4899',
  currencySwitchText: '#ffffff',
  badgeBackgroundColor: '#fce7f3',
  badgeTextColor: '#9f1239'
};

const vintageGoldTheme: Theme = {
  mode: 'light',
  primaryColor: '#a16207',
  accentColor: '#ca8a04',
  backgroundColor: '#fffbeb',
  cardBackground: '#ffffff',
  textColor: '#92400e',
  mutedTextColor: '#78716c',
  borderColor: '#fde68a',
  headingColor: '#ffffff',
  categoryNameColor: '#a16207',
  itemNameColor: '#92400e',
  descriptionColor: '#78716c',
  priceColor: '#ca8a04',
  languageSwitchBackground: '#a16207',
  languageSwitchBorder: '#ca8a04',
  languageSwitchText: '#ffffff',
  currencySwitchBackground: '#a16207',
  currencySwitchBorder: '#ca8a04',
  currencySwitchText: '#ffffff',
  badgeBackgroundColor: '#fef3c7',
  badgeTextColor: '#92400e'
};

const redBlackTheme: Theme = {
  mode: 'light',
  primaryColor: '#dc2626',
  accentColor: '#0a0a0a',
  backgroundColor: '#ffffff',
  cardBackground: '#fefefe',
  textColor: '#0a0a0a',
  mutedTextColor: '#525252',
  borderColor: '#e5e5e5',
  headingColor: '#ffffff',
  categoryNameColor: '#dc2626',
  itemNameColor: '#0a0a0a',
  descriptionColor: '#525252',
  priceColor: '#dc2626',
  languageSwitchBackground: '#dc2626',
  languageSwitchBorder: '#dc2626',
  languageSwitchText: '#ffffff',
  currencySwitchBackground: '#dc2626',
  currencySwitchBorder: '#dc2626',
  currencySwitchText: '#ffffff',
  badgeBackgroundColor: '#fee2e2',
  badgeTextColor: '#dc2626'
};

const CustomizationSettings = () => {
  const [selectedLayout, setSelectedLayout] = useState<'categories' | 'items'>('items');
  const [selectedLayoutStyle, setSelectedLayoutStyle] = useState<'compact' | 'card-grid' | 'image-focus' | 'minimal' | 'magazine' | 'modern-card' | 'elegant-list' | 'photo-focus'>('compact');
  const [theme, setTheme] = useState<Theme>(modernMinimalTheme);
  const [selectedPreset, setSelectedPreset] = useState<'minimal' | 'ocean' | 'sunset' | 'forest' | 'royal' | 'dark' | 'rose' | 'vintage' | 'redblack' | 'custom'>('minimal');

  const presetThemes: { [key: string]: Theme } = {
    minimal: modernMinimalTheme,
    ocean: oceanBreezTheme,
    sunset: sunsetTheme,
    forest: forestGreenTheme,
    royal: royalPurpleTheme,
    dark: elegantDarkTheme,
    rose: rosePinkTheme,
    vintage: vintageGoldTheme,
    redblack: redBlackTheme,
  };

  const handleLayoutChange = async (layout: 'categories' | 'items') => {
    setSelectedLayout(layout);
    
    try {
      const supabase = getRestaurantSupabase();
      
      // Get the most recent record
      const { data: existingRecords, error: fetchError } = await supabase
        .from('restaurant_customization')
        .select('id')
        .order('updated_at', { ascending: false })
        .limit(1);

      const updateData = { layout, updated_at: new Date().toISOString() };

      if (existingRecords && existingRecords.length > 0) {
        // Update existing record
        const { error } = await supabase
          .from('restaurant_customization')
          .update(updateData)
          .eq('id', existingRecords[0].id);
          
        if (error) {
          console.error('Error updating layout:', error);
          toast({
            title: "Error",
            description: "Failed to update layout preference",
            variant: "destructive"
          });
          return;
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('restaurant_customization')
          .insert([updateData]);
          
        if (error) {
          console.error('Error saving layout:', error);
          toast({
            title: "Error", 
            description: "Failed to save layout preference",
            variant: "destructive"
          });
          return;
        }
      }

      toast({
        title: "Layout Updated",
        description: "Layout preference has been saved successfully"
      });

    } catch (error) {
      console.error('Error in handleLayoutChange:', error);
      toast({
        title: "Error",
        description: "Failed to update layout",
        variant: "destructive"
      });
    }
  };

  const loadData = async () => {
    try {
      const supabase = getRestaurantSupabase();
      
      const { data: existingRecords, error: fetchError } = await supabase
        .from('restaurant_customization')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('Error fetching customization data:', fetchError);
        return;
      }

      if (existingRecords && existingRecords.length > 0) {
        const data = existingRecords[0];
        
        if (data.theme) {
          setTheme(data.theme);
        }
        
        if (data.layout) {
          setSelectedLayout(data.layout);
        }

        if (data.layout_style) {
          setSelectedLayoutStyle(data.layout_style);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePresetChange = (preset: 'minimal' | 'ocean' | 'sunset' | 'forest' | 'royal' | 'dark' | 'rose' | 'vintage' | 'redblack') => {
    setSelectedPreset(preset);
    setTheme(presetThemes[preset]);
  };

  const handleSaveTheme = async () => {
    try {
      const supabase = getRestaurantSupabase();
      
      // Get the most recent record
      const { data: existingRecords, error: fetchError } = await supabase
        .from('restaurant_customization')
        .select('id')
        .order('updated_at', { ascending: false })
        .limit(1);

      const updateData = { theme, updated_at: new Date().toISOString() };

      if (existingRecords && existingRecords.length > 0) {
        // Update existing record
        const { error } = await supabase
          .from('restaurant_customization')
          .update(updateData)
          .eq('id', existingRecords[0].id);
          
        if (error) {
          console.error('Error updating theme:', error);
          toast({
            title: "Error",
            description: "Failed to update theme",
            variant: "destructive"
          });
          return;
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('restaurant_customization')
          .insert([updateData]);
          
        if (error) {
          console.error('Error saving theme:', error);
          toast({
            title: "Error",
            description: "Failed to save theme",
            variant: "destructive"
          });
          return;
        }
      }

      toast({
        title: "Theme Updated",
        description: "Theme has been saved successfully"
      });

    } catch (error) {
      console.error('Error in handleSaveTheme:', error);
      toast({
        title: "Error",
        description: "Failed to save theme",
        variant: "destructive"
      });
    }
  };

  const handleLayoutStyleChange = async (layoutStyle: 'compact' | 'card-grid' | 'image-focus' | 'minimal' | 'magazine' | 'modern-card' | 'elegant-list' | 'photo-focus') => {
    setSelectedLayoutStyle(layoutStyle);
    
    try {
      const supabase = getRestaurantSupabase();
      
      const { data: existingRecords, error: fetchError } = await supabase
        .from('restaurant_customization')
        .select('id')
        .order('updated_at', { ascending: false })
        .limit(1);

      const updateData = { layout_style: layoutStyle, updated_at: new Date().toISOString() };

      if (existingRecords && existingRecords.length > 0) {
        const { error } = await supabase
          .from('restaurant_customization')
          .update(updateData)
          .eq('id', existingRecords[0].id);
          
        if (error) {
          console.error('Error updating layout style:', error);
          toast({
            title: "Error",
            description: "Failed to update layout style",
            variant: "destructive"
          });
          return;
        }
      } else {
        const { error } = await supabase
          .from('restaurant_customization')
          .insert([updateData]);
          
        if (error) {
          console.error('Error saving layout style:', error);
          toast({
            title: "Error", 
            description: "Failed to save layout style",
            variant: "destructive"
          });
          return;
        }
      }

      toast({
        title: "Layout Style Updated",
        description: "Layout style has been saved successfully"
      });

    } catch (error) {
      console.error('Error in handleLayoutStyleChange:', error);
      toast({
        title: "Error",
        description: "Failed to update layout style",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Theme Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme Customization</CardTitle>
            <CardDescription>
              Customize the appearance of your menu to match your brand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Modern Theme Presets */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
              <Button 
                variant={selectedPreset === 'minimal' ? 'default' : 'outline'}
                onClick={() => handlePresetChange('minimal')}
                className="flex flex-col h-20 p-2"
              >
                <div className="w-full h-4 bg-gradient-to-r from-slate-100 to-slate-200 border rounded mb-1"></div>
                <span className="text-xs font-medium">Minimal</span>
              </Button>
              <Button 
                variant={selectedPreset === 'ocean' ? 'default' : 'outline'}
                onClick={() => handlePresetChange('ocean')}
                className="flex flex-col h-20 p-2"
              >
                <div className="w-full h-4 bg-gradient-to-r from-blue-400 to-blue-600 border rounded mb-1"></div>
                <span className="text-xs font-medium">Ocean</span>
              </Button>
              <Button 
                variant={selectedPreset === 'sunset' ? 'default' : 'outline'}
                onClick={() => handlePresetChange('sunset')}
                className="flex flex-col h-20 p-2"
              >
                <div className="w-full h-4 bg-gradient-to-r from-orange-400 to-orange-600 border rounded mb-1"></div>
                <span className="text-xs font-medium">Sunset</span>
              </Button>
              <Button 
                variant={selectedPreset === 'forest' ? 'default' : 'outline'}
                onClick={() => handlePresetChange('forest')}
                className="flex flex-col h-20 p-2"
              >
                <div className="w-full h-4 bg-gradient-to-r from-green-800 to-yellow-100 border rounded mb-1"></div>
                <span className="text-xs font-medium">Forest</span>
              </Button>
              <Button 
                variant={selectedPreset === 'royal' ? 'default' : 'outline'}
                onClick={() => handlePresetChange('royal')}
                className="flex flex-col h-20 p-2"
              >
                <div className="w-full h-4 bg-gradient-to-r from-purple-400 to-purple-600 border rounded mb-1"></div>
                <span className="text-xs font-medium">Royal</span>
              </Button>
              <Button 
                variant={selectedPreset === 'dark' ? 'default' : 'outline'}
                onClick={() => handlePresetChange('dark')}
                className="flex flex-col h-20 p-2"
              >
                <div className="w-full h-4 bg-gradient-to-r from-slate-700 to-slate-900 border rounded mb-1"></div>
                <span className="text-xs font-medium">Dark</span>
              </Button>
              <Button 
                variant={selectedPreset === 'rose' ? 'default' : 'outline'}
                onClick={() => handlePresetChange('rose')}
                className="flex flex-col h-20 p-2"
              >
                <div className="w-full h-4 bg-gradient-to-r from-pink-400 to-pink-600 border rounded mb-1"></div>
                <span className="text-xs font-medium">Rose</span>
              </Button>
              <Button 
                variant={selectedPreset === 'vintage' ? 'default' : 'outline'}
                onClick={() => handlePresetChange('vintage')}
                className="flex flex-col h-20 p-2"
              >
                <div className="w-full h-4 bg-gradient-to-r from-amber-400 to-amber-600 border rounded mb-1"></div>
                <span className="text-xs font-medium">Vintage</span>
              </Button>
              <Button 
                variant={selectedPreset === 'redblack' ? 'default' : 'outline'}
                onClick={() => handlePresetChange('redblack')}
                className="flex flex-col h-20 p-2"
              >
                <div className="w-full h-4 bg-gradient-to-r from-red-600 to-black border rounded mb-1"></div>
                <span className="text-xs font-medium">Red & Black</span>
              </Button>
              {selectedPreset === 'custom' && (
                <div className="flex items-center justify-center border border-dashed rounded h-16">
                  <span className="text-xs text-muted-foreground">Custom</span>
                </div>
              )}
            </div>

            {/* Color Customization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <ColorPicker
                  id="primaryColor"
                  color={theme.primaryColor}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, primaryColor: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="accentColor">Accent Color</Label>
                <ColorPicker
                  id="accentColor"
                  color={theme.accentColor}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, accentColor: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="backgroundColor">Background Color</Label>
                <ColorPicker
                  id="backgroundColor"
                  color={theme.backgroundColor}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, backgroundColor: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="cardBackground">Card Background</Label>
                <ColorPicker
                  id="cardBackground"
                  color={theme.cardBackground}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, cardBackground: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="textColor">Text Color</Label>
                <ColorPicker
                  id="textColor"
                  color={theme.textColor}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, textColor: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="mutedTextColor">Muted Text Color</Label>
                <ColorPicker
                  id="mutedTextColor"
                  color={theme.mutedTextColor}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, mutedTextColor: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="borderColor">Border Color</Label>
                <ColorPicker
                  id="borderColor"
                  color={theme.borderColor}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, borderColor: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="headingColor">Heading Color</Label>
                <ColorPicker
                  id="headingColor"
                  color={theme.headingColor || theme.textColor}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, headingColor: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="categoryNameColor">Category Name Color</Label>
                <ColorPicker
                  id="categoryNameColor"
                  color={theme.categoryNameColor || theme.textColor}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, categoryNameColor: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="itemNameColor">Item Name Color</Label>
                <ColorPicker
                  id="itemNameColor"
                  color={theme.itemNameColor || theme.textColor}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, itemNameColor: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="descriptionColor">Description Color</Label>
                <ColorPicker
                  id="descriptionColor"
                  color={theme.descriptionColor || theme.mutedTextColor}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, descriptionColor: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="priceColor">Price Color</Label>
                <ColorPicker
                  id="priceColor"
                  color={theme.priceColor || theme.accentColor}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, priceColor: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="languageSwitchBackground">Language Switch Background</Label>
                <ColorPicker
                  id="languageSwitchBackground"
                  color={theme.languageSwitchBackground || theme.primaryColor}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, languageSwitchBackground: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="languageSwitchBorder">Language Switch Border</Label>
                <ColorPicker
                  id="languageSwitchBorder"
                  color={theme.languageSwitchBorder || theme.borderColor}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, languageSwitchBorder: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="languageSwitchText">Language Switch Text</Label>
                <ColorPicker
                  id="languageSwitchText"
                  color={theme.languageSwitchText || '#ffffff'}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, languageSwitchText: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="currencySwitchBackground">Currency Switch Background</Label>
                <ColorPicker
                  id="currencySwitchBackground"
                  color={theme.currencySwitchBackground || theme.primaryColor}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, currencySwitchBackground: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="currencySwitchBorder">Currency Switch Border</Label>
                <ColorPicker
                  id="currencySwitchBorder"
                  color={theme.currencySwitchBorder || theme.borderColor}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, currencySwitchBorder: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="currencySwitchText">Currency Switch Text</Label>
                <ColorPicker
                  id="currencySwitchText"
                  color={theme.currencySwitchText || '#ffffff'}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, currencySwitchText: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="badgeBackgroundColor">Badge Background Color</Label>
                <ColorPicker
                  id="badgeBackgroundColor"
                  color={theme.badgeBackgroundColor || theme.accentColor + '20'}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, badgeBackgroundColor: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="badgeTextColor">Badge Text Color</Label>
                <ColorPicker
                  id="badgeTextColor"
                  color={theme.badgeTextColor || theme.accentColor}
                  onColorChange={(color: string) => {
                    setTheme({ ...theme, badgeTextColor: color });
                    setSelectedPreset('custom');
                  }}
                />
              </div>
            </div>

            {/* Save Button */}
            <Button onClick={handleSaveTheme}>Save Theme</Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how your theme and layout changes will look on the menu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemePreview theme={theme} layoutStyle={selectedLayoutStyle} />
            </CardContent>
          </Card>

          {/* Layout Section - Now under the preview */}
          <Card>
            <CardHeader>
              <CardTitle>Layout Preferences</CardTitle>
              <CardDescription>
                Choose how you want your menu to be displayed to customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Navigation Style */}
              <div>
                <Label className="text-base font-medium mb-3 block">Navigation Style</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card 
                    className={`cursor-pointer border-2 transition-all ${
                      selectedLayout === 'categories' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => handleLayoutChange('categories')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Shfaqje me Kategori</h3>
                        {selectedLayout === 'categories' && (
                          <Badge variant="default">E Zgjedhur</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Customers browse by categories first, then see items within each category
                      </p>
                      <div className="space-y-2">
                        <div className="bg-muted p-2 rounded text-xs">
                          📱 Mobile-optimized cards
                        </div>
                        <div className="bg-muted p-2 rounded text-xs">
                          🗂️ Category-first navigation
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer border-2 transition-all ${
                      selectedLayout === 'items' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => handleLayoutChange('items')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Lista e Artikujve</h3>
                        {selectedLayout === 'items' && (
                          <Badge variant="default">E Zgjedhur</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        All menu items displayed in a single list with category tabs
                      </p>
                      <div className="space-y-2">
                        <div className="bg-muted p-2 rounded text-xs">
                          📋 Complete item list
                        </div>
                        <div className="bg-muted p-2 rounded text-xs">
                          🏷️ Category filtering tabs
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Item Display Style - Compact buttons only */}
              <div>
                <Label className="text-base font-medium mb-3 block">Item Display Style</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button 
                    variant={selectedLayoutStyle === 'compact' ? 'default' : 'outline'}
                    onClick={() => handleLayoutStyleChange('compact')}
                    className="flex flex-col h-16"
                  >
                    <div className="w-6 h-3 bg-gray-200 border rounded mb-1"></div>
                    Compact
                  </Button>
                  <Button 
                    variant={selectedLayoutStyle === 'card-grid' ? 'default' : 'outline'}
                    onClick={() => handleLayoutStyleChange('card-grid')}
                    className="flex flex-col h-16"
                  >
                    <div className="w-6 h-3 bg-gray-200 border rounded mb-1"></div>
                    Grid
                  </Button>
                  <Button 
                    variant={selectedLayoutStyle === 'image-focus' ? 'default' : 'outline'}
                    onClick={() => handleLayoutStyleChange('image-focus')}
                    className="flex flex-col h-16"
                  >
                    <div className="w-6 h-3 bg-gray-200 border rounded mb-1"></div>
                    Image Focus
                  </Button>
                  <Button 
                    variant={selectedLayoutStyle === 'minimal' ? 'default' : 'outline'}
                    onClick={() => handleLayoutStyleChange('minimal')}
                    className="flex flex-col h-16"
                  >
                    <div className="w-6 h-3 bg-gray-200 border rounded mb-1"></div>
                    Minimal
                  </Button>
                  <Button 
                    variant={selectedLayoutStyle === 'magazine' ? 'default' : 'outline'}
                    onClick={() => handleLayoutStyleChange('magazine')}
                    className="flex flex-col h-16"
                  >
                    <div className="w-6 h-3 bg-gray-200 border rounded mb-1"></div>
                    Magazine
                  </Button>
                  <Button 
                    variant={selectedLayoutStyle === 'modern-card' ? 'default' : 'outline'}
                    onClick={() => handleLayoutStyleChange('modern-card')}
                    className="flex flex-col h-16"
                  >
                    <div className="w-6 h-3 bg-gradient-to-br from-gray-100 to-gray-200 border rounded mb-1"></div>
                    Modern
                  </Button>
                  <Button 
                    variant={selectedLayoutStyle === 'elegant-list' ? 'default' : 'outline'}
                    onClick={() => handleLayoutStyleChange('elegant-list')}
                    className="flex flex-col h-16"
                  >
                    <div className="w-6 h-3 bg-gray-200 border-l-2 border-l-blue-500 rounded mb-1"></div>
                    Elegant
                  </Button>
                  <Button 
                    variant={selectedLayoutStyle === 'photo-focus' ? 'default' : 'outline'}
                    onClick={() => handleLayoutStyleChange('photo-focus')}
                    className="flex flex-col h-16"
                  >
                    <div className="w-6 h-3 bg-gradient-to-br from-gray-300 to-gray-400 border rounded mb-1"></div>
                    Photo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomizationSettings;
