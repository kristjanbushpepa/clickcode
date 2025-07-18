
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SpinWheel } from './SpinWheel';
import { ExternalLink } from 'lucide-react';

interface PopupSettings {
  enabled: boolean;
  type: 'cta' | 'wheel';
  title: string;
  description: string;
  link: string;
  buttonText: string;
  showAfterSeconds: number;
  dailyLimit: number;
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

interface PopupModalProps {
  settings: PopupSettings;
  restaurantName: string;
}

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
  
  // Calculate segments
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
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-foreground"></div>
        </div>
        
        {/* Wheel */}
        <div className="w-32 h-32 rounded-full border-2 border-border relative overflow-hidden opacity-75">
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

export const PopupModal: React.FC<PopupModalProps> = ({ settings, restaurantName }) => {
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
        // Use the actual link URL without any prefix
        const linkUrl = settings.wheelSettings.unlockLink.startsWith('http') 
          ? settings.wheelSettings.unlockLink 
          : `https://${settings.wheelSettings.unlockLink}`;
        window.open(linkUrl, '_blank');
        // Start 5-second countdown for wheel unlock
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

  const handleWheelComplete = (result: string) => {
    setWonReward(result);
    setHasSpun(true);
    // Show result for 5 seconds then close
    setTimeout(() => {
      setIsOpen(false);
      setShowWheel(false);
      setHasSpun(false);
      setWonReward('');
    }, 5000);
  };

  if (!settings.enabled) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {settings.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showWheel ? (
            <>
              <p className="text-muted-foreground text-sm">
                {settings.description}
              </p>

              {settings.type === 'wheel' && settings.wheelSettings.enabled ? (
                <div className="space-y-3">
                  {/* Show preview wheel */}
                  <div className="flex justify-center">
                    <PreviewWheel rewards={settings.wheelSettings.rewards.map(r => ({ color: r.color, chance: r.chance }))} />
                  </div>
                  
                  <p className="text-sm font-medium text-center">
                    {settings.wheelSettings.unlockText}
                  </p>
                  {settings.wheelSettings.unlockType === 'link' && timeLeft > 0 && timeLeft < 5 ? (
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Wheel unlocks in {timeLeft} seconds...
                      </p>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-1000" 
                          style={{ width: `${((5 - timeLeft) / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleCtaClick}
                      className="w-full"
                      disabled={settings.wheelSettings.unlockType === 'link' && timeLeft > 0 && timeLeft < 5}
                    >
                      {settings.wheelSettings.unlockButtonText}
                    </Button>
                  )}
                </div>
              ) : (
                <Button 
                  onClick={handleCtaClick}
                  className="w-full flex items-center gap-2"
                >
                  {settings.buttonText}
                  {settings.link && <ExternalLink className="h-4 w-4" />}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center space-y-4">
              {!hasSpun ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {settings.wheelSettings.unlockType === 'free' 
                      ? 'Spin the wheel for your reward!' 
                      : 'Thanks for visiting the link! Spin to win your reward:'
                    }
                  </p>
                  <SpinWheel 
                    rewards={settings.wheelSettings.rewards}
                    onComplete={handleWheelComplete}
                  />
                </>
              ) : (
                <div className="space-y-3">
                  <div className="text-4xl">🎉</div>
                  <p className="text-lg font-semibold text-primary">
                    Congratulations!
                  </p>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <p className="text-lg font-bold text-primary">
                      {wonReward}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
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
