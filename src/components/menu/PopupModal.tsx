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
    disabled?: boolean;
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
const socialPlatforms = [{
  name: 'instagram',
  label: 'Instagram',
  icon: Instagram,
  color: '#E4405F'
}, {
  name: 'facebook',
  label: 'Facebook',
  icon: Facebook,
  color: '#1877F2'
}, {
  name: 'tiktok',
  label: 'TikTok',
  icon: MessageCircle,
  color: '#000000'
}, {
  name: 'youtube',
  label: 'YouTube',
  icon: Youtube,
  color: '#FF0000'
}];
const reviewPlatforms = [{
  name: 'google',
  label: 'Google Maps',
  icon: MapPin,
  color: '#4285F4'
}, {
  name: 'tripadvisor',
  label: 'TripAdvisor',
  icon: Camera,
  color: '#00AF87'
}, {
  name: 'yelp',
  label: 'Yelp',
  icon: Star,
  color: '#FF1A1A'
}, {
  name: 'facebook',
  label: 'Facebook',
  icon: Facebook,
  color: '#1877F2'
}];

// Preview wheel component that shows colors without text
const PreviewWheel: React.FC<{
  rewards: Array<{
    color: string;
    chance: number;
  }>;
}> = ({
  rewards
}) => {
  const normalizeRewards = (rewards: Array<{
    color: string;
    chance: number;
  }>) => {
    const totalChance = rewards.reduce((sum, reward) => sum + reward.chance, 0);
    if (totalChance === 0) return rewards;
    return rewards.map(reward => ({
      ...reward,
      chance: reward.chance / totalChance * 100
    }));
  };
  const normalizedRewards = normalizeRewards(rewards);
  const segments = normalizedRewards.map((reward, index) => {
    const startAngle = index === 0 ? 0 : normalizedRewards.slice(0, index).reduce((sum, r) => sum + r.chance / 100 * 360, 0);
    const segmentAngle = reward.chance / 100 * 360;
    const endAngle = startAngle + segmentAngle;
    return {
      ...reward,
      startAngle,
      endAngle,
      midAngle: startAngle + segmentAngle / 2
    };
  });
  return <div className="flex flex-col items-center space-y-1">
      <div className="relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-gray-800"></div>
        </div>
        
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-gray-300 relative overflow-hidden opacity-75 animate-pulse">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {segments.map((segment, index) => {
            const startAngleRad = segment.startAngle * Math.PI / 180;
            const endAngleRad = segment.endAngle * Math.PI / 180;
            const x1 = 100 + 90 * Math.cos(startAngleRad);
            const y1 = 100 + 90 * Math.sin(startAngleRad);
            const x2 = 100 + 90 * Math.cos(endAngleRad);
            const y2 = 100 + 90 * Math.sin(endAngleRad);
            const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
            const pathData = [`M 100 100`, `L ${x1} ${y1}`, `A 90 90 0 ${largeArcFlag} 1 ${x2} ${y2}`, 'Z'].join(' ');
            return <path key={index} d={pathData} fill={segment.color} stroke="white" strokeWidth="1" />;
          })}
          </svg>
        </div>
      </div>
      <p className="text-xs text-gray-600 text-center">Spin to win prizes!</p>
    </div>;
};
export const PopupModal: React.FC<PopupModalProps> = ({
  settings,
  restaurantName,
  customTheme
}) => {
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
      // For wheel type, show wheel directly
      if (settings.type === 'wheel' && settings.wheelSettings.enabled && settings.wheelSettings.unlockType === 'free') {
        setShowWheel(true);
      }
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
        const linkUrl = settings.wheelSettings.unlockLink.startsWith('http') ? settings.wheelSettings.unlockLink : `https://${settings.wheelSettings.unlockLink}`;
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
      const linkUrl = settings.link.startsWith('http') ? settings.link : `https://${settings.link}`;
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

  // Force white theme styles
  const dialogStyles = {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    color: '#1f2937'
  };
  const headingStyles = {
    color: '#1f2937'
  };
  const mutedTextStyles = {
    color: '#6b7280'
  };
  const primaryButtonStyles = {
    backgroundColor: customTheme?.primaryColor || '#3b82f6',
    borderColor: customTheme?.primaryColor || '#3b82f6',
    color: '#ffffff'
  };
  const accentButtonStyles = {
    backgroundColor: customTheme?.accentColor || '#3b82f6',
    borderColor: customTheme?.accentColor || '#3b82f6',
    color: '#ffffff'
  };
  return <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent style={dialogStyles} className="max-w-[90vw] w-full sm:max-w-sm mx-auto p-0 gap-0 border-2 shadow-2xl rounded-sm bg-slate-50">
        {/* Close button */}
        

        {/* Content */}
        <div className="p-4 space-y-4 bg-white">
          {!showWheel ? <>
              <p style={mutedTextStyles} className="text-center leading-relaxed text-3xl font-medium text-blue-600">
                {settings.description}
              </p>

              {settings.type === 'review' && enabledReviewOptions.length > 0 ? <div className="space-y-3">
                  <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
                    {settings.title}
                  </h2>
                  {/* 5 Yellow Stars */}
                  <div className="flex justify-center items-center space-x-1 mb-3">
                    {[...Array(5)].map((_, index) => <Star key={index} className="h-6 w-6 fill-yellow-400 text-yellow-400 animate-pulse" style={{
                animationDelay: `${index * 0.1}s`
              }} />)}
                  </div>
                  
                  <div className="h-4"></div>
                  
                  
                  <div className="flex justify-center items-center space-x-4">
                    {enabledReviewOptions.map((review, index) => {
                const platform = reviewPlatforms.find(p => p.name === review.platform);
                const IconComponent = platform?.icon || Star;
                return <button key={index} onClick={() => handleReviewClick(review.url)} className="flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg animate-bounce" style={{
                  backgroundColor: `${platform?.color}20`,
                  borderColor: platform?.color,
                  border: `2px solid ${platform?.color}`,
                  animationDelay: `${index * 0.2}s`,
                  animationDuration: '2s'
                }}>
                          <IconComponent className="h-6 w-6" style={{
                    color: platform?.color
                  }} />
                        </button>;
              })}
                  </div>
                </div> : settings.type === 'social' && enabledSocialMedia.length > 0 ? <div className="space-y-3">
                  <p className="text-lg font-medium text-center -mt-1" style={headingStyles}>
                    Follow us on social media!
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {enabledSocialMedia.map((social, index) => {
                const platform = socialPlatforms.find(p => p.name === social.platform);
                const IconComponent = platform?.icon || Instagram;
                return <Button key={index} onClick={() => handleSocialClick(social.url)} className="flex items-center justify-center gap-2 h-10 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg animate-pulse" style={{
                  backgroundColor: platform?.color || '#6b7280',
                  animationDelay: `${index * 0.2}s`,
                  animationDuration: '2s'
                }}>
                          <IconComponent className="h-4 w-4 animate-bounce" />
                          <span className="text-xs">{platform?.label}</span>
                        </Button>;
              })}
                  </div>
                </div> : settings.type === 'wheel' && settings.wheelSettings.enabled ? <div className="space-y-4">
                  {settings.wheelSettings.unlockType === 'link' && !showWheel && (
                    <p className="text-lg font-bold text-center text-blue-600">
                      {settings.wheelSettings.unlockText}
                    </p>
                  )}
                  
                  <div className="flex justify-center">
                    <SpinWheel rewards={settings.wheelSettings.rewards} onComplete={handleWheelComplete} disabled={settings.wheelSettings.disabled || settings.wheelSettings.unlockType === 'link' && !showWheel} />
                  </div>
                  
                  {settings.wheelSettings.unlockType === 'link' && !showWheel && <>
                      
                      {timeLeft > 0 && timeLeft < 5 ? <div className="text-center space-y-2">
                          <p className="text-xs" style={mutedTextStyles}>
                            Wheel unlocks in {timeLeft} seconds...
                          </p>
                          <div className="w-full rounded-full h-1.5 bg-gray-200">
                            <div className="h-1.5 rounded-full transition-all duration-1000" style={{
                    width: `${(5 - timeLeft) / 5 * 100}%`,
                    backgroundColor: customTheme?.accentColor || '#3b82f6'
                  }} />
                          </div>
                        </div> : <Button onClick={handleCtaClick} className="w-full h-12 font-bold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg text-white animate-bounce text-lg bg-blue-600 hover:bg-blue-700 shadow-lg" disabled={timeLeft > 0 && timeLeft < 5}>
                          {settings.wheelSettings.unlockButtonText}
                        </Button>}
                    </>}
                </div> : <Button onClick={handleCtaClick} className="w-full h-10 flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg text-white text-sm" style={primaryButtonStyles}>
                  <span>{settings.buttonText}</span>
                  {settings.link && <ExternalLink className="h-3 w-3" />}
                </Button>}
            </> : <div className="text-center space-y-4 bg-white">
              {!hasSpun ? <>
                  <p className="text-sm text-gray-600 font-medium">
                    {settings.wheelSettings.unlockType === 'free' ? 'Spin the wheel for your reward!' : 'Thanks for visiting the link! Spin to win your reward:'}
                  </p>
                  <div className="flex justify-center">
                    <SpinWheel rewards={settings.wheelSettings.rewards} onComplete={handleWheelComplete} disabled={settings.wheelSettings.disabled} />
                  </div>
                </> : <div className="space-y-4 bg-white p-4 rounded-xl">
                  <div className="text-6xl animate-bounce">🎉</div>
                  <h3 className="text-2xl font-bold text-blue-600">
                    Congratulations!
                  </h3>
                  <div className="p-4 rounded-xl border-2 bg-blue-50 border-blue-200">
                    <p className="text-xl font-bold text-blue-700">
                      {wonReward}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    Show this screen to claim your reward!
                  </p>
                </div>}
            </div>}
        </div>
      </DialogContent>
    </Dialog>;
};