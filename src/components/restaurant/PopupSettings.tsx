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
import { Plus, Trash2, Instagram, Facebook, MessageCircle, Youtube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';
import { useDashboardForm } from '@/contexts/DashboardFormContext';

interface Reward {
  text: string;
  chance: number;
  color: string;
}

interface SocialMediaOption {
  platform: string;
  url: string;
  enabled: boolean;
}

interface PopupSettingsData {
  enabled: boolean;
  type: 'cta' | 'wheel' | 'social';
  title: string;
  description: string;
  link: string;
  buttonText: string;
  showAfterSeconds: number;
  dailyLimit: number;
  socialMedia: SocialMediaOption[];
  wheelSettings: {
    enabled: boolean;
    unlockType: 'free' | 'link' | 'review';
    unlockText: string;
    unlockButtonText: string;
    unlockLink: string;
    rewards: Reward[];
  };
}

const defaultColors = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#6b7280', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'
];

const socialPlatforms = [
  { name: 'instagram', label: 'Instagram', icon: Instagram, color: '#E4405F' },
  { name: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2' },
  { name: 'tiktok', label: 'TikTok', icon: MessageCircle, color: '#000000' },
  { name: 'youtube', label: 'YouTube', icon: Youtube, color: '#FF0000' },
];

export const PopupSettings: React.FC = () => {
  const { formData, setFormData, getFormData } = useDashboardForm();
  const formKey = 'popupSettings';
  
  const [settings, setSettings] = useState<PopupSettingsData>(() => {
    // Initialize with saved form data or defaults
    return getFormData(formKey) || {
      enabled: false,
      type: 'cta',
      title: 'Follow us on Instagram!',
      description: 'Get the latest updates and special offers',
      link: '',
      buttonText: 'Follow Now',
      showAfterSeconds: 3,
      dailyLimit: 1,
      socialMedia: [
        { platform: 'instagram', url: '', enabled: true },
        { platform: 'facebook', url: '', enabled: false },
        { platform: 'tiktok', url: '', enabled: false },
        { platform: 'youtube', url: '', enabled: false },
      ],
      wheelSettings: {
        enabled: false,
        unlockType: 'review',
        unlockText: 'Give us a 5-star review to spin the wheel!',
        unlockButtonText: 'Leave Review & Spin',
        unlockLink: '',
        rewards: [
          { text: '10% Off', chance: 20, color: '#ef4444' },
          { text: 'Free Drink', chance: 15, color: '#3b82f6' },
          { text: '5% Off', chance: 30, color: '#10b981' },
          { text: 'Free Appetizer', chance: 10, color: '#f59e0b' },
          { text: 'Try Again', chance: 25, color: '#6b7280' }
        ]
      }
    };
  });
  
  const [loading, setLoading] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const { toast } = useToast();

  // Save form data whenever settings change
  useEffect(() => {
    setFormData(formKey, settings);
  }, [settings, setFormData, formKey]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const restaurantSupabase = getRestaurantSupabase();
      
      const { data, error } = await restaurantSupabase
        .from('popup_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading popup settings:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const firstRecord = data[0];
        setSettingsId(firstRecord.id);
        
        // Clean up duplicates if they exist
        if (data.length > 1) {
          console.log(`Found ${data.length} popup settings records, cleaning up duplicates...`);
          const idsToDelete = data.slice(1).map(record => record.id);
          
          for (const id of idsToDelete) {
            await restaurantSupabase
              .from('popup_settings')
              .delete()
              .eq('id', id);
          }
        }
        
        // Update settings with loaded data
        const loadedSettings = {
          enabled: Boolean(firstRecord.enabled),
          type: firstRecord.type || 'cta',
          title: firstRecord.title || 'Follow us on Instagram!',
          description: firstRecord.description || '',
          link: firstRecord.link || '',
          buttonText: firstRecord.button_text || 'Follow Now',
          showAfterSeconds: Number(firstRecord.show_after_seconds) || 3,
          dailyLimit: Number(firstRecord.daily_limit) || 1,
          socialMedia: Array.isArray(firstRecord.social_media) ? firstRecord.social_media : [
            { platform: 'instagram', url: '', enabled: true },
            { platform: 'facebook', url: '', enabled: false },
            { platform: 'tiktok', url: '', enabled: false },
            { platform: 'youtube', url: '', enabled: false },
          ],
          wheelSettings: {
            enabled: Boolean(firstRecord.wheel_enabled),
            unlockType: firstRecord.wheel_unlock_type || 'review',
            unlockText: firstRecord.wheel_unlock_text || 'Give us a 5-star review to spin the wheel!',
            unlockButtonText: firstRecord.wheel_unlock_button_text || 'Leave Review & Spin',
            unlockLink: firstRecord.wheel_unlock_link || '',
            rewards: Array.isArray(firstRecord.wheel_rewards) ? firstRecord.wheel_rewards : [
              { text: '10% Off', chance: 20, color: '#ef4444' },
              { text: 'Free Drink', chance: 15, color: '#3b82f6' },
              { text: '5% Off', chance: 30, color: '#10b981' },
              { text: 'Free Appetizer', chance: 10, color: '#f59e0b' },
              { text: 'Try Again', chance: 25, color: '#6b7280' }
            ]
          }
        };
        
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Error loading popup settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load popup settings.',
        variant: 'destructive',
      });
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const restaurantSupabase = getRestaurantSupabase();
      
      // Prepare data with simplified column names and proper null handling
      const dbData = {
        enabled: settings.enabled,
        type: settings.type,
        title: settings.title,
        description: settings.description || null,
        link: settings.link || null,
        button_text: settings.buttonText,
        show_after_seconds: settings.showAfterSeconds,
        daily_limit: settings.dailyLimit,
        social_media: settings.socialMedia,
        wheel_enabled: settings.wheelSettings.enabled,
        wheel_unlock_type: settings.wheelSettings.unlockType,
        wheel_unlock_text: settings.wheelSettings.unlockText || null,
        wheel_unlock_button_text: settings.wheelSettings.unlockButtonText || null,
        wheel_unlock_link: settings.wheelSettings.unlockLink || null,
        wheel_rewards: settings.wheelSettings.rewards
      };

      console.log('Saving popup settings with data:', dbData);

      let result;
      if (settingsId) {
        result = await restaurantSupabase
          .from('popup_settings')
          .update(dbData)
          .eq('id', settingsId)
          .select();
      } else {
        result = await restaurantSupabase
          .from('popup_settings')
          .insert([dbData])
          .select()
          .single();
        
        if (result.data) {
          setSettingsId(result.data.id);
        }
      }

      if (result.error) {
        console.error('Database error:', result.error);
        throw result.error;
      }

      toast({
        title: 'Settings saved',
        description: 'Popup settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving popup settings:', error);
      toast({
        title: 'Error',
        description: `Failed to save popup settings: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSocialMedia = (index: number, field: keyof SocialMediaOption, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.map((social, i) => 
        i === index ? { ...social, [field]: value } : social
      )
    }));
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

  const normalizeRewards = () => {
    const rewards = settings.wheelSettings.rewards;
    const totalChance = rewards.reduce((sum, reward) => sum + reward.chance, 0);
    
    if (totalChance === 0) return;
    
    const normalizedRewards = rewards.map(reward => ({
      ...reward,
      chance: Math.round((reward.chance / totalChance) * 100)
    }));
    
    setSettings(prev => ({
      ...prev,
      wheelSettings: {
        ...prev.wheelSettings,
        rewards: normalizedRewards
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="show-after">Show after (seconds)</Label>
                  <Input
                    id="show-after"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.showAfterSeconds.toString()}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      showAfterSeconds: parseInt(e.target.value) || 3 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily-limit">Daily limit per user</Label>
                  <Input
                    id="daily-limit"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.dailyLimit.toString()}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      dailyLimit: parseInt(e.target.value) || 1 
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="popup-type">Popup Type</Label>
                <Select
                  value={settings.type}
                  onValueChange={(type: 'cta' | 'wheel' | 'social') => setSettings(prev => ({ ...prev, type }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cta">Call to Action</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
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

              {settings.type === 'social' && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Social Media Links</h3>
                    {settings.socialMedia.map((social, index) => {
                      const platform = socialPlatforms.find(p => p.name === social.platform);
                      const IconComponent = platform?.icon || Instagram;
                      
                      return (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-3 min-w-[140px]">
                                <div 
                                  className="p-2 rounded-md flex items-center justify-center"
                                  style={{ backgroundColor: platform?.color + '20' }}
                                >
                                  <IconComponent 
                                    className="h-5 w-5" 
                                    style={{ color: platform?.color }} 
                                  />
                                </div>
                                <Label className="font-medium text-sm">{platform?.label}</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={social.enabled}
                                  onCheckedChange={(enabled) => updateSocialMedia(index, 'enabled', enabled)}
                                />
                                <Label className="text-sm">Enabled</Label>
                              </div>
                              <div className="flex-1">
                                <Input
                                  value={social.url}
                                  onChange={(e) => updateSocialMedia(index, 'url', e.target.value)}
                                  placeholder={`https://${social.platform}.com/yourrestaurant`}
                                  disabled={!social.enabled}
                                  className="text-sm"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}

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
                          <Label htmlFor="unlock-type">Unlock Type</Label>
                          <Select
                            value={settings.wheelSettings.unlockType}
                            onValueChange={(type: 'free' | 'link') => setSettings(prev => ({
                              ...prev,
                              wheelSettings: { ...prev.wheelSettings, unlockType: type }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free to use</SelectItem>
                              <SelectItem value="link">Require link visit</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {settings.wheelSettings.unlockType === 'link' && (
                          <div className="space-y-2">
                            <Label htmlFor="unlock-link">Unlock Link</Label>
                            <Input
                              id="unlock-link"
                              type="url"
                              value={settings.wheelSettings.unlockLink}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                wheelSettings: { ...prev.wheelSettings, unlockLink: e.target.value }
                              }))}
                              placeholder="https://example.com"
                            />
                          </div>
                        )}

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
                              <Button size="sm" onClick={normalizeRewards} variant="outline">
                                Normalize to 100%
                              </Button>
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
                                      value={reward.chance.toString()}
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
