
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SpinWheel } from './SpinWheel';
import { ExternalLink, Instagram, Facebook, MessageCircle, Youtube, Star, MapPin, Camera } from 'lucide-react';

interface SocialMediaOption {
  platform: string;
  url: string;
  enabled: boolean;
}

interface ReviewOption {
  platform: string;
  url: string;
  enabled: boolean;
}

interface PopupSettings {
  enabled: boolean;
  type: 'review' | 'wheel' | 'social';
  title: string;
  description: string;
  link: string;
  buttonText: string;
  showAfterSeconds: number;
  dailyLimit: number;
  socialMedia?: SocialMediaOption[];
  reviewOptions?: ReviewOption[];
  wheelSettings: {
    enabled: boolean;
    unlockType: 'free' | 'link';
    unlockText: string;
    unlockButtonText: string;
    unlockLink: string;
    rewards: Array<{
      text: string;
      chance: number;
      color: string;
    }>;
  };
}

interface Theme {
  mode: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardBackground: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  headingColor?: string;
}

interface ThemedPopupModalProps {
  settings: PopupSettings;
  restaurantName: string;
  theme?: Theme;
}

const socialPlatforms = [
  { name: 'instagram', label: 'Instagram', icon: Instagram, color: '#E4405F' },
  { name: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2' },
  { name: 'tiktok', label: 'TikTok', icon: MessageCircle, color: '#000000' },
  { name: 'youtube', label: 'YouTube', icon: Youtube, color: '#FF0000' },
];

const reviewPlatforms = [
  { name: 'google', label: 'Google Maps', icon: MapPin, color: '#4285F4' },
  { name: 'tripadvisor', label: 'TripAdvisor', icon: Camera, color: '#00AF87' },
  { name: 'yelp', label: 'Yelp', icon: Star, color: '#FF1A1A' },
  { name: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2' },
];

const PreviewWheel: React.FC<{ rewards: Array<{ color: string; chance: number }> }> = ({ rewards }) => {
  const normalizeRewards = (rewards: Array<{ color: string; chance: number }>) => {
    const totalChance = rewards.reduce((sum, reward) => sum + reward.chance, 0);
    if (totalChance === 0) return rewards;
    
    return rewards.map(reward => ({
      ...reward,
      chance: (reward.chance / totalChance) * 100
    }));
  };

  const normalizedRewards = normalizeRewards(rewards);
  
  const segments = normalizedRewards.map((reward, index) => {
    const startAngle = index === 0 ? 0 : normalizedRewards.slice(0, index).reduce((sum, r) => sum + (r.chance / 100) * 360, 0);
    const segmentAngle = (reward.chance / 100) * 360;
    const endAngle = startAngle + segmentAngle;
    
    return {
      ...reward,
      startAngle,
      endAngle,
      midAngle: startAngle + segmentAngle / 2
    };
  });

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-foreground"></div>
        </div>
        
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-border relative overflow-hidden opacity-75">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {segments.map((segment, index) => {
              const startAngleRad = (segment.startAngle * Math.PI) / 180;
              const endAngleRad = (segment.endAngle * Math.PI) / 180;
              
              const x1 = 100 + 90 * Math.cos(startAngleRad);
              const y1 = 100 + 90 * Math.sin(startAngleRad);
              const x2 = 100 + 90 * Math.cos(endAngleRad);
              const y2 = 100 + 90 * Math.sin(endAngleRad);
              
              const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
              
              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 90 90 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={segment.color}
                  stroke="white"
                  strokeWidth="1"
                />
              );
            })}
          </svg>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center">Spin to win!</p>
    </div>
  );
};

