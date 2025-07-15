
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';
import { ColorPicker } from '@/components/ui/color-picker';
import ThemePreview from './customization/ThemePreview';

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
}

const defaultLightTheme: Theme = {
  mode: 'light',
  primaryColor: '#1f2937',
  accentColor: '#3b82f6',
  backgroundColor: '#ffffff',
  cardBackground: '#ffffff',
  textColor: '#1f2937',
  mutedTextColor: '#6b7280',
  borderColor: '#e5e7eb',
  headingColor: '#ffffff',
  categoryNameColor: '#1f2937',
  itemNameColor: '#111827',
  descriptionColor: '#6b7280',
  priceColor: '#059669'
};

const defaultDarkTheme: Theme = {
  mode: 'dark',
  primaryColor: '#d1d5db',
  accentColor: '#60a5fa',
  backgroundColor: '#111827',
  cardBackground: '#1f2937',
  textColor: '#d1d5db',
  mutedTextColor: '#9ca3af',
  borderColor: '#374151',
  headingColor: '#ffffff',
  categoryNameColor: '#d1d5db',
  itemNameColor: '#f3f4f6',
  descriptionColor: '#9ca3af',
  priceColor: '#22c55e'
};

const greenTheme: Theme = {
  mode: 'light',
  primaryColor: '#166534',
  accentColor: '#16a34a',
  backgroundColor: '#f7fdf7',
  cardBackground: '#ffffff',
  textColor: '#166534',
  mutedTextColor: '#6b7280',
  borderColor: '#dcfce7',
  headingColor: '#ffffff',
  categoryNameColor: '#166534',
  itemNameColor: '#14532d',
  descriptionColor: '#6b7280',
  priceColor: '#059669'
};

const blueTheme: Theme = {
  mode: 'light',
  primaryColor: '#1e3a8a',
  accentColor: '#3b82f6',
  backgroundColor: '#f8fafc',
  cardBackground: '#ffffff',
  textColor: '#1e3a8a',
  mutedTextColor: '#6b7280',
  borderColor: '#dbeafe',
  headingColor: '#ffffff',
  categoryNameColor: '#1e3a8a',
  itemNameColor: '#1e40af',
  descriptionColor: '#6b7280',
  priceColor: '#2563eb'
};

const goldTheme: Theme = {
  mode: 'light',
  primaryColor: '#92400e',
  accentColor: '#f59e0b',
  backgroundColor: '#fffdf7',
  cardBackground: '#ffffff',
  textColor: '#92400e',
  mutedTextColor: '#6b7280',
  borderColor: '#fed7aa',
  headingColor: '#ffffff',
  categoryNameColor: '#92400e',
  itemNameColor: '#78350f',
  descriptionColor: '#6b7280',
  priceColor: '#d97706'
};

const purpleTheme: Theme = {
  mode: 'light',
  primaryColor: '#7c3aed',
  accentColor: '#8b5cf6',
  backgroundColor: '#faf8ff',
  cardBackground: '#ffffff',
  textColor: '#7c3aed',
  mutedTextColor: '#6b7280',
  borderColor: '#e9d5ff',
  headingColor: '#ffffff',
  categoryNameColor: '#7c3aed',
  itemNameColor: '#6b21a8',
  descriptionColor: '#6b7280',
  priceColor: '#9333ea'
};

const redTheme: Theme = {
  mode: 'light',
  primaryColor: '#dc2626',
  accentColor: '#ef4444',
  backgroundColor: '#fef8f8',
  cardBackground: '#ffffff',
  textColor: '#dc2626',
  mutedTextColor: '#6b7280',
  borderColor: '#fecaca',
  headingColor: '#ffffff',
  categoryNameColor: '#dc2626',
  itemNameColor: '#b91c1c',
  descriptionColor: '#6b7280',
  priceColor: '#dc2626'
};

