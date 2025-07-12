import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';

interface Reward {
  text: string;
  chance: number;
  color: string;
}

interface PopupSettingsData {
  enabled: boolean;
  type: 'cta' | 'wheel';
  title: string;
  description: string;
  link: string;
  buttonText: string;
  wheelSettings: {
    enabled: boolean;
    unlockText: string;
    unlockButtonText: string;
    rewards: Reward[];
  };
}

const defaultColors = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#6b7280', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'
];

export const PopupSettings: React.FC = () => {
  const [settings, setSettings] = useState<PopupSettingsData>({
    enabled: false,
    type: 'cta',
    title: 'Follow us on Instagram!',
    description: 'Get the latest updates and special offers',
    link: '',
    buttonText: 'Follow Now',
    wheelSettings: {
      enabled: false,
      unlockText: 'Give us a 5-star review to spin the wheel!',
      unlockButtonText: 'Leave Review & Spin',
      rewards: [
        { text: '10% Off', chance: 20, color: '#ef4444' },
        { text: 'Free Drink', chance: 15, color: '#3b82f6' },
        { text: '5% Off', chance: 30, color: '#10b981' },
        { text: 'Free Appetizer', chance: 10, color: '#f59e0b' },
        { text: 'Try Again', chance: 25, color: '#6b7280' }
      ]
    }
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const restaurantSupabase = getRestaurantSupabase();
      const { data, error } = await restaurantSupabase
        .from('restaurant_customization')
        .select('popup_settings')
        .single();

      if (error) throw error;
      
      if (data?.popup_settings) {
        setSettings(data.popup_settings);
      }
    } catch (error) {
      console.error('Error loading popup settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const restaurantSupabase = getRestaurantSupabase();
      const { error } = await restaurantSupabase
        .from('restaurant_customization')
        .upsert({
          popup_settings: settings
        });

      if (error) throw error;

      toast({
        title: 'Settings saved',
        description: 'Popup settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving popup settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save popup settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addReward = () => {
    const newReward: Reward = {
      text: 'New Reward',
      chance: 10,
      color: defaultColors[settings.wheelSettings.rewards.length % defaultColors.length]
    };
    
    setSettings(prev => ({
      ...prev,
      wheelSettings: {
        ...prev.wheelSettings,
        rewards: [...prev.wheelSettings.rewards, newReward]
      }
    }));
  };

  const removeReward = (index: number) => {
    setSettings(prev => ({
      ...prev,
      wheelSettings: {
        ...prev.wheelSettings,
        rewards: prev.wheelSettings.rewards.filter((_, i) => i !== index)
      }
    }));
  };

  const updateReward = (index: number, field: keyof Reward, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      wheelSettings: {
        ...prev.wheelSettings,
        rewards: prev.wheelSettings.rewards.map((reward, i) => 
          i === index ? { ...reward, [field]: value } : reward
        )
      }
    }));
  };

  const totalChance = settings.wheelSettings.rewards.reduce((sum, reward) => sum + reward.chance, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Popup Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="popup-enabled"
              checked={settings.enabled}
              onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, enabled }))}
            />
            <Label htmlFor="popup-enabled">Enable popup</Label>
          </div>

          {settings.enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="popup-type">Popup Type</Label>
                <Select
                  value={settings.type}
                  onValueChange={(type: 'cta' | 'wheel') => setSettings(prev => ({ ...prev, type }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cta">Call to Action</SelectItem>
                    <SelectItem value="wheel">Spin Wheel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="popup-title">Title</Label>
                <Input
                  id="popup-title"
                  value={settings.title}
                  onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="popup-description">Description</Label>
                <Textarea
                  id="popup-description"
                  value={settings.description}
                  onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {settings.type === 'cta' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="popup-link">Link (optional)</Label>
                    <Input
                      id="popup-link"
                      type="url"
                      value={settings.link}
                      onChange={(e) => setSettings(prev => ({ ...prev, link: e.target.value }))}
                      placeholder="https://instagram.com/yourrestaurant"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="popup-button">Button Text</Label>
                    <Input
                      id="popup-button"
                      value={settings.buttonText}
                      onChange={(e) => setSettings(prev => ({ ...prev, buttonText: e.target.value }))}
                    />
                  </div>
                </>
              )}

              {settings.type === 'wheel' && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Wheel Settings</h3>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="wheel-enabled"
                        checked={settings.wheelSettings.enabled}
                        onCheckedChange={(enabled) => setSettings(prev => ({
                          ...prev,
                          wheelSettings: { ...prev.wheelSettings, enabled }
                        }))}
                      />
                      <Label htmlFor="wheel-enabled">Enable wheel functionality</Label>
                    </div>

                    {settings.wheelSettings.enabled && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="unlock-text">Unlock Text</Label>
                          <Textarea
                            id="unlock-text"
                            value={settings.wheelSettings.unlockText}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              wheelSettings: { ...prev.wheelSettings, unlockText: e.target.value }
                            }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="unlock-button">Unlock Button Text</Label>
                          <Input
                            id="unlock-button"
                            value={settings.wheelSettings.unlockButtonText}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              wheelSettings: { ...prev.wheelSettings, unlockButtonText: e.target.value }
                            }))}
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>Rewards</Label>
                            <div className="flex items-center gap-2">
                              <Badge variant={totalChance === 100 ? 'default' : 'destructive'}>
                                Total: {totalChance}%
                              </Badge>
                              <Button size="sm" onClick={addReward}>
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {settings.wheelSettings.rewards.map((reward, index) => (
                            <Card key={index}>
                              <CardContent className="pt-4">
                                <div className="grid grid-cols-12 gap-2 items-center">
                                  <div className="col-span-4">
                                    <Input
                                      value={reward.text}
                                      onChange={(e) => updateReward(index, 'text', e.target.value)}
                                      placeholder="Reward text"
                                    />
                                  </div>
                                  <div className="col-span-3">
                                    <Input
                                      type="number"
                                      value={reward.chance}
                                      onChange={(e) => updateReward(index, 'chance', parseInt(e.target.value) || 0)}
                                      placeholder="Chance %"
                                      min="0"
                                      max="100"
                                    />
                                  </div>
                                  <div className="col-span-3">
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="color"
                                        value={reward.color}
                                        onChange={(e) => updateReward(index, 'color', e.target.value)}
                                        className="w-12 h-8 p-1"
                                      />
                                      <div 
                                        className="w-6 h-6 rounded border"
                                        style={{ backgroundColor: reward.color }}
                                      />
                                    </div>
                                  </div>
                                  <div className="col-span-2">
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => removeReward(index)}
                                      disabled={settings.wheelSettings.rewards.length <= 1}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}

                          {totalChance !== 100 && (
                            <p className="text-sm text-destructive">
                              Warning: Total chance should equal 100% for accurate results.
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              <Button onClick={saveSettings} disabled={loading} className="w-full">
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};