export const ThemedPopupModal: React.FC<ThemedPopupModalProps> = ({ 
  settings, 
  restaurantName, 
  theme 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [wonReward, setWonReward] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(5);

  // Apply theme styles
  const themeStyles = theme ? {
    '--theme-bg': theme.cardBackground || theme.backgroundColor,
    '--theme-text': theme.textColor,
    '--theme-muted': theme.mutedTextColor,
    '--theme-primary': theme.primaryColor,
    '--theme-accent': theme.accentColor,
    '--theme-border': theme.borderColor,
    '--theme-heading': theme.headingColor || theme.textColor,
  } as React.CSSProperties : {};

  useEffect(() => {
    if (!settings.enabled) return;

    const today = new Date().toDateString();
    const storageKey = `popup_shown_${restaurantName}_${today}`;
    const shownCount = parseInt(localStorage.getItem(storageKey) || '0');

    if (shownCount >= settings.dailyLimit) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem(storageKey, (shownCount + 1).toString());
    }, settings.showAfterSeconds * 1000);

    return () => clearTimeout(timer);
  }, [settings.enabled, settings.showAfterSeconds, settings.dailyLimit, restaurantName]);

  const handleCtaClick = () => {
    if (settings.type === 'wheel' && settings.wheelSettings.enabled) {
      if (settings.wheelSettings.unlockType === 'free') {
        setShowWheel(true);
      } else if (settings.wheelSettings.unlockType === 'link' && settings.wheelSettings.unlockLink) {
        const linkUrl = settings.wheelSettings.unlockLink.startsWith('http') 
          ? settings.wheelSettings.unlockLink 
          : `https://${settings.wheelSettings.unlockLink}`;
        window.open(linkUrl, '_blank');
        setTimeLeft(5);
        const countdown = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              setShowWheel(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else if (settings.link) {
      const linkUrl = settings.link.startsWith('http') 
        ? settings.link 
        : `https://${settings.link}`;
      window.open(linkUrl, '_blank');
      setIsOpen(false);
    }
  };

  const handleSocialClick = (url: string) => {
    const linkUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(linkUrl, '_blank');
  };

  const handleReviewClick = (url: string) => {
    const linkUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(linkUrl, '_blank');
  };

  const handleWheelComplete = (result: string) => {
    setWonReward(result);
    setHasSpun(true);
    setTimeout(() => {
      setIsOpen(false);
      setShowWheel(false);
      setHasSpun(false);
      setWonReward('');
    }, 5000);
  };

  if (!settings.enabled) return null;

  const enabledSocialMedia = settings.socialMedia?.filter(social => social.enabled && social.url) || [];
  const enabledReviewOptions = settings.reviewOptions?.filter(review => review.enabled && review.url) || [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="themed-popup-content"
        style={themeStyles}
      >
        <DialogHeader>
          <DialogTitle 
            className="text-sm sm:text-base font-semibold text-center"
            style={{ color: theme?.headingColor || theme?.textColor }}
          >
            {settings.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {!showWheel ? (
            <>
              {settings.description && (
                <p 
                  className="text-xs sm:text-sm text-center leading-relaxed"
                  style={{ color: theme?.mutedTextColor }}
                >
                  {settings.description}
                </p>
              )}

              {settings.type === 'social' && enabledSocialMedia.length > 0 ? (
                <div className="space-y-3">
                  <p 
                    className="text-xs font-medium text-center"
                    style={{ color: theme?.textColor }}
                  >
                    Follow us on social media!
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {enabledSocialMedia.map((social, index) => {
                      const platform = socialPlatforms.find(p => p.name === social.platform);
                      const IconComponent = platform?.icon || Instagram;
                      
                      return (
                        <Button
                          key={index}
                          onClick={() => handleSocialClick(social.url)}
                          className="flex items-center justify-center gap-2 h-10 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                          style={{ 
                            backgroundColor: platform?.color || theme?.primaryColor || '#6b7280'
                          }}
                        >
                          <IconComponent className="h-4 w-4" />
                          {platform?.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ) : settings.type === 'review' && enabledReviewOptions.length > 0 ? (
                <div className="space-y-3">
                  <p 
                    className="text-xs font-medium text-center"
                    style={{ color: theme?.textColor }}
                  >
                    Leave us a review!
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {enabledReviewOptions.map((review, index) => {
                      const platform = reviewPlatforms.find(p => p.name === review.platform);
                      const IconComponent = platform?.icon || Star;
                      
                      return (
                        <Button
                          key={index}
                          onClick={() => handleReviewClick(review.url)}
                          className="flex items-center justify-center gap-2 h-10 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                          style={{ 
                            backgroundColor: platform?.color || theme?.primaryColor || '#6b7280'
                          }}
                        >
                          <IconComponent className="h-4 w-4" />
                          {platform?.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ) : settings.type === 'wheel' && settings.wheelSettings.enabled ? (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <PreviewWheel rewards={settings.wheelSettings.rewards.map(r => ({ color: r.color, chance: r.chance }))} />
                  </div>
                  
                  <p 
                    className="text-xs font-medium text-center"
                    style={{ color: theme?.textColor }}
                  >
                    {settings.wheelSettings.unlockText}
                  </p>
                  
                  {settings.wheelSettings.unlockType === 'link' && timeLeft > 0 && timeLeft < 5 ? (
                    <div className="text-center space-y-2">
                      <p 
                        className="text-xs"
                        style={{ color: theme?.mutedTextColor }}
                      >
                        Wheel unlocks in {timeLeft} seconds...
                      </p>
                      <div 
                        className="w-full rounded-full h-1.5"
                        style={{ backgroundColor: theme?.borderColor || '#e5e7eb' }}
                      >
                        <div 
                          className="h-1.5 rounded-full transition-all duration-1000" 
                          style={{ 
                            width: `${((5 - timeLeft) / 5) * 100}%`,
                            backgroundColor: theme?.primaryColor || '#3b82f6'
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleCtaClick}
                      className="w-full h-10 text-xs font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        backgroundColor: theme?.primaryColor || '#3b82f6',
                        color: 'white'
                      }}
                      disabled={settings.wheelSettings.unlockType === 'link' && timeLeft > 0 && timeLeft < 5}
                    >
                      {settings.wheelSettings.unlockButtonText}
                    </Button>
                  )}
                </div>
              ) : (
                <Button 
                  onClick={handleCtaClick}
                  className="w-full flex items-center justify-center gap-2 h-10 text-xs font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: theme?.primaryColor || '#3b82f6',
                    color: 'white'
                  }}
                >
                  {settings.buttonText}
                  {settings.link && <ExternalLink className="h-3 w-3" />}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center space-y-3">
              {!hasSpun ? (
                <>
                  <p 
                    className="text-xs"
                    style={{ color: theme?.mutedTextColor }}
                  >
                    {settings.wheelSettings.unlockType === 'free' 
                      ? 'Spin the wheel for your reward!' 
                      : 'Thanks! Spin to win your reward:'
                    }
                  </p>
                  <div className="flex justify-center">
                    <div className="scale-90 sm:scale-100">
                      <SpinWheel 
                        rewards={settings.wheelSettings.rewards}
                        onComplete={handleWheelComplete}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="text-2xl">🎉</div>
                  <p 
                    className="text-sm font-semibold"
                    style={{ color: theme?.primaryColor }}
                  >
                    Congratulations!
                  </p>
                  <div 
                    className="p-3 rounded-lg"
                    style={{ 
                      backgroundColor: theme?.primaryColor ? `${theme.primaryColor}20` : '#3b82f620'
                    }}
                  >
                    <p 
                      className="text-sm font-bold"
                      style={{ color: theme?.primaryColor }}
                    >
                      {wonReward}
                    </p>
                  </div>
                  <p 
                    className="text-xs"
                    style={{ color: theme?.mutedTextColor }}
                  >
                    Show this screen to claim your reward!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>

      <style jsx>{`
        .themed-popup-content {
          background-color: var(--theme-bg) !important;
          color: var(--theme-text) !important;
          border-color: var(--theme-border) !important;
        }
      `}</style>
    </Dialog>
  );
};