const CustomizationSettings = () => {
  const [selectedLayout, setSelectedLayout] = useState<'categories' | 'items'>('items');
  const [selectedLayoutStyle, setSelectedLayoutStyle] = useState<'compact' | 'card-grid' | 'image-focus' | 'minimal' | 'magazine'>('compact');
  const [theme, setTheme] = useState<Theme>(defaultLightTheme);
  const [selectedPreset, setSelectedPreset] = useState<'light' | 'dark' | 'green' | 'blue' | 'gold' | 'purple' | 'red' | 'custom'>('light');

  const presetThemes: { [key: string]: Theme } = {
    light: defaultLightTheme,
    dark: defaultDarkTheme,
    green: greenTheme,
    blue: blueTheme,
    gold: goldTheme,
    purple: purpleTheme,
    red: redTheme,
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

  const handlePresetChange = (preset: 'light' | 'dark' | 'green' | 'blue' | 'gold' | 'purple' | 'red') => {
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

  const handleLayoutStyleChange = async (layoutStyle: 'compact' | 'card-grid' | 'image-focus' | 'minimal' | 'magazine') => {
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
            {/* Preset Selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
              <Button 
                variant={selectedPreset === 'light' ? 'default' : 'outline'}
                onClick={() => handlePresetChange('light')}
                className="flex flex-col h-16"
              >
                <div className="w-6 h-3 bg-gray-100 border rounded mb-1"></div>
                Light
              </Button>
              <Button 
                variant={selectedPreset === 'dark' ? 'default' : 'outline'}
                onClick={() => handlePresetChange('dark')}
                className="flex flex-col h-16"
              >
                <div className="w-6 h-3 bg-gray-800 border rounded mb-1"></div>
                Dark
              </Button>
              <Button 
                variant={selectedPreset === 'green' ? 'default' : 'outline'}
                onClick={() => handlePresetChange('green')}
                className="flex flex-col h-16"
              >
                <div className="w-6 h-3 bg-green-600 border rounded mb-1"></div>
                Green
              </Button>
              <Button 
                variant={selectedPreset === 'blue' ? 'default' : 'outline'}
                onClick={() => handlePresetChange('blue')}
                className="flex flex-col h-16"
              >
                <div className="w-6 h-3 bg-blue-600 border rounded mb-1"></div>
                Blue
              </Button>
              <Button 
                variant={selectedPreset === 'gold' ? 'default' : 'outline'}
                onClick={() => handlePresetChange('gold')}
                className="flex flex-col h-16"
              >
                <div className="w-6 h-3 bg-yellow-600 border rounded mb-1"></div>
                Gold
              </Button>
              <Button 
                variant={selectedPreset === 'purple' ? 'default' : 'outline'}
                onClick={() => handlePresetChange('purple')}
                className="flex flex-col h-16"
              >
                <div className="w-6 h-3 bg-purple-600 border rounded mb-1"></div>
                Purple
              </Button>
              <Button 
                variant={selectedPreset === 'red' ? 'default' : 'outline'}
                onClick={() => handlePresetChange('red')}
                className="flex flex-col h-16"
              >
                <div className="w-6 h-3 bg-red-600 border rounded mb-1"></div>
                Red
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
            </div>

            {/* Save Button */}
            <Button onClick={handleSaveTheme}>Save Theme</Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              See how your theme changes will look on the menu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemePreview theme={theme} />
          </CardContent>
        </Card>
      </div>

      {/* Layout Section */}
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

          {/* Hidden layout style controls - only affects the preview */}
          <div className="hidden">
            <div className="grid grid-cols-5 gap-2">
              {['compact', 'card-grid', 'image-focus', 'minimal', 'magazine'].map((style) => (
                <button
                  key={style}
                  onClick={() => handleLayoutStyleChange(style as any)}
                  className={`p-2 border rounded ${
                    selectedLayoutStyle === style ? 'bg-primary text-primary-foreground' : 'bg-background'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomizationSettings;
