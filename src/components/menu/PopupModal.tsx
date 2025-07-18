
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SpinWheel } from './SpinWheel';
import { ExternalLink, Instagram, Facebook, MessageCircle, Youtube, Star, MapPin, Camera, X } from 'lucide-react';

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

interface MenuTheme {
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardBackground: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  headingColor?: string;
}

interface PopupModalProps {
  settings: PopupSettings;
  restaurantName: string;
  customTheme?: MenuTheme | null;
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

// Preview wheel component that shows colors without text
const PreviewWheel: React.FC<{ rewards: Array<{ color: string; chance: number }> }> = ({ rewards }) => {
  // Normalize rewards to ensure they add up to 100%
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
        
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-border relative overflow-hidden opacity-75">
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
      <p className="text-xs text-muted-foreground text-center">Spin to win prizes!</p>
    </div>
  );
};

export const PopupModal: React.FC<PopupModalProps> = ({ settings, restaurantName, customTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [wonReward, setWonReward] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (!settings.enabled) return;

    // Check daily limit
    const today = new Date().toDateString();
    const storageKey = `popup_shown_${restaurantName}_${today}`;
    const shownCount = parseInt(localStorage.getItem(storageKey) || '0');

    if (shownCount >= settings.dailyLimit) return;

    // Show popup after specified seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
      // Increment shown count
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

  // Theme styles
  const dialogStyles = customTheme ? {
    backgroundColor: customTheme.cardBackground,
    borderColor: customTheme.borderColor,
    color: customTheme.textColor
  } : {};

  const headingStyles = customTheme ? {
    color: customTheme.headingColor || customTheme.textColor
  } : {};

  const mutedTextStyles = customTheme ? {
    color: customTheme.mutedTextColor
  } : {};

  const primaryButtonStyles = customTheme ? {
    backgroundColor: customTheme.primaryColor,
    borderColor: customTheme.primaryColor,
    color: customTheme.mode === 'dark' ? '#ffffff' : '#ffffff'
  } : {};

  const accentButtonStyles = customTheme ? {
    backgroundColor: customTheme.accentColor,
    borderColor: customTheme.accentColor,
    color: customTheme.mode === 'dark' ? '#ffffff' : '#ffffff'
  } : {};

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="max-w-[95vw] w-full sm:max-w-md mx-auto p-0 gap-0 border-2 rounded-2xl shadow-2xl"
        style={dialogStyles}
      >
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-3 top-3 z-10 p-1.5 rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          style={{ color: customTheme?.mutedTextColor }}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header with gradient background */}
        <div 
          className="relative px-6 py-6 rounded-t-2xl"
          style={{
            background: customTheme?.primaryColor 
              ? `linear-gradient(135deg, ${customTheme.primaryColor}, ${customTheme.accentColor})` 
              : 'linear-gradient(135deg, #1f2937, #3b82f6)'
          }}
        >
          <DialogHeader className="text-center">
            <DialogTitle 
              className="text-lg sm:text-xl font-bold text-white mb-2"
              style={{ color: '#ffffff' }}
            >
              {settings.title}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!showWheel ? (
            <>
              <p 
                className="text-sm text-center leading-relaxed"
                style={mutedTextStyles}
              >
                {settings.description}
              </p>

              {settings.type === 'social' && enabledSocialMedia.length > 0 ? (
                <div className="space-y-4">
                  <p 
                    className="text-sm font-medium text-center"
                    style={headingStyles}
                  >
                    Follow us on social media!
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {enabledSocialMedia.map((social, index) => {
                      const platform = socialPlatforms.find(p => p.name === social.platform);
                      const IconComponent = platform?.icon || Instagram;
                      
                      return (
                        <Button
                          key={index}
                          onClick={() => handleSocialClick(social.url)}
                          className="flex items-center justify-center gap-3 h-12 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
                          style={{ 
                            backgroundColor: platform?.color || '#6b7280'
                          }}
                        >
                          <IconComponent className="h-5 w-5" />
                          <span className="text-sm">{platform?.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ) : settings.type === 'review' && enabledReviewOptions.length > 0 ? (
                <div className="space-y-4">
                  <p 
                    className="text-sm font-medium text-center"
                    style={headingStyles}
                  >
                    Leave us a review!
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {enabledReviewOptions.map((review, index) => {
                      const platform = reviewPlatforms.find(p => p.name === review.platform);
                      const IconComponent = platform?.icon || Star;
                      
                      return (
                        <Button
                          key={index}
                          onClick={() => handleReviewClick(review.url)}
                          className="flex items-center justify-center gap-3 h-12 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
                          style={{ 
                            backgroundColor: platform?.color || '#6b7280'
                          }}
                        >
                          <IconComponent className="h-5 w-5" />
                          <span className="text-sm">{platform?.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ) : settings.type === 'wheel' && settings.wheelSettings.enabled ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <PreviewWheel rewards={settings.wheelSettings.rewards.map(r => ({ color: r.color, chance: r.chance }))} />
                  </div>
                  
                  <p 
                    className="text-sm font-medium text-center"
                    style={headingStyles}
                  >
                    {settings.wheelSettings.unlockText}
                  </p>
                  
                  {settings.wheelSettings.unlockType === 'link' && timeLeft > 0 && timeLeft < 5 ? (
                    <div className="text-center space-y-3">
                      <p 
                        className="text-sm"
                        style={mutedTextStyles}
                      >
                        Wheel unlocks in {timeLeft} seconds...
                      </p>
                      <div 
                        className="w-full rounded-full h-2"
                        style={{ backgroundColor: customTheme?.borderColor }}
                      >
                        <div 
                          className="h-2 rounded-full transition-all duration-1000" 
                          style={{ 
                            width: `${((5 - timeLeft) / 5) * 100}%`,
                            backgroundColor: customTheme?.accentColor || '#3b82f6'
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleCtaClick}
                      className="w-full h-12 font-medium rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg text-white"
                      disabled={settings.wheelSettings.unlockType === 'link' && timeLeft > 0 && timeLeft < 5}
                      style={accentButtonStyles}
                    >
                      {settings.wheelSettings.unlockButtonText}
                    </Button>
                  )}
                </div>
              ) : (
                <Button 
                  onClick={handleCtaClick}
                  className="w-full h-12 flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg text-white"
                  style={primaryButtonStyles}
                >
                  <span>{settings.buttonText}</span>
                  {settings.link && <ExternalLink className="h-4 w-4" />}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center space-y-6">
              {!hasSpun ? (
                <>
                  <p 
                    className="text-sm"
                    style={mutedTextStyles}
                  >
                    {settings.wheelSettings.unlockType === 'free' 
                      ? 'Spin the wheel for your reward!' 
                      : 'Thanks for visiting the link! Spin to win your reward:'
                    }
                  </p>
                  <div className="flex justify-center">
                    <SpinWheel 
                      rewards={settings.wheelSettings.rewards}
                      onComplete={handleWheelComplete}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="text-5xl">🎉</div>
                  <h3 
                    className="text-xl font-bold"
                    style={{ color: customTheme?.accentColor || '#3b82f6' }}
                  >
                    Congratulations!
                  </h3>
                  <div 
                    className="p-4 rounded-xl border-2"
                    style={{
                      backgroundColor: customTheme?.accentColor ? `${customTheme.accentColor}20` : '#3b82f620',
                      borderColor: customTheme?.accentColor || '#3b82f6'
                    }}
                  >
                    <p 
                      className="text-lg font-bold"
                      style={{ color: customTheme?.accentColor || '#3b82f6' }}
                    >
                      {wonReward}
                    </p>
                  </div>
                  <p 
                    className="text-sm"
                    style={mutedTextStyles}
                  >
                    Show this screen to claim your reward!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
